<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientProfile extends Model
{
    use HasFactory, SoftDeletes;

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
}
