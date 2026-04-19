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
        'nome_condominio',
        'endereco_condominio',
        'cidade',
        'estado',
        'cep',
        'num_unidades',
        'cover_path',
        'preferences',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'num_unidades' => 'integer',
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

    public function isSindico(): bool
    {
        return $this->tipo === 'sindico';
    }

    public function isAdministradora(): bool
    {
        return $this->tipo === 'administradora';
    }

    public function isCondominio(): bool
    {
        return $this->tipo === 'condominio';
    }

    public function getCoverUrlAttribute(): ?string
    {
        if ($this->cover_path) {
            return Storage::url($this->cover_path);
        }
        return null;
    }
}
