<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Lista todas as categorias ativas (hierarquia)
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
     * Exibe uma categoria específica com seus serviços
     */
    public function show($id)
    {
        $category = Category::with(['children', 'services' => function ($query) {
            $query->active()->with('company');
        }])->findOrFail($id);

        return $this->success($category, 'Detalhes da categoria');
    }
}
