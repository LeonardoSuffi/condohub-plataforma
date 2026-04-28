<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Observers\OrderObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Order::observe(OrderObserver::class);

        $this->configureRateLimiting();
    }

    /**
     * Configure rate limiters for the application.
     * Valores configuráveis em config/security.php
     */
    protected function configureRateLimiting(): void
    {
        // Rate limiter padrão para API
        RateLimiter::for('api', function (Request $request) {
            $limit = config('security.rate_limits.api', 60);
            return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip());
        });

        // Rate limiter específico para autenticação (mais restritivo)
        RateLimiter::for('auth', function (Request $request) {
            $limit = config('security.rate_limits.auth', 5);
            return Limit::perMinute($limit)->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Muitas tentativas. Tente novamente em ' . ceil($headers['Retry-After'] / 60) . ' minuto(s).',
                    ], 429, $headers);
                });
        });

        // Rate limiter para reset de senha (ainda mais restritivo)
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perHour(3)->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Limite de solicitações de senha atingido. Tente novamente mais tarde.',
                    ], 429, $headers);
                });
        });

        // Rate limiter para rotas administrativas
        RateLimiter::for('admin', function (Request $request) {
            $limit = config('security.rate_limits.admin', 100);
            return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Limite de requisicoes administrativas atingido. Aguarde um momento.',
                    ], 429, $headers);
                });
        });

        // Rate limiter para acoes criticas admin (reset senha, delete, etc)
        RateLimiter::for('admin-critical', function (Request $request) {
            $limit = config('security.rate_limits.admin_critical', 10);
            return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Limite de acoes criticas atingido. Aguarde antes de continuar.',
                    ], 429, $headers);
                });
        });

        // Rate limiter para exportacao de dados
        RateLimiter::for('admin-export', function (Request $request) {
            $limit = config('security.rate_limits.admin_export', 5);
            return Limit::perHour($limit)->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Limite de exportacoes atingido. Tente novamente em uma hora.',
                    ], 429, $headers);
                });
        });
    }
}
