<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Pagination\LengthAwarePaginator;

class ServiceService
{
    /**
     * Retorna serviços filtrados com paginação
     */
    public function getFilteredServices(array $filters): LengthAwarePaginator
    {
        $query = Service::query()
            ->active()
            ->with(['company', 'category', 'images']);

        // Filtro por categoria
        if (!empty($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        // Filtro por região
        if (!empty($filters['region'])) {
            $query->byRegion($filters['region']);
        }

        // Filtro por faixa de preço
        if (!empty($filters['price_min']) || !empty($filters['price_max'])) {
            $min = $filters['price_min'] ?? 0;
            $max = $filters['price_max'] ?? 999999999;
            $query->byPriceRange($min, $max);
        }

        // Busca por texto
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Filtro por destaque
        if (isset($filters['featured']) && $filters['featured']) {
            $query->featured();
        }

        // Ordenação: destaques primeiro, depois por data
        $query->orderByDesc('featured')
              ->orderByDesc('created_at');

        // Paginação
        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    /**
     * Busca serviços similares
     */
    public function getSimilarServices(Service $service, int $limit = 5)
    {
        return Service::query()
            ->active()
            ->where('id', '!=', $service->id)
            ->where(function ($q) use ($service) {
                $q->where('category_id', $service->category_id)
                  ->orWhere('region', 'like', "%{$service->region}%");
            })
            ->with(['company', 'images'])
            ->limit($limit)
            ->get();
    }
}
