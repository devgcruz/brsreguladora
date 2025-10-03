<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrestadorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ID_PRESTADOR,
            'nome' => $this->NOME,
            'login' => $this->LOGIN,
            'status' => $this->STATUS,
            'parceiro_id' => $this->FK_PARCEIRO,
            'parceiro' => $this->whenLoaded('parceiro', function () {
                return [
                    'id' => $this->parceiro->ID_PARCEIRO,
                    'nome' => $this->parceiro->NOME,
                    'status' => $this->parceiro->STATUS
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}





