<?php

namespace App\Services;

use App\Models\TwoFactorAuth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TwoFactorService
{
    /**
     * Issuer name for TOTP
     */
    const ISSUER = 'ServicePro';

    /**
     * Number of backup codes to generate
     */
    const BACKUP_CODES_COUNT = 8;

    /**
     * Get 2FA status for user
     */
    public function getStatus(User $user): array
    {
        $twoFactor = TwoFactorAuth::where('user_id', $user->id)->first();

        return [
            'enabled' => $user->two_factor_enabled,
            'has_backup_codes' => $twoFactor && !empty($twoFactor->backup_codes),
            'backup_codes_remaining' => $twoFactor ? count($twoFactor->backup_codes ?? []) : 0,
        ];
    }

    /**
     * Initiate 2FA setup - generate secret and QR code URL
     */
    public function initiate(User $user): array
    {
        $secret = $this->generateSecret();

        // Store pending secret
        TwoFactorAuth::updateOrCreate(
            ['user_id' => $user->id],
            [
                'secret' => $secret,
                'enabled' => false,
            ]
        );

        $qrCodeUrl = $this->generateQrCodeUrl($user->email, $secret);

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ];
    }

    /**
     * Verify a TOTP code and enable 2FA if valid
     */
    public function verify(User $user, string $code): bool
    {
        $twoFactor = TwoFactorAuth::where('user_id', $user->id)->first();

        if (!$twoFactor || !$twoFactor->secret) {
            return false;
        }

        if (!$this->verifyCode($twoFactor->secret, $code)) {
            return false;
        }

        // Enable 2FA
        $twoFactor->update(['enabled' => true]);
        $user->update(['two_factor_enabled' => true]);

        return true;
    }

    /**
     * Validate a TOTP code (for ongoing auth)
     */
    public function validate(User $user, string $code): bool
    {
        $twoFactor = TwoFactorAuth::where('user_id', $user->id)->first();

        if (!$twoFactor || !$twoFactor->enabled) {
            return false;
        }

        // Check TOTP code
        if ($this->verifyCode($twoFactor->secret, $code)) {
            return true;
        }

        // Check backup code
        return $this->verifyBackupCode($user, $code);
    }

    /**
     * Disable 2FA for user
     */
    public function disable(User $user, string $code): bool
    {
        if (!$this->validate($user, $code)) {
            return false;
        }

        $twoFactor = TwoFactorAuth::where('user_id', $user->id)->first();
        if ($twoFactor) {
            $twoFactor->update([
                'enabled' => false,
                'secret' => null,
                'backup_codes' => null,
            ]);
        }

        $user->update(['two_factor_enabled' => false]);

        return true;
    }

    /**
     * Verify a backup code and remove it if valid
     */
    public function verifyBackupCode(User $user, string $code): bool
    {
        $twoFactor = TwoFactorAuth::where('user_id', $user->id)->first();

        if (!$twoFactor || empty($twoFactor->backup_codes)) {
            return false;
        }

        $normalizedCode = strtoupper(str_replace(['-', ' '], '', $code));
        $backupCodes = $twoFactor->backup_codes;

        foreach ($backupCodes as $index => $hashedCode) {
            if (Hash::check($normalizedCode, $hashedCode)) {
                // Remove used code
                unset($backupCodes[$index]);
                $twoFactor->update(['backup_codes' => array_values($backupCodes)]);
                return true;
            }
        }

        return false;
    }

    /**
     * Generate new backup codes
     */
    public function regenerateBackupCodes(User $user): array
    {
        $codes = [];
        $hashedCodes = [];

        for ($i = 0; $i < self::BACKUP_CODES_COUNT; $i++) {
            $code = $this->generateBackupCode();
            $codes[] = $code;
            $hashedCodes[] = Hash::make($code);
        }

        TwoFactorAuth::where('user_id', $user->id)->update([
            'backup_codes' => $hashedCodes,
        ]);

        return $codes;
    }

    /**
     * Generate a random secret key (Base32 encoded)
     */
    private function generateSecret(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';

        for ($i = 0; $i < 16; $i++) {
            $secret .= $chars[random_int(0, 31)];
        }

        return $secret;
    }

    /**
     * Generate QR code URL for authenticator apps
     */
    private function generateQrCodeUrl(string $email, string $secret): string
    {
        $issuer = urlencode(self::ISSUER);
        $label = urlencode($email);

        // otpauth://totp/ServicePro:user@email.com?secret=SECRET&issuer=ServicePro
        $otpauth = "otpauth://totp/{$issuer}:{$label}?secret={$secret}&issuer={$issuer}";

        // Use Google Charts API to generate QR code
        return 'https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' . urlencode($otpauth);
    }

    /**
     * Verify a TOTP code
     */
    private function verifyCode(string $secret, string $code): bool
    {
        // Normalize code (remove spaces/dashes)
        $code = preg_replace('/\D/', '', $code);

        if (strlen($code) !== 6) {
            return false;
        }

        // Get current time counter
        $timeCounter = floor(time() / 30);

        // Check current time window and adjacent windows (+-1)
        for ($i = -1; $i <= 1; $i++) {
            $calculatedCode = $this->generateTOTP($secret, $timeCounter + $i);
            if (hash_equals($calculatedCode, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate TOTP code for a given time counter
     */
    private function generateTOTP(string $secret, int $counter): string
    {
        // Decode base32 secret
        $secretKey = $this->base32Decode($secret);

        // Pack counter as 64-bit big-endian
        $counterBytes = pack('N*', 0, $counter);

        // HMAC-SHA1
        $hash = hash_hmac('sha1', $counterBytes, $secretKey, true);

        // Dynamic truncation
        $offset = ord($hash[19]) & 0x0F;
        $code = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        ) % 1000000;

        return str_pad($code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Decode Base32 string
     */
    private function base32Decode(string $encoded): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $encoded = strtoupper($encoded);
        $encoded = str_replace('=', '', $encoded);

        $buffer = 0;
        $bufferLength = 0;
        $output = '';

        for ($i = 0; $i < strlen($encoded); $i++) {
            $char = $encoded[$i];
            $value = strpos($chars, $char);

            if ($value === false) continue;

            $buffer = ($buffer << 5) | $value;
            $bufferLength += 5;

            if ($bufferLength >= 8) {
                $bufferLength -= 8;
                $output .= chr(($buffer >> $bufferLength) & 0xFF);
            }
        }

        return $output;
    }

    /**
     * Generate a backup code
     */
    private function generateBackupCode(): string
    {
        return strtoupper(bin2hex(random_bytes(4)));
    }
}
