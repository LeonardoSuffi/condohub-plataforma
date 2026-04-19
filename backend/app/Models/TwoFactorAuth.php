<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    public function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = strtoupper(Str::random(4) . '-' . Str::random(4));
        }

        $this->update(['backup_codes' => $codes]);

        return $codes;
    }

    public function useBackupCode(string $code): bool
    {
        $codes = $this->backup_codes ?? [];
        $code = strtoupper(trim($code));

        $index = array_search($code, $codes);
        if ($index === false) {
            return false;
        }

        // Remove o codigo usado
        unset($codes[$index]);
        $this->update(['backup_codes' => array_values($codes)]);

        return true;
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
