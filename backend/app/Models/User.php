<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\EmailVerificationNotification;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
        'foto_path',
        // Security fields
        'current_session_id',
        'session_expires_at',
        'last_activity_at',
        'last_login_at',
        'last_login_ip',
        'last_login_device',
        'is_blocked',
        'blocked_at',
        'blocked_reason',
        'failed_login_attempts',
        'last_failed_login_at',
        'requires_captcha',
        'captcha_required_until',
        // 2FA and LGPD
        'two_factor_enabled',
        'gdpr_consent_at',
        // Notification preferences
        'notification_preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'current_session_id',
        'last_login_ip',
        'last_login_device',
        'failed_login_attempts',
        'last_failed_login_at',
        'blocked_reason', // SEGURANCA: Nao expor motivo do bloqueio em respostas da API
        'requires_captcha',
        'captcha_required_until',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'session_expires_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'last_login_at' => 'datetime',
            'blocked_at' => 'datetime',
            'last_failed_login_at' => 'datetime',
            'captcha_required_until' => 'datetime',
            'is_blocked' => 'boolean',
            'requires_captcha' => 'boolean',
            'failed_login_attempts' => 'integer',
            'two_factor_enabled' => 'boolean',
            'gdpr_consent_at' => 'datetime',
            'notification_preferences' => 'array',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'ativa')
            ->latest();
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function rankings()
    {
        return $this->hasMany(Ranking::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function sessions()
    {
        return $this->hasMany(UserSession::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function twoFactorAuth()
    {
        return $this->hasOne(TwoFactorAuth::class);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isAdmin(): bool
    {
        return $this->type === 'admin';
    }

    public function isEmpresa(): bool
    {
        return $this->type === 'empresa';
    }

    public function isCliente(): bool
    {
        return $this->type === 'cliente';
    }

    public function hasActivePlan(): bool
    {
        return $this->activeSubscription !== null;
    }

    public function getCurrentPlan()
    {
        return $this->activeSubscription?->plan;
    }

    public function getProfile()
    {
        if ($this->isEmpresa()) {
            return $this->companyProfile;
        }

        if ($this->isCliente()) {
            return $this->clientProfile;
        }

        return null;
    }

    /**
     * Get notification preferences with defaults
     */
    public function getNotificationPreferences(): array
    {
        $defaults = [
            'deals' => true,
            'messages' => true,
            'status' => true,
            'promo' => false,
            // Privacy settings
            'visible_in_ranking' => true,
            'share_anonymous_data' => true,
        ];

        $preferences = $this->notification_preferences ?? [];

        return array_merge($defaults, $preferences);
    }

    /**
     * Check if a specific notification type is enabled
     */
    public function hasNotificationEnabled(string $type): bool
    {
        $preferences = $this->getNotificationPreferences();
        return $preferences[$type] ?? true;
    }

    /**
     * Check if user is visible in rankings
     */
    public function isVisibleInRanking(): bool
    {
        $preferences = $this->getNotificationPreferences();
        return $preferences['visible_in_ranking'] ?? true;
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Send the email verification notification.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new EmailVerificationNotification());
    }

    /**
     * Password history relationship
     */
    public function passwordHistories()
    {
        return $this->hasMany(\App\Models\PasswordHistory::class);
    }

    /**
     * Login history relationship
     */
    public function loginHistories()
    {
        return $this->hasMany(\App\Models\LoginHistory::class);
    }
}
