<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Deal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'client_id',
        'service_id',
        'status',
        'anon_handle_a',
        'anon_handle_b',
        'mensagem_inicial',
        'accepted_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($deal) {
            // Gera handles anônimos automaticamente
            if (empty($deal->anon_handle_a)) {
                $deal->anon_handle_a = 'Empresa #' . strtoupper(Str::random(4));
            }
            if (empty($deal->anon_handle_b)) {
                $deal->anon_handle_b = 'Cliente #' . strtoupper(Str::random(4));
            }
        });
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function company()
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function client()
    {
        return $this->belongsTo(ClientProfile::class, 'client_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeOpen($query)
    {
        return $query->where('status', 'aberto');
    }

    public function scopeNegotiating($query)
    {
        return $query->where('status', 'negociando');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'aceito');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'concluido');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['aberto', 'negociando', 'aceito']);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isAnonymous(): bool
    {
        return !in_array($this->status, ['aceito', 'concluido']);
    }

    public function canChat(): bool
    {
        return in_array($this->status, ['aberto', 'negociando']);
    }

    public function canAccept(): bool
    {
        return $this->status === 'negociando';
    }

    public function getAnonHandleFor(User $user): string
    {
        if ($user->isEmpresa() && $user->companyProfile?->id === $this->company_id) {
            return $this->anon_handle_a;
        }

        if ($user->isCliente() && $user->clientProfile?->id === $this->client_id) {
            return $this->anon_handle_b;
        }

        return 'Usuário';
    }

    public function getOtherPartyAnonHandle(User $user): string
    {
        if ($user->isEmpresa() && $user->companyProfile?->id === $this->company_id) {
            return $this->anon_handle_b;
        }

        return $this->anon_handle_a;
    }

    public function belongsToUser(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isEmpresa()) {
            return $user->companyProfile?->id === $this->company_id;
        }

        if ($user->isCliente()) {
            return $user->clientProfile?->id === $this->client_id;
        }

        return false;
    }
}
