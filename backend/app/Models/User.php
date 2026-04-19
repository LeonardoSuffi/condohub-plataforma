<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
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
        'last_login_at',
        'last_login_ip',
        'last_login_device',
        'is_blocked',
        'blocked_at',
        'blocked_reason',
        'failed_login_attempts',
        'last_failed_login_at',
        // 2FA and LGPD
        'two_factor_enabled',
        'gdpr_consent_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'current_session_id',
        'last_login_ip',
        'last_login_device',
        'failed_login_attempts',
        'last_failed_login_at',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'blocked_at' => 'datetime',
            'last_failed_login_at' => 'datetime',
            'is_blocked' => 'boolean',
            'failed_login_attempts' => 'integer',
            'two_factor_enabled' => 'boolean',
            'gdpr_consent_at' => 'datetime',
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
}
