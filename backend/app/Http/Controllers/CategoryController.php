<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Lista todas as categorias ativas (hierarquia) - Publico
     */
    public function index(Request $request)
    {
        $categories = Category::active()
            ->parents()
            ->ordered()
            ->with(['children' => function ($query) {
                $query->active()->ordered();
            }])
            ->get();

        return $this->success($categories, 'Lista de categorias');
    }

    /**
     * Lista todas as categorias para admin (incluindo inativas)
     */
    public function adminIndex(Request $request)
    {
        $categories = Category::parents()
            ->ordered()
            ->with(['children' => function ($query) {
                $query->ordered();
            }])
            ->withCount('services')
            ->get();

        return $this->success($categories, 'Lista de categorias (admin)');
    }

    /**
     * Exibe uma categoria específica com seus serviços
     */
    public function show($id)
    {
        $category = Category::with(['children', 'services' => function ($query) {
            $query->active()->with('company');
        }])->findOrFail($id);

        return $this->success($category, 'Detalhes da categoria');
    }

    /**
     * Cria uma nova categoria (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
        ]);

        // Gera slug automaticamente
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;

        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $validated['slug'] = $slug;
        $validated['active'] = $validated['active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        $category = Category::create($validated);

        return $this->success(
            $category->load('parent'),
            'Categoria criada com sucesso',
            201
        );
    }

    /**
     * Atualiza uma categoria (Admin)
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                Rule::notIn([$id]), // Nao pode ser pai de si mesmo
            ],
            'icon' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
        ]);

        // Se mudou o nome, atualiza o slug
        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;

            while (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            $validated['slug'] = $slug;
        }

        // Evita criar hierarquia circular
        if (isset($validated['parent_id']) && $validated['parent_id']) {
            $parent = Category::find($validated['parent_id']);
            if ($parent && $parent->parent_id == $id) {
                return $this->error('Nao e possivel criar hierarquia circular', 422);
            }
        }

        $category->update($validated);

        return $this->success(
            $category->load(['parent', 'children']),
            'Categoria atualizada com sucesso'
        );
    }

    /**
     * Remove uma categoria (Admin)
     */
    public function destroy($id)
    {
        $category = Category::withCount(['services', 'children'])->findOrFail($id);

        // Verifica se tem servicos vinculados
        if ($category->services_count > 0) {
            return $this->error(
                "Nao e possivel excluir. Existem {$category->services_count} servico(s) vinculado(s) a esta categoria.",
                422
            );
        }

        // Verifica se tem subcategorias
        if ($category->children_count > 0) {
            return $this->error(
                "Nao e possivel excluir. Existem {$category->children_count} subcategoria(s) vinculada(s).",
                422
            );
        }

        $category->delete();

        return $this->success(null, 'Categoria excluida com sucesso');
    }

    /**
     * Reordena categorias (Admin)
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['categories'] as $item) {
            Category::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return $this->success(null, 'Ordem atualizada com sucesso');
    }
}
