<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Cria uma notificacao para um usuario
     */
    public function create(User $user, string $type, string $title, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Notifica sobre nova negociacao
     */
    public function notifyNewDeal(User $user, $deal): Notification
    {
        $serviceName = $deal->service?->titulo ?? 'servico';

        return $this->create(
            $user,
            'deal_new',
            'Nova proposta recebida',
            "Voce recebeu uma nova solicitacao para '{$serviceName}'.",
            [
                'deal_id' => $deal->id,
                'service_id' => $deal->service_id,
                'action_url' => '/deals',
            ]
        );
    }

    /**
     * Notifica sobre mudanca de status da negociacao
     */
    public function notifyDealStatusChange(User $user, $deal, string $newStatus): Notification
    {
        $serviceName = $deal->service?->titulo ?? 'negociacao';

        $statusTitles = [
            'negociando' => 'Negociacao iniciada',
            'aceito' => 'Proposta aceita!',
            'rejeitado' => 'Proposta recusada',
            'concluido' => 'Servico concluido!',
            'cancelado' => 'Negociacao cancelada',
        ];

        $statusMessages = [
            'negociando' => "A negociacao para '{$serviceName}' foi iniciada.",
            'aceito' => "Sua proposta para '{$serviceName}' foi aceita! Os dados de contato foram liberados.",
            'rejeitado' => "A negociacao para '{$serviceName}' foi encerrada.",
            'concluido' => "O servico '{$serviceName}' foi marcado como concluido!",
            'cancelado' => "A negociacao para '{$serviceName}' foi cancelada.",
        ];

        return $this->create(
            $user,
            'deal_status',
            $statusTitles[$newStatus] ?? 'Status atualizado',
            $statusMessages[$newStatus] ?? 'O status da negociacao foi alterado.',
            [
                'deal_id' => $deal->id,
                'status' => $newStatus,
                'action_url' => '/deals',
            ]
        );
    }

    /**
     * Notifica sobre nova mensagem
     */
    public function notifyNewMessage(User $user, $deal, $message): Notification
    {
        $serviceName = $deal->service?->titulo ?? 'negociacao';

        return $this->create(
            $user,
            'message',
            'Nova mensagem',
            "Voce recebeu uma nova mensagem na negociacao de '{$serviceName}'.",
            [
                'deal_id' => $deal->id,
                'message_id' => $message->id,
                'action_url' => '/deals',
            ]
        );
    }

    /**
     * Notifica sobre mudanca de status da ordem
     */
    public function notifyOrderStatusChange(User $user, $order, string $newStatus): Notification
    {
        $statusMessages = [
            'aprovada' => 'Sua ordem foi aprovada!',
            'rejeitada' => 'Sua ordem foi rejeitada.',
            'em_andamento' => 'Sua ordem esta em andamento.',
            'concluida' => 'Sua ordem foi concluida!',
            'paga' => 'O pagamento da sua ordem foi confirmado.',
        ];

        return $this->create(
            $user,
            'order_status',
            'Status da ordem atualizado',
            $statusMessages[$newStatus] ?? 'O status da sua ordem foi alterado.',
            ['order_id' => $order->id, 'status' => $newStatus]
        );
    }

    /**
     * Notifica sobre assinatura
     */
    public function notifySubscription(User $user, string $action, $subscription = null): Notification
    {
        $messages = [
            'created' => 'Seu plano foi ativado com sucesso!',
            'expiring' => 'Seu plano expira em breve. Renove para continuar usando.',
            'expired' => 'Seu plano expirou. Renove para continuar usando os servicos.',
            'cancelled' => 'Seu plano foi cancelado.',
            'upgraded' => 'Seu plano foi atualizado com sucesso!',
        ];

        return $this->create(
            $user,
            'subscription',
            'Informacao sobre seu plano',
            $messages[$action] ?? 'Houve uma atualizacao no seu plano.',
            $subscription ? ['subscription_id' => $subscription->id] : []
        );
    }

    /**
     * Notifica mensagem do sistema
     */
    public function notifySystem(User $user, string $title, string $message, array $data = []): Notification
    {
        return $this->create($user, 'system', $title, $message, $data);
    }
}
