<?php

namespace App\Services;

use App\Models\TwoFactorAuth;
use App\Models\User;

class TwoFactorService
{
    /**
     * Iniciar configuracao do 2FA para o usuario
     * Nota: Requer instalacao de pragmarx/google2fa-laravel para funcionalidade completa
     */
    public function initiate(User $user): array
    {
        // Placeholder - instale pragmarx/google2fa-laravel para funcionalidade completa
        $secret = $this->generateSimpleSecret();

        return [
            'secret' => $secret,
            'qr_code' => null,
            'backup_codes' => $this->generateBackupCodes(),
        ];
    }

    /**
     * Verificar codigo 2FA
     */
    public function verify(User $user, string $code): bool
    {
        // Placeholder - sempre retorna false sem a lib instalada
        return false;
    }

    /**
     * Habilitar 2FA apos verificacao
     */
    public function enable(User $user): bool
    {
        return false;
    }

    /**
     * Desabilitar 2FA
     */
    public function disable(User $user): bool
    {
        $twoFactor = TwoFactorAuth::where('user_id', $user->id)->first();

        if ($twoFactor) {
            $twoFactor->update([
                'enabled' => false,
                'secret' => null,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Verificar codigo de backup
     */
    public function verifyBackupCode(User $user, string $code): bool
    {
        return false;
    }

    /**
     * Gera secret simples (placeholder)
     */
    private function generateSimpleSecret(): string
    {
        return strtoupper(bin2hex(random_bytes(16)));
    }

    /**
     * Gerar codigos de backup
     */
    private function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        return $codes;
    }
}
