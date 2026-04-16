<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';

    protected $description = 'Expira assinaturas vencidas';

    public function handle(SubscriptionService $subscriptionService): int
    {
        $this->info('Verificando assinaturas vencidas...');

        $count = $subscriptionService->expireSubscriptions();

        $this->info("Total de assinaturas expiradas: {$count}");

        return Command::SUCCESS;
    }
}
