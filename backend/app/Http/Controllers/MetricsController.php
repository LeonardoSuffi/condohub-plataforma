<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Deal;
use App\Models\Review;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    /**
     * Dashboard de metricas para empresa
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ver metricas'], 403);
        }

        $company = $user->companyProfile;
        $companyId = $company->id;

        // Periodo (ultimos 30 dias por padrao)
        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        // Metricas gerais
        $metrics = [
            // Servicos
            'services' => [
                'total' => Service::where('company_id', $companyId)->count(),
                'active' => Service::where('company_id', $companyId)->where('status', 'ativo')->count(),
            ],

            // Negociacoes
            'deals' => [
                'total' => Deal::where('company_id', $companyId)->count(),
                'period' => Deal::where('company_id', $companyId)
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'by_status' => Deal::where('company_id', $companyId)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status'),
            ],

            // Avaliacoes
            'reviews' => [
                'average' => Review::getAverageForCompany($companyId),
                'total' => Review::getCountForCompany($companyId),
                'distribution' => Review::getRatingDistribution($companyId),
                'period' => Review::forCompany($companyId)
                    ->where('created_at', '>=', $startDate)
                    ->count(),
            ],

            // Negociacoes concluidas (revenue requer implementacao de valores reais)
            'revenue' => [
                'total' => Deal::where('company_id', $companyId)
                    ->where('status', 'concluido')
                    ->count(),
                'period' => Deal::where('company_id', $companyId)
                    ->where('status', 'concluido')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'note' => 'count_only', // Indica que sao contagens, nao valores monetarios
            ],

            // Conversao
            'conversion' => $this->calculateConversionRate($companyId),

            // Portfolio
            'portfolio' => [
                'total' => $company->portfolioItems()->count(),
                'featured' => $company->portfolioItems()->where('featured', true)->count(),
            ],
        ];

        return response()->json([
            'data' => $metrics,
            'period_days' => $days,
        ]);
    }

    /**
     * Dados para graficos
     */
    public function charts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ver metricas'], 403);
        }

        $companyId = $user->companyProfile->id;

        // Periodo (ultimos 30 dias por padrao)
        $days = $request->get('days', 30);

        $charts = [
            // Negociacoes por dia
            'deals_timeline' => $this->getDealsTimeline($companyId, $days),

            // Avaliacoes por dia
            'reviews_timeline' => $this->getReviewsTimeline($companyId, $days),

            // Faturamento por mes
            'revenue_timeline' => $this->getRevenueTimeline($companyId, 6),

            // Servicos mais solicitados
            'top_services' => $this->getTopServices($companyId),

            // Origem das negociacoes
            'deal_sources' => $this->getDealSources($companyId),
        ];

        return response()->json([
            'data' => $charts,
        ]);
    }

    /**
     * Metricas do cliente
     */
    public function clientDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCliente()) {
            return response()->json(['message' => 'Apenas clientes podem ver estas metricas'], 403);
        }

        $clientId = $user->clientProfile->id;

        $metrics = [
            'deals' => [
                'total' => Deal::where('client_id', $clientId)->count(),
                'active' => Deal::where('client_id', $clientId)
                    ->whereIn('status', ['pendente', 'em_andamento'])
                    ->count(),
                'completed' => Deal::where('client_id', $clientId)
                    ->where('status', 'concluido')
                    ->count(),
            ],
            'reviews' => [
                'given' => Review::byClient($clientId)->count(),
            ],
            'spending' => [
                'total' => Deal::where('client_id', $clientId)
                    ->where('status', 'concluido')
                    ->count(),
                'note' => 'count_only', // Contagem de servicos concluidos
            ],
        ];

        return response()->json([
            'data' => $metrics,
        ]);
    }

    /**
     * Calcular taxa de conversao
     */
    protected function calculateConversionRate(int $companyId): array
    {
        $total = Deal::where('company_id', $companyId)->count();
        $completed = Deal::where('company_id', $companyId)
            ->where('status', 'concluido')
            ->count();

        $rate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        return [
            'rate' => $rate,
            'total' => $total,
            'completed' => $completed,
        ];
    }

    /**
     * Timeline de negociacoes
     */
    protected function getDealsTimeline(int $companyId, int $days): array
    {
        return Deal::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subDays($days))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Timeline de avaliacoes
     */
    protected function getReviewsTimeline(int $companyId, int $days): array
    {
        return Review::forCompany($companyId)
            ->where('created_at', '>=', now()->subDays($days))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'), DB::raw('AVG(rating) as avg_rating'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => $item->count,
                'avg_rating' => round($item->avg_rating, 1),
            ])
            ->toArray();
    }

    /**
     * Timeline de negociacoes concluidas por mes
     */
    protected function getRevenueTimeline(int $companyId, int $months): array
    {
        return Deal::where('company_id', $companyId)
            ->where('status', 'concluido')
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'period' => "{$item->year}-" . str_pad($item->month, 2, '0', STR_PAD_LEFT),
                'total' => $item->total,
            ])
            ->toArray();
    }

    /**
     * Servicos mais solicitados
     */
    protected function getTopServices(int $companyId): array
    {
        return Deal::where('deals.company_id', $companyId)
            ->join('services', 'deals.service_id', '=', 'services.id')
            ->select('services.title', DB::raw('count(*) as count'))
            ->groupBy('services.id', 'services.title')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    /**
     * Origem das negociacoes (poderia vir de campo especifico)
     */
    protected function getDealSources(int $companyId): array
    {
        // Por enquanto retorna placeholder
        // Em implementacao real, teria campo de origem no deal
        return [
            ['source' => 'Busca', 'count' => 0],
            ['source' => 'Indicacao', 'count' => 0],
            ['source' => 'Redes Sociais', 'count' => 0],
        ];
    }
}
