<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Plan;
use App\Models\CompanyProfile;
use App\Models\ClientProfile;
use App\Models\Subscription;
use App\Models\Deal;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Review;
use App\Models\ActivityLog;
use App\Services\FinanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AdminController extends Controller
{
    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    /**
     * Lista usuários com filtros avançados
     */
    public function listUsers(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|string|in:admin,empresa,cliente',
            'status' => 'nullable|string|in:active,blocked,all',
            'verified' => 'nullable|boolean',
            'has_subscription' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
            'order_by' => 'nullable|string|in:created_at,name,email,last_login_at',
            'order_dir' => 'nullable|string|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'last_login' => 'nullable|string|in:today,week,month,inactive,never',
        ]);

        $query = User::with(['companyProfile', 'clientProfile', 'activeSubscription.plan']);

        // Filtro por status
        $status = $validated['status'] ?? 'active';
        if ($status === 'blocked') {
            $query->onlyTrashed();
        } elseif ($status === 'all') {
            $query->withTrashed();
        }

        // Filtro por tipo
        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        // Filtro por verificação (apenas empresas)
        if (isset($validated['verified'])) {
            $query->whereHas('companyProfile', function ($q) use ($validated) {
                $q->where('verified', $validated['verified']);
            });
        }

        // Filtro por assinatura
        if (isset($validated['has_subscription'])) {
            if ($validated['has_subscription']) {
                $query->whereHas('activeSubscription');
            } else {
                $query->whereDoesntHave('activeSubscription');
            }
        }

        // Filtro por data de cadastro
        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }
        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        // Filtro por último login
        if (!empty($validated['last_login'])) {
            switch ($validated['last_login']) {
                case 'today':
                    $query->whereDate('last_login_at', now()->toDateString());
                    break;
                case 'week':
                    $query->where('last_login_at', '>=', now()->subDays(7));
                    break;
                case 'month':
                    $query->where('last_login_at', '>=', now()->subDays(30));
                    break;
                case 'inactive':
                    $query->where(function ($q) {
                        $q->where('last_login_at', '<', now()->subDays(30))
                          ->orWhereNull('last_login_at');
                    });
                    break;
                case 'never':
                    $query->whereNull('last_login_at');
                    break;
            }
        }

        // Busca por nome, email ou documento
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('companyProfile', function ($q2) use ($search) {
                      $q2->where('cnpj', 'like', "%{$search}%")
                         ->orWhere('nome_fantasia', 'like', "%{$search}%");
                  })
                  ->orWhereHas('clientProfile', function ($q2) use ($search) {
                      $q2->where('cpf', 'like', "%{$search}%")
                         ->orWhere('nome_organizacao', 'like', "%{$search}%");
                  });
            });
        }

        // Ordenação
        $orderBy = $validated['order_by'] ?? 'created_at';
        $orderDir = $validated['order_dir'] ?? 'desc';
        $query->orderBy($orderBy, $orderDir);

        $users = $query->paginate($validated['per_page'] ?? 15);

        // Adiciona estatísticas ao response
        $stats = [
            'total' => User::count(),
            'empresas' => User::where('type', 'empresa')->count(),
            'clientes' => User::where('type', 'cliente')->count(),
            'admins' => User::where('type', 'admin')->count(),
            'bloqueados' => User::onlyTrashed()->count(),
            'verificados' => CompanyProfile::where('verified', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lista de usuários',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Exibe detalhes completos de um usuário
     */
    public function showUser($id)
    {
        $user = User::withTrashed()
            ->with([
                'companyProfile',
                'clientProfile',
                'activeSubscription.plan',
                'subscriptions.plan',
            ])
            ->findOrFail($id);

        // Estatísticas do usuário
        $stats = [];

        if ($user->isEmpresa()) {
            $stats = [
                'total_services' => Service::where('company_id', $user->companyProfile?->id)->count(),
                'active_services' => Service::where('company_id', $user->companyProfile?->id)->where('status', 'ativo')->count(),
                'total_deals' => Deal::where('company_id', $user->companyProfile?->id)->count(),
                'completed_deals' => Deal::where('company_id', $user->companyProfile?->id)->where('status', 'concluido')->count(),
            ];
        } elseif ($user->isCliente()) {
            $stats = [
                'total_deals' => Deal::where('client_id', $user->clientProfile?->id)->count(),
                'completed_deals' => Deal::where('client_id', $user->clientProfile?->id)->where('status', 'concluido')->count(),
            ];
        }

        return $this->success([
            'user' => $user,
            'stats' => $stats,
            'is_blocked' => $user->trashed(),
        ], 'Detalhes do usuário');
    }

    /**
     * Atualiza usuário completo
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $currentAdmin = auth()->user();

        // SEGURANCA: Nao pode modificar outros admins (exceto a si mesmo para dados basicos)
        if ($user->type === 'admin' && $user->id !== $currentAdmin->id) {
            return $this->error('Voce nao pode modificar outros administradores', 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($id)],
            'type' => 'sometimes|string|in:empresa,cliente', // SEGURANCA: Removido 'admin' - nao pode promover via API
            'active' => 'sometimes|boolean',
            'blocked' => 'sometimes|boolean',
            'blocked_reason' => 'nullable|string|max:500',
            // Campos do perfil de empresa
            'company' => 'sometimes|array',
            'company.nome_fantasia' => 'sometimes|string|max:255',
            'company.razao_social' => 'sometimes|string|max:255',
            'company.cnpj' => 'sometimes|string|max:18',
            'company.segmento' => 'sometimes|string|max:100',
            'company.telefone' => ['sometimes', 'string', 'max:20', 'regex:' . config('security.validation.phone_regex', '/^\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/')],
            'company.endereco' => 'sometimes|string|max:255',
            'company.cidade' => 'sometimes|string|max:100',
            'company.estado' => 'sometimes|string|size:2|in:' . implode(',', config('security.validation.estados', ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'])),
            'company.cep' => 'sometimes|string|max:10',
            'company.descricao' => 'sometimes|string|max:2000',
            'company.website' => 'sometimes|nullable|url|max:255',
            'company.verified' => 'sometimes|boolean',
            // Campos do perfil de cliente
            'client' => 'sometimes|array',
            'client.cpf' => 'sometimes|nullable|string|max:14',
            'client.cnpj' => 'sometimes|nullable|string|max:18',
            'client.tipo' => 'sometimes|string|in:pessoa_fisica,empresa,autonomo,condominio',
            'client.telefone' => ['sometimes', 'string', 'max:20', 'regex:' . config('security.validation.phone_regex', '/^\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/')],
            'client.nome_organizacao' => 'sometimes|string|max:255',
            'client.endereco_organizacao' => 'sometimes|string|max:255',
            'client.cidade' => 'sometimes|string|max:100',
            'client.estado' => 'sometimes|string|size:2|in:' . implode(',', config('security.validation.estados', ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'])),
            'client.cep' => 'sometimes|string|max:10',
            'client.num_funcionarios' => 'sometimes|integer|min:0',
        ]);

        // Guarda dados originais para log
        $originalData = $user->only(['name', 'email', 'type', 'is_blocked']);

        // SEGURANCA: Verifica impacto de mudanca de tipo antes de aplicar
        if (isset($validated['type']) && $validated['type'] !== $user->type) {
            // Verifica se usuario tem deals ativos ou subscriptions
            $hasActiveDeals = false;
            $hasActiveSubscription = $user->activeSubscription !== null;

            if ($user->isEmpresa() && $user->companyProfile) {
                $hasActiveDeals = \App\Models\Deal::where('company_id', $user->companyProfile->id)
                    ->whereIn('status', ['aberto', 'negociando'])
                    ->exists();
            } elseif ($user->isCliente() && $user->clientProfile) {
                $hasActiveDeals = \App\Models\Deal::where('client_id', $user->clientProfile->id)
                    ->whereIn('status', ['aberto', 'negociando'])
                    ->exists();
            }

            if ($hasActiveDeals || $hasActiveSubscription) {
                return $this->error(
                    'Nao e possivel alterar o tipo de usuario com negociacoes ativas ou assinatura vigente.',
                    422
                );
            }
        }

        // Atualiza dados básicos do usuário
        $userFields = ['name', 'email', 'type', 'active'];
        $userData = array_intersect_key($validated, array_flip($userFields));
        if (!empty($userData)) {
            $user->update($userData);
        }

        // Gerencia bloqueio
        if (isset($validated['blocked'])) {
            if ($validated['blocked']) {
                $user->update([
                    'is_blocked' => true,
                    'blocked_at' => now(),
                    'blocked_reason' => $validated['blocked_reason'] ?? 'Bloqueado pelo administrador',
                ]);
                $user->delete(); // Soft delete

                // Log de bloqueio
                ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_USER_BLOCK, $user, [
                    'target_user_id' => $user->id,
                    'target_user_email' => $user->email,
                    'reason' => $validated['blocked_reason'] ?? 'Bloqueado pelo administrador',
                ]);
            } else {
                $user->update([
                    'is_blocked' => false,
                    'blocked_at' => null,
                    'blocked_reason' => null,
                ]);
                $user->restore();

                // Log de desbloqueio
                ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_USER_UNBLOCK, $user, [
                    'target_user_id' => $user->id,
                    'target_user_email' => $user->email,
                ]);
            }
        }

        // Atualiza perfil de empresa
        if (!empty($validated['company']) && $user->companyProfile) {
            $user->companyProfile->update($validated['company']);
        }

        // Atualiza perfil de cliente
        if (!empty($validated['client']) && $user->clientProfile) {
            $user->clientProfile->update($validated['client']);
        }

        // Log de atualizacao
        ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_USER_UPDATE, $user, [
            'target_user_id' => $user->id,
            'target_user_email' => $user->email,
            'changes' => array_diff_assoc($user->only(['name', 'email', 'type', 'is_blocked']), $originalData),
        ]);

        $user->refresh();
        $user->load(['companyProfile', 'clientProfile', 'activeSubscription.plan']);

        return $this->success($user, 'Usuário atualizado com sucesso');
    }

    /**
     * Cria novo usuário (admin)
     * SEGURANCA: Nao permite criar usuarios admin via API
     */
    public function createUser(Request $request)
    {
        $currentAdmin = auth()->user();

        // SEGURANCA: Validacao de complexidade de senha igual ao registro
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:' . config('security.password.min_length', 8),
                'regex:' . config('security.password.complexity_regex', '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/'),
            ],
            'type' => 'required|string|in:empresa,cliente', // SEGURANCA: Removido 'admin'
            // Campos opcionais do perfil
            'company' => 'required_if:type,empresa|array',
            'company.cnpj' => 'required_if:type,empresa|string|max:18',
            'company.razao_social' => 'required_if:type,empresa|string|max:255',
            'company.nome_fantasia' => 'nullable|string|max:255',
            'company.segmento' => 'required_if:type,empresa|string|max:100',
            'client' => 'required_if:type,cliente|array',
            'client.tipo' => 'required_if:type,cliente|string|in:pessoa_fisica,empresa,autonomo,condominio',
        ], [
            'password.regex' => config('security.password.complexity_message', 'A senha deve conter pelo menos: 1 letra maiuscula, 1 minuscula, 1 numero e 1 caractere especial.'),
        ]);

        // Cria usuário
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => $validated['type'],
            'email_verified_at' => now(), // Admin criou, já verificado
        ]);

        // Cria perfil de empresa
        if ($validated['type'] === 'empresa' && !empty($validated['company'])) {
            CompanyProfile::create([
                'user_id' => $user->id,
                'cnpj' => $validated['company']['cnpj'],
                'razao_social' => $validated['company']['razao_social'],
                'nome_fantasia' => $validated['company']['nome_fantasia'] ?? null,
                'segmento' => $validated['company']['segmento'],
            ]);

            // Atribui plano gratuito
            $freePlan = Plan::where('slug', 'gratuito')->first();
            if ($freePlan) {
                Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $freePlan->id,
                    'status' => 'ativa',
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($freePlan->getDurationInDays()),
                ]);
            }
        }

        // Cria perfil de cliente
        if ($validated['type'] === 'cliente' && !empty($validated['client'])) {
            ClientProfile::create([
                'user_id' => $user->id,
                'tipo' => $validated['client']['tipo'],
            ]);
        }

        // Log de criacao
        ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_USER_CREATE, $user, [
            'created_user_id' => $user->id,
            'created_user_email' => $user->email,
            'created_user_type' => $user->type,
        ]);

        $user->load(['companyProfile', 'clientProfile', 'activeSubscription.plan']);

        return $this->success($user, 'Usuário criado com sucesso', 201);
    }

    /**
     * Reseta senha do usuário
     * SEGURANCA: Nao pode resetar senha de outros admins
     */
    public function resetUserPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = auth()->user();

        // SEGURANCA: Nao pode resetar senha de outros admins
        if ($user->type === 'admin' && $user->id !== $currentAdmin->id) {
            return $this->error('Voce nao pode resetar a senha de outros administradores', 403);
        }

        // SEGURANCA: Validacao de complexidade de senha igual ao registro
        $validated = $request->validate([
            'password' => [
                'required',
                'string',
                'min:' . config('security.password.min_length', 8),
                'regex:' . config('security.password.complexity_regex', '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/'),
            ],
            'revoke_sessions' => 'sometimes|boolean',
        ], [
            'password.regex' => config('security.password.complexity_message', 'A senha deve conter pelo menos: 1 letra maiuscula, 1 minuscula, 1 numero e 1 caractere especial.'),
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoga todas as sessões se solicitado (padrao: true)
        if ($validated['revoke_sessions'] ?? true) {
            $user->update(['current_session_id' => null]);
            $user->tokens()->delete();
        }

        // Log de reset de senha
        ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_PASSWORD_RESET, $user, [
            'target_user_id' => $user->id,
            'target_user_email' => $user->email,
            'sessions_revoked' => $validated['revoke_sessions'] ?? true,
        ]);

        return $this->success(null, 'Senha alterada com sucesso');
    }

    /**
     * Gerencia assinatura do usuário
     */
    public function manageSubscription(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = auth()->user();

        if (!$user->isEmpresa()) {
            return $this->error('Apenas empresas podem ter assinaturas', 400);
        }

        $validated = $request->validate([
            'action' => 'required|string|in:assign,cancel,extend',
            'plan_id' => 'required_if:action,assign|exists:plans,id',
            'days' => 'required_if:action,extend|integer|min:1|max:365',
        ]);

        $currentSub = $user->activeSubscription;

        switch ($validated['action']) {
            case 'assign':
                // Cancela assinatura atual se existir
                if ($currentSub) {
                    $currentSub->update(['status' => 'cancelada', 'ends_at' => now()]);
                }

                $plan = Plan::findOrFail($validated['plan_id']);

                // SEGURANCA: Verifica se o plano esta ativo
                if (!$plan->active) {
                    return $this->error('Este plano nao esta disponivel', 400);
                }

                $subscription = Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => 'ativa',
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($plan->getDurationInDays()),
                ]);

                // Log
                ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_SUBSCRIPTION_CHANGE, $user, [
                    'action' => 'assign',
                    'target_user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                ]);

                return $this->success($subscription->load('plan'), 'Plano atribuído com sucesso');

            case 'cancel':
                if (!$currentSub) {
                    return $this->error('Usuário não possui assinatura ativa', 400);
                }
                $currentSub->update(['status' => 'cancelada', 'ends_at' => now()]);

                // Log
                ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_SUBSCRIPTION_CHANGE, $user, [
                    'action' => 'cancel',
                    'target_user_id' => $user->id,
                    'previous_plan' => $currentSub->plan->name ?? 'N/A',
                ]);

                return $this->success(null, 'Assinatura cancelada');

            case 'extend':
                if (!$currentSub) {
                    return $this->error('Usuário não possui assinatura ativa', 400);
                }
                $oldEndDate = $currentSub->ends_at;
                $newEndDate = $currentSub->ends_at->addDays($validated['days']);
                $currentSub->update(['ends_at' => $newEndDate]);

                // Log
                ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_SUBSCRIPTION_CHANGE, $user, [
                    'action' => 'extend',
                    'target_user_id' => $user->id,
                    'days_added' => $validated['days'],
                    'old_end_date' => $oldEndDate->toDateString(),
                    'new_end_date' => $newEndDate->toDateString(),
                ]);

                return $this->success($currentSub->fresh(), "Assinatura estendida até {$newEndDate->format('d/m/Y')}");
        }
    }

    /**
     * Qualifica empresa como verificada
     */
    public function verifyCompany(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = auth()->user();

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

        // Log
        ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_COMPANY_VERIFY, $user, [
            'target_user_id' => $user->id,
            'company_name' => $profile->nome_fantasia ?? $profile->razao_social,
            'verified' => $validated['verified'],
        ]);

        return $this->success(
            $profile->fresh(),
            $validated['verified'] ? 'Empresa verificada com sucesso.' : 'Verificação removida.'
        );
    }

    /**
     * Exclui usuário permanentemente
     * SEGURANCA: Nao pode excluir outros admins
     */
    public function deleteUser($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $currentAdmin = auth()->user();

        // Verifica se é o próprio admin tentando se deletar
        if ($user->id === $currentAdmin->id) {
            return $this->error('Você não pode excluir sua própria conta', 400);
        }

        // SEGURANCA: Nao pode excluir outros admins
        if ($user->type === 'admin') {
            return $this->error('Voce nao pode excluir outros administradores', 403);
        }

        // Guarda dados para log antes de deletar
        $userData = [
            'deleted_user_id' => $user->id,
            'deleted_user_email' => $user->email,
            'deleted_user_name' => $user->name,
            'deleted_user_type' => $user->type,
        ];

        // Deleta tokens
        $user->tokens()->delete();

        // Deleta perfis relacionados
        if ($user->companyProfile) {
            $user->companyProfile->forceDelete(); // Hard delete para consistencia
        }
        if ($user->clientProfile) {
            $user->clientProfile->forceDelete();
        }

        // Deleta permanentemente
        $user->forceDelete();

        // Log de exclusao
        ActivityLog::log($currentAdmin, ActivityLog::ACTION_ADMIN_USER_DELETE, null, $userData);

        return $this->success(null, 'Usuário excluído permanentemente');
    }

    /**
     * Envia email de verificação
     */
    public function sendVerificationEmail($id)
    {
        $user = User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return $this->error('Email já verificado', 400);
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Email de verificação enviado');
    }

    /**
     * Verifica email manualmente
     */
    public function verifyEmail($id)
    {
        $user = User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return $this->error('Email já verificado', 400);
        }

        $user->markEmailAsVerified();

        return $this->success(null, 'Email verificado com sucesso');
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
        // Validar parâmetros de data com limites
        $validated = $request->validate([
            'start_date' => 'nullable|date|date_format:Y-m-d|after_or_equal:' . config('security.dates.min_filter_date', '2020-01-01'),
            'end_date' => 'nullable|date|date_format:Y-m-d|after_or_equal:start_date|before_or_equal:' . now()->addDays(config('security.dates.max_future_days', 365))->format('Y-m-d'),
        ]);

        $startDate = $validated['start_date'] ?? null;
        $endDate = $validated['end_date'] ?? null;

        $overview = $this->financeService->getAdminOverview($startDate, $endDate);

        return $this->success($overview, 'Visão financeira');
    }

    /**
     * Lista todas as transações (admin)
     */
    public function listTransactions(Request $request)
    {
        // Validar parâmetros
        $validated = $request->validate([
            'type' => 'nullable|string|in:subscription,order,credit,debit',
            'status' => 'nullable|string|in:pending,completed,failed,cancelled',
            'dateFrom' => 'nullable|date|date_format:Y-m-d',
            'dateTo' => 'nullable|date|date_format:Y-m-d|after_or_equal:dateFrom',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = \App\Models\Transaction::with(['user', 'order.deal.service', 'subscription.plan']);

        // Filtro por tipo
        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        // Filtro por período
        if (!empty($validated['dateFrom'])) {
            $query->whereDate('created_at', '>=', $validated['dateFrom']);
        }
        if (!empty($validated['dateTo'])) {
            $query->whereDate('created_at', '<=', $validated['dateTo']);
        }

        // Filtro por status
        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $transactions = $query->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return $this->paginated($transactions, 'Lista de transações');
    }

    /**
     * Exporta usuários para CSV
     */
    public function exportUsers(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|string|in:admin,empresa,cliente',
            'status' => 'nullable|string|in:active,blocked,all',
            'verified' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
            'format' => 'nullable|string|in:csv,json',
        ]);

        $query = User::with(['companyProfile', 'clientProfile', 'activeSubscription.plan']);

        // Filtro por status
        $status = $validated['status'] ?? 'all';
        if ($status === 'blocked') {
            $query->onlyTrashed();
        } elseif ($status === 'all') {
            $query->withTrashed();
        }

        // Filtro por tipo
        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        // Filtro por verificação
        if (isset($validated['verified'])) {
            $query->whereHas('companyProfile', function ($q) use ($validated) {
                $q->where('verified', $validated['verified']);
            });
        }

        // Busca
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();
        $format = $validated['format'] ?? 'csv';

        if ($format === 'json') {
            return response()->json($users)
                ->header('Content-Type', 'application/json; charset=UTF-8');
        }

        // Gerar CSV
        $headers = [
            'ID',
            'Nome',
            'Email',
            'Tipo',
            'Status',
            'Email Verificado',
            'Empresa Verificada',
            'CNPJ/CPF',
            'Telefone',
            'Cidade',
            'Estado',
            'Plano Ativo',
            'Ultimo Login',
            'Criado em'
        ];

        $callback = function () use ($users, $headers) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM UTF-8

            fputcsv($file, $headers);

            foreach ($users as $user) {
                $row = [
                    $user->id,
                    $user->name,
                    $user->email,
                    ucfirst($user->type),
                    $user->deleted_at ? 'Bloqueado' : 'Ativo',
                    $user->email_verified_at ? 'Sim' : 'Não',
                    $user->companyProfile?->verified ? 'Sim' : '-',
                    $user->companyProfile?->cnpj ?? $user->clientProfile?->cpf ?? '-',
                    $user->companyProfile?->telefone ?? $user->clientProfile?->telefone ?? '-',
                    $user->companyProfile?->cidade ?? $user->clientProfile?->cidade ?? '-',
                    $user->companyProfile?->estado ?? $user->clientProfile?->estado ?? '-',
                    $user->activeSubscription?->plan?->name ?? '-',
                    $user->last_login_at ? $user->last_login_at->format('d/m/Y H:i') : 'Nunca',
                    $user->created_at->format('d/m/Y H:i'),
                ];
                fputcsv($file, $row);
            }

            fclose($file);
        };

        $filename = 'usuarios_' . now()->format('Y-m-d_His') . '.csv';

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Analytics completo para dashboard admin
     */
    public function analytics(Request $request)
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:7,30,90,180,365',
        ]);

        $days = (int) ($validated['period'] ?? 30);
        $startDate = now()->subDays($days)->startOfDay();
        $endDate = now()->endOfDay();

        // Revenue timeline (diário)
        $revenueTimeline = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(CASE WHEN type = "comissao" THEN commission ELSE 0 END) as commissions'),
            DB::raw('SUM(CASE WHEN type = "assinatura" THEN amount ELSE 0 END) as subscriptions')
        )
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('d/m'),
                'commissions' => (float) $item->commissions,
                'subscriptions' => (float) $item->subscriptions,
                'total' => (float) $item->commissions + (float) $item->subscriptions,
            ]);

        // User growth timeline
        $userGrowth = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total'),
            DB::raw('SUM(CASE WHEN type = "empresa" THEN 1 ELSE 0 END) as empresas'),
            DB::raw('SUM(CASE WHEN type = "cliente" THEN 1 ELSE 0 END) as clientes')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('d/m'),
                'total' => (int) $item->total,
                'empresas' => (int) $item->empresas,
                'clientes' => (int) $item->clientes,
            ]);

        // Deal distribution by status
        $dealDistribution = Deal::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => $this->translateDealStatus($item->status),
                'value' => (int) $item->count,
                'status' => $item->status,
            ]);

        // Top categories by deals
        $topCategories = Category::select('categories.id', 'categories.name')
            ->leftJoin('services', 'categories.id', '=', 'services.category_id')
            ->leftJoin('deals', 'services.id', '=', 'deals.service_id')
            ->groupBy('categories.id', 'categories.name')
            ->selectRaw('COUNT(deals.id) as deal_count')
            ->orderByDesc('deal_count')
            ->limit(8)
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'deals' => (int) $item->deal_count,
            ]);

        // Deals timeline
        $dealsTimeline = Deal::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total'),
            DB::raw('SUM(CASE WHEN status = "concluido" THEN 1 ELSE 0 END) as concluidos')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('d/m'),
                'total' => (int) $item->total,
                'concluidos' => (int) $item->concluidos,
            ]);

        // Recent activities
        $recentActivities = collect();

        // Recent users
        $recentUsers = User::with(['companyProfile', 'clientProfile'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($user) => [
                'type' => 'user',
                'icon' => 'user',
                'title' => 'Novo usuário registrado',
                'description' => $user->name . ' (' . ucfirst($user->type) . ')',
                'time' => $user->created_at->diffForHumans(),
                'created_at' => $user->created_at,
            ]);

        // Recent deals
        $recentDeals = Deal::with(['service', 'client.user', 'company.user'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($deal) => [
                'type' => 'deal',
                'icon' => 'handshake',
                'title' => 'Nova negociação',
                'description' => ($deal->service->title ?? 'Serviço') . ' - ' . ($deal->client->user->name ?? 'Cliente'),
                'time' => $deal->created_at->diffForHumans(),
                'created_at' => $deal->created_at,
            ]);

        // Recent transactions
        $recentTransactions = Transaction::with('user')
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($tx) => [
                'type' => 'transaction',
                'icon' => 'dollar',
                'title' => $this->translateTransactionType($tx->type),
                'description' => 'R$ ' . number_format($tx->amount, 2, ',', '.'),
                'time' => $tx->created_at->diffForHumans(),
                'created_at' => $tx->created_at,
            ]);

        $recentActivities = $recentUsers->concat($recentDeals)->concat($recentTransactions)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        // Summary stats
        $summaryStats = [
            'users' => [
                'total' => User::count(),
                'empresas' => User::where('type', 'empresa')->count(),
                'clientes' => User::where('type', 'cliente')->count(),
                'new_period' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                'active_today' => User::whereDate('last_login_at', today())->count(),
            ],
            'deals' => [
                'total' => Deal::count(),
                'period' => Deal::whereBetween('created_at', [$startDate, $endDate])->count(),
                'completed' => Deal::where('status', 'concluido')->count(),
                'conversion_rate' => Deal::count() > 0
                    ? round((Deal::where('status', 'concluido')->count() / Deal::count()) * 100, 1)
                    : 0,
            ],
            'revenue' => [
                'total' => Transaction::where('status', 'completed')->sum('amount'),
                'period' => Transaction::where('status', 'completed')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('amount'),
                'commissions' => Transaction::where('status', 'completed')
                    ->where('type', 'comissao')
                    ->sum('commission'),
                'subscriptions' => Transaction::where('status', 'completed')
                    ->where('type', 'assinatura')
                    ->sum('amount'),
            ],
            'services' => [
                'total' => Service::count(),
                'active' => Service::where('status', 'ativo')->count(),
            ],
            'reviews' => [
                'total' => Review::count(),
                'average' => round(Review::avg('rating') ?? 0, 1),
            ],
            'subscriptions' => [
                'active' => Subscription::where('status', 'ativa')->count(),
                'expiring_soon' => Subscription::where('status', 'ativa')
                    ->whereBetween('ends_at', [now(), now()->addDays(7)])
                    ->count(),
            ],
            'companies' => [
                'verified' => CompanyProfile::where('verified', true)->count(),
                'unverified' => CompanyProfile::where('verified', false)->count(),
            ],
        ];

        // Platform health indicators
        $healthIndicators = [
            [
                'name' => 'Uptime',
                'value' => '99.9%',
                'status' => 'healthy',
            ],
            [
                'name' => 'Taxa de Conversão',
                'value' => $summaryStats['deals']['conversion_rate'] . '%',
                'status' => $summaryStats['deals']['conversion_rate'] >= 20 ? 'healthy' : ($summaryStats['deals']['conversion_rate'] >= 10 ? 'warning' : 'critical'),
            ],
            [
                'name' => 'Empresas Verificadas',
                'value' => $summaryStats['companies']['verified'],
                'status' => 'healthy',
            ],
            [
                'name' => 'Usuários Ativos Hoje',
                'value' => $summaryStats['users']['active_today'],
                'status' => $summaryStats['users']['active_today'] > 0 ? 'healthy' : 'warning',
            ],
        ];

        return $this->success([
            'period' => [
                'days' => $days,
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'charts' => [
                'revenue_timeline' => $revenueTimeline,
                'user_growth' => $userGrowth,
                'deal_distribution' => $dealDistribution,
                'top_categories' => $topCategories,
                'deals_timeline' => $dealsTimeline,
            ],
            'summary' => $summaryStats,
            'recent_activities' => $recentActivities,
            'health' => $healthIndicators,
        ], 'Analytics do dashboard');
    }

    private function translateDealStatus(string $status): string
    {
        return match ($status) {
            'aberto' => 'Abertas',
            'negociando' => 'Em Negociação',
            'concluido' => 'Concluídas',
            'rejeitado' => 'Rejeitadas',
            'cancelado' => 'Canceladas',
            default => ucfirst($status),
        };
    }

    private function translateTransactionType(string $type): string
    {
        return match ($type) {
            'servico' => 'Pagamento de Serviço',
            'comissao' => 'Comissão Recebida',
            'assinatura' => 'Assinatura de Plano',
            default => ucfirst($type),
        };
    }
}
