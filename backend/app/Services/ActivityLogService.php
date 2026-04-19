<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log uma atividade do usuario
     */
    public function log(User $user, string $action, ?Model $entity = null, array $metadata = []): ActivityLog
    {
        return ActivityLog::log($user, $action, $entity, $metadata);
    }

    /**
     * Log de login
     */
    public function logLogin(User $user, array $metadata = []): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_LOGIN, null, $metadata);
    }

    /**
     * Log de logout
     */
    public function logLogout(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_LOGOUT);
    }

    /**
     * Log de logout de todos os dispositivos
     */
    public function logLogoutAll(User $user, int $sessionsCount): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_LOGOUT_ALL, null, [
            'sessions_revoked' => $sessionsCount,
        ]);
    }

    /**
     * Log de alteracao de senha
     */
    public function logPasswordChange(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_PASSWORD_CHANGE);
    }

    /**
     * Log de reset de senha
     */
    public function logPasswordReset(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_PASSWORD_RESET);
    }

    /**
     * Log de atualizacao de perfil
     */
    public function logProfileUpdate(User $user, array $changes = []): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_PROFILE_UPDATE, null, [
            'fields_changed' => array_keys($changes),
        ]);
    }

    /**
     * Log de upload de foto
     */
    public function logPhotoUpload(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_PHOTO_UPLOAD);
    }

    /**
     * Log de upload de logo
     */
    public function logLogoUpload(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_LOGO_UPLOAD);
    }

    /**
     * Log de ativacao do 2FA
     */
    public function log2FAEnable(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_2FA_ENABLE);
    }

    /**
     * Log de desativacao do 2FA
     */
    public function log2FADisable(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_2FA_DISABLE);
    }

    /**
     * Log de criacao de servico
     */
    public function logServiceCreate(User $user, Model $service): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_SERVICE_CREATE, $service);
    }

    /**
     * Log de atualizacao de servico
     */
    public function logServiceUpdate(User $user, Model $service, array $changes = []): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_SERVICE_UPDATE, $service, [
            'fields_changed' => array_keys($changes),
        ]);
    }

    /**
     * Log de remocao de servico
     */
    public function logServiceDelete(User $user, Model $service): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_SERVICE_DELETE, $service);
    }

    /**
     * Log de criacao de negociacao
     */
    public function logDealCreate(User $user, Model $deal): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_DEAL_CREATE, $deal);
    }

    /**
     * Log de atualizacao de negociacao
     */
    public function logDealUpdate(User $user, Model $deal, array $changes = []): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_DEAL_UPDATE, $deal, [
            'fields_changed' => array_keys($changes),
        ]);
    }

    /**
     * Log de criacao de pedido
     */
    public function logOrderCreate(User $user, Model $order): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_ORDER_CREATE, $order);
    }

    /**
     * Log de criacao de avaliacao
     */
    public function logReviewCreate(User $user, Model $review): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_REVIEW_CREATE, $review);
    }

    /**
     * Log de exportacao LGPD
     */
    public function logGdprExport(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_GDPR_EXPORT);
    }

    /**
     * Log de solicitacao de exclusao de conta
     */
    public function logAccountDeleteRequest(User $user): ActivityLog
    {
        return $this->log($user, ActivityLog::ACTION_ACCOUNT_DELETE_REQUEST);
    }

    /**
     * Obter atividades recentes do usuario
     */
    public function getRecentActivities(User $user, int $days = 30, int $limit = 50)
    {
        return ActivityLog::forUser($user->id)
            ->recent($days)
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Obter atividades de seguranca do usuario
     */
    public function getSecurityActivities(User $user, int $limit = 20)
    {
        return ActivityLog::forUser($user->id)
            ->securityRelated()
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }
}
