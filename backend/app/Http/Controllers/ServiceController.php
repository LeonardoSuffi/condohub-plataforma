<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Services\ServiceService;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    protected ServiceService $serviceService;

    public function __construct(ServiceService $serviceService)
    {
        $this->serviceService = $serviceService;
    }

    /**
     * Lista serviços com filtros (catálogo para clientes)
     */
    public function index(Request $request)
    {
        $filters = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'region' => 'nullable|string|max:100',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'search' => 'nullable|string|max:100',
            'featured' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $services = $this->serviceService->getFilteredServices($filters);

        return $this->paginated($services, 'Lista de serviços');
    }

    /**
     * Exibe detalhes de um serviço
     */
    public function show($id)
    {
        $service = Service::with(['company.user', 'category'])
            ->active()
            ->findOrFail($id);

        // Incrementa contador de visualizações
        $service->incrementViews();

        // Remove dados sensíveis da empresa para clientes
        $serviceData = $service->toArray();
        $serviceData['company'] = [
            'id' => $service->company->id,
            'nome_fantasia' => $service->company->display_name,
            'segmento' => $service->company->segmento,
            'verified' => $service->company->verified,
        ];

        return $this->success($serviceData, 'Detalhes do serviço');
    }

    /**
     * Lista serviços da empresa autenticada
     */
    public function myServices(Request $request)
    {
        $companyId = $request->user()->companyProfile->id;

        $services = Service::where('company_id', $companyId)
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->paginated($services, 'Meus serviços');
    }

    /**
     * Cria um novo serviço
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'region' => 'required|string|max:100',
            'price_range' => 'required|string|max:50',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $company = $request->user()->companyProfile;
        $plan = $request->get('plan');

        // Verifica limite de serviços do plano
        $currentCount = $company->services()->count();
        if ($plan && $currentCount >= $plan->max_services) {
            return $this->error(
                'Você atingiu o limite de serviços do seu plano.',
                403
            );
        }

        $service = Service::create([
            'company_id' => $company->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'region' => $validated['region'],
            'price_range' => $validated['price_range'],
            'tags' => $validated['tags'] ?? [],
            'status' => 'ativo',
        ]);

        return $this->success($service->load('category'), 'Serviço criado com sucesso', 201);
    }

    /**
     * Atualiza um serviço
     */
    public function update(Request $request, $id)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:2000',
            'region' => 'sometimes|string|max:100',
            'price_range' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:ativo,inativo',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $service->update($validated);

        return $this->success($service->load('category'), 'Serviço atualizado com sucesso');
    }

    /**
     * Remove um serviço (soft delete)
     */
    public function destroy(Request $request, $id)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        $service->delete();

        return $this->success(null, 'Serviço removido com sucesso');
    }
}
