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
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:14|unique:colaboradores,cpf',
            'email' => 'required|email|max:255|unique:colaboradores,email',
            'celular' => 'required|string|max:20',
            'cnh_foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório.',
            'cpf.required' => 'O CPF é obrigatório.',
            'cpf.unique' => 'Este CPF já está cadastrado.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email deve ter um formato válido.',
            'email.unique' => 'Este email já está cadastrado.',
            'celular.required' => 'O celular é obrigatório.',
            'cnh_foto.image' => 'O arquivo deve ser uma imagem.',
            'cnh_foto.mimes' => 'A imagem deve ser do tipo: jpeg, png, jpg, gif.',
            'cnh_foto.max' => 'A imagem não pode ter mais de 2MB.'
        ];
    }
}
