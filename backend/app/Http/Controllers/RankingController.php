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

        $rankings = Ranking::forCycle($cycle)
            ->ordered()
            ->with(['user.companyProfile'])
            ->paginate($request->get('per_page', 20));

        // Posição do usuário atual
        $userRanking = null;
        if ($user->isEmpresa()) {
            $userRanking = Ranking::where('user_id', $user->id)
                ->forCycle($cycle)
                ->first();
        }

        return $this->success([
            'cycle' => $cycle,
            'rankings' => $rankings->items(),
            'user_position' => $userRanking,
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
