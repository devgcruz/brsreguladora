<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'usuario' => 'required|string|max:100',
            'senha' => 'required|string|min:6'
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
            'usuario.required' => 'O campo usuário é obrigatório.',
            'usuario.string' => 'O campo usuário deve ser uma string.',
            'usuario.max' => 'O campo usuário não pode ter mais de 100 caracteres.',
            'senha.required' => 'O campo senha é obrigatório.',
            'senha.string' => 'O campo senha deve ser uma string.',
            'senha.min' => 'O campo senha deve ter pelo menos 6 caracteres.'
        ];
    }
}

