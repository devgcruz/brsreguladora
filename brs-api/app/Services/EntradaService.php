<?php

namespace App\Services;

use App\Models\Entrada;
use App\Models\Financeiro;
use App\Models\Judicial;
use App\Models\Pdf;
use Illuminate\Support\Facades\DB;

class EntradaService
{
    /**
     * Criar nova entrada
     */
    public function createEntrada(array $data): Entrada
    {
        return DB::transaction(function () use ($data) {
            // Log dos dados recebidos para debug
            \Log::info('Dados recebidos para criação de entrada:', $data);
            
            // Log específico para observações
            if (isset($data['OBSERVACOES_POSTS'])) {
                \Log::info('📝 EntradaService - Observações recebidas:', [
                    'tipo' => gettype($data['OBSERVACOES_POSTS']),
                    'valor' => $data['OBSERVACOES_POSTS'],
                    'is_array' => is_array($data['OBSERVACOES_POSTS']),
                    'count' => is_array($data['OBSERVACOES_POSTS']) ? count($data['OBSERVACOES_POSTS']) : 'N/A'
                ]);
            } else {
                \Log::info('❌ EntradaService - OBSERVACOES_POSTS não encontrado');
            }
            
            $entrada = Entrada::create($data);
            
            // Log após criação
            \Log::info('📝 EntradaService - Registro criado:', [
                'id' => $entrada->Id_Entrada,
                'observacoes_posts' => $entrada->OBSERVACOES_POSTS,
                'observacoes_posts_tipo' => gettype($entrada->OBSERVACOES_POSTS)
            ]);

            // Criar registro financeiro vazio se não existir
            if (!isset($data['financeiro'])) {
                Financeiro::create([
                    'ID_ENTRADA' => $entrada->Id_Entrada,
                    'StatusPG' => 'Pendente'
                ]);
            }

            return $entrada->load(['colaborador', 'financeiro', 'judicial', 'pdfs']);
        });
    }

    /**
     * Atualizar entrada
     */
    public function updateEntrada(Entrada $entrada, array $data): Entrada
    {
        return DB::transaction(function () use ($entrada, $data) {
            // Log dos dados recebidos para debug
            \Log::info('Dados recebidos para atualização de entrada:', $data);
            
            $entrada->update($data);
            return $entrada->load(['colaborador', 'financeiro', 'judicial', 'pdfs']);
        });
    }

    /**
     * Excluir entrada
     */
    public function deleteEntrada(Entrada $entrada): bool
    {
        return DB::transaction(function () use ($entrada) {
            // Excluir PDFs relacionados
            Pdf::where('ID_ENTRADA', $entrada->Id_Entrada)->delete();
            
            // Excluir dados financeiros relacionados
            Financeiro::where('ID_ENTRADA', $entrada->Id_Entrada)->delete();
            
            // Excluir dados judiciais relacionados
            $judicial = Judicial::where('ID_ENTRADA', $entrada->Id_Entrada)->first();
            if ($judicial) {
                // Excluir diligências relacionadas
                $judicial->diligencias()->delete();
                $judicial->delete();
            }
            
            // Excluir entrada
            return $entrada->delete();
        });
    }

    /**
     * Obter estatísticas das entradas
     */
    public function getStatistics(): array
    {
        return [
            'total_entradas' => Entrada::count(),
            'entradas_hoje' => Entrada::whereDate('DATA_ENTRADA', today())->count(),
            'entradas_mes' => Entrada::whereMonth('DATA_ENTRADA', now()->month)
                ->whereYear('DATA_ENTRADA', now()->year)
                ->count(),
            'por_tipo' => Entrada::selectRaw('TIPO, COUNT(*) as total')
                ->groupBy('TIPO')
                ->pluck('total', 'TIPO')
                ->toArray(),
            'por_situacao' => Entrada::selectRaw('SITUACAO, COUNT(*) as total')
                ->groupBy('SITUACAO')
                ->pluck('total', 'SITUACAO')
                ->toArray(),
            'por_seguradora' => Entrada::selectRaw('SEGURADORA, COUNT(*) as total')
                ->groupBy('SEGURADORA')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->pluck('total', 'SEGURADORA')
                ->toArray(),
            'por_uf' => Entrada::selectRaw('UF, COUNT(*) as total')
                ->groupBy('UF')
                ->orderBy('total', 'desc')
                ->pluck('total', 'UF')
                ->toArray(),
            'por_mes' => Entrada::selectRaw('MONTH(DATA_ENTRADA) as mes, COUNT(*) as total')
                ->whereYear('DATA_ENTRADA', now()->year)
                ->groupBy('mes')
                ->orderBy('mes')
                ->pluck('total', 'mes')
                ->toArray()
        ];
    }

    /**
     * Buscar entradas com filtros
     */
    public function searchEntradas(array $filtros): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Entrada::with(['colaborador', 'financeiro', 'judicial', 'pdfs']);

        if (!empty($filtros['search'])) {
            $search = $filtros['search'];
            $query->where(function ($q) use ($search) {
                $q->where('PLACA', 'like', "%{$search}%")
                  ->orWhere('VEICULO', 'like', "%{$search}%")
                  ->orWhere('MARCA', 'like', "%{$search}%")
                  ->orWhere('SEGURADORA', 'like', "%{$search}%")
                  ->orWhere('SITUACAO', 'like', "%{$search}%");
            });
        }

        if (!empty($filtros['colaborador_id'])) {
            $query->where('ID_COLABORADOR', $filtros['colaborador_id']);
        }

        if (!empty($filtros['tipo'])) {
            $query->where('TIPO', $filtros['tipo']);
        }

        if (!empty($filtros['situacao'])) {
            $query->where('SITUACAO', $filtros['situacao']);
        }

        if (!empty($filtros['data_inicio'])) {
            $query->where('DATA_ENTRADA', '>=', $filtros['data_inicio']);
        }

        if (!empty($filtros['data_fim'])) {
            $query->where('DATA_ENTRADA', '<=', $filtros['data_fim']);
        }

        if (!empty($filtros['seguradora'])) {
            $query->where('SEGURADORA', 'like', "%{$filtros['seguradora']}%");
        }

        if (!empty($filtros['uf'])) {
            $query->where('UF', $filtros['uf']);
        }

        return $query->orderBy('DATA_ENTRADA', 'desc')->paginate(15);
    }

    /**
     * Gerar relatório de entradas
     */
    public function generateReport(array $filtros): array
    {
        $query = Entrada::with(['colaborador', 'financeiro', 'judicial']);

        // Aplicar filtros
        if (!empty($filtros['data_inicio'])) {
            $query->where('DATA_ENTRADA', '>=', $filtros['data_inicio']);
        }

        if (!empty($filtros['data_fim'])) {
            $query->where('DATA_ENTRADA', '<=', $filtros['data_fim']);
        }

        if (!empty($filtros['tipo'])) {
            $query->where('TIPO', $filtros['tipo']);
        }

        if (!empty($filtros['situacao'])) {
            $query->where('SITUACAO', $filtros['situacao']);
        }

        $entradas = $query->orderBy('DATA_ENTRADA', 'desc')->get();

        return [
            'total' => $entradas->count(),
            'dados' => $entradas->map(function ($entrada) {
                return [
                    'id' => $entrada->Id_Entrada,
                    'data_entrada' => $entrada->DATA_ENTRADA?->format('d/m/Y'),
                    'placa' => $entrada->PLACA,
                    'veiculo' => $entrada->VEICULO,
                    'marca' => $entrada->MARCA,
                    'seguradora' => $entrada->SEGURADORA,
                    'situacao' => $entrada->SITUACAO,
                    'tipo' => $entrada->TIPO,
                    'colaborador' => $entrada->colaborador?->NOME,
                    'valor_total' => $entrada->financeiro?->Valor,
                    'status_pagamento' => $entrada->financeiro?->StatusPG
                ];
            })
        ];
    }
}

