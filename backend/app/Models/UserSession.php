<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSession extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'session_id',
        'device_name',
        'device_type',
        'browser',
        'platform',
        'ip_address',
        'location',
        'is_current',
        'last_active_at',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'last_active_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    protected $hidden = [
        'session_id',
    ];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('last_active_at', '>=', now()->subDays(30));
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    // Methods

    public function markAsCurrent(): void
    {
        // Remove current flag from other sessions
        static::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_current' => false]);

        $this->update([
            'is_current' => true,
            'last_active_at' => now(),
        ]);
    }

    public function updateActivity(): void
    {
        $this->update(['last_active_at' => now()]);
    }

    public function revoke(): bool
    {
        return $this->delete();
    }

    // Static methods

    public static function createForUser(User $user, string $sessionId): self
    {
        $userAgent = request()->userAgent();
        $parsed = self::parseUserAgent($userAgent);

        return static::create([
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'device_name' => $parsed['device'],
            'device_type' => $parsed['device_type'],
            'browser' => $parsed['browser'],
            'platform' => $parsed['platform'],
            'ip_address' => request()->ip(),
            'location' => null, // Pode ser preenchido via servico de geolocalizacao
            'is_current' => true,
            'last_active_at' => now(),
        ]);
    }

    public static function revokeAllForUser(int $userId, ?string $exceptSessionId = null): int
    {
        $query = static::where('user_id', $userId);

        if ($exceptSessionId) {
            $query->where('session_id', '!=', $exceptSessionId);
        }

        return $query->delete();
    }

    protected static function parseUserAgent(?string $userAgent): array
    {
        $result = [
            'device' => 'Dispositivo desconhecido',
            'device_type' => 'unknown',
            'browser' => 'Navegador desconhecido',
            'platform' => 'Sistema desconhecido',
        ];

        if (!$userAgent) {
            return $result;
        }

        // Detectar plataforma
        if (stripos($userAgent, 'Windows') !== false) {
            $result['platform'] = 'Windows';
        } elseif (stripos($userAgent, 'Mac') !== false) {
            $result['platform'] = 'macOS';
        } elseif (stripos($userAgent, 'Linux') !== false) {
            $result['platform'] = 'Linux';
        } elseif (stripos($userAgent, 'Android') !== false) {
            $result['platform'] = 'Android';
        } elseif (stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false) {
            $result['platform'] = 'iOS';
        }

        // Detectar tipo de dispositivo
        if (stripos($userAgent, 'Mobile') !== false || stripos($userAgent, 'Android') !== false) {
            $result['device_type'] = 'mobile';
        } elseif (stripos($userAgent, 'Tablet') !== false || stripos($userAgent, 'iPad') !== false) {
            $result['device_type'] = 'tablet';
        } else {
            $result['device_type'] = 'desktop';
        }

        // Detectar navegador
        if (stripos($userAgent, 'Chrome') !== false && stripos($userAgent, 'Edg') === false) {
            $result['browser'] = 'Chrome';
        } elseif (stripos($userAgent, 'Firefox') !== false) {
            $result['browser'] = 'Firefox';
        } elseif (stripos($userAgent, 'Safari') !== false && stripos($userAgent, 'Chrome') === false) {
            $result['browser'] = 'Safari';
        } elseif (stripos($userAgent, 'Edg') !== false) {
            $result['browser'] = 'Edge';
        } elseif (stripos($userAgent, 'Opera') !== false || stripos($userAgent, 'OPR') !== false) {
            $result['browser'] = 'Opera';
        }

        // Montar nome do dispositivo
        $result['device'] = "{$result['browser']} em {$result['platform']}";

        return $result;
    }
}
