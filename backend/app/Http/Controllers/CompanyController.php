<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\Service;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Lista empresas públicamente (para diretório)
     */
    public function index(Request $request)
    {
        $query = CompanyProfile::where('verified', true)
            ->whereHas('services', function ($q) {
                $q->where('status', 'ativo');
            })
            ->withCount(['services' => function ($q) {
                $q->where('status', 'ativo');
            }])
            ->withCount(['deals' => function ($q) {
                $q->where('status', 'concluido');
            }]);

        // Filtro por segmento
        if ($request->segmento) {
            $query->where('segmento', $request->segmento);
        }

        // Filtro por cidade/estado
        if ($request->cidade) {
            $query->where('cidade', 'like', "%{$request->cidade}%");
        }

        if ($request->estado) {
            $query->where('estado', $request->estado);
        }

        // Busca por nome
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome_fantasia', 'like', "%{$search}%")
                  ->orWhere('razao_social', 'like', "%{$search}%")
                  ->orWhere('descricao', 'like', "%{$search}%");
            });
        }

        // Ordenação (whitelist para prevenir SQL injection)
        $allowedOrderBy = ['services', 'deals', 'nome_fantasia', 'created_at'];
        $orderBy = $request->order_by ?? 'deals';

        // Validar parâmetro de ordenação
        if (!in_array($orderBy, $allowedOrderBy)) {
            $orderBy = 'deals';
        }

        if ($orderBy === 'services') {
            $query->orderByDesc('services_count');
        } elseif ($orderBy === 'deals') {
            $query->orderByDesc('deals_completed_count');
        } elseif ($orderBy === 'created_at') {
            $query->orderByDesc('created_at');
        } else {
            $query->orderBy('nome_fantasia');
        }

        $perPage = min($request->per_page ?? 12, 50);
        $companies = $query->paginate($perPage);

        // Formata dados públicos
        $companies->getCollection()->transform(function ($company) {
            return [
                'id' => $company->id,
                'nome_fantasia' => $company->nome_fantasia,
                'segmento' => $company->segmento,
                'cidade' => $company->cidade,
                'estado' => $company->estado,
                'descricao' => $company->descricao,
                'logo_url' => $company->logo_path ? asset('storage/' . $company->logo_path) : null,
                'verified' => $company->verified,
                'services_count' => $company->services_count,
                'deals_completed_count' => $company->deals_completed_count,
            ];
        });

        return $this->success($companies, 'Lista de empresas');
    }

    /**
     * Exibe perfil público de uma empresa
     */
    public function show($id)
    {
        $company = CompanyProfile::where('verified', true)
            ->withCount(['services' => function ($q) {
                $q->where('status', 'ativo');
            }])
            ->withCount(['deals' => function ($q) {
                $q->where('status', 'concluido');
            }])
            ->findOrFail($id);

        // Serviços ativos da empresa
        $services = Service::where('company_id', $company->id)
            ->where('status', 'ativo')
            ->with(['category', 'images'])
            ->orderByDesc('featured')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(function ($service) {
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
                    'cover_image' => $service->images->where('is_cover', true)->first()?->url
                        ?? $service->images->first()?->url,
                    'images_count' => $service->images->count(),
                ];
            });

        $companyData = [
            'id' => $company->id,
            'nome_fantasia' => $company->nome_fantasia,
            'segmento' => $company->segmento,
            'cidade' => $company->cidade,
            'estado' => $company->estado,
            'descricao' => $company->descricao,
            'logo_url' => $company->logo_path ? asset('storage/' . $company->logo_path) : null,
            'verified' => $company->verified,
            'created_at' => $company->created_at,
            'services_count' => $company->services_count,
            'deals_completed_count' => $company->deals_completed_count,
            'services' => $services,
        ];

        return $this->success($companyData, 'Perfil da empresa');
    }

    /**
     * Lista segmentos disponíveis
     */
    public function segments()
    {
        $segments = CompanyProfile::where('verified', true)
            ->whereNotNull('segmento')
            ->distinct()
            ->pluck('segmento')
            ->filter()
            ->values();

        return $this->success($segments, 'Lista de segmentos');
    }
}
