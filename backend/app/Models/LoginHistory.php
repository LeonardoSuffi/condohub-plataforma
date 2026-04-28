<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'device_fingerprint',
        'location',
        'is_new_device',
        'notification_sent',
        'created_at',
    ];

    protected $casts = [
        'is_new_device' => 'boolean',
        'notification_sent' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this is a known device for the user
     */
    public static function isKnownDevice(int $userId, string $fingerprint): bool
    {
        return self::where('user_id', $userId)
            ->where('device_fingerprint', $fingerprint)
            ->exists();
    }

    /**
     * Record a login
     */
    public static function recordLogin(
        int $userId,
        string $ip,
        ?string $userAgent,
        ?string $fingerprint,
        ?string $location = null
    ): self {
        $isNewDevice = $fingerprint ? !self::isKnownDevice($userId, $fingerprint) : true;

        return self::create([
            'user_id' => $userId,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'device_fingerprint' => $fingerprint,
            'location' => $location,
            'is_new_device' => $isNewDevice,
            'notification_sent' => false,
            'created_at' => now(),
        ]);
    }

    /**
     * Get recent logins for a user
     */
    public static function getRecentLogins(int $userId, int $limit = 10)
    {
        return self::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
