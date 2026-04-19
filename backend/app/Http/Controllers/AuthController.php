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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Maximum failed login attempts before blocking
     */
    const MAX_FAILED_ATTEMPTS = 5;

    /**
     * Minutes to block after max failed attempts
     */
    const BLOCK_DURATION_MINUTES = 30;

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
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        $token = $user->createToken($sessionId)->plainTextToken;

        return $this->success([
            'user' => $user->load('companyProfile'),
            'token' => $token,
        ], 'Empresa cadastrada com sucesso', 201);
    }

    /**
     * Cadastro de cliente (síndico/administradora/condomínio)
     */
    public function registerCliente(RegisterClienteRequest $request)
    {
        $validated = $request->validated();

        // Cria o usuário
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => 'cliente',
        ]);

        // Cria o perfil do cliente
        $profile = ClientProfile::create([
            'user_id' => $user->id,
            'cpf' => $validated['cpf'] ?? null,
            'cnpj' => $validated['cnpj'] ?? null,
            'tipo' => $validated['tipo'],
            'telefone' => $validated['telefone'] ?? null,
            'nome_condominio' => $validated['nome_condominio'] ?? null,
        ]);

        // Generate session ID and token
        $sessionId = $this->generateSessionId();
        $user->update([
            'current_session_id' => $sessionId,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        $token = $user->createToken($sessionId)->plainTextToken;

        return $this->success([
            'user' => $user->load('clientProfile'),
            'token' => $token,
        ], 'Cliente cadastrado com sucesso', 201);
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
            $minutesRemaining = now()->diffInMinutes($user->last_failed_login_at->addMinutes(self::BLOCK_DURATION_MINUTES));
            throw ValidationException::withMessages([
                'email' => ["Muitas tentativas de login. Tente novamente em {$minutesRemaining} minutos."],
            ]);
        }

        // Validate password
        if (!Hash::check($validated['password'], $user->password)) {
            $this->recordFailedAttempt($user);

            $remainingAttempts = self::MAX_FAILED_ATTEMPTS - $user->failed_login_attempts;
            $message = $remainingAttempts > 0
                ? "Credenciais inválidas. Tentativas restantes: {$remainingAttempts}"
                : 'Muitas tentativas de login. Tente novamente em ' . self::BLOCK_DURATION_MINUTES . ' minutos.';

            throw ValidationException::withMessages([
                'email' => [$message],
            ]);
        }

        // Successful login - reset failed attempts
        $this->resetFailedAttempts($user);

        // Generate new session ID (invalidates any previous sessions)
        $sessionId = $this->generateSessionId();

        // Revoke all previous tokens for this user (single session enforcement)
        $user->tokens()->delete();

        // Update login info
        $user->update([
            'current_session_id' => $sessionId,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        // Create new token with session ID as name
        $token = $user->createToken($sessionId)->plainTextToken;

        // Carrega o perfil apropriado
        if ($user->isEmpresa()) {
            $user->load('companyProfile', 'activeSubscription.plan');
        } elseif ($user->isCliente()) {
            $user->load('clientProfile');
        }

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Login realizado com sucesso');
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $token = $user->currentAccessToken();

        // Clear session ID
        $user->update([
            'current_session_id' => null,
        ]);

        // Delete current token
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return $this->success(null, 'Logout realizado com sucesso');
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request)
    {
        $user = $request->user();

        // Clear session ID
        $user->update([
            'current_session_id' => null,
        ]);

        // Delete all tokens
        $user->tokens()->delete();

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
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
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

        return $this->success(null, 'Senha redefinida com sucesso');
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
        if ($user->failed_login_attempts < self::MAX_FAILED_ATTEMPTS) {
            return false;
        }

        if (!$user->last_failed_login_at) {
            return false;
        }

        // Check if block duration has passed
        return $user->last_failed_login_at->addMinutes(self::BLOCK_DURATION_MINUTES)->isFuture();
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
