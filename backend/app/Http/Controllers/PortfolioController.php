<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PortfolioController extends Controller
{
    /**
     * Listar itens do portfolio da empresa autenticada
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ter portfolio'], 403);
        }

        $portfolio = $user->companyProfile
            ->portfolioItems()
            ->ordered()
            ->with('service:id,titulo')
            ->get();

        return response()->json([
            'data' => $portfolio,
        ]);
    }

    /**
     * Criar novo item do portfolio
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ter portfolio'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'service_id' => 'nullable|exists:services,id',
            'featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company = $user->companyProfile;

        // Upload da imagem
        $imagePath = $request->file('image')->store("portfolio/{$company->id}", 'public');

        // Pegar proxima ordem
        $maxOrder = $company->portfolioItems()->max('order') ?? 0;

        $item = $company->portfolioItems()->create([
            'title' => $request->title,
            'description' => $request->description,
            'image_path' => $imagePath,
            'service_id' => $request->service_id,
            'featured' => $request->boolean('featured'),
            'order' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Item adicionado ao portfolio',
            'data' => $item->load('service:id,titulo'),
        ], 201);
    }

    /**
     * Atualizar item do portfolio
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ter portfolio'], 403);
        }

        $item = PortfolioItem::where('company_id', $user->companyProfile->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:5120',
            'service_id' => 'nullable|exists:services,id',
            'featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'description', 'service_id']);

        if ($request->has('featured')) {
            $data['featured'] = $request->boolean('featured');
        }

        // Nova imagem
        if ($request->hasFile('image')) {
            // Deletar imagem antiga
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }

            $data['image_path'] = $request->file('image')->store(
                "portfolio/{$user->companyProfile->id}",
                'public'
            );
        }

        $item->update($data);

        return response()->json([
            'message' => 'Item atualizado',
            'data' => $item->fresh()->load('service:id,titulo'),
        ]);
    }

    /**
     * Deletar item do portfolio
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ter portfolio'], 403);
        }

        $item = PortfolioItem::where('company_id', $user->companyProfile->id)
            ->findOrFail($id);

        // Deletar imagem
        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }

        $item->delete();

        return response()->json([
            'message' => 'Item removido do portfolio',
        ]);
    }

    /**
     * Reordenar itens do portfolio
     */
    public function reorder(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ter portfolio'], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|max:' . config('security.limits.max_reorder_items', 100),
            'items.*.id' => 'required|integer',
            'items.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $companyId = $user->companyProfile->id;

        foreach ($request->items as $itemData) {
            PortfolioItem::where('id', $itemData['id'])
                ->where('company_id', $companyId)
                ->update(['order' => $itemData['order']]);
        }

        return response()->json([
            'message' => 'Ordem atualizada',
        ]);
    }

    /**
     * Portfolio publico de uma empresa
     */
    public function public(int $companyId): JsonResponse
    {
        $portfolio = PortfolioItem::where('company_id', $companyId)
            ->ordered()
            ->with('service:id,titulo')
            ->get();

        return response()->json([
            'data' => $portfolio,
        ]);
    }

    /**
     * Itens destacados do portfolio
     */
    public function featured(int $companyId): JsonResponse
    {
        $portfolio = PortfolioItem::where('company_id', $companyId)
            ->featured()
            ->ordered()
            ->limit(6)
            ->get();

        return response()->json([
            'data' => $portfolio,
        ]);
    }
}
