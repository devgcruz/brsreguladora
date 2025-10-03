<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PdfResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ID_PDF,
            'entrada_id' => $this->ID_ENTRADA,
            'descricao' => $this->DESCRICAO,
            'caminho_pdf' => $this->CAMINHOPDF,
            'data_registro' => $this->DATA_REGISTRO?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

