<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
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
            'nome' => 'required|string|max:255',
            'Usuario' => 'required|string|max:100|unique:usuarios,Usuario',
            'email' => 'required|email|max:255|unique:usuarios,email',
            'Senha' => 'required|string|min:6',
            'cargo' => 'nullable|string|max:100',
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
            'nome.required' => 'O campo nome é obrigatório.',
            'nome.string' => 'O campo nome deve ser uma string.',
            'nome.max' => 'O campo nome não pode ter mais de 255 caracteres.',
            'Usuario.required' => 'O campo usuário é obrigatório.',
            'Usuario.string' => 'O campo usuário deve ser uma string.',
            'Usuario.max' => 'O campo usuário não pode ter mais de 100 caracteres.',
            'Usuario.unique' => 'Este usuário já está cadastrado no sistema.',
            'email.required' => 'O campo email é obrigatório.',
            'email.email' => 'O campo email deve ter um formato válido.',
            'email.max' => 'O campo email não pode ter mais de 255 caracteres.',
            'email.unique' => 'Este email já está cadastrado no sistema.',
            'Senha.required' => 'O campo senha é obrigatório.',
            'Senha.string' => 'O campo senha deve ser uma string.',
            'Senha.min' => 'O campo senha deve ter pelo menos 6 caracteres.',
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

