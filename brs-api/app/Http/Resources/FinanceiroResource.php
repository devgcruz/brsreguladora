<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceiroResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->Id_Financeiro,
            'entrada_id' => $this->ID_ENTRADA,
            'entrada' => $this->whenLoaded('entrada', function () {
                return [
                    'id' => $this->entrada->Id_Entrada,
                    'placa' => $this->entrada->PLACA,
                    'veiculo' => $this->entrada->VEICULO,
                    'marca' => $this->entrada->MARCA,
                    'seguradora' => $this->entrada->SEGURADORA
                ];
            }),
            'data_nf' => $this->DATA_NF?->format('Y-m-d'),
            'numero_nf' => $this->NUM_NF,
            'honorarios' => $this->Honorarios,
            'data_pagto_honorarios' => $this->Data_Pagto_Honor?->format('Y-m-d'),
            'valor_despesas' => $this->Vlr_Despesas,
            'data_pagto_despesas' => $this->Data_pagto_Desp?->format('Y-m-d'),
            'baixa_nf' => $this->Baixa_NF,
            'valor' => $this->Valor,
            'data_pagamento' => $this->Data_Pagamento?->format('Y-m-d'),
            'banco' => $this->Banco,
            'observacoes' => $this->OBSERVACOES,
            'informacoes_adicionais' => $this->INFO_ADICIONAIS,
            'status_pagamento' => $this->StatusPG,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

