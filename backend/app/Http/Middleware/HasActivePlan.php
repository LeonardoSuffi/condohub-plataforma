<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HasActivePlan
{
    /**
     * Verifica se o usuário tem um plano ativo.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.',
            ], 401);
        }

        $subscription = $request->user()->activeSubscription;

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Você não possui uma assinatura ativa.',
                'code' => 'NO_SUBSCRIPTION',
            ], 403);
        }

        if (!$subscription->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Sua assinatura expirou. Por favor, renove seu plano.',
                'code' => 'SUBSCRIPTION_EXPIRED',
            ], 403);
        }

        // Adiciona informações da assinatura no request para uso posterior
        $request->merge([
            'subscription' => $subscription,
            'plan' => $subscription->plan,
        ]);

        return $next($request);
    }
}
