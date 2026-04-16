<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image_path',
        'link',
        'position',
        'type',
        'active',
        'order',
        'starts_at',
        'ends_at',
        'clicks',
        'views',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'order' => 'integer',
            'clicks' => 'integer',
            'views' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeActive($query)
    {
        return $query->where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                  ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')
                  ->orWhere('ends_at', '>=', now());
            });
    }

    public function scopeByPosition($query, string $position)
    {
        return $query->where('position', $position);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('created_at', 'desc');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isActive(): bool
    {
        if (!$this->active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }

    public function incrementClicks(): void
    {
        $this->increment('clicks');
    }

    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function getCtr(): float
    {
        if ($this->views === 0) {
            return 0;
        }

        return round(($this->clicks / $this->views) * 100, 2);
    }
}
