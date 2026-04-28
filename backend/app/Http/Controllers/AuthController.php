<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterEmpresaRequest;
use App\Http\Requests\RegisterClienteRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\ClientProfile;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\PasswordHistory;
use App\Services\LoginSecurityService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected LoginSecurityService $loginSecurity;
    protected ActivityLogService $activityLog;

    public function __construct(LoginSecurityService $loginSecurity, ActivityLogService $activityLog)
    {
        $this->loginSecurity = $loginSecurity;
        $this->activityLog = $activityLog;
    }

    /**
     * Get maximum failed login attempts before blocking
     */
    protected function getMaxFailedAttempts(): int
    {
        return config('security.login.max_failed_attempts', 5);
    }

    /**
     * Get minutes to block after max failed attempts
     */
    protected function getBlockDurationMinutes(): int
    {
        return config('security.login.block_duration_minutes', 30);
    }

    /**
     * Get session duration in minutes (absolute timeout)
     */
    protected function getSessionDurationMinutes(): int
    {
        return config('security.session.duration_minutes', 120);
    }

    /**
     * Cadastro de empresa
     */
    public function registerEmpresa(RegisterEmpresaRequest $request)
    {
        $validated = $request->validated();

        // Cria o usuário
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => 'empresa',
        ]);

        // Cria o perfil da empresa
        $profile = CompanyProfile::create([
            'user_id' => $user->id,
            'cnpj' => $validated['cnpj'],
            'razao_social' => $validated['razao_social'],
            'nome_fantasia' => $validated['nome_fantasia'] ?? null,
            'segmento' => $validated['segmento'],
            'telefone' => $validated['telefone'] ?? null,
        ]);

        // Atribui plano gratuito automaticamente
        $freePlan = Plan::where('slug', 'gratuito')->first();
        if ($freePlan) {
            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $freePlan->id,
                'status' => 'ativa',
                'starts_at' => now(),
                'ends_at' => now()->addDays($freePlan->getDurationInDays()),
            ]);
        }

        // Generate session ID and token
        $sessionId = $this->generateSessionId();
        $user->update([
            'current_session_id' => $sessionId,
            'session_expires_at' => now()->addMinutes($this->getSessionDurationMinutes()),
            'last_activity_at' => now(),
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        $token = $user->createToken($sessionId)->plainTextToken;

        // Save initial password to history
        PasswordHistory::addToHistory($user->id, $user->password);

        // Send email verification
        $user->sendEmailVerificationNotification();

        return $this->success([
            'user' => $user->load('companyProfile'),
            'token' => $token,
            'session_expires_at' => $user->session_expires_at->toISOString(),
            'email_verification_sent' => true,
        ], 'Empresa cadastrada com sucesso. Verifique seu email.', 201);
    }

    /**
     * Cadastro de cliente
     */
    public function registerCliente(RegisterClienteRequest $request)
    {
        $validated = $request->validated();

        // Cria o usuario
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => 'cliente',
        ]);

        // Cria o perfil do cliente
        $profile = ClientProfile::create([
            'user_id' => $user->id,
            'cpf' => $validated['cpf'],
            'telefone' => $validated['telefone'],
        ]);

        // Generate session ID and token
        $sessionId = $this->generateSessionId();
        $user->update([
            'current_session_id' => $sessionId,
            'session_expires_at' => now()->addMinutes($this->getSessionDurationMinutes()),
            'last_activity_at' => now(),
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        $token = $user->createToken($sessionId)->plainTextToken;

        // Save initial password to history
        PasswordHistory::addToHistory($user->id, $user->password);

        // Send email verification
        $user->sendEmailVerificationNotification();

        return $this->success([
            'user' => $user->load('clientProfile'),
            'token' => $token,
            'session_expires_at' => $user->session_expires_at->toISOString(),
            'email_verification_sent' => true,
        ], 'Cliente cadastrado com sucesso. Verifique seu email.', 201);
    }

    /**
     * Login
     */
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        // Check if user exists
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        // Check if user is permanently blocked
        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'email' => ['Sua conta foi bloqueada. Motivo: ' . ($user->blocked_reason ?? 'Entre em contato com o suporte.')],
            ]);
        }

        // Check if user is temporarily blocked due to failed attempts
        if ($this->isTemporarilyBlocked($user)) {
            $minutesRemaining = now()->diffInMinutes($user->last_failed_login_at->addMinutes($this->getBlockDurationMinutes()));
            throw ValidationException::withMessages([
                'email' => ["Muitas tentativas de login. Tente novamente em {$minutesRemaining} minutos."],
            ]);
        }

        // Check if CAPTCHA is required
        if ($this->loginSecurity->requiresCaptcha($user)) {
            $captchaToken = $validated['captcha_token'] ?? null;
            if (!$captchaToken || !$this->verifyCaptcha($captchaToken)) {
                throw ValidationException::withMessages([
                    'captcha' => ['Verificacao de seguranca necessaria. Complete o CAPTCHA.'],
                    'requires_captcha' => true,
                ]);
            }
        }

        // Validate password
        if (!Hash::check($validated['password'], $user->password)) {
            $this->recordFailedAttempt($user);

            // Log failed login attempt
            $this->activityLog->logFailedLogin(
                $user,
                $validated['email'],
                $request->ip(),
                $request->userAgent()
            );

            // Enable CAPTCHA after 3 failed attempts
            if ($user->failed_login_attempts >= 3) {
                $this->loginSecurity->enableCaptchaRequirement($user);
                $this->activityLog->logCaptchaTriggered($user);
            }

            $remainingAttempts = $this->getMaxFailedAttempts() - $user->failed_login_attempts;
            $requiresCaptcha = $user->failed_login_attempts >= 3;

            $message = $remainingAttempts > 0
                ? "Credenciais inválidas. Tentativas restantes: {$remainingAttempts}"
                : 'Muitas tentativas de login. Tente novamente em ' . $this->getBlockDurationMinutes() . ' minutos.';

            throw ValidationException::withMessages([
                'email' => [$message],
                'requires_captcha' => $requiresCaptcha,
            ]);
        }

        // Successful login - reset failed attempts and clear CAPTCHA
        $this->resetFailedAttempts($user);
        $this->loginSecurity->clearCaptchaRequirement($user);

        // Generate new session ID (invalidates any previous sessions)
        $sessionId = $this->generateSessionId();

        // Revoke all previous tokens for this user (single session enforcement)
        $user->tokens()->delete();

        // Update login info with session expiry
        $user->update([
            'current_session_id' => $sessionId,
            'session_expires_at' => now()->addMinutes($this->getSessionDurationMinutes()),
            'last_activity_at' => now(),
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        // Create new token with session ID as name
        $token = $user->createToken($sessionId)->plainTextToken;

        // Record login history and send notification for new device
        $this->loginSecurity->recordLogin($user, $request);

        // Log successful login
        $this->activityLog->logLogin($user, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Carrega o perfil apropriado
        if ($user->isEmpresa()) {
            $user->load('companyProfile', 'activeSubscription.plan');
        } elseif ($user->isCliente()) {
            $user->load('clientProfile');
        }

        return $this->success([
            'user' => $user,
            'token' => $token,
            'session_expires_at' => $user->session_expires_at->toISOString(),
            'email_verified' => $user->hasVerifiedEmail(),
        ], 'Login realizado com sucesso');
    }

    /**
     * Verify Google reCAPTCHA v2 token
     */
    private function verifyCaptcha(?string $token): bool
    {
        if (!$token) return false;

        $secret = config('services.recaptcha.secret');

        if (!$secret) {
            // If no secret configured, log warning and accept (development mode)
            \Log::warning('reCAPTCHA secret not configured - accepting all tokens');
            return true;
        }

        try {
            $response = file_get_contents(
                'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secret) . '&response=' . urlencode($token)
            );

            if ($response === false) {
                \Log::error('reCAPTCHA API request failed');
                return false;
            }

            $result = json_decode($response, true);

            if (!isset($result['success'])) {
                \Log::error('reCAPTCHA invalid response', ['response' => $result]);
                return false;
            }

            if (!$result['success']) {
                \Log::info('reCAPTCHA verification failed', [
                    'error-codes' => $result['error-codes'] ?? []
                ]);
            }

            return $result['success'];
        } catch (\Exception $e) {
            \Log::error('reCAPTCHA verification exception', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $token = $user->currentAccessToken();

        // Clear session data
        $user->update([
            'current_session_id' => null,
            'session_expires_at' => null,
            'last_activity_at' => null,
        ]);

        // Delete current token
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        // Log logout
        $this->activityLog->logLogout($user);

        return $this->success(null, 'Logout realizado com sucesso');
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request)
    {
        $user = $request->user();
        $tokensCount = $user->tokens()->count();

        // Clear session data
        $user->update([
            'current_session_id' => null,
            'session_expires_at' => null,
            'last_activity_at' => null,
        ]);

        // Delete all tokens
        $user->tokens()->delete();

        // Log logout all
        $this->activityLog->logLogoutAll($user, $tokensCount);

        return $this->success(null, 'Logout realizado em todos os dispositivos');
    }

    /**
     * Get current session info
     */
    public function sessionInfo(Request $request)
    {
        $user = $request->user();

        return $this->success([
            'last_login_at' => $user->last_login_at,
            'last_login_ip' => $user->last_login_ip,
            'last_login_device' => $user->last_login_device,
            'current_session_id' => $user->current_session_id,
            'session_expires_at' => $user->session_expires_at,
            'last_activity_at' => $user->last_activity_at,
            'session_timeout_minutes' => $this->getSessionDurationMinutes(),
        ]);
    }

    /**
     * Solicita link de recuperação de senha
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $this->success(null, 'Link de recuperação enviado para o e-mail');
    }

    /**
     * Redefine a senha
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => [
                'required',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/',
            ],
        ], [
            'password.regex' => 'A senha deve conter pelo menos: 1 letra maiuscula, 1 minuscula, 1 numero e 1 caractere especial.',
        ]);

        // Check password history
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $recentHashes = PasswordHistory::getRecentHashes($user->id, 5);
            foreach ($recentHashes as $hash) {
                if (Hash::check($request->password, $hash)) {
                    throw ValidationException::withMessages([
                        'password' => ['Esta senha foi usada recentemente. Por favor, escolha uma senha diferente.'],
                    ]);
                }
            }
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Save current password to history
                PasswordHistory::addToHistory($user->id, $user->password);

                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                    // Clear session on password reset
                    'current_session_id' => null,
                ])->save();

                // Revoke all tokens
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        // Log password reset
        $resetUser = User::where('email', $request->email)->first();
        if ($resetUser) {
            $this->activityLog->logPasswordReset($resetUser);
        }

        return $this->success(null, 'Senha redefinida com sucesso');
    }

    /**
     * Verify email address
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            throw ValidationException::withMessages([
                'email' => ['Link de verificacao invalido.'],
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email ja verificado anteriormente.');
        }

        $user->markEmailAsVerified();

        // Log email verification
        $this->activityLog->logEmailVerified($user);

        return $this->success(null, 'Email verificado com sucesso!');
    }

    /**
     * Resend email verification
     */
    public function resendVerificationEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal if user exists
            return $this->success(null, 'Se o email existir, um link de verificacao sera enviado.');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email ja verificado.');
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Link de verificacao enviado.');
    }

    /**
     * Generate a unique session ID
     */
    private function generateSessionId(): string
    {
        return Str::uuid()->toString();
    }

    /**
     * Check if user is temporarily blocked due to failed attempts
     */
    private function isTemporarilyBlocked(User $user): bool
    {
        if ($user->failed_login_attempts < $this->getMaxFailedAttempts()) {
            return false;
        }

        if (!$user->last_failed_login_at) {
            return false;
        }

        // Check if block duration has passed
        return $user->last_failed_login_at->addMinutes($this->getBlockDurationMinutes())->isFuture();
    }

    /**
     * Record a failed login attempt
     */
    private function recordFailedAttempt(User $user): void
    {
        $user->update([
            'failed_login_attempts' => $user->failed_login_attempts + 1,
            'last_failed_login_at' => now(),
        ]);
    }

    /**
     * Reset failed login attempts after successful login
     */
    private function resetFailedAttempts(User $user): void
    {
        $user->update([
            'failed_login_attempts' => 0,
            'last_failed_login_at' => null,
        ]);
    }
}
