<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsEmpresa
{
    /**
     * Verifica se o usuário autenticado é uma empresa.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.',
            ], 401);
        }

        if (!$request->user()->isEmpresa()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso restrito a empresas.',
            ], 403);
        }

        // Verifica se tem perfil de empresa criado
        if (!$request->user()->companyProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Perfil de empresa não encontrado.',
            ], 403);
        }

        return $next($request);
    }
}
