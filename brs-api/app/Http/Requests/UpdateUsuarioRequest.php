<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUsuarioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => 'sometimes|string|max:255',
            'Usuario' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('usuarios', 'Usuario')->ignore($this->route('usuario'), 'id')
            ],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('usuarios', 'email')->ignore($this->route('usuario'), 'id')
            ],
            'Senha' => 'sometimes|string|min:6',
            'nivel' => 'sometimes|integer|min:1|max:5',
            'cargo' => 'sometimes|string|max:100',
            'permissoes' => 'nullable|array',
            'permissoes.*' => 'string|in:dashboard,registros,financeiro,judicial,prestadores,relatorios,usuarios,auditoria',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'status' => 'nullable|string|in:ativo,inativo'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.string' => 'O campo nome deve ser uma string.',
            'nome.max' => 'O campo nome não pode ter mais de 255 caracteres.',
            'Usuario.string' => 'O campo usuário deve ser uma string.',
            'Usuario.max' => 'O campo usuário não pode ter mais de 100 caracteres.',
            'Usuario.unique' => 'Este usuário já está cadastrado no sistema.',
            'email.email' => 'O campo email deve ter um formato válido.',
            'email.max' => 'O campo email não pode ter mais de 255 caracteres.',
            'email.unique' => 'Este email já está cadastrado no sistema.',
            'Senha.string' => 'O campo senha deve ser uma string.',
            'Senha.min' => 'O campo senha deve ter pelo menos 6 caracteres.',
            'nivel.integer' => 'O campo nível deve ser um número inteiro.',
            'nivel.min' => 'O campo nível deve ser pelo menos 1.',
            'nivel.max' => 'O campo nível não pode ser maior que 5.',
            'cargo.string' => 'O campo cargo deve ser uma string.',
            'cargo.max' => 'O campo cargo não pode ter mais de 100 caracteres.',
            'permissoes.array' => 'O campo permissões deve ser um array.',
            'permissoes.*.string' => 'Cada permissão deve ser uma string.',
            'permissoes.*.in' => 'Permissão inválida.',
            'status.string' => 'O campo status deve ser uma string.',
            'status.in' => 'O campo status deve ser "ativo" ou "inativo".'
        ];
    }
}

