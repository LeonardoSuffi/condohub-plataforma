<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class ClientProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['cover_url'];

    protected $fillable = [
        'user_id',
        'cpf',
        'cnpj',
        'tipo',
        'telefone',
        'nome_organizacao',
        'endereco_organizacao',
        'cidade',
        'estado',
        'cep',
        'num_funcionarios',
        'cover_path',
        'preferences',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'num_funcionarios' => 'integer',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class, 'client_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function socialLinks()
    {
        return $this->morphMany(SocialLink::class, 'profile');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function getDocumentAttribute(): string
    {
        return $this->cnpj ?? $this->cpf ?? '';
    }

    public function isPessoaFisica(): bool
    {
        return $this->tipo === 'pessoa_fisica';
    }

    public function isEmpresa(): bool
    {
        return $this->tipo === 'empresa';
    }

    public function isAutonomo(): bool
    {
        return $this->tipo === 'autonomo';
    }

    public function getCoverUrlAttribute(): ?string
    {
        if ($this->cover_path) {
            return Storage::url($this->cover_path);
        }
        return null;
    }
}
