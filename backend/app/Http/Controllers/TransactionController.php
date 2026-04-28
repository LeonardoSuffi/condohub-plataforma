<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\FinanceService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    /**
     * Lista transações do usuário
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Validacao de parametros com limites
        $validated = $request->validate([
            'type' => 'nullable|string|in:subscription,order,credit,debit,servico,assinatura,comissao',
            'status' => 'nullable|string|in:pending,completed,failed,cancelled',
            'start_date' => 'nullable|date|date_format:Y-m-d|after_or_equal:' . config('security.dates.min_filter_date', '2020-01-01'),
            'end_date' => 'nullable|date|date_format:Y-m-d|after_or_equal:start_date|before_or_equal:' . now()->addDays(config('security.dates.max_future_days', 365))->format('Y-m-d'),
            'per_page' => 'nullable|integer|min:1|max:' . config('security.pagination.max_per_page', 100),
        ]);

        $query = Transaction::where('user_id', $user->id)
            ->with(['order.deal.service', 'subscription.plan']);

        // Filtro por tipo
        if (!empty($validated['type'])) {
            $query->byType($validated['type']);
        }

        // Filtro por período
        if (!empty($validated['start_date']) && !empty($validated['end_date'])) {
            $query->inPeriod($validated['start_date'], $validated['end_date']);
        }

        // Filtro por status
        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $perPage = $validated['per_page'] ?? config('security.pagination.default_per_page', 15);
        $transactions = $query->orderByDesc('created_at')
            ->paginate($perPage);

        // Resumo financeiro
        $summary = $this->financeService->getUserSummary($user);

        return $this->success([
            'transactions' => $transactions->items(),
            'summary' => $summary,
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ], 'Transações do usuário');
    }

    /**
     * Exporta transações para CSV
     */
    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();

        $query = Transaction::where('user_id', $user->id)
            ->with(['order.deal.service', 'subscription.plan']);

        // Filtro por período
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->inPeriod($request->start_date, $request->end_date);
        }

        $transactions = $query->orderByDesc('created_at')->get();

        $filename = 'transacoes_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');

            // Cabeçalho
            fputcsv($handle, [
                'ID',
                'Data',
                'Tipo',
                'Descrição',
                'Valor Bruto',
                'Comissão',
                'Valor Líquido',
                'Status',
            ], ';');

            // Dados
            foreach ($transactions as $transaction) {
                $description = $this->getTransactionDescription($transaction);

                fputcsv($handle, [
                    $transaction->id,
                    $transaction->created_at->format('d/m/Y H:i'),
                    $transaction->getTypeLabel(),
                    $description,
                    number_format($transaction->amount, 2, ',', '.'),
                    number_format($transaction->commission, 2, ',', '.'),
                    number_format($transaction->net_amount, 2, ',', '.'),
                    $transaction->getStatusLabel(),
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Retorna descrição da transação
     */
    protected function getTransactionDescription(Transaction $transaction): string
    {
        if ($transaction->type === 'assinatura' && $transaction->subscription) {
            return 'Assinatura: ' . $transaction->subscription->plan->name;
        }

        if ($transaction->type === 'servico' && $transaction->order) {
            return 'Serviço: ' . ($transaction->order->deal->service->title ?? 'N/A');
        }

        if ($transaction->type === 'comissao') {
            return 'Comissão da plataforma';
        }

        return $transaction->type;
    }
}
