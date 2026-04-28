<?php

namespace App\Http\Controllers;

use App\Models\Ranking;
use App\Services\RankingService;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    protected RankingService $rankingService;

    public function __construct(RankingService $rankingService)
    {
        $this->rankingService = $rankingService;
    }

    /**
     * Lista ranking do ciclo atual
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $cycle = $request->get('cycle', Ranking::getCurrentCycle());

        // Format cycle for display (e.g., "2026-S1" -> "1º Semestre 2026")
        $cycleParts = explode('-', $cycle);
        $year = $cycleParts[0] ?? date('Y');
        $semester = $cycleParts[1] ?? 'S1';
        $cycleDisplay = ($semester === 'S1' ? '1º Semestre' : '2º Semestre') . ' ' . $year;

        $rankings = Ranking::forCycle($cycle)
            ->ordered()
            ->with(['user.companyProfile'])
            ->paginate($request->get('per_page', 50));

        // Posição do usuário atual
        $userPosition = null;
        if ($user && $user->isEmpresa()) {
            $userRanking = Ranking::where('user_id', $user->id)
                ->forCycle($cycle)
                ->with(['user.companyProfile'])
                ->first();

            if ($userRanking) {
                $userPosition = [
                    'position' => $userRanking->position,
                    'previous_position' => $userRanking->previous_position,
                    'score' => $userRanking->score,
                    'deals_completed' => $userRanking->deals_completed,
                    'total_value' => $userRanking->total_value,
                ];
            }
        }

        // Transform rankings for frontend
        $transformedRankings = $rankings->getCollection()->map(function ($ranking) {
            return [
                'id' => $ranking->id,
                'position' => $ranking->position,
                'previous_position' => $ranking->previous_position,
                'user_id' => $ranking->user_id,
                'score' => $ranking->score,
                'deals_completed' => $ranking->deals_completed,
                'total_value' => $ranking->total_value,
                'user' => [
                    'id' => $ranking->user?->id,
                    'name' => $ranking->user?->name,
                    'company_profile' => $ranking->user?->companyProfile ? [
                        'nome_fantasia' => $ranking->user->companyProfile->nome_fantasia,
                        'razao_social' => $ranking->user->companyProfile->razao_social,
                        'verified' => $ranking->user->companyProfile->verified ?? false,
                        'logo_url' => $ranking->user->companyProfile->logo_url,
                    ] : null,
                ],
            ];
        });

        return $this->success([
            'cycle' => $cycleDisplay,
            'rankings' => $transformedRankings,
            'user_position' => $userPosition,
            'meta' => [
                'current_page' => $rankings->currentPage(),
                'last_page' => $rankings->lastPage(),
                'total' => $rankings->total(),
            ],
        ], 'Ranking do ciclo');
    }

    /**
     * Histórico de rankings do usuário
     */
    public function history(Request $request)
    {
        $user = $request->user();

        $history = Ranking::where('user_id', $user->id)
            ->orderByDesc('cycle')
            ->get();

        return $this->success($history, 'Histórico de ranking');
    }

    /**
     * Reset manual do ciclo (apenas admin)
     */
    public function resetCycle(Request $request)
    {
        $validated = $request->validate([
            'cycle' => 'nullable|string|max:10',
        ]);

        $cycle = $validated['cycle'] ?? Ranking::getCurrentCycle();

        $this->rankingService->resetCycle($cycle);

        // Recalcula posições
        Ranking::recalculatePositions($cycle);

        return $this->success(null, "Ranking do ciclo {$cycle} resetado com sucesso.");
    }
}
