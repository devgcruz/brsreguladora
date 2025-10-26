<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntradaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->Id_Entrada,
            'colaborador_id' => $this->ID_COLABORADOR,
            'colaborador' => $this->whenLoaded('colaborador', function () {
                return [
                    'id' => $this->colaborador->id,
                    'nome' => $this->colaborador->nome,
                    'cpf' => $this->colaborador->cpf,
                    'email' => $this->colaborador->email,
                    'celular' => $this->colaborador->celular
                ];
            }),
            'data_entrada' => $this->DATA_ENTRADA?->format('Y-m-d'),
            'dt_entrada' => $this->DATA_ENTRADA?->format('Y-m-d'), // Alias para compatibilidade frontend
            'marca' => $this->MARCA,
            'veiculo' => $this->VEICULO,
            'placa' => $this->PLACA,
            'chassi' => $this->CHASSI,
            'ano_veiculo' => $this->ANO_VEIC,
            'ano_modelo' => $this->ANO_MODELO,
            'cor_veiculo' => $this->COR_VEICULO,
            'protocolo' => $this->Id_Entrada, // Usar o ID como protocolo
            'numero_processo' => $this->NUMERO_PROCESSO,
            'cod_sinistro' => $this->COD_SINISTRO,
            'numero_bo' => $this->NUM_BO,
            'num_bo' => $this->NUM_BO, // Alias para compatibilidade frontend
            'uf_sinistro' => $this->UF_SINISTRO,
            'cidade_sinistro' => $this->CIDADE_SINISTRO,
            'seguradora' => $this->SEGURADORA,
            'posicao' => $this->POSICAO,
            'situacao' => $this->SITUACAO,
            'uf' => $this->UF,
            'cidade' => $this->CIDADE,
            'mes' => $this->MES,
            'tipo' => $this->TIPO,
            'data_registro' => $this->DATA_REGISTRO,
            'data_alteracao' => $this->DATA_ALTERACAO,
            'updated_at' => $this->updated_at, // Alias para compatibilidade frontend
            // Novos campos
            'cor' => $this->COR,
            'renavam' => $this->RENAVAM,
            'numero_motor' => $this->NUMERO_MOTOR,
            // Campos condicionais para tipo Judicial
            'comarca' => $this->COMARCA,
            'numero_processo_judicial' => $this->NUMERO_PROCESSO_JUDICIAL,
            'nota_fiscal' => $this->NOTA_FISCAL,
            'numero_vara' => $this->NUMERO_VARA,
            'data_pagamento' => $this->DATA_PAGAMENTO?->format('Y-m-d'),
            'honorario' => $this->HONORARIO,
            'nome_banco' => $this->NOME_BANCO,
            'observacoes' => $this->OBSERVACOES,
            // Observações em formato de posts
            'observacoes_posts' => $this->OBSERVACOES_POSTS,
            'financeiros' => $this->whenLoaded('financeiros', function () {
                return FinanceiroResource::collection($this->financeiros);
            }),
            'judicial' => $this->whenLoaded('judicial', function () {
                return new JudicialResource($this->judicial);
            }),
            'pdfs' => $this->whenLoaded('pdfs', function () {
                return PdfResource::collection($this->pdfs);
            }),
            'observacoes' => $this->whenLoaded('observacoes', function () {
                return ObservacaoResource::collection($this->observacoes);
            })
        ];
    }
}

