<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJudicialRequest extends FormRequest
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
            'ID_ENTRADA' => 'sometimes|exists:tab_entrada,Id_Entrada',
            'COMARCA' => 'nullable|string|max:255',
            'NUM_PROCESSO' => 'nullable|string|max:100',
            'NOTA_FISCAL' => 'nullable|string|max:100',
            'NUM_VARA' => 'nullable|string|max:100',
            'DT_PAGTO' => 'nullable|date',
            'HONORARIO' => 'nullable|numeric|min:0',
            'NOME_BANCO' => 'nullable|string|max:100',
            'OBSERVACOES' => 'nullable|string'
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
            'ID_ENTRADA.exists' => 'A entrada selecionada não existe.',
            'COMARCA.max' => 'O campo comarca não pode ter mais de 255 caracteres.',
            'NUM_PROCESSO.max' => 'O campo número do processo não pode ter mais de 100 caracteres.',
            'NOTA_FISCAL.max' => 'O campo nota fiscal não pode ter mais de 100 caracteres.',
            'NUM_VARA.max' => 'O campo número da vara não pode ter mais de 100 caracteres.',
            'DT_PAGTO.date' => 'O campo data de pagamento deve ser uma data válida.',
            'HONORARIO.numeric' => 'O campo honorário deve ser um número.',
            'HONORARIO.min' => 'O campo honorário não pode ser negativo.',
            'NOME_BANCO.max' => 'O campo nome do banco não pode ter mais de 100 caracteres.'
        ];
    }
}

