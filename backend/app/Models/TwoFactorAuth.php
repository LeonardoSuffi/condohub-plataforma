<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TwoFactorAuth extends Model
{
    use HasFactory;

    protected $table = 'two_factor_auth';

    protected $fillable = [
        'user_id',
        'secret',
        'enabled',
        'backup_codes',
        'verified_at',
        'last_used_at',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'backup_codes' => 'array',
        'verified_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    protected $hidden = [
        'secret',
        'backup_codes',
    ];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Methods

    public function enable(): void
    {
        $this->update([
            'enabled' => true,
            'verified_at' => now(),
        ]);

        $this->user->update(['two_factor_enabled' => true]);
    }

    public function disable(): void
    {
        $this->update([
            'enabled' => false,
            'secret' => null,
            'backup_codes' => null,
            'verified_at' => null,
            'last_used_at' => null,
        ]);

        $this->user->update(['two_factor_enabled' => false]);
    }

    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Generate backup codes (returns plain codes, stores hashed)
     */
    public function generateBackupCodes(): array
    {
        $plainCodes = [];
        $hashedCodes = [];

        for ($i = 0; $i < 8; $i++) {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4));
            $plainCodes[] = $code;
            $hashedCodes[] = Hash::make(str_replace('-', '', $code));
        }

        $this->update(['backup_codes' => $hashedCodes]);

        return $plainCodes; // Return plain codes to show to user ONCE
    }

    /**
     * Verify and use a backup code (checks against hashed codes)
     */
    public function useBackupCode(string $code): bool
    {
        $hashedCodes = $this->backup_codes ?? [];
        $normalizedCode = strtoupper(str_replace(['-', ' '], '', trim($code)));

        foreach ($hashedCodes as $index => $hashedCode) {
            if (Hash::check($normalizedCode, $hashedCode)) {
                // Remove used code
                unset($hashedCodes[$index]);
                $this->update(['backup_codes' => array_values($hashedCodes)]);
                return true;
            }
        }

        return false;
    }

    public function hasBackupCodes(): bool
    {
        return !empty($this->backup_codes);
    }

    public function getRemainingBackupCodesCount(): int
    {
        return count($this->backup_codes ?? []);
    }

    // Static methods

    public static function getOrCreateForUser(User $user): self
    {
        return static::firstOrCreate(
            ['user_id' => $user->id],
            ['enabled' => false]
        );
    }
}
