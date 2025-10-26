<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PdfUploadRequest extends FormRequest
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
            'entrada_id' => 'required|integer|exists:tab_entrada,Id_Entrada',
            'descricao' => 'required|string|max:255',
            'pdf_file' => 'required|file|mimes:pdf|max:51200' // 50MB máximo
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'entrada_id.required' => 'O ID da entrada é obrigatório.',
            'entrada_id.integer' => 'O ID da entrada deve ser um número inteiro.',
            'entrada_id.exists' => 'A entrada especificada não existe.',
            'descricao.required' => 'A descrição é obrigatória.',
            'descricao.string' => 'A descrição deve ser um texto.',
            'descricao.max' => 'A descrição não pode ter mais de 255 caracteres.',
            'pdf_file.required' => 'O arquivo PDF é obrigatório.',
            'pdf_file.file' => 'O arquivo deve ser um arquivo válido.',
            'pdf_file.mimes' => 'O arquivo deve ser um PDF.',
            'pdf_file.max' => 'O arquivo não pode ter mais de 50MB.'
        ];
    }
}
