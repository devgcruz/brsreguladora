<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JudicialResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->Id_Judicial,
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
            'comarca' => $this->COMARCA,
            'numero_processo' => $this->NUM_PROCESSO,
            'nota_fiscal' => $this->NOTA_FISCAL,
            'numero_vara' => $this->NUM_VARA,
            'data_pagamento' => $this->DT_PAGTO?->format('Y-m-d'),
            'honorario' => $this->HONORARIO,
            'nome_banco' => $this->NOME_BANCO,
            'observacoes' => $this->OBSERVACOES,
            'diligencias' => $this->whenLoaded('diligencias', function () {
                return DiligenciaResource::collection($this->diligencias);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

