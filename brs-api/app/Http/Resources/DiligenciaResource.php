<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiligenciaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->Id_Diligencia,
            'judicial_id' => $this->ID_JUDICIAL,
            'numero_nf' => $this->NUM_NF,
            'numero_diligencia' => $this->NUM_DILIGENCIA,
            'valor' => $this->VALOR,
            'data_pagamento' => $this->DATA_PAGTO?->format('Y-m-d'),
            'despesas' => $this->DESPESAS,
            'data_pagamento_2' => $this->DATA_PAGTO_DOIS?->format('Y-m-d'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

