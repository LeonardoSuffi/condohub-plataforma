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
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
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
