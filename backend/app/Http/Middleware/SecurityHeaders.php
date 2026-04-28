<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para adicionar headers de segurança
 */
class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Previne clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Previne MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Ativa proteção XSS do navegador
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy (antigo Feature-Policy)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // HSTS - Força HTTPS (apenas em produção)
        if (app()->environment('production')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // Content Security Policy
        // NOTA: Este CSP se aplica às respostas da API, não ao SPA React.
        // O frontend SPA deve configurar seu próprio CSP no servidor web (nginx/apache)
        // ou no Vite config para produção.
        if (app()->environment('production')) {
            // CSP mais restritivo para respostas da API
            $csp = implode('; ', [
                "default-src 'none'",                    // Bloqueia tudo por padrão
                "frame-ancestors 'none'",                // Previne embedding em iframes
                "base-uri 'self'",                       // Restringe base URI
                "form-action 'self'",                    // Restringe form submissions
            ]);
            $response->headers->set('Content-Security-Policy', $csp);

            // Header adicional para APIs - impede que respostas JSON sejam renderizadas como HTML
            if ($request->expectsJson() || $request->is('api/*')) {
                $response->headers->set('X-Content-Type-Options', 'nosniff');
            }
        }

        // Cache control para respostas sensíveis
        if ($request->is('api/auth/*') || $request->is('api/admin/*')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }
}
