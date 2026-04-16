<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsCliente
{
    /**
     * Verifica se o usuário autenticado é um cliente.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.',
            ], 401);
        }

        if (!$request->user()->isCliente()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso restrito a clientes.',
            ], 403);
        }

        // Verifica se tem perfil de cliente criado
        if (!$request->user()->clientProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Perfil de cliente não encontrado.',
            ], 403);
        }

        return $next($request);
    }
}
