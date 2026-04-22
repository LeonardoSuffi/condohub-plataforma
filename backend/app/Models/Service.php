<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['cover_image'];

    protected $fillable = [
        'company_id',
        'category_id',
        'title',
        'description',
        'region',
        'price_range',
        'status',
        'featured',
        'tags',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'tags' => 'array',
            'views_count' => 'integer',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function company()
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function images()
    {
        return $this->hasMany(ServiceImage::class)->ordered();
    }

    public function coverImage()
    {
        return $this->hasOne(ServiceImage::class)->where('is_cover', true);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeActive($query)
    {
        return $query->where('status', 'ativo');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByRegion($query, $region)
    {
        return $query->where('region', 'like', "%{$region}%");
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        // Filtra baseado na faixa de preço
        return $query->where(function ($q) use ($min, $max) {
            $q->whereRaw("CAST(SUBSTRING_INDEX(price_range, '-', 1) AS UNSIGNED) >= ?", [$min])
              ->whereRaw("CAST(SUBSTRING_INDEX(price_range, '-', -1) AS UNSIGNED) <= ?", [$max]);
        });
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isActive(): bool
    {
        return $this->status === 'ativo';
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function getPriceRangeArrayAttribute(): array
    {
        $parts = explode('-', $this->price_range);
        return [
            'min' => (float) ($parts[0] ?? 0),
            'max' => (float) ($parts[1] ?? $parts[0] ?? 0),
        ];
    }

    public function getCoverImageAttribute(): ?string
    {
        $cover = $this->coverImage()->first();
        return $cover?->url;
    }
}
