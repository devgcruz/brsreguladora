<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'usuario' => $this->Usuario,
            'nivel' => $this->nivel,
            'permissoes' => $this->permissoes,
            'status' => $this->status,
            'ultimo_acesso' => $this->ultimo_acesso?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

