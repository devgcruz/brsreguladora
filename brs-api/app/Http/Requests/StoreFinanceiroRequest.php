<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinanceiroRequest extends FormRequest
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
            'ID_ENTRADA' => 'required|exists:tab_entrada,Id_Entrada',
            'DATA_NF' => 'nullable|date',
            'NUM_NF' => 'nullable|string|max:100',
            'Honorarios' => 'nullable|numeric|min:0',
            'Data_Pagto_Honor' => 'nullable|date',
            'Vlr_Despesas' => 'nullable|numeric|min:0',
            'Data_pagto_Desp' => 'nullable|date',
            'Baixa_NF' => 'nullable|string|max:100',
            'Valor' => 'nullable|numeric|min:0',
            'Data_Pagamento' => 'nullable|date',
            'Banco' => 'nullable|string|max:100',
            'OBSERVACOES' => 'nullable|string',
            'INFO_ADICIONAIS' => 'nullable|string',
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
            'ID_ENTRADA.required' => 'O campo ID da entrada é obrigatório.',
            'ID_ENTRADA.exists' => 'A entrada selecionada não existe.',
            'DATA_NF.date' => 'O campo data da NF deve ser uma data válida.',
            'NUM_NF.max' => 'O campo número da NF não pode ter mais de 100 caracteres.',
            'Honorarios.numeric' => 'O campo honorários deve ser um número.',
            'Honorarios.min' => 'O campo honorários não pode ser negativo.',
            'Data_Pagto_Honor.date' => 'O campo data de pagamento dos honorários deve ser uma data válida.',
            'Vlr_Despesas.numeric' => 'O campo valor das despesas deve ser um número.',
            'Vlr_Despesas.min' => 'O campo valor das despesas não pode ser negativo.',
            'Data_pagto_Desp.date' => 'O campo data de pagamento das despesas deve ser uma data válida.',
            'Baixa_NF.max' => 'O campo baixa NF não pode ter mais de 100 caracteres.',
            'Valor.numeric' => 'O campo valor deve ser um número.',
            'Valor.min' => 'O campo valor não pode ser negativo.',
            'Data_Pagamento.date' => 'O campo data de pagamento deve ser uma data válida.',
            'Banco.max' => 'O campo banco não pode ter mais de 100 caracteres.',
            'StatusPG.max' => 'O campo status do pagamento não pode ter mais de 50 caracteres.'
        ];
    }
}

