<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'deal_id',
        'value',
        'status',
        'approved_by',
        'approved_at',
        'completed_at',
        'notes',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'approved_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function logs()
    {
        return $this->hasMany(OrderLog::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopePending($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'aprovado');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'concluido');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejeitado');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isPending(): bool
    {
        return $this->status === 'pendente';
    }

    public function isApproved(): bool
    {
        return $this->status === 'aprovado';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'concluido';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejeitado';
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'pendente';
    }

    public function canBeCompleted(): bool
    {
        return $this->status === 'aprovado';
    }

    public function getCompany()
    {
        return $this->deal->company;
    }

    public function getClient()
    {
        return $this->deal->client;
    }
}
