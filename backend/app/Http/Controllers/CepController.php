<?php

namespace App\Http\Controllers;

use App\Services\ViaCepService;
use Illuminate\Http\JsonResponse;

class CepController extends Controller
{
    protected ViaCepService $viaCep;

    public function __construct(ViaCepService $viaCep)
    {
        $this->viaCep = $viaCep;
    }

    /**
     * Buscar endereco por CEP
     */
    public function fetch(string $cep): JsonResponse
    {
        // Validar formato
        if (!$this->viaCep->isValidFormat($cep)) {
            return response()->json([
                'message' => 'Formato de CEP invalido',
            ], 422);
        }

        $address = $this->viaCep->fetch($cep);

        if (!$address) {
            return response()->json([
                'message' => 'CEP nao encontrado',
            ], 404);
        }

        return response()->json([
            'data' => $address,
        ]);
    }

    /**
     * Buscar CEPs por endereco
     */
    public function search(string $estado, string $cidade, string $logradouro): JsonResponse
    {
        $addresses = $this->viaCep->searchByAddress($estado, $cidade, $logradouro);

        if (!$addresses) {
            return response()->json([
                'message' => 'Nenhum endereco encontrado',
            ], 404);
        }

        return response()->json([
            'data' => $addresses,
        ]);
    }
}
