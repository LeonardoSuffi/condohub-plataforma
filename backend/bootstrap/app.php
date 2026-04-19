<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Middlewares globais de segurança (verificação de ambiente feita internamente)
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->append(\App\Http\Middleware\ForceHttps::class);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'isAdmin' => \App\Http\Middleware\IsAdmin::class,
            'isEmpresa' => \App\Http\Middleware\IsEmpresa::class,
            'isCliente' => \App\Http\Middleware\IsCliente::class,
            'hasActivePlan' => \App\Http\Middleware\HasActivePlan::class,
            'validateSession' => \App\Http\Middleware\ValidateSession::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        ]);

        // For API requests, return 401 JSON instead of redirecting to login
        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return null; // Will trigger AuthenticationException
            }
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle unauthenticated API requests
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please login.',
                ], 401);
            }
        });
    })->create();
