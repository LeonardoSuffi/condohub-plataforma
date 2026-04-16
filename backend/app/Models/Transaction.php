<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'subscription_id',
        'type',
        'amount',
        'commission',
        'net_amount',
        'status',
        'payment_method',
        'external_id',
        'metadata',
    ];

    protected $appends = ['description'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'commission' => 'decimal:2',
        ];
    }

    public function getDescriptionAttribute(): string
    {
        if ($this->type === 'assinatura' && $this->subscription) {
            return 'Assinatura: ' . ($this->subscription->plan->name ?? 'Plano');
        }

        if ($this->type === 'servico' && $this->order) {
            return 'Servico: ' . ($this->order->deal->service->title ?? 'N/A');
        }

        if ($this->type === 'comissao') {
            return 'Comissao da plataforma';
        }

        if ($this->type === 'estorno') {
            return 'Estorno de transacao';
        }

        return $this->getTypeLabel();
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeCompleted($query)
    {
        return $query->where('status', 'concluida');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function isCompleted(): bool
    {
        return $this->status === 'concluida';
    }

    public function isPending(): bool
    {
        return $this->status === 'pendente';
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'assinatura' => 'Assinatura',
            'comissao' => 'Comissão',
            'servico' => 'Serviço',
            'estorno' => 'Estorno',
            default => $this->type,
        };
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pendente' => 'Pendente',
            'processando' => 'Processando',
            'concluida' => 'Concluída',
            'falhou' => 'Falhou',
            'estornada' => 'Estornada',
            default => $this->status,
        };
    }
}
