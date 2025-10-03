<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJudicialRequest;
use App\Http\Requests\UpdateJudicialRequest;
use App\Http\Resources\JudicialResource;
use App\Models\Judicial;
use App\Models\Entrada;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JudicialController extends Controller
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Listar processos judiciais
     */
    public function index(Request $request): JsonResponse
    {
        $query = Judicial::with(['entrada', 'diligencias']);

        // Filtros
        if ($request->has('entrada_id')) {
            $query->where('ID_ENTRADA', $request->get('entrada_id'));
        }

        if ($request->has('comarca')) {
            $query->where('COMARCA', 'like', "%{$request->get('comarca')}%");
        }

        if ($request->has('numero_processo')) {
            $query->where('NUM_PROCESSO', 'like', "%{$request->get('numero_processo')}%");
        }

        if ($request->has('data_inicio')) {
            $query->where('created_at', '>=', $request->get('data_inicio'));
        }

        if ($request->has('data_fim')) {
            $query->where('created_at', '<=', $request->get('data_fim'));
        }

        $judiciais = $query->orderBy('created_at', 'desc')->paginate(15);

        $this->auditService->log('VIEW', 'JUDICIAL', 'Listagem de processos judiciais', [
            'filtros' => $request->all()
        ], $request->user());

        return response()->json([
            'success' => true,
            'data' => JudicialResource::collection($judiciais),
            'meta' => [
                'current_page' => $judiciais->currentPage(),
                'last_page' => $judiciais->lastPage(),
                'per_page' => $judiciais->perPage(),
                'total' => $judiciais->total()
            ]
        ]);
    }

    /**
     * Obter processo judicial específico
     */
    public function show(Judicial $judicial): JsonResponse
    {
        $judicial->load(['entrada', 'diligencias']);

        $this->auditService->log('VIEW', 'JUDICIAL', 'Visualização de processo judicial', [
            'judicial_id' => $judicial->Id_Judicial
        ], request()->user());

        return response()->json([
            'success' => true,
            'data' => new JudicialResource($judicial)
        ]);
    }

    /**
     * Criar processo judicial
     */
    public function store(StoreJudicialRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        $judicial = Judicial::create($data);

        $this->auditService->log('CREATE', 'JUDICIAL', 'Processo judicial criado', [
            'judicial_id' => $judicial->Id_Judicial,
            'entrada_id' => $judicial->ID_ENTRADA,
            'numero_processo' => $judicial->NUM_PROCESSO
        ], $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Processo judicial criado com sucesso',
            'data' => new JudicialResource($judicial)
        ], 201);
    }

    /**
     * Atualizar processo judicial
     */
    public function update(UpdateJudicialRequest $request, Judicial $judicial): JsonResponse
    {
        $data = $request->validated();
        
        $dadosAnteriores = $judicial->toArray();
        $judicial->update($data);

        $this->auditService->log('UPDATE', 'JUDICIAL', 'Processo judicial atualizado', [
            'judicial_id' => $judicial->Id_Judicial,
            'dados_anteriores' => $dadosAnteriores,
            'dados_novos' => $judicial->toArray()
        ], $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Processo judicial atualizado com sucesso',
            'data' => new JudicialResource($judicial)
        ]);
    }

    /**
     * Excluir processo judicial
     */
    public function destroy(Judicial $judicial): JsonResponse
    {
        $judicialId = $judicial->Id_Judicial;
        $entradaId = $judicial->ID_ENTRADA;
        $numeroProcesso = $judicial->NUM_PROCESSO;

        $judicial->delete();

        $this->auditService->log('DELETE', 'JUDICIAL', 'Processo judicial excluído', [
            'judicial_id' => $judicialId,
            'entrada_id' => $entradaId,
            'numero_processo' => $numeroProcesso
        ], request()->user());

        return response()->json([
            'success' => true,
            'message' => 'Processo judicial excluído com sucesso'
        ]);
    }

    /**
     * Buscar processo judicial por entrada
     */
    public function getByEntrada(Entrada $entrada): JsonResponse
    {
        $judicial = Judicial::where('ID_ENTRADA', $entrada->Id_Entrada)->first();

        if (!$judicial) {
            return response()->json([
                'success' => false,
                'message' => 'Processo judicial não encontrado para esta entrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new JudicialResource($judicial)
        ]);
    }

    /**
     * Estatísticas judiciais
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_processos' => Judicial::count(),
            'total_honorarios' => Judicial::sum('HONORARIO'),
            'por_comarca' => Judicial::selectRaw('COMARCA, COUNT(*) as total')
                ->groupBy('COMARCA')
                ->orderBy('total', 'desc')
                ->get(),
            'por_ano' => Judicial::selectRaw('YEAR(created_at) as ano, COUNT(*) as total')
                ->groupBy('ano')
                ->orderBy('ano', 'desc')
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}

