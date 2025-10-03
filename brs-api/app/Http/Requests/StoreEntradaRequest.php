<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEntradaRequest extends FormRequest
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
            'ID_COLABORADOR' => 'nullable|exists:tab_login_prestadores,ID_PRESTADOR',
            'DATA_ENTRADA' => 'required|date',
            'MARCA' => 'nullable|string|max:100',
            'VEICULO' => 'nullable|string|max:100',
            'PLACA' => 'required|string|max:10|unique:tab_entrada,PLACA',
            'CHASSI' => 'nullable|string|max:50',
            'ANO_VEIC' => 'nullable|string|max:4',
            'ANO_MODELO' => 'nullable|string|max:4',
            'COD_SINISTRO' => 'nullable|string|max:100',
            'NUM_BO' => 'nullable|string|max:100',
            'UF_SINISTRO' => 'nullable|string|max:2',
            'CIDADE_SINISTRO' => 'nullable|string|max:100',
            'SEGURADORA' => 'nullable|string|max:100',
            'POSICAO' => 'nullable|string|max:100',
            'SITUACAO' => 'nullable|string|max:100',
            'UF' => 'nullable|string|max:2',
            'CIDADE' => 'nullable|string|max:100',
            'MES' => 'nullable|string|max:20',
            'TIPO' => 'nullable|string|max:100',
            'NUMERO_PROCESSO' => 'nullable|string|max:100',
            // Novos campos
            'COR' => 'nullable|string|max:50',
            'RENAVAM' => 'nullable|string|max:20',
            'NUMERO_MOTOR' => 'nullable|string|max:50',
            // Campos condicionais para tipo Judicial
            'COMARCA' => 'nullable|string|max:100',
            'NUMERO_PROCESSO_JUDICIAL' => 'nullable|string|max:100',
            'NOTA_FISCAL' => 'nullable|string|max:100',
            'NUMERO_VARA' => 'nullable|string|max:100',
            'DATA_PAGAMENTO' => 'nullable|date',
            'HONORARIO' => 'nullable|string|max:100',
            'NOME_BANCO' => 'nullable|string|max:100',
            'OBSERVACOES' => 'nullable|string',
            // Observações em formato de posts - validação simplificada
            'OBSERVACOES_POSTS' => 'nullable|array'
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
            'DATA_ENTRADA.required' => 'O campo data de entrada é obrigatório.',
            'DATA_ENTRADA.date' => 'O campo data de entrada deve ser uma data válida.',
            'PLACA.required' => 'O campo placa é obrigatório.',
            'PLACA.unique' => 'Esta placa já está cadastrada no sistema.',
            'PLACA.max' => 'O campo placa não pode ter mais de 10 caracteres.',
            'ID_COLABORADOR.exists' => 'O colaborador selecionado não existe.',
            'MARCA.max' => 'O campo marca não pode ter mais de 100 caracteres.',
            'VEICULO.max' => 'O campo veículo não pode ter mais de 100 caracteres.',
            'CHASSI.max' => 'O campo chassi não pode ter mais de 50 caracteres.',
            'ANO_VEIC.max' => 'O campo ano do veículo não pode ter mais de 4 caracteres.',
            'COD_SINISTRO.max' => 'O campo código do sinistro não pode ter mais de 100 caracteres.',
            'NUM_BO.max' => 'O campo número do B.O. não pode ter mais de 100 caracteres.',
            'UF_SINISTRO.max' => 'O campo UF do sinistro não pode ter mais de 2 caracteres.',
            'CIDADE_SINISTRO.max' => 'O campo cidade do sinistro não pode ter mais de 100 caracteres.',
            'SEGURADORA.max' => 'O campo seguradora não pode ter mais de 100 caracteres.',
            'POSICAO.max' => 'O campo posição não pode ter mais de 100 caracteres.',
            'SITUACAO.max' => 'O campo situação não pode ter mais de 100 caracteres.',
            'UF.max' => 'O campo UF não pode ter mais de 2 caracteres.',
            'CIDADE.max' => 'O campo cidade não pode ter mais de 100 caracteres.',
            'MES.max' => 'O campo mês não pode ter mais de 20 caracteres.',
            'TIPO.max' => 'O campo tipo não pode ter mais de 100 caracteres.'
        ];
    }
}

