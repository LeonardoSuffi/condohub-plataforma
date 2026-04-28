<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateSession
{
    /**
     * Get session timeout in minutes from config
     */
    protected function getSessionTimeoutMinutes(): int
    {
        return config('security.session.duration_minutes', 120);
    }

    /**
     * Get inactivity timeout in minutes from config
     */
    protected function getInactivityTimeoutMinutes(): int
    {
        return config('security.session.inactivity_timeout_minutes', 30);
    }

    /**
     * Handle an incoming request.
     * Validates that the user's session is still valid (single session per user).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Check if user is blocked
        if ($user->is_blocked) {
            // Revoke current token
            $request->user()->currentAccessToken()->delete();

            // SEGURANCA: Nao expor motivo do bloqueio (pode conter info sensivel)
            return response()->json([
                'message' => 'Sua conta foi bloqueada. Entre em contato com o suporte para mais informacoes.',
                'code' => 'ACCOUNT_BLOCKED'
            ], 403);
        }

        // Get current token's session_id from token name or abilities
        $token = $request->user()->currentAccessToken();

        // Skip session validation for TransientToken (used in testing)
        // TransientToken doesn't have a name property
        if (!$token || !property_exists($token, 'name') || $token instanceof \Laravel\Sanctum\TransientToken) {
            return $next($request);
        }

        $tokenSessionId = $token->name; // We store session_id in token name

        // Refresh user from database to get current session_id
        $freshUser = \App\Models\User::find($user->id);

        // Check session expiry (absolute timeout)
        if ($freshUser->session_expires_at && now()->isAfter($freshUser->session_expires_at)) {
            // Session has expired
            $token->delete();
            $freshUser->update([
                'current_session_id' => null,
                'session_expires_at' => null,
                'last_activity_at' => null,
            ]);

            return response()->json([
                'message' => 'Sua sessao expirou. Por favor, faca login novamente.',
                'code' => 'SESSION_TIMEOUT'
            ], 401);
        }

        // Check inactivity timeout
        if ($freshUser->last_activity_at &&
            now()->diffInMinutes($freshUser->last_activity_at) > $this->getInactivityTimeoutMinutes()) {
            // User has been inactive for too long
            $token->delete();
            $freshUser->update([
                'current_session_id' => null,
                'session_expires_at' => null,
                'last_activity_at' => null,
            ]);

            return response()->json([
                'message' => 'Sessao encerrada por inatividade. Por favor, faca login novamente.',
                'code' => 'INACTIVITY_TIMEOUT'
            ], 401);
        }

        // Validate session - if user's current_session_id doesn't match token's session_id
        if ($freshUser->current_session_id && $tokenSessionId !== $freshUser->current_session_id) {
            // Log for debugging
            \Log::warning('Session mismatch', [
                'user_id' => $user->id,
                'token_session_id' => $tokenSessionId,
                'user_session_id' => $freshUser->current_session_id,
                'request_path' => $request->path(),
            ]);

            // This token is from an old session - revoke it
            $token->delete();

            return response()->json([
                'message' => 'Sua sessao foi encerrada. Outro login foi detectado em outro dispositivo.',
                'code' => 'SESSION_EXPIRED'
            ], 401);
        }

        // Update last activity timestamp
        $freshUser->update([
            'last_activity_at' => now(),
        ]);

        return $next($request);
    }
}
