<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/',
            ],
            'cpf' => 'required|string|size:14|unique:client_profiles,cpf',
            'telefone' => 'required|string|min:14|max:15',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome e obrigatorio.',
            'name.min' => 'O nome deve ter pelo menos 3 caracteres.',
            'email.required' => 'O e-mail e obrigatorio.',
            'email.email' => 'Informe um e-mail valido.',
            'email.unique' => 'Este e-mail ja esta cadastrado.',
            'password.required' => 'A senha e obrigatoria.',
            'password.min' => 'A senha deve ter no minimo 8 caracteres.',
            'password.confirmed' => 'As senhas nao coincidem.',
            'password.regex' => 'A senha deve conter pelo menos: 1 letra maiuscula, 1 minuscula, 1 numero e 1 caractere especial.',
            'cpf.required' => 'O CPF e obrigatorio.',
            'cpf.size' => 'O CPF deve ter 14 caracteres (com formatacao).',
            'cpf.unique' => 'Este CPF ja esta cadastrado na plataforma.',
            'telefone.required' => 'O telefone e obrigatorio.',
            'telefone.min' => 'O telefone esta incompleto.',
        ];
    }
}
