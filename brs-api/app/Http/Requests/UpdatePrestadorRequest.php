<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrestadorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Será controlado pelo middleware de permissão
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $prestadorId = $this->route('prestador');
        
        return [
            'FK_PARCEIRO' => 'sometimes|integer|exists:Tab_CadParceiros,ID_PARCEIRO',
            'NOME' => 'sometimes|string|max:255',
            'LOGIN' => 'sometimes|string|max:100|unique:Tab_LoginPrestadores,LOGIN,' . $prestadorId . ',ID_PRESTADOR',
            'SENHA' => 'sometimes|string|min:6',
            'STATUS' => 'nullable|string|in:ativo,inativo'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'FK_PARCEIRO.exists' => 'O parceiro selecionado não existe.',
            'NOME.max' => 'O nome deve ter no máximo 255 caracteres.',
            'LOGIN.unique' => 'Este login já está em uso.',
            'LOGIN.max' => 'O login deve ter no máximo 100 caracteres.',
            'SENHA.min' => 'A senha deve ter pelo menos 6 caracteres.',
            'STATUS.in' => 'O status deve ser ativo ou inativo.'
        ];
    }
}





