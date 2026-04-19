<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Apenas created_at

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    // Actions constants
    const ACTION_LOGIN = 'login';
    const ACTION_LOGOUT = 'logout';
    const ACTION_LOGOUT_ALL = 'logout_all';
    const ACTION_PASSWORD_CHANGE = 'password_change';
    const ACTION_PASSWORD_RESET = 'password_reset';
    const ACTION_PROFILE_UPDATE = 'profile_update';
    const ACTION_PHOTO_UPLOAD = 'photo_upload';
    const ACTION_LOGO_UPLOAD = 'logo_upload';
    const ACTION_2FA_ENABLE = '2fa_enable';
    const ACTION_2FA_DISABLE = '2fa_disable';
    const ACTION_SERVICE_CREATE = 'service_create';
    const ACTION_SERVICE_UPDATE = 'service_update';
    const ACTION_SERVICE_DELETE = 'service_delete';
    const ACTION_DEAL_CREATE = 'deal_create';
    const ACTION_DEAL_UPDATE = 'deal_update';
    const ACTION_ORDER_CREATE = 'order_create';
    const ACTION_REVIEW_CREATE = 'review_create';
    const ACTION_GDPR_EXPORT = 'gdpr_export';
    const ACTION_ACCOUNT_DELETE_REQUEST = 'account_delete_request';

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function entity(): MorphTo
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }

    // Scopes

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeSecurityRelated($query)
    {
        return $query->whereIn('action', [
            self::ACTION_LOGIN,
            self::ACTION_LOGOUT,
            self::ACTION_LOGOUT_ALL,
            self::ACTION_PASSWORD_CHANGE,
            self::ACTION_PASSWORD_RESET,
            self::ACTION_2FA_ENABLE,
            self::ACTION_2FA_DISABLE,
        ]);
    }

    // Static methods

    public static function log(
        User $user,
        string $action,
        ?Model $entity = null,
        array $metadata = []
    ): self {
        return static::create([
            'user_id' => $user->id,
            'action' => $action,
            'entity_type' => $entity ? get_class($entity) : null,
            'entity_id' => $entity?->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
        ]);
    }

    // Helpers

    public function getActionLabelAttribute(): string
    {
        $labels = [
            self::ACTION_LOGIN => 'Login realizado',
            self::ACTION_LOGOUT => 'Logout realizado',
            self::ACTION_LOGOUT_ALL => 'Logout de todos os dispositivos',
            self::ACTION_PASSWORD_CHANGE => 'Senha alterada',
            self::ACTION_PASSWORD_RESET => 'Senha redefinida',
            self::ACTION_PROFILE_UPDATE => 'Perfil atualizado',
            self::ACTION_PHOTO_UPLOAD => 'Foto atualizada',
            self::ACTION_LOGO_UPLOAD => 'Logo atualizada',
            self::ACTION_2FA_ENABLE => 'Autenticacao 2 fatores ativada',
            self::ACTION_2FA_DISABLE => 'Autenticacao 2 fatores desativada',
            self::ACTION_SERVICE_CREATE => 'Servico criado',
            self::ACTION_SERVICE_UPDATE => 'Servico atualizado',
            self::ACTION_SERVICE_DELETE => 'Servico removido',
            self::ACTION_DEAL_CREATE => 'Negociacao iniciada',
            self::ACTION_DEAL_UPDATE => 'Negociacao atualizada',
            self::ACTION_ORDER_CREATE => 'Pedido criado',
            self::ACTION_REVIEW_CREATE => 'Avaliacao criada',
            self::ACTION_GDPR_EXPORT => 'Dados exportados',
            self::ACTION_ACCOUNT_DELETE_REQUEST => 'Exclusao de conta solicitada',
        ];

        return $labels[$this->action] ?? $this->action;
    }
}
