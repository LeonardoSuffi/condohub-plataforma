<?php

namespace App\Services;

use App\Models\Deal;
use App\Models\Order;
use App\Models\Service;
use App\Models\ClientProfile;
use App\Models\User;
use App\Models\Message;
use Illuminate\Support\Str;

class DealService
{
    /**
     * Cria um novo deal
     */
    public function createDeal(ClientProfile $client, Service $service, ?string $mensagemInicial = null): Deal
    {
        $deal = Deal::create([
            'company_id' => $service->company_id,
            'client_id' => $client->id,
            'service_id' => $service->id,
            'status' => 'aberto',
            'mensagem_inicial' => $mensagemInicial,
        ]);

        // Se houver mensagem inicial, cria a primeira mensagem
        if ($mensagemInicial) {
            Message::create([
                'deal_id' => $deal->id,
                'sender_id' => $client->user_id,
                'content_sanitized' => $this->sanitizeMessage($mensagemInicial),
                'content_original' => $mensagemInicial,
            ]);

            // Muda status para negociando
            $deal->update(['status' => 'negociando']);
        }

        return $deal;
    }

    /**
     * Atualiza o status do deal
     */
    public function updateStatus(Deal $deal, string $newStatus, User $user): array
    {
        $currentStatus = $deal->status;

        // Validações de transição
        $validTransitions = [
            'aberto' => ['negociando', 'rejeitado'],
            'negociando' => ['aceito', 'rejeitado'],
            'aceito' => ['concluido', 'rejeitado'],
            'concluido' => [],
            'rejeitado' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return [
                'success' => false,
                'message' => "Não é possível mudar de '{$currentStatus}' para '{$newStatus}'.",
            ];
        }

        // Apenas empresa pode aceitar
        if ($newStatus === 'aceito' && !$user->isEmpresa()) {
            return [
                'success' => false,
                'message' => 'Apenas a empresa pode aceitar a negociação.',
            ];
        }

        // Atualiza o status
        $deal->status = $newStatus;

        if ($newStatus === 'aceito') {
            $deal->accepted_at = now();
            // Cria ordem operacional
            $this->createOrderFromDeal($deal);
        }

        if ($newStatus === 'concluido') {
            $deal->completed_at = now();
        }

        $deal->save();

        // Mensagem de sistema no chat
        $this->createSystemMessage($deal, $newStatus);

        return [
            'success' => true,
            'message' => $this->getStatusChangeMessage($newStatus),
        ];
    }

    /**
     * Cria ordem a partir de deal aceito
     */
    protected function createOrderFromDeal(Deal $deal): Order
    {
        $service = $deal->service;
        $priceRange = $service->price_range_array;

        // Usa o valor médio da faixa de preço como valor inicial
        $value = ($priceRange['min'] + $priceRange['max']) / 2;

        return Order::create([
            'deal_id' => $deal->id,
            'value' => $value,
            'status' => 'pendente',
        ]);
    }

    /**
     * Cria mensagem de sistema
     */
    protected function createSystemMessage(Deal $deal, string $status): void
    {
        $messages = [
            'negociando' => 'A negociação foi iniciada.',
            'aceito' => 'A negociação foi aceita! Os dados de contato foram liberados.',
            'rejeitado' => 'A negociação foi encerrada.',
            'concluido' => 'O serviço foi concluído com sucesso!',
        ];

        if (isset($messages[$status])) {
            Message::create([
                'deal_id' => $deal->id,
                'sender_id' => $deal->company->user_id, // Sistema usa ID da empresa
                'content_sanitized' => $messages[$status],
                'content_original' => $messages[$status],
                'is_system' => true,
            ]);
        }
    }

    /**
     * Formata deal para exibição ao usuário
     */
    public function formatDealForUser(Deal $deal, User $user): array
    {
        $data = $deal->toArray();

        // Se ainda estiver anônimo
        if ($deal->isAnonymous()) {
            // Esconde dados reais da outra parte
            if ($user->isEmpresa()) {
                $data['client'] = [
                    'id' => $deal->client_id,
                    'anonymous_name' => $deal->anon_handle_b,
                ];
                unset($data['client']['cpf'], $data['client']['cnpj']);
            } elseif ($user->isCliente()) {
                $data['company'] = [
                    'id' => $deal->company_id,
                    'anonymous_name' => $deal->anon_handle_a,
                ];
                unset($data['company']['cnpj'], $data['company']['razao_social']);
            }
            $data['contact_info'] = null;
        } else {
            // Deal aceito/concluido - libera dados de contato
            $deal->loadMissing(['client.user', 'company.user']);

            if ($user->isEmpresa()) {
                // Empresa ve dados do cliente
                $data['contact_info'] = [
                    'name' => $deal->client?->user?->name,
                    'email' => $deal->client?->user?->email,
                    'telefone' => $deal->client?->telefone,
                    'cidade' => $deal->client?->cidade,
                    'estado' => $deal->client?->estado,
                ];
            } elseif ($user->isCliente()) {
                // Cliente ve dados da empresa
                $data['contact_info'] = [
                    'nome_fantasia' => $deal->company?->nome_fantasia,
                    'email' => $deal->company?->user?->email,
                    'telefone' => $deal->company?->telefone,
                    'cidade' => $deal->company?->cidade,
                    'estado' => $deal->company?->estado,
                ];
            }
        }

        return $data;
    }

    /**
     * Sanitiza mensagem removendo dados pessoais
     */
    public function sanitizeMessage(string $content): string
    {
        // Remove CPF (000.000.000-00)
        $content = preg_replace('/\d{3}\.\d{3}\.\d{3}-\d{2}/', '[CPF OCULTO]', $content);

        // Remove CNPJ (00.000.000/0000-00)
        $content = preg_replace('/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/', '[CNPJ OCULTO]', $content);

        // Remove telefones (vários formatos)
        $content = preg_replace('/\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/', '[TELEFONE OCULTO]', $content);

        // Remove emails
        $content = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[EMAIL OCULTO]', $content);

        return $content;
    }

    /**
     * Retorna mensagem para mudança de status
     */
    protected function getStatusChangeMessage(string $status): string
    {
        return match ($status) {
            'negociando' => 'Negociação iniciada com sucesso.',
            'aceito' => 'Negociação aceita! Dados de contato liberados.',
            'rejeitado' => 'Negociação encerrada.',
            'concluido' => 'Serviço concluído com sucesso!',
            default => 'Status atualizado.',
        };
    }
}
