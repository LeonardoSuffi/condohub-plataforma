<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Plan;
use App\Models\User;
use App\Models\Transaction;

class SubscriptionService
{
    /**
     * Cria uma nova assinatura
     */
    public function createSubscription(User $user, Plan $plan): Subscription
    {
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'ativa',
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->getDurationInDays()),
            'interactions_used' => 0,
        ]);

        // Cria transação se o plano for pago
        if (!$plan->isFree()) {
            Transaction::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'type' => 'assinatura',
                'amount' => $plan->price,
                'commission' => 0,
                'net_amount' => $plan->price,
                'status' => 'pendente', // Aguardando pagamento
            ]);
        }

        return $subscription;
    }

    /**
     * Altera o plano de uma assinatura
     */
    public function changePlan(Subscription $subscription, Plan $newPlan): array
    {
        $currentPlan = $subscription->plan;

        if ($currentPlan->id === $newPlan->id) {
            return [
                'success' => false,
                'message' => 'O novo plano é igual ao atual.',
            ];
        }

        // Muda status para alterando
        $subscription->update(['status' => 'alterando']);

        // Calcula diferença (para upgrade)
        $priceDiff = $newPlan->price - $currentPlan->price;

        if ($priceDiff > 0) {
            // Upgrade - cria transação da diferença
            Transaction::create([
                'user_id' => $subscription->user_id,
                'subscription_id' => $subscription->id,
                'type' => 'assinatura',
                'amount' => $priceDiff,
                'commission' => 0,
                'net_amount' => $priceDiff,
                'status' => 'pendente',
                'metadata' => [
                    'type' => 'upgrade',
                    'from_plan' => $currentPlan->id,
                    'to_plan' => $newPlan->id,
                ],
            ]);
        }

        // Atualiza para o novo plano
        $subscription->update([
            'plan_id' => $newPlan->id,
            'status' => 'ativa',
            'ends_at' => now()->addDays($newPlan->getDurationInDays()),
        ]);

        $action = $priceDiff > 0 ? 'Upgrade' : 'Downgrade';

        return [
            'success' => true,
            'message' => "{$action} realizado com sucesso para o plano {$newPlan->name}.",
        ];
    }

    /**
     * Cancela uma assinatura
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'status' => 'cancelada',
        ]);
    }

    /**
     * Expira assinaturas vencidas
     */
    public function expireSubscriptions(): int
    {
        $expired = Subscription::where('status', 'ativa')
            ->where('ends_at', '<=', now())
            ->update(['status' => 'expirada']);

        return $expired;
    }

    /**
     * Renova assinatura
     */
    public function renewSubscription(Subscription $subscription): Subscription
    {
        $plan = $subscription->plan;

        $subscription->update([
            'status' => 'ativa',
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->getDurationInDays()),
            'interactions_used' => 0,
        ]);

        if (!$plan->isFree()) {
            Transaction::create([
                'user_id' => $subscription->user_id,
                'subscription_id' => $subscription->id,
                'type' => 'assinatura',
                'amount' => $plan->price,
                'commission' => 0,
                'net_amount' => $plan->price,
                'status' => 'pendente',
                'metadata' => ['type' => 'renewal'],
            ]);
        }

        return $subscription;
    }
}
