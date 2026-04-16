<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Order;
use Carbon\Carbon;

class FinanceService
{
    /**
     * Taxa de comissão padrão (10%)
     */
    const COMMISSION_RATE = 0.10;

    /**
     * Calcula comissão sobre um valor
     */
    public function calculateCommission(float $value): array
    {
        $commission = $value * self::COMMISSION_RATE;
        $netAmount = $value - $commission;

        return [
            'gross' => $value,
            'commission' => $commission,
            'net' => $netAmount,
            'rate' => self::COMMISSION_RATE,
        ];
    }

    /**
     * Retorna resumo financeiro do usuário
     */
    public function getUserSummary(User $user): array
    {
        $transactions = Transaction::where('user_id', $user->id)
            ->completed()
            ->get();

        $totalReceived = $transactions->where('type', 'servico')->sum('amount');
        $totalCommissions = $transactions->where('type', 'comissao')->sum('commission');
        $totalSubscriptions = $transactions->where('type', 'assinatura')->sum('amount');

        // Mês atual
        $currentMonth = Transaction::where('user_id', $user->id)
            ->completed()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->get();

        $monthlyReceived = $currentMonth->where('type', 'servico')->sum('amount');
        $monthlyCommissions = $currentMonth->where('type', 'comissao')->sum('commission');

        return [
            'total' => [
                'received' => $totalReceived,
                'commissions_paid' => $totalCommissions,
                'subscriptions_paid' => $totalSubscriptions,
            ],
            'current_month' => [
                'received' => $monthlyReceived,
                'commissions_paid' => $monthlyCommissions,
            ],
            'pending' => Transaction::where('user_id', $user->id)
                ->pending()
                ->sum('amount'),
        ];
    }

    /**
     * Retorna visão consolidada para admin
     */
    public function getAdminOverview(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? Carbon::parse($startDate) : now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate) : now()->endOfMonth();

        $transactions = Transaction::inPeriod($start, $end)->completed()->get();

        // Total de serviços
        $services = $transactions->where('type', 'servico');
        $totalServices = $services->sum('amount');
        $totalCommissions = $transactions->where('type', 'comissao')->sum('commission');

        // Assinaturas
        $subscriptions = $transactions->where('type', 'assinatura');
        $totalSubscriptions = $subscriptions->sum('amount');

        // Ordens por status
        $orders = Order::whereBetween('created_at', [$start, $end])->get();

        return [
            'period' => [
                'start' => $start->format('Y-m-d'),
                'end' => $end->format('Y-m-d'),
            ],
            'services' => [
                'total_value' => $totalServices,
                'commissions_earned' => $totalCommissions,
                'count' => $services->count(),
            ],
            'subscriptions' => [
                'total_value' => $totalSubscriptions,
                'count' => $subscriptions->count(),
            ],
            'orders' => [
                'total' => $orders->count(),
                'pending' => $orders->where('status', 'pendente')->count(),
                'approved' => $orders->where('status', 'aprovado')->count(),
                'completed' => $orders->where('status', 'concluido')->count(),
                'rejected' => $orders->where('status', 'rejeitado')->count(),
            ],
            'revenue' => [
                'total' => $totalCommissions + $totalSubscriptions,
                'from_commissions' => $totalCommissions,
                'from_subscriptions' => $totalSubscriptions,
            ],
        ];
    }

    /**
     * Gera relatório por período
     */
    public function generateReport(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // Agrupa transações por dia
        $dailyData = Transaction::inPeriod($start, $end)
            ->completed()
            ->selectRaw('DATE(created_at) as date, type, SUM(amount) as total_amount, SUM(commission) as total_commission, COUNT(*) as count')
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get()
            ->groupBy('date');

        $report = [];
        foreach ($dailyData as $date => $transactions) {
            $report[$date] = [
                'services' => $transactions->firstWhere('type', 'servico')?->total_amount ?? 0,
                'commissions' => $transactions->firstWhere('type', 'comissao')?->total_commission ?? 0,
                'subscriptions' => $transactions->firstWhere('type', 'assinatura')?->total_amount ?? 0,
                'count' => $transactions->sum('count'),
            ];
        }

        return $report;
    }
}
