<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['group', 'key', 'value', 'type'];

    const CACHE_KEY = 'platform_settings';
    const CACHE_TTL = 3600; // 1 hora

    /**
     * Obter todas as settings agrupadas (com cache)
     */
    public static function getAllCached(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            $settings = self::all();

            $grouped = [];
            foreach ($settings as $setting) {
                $grouped[$setting->group][$setting->key] = $setting->value;
            }

            return $grouped;
        });
    }

    /**
     * Obter settings publicas para o frontend
     */
    public static function getPublicSettings(): array
    {
        $all = self::getAllCached();

        // Retorna todas as settings exceto dados sensiveis
        return [
            'branding' => $all['branding'] ?? [],
            'theme' => $all['theme'] ?? [],
            'home' => $all['home'] ?? [],
            'footer' => $all['footer'] ?? [],
            'seo' => $all['seo'] ?? [],
            'contact' => $all['contact'] ?? [],
            'social' => $all['social'] ?? [],
            'dashboard_cliente' => $all['dashboard_cliente'] ?? [],
            'dashboard_empresa' => $all['dashboard_empresa'] ?? [],
            'dashboard_cards' => $all['dashboard_cards'] ?? [],
            'reports' => $all['reports'] ?? [],
            'ranking' => $all['ranking'] ?? [],
        ];
    }

    /**
     * Obter uma setting especifica
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Definir valor de uma setting
     */
    public static function set(string $key, $value, string $group = 'general', string $type = 'text'): self
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group, 'type' => $type]
        );

        self::clearCache();
        return $setting;
    }

    /**
     * Atualizar multiplas settings de uma vez
     */
    public static function setMany(array $settings): void
    {
        foreach ($settings as $group => $items) {
            if (is_array($items)) {
                foreach ($items as $key => $value) {
                    self::updateOrCreate(
                        ['key' => $key],
                        [
                            'value' => is_array($value) ? json_encode($value) : $value,
                            'group' => $group,
                            'type' => is_array($value) ? 'json' : 'text'
                        ]
                    );
                }
            }
        }

        self::clearCache();
    }

    /**
     * Limpar cache
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Accessor para deserializar JSON automaticamente
     */
    public function getValueAttribute($value)
    {
        if ($this->type === 'json' && $value) {
            $decoded = json_decode($value, true);
            return $decoded !== null ? $decoded : $value;
        }

        if ($this->type === 'boolean') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        return $value;
    }
}
