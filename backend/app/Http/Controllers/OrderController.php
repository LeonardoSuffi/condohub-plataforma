<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Lista ordens do usuário ou todas (admin)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with(['deal.service', 'deal.company', 'deal.client', 'approver', 'logs']);

        if ($user->isAdmin()) {
            // Admin vê todas as ordens
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        } elseif ($user->isEmpresa()) {
            $query->whereHas('deal', function ($q) use ($user) {
                $q->where('company_id', $user->companyProfile->id);
            });
        } elseif ($user->isCliente()) {
            $query->whereHas('deal', function ($q) use ($user) {
                $q->where('client_id', $user->clientProfile->id);
            });
        }

        $orders = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return $this->paginated($orders, 'Lista de ordens');
    }

    /**
     * Exibe detalhes de uma ordem
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::with(['deal.service', 'deal.company', 'deal.client', 'approver', 'logs', 'transactions'])
            ->findOrFail($id);

        // Verifica acesso
        if (!$this->canAccessOrder($user, $order)) {
            return $this->error('Acesso negado a esta ordem.', 403);
        }

        return $this->success($order, 'Detalhes da ordem');
    }

    /**
     * Atualiza status da ordem (apenas admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:aprovado,rejeitado,concluido',
            'notes' => 'nullable|string|max:500',
            'rejection_reason' => 'nullable|string|max:500',
            'value' => 'nullable|numeric|min:0', // Admin pode ajustar o valor
        ]);

        $order = Order::findOrFail($id);
        $user = $request->user();

        $result = $this->orderService->updateStatus(
            $order,
            $validated['status'],
            $user,
            $validated['notes'] ?? null,
            $validated['rejection_reason'] ?? null,
            $validated['value'] ?? null
        );

        if (!$result['success']) {
            return $this->error($result['message'], 400);
        }

        $order->refresh();
        $order->load(['deal.service', 'deal.company', 'deal.client', 'logs']);

        return $this->success($order, $result['message']);
    }

    /**
     * Verifica se usuário pode acessar a ordem
     */
    protected function canAccessOrder($user, Order $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $deal = $order->deal;

        if ($user->isEmpresa()) {
            return $deal->company_id === $user->companyProfile->id;
        }

        if ($user->isCliente()) {
            return $deal->client_id === $user->clientProfile->id;
        }

        return false;
    }
}
