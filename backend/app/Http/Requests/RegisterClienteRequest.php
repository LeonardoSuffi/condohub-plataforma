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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'tipo' => 'required|in:sindico,administradora,condominio',
            'cpf' => 'nullable|string|size:14',
            'cnpj' => 'nullable|string|size:18',
            'telefone' => 'nullable|string|max:20',
            'nome_condominio' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            'password.required' => 'A senha é obrigatória.',
            'password.min' => 'A senha deve ter no mínimo 8 caracteres.',
            'password.confirmed' => 'As senhas não conferem.',
            'tipo.required' => 'O tipo de cliente é obrigatório.',
            'tipo.in' => 'Tipo de cliente inválido.',
            'cpf.size' => 'O CPF deve ter 14 caracteres (com formatação).',
            'cnpj.size' => 'O CNPJ deve ter 18 caracteres (com formatação).',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $tipo = $this->input('tipo');
            $cpf = $this->input('cpf');
            $cnpj = $this->input('cnpj');

            // Síndico precisa de CPF
            if ($tipo === 'sindico' && empty($cpf)) {
                $validator->errors()->add('cpf', 'O CPF é obrigatório para síndicos.');
            }

            // Administradora precisa de CNPJ
            if ($tipo === 'administradora' && empty($cnpj)) {
                $validator->errors()->add('cnpj', 'O CNPJ é obrigatório para administradoras.');
            }
        });
    }
}
