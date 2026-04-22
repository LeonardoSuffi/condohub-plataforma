<?php

namespace App\Http\Controllers;

use App\Services\CompanyCacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardDataController extends Controller
{
    /**
     * Endpoint otimizado para dashboard - retorna todos os dados em uma única requisição
     * Reduz de ~10 requests para 1 request
     */
    public function index(Request $request)
    {
        $cidade = $request->cidade;
        $categoryIds = $request->category_ids ? explode(',', $request->category_ids) : [];

        // Cache key baseada nos parâmetros
        $cacheKey = 'dashboard:data:' . md5(json_encode([
            'cidade' => $cidade,
            'categories' => $categoryIds,
        ]));

        $data = Cache::remember($cacheKey, 300, function () use ($cidade, $categoryIds) {
            $result = [
                'featured' => $this->formatCompanies(
                    CompanyCacheService::getTopCompaniesByType('deals', 20)
                ),
                'top_rated' => $this->formatCompanies(
                    CompanyCacheService::getTopCompaniesByType('rating', 20)
                ),
                'new' => $this->formatCompanies(
                    CompanyCacheService::getTopCompaniesByType('new', 20)
                ),
                'most_hired' => $this->formatCompanies(
                    CompanyCacheService::getTopCompaniesByType('services', 20)
                ),
                'verified' => $this->formatCompanies(
                    CompanyCacheService::getTopCompaniesByType('verified', 20)
                ),
                'stats' => CompanyCacheService::getAggregatedStats(),
            ];

            // Empresas por cidade (se informada)
            if ($cidade) {
                $result['nearby'] = $this->formatCompanies(
                    CompanyCacheService::getCompaniesByCity($cidade, 20)
                );
            }

            // Empresas por categorias
            if (!empty($categoryIds)) {
                $byCategory = [];
                foreach (array_slice($categoryIds, 0, 3) as $catId) {
                    $companies = CompanyCacheService::getCompaniesByCategory((int) $catId, 20);
                    if ($companies->count() > 0) {
                        $byCategory[$catId] = $this->formatCompanies($companies);
                    }
                }
                $result['by_category'] = $byCategory;
            }

            return $result;
        });

        return $this->success($data, 'Dashboard data');
    }

    /**
     * Endpoint leve para verificar se há atualizações
     * Frontend pode usar para decidir se precisa recarregar
     */
    public function checkUpdates(Request $request)
    {
        $lastUpdate = Cache::get('companies:last_update', now()->timestamp);

        return $this->success([
            'last_update' => $lastUpdate,
            'should_refresh' => $request->last_check < $lastUpdate,
        ]);
    }

    /**
     * Formata empresas para resposta otimizada (campos mínimos)
     */
    private function formatCompanies($companies): array
    {
        return $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'user_id' => $company->user_id,
                'nome_fantasia' => $company->nome_fantasia,
                'segmento' => $company->segmento,
                'cidade' => $company->cidade,
                'estado' => $company->estado,
                'logo_url' => $company->logo_path,
                'verified' => $company->verified,
                'services_count' => $company->services_count ?? 0,
                'deals_completed_count' => $company->deals_completed_count ?? 0,
                'average_rating' => $company->average_rating ? round($company->average_rating, 1) : null,
                'reviews_count' => $company->reviews_count ?? 0,
            ];
        })->toArray();
    }
}
