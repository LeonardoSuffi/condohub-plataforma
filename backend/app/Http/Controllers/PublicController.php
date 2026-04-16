<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Service;
use App\Models\Banner;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /**
     * Lista categorias publicamente
     */
    public function categories()
    {
        $categories = Category::where('active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return $this->success($categories, 'Lista de categorias');
    }

    /**
     * Lista servicos publicamente (sem dados sensiveis)
     */
    public function services(Request $request)
    {
        $query = Service::with(['category:id,name,slug', 'company:id,nome_fantasia,cidade,estado'])
            ->where('status', 'ativo');

        // Filtro por categoria
        if ($request->category) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $categoryIds = [$category->id];
                // Incluir subcategorias
                $subcategories = Category::where('parent_id', $category->id)->pluck('id');
                $categoryIds = array_merge($categoryIds, $subcategories->toArray());
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Filtro por busca
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtro por regiao
        if ($request->region) {
            $query->where('region', 'like', "%{$request->region}%");
        }

        // Filtro por featured
        if ($request->featured) {
            $query->where('featured', true);
        }

        // Ordenacao
        $orderBy = $request->order_by ?? 'created_at';
        $orderDir = $request->order_dir ?? 'desc';

        if ($orderBy === 'featured') {
            $query->orderByDesc('featured')->orderByDesc('created_at');
        } else {
            $query->orderBy($orderBy, $orderDir);
        }

        $perPage = min($request->per_page ?? 12, 50);
        $services = $query->paginate($perPage);

        // Remover dados sensiveis da empresa
        $services->getCollection()->transform(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'region' => $service->region,
                'price_range' => $service->price_range,
                'featured' => $service->featured,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'slug' => $service->category->slug,
                ] : null,
                'company' => $service->company ? [
                    'nome_fantasia' => $service->company->nome_fantasia,
                    'cidade' => $service->company->cidade,
                    'estado' => $service->company->estado,
                ] : null,
            ];
        });

        return $this->success($services, 'Lista de servicos');
    }

    /**
     * Lista banners ativos
     */
    public function banners(Request $request)
    {
        $query = Banner::where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            })
            ->orderBy('order');

        if ($request->position) {
            $query->where('position', $request->position);
        }

        $banners = $query->get();

        // Incrementar views
        Banner::whereIn('id', $banners->pluck('id'))->increment('views');

        return $this->success($banners, 'Lista de banners');
    }

    /**
     * Estatisticas publicas da plataforma
     */
    public function stats()
    {
        $stats = [
            'total_services' => Service::where('status', 'ativo')->count(),
            'total_categories' => Category::where('active', true)->whereNull('parent_id')->count(),
        ];

        return $this->success($stats, 'Estatisticas da plataforma');
    }
}
