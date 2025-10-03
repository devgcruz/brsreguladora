<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
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
            'usuario' => $this->usuario,
            'nome_usuario' => $this->nome_usuario,
            'acao' => $this->acao,
            'entidade' => $this->entidade,
            'descricao' => $this->descricao,
            'detalhes' => $this->detalhes,
            'ip' => $this->ip,
            'user_agent' => $this->user_agent,
            'timestamp' => $this->timestamp?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

