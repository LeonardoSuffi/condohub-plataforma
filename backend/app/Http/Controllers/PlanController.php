<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Lista planos disponíveis
     */
    public function index()
    {
        $plans = Plan::active()
            ->ordered()
            ->get();

        return $this->success($plans, 'Lista de planos');
    }

    /**
     * Exibe detalhes de um plano
     */
    public function show($id)
    {
        $plan = Plan::findOrFail($id);

        return $this->success($plan, 'Detalhes do plano');
    }
}
