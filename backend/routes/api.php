<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicController;

/*
|--------------------------------------------------------------------------
| API Routes - Plataforma Condominial
|--------------------------------------------------------------------------
*/

// ============================================
// ROTAS PÚBLICAS (Sem autenticação)
// ============================================

Route::prefix('auth')->group(function () {
    Route::post('/register/empresa', [AuthController::class, 'registerEmpresa']);
    Route::post('/register/cliente', [AuthController::class, 'registerCliente']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Categorias públicas para exibição
Route::get('/categories', [CategoryController::class, 'index']);

// Rotas públicas para a Home
Route::prefix('public')->group(function () {
    Route::get('/categories', [PublicController::class, 'categories']);
    Route::get('/services', [PublicController::class, 'services']);
    Route::get('/banners', [PublicController::class, 'banners']);
    Route::get('/stats', [PublicController::class, 'stats']);
});

// ============================================
// ROTAS AUTENTICADAS
// ============================================

Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // -----------------------------------------
    // PERFIL DO USUÁRIO
    // -----------------------------------------
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'update']);
    Route::post('/users/me/foto', [UserController::class, 'uploadPhoto']);
    Route::delete('/users/me/foto', [UserController::class, 'removePhoto']);
    Route::post('/users/me/logo', [UserController::class, 'uploadLogo']);
    Route::delete('/users/me/logo', [UserController::class, 'removeLogo']);

    // -----------------------------------------
    // SERVIÇOS - Apenas Clientes podem buscar
    // -----------------------------------------
    Route::middleware('isCliente')->group(function () {
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{id}', [ServiceController::class, 'show']);
    });

    // -----------------------------------------
    // SERVIÇOS - Apenas Empresas podem gerenciar
    // -----------------------------------------
    Route::middleware(['isEmpresa', 'hasActivePlan'])->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
        Route::get('/my-services', [ServiceController::class, 'myServices']);
    });

    // -----------------------------------------
    // NEGOCIAÇÕES (DEALS)
    // -----------------------------------------
    Route::get('/deals', [DealController::class, 'index']);
    Route::get('/deals/{id}', [DealController::class, 'show']);

    // Cliente inicia negociação
    Route::middleware('isCliente')->group(function () {
        Route::post('/deals', [DealController::class, 'store']);
    });

    // Atualizar status (aceitar/rejeitar) - Empresa ou Cliente
    Route::patch('/deals/{id}', [DealController::class, 'updateStatus']);

    // -----------------------------------------
    // MENSAGENS (CHAT)
    // -----------------------------------------
    Route::get('/deals/{dealId}/messages', [MessageController::class, 'index']);
    Route::post('/deals/{dealId}/messages', [MessageController::class, 'store']);

    // -----------------------------------------
    // ORDENS
    // -----------------------------------------
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Admin aprova/rejeita ordens
    Route::middleware('isAdmin')->group(function () {
        Route::patch('/orders/{id}', [OrderController::class, 'updateStatus']);
    });

    // -----------------------------------------
    // ASSINATURAS
    // -----------------------------------------
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::patch('/subscriptions/{id}', [SubscriptionController::class, 'update']);
    Route::delete('/subscriptions/{id}', [SubscriptionController::class, 'destroy']);

    // Planos disponíveis
    Route::get('/plans', [PlanController::class, 'index']);

    // -----------------------------------------
    // FINANCEIRO
    // -----------------------------------------
    Route::get('/finance/transactions', [TransactionController::class, 'index']);
    Route::get('/finance/export', [TransactionController::class, 'export']);

    // -----------------------------------------
    // RANKING - Apenas Empresas
    // -----------------------------------------
    Route::middleware(['isEmpresa', 'hasActivePlan'])->group(function () {
        Route::get('/ranking', [RankingController::class, 'index']);
        Route::get('/ranking/history', [RankingController::class, 'history']);
    });

    // -----------------------------------------
    // NOTIFICACOES
    // -----------------------------------------
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/clear-read', [NotificationController::class, 'clearRead']);

    // ============================================
    // ROTAS ADMINISTRATIVAS
    // ============================================

    Route::prefix('admin')->middleware('isAdmin')->group(function () {
        // Usuários
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
        Route::patch('/users/{id}/verify', [AdminController::class, 'verifyCompany']);

        // Planos
        Route::get('/plans', [AdminController::class, 'listPlans']);
        Route::post('/plans', [AdminController::class, 'storePlan']);
        Route::put('/plans/{id}', [AdminController::class, 'updatePlan']);

        // Banners
        Route::get('/banners', [BannerController::class, 'index']);
        Route::post('/banners', [BannerController::class, 'store']);
        Route::put('/banners/{id}', [BannerController::class, 'update']);
        Route::delete('/banners/{id}', [BannerController::class, 'destroy']);

        // Financeiro consolidado
        Route::get('/finance', [AdminController::class, 'financeOverview']);
        Route::get('/transactions', [AdminController::class, 'listTransactions']);

        // Ranking - reset manual
        Route::post('/ranking/reset', [RankingController::class, 'resetCycle']);
    });
});
