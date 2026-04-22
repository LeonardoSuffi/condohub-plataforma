<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Service;
use App\Services\DealService;
use Illuminate\Http\Request;

class DealController extends Controller
{
    protected DealService $dealService;

    public function __construct(DealService $dealService)
    {
        $this->dealService = $dealService;
    }

    /**
     * Lista deals do usuário autenticado
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Deal::with(['service', 'company', 'client', 'order']);

        if ($user->isEmpresa()) {
            $query->where('company_id', $user->companyProfile->id);
        } elseif ($user->isCliente()) {
            $query->where('client_id', $user->clientProfile->id);
        }

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $deals = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        // Aplica anonimização nos dados
        $deals->getCollection()->transform(function ($deal) use ($user) {
            return $this->dealService->formatDealForUser($deal, $user);
        });

        return $this->paginated($deals, 'Lista de negociações');
    }

    /**
     * Exibe detalhes de um deal
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $deal = Deal::with(['service', 'company', 'client', 'messages', 'order'])
            ->findOrFail($id);

        // Verifica se o usuário tem acesso a este deal
        if (!$deal->belongsToUser($user)) {
            return $this->error('Acesso negado a esta negociação.', 403);
        }

        return $this->success(
            $this->dealService->formatDealForUser($deal, $user),
            'Detalhes da negociação'
        );
    }

    /**
     * Cria uma nova negociação (cliente demonstra interesse)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'mensagem_inicial' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $service = Service::active()->findOrFail($validated['service_id']);

        // Verifica se já existe deal aberto para este serviço
        $existingDeal = Deal::where('client_id', $user->clientProfile->id)
            ->where('service_id', $service->id)
            ->whereIn('status', ['aberto', 'negociando'])
            ->first();

        if ($existingDeal) {
            return $this->error(
                'Você já possui uma negociação em andamento para este serviço.',
                400
            );
        }

        // Cria o deal
        $deal = $this->dealService->createDeal(
            $user->clientProfile,
            $service,
            $validated['mensagem_inicial'] ?? null
        );

        return $this->success(
            $this->dealService->formatDealForUser($deal->load(['service', 'company']), $user),
            'Negociação iniciada com sucesso',
            201
        );
    }

    /**
     * Atualiza status do deal (aceitar/rejeitar/cancelar/arquivar)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:negociando,aceito,rejeitado,concluido,cancelado,arquivado',
        ]);

        $user = $request->user();
        $deal = Deal::findOrFail($id);

        // Verifica permissão
        if (!$deal->belongsToUser($user)) {
            return $this->error('Acesso negado a esta negociação.', 403);
        }

        // Validações de transição de status
        $newStatus = $validated['status'];
        $result = $this->dealService->updateStatus($deal, $newStatus, $user);

        if (!$result['success']) {
            return $this->error($result['message'], 400);
        }

        $deal->refresh();
        $deal->load(['service', 'company', 'client', 'order']);

        return $this->success(
            $this->dealService->formatDealForUser($deal, $user),
            $result['message']
        );
    }
}
