<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ObservacaoResource extends JsonResource
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
            'entrada_id' => $this->entrada_id,
            'texto' => $this->texto,
            'created_at' => $this->created_at?->toISOString(), // Timestamp ISO
            'created_at_formatted' => $this->created_at?->format('d/m/Y H:i'),
            'usuario' => $this->whenLoaded('usuario', function () {
                $photoPath = $this->usuario->profile_photo_path;
                $photoUrl = $photoPath ? url('storage/' . $photoPath) : null;
                
                return [
                    'id' => $this->usuario->id,
                    'name' => $this->usuario->nome, // Mapear 'nome' para 'name' para consistência com frontend
                    'profile_photo_path' => $photoPath,
                    'profile_photo_url' => $photoUrl
                ];
            }),
            // Fallback para dados antigos que não possuem relação usuario
            'nome' => $this->whenLoaded('usuario') ? $this->usuario->nome : ($this->responsavel ?? $this->usuario_nome ?? null)
        ];
    }
}
