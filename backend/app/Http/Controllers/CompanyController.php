<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    /**
     * Cache TTL em segundos (5 minutos para listagem)
     */
    private const CACHE_TTL_LIST = 300;

    /**
     * Cache TTL para perfil individual (10 minutos)
     */
    private const CACHE_TTL_PROFILE = 600;

    /**
     * Lista empresas publicamente (para diretório)
     * Otimizado para 10k+ empresas com cache e queries eficientes
     */
    public function index(Request $request)
    {
        // Gera chave de cache baseada nos parâmetros
        $cacheKey = $this->generateCacheKey('companies_list', $request->all());

        // Tenta buscar do cache primeiro
        $result = Cache::remember($cacheKey, self::CACHE_TTL_LIST, function () use ($request) {
            return $this->fetchCompanies($request);
        });

        return $this->success($result, 'Lista de empresas');
    }

    /**
     * Busca empresas com queries otimizadas
     */
    private function fetchCompanies(Request $request)
    {
        // Query base otimizada - evita subconsultas pesadas
        $query = CompanyProfile::query()
            ->select([
                'company_profiles.id',
                'company_profiles.user_id',
                'company_profiles.nome_fantasia',
                'company_profiles.segmento',
                'company_profiles.cidade',
                'company_profiles.estado',
                'company_profiles.descricao',
                'company_profiles.logo_path',
                'company_profiles.cover_path',
                'company_profiles.verified',
                'company_profiles.slug',
                'company_profiles.average_rating',
                'company_profiles.created_at',
            ])
            // Usa subquery para contar servicos (mais eficiente que withCount com filtros)
            ->addSelect([
                'services_count' => Service::selectRaw('COUNT(*)')
                    ->whereColumn('company_id', 'company_profiles.id')
                    ->where('status', 'ativo'),
            ])
            // Subquery para deals concluidos
            ->addSelect([
                'deals_completed_count' => DB::table('deals')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('company_id', 'company_profiles.id')
                    ->where('status', 'concluido'),
            ])
            // Subquery para contagem de reviews
            ->addSelect([
                'reviews_count' => DB::table('reviews')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('company_id', 'company_profiles.id')
                    ->where('status', 'approved'),
            ])
            // Apenas empresas com servicos ativos (usando EXISTS que é mais rápido)
            ->whereExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('services')
                    ->whereColumn('services.company_id', 'company_profiles.id')
                    ->where('services.status', 'ativo');
            });

        // Aplicar filtros
        $this->applyFilters($query, $request);

        // Aplicar ordenacao
        $this->applyOrdering($query, $request);

        // Paginacao
        $perPage = min($request->per_page ?? 12, 50);
        $companies = $query->paginate($perPage);

        // Carrega servicos em batch (evita N+1)
        $companyIds = $companies->pluck('id')->toArray();

        if (!empty($companyIds)) {
            $servicesMap = $this->loadServicesForCompanies($companyIds);
            $categoriesMap = $this->loadCategoriesForCompanies($companyIds);

            // Transforma dados
            $companies->getCollection()->transform(function ($company) use ($servicesMap, $categoriesMap) {
                return [
                    'id' => $company->id,
                    'user_id' => $company->user_id,
                    'nome_fantasia' => $company->nome_fantasia,
                    'segmento' => $company->segmento,
                    'cidade' => $company->cidade,
                    'estado' => $company->estado,
                    'descricao' => $company->descricao,
                    'logo_url' => $company->logo_path,
                    'cover_path' => $company->cover_path,
                    'verified' => (bool) $company->verified,
                    'slug' => $company->slug,
                    'services_count' => (int) $company->services_count,
                    'deals_completed_count' => (int) $company->deals_completed_count,
                    'average_rating' => $company->average_rating ? round((float) $company->average_rating, 1) : null,
                    'reviews_count' => (int) $company->reviews_count,
                    'categories' => $categoriesMap[$company->id] ?? [],
                    'services_list' => $servicesMap[$company->id] ?? [],
                    'created_at' => $company->created_at,
                ];
            });
        }

        return $companies;
    }

    /**
     * Aplica filtros na query
     */
    private function applyFilters($query, Request $request): void
    {
        // Filtro para mostrar apenas verificadas
        if ($request->boolean('verified_only', false)) {
            $query->where('verified', true);
        }

        // Filtro por segmento
        if ($request->filled('segmento')) {
            $query->where('segmento', $request->segmento);
        }

        // Filtro por cidade - usa index
        if ($request->filled('cidade')) {
            $query->where('cidade', 'like', $request->cidade . '%');
        }

        // Filtro por estado - usa index
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Filtro por categoria (empresas que têm serviços nessa categoria)
        if ($request->filled('category_id')) {
            $categoryId = $request->category_id;
            $query->whereExists(function ($q) use ($categoryId) {
                $q->select(DB::raw(1))
                    ->from('services')
                    ->whereColumn('services.company_id', 'company_profiles.id')
                    ->where('services.status', 'ativo')
                    ->where('services.category_id', $categoryId);
            });
        }

        // Busca por nome - usa LIKE com prefixo para usar index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome_fantasia', 'like', "%{$search}%")
                    ->orWhere('razao_social', 'like', "%{$search}%");
            });
        }
    }

    /**
     * Aplica ordenacao na query
     */
    private function applyOrdering($query, Request $request): void
    {
        $allowedOrderBy = ['services', 'deals', 'nome_fantasia', 'created_at', 'rating'];
        $orderBy = $request->order_by ?? 'deals';

        if (!in_array($orderBy, $allowedOrderBy)) {
            $orderBy = 'deals';
        }

        switch ($orderBy) {
            case 'services':
                $query->orderByDesc('services_count');
                break;
            case 'deals':
                $query->orderByDesc('deals_completed_count');
                break;
            case 'created_at':
                $query->orderByDesc('created_at');
                break;
            case 'rating':
                $query->orderByDesc('average_rating')
                    ->orderByDesc('reviews_count');
                break;
            default:
                $query->orderBy('nome_fantasia');
        }
    }

    /**
     * Carrega servicos para multiplas empresas em batch
     */
    private function loadServicesForCompanies(array $companyIds): array
    {
        $services = Service::whereIn('company_id', $companyIds)
            ->where('status', 'ativo')
            ->select('company_id', 'title')
            ->orderBy('company_id')
            ->limit(count($companyIds) * 5) // Max 5 por empresa
            ->get();

        $map = [];
        foreach ($services as $service) {
            if (!isset($map[$service->company_id])) {
                $map[$service->company_id] = [];
            }
            if (count($map[$service->company_id]) < 5) {
                $map[$service->company_id][] = $service->title;
            }
        }

        return $map;
    }

    /**
     * Carrega categorias para multiplas empresas em batch
     */
    private function loadCategoriesForCompanies(array $companyIds): array
    {
        $categories = DB::table('services')
            ->join('categories', 'services.category_id', '=', 'categories.id')
            ->whereIn('services.company_id', $companyIds)
            ->where('services.status', 'ativo')
            ->select('services.company_id', 'categories.id', 'categories.name')
            ->distinct()
            ->get();

        $map = [];
        foreach ($categories as $cat) {
            if (!isset($map[$cat->company_id])) {
                $map[$cat->company_id] = [];
            }
            // Evita duplicatas
            $exists = collect($map[$cat->company_id])->contains('id', $cat->id);
            if (!$exists) {
                $map[$cat->company_id][] = ['id' => $cat->id, 'name' => $cat->name];
            }
        }

        return $map;
    }

    /**
     * Exibe perfil público de uma empresa
     * Com cache para perfis individuais
     */
    public function show($id)
    {
        $cacheKey = "company_profile_{$id}";

        $result = Cache::remember($cacheKey, self::CACHE_TTL_PROFILE, function () use ($id) {
            return $this->fetchCompanyProfile($id);
        });

        if (!$result) {
            return $this->error('Empresa não encontrada', 404);
        }

        return $this->success($result, 'Perfil da empresa');
    }

    /**
     * Busca perfil da empresa
     */
    private function fetchCompanyProfile($id)
    {
        $query = CompanyProfile::query()
            ->select([
                'company_profiles.*',
            ])
            ->with('user:id,email')
            ->addSelect([
                'services_count' => Service::selectRaw('COUNT(*)')
                    ->whereColumn('company_id', 'company_profiles.id')
                    ->where('status', 'ativo'),
            ])
            ->addSelect([
                'deals_completed_count' => DB::table('deals')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('company_id', 'company_profiles.id')
                    ->where('status', 'concluido'),
            ])
            ->addSelect([
                'reviews_count' => DB::table('reviews')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('company_id', 'company_profiles.id')
                    ->where('status', 'approved'),
            ]);

        $company = null;

        if (is_numeric($id)) {
            $company = (clone $query)->where('id', $id)->first();
            if (!$company) {
                $company = (clone $query)->where('user_id', $id)->first();
            }
        } else {
            $company = $query->where('slug', $id)->first();
        }

        if (!$company) {
            return null;
        }

        // Servicos ativos
        $services = Service::where('company_id', $company->id)
            ->where('status', 'ativo')
            ->with(['category:id,name,slug', 'images:id,service_id,path,is_cover'])
            ->select('id', 'title', 'description', 'region', 'price_range', 'featured', 'views_count', 'category_id')
            ->orderByDesc('featured')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(function ($service) {
                $images = $service->images ?? collect();
                $coverImage = $images->where('is_cover', true)->first()?->path
                    ?? $images->first()?->path;

                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'description' => $service->description,
                    'region' => $service->region,
                    'price_range' => $service->price_range,
                    'featured' => $service->featured,
                    'views_count' => $service->views_count,
                    'category' => $service->category ? [
                        'id' => $service->category->id,
                        'name' => $service->category->name,
                        'slug' => $service->category->slug,
                    ] : null,
                    'cover_image' => $coverImage,
                    'images_count' => $images->count(),
                ];
            });

        return [
            'id' => $company->id,
            'user_id' => $company->user_id,
            'nome_fantasia' => $company->nome_fantasia,
            'segmento' => $company->segmento,
            'cidade' => $company->cidade,
            'estado' => $company->estado,
            'descricao' => $company->descricao,
            'logo_url' => $company->logo_path,
            'cover_path' => $company->cover_path,
            'verified' => (bool) $company->verified,
            'slug' => $company->slug,
            'average_rating' => $company->average_rating ? round((float) $company->average_rating, 1) : null,
            'reviews_count' => (int) ($company->reviews_count ?? 0),
            'telefone' => $company->telefone,
            'website' => $company->website,
            'email' => $company->user?->email,
            'created_at' => $company->created_at,
            'services_count' => (int) $company->services_count,
            'deals_completed_count' => (int) $company->deals_completed_count,
            'services' => $services,
        ];
    }

    /**
     * Lista segmentos disponíveis (com cache longo)
     */
    public function segments()
    {
        $segments = Cache::remember('company_segments', 3600, function () {
            return CompanyProfile::whereNotNull('segmento')
                ->where('segmento', '!=', '')
                ->distinct()
                ->pluck('segmento')
                ->filter()
                ->values();
        });

        return $this->success($segments, 'Lista de segmentos');
    }

    /**
     * Gera chave de cache única baseada nos parâmetros
     */
    private function generateCacheKey(string $prefix, array $params): string
    {
        // Remove parâmetros vazios e ordena
        $params = array_filter($params, fn($v) => $v !== null && $v !== '');
        ksort($params);

        return $prefix . '_' . md5(serialize($params));
    }

    /**
     * Invalida cache de empresa (chamar após atualizações)
     */
    public static function invalidateCache($companyId = null): void
    {
        if ($companyId) {
            Cache::forget("company_profile_{$companyId}");
        }

        // Invalida caches de listagem (pattern matching)
        // Em producao, usar Redis com SCAN para patterns
        Cache::forget('company_segments');

        // Para invalidar todos os caches de listagem, seria necessário
        // implementar tags de cache (requer Redis) ou lista de chaves
    }
}
