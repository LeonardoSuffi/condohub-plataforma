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
     */
    protected function configureRateLimiting(): void
    {
        // Rate limiter padrão para API
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Rate limiter específico para autenticação (mais restritivo)
        // 5 tentativas por minuto para prevenir brute force
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Muitas tentativas. Tente novamente em ' . ceil($headers['Retry-After'] / 60) . ' minuto(s).',
                    ], 429, $headers);
                });
        });

        // Rate limiter para reset de senha (ainda mais restritivo)
        // 3 tentativas por hora
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perHour(3)->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Limite de solicitações de senha atingido. Tente novamente mais tarde.',
                    ], 429, $headers);
                });
        });
    }
}
