<?php

namespace App\Services;

use App\Models\TwoFactorAuth;
use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Iniciar configuracao do 2FA para o usuario
     */
    public function initiate(User $user): array
    {
        $twoFactor = TwoFactorAuth::getOrCreateForUser($user);

        // Gerar novo secret
        $secret = $this->google2fa->generateSecretKey();

        $twoFactor->update([
            'secret' => $secret,
            'enabled' => false,
        ]);

        // Gerar QR Code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ];
    }

    /**
     * Verificar codigo e ativar 2FA
     */
    public function verify(User $user, string $code): bool
    {
        $twoFactor = $user->twoFactorAuth;

        if (!$twoFactor || !$twoFactor->secret) {
            return false;
        }

        $valid = $this->google2fa->verifyKey($twoFactor->secret, $code);

        if ($valid) {
            $twoFactor->enable();
        }

        return $valid;
    }

    /**
     * Validar codigo 2FA para login
     */
    public function validate(User $user, string $code): bool
    {
        $twoFactor = $user->twoFactorAuth;

        if (!$twoFactor || !$twoFactor->enabled) {
            return true; // 2FA nao ativado, permitir
        }

        // Primeiro tentar codigo TOTP
        $valid = $this->google2fa->verifyKey($twoFactor->secret, $code);

        if ($valid) {
            $twoFactor->markAsUsed();
            return true;
        }

        // Tentar codigo de backup
        if ($twoFactor->useBackupCode($code)) {
            return true;
        }

        return false;
    }

    /**
     * Desativar 2FA
     */
    public function disable(User $user, string $code): bool
    {
        // Verificar codigo antes de desativar
        if (!$this->validate($user, $code)) {
            return false;
        }

        $twoFactor = $user->twoFactorAuth;
        if ($twoFactor) {
            $twoFactor->disable();
        }

        return true;
    }

    /**
     * Gerar novos codigos de backup
     */
    public function regenerateBackupCodes(User $user): array
    {
        $twoFactor = $user->twoFactorAuth;

        if (!$twoFactor || !$twoFactor->enabled) {
            return [];
        }

        return $twoFactor->generateBackupCodes();
    }

    /**
     * Verificar se usuario tem 2FA ativado
     */
    public function isEnabled(User $user): bool
    {
        return $user->two_factor_enabled;
    }

    /**
     * Obter status do 2FA do usuario
     */
    public function getStatus(User $user): array
    {
        $twoFactor = $user->twoFactorAuth;

        return [
            'enabled' => $user->two_factor_enabled,
            'verified_at' => $twoFactor?->verified_at,
            'last_used_at' => $twoFactor?->last_used_at,
            'backup_codes_remaining' => $twoFactor?->getRemainingBackupCodesCount() ?? 0,
        ];
    }
}
