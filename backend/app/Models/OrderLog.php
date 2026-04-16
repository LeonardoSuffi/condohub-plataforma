<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'old_status',
        'new_status',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function getActionDescription(): string
    {
        if (is_null($this->old_status)) {
            return "Ordem criada com status: {$this->new_status}";
        }

        return "Status alterado de {$this->old_status} para {$this->new_status}";
    }
}
