<?php

namespace App\Console\Commands;

use App\Services\RankingService;
use App\Models\Ranking;
use Illuminate\Console\Command;

class ResetRanking extends Command
{
    protected $signature = 'ranking:reset {--cycle= : Ciclo específico para resetar}';

    protected $description = 'Inicia novo ciclo de ranking semestral';

    public function handle(RankingService $rankingService): int
    {
        $cycle = $this->option('cycle');

        if ($cycle) {
            $this->info("Resetando ranking do ciclo: {$cycle}");
            $rankingService->resetCycle($cycle);
            Ranking::recalculatePositions($cycle);
        } else {
            $this->info('Iniciando novo ciclo de ranking...');
            $newCycle = $rankingService->startNewCycle();
            $this->info("Novo ciclo iniciado: {$newCycle}");
        }

        $this->info('Ranking atualizado com sucesso!');

        return Command::SUCCESS;
    }
}
