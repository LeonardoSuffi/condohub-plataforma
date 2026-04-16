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

        $query = Transaction::where('user_id', $user->id)
            ->with(['order.deal.service', 'subscription.plan']);

        // Filtro por tipo
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filtro por período
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->inPeriod($request->start_date, $request->end_date);
        }

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

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
