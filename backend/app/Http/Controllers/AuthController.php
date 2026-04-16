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

        // Gera token de acesso
        $token = $user->createToken('auth-token')->plainTextToken;

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

        // Gera token de acesso
        $token = $user->createToken('auth-token')->plainTextToken;

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

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        // Revoga tokens anteriores (opcional)
        // $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

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
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logout realizado com sucesso');
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
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $this->success(null, 'Senha redefinida com sucesso');
    }
}
