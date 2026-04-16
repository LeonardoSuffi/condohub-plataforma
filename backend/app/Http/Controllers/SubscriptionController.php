<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    protected SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Lista assinaturas do usuário
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $subscriptions = Subscription::where('user_id', $user->id)
            ->with('plan')
            ->orderByDesc('created_at')
            ->get();

        $activeSubscription = $subscriptions->firstWhere('status', 'ativa');

        return $this->success([
            'active' => $activeSubscription,
            'history' => $subscriptions,
        ], 'Assinaturas do usuário');
    }

    /**
     * Assina um plano
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($validated['plan_id']);

        // Verifica se já tem assinatura ativa
        $activeSubscription = $user->activeSubscription;
        if ($activeSubscription) {
            return $this->error(
                'Você já possui uma assinatura ativa. Use a rota de upgrade/downgrade.',
                400
            );
        }

        $subscription = $this->subscriptionService->createSubscription($user, $plan);

        return $this->success(
            $subscription->load('plan'),
            'Assinatura criada com sucesso',
            201
        );
    }

    /**
     * Upgrade/Downgrade de plano
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $newPlan = Plan::findOrFail($validated['plan_id']);

        $result = $this->subscriptionService->changePlan($subscription, $newPlan);

        if (!$result['success']) {
            return $this->error($result['message'], 400);
        }

        return $this->success(
            $subscription->refresh()->load('plan'),
            $result['message']
        );
    }

    /**
     * Cancela assinatura
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('id', $id)
            ->where('status', 'ativa')
            ->firstOrFail();

        $this->subscriptionService->cancelSubscription($subscription);

        return $this->success(null, 'Assinatura cancelada com sucesso');
    }
}
