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
            'numero_recibo' => $this->NUMERO_RECIBO,
            'valor_total_recibo' => $this->VALOR_TOTAL_RECIBO,
            'data_pagamento_recibo' => $this->DATA_PAGAMENTO_RECIBO?->format('Y-m-d'),
            'data_nota_fiscal' => $this->DATA_NOTA_FISCAL?->format('Y-m-d'),
            'numero_nota_fiscal' => $this->NUMERO_NOTA_FISCAL,
            'valor_nota_fiscal' => $this->VALOR_NOTA_FISCAL,
            'data_pagamento_nota_fiscal' => $this->DATA_PAGAMENTO_NOTA_FISCAL?->format('Y-m-d'),
            'observacao' => $this->OBSERVACOES,
            'status_pagamento' => $this->StatusPG,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

