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
        return $this->create(
            $user,
            'deal_new',
            'Nova proposta recebida',
            'Voce recebeu uma nova proposta de negociacao.',
            ['deal_id' => $deal->id]
        );
    }

    /**
     * Notifica sobre mudanca de status da negociacao
     */
    public function notifyDealStatusChange(User $user, $deal, string $newStatus): Notification
    {
        $statusMessages = [
            'aceito' => 'Sua proposta foi aceita!',
            'rejeitado' => 'Sua proposta foi recusada.',
            'fechado' => 'A negociacao foi concluida com sucesso!',
            'cancelado' => 'A negociacao foi cancelada.',
        ];

        return $this->create(
            $user,
            'deal_status',
            'Status da negociacao atualizado',
            $statusMessages[$newStatus] ?? 'O status da negociacao foi alterado.',
            ['deal_id' => $deal->id, 'status' => $newStatus]
        );
    }

    /**
     * Notifica sobre nova mensagem
     */
    public function notifyNewMessage(User $user, $deal, $message): Notification
    {
        return $this->create(
            $user,
            'message',
            'Nova mensagem',
            'Voce recebeu uma nova mensagem na negociacao.',
            ['deal_id' => $deal->id, 'message_id' => $message->id]
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
