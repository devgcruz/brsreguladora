<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Dados para gráfico de pizza - Percentual por Montadora (Top 10)
     */
    public function getDadosMontadora()
    {
        try {
            $dados = DB::table('tab_entrada')
                ->select('MARCA', DB::raw('COUNT(*) as total'))
                ->whereNotNull('MARCA')
                ->where('MARCA', '!=', '')
                ->groupBy('MARCA')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get();

            $totalGeral = $dados->sum('total');
            
            $resultado = $dados->map(function ($item) use ($totalGeral) {
                $percentual = $totalGeral > 0 ? round(($item->total / $totalGeral) * 100, 1) : 0;
                return [
                    'name' => $item->MARCA,
                    'y' => $percentual
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar dados de montadora'], 500);
        }
    }

    /**
     * Dados para gráfico de rosca - Percentual por Tipo de Serviço
     */
    public function getDadosTipoServico()
    {
        try {
            $dados = DB::table('tab_entrada')
                ->select('TIPO', DB::raw('COUNT(*) as total'))
                ->whereNotNull('TIPO')
                ->where('TIPO', '!=', '')
                ->groupBy('TIPO')
                ->orderBy('total', 'desc')
                ->get();

            $totalGeral = $dados->sum('total');
            
            $resultado = $dados->map(function ($item) use ($totalGeral) {
                $percentual = $totalGeral > 0 ? round(($item->total / $totalGeral) * 100, 1) : 0;
                return [
                    'name' => $item->TIPO,
                    'y' => $percentual
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar dados de tipo de serviço'], 500);
        }
    }

    /**
     * Dados para gráfico de colunas - Situação dos Registros
     */
    public function getDadosSituacao()
    {
        try {
            $dados = DB::table('tab_entrada')
                ->select('SITUACAO', DB::raw('COUNT(*) as total'))
                ->whereNotNull('SITUACAO')
                ->where('SITUACAO', '!=', '')
                ->groupBy('SITUACAO')
                ->orderBy('total', 'desc')
                ->get();

            $resultado = $dados->map(function ($item) {
                return [
                    'name' => $item->SITUACAO,
                    'y' => $item->total
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar dados de situação'], 500);
        }
    }

    /**
     * Dados para gráfico de linha - Evolução de Entradas por Mês
     */
    public function getDadosEvolucaoEntradas()
    {
        try {
            $dados = DB::select("
                SELECT 
                    YEAR(DATA_ENTRADA) as ano,
                    MONTH(DATA_ENTRADA) as mes,
                    COUNT(*) as total
                FROM tab_entrada 
                WHERE DATA_ENTRADA IS NOT NULL 
                AND DATA_ENTRADA >= ?
                GROUP BY YEAR(DATA_ENTRADA), MONTH(DATA_ENTRADA)
                ORDER BY ano ASC, mes ASC
            ", [Carbon::now()->subMonths(12)]);

            $resultado = collect($dados)->map(function ($item) {
                $mesNome = Carbon::create($item->ano, $item->mes, 1)->format('M');
                return [
                    'month' => $mesNome,
                    'value' => $item->total
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar dados de evolução de entradas'], 500);
        }
    }

    /**
     * Dados para gráfico de colunas - Evolução de Honorários por Mês
     */
    public function getDadosEvolucaoHonorarios()
    {
        try {
            $dados = DB::select("
                SELECT 
                    YEAR(DATA_PAGAMENTO_NOTA_FISCAL) as ano,
                    MONTH(DATA_PAGAMENTO_NOTA_FISCAL) as mes,
                    SUM(VALOR_NOTA_FISCAL) as total
                FROM tab_financeiro 
                WHERE DATA_PAGAMENTO_NOTA_FISCAL IS NOT NULL 
                AND VALOR_NOTA_FISCAL IS NOT NULL
                AND DATA_PAGAMENTO_NOTA_FISCAL >= ?
                GROUP BY YEAR(DATA_PAGAMENTO_NOTA_FISCAL), MONTH(DATA_PAGAMENTO_NOTA_FISCAL)
                ORDER BY ano ASC, mes ASC
            ", [Carbon::now()->subMonths(12)]);

            $resultado = collect($dados)->map(function ($item) {
                $mesNome = Carbon::create($item->ano, $item->mes, 1)->format('M');
                return [
                    'month' => $mesNome,
                    'value' => round($item->total, 2)
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar dados de evolução de honorários'], 500);
        }
    }

    /**
     * Dados para gráfico de área - Evolução de Despesas por Mês
     */
    public function getDadosEvolucaoDespesas()
    {
        try {
            $dados = DB::select("
                SELECT 
                    YEAR(DATA_PAGAMENTO_RECIBO) as ano,
                    MONTH(DATA_PAGAMENTO_RECIBO) as mes,
                    SUM(VALOR_TOTAL_RECIBO) as total
                FROM tab_financeiro 
                WHERE DATA_PAGAMENTO_RECIBO IS NOT NULL 
                AND VALOR_TOTAL_RECIBO IS NOT NULL
                AND DATA_PAGAMENTO_RECIBO >= ?
                GROUP BY YEAR(DATA_PAGAMENTO_RECIBO), MONTH(DATA_PAGAMENTO_RECIBO)
                ORDER BY ano ASC, mes ASC
            ", [Carbon::now()->subMonths(12)]);

            $resultado = collect($dados)->map(function ($item) {
                $mesNome = Carbon::create($item->ano, $item->mes, 1)->format('M');
                return [
                    'month' => $mesNome,
                    'value' => round($item->total, 2)
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar dados de evolução de despesas'], 500);
        }
    }

}