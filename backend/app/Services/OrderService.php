<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Ranking;

class OrderService
{
    protected FinanceService $financeService;
    protected RankingService $rankingService;

    public function __construct(FinanceService $financeService, RankingService $rankingService)
    {
        $this->financeService = $financeService;
        $this->rankingService = $rankingService;
    }

    /**
     * Atualiza o status da ordem
     */
    public function updateStatus(
        Order $order,
        string $newStatus,
        User $admin,
        ?string $notes = null,
        ?string $rejectionReason = null,
        ?float $value = null
    ): array {
        $currentStatus = $order->status;

        // Validações de transição
        $validTransitions = [
            'pendente' => ['aprovado', 'rejeitado'],
            'aprovado' => ['concluido', 'rejeitado'],
            'concluido' => [],
            'rejeitado' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return [
                'success' => false,
                'message' => "Não é possível mudar de '{$currentStatus}' para '{$newStatus}'.",
            ];
        }

        // Atualiza valor se fornecido
        if ($value !== null) {
            $order->value = $value;
        }

        // Atualiza status
        $order->status = $newStatus;
        $order->notes = $notes;

        if ($newStatus === 'aprovado') {
            $order->approved_by = $admin->id;
            $order->approved_at = now();
        }

        if ($newStatus === 'rejeitado') {
            $order->rejection_reason = $rejectionReason;
        }

        if ($newStatus === 'concluido') {
            $order->completed_at = now();

            // Processa financeiro e ranking
            $this->processCompletion($order);
        }

        $order->save();

        // Atualiza status do deal se necessário
        $this->updateDealStatus($order, $newStatus);

        return [
            'success' => true,
            'message' => $this->getStatusMessage($newStatus),
        ];
    }

    /**
     * Processa conclusão da ordem (transações e ranking)
     */
    protected function processCompletion(Order $order): void
    {
        $deal = $order->deal;
        $company = $deal->company;
        $companyUser = $company->user;

        // Calcula comissão (10% padrão)
        $commissionRate = 0.10;
        $commission = $order->value * $commissionRate;
        $netAmount = $order->value - $commission;

        // Cria transação do serviço
        Transaction::create([
            'user_id' => $companyUser->id,
            'order_id' => $order->id,
            'type' => 'servico',
            'amount' => $order->value,
            'commission' => $commission,
            'net_amount' => $netAmount,
            'status' => 'concluida',
        ]);

        // Cria transação de comissão (para a plataforma)
        // Esta pode ser associada a um usuário admin ou sistema
        Transaction::create([
            'user_id' => $companyUser->id, // Referência para auditoria
            'order_id' => $order->id,
            'type' => 'comissao',
            'amount' => $commission,
            'commission' => 0,
            'net_amount' => $commission,
            'status' => 'concluida',
            'metadata' => ['company_id' => $company->id],
        ]);

        // Atualiza ranking da empresa
        $this->rankingService->addPointsFromOrder($companyUser, $order);
    }

    /**
     * Atualiza status do deal baseado na ordem
     */
    protected function updateDealStatus(Order $order, string $orderStatus): void
    {
        $deal = $order->deal;

        if ($orderStatus === 'concluido') {
            $deal->update([
                'status' => 'concluido',
                'completed_at' => now(),
            ]);
        } elseif ($orderStatus === 'rejeitado' && $deal->status === 'aceito') {
            // Se ordem rejeitada, deal volta para negociando
            $deal->update(['status' => 'negociando']);
        }
    }

    /**
     * Retorna mensagem do status
     */
    protected function getStatusMessage(string $status): string
    {
        return match ($status) {
            'aprovado' => 'Ordem aprovada com sucesso.',
            'rejeitado' => 'Ordem rejeitada.',
            'concluido' => 'Ordem concluída. Transações e ranking atualizados.',
            default => 'Status atualizado.',
        };
    }
}
