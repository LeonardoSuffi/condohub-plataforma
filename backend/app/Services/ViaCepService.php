<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ViaCepService
{
    protected string $baseUrl = 'https://viacep.com.br/ws';

    /**
     * Buscar endereco por CEP
     */
    public function fetch(string $cep): ?array
    {
        // Remover caracteres nao numericos
        $cep = preg_replace('/[^0-9]/', '', $cep);

        // Validar tamanho do CEP
        if (strlen($cep) !== 8) {
            return null;
        }

        // Tentar cache primeiro (1 semana)
        $cacheKey = "cep:{$cep}";

        return Cache::remember($cacheKey, now()->addWeek(), function () use ($cep) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$cep}/json/");

                if (!$response->successful()) {
                    return null;
                }

                $data = $response->json();

                // ViaCEP retorna erro no json quando CEP nao existe
                if (isset($data['erro']) && $data['erro'] === true) {
                    return null;
                }

                return $this->formatResponse($data);
            } catch (\Exception $e) {
                report($e);
                return null;
            }
        });
    }

    /**
     * Formatar resposta do ViaCEP
     */
    protected function formatResponse(array $data): array
    {
        return [
            'cep' => $data['cep'] ?? null,
            'logradouro' => $data['logradouro'] ?? null,
            'complemento' => $data['complemento'] ?? null,
            'bairro' => $data['bairro'] ?? null,
            'cidade' => $data['localidade'] ?? null,
            'estado' => $data['uf'] ?? null,
            'ibge' => $data['ibge'] ?? null,
            'ddd' => $data['ddd'] ?? null,
            // Campos formatados para uso direto
            'endereco_completo' => $this->buildFullAddress($data),
        ];
    }

    /**
     * Construir endereco completo
     */
    protected function buildFullAddress(array $data): string
    {
        $parts = array_filter([
            $data['logradouro'] ?? null,
            $data['bairro'] ?? null,
            $data['localidade'] ?? null,
            $data['uf'] ?? null,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Buscar CEPs por endereco (busca inversa)
     */
    public function searchByAddress(string $estado, string $cidade, string $logradouro): ?array
    {
        // Minimo 3 caracteres no logradouro
        if (strlen($logradouro) < 3) {
            return null;
        }

        try {
            $response = Http::timeout(10)->get(
                "{$this->baseUrl}/{$estado}/{$cidade}/{$logradouro}/json/"
            );

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();

            // Erro ou array vazio
            if (empty($data) || (isset($data['erro']) && $data['erro'] === true)) {
                return null;
            }

            // Formatar cada resultado
            return array_map(fn($item) => $this->formatResponse($item), $data);
        } catch (\Exception $e) {
            report($e);
            return null;
        }
    }

    /**
     * Validar formato do CEP
     */
    public function isValidFormat(string $cep): bool
    {
        $cep = preg_replace('/[^0-9]/', '', $cep);
        return strlen($cep) === 8;
    }

    /**
     * Formatar CEP com mascara
     */
    public function format(string $cep): string
    {
        $cep = preg_replace('/[^0-9]/', '', $cep);

        if (strlen($cep) !== 8) {
            return $cep;
        }

        return substr($cep, 0, 5) . '-' . substr($cep, 5, 3);
    }
}
