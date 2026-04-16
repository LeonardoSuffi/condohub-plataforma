<?php

use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes - Scheduled Tasks
|--------------------------------------------------------------------------
*/

// Expirar assinaturas diariamente à meia-noite
Schedule::command('subscriptions:expire')->dailyAt('00:00');

// Reset do ranking semestralmente (1º de Janeiro e 1º de Julho)
Schedule::command('ranking:reset')->cron('0 0 1 1,7 *');
