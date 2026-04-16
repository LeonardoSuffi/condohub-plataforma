<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * Lista banners
     */
    public function index(Request $request)
    {
        $query = Banner::query();

        // Filtro por posição
        if ($request->has('position')) {
            $query->byPosition($request->position);
        }

        // Filtro por tipo
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtro por ativos
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $banners = $query->ordered()->paginate($request->get('per_page', 15));

        return $this->paginated($banners, 'Lista de banners');
    }

    /**
     * Cria novo banner
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'link' => 'nullable|url|max:500',
            'position' => 'required|in:topo,lateral,rodape,modal',
            'type' => 'required|in:comercial,admin,promocional',
            'order' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        // Upload da imagem
        $imagePath = $request->file('image')->store('banners', 'public');

        $banner = Banner::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath,
            'link' => $validated['link'] ?? null,
            'position' => $validated['position'],
            'type' => $validated['type'],
            'order' => $validated['order'] ?? 0,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'active' => true,
        ]);

        return $this->success($banner, 'Banner criado com sucesso', 201);
    }

    /**
     * Atualiza banner
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:500',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'link' => 'nullable|url|max:500',
            'position' => 'sometimes|in:topo,lateral,rodape,modal',
            'type' => 'sometimes|in:comercial,admin,promocional',
            'active' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        // Upload de nova imagem
        if ($request->hasFile('image')) {
            // Remove imagem antiga
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('banners', 'public');
        }

        unset($validated['image']);
        $banner->update($validated);

        return $this->success($banner, 'Banner atualizado com sucesso');
    }

    /**
     * Remove banner
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Remove imagem
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return $this->success(null, 'Banner removido com sucesso');
    }

    /**
     * Lista banners ativos para o frontend (público)
     */
    public function publicList(Request $request)
    {
        $position = $request->get('position');

        $query = Banner::active();

        if ($position) {
            $query->byPosition($position);
        }

        $banners = $query->ordered()->get();

        // Incrementa visualizações
        foreach ($banners as $banner) {
            $banner->incrementViews();
        }

        return $this->success($banners, 'Banners ativos');
    }

    /**
     * Registra clique no banner
     */
    public function registerClick($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->incrementClicks();

        return $this->success(['redirect' => $banner->link], 'Clique registrado');
    }
}
