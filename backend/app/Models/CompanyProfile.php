<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class CompanyProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['logo_url', 'cover_url'];

    protected $fillable = [
        'user_id',
        'cnpj',
        'razao_social',
        'nome_fantasia',
        'segmento',
        'telefone',
        'endereco',
        'cidade',
        'estado',
        'cep',
        'descricao',
        'logo_path',
        'cover_path',
        'website',
        'verified',
        // Localizacao
        'latitude',
        'longitude',
        'google_maps_url',
    ];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'company_id');
    }

    public function activeServices()
    {
        return $this->services()->where('status', 'ativo');
    }

    public function deals()
    {
        return $this->hasMany(Deal::class, 'company_id');
    }

    public function portfolioItems()
    {
        return $this->hasMany(PortfolioItem::class, 'company_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'company_id');
    }

    public function socialLinks()
    {
        return $this->morphMany(SocialLink::class, 'profile');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function getDisplayNameAttribute(): string
    {
        return $this->nome_fantasia ?? $this->razao_social;
    }

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path) {
            return Storage::url($this->logo_path);
        }
        return null;
    }

    public function getCoverUrlAttribute(): ?string
    {
        if ($this->cover_path) {
            return Storage::url($this->cover_path);
        }
        return null;
    }

    public function isVerified(): bool
    {
        return $this->verified === true;
    }

    public function getAverageRatingAttribute(): float
    {
        return Review::getAverageForCompany($this->id);
    }

    public function getReviewsCountAttribute(): int
    {
        return Review::getCountForCompany($this->id);
    }

    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->endereco,
            $this->cidade,
            $this->estado,
            $this->cep,
        ]);
        return implode(', ', $parts);
    }
}
