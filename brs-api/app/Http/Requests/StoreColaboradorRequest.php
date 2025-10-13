<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreColaboradorRequest extends FormRequest
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
            'nome' => 'nullable|string|max:255',
            'cpf' => 'nullable|string|max:14|unique:colaboradores,cpf',
            'email' => 'nullable|email|max:255|unique:colaboradores,email',
            'celular' => 'nullable|string|max:20',
            'cnh_foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nome.string' => 'O nome deve ser uma string.',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres.',
            'cpf.string' => 'O CPF deve ser uma string.',
            'cpf.max' => 'O CPF não pode ter mais de 14 caracteres.',
            'cpf.unique' => 'Este CPF já está cadastrado.',
            'email.email' => 'O email deve ter um formato válido.',
            'email.max' => 'O email não pode ter mais de 255 caracteres.',
            'email.unique' => 'Este email já está cadastrado.',
            'celular.string' => 'O celular deve ser uma string.',
            'celular.max' => 'O celular não pode ter mais de 20 caracteres.',
            'cnh_foto.image' => 'O arquivo deve ser uma imagem.',
            'cnh_foto.mimes' => 'A imagem deve ser do tipo: jpeg, png, jpg, gif.',
            'cnh_foto.max' => 'A imagem não pode ter mais de 2MB.'
        ];
    }
}
