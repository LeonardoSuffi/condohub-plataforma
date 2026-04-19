<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SocialLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'profile_id',
        'profile_type',
        'platform',
        'url',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    // Platforms
    const PLATFORM_INSTAGRAM = 'instagram';
    const PLATFORM_FACEBOOK = 'facebook';
    const PLATFORM_LINKEDIN = 'linkedin';
    const PLATFORM_TWITTER = 'twitter';
    const PLATFORM_YOUTUBE = 'youtube';
    const PLATFORM_TIKTOK = 'tiktok';
    const PLATFORM_WHATSAPP = 'whatsapp';
    const PLATFORM_WEBSITE = 'website';

    public static function getPlatforms(): array
    {
        return [
            self::PLATFORM_INSTAGRAM,
            self::PLATFORM_FACEBOOK,
            self::PLATFORM_LINKEDIN,
            self::PLATFORM_TWITTER,
            self::PLATFORM_YOUTUBE,
            self::PLATFORM_TIKTOK,
            self::PLATFORM_WHATSAPP,
            self::PLATFORM_WEBSITE,
        ];
    }

    public static function getPlatformLabels(): array
    {
        return [
            self::PLATFORM_INSTAGRAM => 'Instagram',
            self::PLATFORM_FACEBOOK => 'Facebook',
            self::PLATFORM_LINKEDIN => 'LinkedIn',
            self::PLATFORM_TWITTER => 'Twitter/X',
            self::PLATFORM_YOUTUBE => 'YouTube',
            self::PLATFORM_TIKTOK => 'TikTok',
            self::PLATFORM_WHATSAPP => 'WhatsApp',
            self::PLATFORM_WEBSITE => 'Website',
        ];
    }

    public static function getPlatformIcons(): array
    {
        return [
            self::PLATFORM_INSTAGRAM => 'camera',
            self::PLATFORM_FACEBOOK => 'users',
            self::PLATFORM_LINKEDIN => 'briefcase',
            self::PLATFORM_TWITTER => 'at-sign',
            self::PLATFORM_YOUTUBE => 'video',
            self::PLATFORM_TIKTOK => 'music',
            self::PLATFORM_WHATSAPP => 'message-circle',
            self::PLATFORM_WEBSITE => 'globe',
        ];
    }

    // Relationships

    public function profile(): MorphTo
    {
        return $this->morphTo();
    }

    // Accessors

    public function getLabelAttribute(): string
    {
        return self::getPlatformLabels()[$this->platform] ?? $this->platform;
    }

    public function getIconAttribute(): string
    {
        return self::getPlatformIcons()[$this->platform] ?? 'link';
    }

    // Scopes

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('platform');
    }

    public function scopeForProfile($query, Model $profile)
    {
        return $query->where('profile_type', get_class($profile))
            ->where('profile_id', $profile->id);
    }

    // Validation helpers

    public static function getValidationRules(): array
    {
        return [
            'platform' => 'required|in:' . implode(',', self::getPlatforms()),
            'url' => 'required|url|max:500',
        ];
    }

    public static function formatWhatsAppUrl(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        return "https://wa.me/{$phone}";
    }
}
