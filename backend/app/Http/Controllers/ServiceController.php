<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceImage;
use App\Services\ServiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        $service = Service::with(['company.user', 'category', 'images'])
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
            'cidade' => $service->company->cidade,
            'estado' => $service->company->estado,
            'logo_url' => $service->company->logo_url,
            'verified' => $service->company->verified,
            'services_count' => $service->company->services()->active()->count(),
            'deals_completed' => $service->company->deals()->where('status', 'concluido')->count(),
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
            ->with(['category', 'images'])
            ->withCount('deals')
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

    /**
     * Upload de imagens para um serviço
     */
    public function uploadImages(Request $request, $id)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        $request->validate([
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $uploaded = [];
        $currentCount = $service->images()->count();
        $maxImages = 10;

        if ($currentCount >= $maxImages) {
            return $this->error('Limite máximo de imagens atingido (10)', 422);
        }

        $availableSlots = $maxImages - $currentCount;
        $imagesToUpload = array_slice($request->file('images'), 0, $availableSlots);

        foreach ($imagesToUpload as $index => $image) {
            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('services/' . $service->id, $filename, 'public');

            $serviceImage = ServiceImage::create([
                'service_id' => $service->id,
                'path' => $path,
                'filename' => $filename,
                'original_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
                'order' => $currentCount + $index,
                'is_cover' => $currentCount === 0 && $index === 0,
            ]);

            $uploaded[] = $serviceImage;
        }

        return $this->success($uploaded, count($uploaded) . ' imagem(ns) enviada(s) com sucesso', 201);
    }

    /**
     * Remove uma imagem do serviço
     */
    public function deleteImage(Request $request, $id, $imageId)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        $image = $service->images()->findOrFail($imageId);
        $wasCover = $image->is_cover;

        $image->delete();

        // Se era a capa, define a primeira imagem restante como capa
        if ($wasCover) {
            $firstImage = $service->images()->first();
            if ($firstImage) {
                $firstImage->update(['is_cover' => true]);
            }
        }

        return $this->success(null, 'Imagem removida com sucesso');
    }

    /**
     * Define uma imagem como capa do serviço
     */
    public function setCoverImage(Request $request, $id, $imageId)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        // Remove capa atual
        $service->images()->update(['is_cover' => false]);

        // Define nova capa
        $image = $service->images()->findOrFail($imageId);
        $image->update(['is_cover' => true]);

        return $this->success($image, 'Imagem de capa atualizada');
    }

    /**
     * Reordena as imagens do serviço
     */
    public function reorderImages(Request $request, $id)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        $request->validate([
            'order' => 'required|array',
            'order.*' => 'required|integer|exists:service_images,id',
        ]);

        foreach ($request->order as $position => $imageId) {
            ServiceImage::where('id', $imageId)
                ->where('service_id', $service->id)
                ->update(['order' => $position]);
        }

        return $this->success(
            $service->images()->ordered()->get(),
            'Ordem das imagens atualizada'
        );
    }

    /**
     * Atualiza legenda de uma imagem
     */
    public function updateImageCaption(Request $request, $id, $imageId)
    {
        $service = Service::where('company_id', $request->user()->companyProfile->id)
            ->findOrFail($id);

        $request->validate([
            'caption' => 'nullable|string|max:255',
        ]);

        $image = $service->images()->findOrFail($imageId);
        $image->update(['caption' => $request->caption]);

        return $this->success($image, 'Legenda atualizada');
    }
}
