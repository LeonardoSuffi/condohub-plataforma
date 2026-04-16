<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'starts_at',
        'ends_at',
        'interactions_used',
        'payment_method',
        'external_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'interactions_used' => 'integer',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeActive($query)
    {
        return $query->where('status', 'ativa');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expirada');
    }

    public function scopeExpiring($query)
    {
        return $query->where('status', 'ativa')
            ->where('ends_at', '<=', now());
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isActive(): bool
    {
        return $this->status === 'ativa' &&
               ($this->ends_at === null || $this->ends_at->isFuture());
    }

    public function isExpired(): bool
    {
        return $this->status === 'expirada' ||
               ($this->ends_at && $this->ends_at->isPast());
    }

    public function canInteract(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        return $this->interactions_used < $this->plan->max_interactions;
    }

    public function incrementInteractions(): void
    {
        $this->increment('interactions_used');
    }

    public function getRemainingInteractionsAttribute(): int
    {
        return max(0, $this->plan->max_interactions - $this->interactions_used);
    }

    public function getDaysRemainingAttribute(): int
    {
        if (!$this->ends_at) {
            return 999;
        }

        return max(0, now()->diffInDays($this->ends_at, false));
    }
}
