<?php

namespace App\Services;

use App\Models\PasswordHistory;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PasswordHistoryService
{
    /**
     * Number of previous passwords to check against
     */
    const PASSWORD_HISTORY_COUNT = 5;

    /**
     * Check if password was used recently
     */
    public function wasRecentlyUsed(User $user, string $plainPassword): bool
    {
        $recentHashes = PasswordHistory::getRecentHashes(
            $user->id,
            self::PASSWORD_HISTORY_COUNT
        );

        // Also check current password
        if (Hash::check($plainPassword, $user->password)) {
            return true;
        }

        foreach ($recentHashes as $hash) {
            if (Hash::check($plainPassword, $hash)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Add current password to history before changing
     */
    public function recordCurrentPassword(User $user): void
    {
        PasswordHistory::addToHistory($user->id, $user->password);
    }

    /**
     * Validate and change password
     */
    public function changePassword(User $user, string $newPassword): array
    {
        // Check password strength
        if (!$this->isStrongPassword($newPassword)) {
            return [
                'success' => false,
                'message' => 'A senha deve conter pelo menos: 1 letra maiuscula, 1 minuscula, 1 numero e 1 caractere especial.',
            ];
        }

        // Check password history
        if ($this->wasRecentlyUsed($user, $newPassword)) {
            return [
                'success' => false,
                'message' => 'Esta senha foi usada recentemente. Por favor, escolha uma senha diferente.',
            ];
        }

        // Record current password in history
        $this->recordCurrentPassword($user);

        // Update password
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return [
            'success' => true,
            'message' => 'Senha alterada com sucesso.',
        ];
    }

    /**
     * Check if password meets strength requirements
     */
    public function isStrongPassword(string $password): bool
    {
        // At least 8 characters
        if (strlen($password) < 8) return false;

        // At least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) return false;

        // At least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) return false;

        // At least one digit
        if (!preg_match('/\d/', $password)) return false;

        // At least one special character
        if (!preg_match('/[^A-Za-z\d]/', $password)) return false;

        return true;
    }
}
