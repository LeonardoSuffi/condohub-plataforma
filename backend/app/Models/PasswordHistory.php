<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'password_hash',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected $hidden = [
        'password_hash',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get recent password hashes for a user
     */
    public static function getRecentHashes(int $userId, int $limit = 5): array
    {
        return self::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->pluck('password_hash')
            ->toArray();
    }

    /**
     * Add a password to history
     */
    public static function addToHistory(int $userId, string $hashedPassword): void
    {
        self::create([
            'user_id' => $userId,
            'password_hash' => $hashedPassword,
            'created_at' => now(),
        ]);

        // Keep only last 10 entries
        self::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->skip(10)
            ->take(PHP_INT_MAX)
            ->delete();
    }
}
