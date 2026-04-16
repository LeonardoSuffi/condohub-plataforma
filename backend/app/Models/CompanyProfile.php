<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyProfile extends Model
{
    use HasFactory, SoftDeletes;

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
        'verified',
    ];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
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

    // ==========================================
    // HELPERS
    // ==========================================

    public function getDisplayNameAttribute(): string
    {
        return $this->nome_fantasia ?? $this->razao_social;
    }

    public function isVerified(): bool
    {
        return $this->verified === true;
    }
}
