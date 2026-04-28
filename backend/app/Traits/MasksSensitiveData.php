<?php

namespace App\Traits;

/**
 * Trait para mascarar dados sensíveis nas respostas da API
 *
 * Uso: Adicione a propriedade $maskedFields no model com os campos a serem mascarados
 *
 * protected array $maskedFields = [
 *     'cpf' => 'cpf',      // Mostra: ***.123.456-**
 *     'cnpj' => 'cnpj',    // Mostra: **.456.789/0001-**
 *     'telefone' => 'phone', // Mostra: (11) *****-1234
 *     'email' => 'email',  // Mostra: j***@email.com
 * ];
 */
trait MasksSensitiveData
{
    /**
     * Get the list of fields to mask
     */
    protected function getMaskedFields(): array
    {
        return $this->maskedFields ?? [];
    }

    /**
     * Check if masking is enabled (can be disabled for admin)
     */
    protected function shouldMaskData(): bool
    {
        // Skip masking if explicitly disabled
        if (property_exists($this, 'disableMasking') && $this->disableMasking) {
            return false;
        }

        // Skip masking for admin users
        $user = auth()->user();
        if ($user && method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return false;
        }

        return true;
    }

    /**
     * Override toArray to mask sensitive data
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        if ($this->shouldMaskData()) {
            foreach ($this->getMaskedFields() as $field => $type) {
                if (isset($array[$field]) && $array[$field] !== null) {
                    $array[$field] = $this->maskValue($array[$field], $type);
                }
            }
        }

        return $array;
    }

    /**
     * Mask a value based on its type
     */
    protected function maskValue(string $value, string $type): string
    {
        return match ($type) {
            'cpf' => $this->maskCpf($value),
            'cnpj' => $this->maskCnpj($value),
            'phone', 'telefone' => $this->maskPhone($value),
            'email' => $this->maskEmail($value),
            'partial' => $this->maskPartial($value),
            default => $this->maskGeneric($value),
        };
    }

    /**
     * Mask CPF: 123.456.789-00 -> ***.456.789-**
     */
    protected function maskCpf(string $cpf): string
    {
        $clean = preg_replace('/\D/', '', $cpf);
        if (strlen($clean) !== 11) return str_repeat('*', strlen($cpf));

        return '***.' . substr($clean, 3, 3) . '.' . substr($clean, 6, 3) . '-**';
    }

    /**
     * Mask CNPJ: 12.345.678/0001-90 -> **.345.678/0001-**
     */
    protected function maskCnpj(string $cnpj): string
    {
        $clean = preg_replace('/\D/', '', $cnpj);
        if (strlen($clean) !== 14) return str_repeat('*', strlen($cnpj));

        return '**.' . substr($clean, 2, 3) . '.' . substr($clean, 5, 3) . '/' . substr($clean, 8, 4) . '-**';
    }

    /**
     * Mask phone: (11) 99999-1234 -> (11) *****-1234
     */
    protected function maskPhone(string $phone): string
    {
        $clean = preg_replace('/\D/', '', $phone);
        $len = strlen($clean);

        if ($len < 8) return str_repeat('*', strlen($phone));

        // Keep area code and last 4 digits
        if ($len >= 10) {
            $area = substr($clean, 0, 2);
            $last = substr($clean, -4);
            $masked = str_repeat('*', $len - 6);
            return "({$area}) {$masked}-{$last}";
        }

        $last = substr($clean, -4);
        $masked = str_repeat('*', $len - 4);
        return "{$masked}-{$last}";
    }

    /**
     * Mask email: joao@email.com -> j***@email.com
     */
    protected function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) return str_repeat('*', strlen($email));

        $local = $parts[0];
        $domain = $parts[1];

        if (strlen($local) <= 2) {
            $maskedLocal = $local[0] . '*';
        } else {
            $maskedLocal = $local[0] . str_repeat('*', strlen($local) - 1);
        }

        return $maskedLocal . '@' . $domain;
    }

    /**
     * Mask partial: Show first and last 2 characters
     */
    protected function maskPartial(string $value): string
    {
        $len = strlen($value);
        if ($len <= 4) return str_repeat('*', $len);

        return substr($value, 0, 2) . str_repeat('*', $len - 4) . substr($value, -2);
    }

    /**
     * Generic mask: Hide middle portion
     */
    protected function maskGeneric(string $value): string
    {
        $len = strlen($value);
        if ($len <= 2) return str_repeat('*', $len);

        $show = max(1, intval($len * 0.2));
        return substr($value, 0, $show) . str_repeat('*', $len - $show * 2) . substr($value, -$show);
    }

    /**
     * Get unmasked value (for internal use only)
     */
    public function getUnmasked(string $field): ?string
    {
        return $this->getAttribute($field);
    }

    /**
     * Disable masking for this instance
     */
    public function withoutMasking(): self
    {
        $this->disableMasking = true;
        return $this;
    }
}
