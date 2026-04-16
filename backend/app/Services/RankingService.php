<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Ranking;

class RankingService
{
    /**
     * Pontos por real em transação
     */
    const POINTS_PER_REAL = 0.1;

    /**
     * Bônus por deal concluído
     */
    const BONUS_PER_DEAL = 10;

    /**
     * Adiciona pontos a partir de uma ordem concluída
     */
    public function addPointsFromOrder(User $user, Order $order): void
    {
        // Verifica se usuário tem ranking habilitado no plano
        $subscription = $user->activeSubscription;
        if (!$subscription || !$subscription->plan->ranking_enabled) {
            return;
        }

        $ranking = Ranking::getOrCreateForUser($user);

        // Calcula pontos
        $valuePoints = $order->value * self::POINTS_PER_REAL;
        $totalPoints = $valuePoints + self::BONUS_PER_DEAL;

        // Adiciona score
        $ranking->addScore($totalPoints, "Ordem #{$order->id} concluída - R$ {$order->value}");

        // Atualiza contadores
        $ranking->incrementDeals($order->value);

        // Recalcula posições do ciclo
        Ranking::recalculatePositions($ranking->cycle);
    }

    /**
     * Adiciona pontos manualmente (admin)
     */
    public function addPoints(User $user, float $points, string $reason): void
    {
        $ranking = Ranking::getOrCreateForUser($user);
        $ranking->addScore($points, $reason);
        Ranking::recalculatePositions($ranking->cycle);
    }

    /**
     * Remove pontos (penalidade)
     */
    public function removePoints(User $user, float $points, string $reason): void
    {
        $ranking = Ranking::getOrCreateForUser($user);
        $ranking->addScore(-$points, "Penalidade: {$reason}");
        Ranking::recalculatePositions($ranking->cycle);
    }

    /**
     * Reseta o ciclo de ranking
     */
    public function resetCycle(?string $cycle = null): void
    {
        $cycle = $cycle ?? Ranking::getCurrentCycle();

        Ranking::forCycle($cycle)->update([
            'score' => 0,
            'deals_completed' => 0,
            'total_value' => 0,
            'position' => null,
            'breakdown' => null,
        ]);
    }

    /**
     * Inicia novo ciclo (chamado pelo scheduler)
     */
    public function startNewCycle(): string
    {
        $newCycle = Ranking::getCurrentCycle();

        // Arquiva ciclo anterior
        $previousCycle = $this->getPreviousCycle();

        // Recalcula posições finais do ciclo anterior
        if ($previousCycle) {
            Ranking::recalculatePositions($previousCycle);
        }

        return $newCycle;
    }

    /**
     * Retorna ciclo anterior
     */
    protected function getPreviousCycle(): ?string
    {
        $current = Ranking::getCurrentCycle();
        $parts = explode('-', $current);
        $year = (int) $parts[0];
        $semester = $parts[1];

        if ($semester === 'S1') {
            return ($year - 1) . '-S2';
        }

        return $year . '-S1';
    }

    /**
     * Retorna top N do ranking
     */
    public function getTopRanking(int $limit = 10, ?string $cycle = null): array
    {
        $cycle = $cycle ?? Ranking::getCurrentCycle();

        return Ranking::forCycle($cycle)
            ->ordered()
            ->with(['user.companyProfile'])
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
