<?php

namespace App\Services;

use App\Models\CompanyProfile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CompanyCacheService
{
    // Cache TTL em segundos
    const CACHE_TTL_SHORT = 300;      // 5 minutos - listas frequentes
    const CACHE_TTL_MEDIUM = 1800;    // 30 minutos - dados agregados
    const CACHE_TTL_LONG = 3600;      // 1 hora - dados estáticos

    /**
     * Gera cache key baseada nos parâmetros
     */
    public static function generateCacheKey(string $prefix, array $params = []): string
    {
        ksort($params);
        $hash = md5(json_encode($params));
        return "companies:{$prefix}:{$hash}";
    }

    /**
     * Busca empresas com cache
     */
    public static function getCompanies(array $filters = [], int $perPage = 12): mixed
    {
        $cacheKey = self::generateCacheKey('list', array_merge($filters, ['per_page' => $perPage]));

        return Cache::remember($cacheKey, self::CACHE_TTL_SHORT, function () use ($filters, $perPage) {
            return self::buildCompanyQuery($filters)->paginate($perPage);
        });
    }

    /**
     * Busca estatísticas agregadas de empresas (para dashboard)
     */
    public static function getAggregatedStats(): array
    {
        return Cache::remember('companies:stats:aggregated', self::CACHE_TTL_MEDIUM, function () {
            return [
                'total_companies' => CompanyProfile::count(),
                'verified_companies' => CompanyProfile::where('verified', true)->count(),
                'total_services' => DB::table('services')->where('status', 'ativo')->count(),
                'total_deals_completed' => DB::table('deals')->where('status', 'concluido')->count(),
                'avg_rating' => DB::table('reviews')
                    ->where('status', 'approved')
                    ->avg('rating') ?? 0,
            ];
        });
    }

    /**
     * Busca top empresas por categoria (para carousels)
     */
    public static function getTopCompaniesByType(string $type, int $limit = 20): mixed
    {
        $cacheKey = "companies:top:{$type}:{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SHORT, function () use ($type, $limit) {
            $query = self::buildBaseQuery();

            switch ($type) {
                case 'featured':
                case 'deals':
                    $query->orderByDesc('deals_completed_count');
                    break;
                case 'rating':
                    $query->orderByDesc('average_rating')
                          ->orderByDesc('reviews_count');
                    break;
                case 'new':
                case 'created_at':
                    $query->orderByDesc('created_at');
                    break;
                case 'services':
                    $query->orderByDesc('services_count');
                    break;
                case 'verified':
                    $query->where('verified', true)
                          ->orderByDesc('deals_completed_count');
                    break;
                default:
                    $query->orderByDesc('deals_completed_count');
            }

            return $query->limit($limit)->get();
        });
    }

    /**
     * Busca empresas por cidade
     */
    public static function getCompaniesByCity(string $city, int $limit = 20): mixed
    {
        $cacheKey = "companies:city:" . md5($city) . ":{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SHORT, function () use ($city, $limit) {
            return self::buildBaseQuery()
                ->where('cidade', 'like', "%{$city}%")
                ->orderByDesc('deals_completed_count')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Busca empresas por categoria
     */
    public static function getCompaniesByCategory(int $categoryId, int $limit = 20): mixed
    {
        $cacheKey = "companies:category:{$categoryId}:{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SHORT, function () use ($categoryId, $limit) {
            return self::buildBaseQuery()
                ->whereHas('services', function ($q) use ($categoryId) {
                    $q->where('status', 'ativo')
                      ->where('category_id', $categoryId);
                })
                ->orderByDesc('deals_completed_count')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Perfil de empresa individual com cache
     */
    public static function getCompanyProfile($id): ?CompanyProfile
    {
        $cacheKey = "companies:profile:{$id}";

        return Cache::remember($cacheKey, self::CACHE_TTL_MEDIUM, function () use ($id) {
            $query = CompanyProfile::withCount(['services' => fn($q) => $q->where('status', 'ativo')])
                ->withCount(['deals as deals_completed_count' => fn($q) => $q->where('status', 'concluido')]);

            if (is_numeric($id)) {
                return $query->where('id', $id)->orWhere('user_id', $id)->first();
            }

            return $query->where('slug', $id)->first();
        });
    }

    /**
     * Invalida cache de uma empresa específica
     */
    public static function invalidateCompany(int $companyId): void
    {
        Cache::forget("companies:profile:{$companyId}");

        // Invalida listas que podem conter essa empresa
        self::invalidateListCaches();
    }

    /**
     * Invalida todos os caches de listas
     */
    public static function invalidateListCaches(): void
    {
        // Em produção, usar tags do Redis para invalidação seletiva
        // Cache::tags(['companies'])->flush();

        // Fallback: invalidar caches conhecidas
        $types = ['featured', 'rating', 'new', 'services', 'verified', 'deals', 'created_at'];
        foreach ($types as $type) {
            Cache::forget("companies:top:{$type}:20");
        }

        Cache::forget('companies:stats:aggregated');
    }

    /**
     * Constrói query base otimizada
     */
    private static function buildBaseQuery()
    {
        return CompanyProfile::select([
                'company_profiles.id',
                'company_profiles.user_id',
                'company_profiles.nome_fantasia',
                'company_profiles.segmento',
                'company_profiles.cidade',
                'company_profiles.estado',
                'company_profiles.descricao',
                'company_profiles.logo_path',
                'company_profiles.cover_path',
                'company_profiles.slug',
                'company_profiles.verified',
                'company_profiles.created_at',
            ])
            ->withCount(['services' => fn($q) => $q->where('status', 'ativo')])
            ->withCount(['deals as deals_completed_count' => fn($q) => $q->where('status', 'concluido')])
            ->withAvg(['reviews as average_rating' => fn($q) => $q->where('status', 'approved')], 'rating')
            ->withCount(['reviews as reviews_count' => fn($q) => $q->where('status', 'approved')])
            ->whereHas('services', fn($q) => $q->where('status', 'ativo'));
    }

    /**
     * Constrói query com filtros
     */
    private static function buildCompanyQuery(array $filters)
    {
        $query = self::buildBaseQuery();

        // Filtros
        if (!empty($filters['verified_only'])) {
            $query->where('verified', true);
        }

        if (!empty($filters['segmento'])) {
            $query->where('segmento', $filters['segmento']);
        }

        if (!empty($filters['cidade'])) {
            $query->where('cidade', 'like', "%{$filters['cidade']}%");
        }

        if (!empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }

        if (!empty($filters['category_id'])) {
            $query->whereHas('services', function ($q) use ($filters) {
                $q->where('status', 'ativo')
                  ->where('category_id', $filters['category_id']);
            });
        }

        // Busca full-text (se disponível) ou LIKE
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nome_fantasia', 'like', "%{$search}%")
                  ->orWhere('razao_social', 'like', "%{$search}%");
            });
        }

        // Ordenação
        $orderBy = $filters['order_by'] ?? 'deals';
        switch ($orderBy) {
            case 'services':
                $query->orderByDesc('services_count');
                break;
            case 'rating':
                $query->orderByDesc('average_rating')->orderByDesc('reviews_count');
                break;
            case 'created_at':
                $query->orderByDesc('created_at');
                break;
            case 'nome_fantasia':
                $query->orderBy('nome_fantasia');
                break;
            default:
                $query->orderByDesc('deals_completed_count');
        }

        return $query;
    }

    /**
     * Pré-aquece cache das queries mais comuns
     */
    public static function warmupCache(): void
    {
        // Top empresas por cada tipo
        $types = ['featured', 'rating', 'new', 'services', 'verified'];
        foreach ($types as $type) {
            self::getTopCompaniesByType($type, 20);
        }

        // Estatísticas agregadas
        self::getAggregatedStats();
    }
}
