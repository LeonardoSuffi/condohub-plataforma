<?php

namespace App\Traits;

use Illuminate\Support\Facades\Crypt;

/**
 * Trait para criptografar/descriptografar dados sensíveis
 *
 * Uso: Adicione a propriedade $encryptedFields no model com os campos a serem criptografados
 *
 * protected array $encryptedFields = ['cpf', 'telefone'];
 */
trait EncryptsSensitiveData
{
    /**
     * Boot the trait
     */
    public static function bootEncryptsSensitiveData(): void
    {
        // Encrypt before saving
        static::saving(function ($model) {
            $model->encryptFields();
        });

        // Decrypt after retrieving
        static::retrieved(function ($model) {
            $model->decryptFields();
        });
    }

    /**
     * Initialize the trait for fresh models
     */
    public function initializeEncryptsSensitiveData(): void
    {
        // Nothing needed here
    }

    /**
     * Get the list of fields to encrypt
     */
    protected function getEncryptedFields(): array
    {
        return $this->encryptedFields ?? [];
    }

    /**
     * Encrypt the sensitive fields
     */
    protected function encryptFields(): void
    {
        foreach ($this->getEncryptedFields() as $field) {
            if (isset($this->attributes[$field]) && $this->attributes[$field] !== null) {
                $value = $this->attributes[$field];

                // Skip if already encrypted (starts with "eyJ" - base64 JSON)
                if (!$this->isEncrypted($value)) {
                    $this->attributes[$field] = Crypt::encryptString($value);
                }
            }
        }
    }

    /**
     * Decrypt the sensitive fields
     */
    protected function decryptFields(): void
    {
        foreach ($this->getEncryptedFields() as $field) {
            if (isset($this->attributes[$field]) && $this->attributes[$field] !== null) {
                $value = $this->attributes[$field];

                // Only decrypt if it appears to be encrypted
                if ($this->isEncrypted($value)) {
                    try {
                        $this->attributes[$field] = Crypt::decryptString($value);
                    } catch (\Exception $e) {
                        // If decryption fails, leave as is (might be plain text)
                        \Log::warning("Failed to decrypt field {$field}", [
                            'model' => get_class($this),
                            'id' => $this->getKey(),
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Check if a value appears to be encrypted
     */
    protected function isEncrypted(string $value): bool
    {
        // Laravel encrypted strings start with "eyJ" (base64 of {"iv":...)
        return strlen($value) > 100 && str_starts_with($value, 'eyJ');
    }

    /**
     * Get the original (encrypted) value of a field
     */
    public function getEncryptedValue(string $field): ?string
    {
        if (!in_array($field, $this->getEncryptedFields())) {
            return null;
        }

        return $this->getOriginal($field);
    }

    /**
     * Manually encrypt a value
     */
    public static function encrypt(string $value): string
    {
        return Crypt::encryptString($value);
    }

    /**
     * Manually decrypt a value
     */
    public static function decrypt(string $value): string
    {
        return Crypt::decryptString($value);
    }
}
