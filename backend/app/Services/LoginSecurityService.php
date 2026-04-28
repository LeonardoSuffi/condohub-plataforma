<?php

namespace App\Services;

use App\Models\LoginHistory;
use App\Models\User;
use App\Notifications\NewDeviceLoginNotification;
use Illuminate\Http\Request;

class LoginSecurityService
{
    /**
     * Record login and check if notification needed
     */
    public function recordLogin(User $user, Request $request): void
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        $fingerprint = $this->generateFingerprint($request);
        $location = $this->getLocationFromIp($ip);

        $loginHistory = LoginHistory::recordLogin(
            $user->id,
            $ip,
            $userAgent,
            $fingerprint,
            $location
        );

        // Send notification if new device
        if ($loginHistory->is_new_device && $user->hasNotificationEnabled('security')) {
            $this->sendNewDeviceNotification($user, $loginHistory);
        }
    }

    /**
     * Generate a device fingerprint from request
     */
    public function generateFingerprint(Request $request): string
    {
        $components = [
            $request->userAgent(),
            $request->header('Accept-Language'),
            $request->header('Accept-Encoding'),
        ];

        return hash('sha256', implode('|', array_filter($components)));
    }

    /**
     * Get approximate location from IP
     * Note: For production, use a proper GeoIP service like MaxMind
     */
    public function getLocationFromIp(string $ip): ?string
    {
        // Skip for localhost/private IPs
        if (in_array($ip, ['127.0.0.1', '::1']) || $this->isPrivateIp($ip)) {
            return 'Local';
        }

        // Validate IP address format
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return null;
        }

        // Check cache first (5 minute TTL)
        $cacheKey = 'geolocation_' . md5($ip);
        if (function_exists('cache') && $cached = cache($cacheKey)) {
            return $cached;
        }

        try {
            // Use HTTPS and set timeout
            $context = stream_context_create([
                'http' => [
                    'timeout' => 3, // 3 seconds timeout
                    'ignore_errors' => true,
                ],
                'ssl' => [
                    'verify_peer' => true,
                    'verify_peer_name' => true,
                ],
            ]);

            // Use ip-api.com with HTTPS (pro version) or fallback to ipinfo.io
            $response = @file_get_contents(
                "https://ipinfo.io/{$ip}/json",
                false,
                $context
            );

            if ($response) {
                $data = json_decode($response, true);
                if (isset($data['city']) && isset($data['country'])) {
                    $location = $data['city'] . ', ' . ($data['region'] ?? '') . ', ' . $data['country'];

                    // Cache for 5 minutes
                    if (function_exists('cache')) {
                        cache([$cacheKey => $location], now()->addMinutes(5));
                    }

                    return $location;
                }
            }
        } catch (\Exception $e) {
            \Log::debug('Geolocation lookup failed', ['ip' => $ip, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Check if IP is private
     */
    private function isPrivateIp(string $ip): bool
    {
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }

    /**
     * Send new device notification
     */
    public function sendNewDeviceNotification(User $user, LoginHistory $login): void
    {
        try {
            $user->notify(new NewDeviceLoginNotification(
                $login->ip_address,
                $login->user_agent,
                $login->location
            ));

            $login->update(['notification_sent' => true]);
        } catch (\Exception $e) {
            \Log::warning('Failed to send new device notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get recent login history for user
     */
    public function getLoginHistory(User $user, int $limit = 10)
    {
        return LoginHistory::getRecentLogins($user->id, $limit);
    }

    /**
     * Check if CAPTCHA is required for user
     */
    public function requiresCaptcha(User $user): bool
    {
        if ($user->requires_captcha && $user->captcha_required_until) {
            return now()->isBefore($user->captcha_required_until);
        }

        return $user->failed_login_attempts >= 3;
    }

    /**
     * Enable CAPTCHA requirement for user
     */
    public function enableCaptchaRequirement(User $user, int $durationMinutes = 30): void
    {
        $user->update([
            'requires_captcha' => true,
            'captcha_required_until' => now()->addMinutes($durationMinutes),
        ]);
    }

    /**
     * Clear CAPTCHA requirement after successful login
     */
    public function clearCaptchaRequirement(User $user): void
    {
        $user->update([
            'requires_captcha' => false,
            'captcha_required_until' => null,
        ]);
    }
}
