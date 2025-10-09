<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinanceiroForEntradaRequest extends FormRequest
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
            // ID_ENTRADA não é necessário aqui pois vem da rota
            'NUMERO_RECIBO' => 'nullable|string|max:100',
            'VALOR_TOTAL_RECIBO' => 'nullable|numeric|min:0',
            'DATA_PAGAMENTO_RECIBO' => 'nullable|date',
            'DATA_NOTA_FISCAL' => 'nullable|date',
            'NUMERO_NOTA_FISCAL' => 'nullable|string|max:100',
            'VALOR_NOTA_FISCAL' => 'nullable|numeric|min:0',
            'DATA_PAGAMENTO_NOTA_FISCAL' => 'nullable|date',
            'OBSERVACAO' => 'nullable|string',
            'StatusPG' => 'nullable|string|max:50'
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
            'NUMERO_RECIBO.max' => 'O campo número do recibo não pode ter mais de 100 caracteres.',
            'VALOR_TOTAL_RECIBO.numeric' => 'O campo valor total do recibo deve ser um número.',
            'VALOR_TOTAL_RECIBO.min' => 'O campo valor total do recibo não pode ser negativo.',
            'DATA_PAGAMENTO_RECIBO.date' => 'O campo data de pagamento do recibo deve ser uma data válida.',
            'DATA_NOTA_FISCAL.date' => 'O campo data da nota fiscal deve ser uma data válida.',
            'NUMERO_NOTA_FISCAL.max' => 'O campo número da nota fiscal não pode ter mais de 100 caracteres.',
            'VALOR_NOTA_FISCAL.numeric' => 'O campo valor da nota fiscal deve ser um número.',
            'VALOR_NOTA_FISCAL.min' => 'O campo valor da nota fiscal não pode ser negativo.',
            'DATA_PAGAMENTO_NOTA_FISCAL.date' => 'O campo data de pagamento da nota fiscal deve ser uma data válida.',
            'StatusPG.max' => 'O campo status do pagamento não pode ter mais de 50 caracteres.'
        ];
    }
}
