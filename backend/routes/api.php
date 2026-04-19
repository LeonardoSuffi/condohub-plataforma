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
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\GdprController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\CepController;

/*
|--------------------------------------------------------------------------
| API Routes - Plataforma Condominial
|--------------------------------------------------------------------------
*/

// ============================================
// ROTAS PÚBLICAS (Sem autenticação)
// ============================================

// Rate limiting para rotas de autenticação (proteção contra brute force)
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register/empresa', [AuthController::class, 'registerEmpresa']);
    Route::post('/register/cliente', [AuthController::class, 'registerCliente']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');
});

// Categorias públicas para exibição
Route::get('/categories', [CategoryController::class, 'index']);

// Rotas públicas para a Home (com rate limiting para prevenir abuso)
Route::prefix('public')->middleware('throttle:api')->group(function () {
    Route::get('/categories', [PublicController::class, 'categories']);
    Route::get('/services', [PublicController::class, 'services']);
    Route::get('/services/recent', [PublicController::class, 'recentServices']);
    Route::get('/banners', [PublicController::class, 'banners']);
    Route::get('/stats', [PublicController::class, 'stats']);

    // Empresas públicas
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/segments', [CompanyController::class, 'segments']);
    Route::get('/companies/{id}', [CompanyController::class, 'show']);

    // Avaliacoes publicas
    Route::get('/companies/{id}/reviews', [ReviewController::class, 'companyReviews']);

    // Portfolio publico
    Route::get('/companies/{id}/portfolio', [PortfolioController::class, 'public']);
    Route::get('/companies/{id}/portfolio/featured', [PortfolioController::class, 'featured']);
});

// CEP - Rota publica (para cadastro)
Route::get('/cep/{cep}', [CepController::class, 'fetch'])->middleware('throttle:api');
Route::get('/cep/search/{estado}/{cidade}/{logradouro}', [CepController::class, 'search'])->middleware('throttle:api');

// ============================================
// ROTAS AUTENTICADAS
// ============================================

Route::middleware(['auth:sanctum', 'validateSession'])->group(function () {

    // Auth - Logout e Sessão
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/auth/session', [AuthController::class, 'sessionInfo']);

    // -----------------------------------------
    // PERFIL DO USUÁRIO
    // -----------------------------------------
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'update']);
    Route::post('/users/me/foto', [UserController::class, 'uploadPhoto']);
    Route::delete('/users/me/foto', [UserController::class, 'removePhoto']);
    Route::post('/users/me/logo', [UserController::class, 'uploadLogo']);
    Route::delete('/users/me/logo', [UserController::class, 'removeLogo']);
    Route::post('/users/me/cover', [UserController::class, 'uploadCover']);
    Route::delete('/users/me/cover', [UserController::class, 'removeCover']);

    // -----------------------------------------
    // SEGURANCA
    // -----------------------------------------
    Route::prefix('security')->group(function () {
        // Sessoes
        Route::get('/sessions', [SecurityController::class, 'getSessions']);
        Route::delete('/sessions/{id}', [SecurityController::class, 'revokeSession']);
        Route::post('/sessions/revoke-all', [SecurityController::class, 'revokeAllSessions']);

        // 2FA
        Route::get('/2fa/status', [SecurityController::class, 'get2FAStatus']);
        Route::post('/2fa/enable', [SecurityController::class, 'enable2FA']);
        Route::post('/2fa/verify', [SecurityController::class, 'verify2FA']);
        Route::post('/2fa/disable', [SecurityController::class, 'disable2FA']);
        Route::post('/2fa/backup-codes', [SecurityController::class, 'regenerateBackupCodes']);

        // Logs
        Route::get('/activity', [SecurityController::class, 'getActivityLog']);
        Route::get('/activity/security', [SecurityController::class, 'getSecurityLog']);
    });

    // -----------------------------------------
    // LGPD / PRIVACIDADE
    // -----------------------------------------
    Route::prefix('gdpr')->group(function () {
        Route::get('/export', [GdprController::class, 'exportData']);
        Route::get('/download', [GdprController::class, 'downloadData']);
        Route::post('/delete-account', [GdprController::class, 'deleteAccount']);
        Route::get('/consents', [GdprController::class, 'getConsents']);
        Route::put('/consents', [GdprController::class, 'updateConsents']);
    });

    // -----------------------------------------
    // SERVIÇOS - Todos podem visualizar o catálogo
    // -----------------------------------------
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);

    // -----------------------------------------
    // SERVIÇOS - Apenas Empresas podem gerenciar
    // -----------------------------------------
    Route::middleware(['isEmpresa', 'hasActivePlan'])->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
        Route::get('/my-services', [ServiceController::class, 'myServices']);

        // Imagens do serviço
        Route::post('/services/{id}/images', [ServiceController::class, 'uploadImages']);
        Route::delete('/services/{id}/images/{imageId}', [ServiceController::class, 'deleteImage']);
        Route::patch('/services/{id}/images/{imageId}/cover', [ServiceController::class, 'setCoverImage']);
        Route::patch('/services/{id}/images/{imageId}/caption', [ServiceController::class, 'updateImageCaption']);
        Route::post('/services/{id}/images/reorder', [ServiceController::class, 'reorderImages']);

        // Portfolio
        Route::get('/portfolio', [PortfolioController::class, 'index']);
        Route::post('/portfolio', [PortfolioController::class, 'store']);
        Route::put('/portfolio/{id}', [PortfolioController::class, 'update']);
        Route::delete('/portfolio/{id}', [PortfolioController::class, 'destroy']);
        Route::post('/portfolio/reorder', [PortfolioController::class, 'reorder']);

        // Avaliacoes recebidas
        Route::get('/reviews/received', [ReviewController::class, 'received']);
        Route::post('/reviews/{id}/respond', [ReviewController::class, 'respond']);
        Route::post('/reviews/{id}/hide', [ReviewController::class, 'hide']);
        Route::post('/reviews/{id}/report', [ReviewController::class, 'report']);

        // Metricas
        Route::get('/metrics/dashboard', [MetricsController::class, 'dashboard']);
        Route::get('/metrics/charts', [MetricsController::class, 'charts']);
    });

    // -----------------------------------------
    // NEGOCIAÇÕES (DEALS)
    // -----------------------------------------
    Route::get('/deals', [DealController::class, 'index']);
    Route::get('/deals/{id}', [DealController::class, 'show']);

    // Cliente inicia negociação e avaliacoes
    Route::middleware('isCliente')->group(function () {
        Route::post('/deals', [DealController::class, 'store']);

        // Avaliacoes dadas
        Route::get('/reviews/given', [ReviewController::class, 'given']);
        Route::post('/reviews', [ReviewController::class, 'store']);

        // Metricas do cliente
        Route::get('/metrics/client', [MetricsController::class, 'clientDashboard']);
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
        // Usuários - CRUD completo
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::get('/users/export', [AdminController::class, 'exportUsers']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        // Usuários - Ações específicas
        Route::patch('/users/{id}/verify', [AdminController::class, 'verifyCompany']);
        Route::post('/users/{id}/reset-password', [AdminController::class, 'resetUserPassword']);
        Route::post('/users/{id}/subscription', [AdminController::class, 'manageSubscription']);
        Route::post('/users/{id}/send-verification', [AdminController::class, 'sendVerificationEmail']);
        Route::post('/users/{id}/verify-email', [AdminController::class, 'verifyEmail']);

        // Planos
        Route::get('/plans', [AdminController::class, 'listPlans']);
        Route::post('/plans', [AdminController::class, 'storePlan']);
        Route::put('/plans/{id}', [AdminController::class, 'updatePlan']);

        // Banners
        Route::get('/banners', [BannerController::class, 'index']);
        Route::post('/banners', [BannerController::class, 'store']);
        Route::put('/banners/{id}', [BannerController::class, 'update']);
        Route::delete('/banners/{id}', [BannerController::class, 'destroy']);

        // Categorias
        Route::get('/categories', [CategoryController::class, 'adminIndex']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
        Route::post('/categories/reorder', [CategoryController::class, 'reorder']);

        // Financeiro consolidado
        Route::get('/finance', [AdminController::class, 'financeOverview']);
        Route::get('/transactions', [AdminController::class, 'listTransactions']);

        // Ranking - reset manual
        Route::post('/ranking/reset', [RankingController::class, 'resetCycle']);
    });
});
