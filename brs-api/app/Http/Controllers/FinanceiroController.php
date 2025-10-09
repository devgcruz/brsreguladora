<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceiroRequest;
use App\Http\Requests\StoreFinanceiroForEntradaRequest;
use App\Http\Requests\UpdateFinanceiroRequest;
use App\Http\Resources\FinanceiroResource;
use App\Models\Financeiro;
use App\Models\Entrada;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinanceiroController extends Controller
{

    /**
     * Listar dados financeiros
     */
    public function index(Request $request): JsonResponse
    {
        $query = Financeiro::with('entrada');

        // Filtros
        if ($request->has('entrada_id')) {
            $query->where('ID_ENTRADA', $request->get('entrada_id'));
        }

        if ($request->has('status')) {
            $query->where('StatusPG', $request->get('status'));
        }

        if ($request->has('data_inicio')) {
            $query->where('DATA_NF', '>=', $request->get('data_inicio'));
        }

        if ($request->has('data_fim')) {
            $query->where('DATA_NF', '<=', $request->get('data_fim'));
        }

        $financeiros = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => FinanceiroResource::collection($financeiros),
            'meta' => [
                'current_page' => $financeiros->currentPage(),
                'last_page' => $financeiros->lastPage(),
                'per_page' => $financeiros->perPage(),
                'total' => $financeiros->total()
            ]
        ]);
    }

    /**
     * Obter dados financeiros específicos
     */
    public function show(Financeiro $financeiro): JsonResponse
    {
        $financeiro->load('entrada');

        return response()->json([
            'success' => true,
            'data' => new FinanceiroResource($financeiro)
        ]);
    }

    /**
     * Criar dados financeiros
     */
    public function store(StoreFinanceiroRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        $financeiro = Financeiro::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Dados financeiros criados com sucesso',
            'data' => new FinanceiroResource($financeiro)
        ], 201);
    }

    /**
     * Atualizar dados financeiros
     */
    public function update(UpdateFinanceiroRequest $request, Financeiro $financeiro): JsonResponse
    {
        $data = $request->validated();
        
        $dadosAnteriores = $financeiro->toArray();
        $financeiro->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Dados financeiros atualizados com sucesso',
            'data' => new FinanceiroResource($financeiro)
        ]);
    }

    /**
     * Excluir dados financeiros
     */
    public function destroy(Financeiro $financeiro): JsonResponse
    {
        $financeiroId = $financeiro->Id_Financeiro;
        $entradaId = $financeiro->ID_ENTRADA;

        $financeiro->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dados financeiros excluídos com sucesso'
        ]);
    }

    /**
     * Buscar dados financeiros por entrada
     */
    public function getByEntrada(Entrada $entrada): JsonResponse
    {
        $financeiro = Financeiro::where('ID_ENTRADA', $entrada->Id_Entrada)->first();

        if (!$financeiro) {
            return response()->json([
                'success' => false,
                'message' => 'Dados financeiros não encontrados para esta entrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new FinanceiroResource($financeiro)
        ]);
    }

    /**
     * Listar lançamentos financeiros por entrada
     */
    public function indexByEntrada(Entrada $entrada): JsonResponse
    {
        $financeiros = Financeiro::where('ID_ENTRADA', $entrada->Id_Entrada)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => FinanceiroResource::collection($financeiros)
        ]);
    }

    /**
     * Criar lançamento financeiro para uma entrada específica
     */
    public function storeForEntrada(StoreFinanceiroForEntradaRequest $request, Entrada $entrada): JsonResponse
    {
        $data = $request->validated();
        $data['ID_ENTRADA'] = $entrada->Id_Entrada;
        
        $financeiro = Financeiro::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Lançamento financeiro criado com sucesso',
            'data' => new FinanceiroResource($financeiro)
        ], 201);
    }

    /**
     * Estatísticas financeiras
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_honorarios' => Financeiro::sum('Honorarios'),
            'total_despesas' => Financeiro::sum('Vlr_Despesas'),
            'total_valor' => Financeiro::sum('Valor'),
            'pagos' => Financeiro::where('StatusPG', 'Pago')->count(),
            'pendentes' => Financeiro::where('StatusPG', 'Pendente')->count(),
            'em_analise' => Financeiro::where('StatusPG', 'Em análise')->count(),
            'rejeitados' => Financeiro::where('StatusPG', 'Rejeitado')->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}

