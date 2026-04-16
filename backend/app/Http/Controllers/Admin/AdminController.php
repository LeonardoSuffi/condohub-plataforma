<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Plan;
use App\Models\CompanyProfile;
use App\Services\FinanceService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    /**
     * Lista usuários com filtros
     */
    public function listUsers(Request $request)
    {
        $query = User::with(['companyProfile', 'clientProfile', 'activeSubscription.plan']);

        // Filtro por tipo
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtro por status (bloqueado = soft deleted)
        if ($request->has('blocked') && $request->blocked) {
            $query->onlyTrashed();
        }

        // Busca por nome ou email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return $this->paginated($users, 'Lista de usuários');
    }

    /**
     * Atualiza usuário (bloquear/desbloquear)
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'blocked' => 'sometimes|boolean',
        ]);

        if (isset($validated['blocked'])) {
            if ($validated['blocked']) {
                $user->delete(); // Soft delete
            } else {
                $user->restore();
            }
        }

        return $this->success($user->fresh(), 'Usuário atualizado');
    }

    /**
     * Qualifica empresa como verificada
     */
    public function verifyCompany(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (!$user->isEmpresa()) {
            return $this->error('Usuário não é uma empresa.', 400);
        }

        $profile = $user->companyProfile;
        if (!$profile) {
            return $this->error('Perfil de empresa não encontrado.', 404);
        }

        $validated = $request->validate([
            'verified' => 'required|boolean',
        ]);

        $profile->update(['verified' => $validated['verified']]);

        return $this->success(
            $profile->fresh(),
            $validated['verified'] ? 'Empresa verificada com sucesso.' : 'Verificação removida.'
        );
    }

    /**
     * Lista planos
     */
    public function listPlans()
    {
        $plans = Plan::orderBy('priority')->get();

        return $this->success($plans, 'Lista de planos');
    }

    /**
     * Cria novo plano
     */
    public function storePlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:mensal,trimestral,semestral,anual',
            'features' => 'required|array',
            'max_interactions' => 'required|integer|min:1',
            'max_services' => 'required|integer|min:1',
            'ranking_enabled' => 'required|boolean',
            'featured_enabled' => 'required|boolean',
            'priority' => 'required|integer|min:0',
        ]);

        $plan = Plan::create($validated);

        return $this->success($plan, 'Plano criado com sucesso', 201);
    }

    /**
     * Atualiza plano
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'billing_cycle' => 'sometimes|in:mensal,trimestral,semestral,anual',
            'features' => 'sometimes|array',
            'max_interactions' => 'sometimes|integer|min:1',
            'max_services' => 'sometimes|integer|min:1',
            'ranking_enabled' => 'sometimes|boolean',
            'featured_enabled' => 'sometimes|boolean',
            'priority' => 'sometimes|integer|min:0',
            'active' => 'sometimes|boolean',
        ]);

        $plan->update($validated);

        return $this->success($plan, 'Plano atualizado com sucesso');
    }

    /**
     * Visão financeira consolidada
     */
    public function financeOverview(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $overview = $this->financeService->getAdminOverview($startDate, $endDate);

        return $this->success($overview, 'Visão financeira');
    }

    /**
     * Lista todas as transações (admin)
     */
    public function listTransactions(Request $request)
    {
        $query = \App\Models\Transaction::with(['user', 'order.deal.service', 'subscription.plan']);

        // Filtro por tipo
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filtro por período
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->whereDate('created_at', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->whereDate('created_at', '<=', $request->dateTo);
        }

        // Filtro por status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $transactions = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($transactions, 'Lista de transações');
    }
}
