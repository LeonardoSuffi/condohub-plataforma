<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Retorna dados do usuário autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Carrega o perfil apropriado
        if ($user->isEmpresa()) {
            $user->load('companyProfile', 'activeSubscription.plan');
        } elseif ($user->isCliente()) {
            $user->load('clientProfile');
        }

        // Adiciona informação de completude do perfil
        $user->profile_completion = $this->calculateProfileCompletion($user);

        return $this->success(['user' => $user], 'Dados do usuário');
    }

    /**
     * Calcula percentual de completude do perfil
     */
    protected function calculateProfileCompletion($user): array
    {
        $fields = [];
        $completed = 0;
        $total = 0;

        // Campos básicos do usuário
        $basicFields = [
            'name' => !empty($user->name),
            'email' => !empty($user->email),
            'foto' => !empty($user->foto_path),
        ];

        if ($user->isEmpresa() && $user->companyProfile) {
            $profile = $user->companyProfile;
            $profileFields = [
                'nome_fantasia' => !empty($profile->nome_fantasia),
                'segmento' => !empty($profile->segmento),
                'telefone' => !empty($profile->telefone),
                'endereco' => !empty($profile->endereco),
                'cidade' => !empty($profile->cidade),
                'estado' => !empty($profile->estado),
                'cep' => !empty($profile->cep),
                'descricao' => !empty($profile->descricao),
                'logo' => !empty($profile->logo_path),
            ];
            $fields = array_merge($basicFields, $profileFields);
        } elseif ($user->isCliente() && $user->clientProfile) {
            $profile = $user->clientProfile;
            $profileFields = [
                'telefone' => !empty($profile->telefone),
                'nome_condominio' => !empty($profile->nome_condominio),
                'endereco_condominio' => !empty($profile->endereco_condominio),
                'cidade' => !empty($profile->cidade),
                'estado' => !empty($profile->estado),
                'cep' => !empty($profile->cep),
                'num_unidades' => !empty($profile->num_unidades),
            ];
            $fields = array_merge($basicFields, $profileFields);
        } else {
            $fields = $basicFields;
        }

        foreach ($fields as $filled) {
            $total++;
            if ($filled) $completed++;
        }

        $percentage = $total > 0 ? round(($completed / $total) * 100) : 0;

        return [
            'percentage' => $percentage,
            'completed' => $completed,
            'total' => $total,
            'fields' => $fields,
        ];
    }

    /**
     * Atualiza perfil do usuário
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // Validação base
        $rules = [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8|confirmed',
        ];

        // Adiciona regras específicas por tipo
        if ($user->isEmpresa()) {
            $rules = array_merge($rules, [
                'nome_fantasia' => 'sometimes|string|max:255',
                'segmento' => 'sometimes|string|max:100',
                'telefone' => 'sometimes|string|max:20',
                'endereco' => 'sometimes|string|max:255',
                'cidade' => 'sometimes|string|max:100',
                'estado' => 'sometimes|string|size:2',
                'cep' => 'sometimes|string|max:10',
                'descricao' => 'sometimes|string|max:1000',
            ]);
        } elseif ($user->isCliente()) {
            $rules = array_merge($rules, [
                'telefone' => 'sometimes|string|max:20',
                'nome_condominio' => 'sometimes|string|max:255',
                'endereco_condominio' => 'sometimes|string|max:255',
                'cidade' => 'sometimes|string|max:100',
                'estado' => 'sometimes|string|size:2',
                'cep' => 'sometimes|string|max:10',
                'num_unidades' => 'sometimes|integer|min:1',
                'preferences' => 'sometimes|array',
            ]);
        }

        $validated = $request->validate($rules);

        // Atualiza dados do usuário
        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        // Atualiza perfil específico
        if ($user->isEmpresa() && $user->companyProfile) {
            $profileData = array_intersect_key($validated, array_flip([
                'nome_fantasia', 'segmento', 'telefone', 'endereco',
                'cidade', 'estado', 'cep', 'descricao'
            ]));
            if (!empty($profileData)) {
                $user->companyProfile->update($profileData);
            }
        } elseif ($user->isCliente() && $user->clientProfile) {
            $profileData = array_intersect_key($validated, array_flip([
                'telefone', 'nome_condominio', 'endereco_condominio',
                'cidade', 'estado', 'cep', 'num_unidades', 'preferences'
            ]));
            if (!empty($profileData)) {
                $user->clientProfile->update($profileData);
            }
        }

        // Recarrega dados
        $user->refresh();
        if ($user->isEmpresa()) {
            $user->load('companyProfile', 'activeSubscription.plan');
        } elseif ($user->isCliente()) {
            $user->load('clientProfile');
        }

        return $this->success($user, 'Perfil atualizado com sucesso');
    }

    /**
     * Upload de foto de perfil
     */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        // Remove foto antiga se existir
        if ($user->foto_path) {
            Storage::disk('public')->delete($user->foto_path);
        }

        // Salva nova foto
        $path = $request->file('foto')->store('fotos/usuarios', 'public');
        $user->foto_path = $path;
        $user->save();

        return $this->success([
            'foto_path' => $path,
            'foto_url' => Storage::url($path),
        ], 'Foto atualizada com sucesso');
    }

    /**
     * Upload de logo da empresa
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        if (!$user->isEmpresa() || !$user->companyProfile) {
            return $this->error('Apenas empresas podem fazer upload de logo', 403);
        }

        $profile = $user->companyProfile;

        // Remove logo antiga se existir
        if ($profile->logo_path) {
            Storage::disk('public')->delete($profile->logo_path);
        }

        // Salva nova logo
        $path = $request->file('logo')->store('logos/empresas', 'public');
        $profile->logo_path = $path;
        $profile->save();

        return $this->success([
            'logo_path' => $path,
            'logo_url' => Storage::url($path),
        ], 'Logo atualizada com sucesso');
    }

    /**
     * Remove foto de perfil
     */
    public function removePhoto(Request $request)
    {
        $user = $request->user();

        if ($user->foto_path) {
            Storage::disk('public')->delete($user->foto_path);
            $user->foto_path = null;
            $user->save();
        }

        return $this->success(null, 'Foto removida com sucesso');
    }

    /**
     * Remove logo da empresa
     */
    public function removeLogo(Request $request)
    {
        $user = $request->user();

        if (!$user->isEmpresa() || !$user->companyProfile) {
            return $this->error('Apenas empresas podem remover logo', 403);
        }

        $profile = $user->companyProfile;

        if ($profile->logo_path) {
            Storage::disk('public')->delete($profile->logo_path);
            $profile->logo_path = null;
            $profile->save();
        }

        return $this->success(null, 'Logo removida com sucesso');
    }

    /**
     * Upload de imagem de capa
     */
    public function uploadCover(Request $request)
    {
        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = $request->user();
        $profile = null;

        if ($user->isEmpresa() && $user->companyProfile) {
            $profile = $user->companyProfile;
        } elseif ($user->isCliente() && $user->clientProfile) {
            $profile = $user->clientProfile;
        }

        if (!$profile) {
            return $this->error('Perfil nao encontrado', 404);
        }

        // Remove capa antiga se existir
        if ($profile->cover_path) {
            Storage::disk('public')->delete($profile->cover_path);
        }

        // Salva nova capa
        $folder = $user->isEmpresa() ? 'covers/empresas' : 'covers/clientes';
        $path = $request->file('cover')->store($folder, 'public');
        $profile->cover_path = $path;
        $profile->save();

        return $this->success([
            'cover_path' => $path,
            'cover_url' => Storage::url($path),
        ], 'Capa atualizada com sucesso');
    }

    /**
     * Remove imagem de capa
     */
    public function removeCover(Request $request)
    {
        $user = $request->user();
        $profile = null;

        if ($user->isEmpresa() && $user->companyProfile) {
            $profile = $user->companyProfile;
        } elseif ($user->isCliente() && $user->clientProfile) {
            $profile = $user->clientProfile;
        }

        if (!$profile) {
            return $this->error('Perfil nao encontrado', 404);
        }

        if ($profile->cover_path) {
            Storage::disk('public')->delete($profile->cover_path);
            $profile->cover_path = null;
            $profile->save();
        }

        return $this->success(null, 'Capa removida com sucesso');
    }
}
