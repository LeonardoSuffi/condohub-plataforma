<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'deal_id',
        'sender_id',
        'content_sanitized',
        'content_original',
        'is_system',
        'read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where('sender_id', '!=', $user->id);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function markAsRead(): void
    {
        if (!$this->read) {
            $this->update([
                'read' => true,
                'read_at' => now(),
            ]);
        }
    }

    public function getSenderAnonHandle(): string
    {
        $deal = $this->deal;
        $sender = $this->sender;

        if ($this->is_system) {
            return 'Sistema';
        }

        if ($deal->isAnonymous()) {
            return $deal->getAnonHandleFor($sender);
        }

        // Se não for anônimo, retorna o nome real
        if ($sender->isEmpresa()) {
            return $sender->companyProfile?->display_name ?? $sender->name;
        }

        return $sender->name;
    }
}
