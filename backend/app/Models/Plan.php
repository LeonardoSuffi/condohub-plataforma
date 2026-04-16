<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'billing_cycle',
        'features',
        'max_interactions',
        'max_services',
        'ranking_enabled',
        'featured_enabled',
        'priority',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'features' => 'array',
            'max_interactions' => 'integer',
            'max_services' => 'integer',
            'ranking_enabled' => 'boolean',
            'featured_enabled' => 'boolean',
            'priority' => 'integer',
            'active' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($plan) {
            if (empty($plan->slug)) {
                $plan->slug = Str::slug($plan->name);
            }
        });
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('priority')->orderBy('price');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isFree(): bool
    {
        return $this->price == 0;
    }

    public function isPremium(): bool
    {
        return $this->slug === 'premium';
    }

    public function getDurationInDays(): int
    {
        return match ($this->billing_cycle) {
            'mensal' => 30,
            'trimestral' => 90,
            'semestral' => 180,
            'anual' => 365,
            default => 30,
        };
    }
}
