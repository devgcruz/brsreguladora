<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEntradaRequest;
use App\Http\Requests\UpdateEntradaRequest;
use App\Http\Resources\EntradaResource;
use App\Models\Entrada;
use App\Services\EntradaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EntradaController extends Controller
{
    protected $entradaService;

    public function __construct(EntradaService $entradaService)
    {
        $this->entradaService = $entradaService;
    }

    /**
     * Listar todas as entradas
     */
    public function index(Request $request): JsonResponse
    {
        \Log::info('🔍 EntradaController::index - Iniciando listagem de entradas');
        \Log::info('🔐 Usuário autenticado:', ['user_id' => $request->user()?->id, 'user_name' => $request->user()?->nome]);
        \Log::info('📡 Headers da requisição:', $request->headers->all());
        
        $query = Entrada::with([
            'colaborador:id,nome', 
            'financeiros', 
            'judicial', 
            'pdfs', 
            'observacoes'
        ]);

        // Filtros de busca
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('PLACA', 'like', "%{$search}%")
                  ->orWhere('VEICULO', 'like', "%{$search}%")
                  ->orWhere('MARCA', 'like', "%{$search}%")
                  ->orWhere('SEGURADORA', 'like', "%{$search}%")
                  ->orWhere('SITUACAO', 'like', "%{$search}%");
            });
        }

        // Filtro por colaborador
        if ($request->has('colaborador_id')) {
            $query->where('ID_COLABORADOR', $request->get('colaborador_id'));
        }

        // Filtro por tipo
        if ($request->has('tipo')) {
            $query->where('TIPO', $request->get('tipo'));
        }

        // Filtro por situação
        if ($request->has('situacao')) {
            $query->where('SITUACAO', $request->get('situacao'));
        }

        // Filtro por data
        if ($request->has('data_inicio')) {
            $query->where('DATA_ENTRADA', '>=', $request->get('data_inicio'));
        }

        if ($request->has('data_fim')) {
            $query->where('DATA_ENTRADA', '<=', $request->get('data_fim'));
        }

        // Paginação padrão com 15 registros por página
        $perPage = $request->get('per_page', 15); // Padrão: 15 registros por página
        $entradas = $query->orderBy('Id_Entrada', 'desc')->paginate($perPage);
        
        \Log::info('📊 Paginação - Entradas encontradas:', [
            'count' => $entradas->count(),
            'total' => $entradas->total(),
            'current_page' => $entradas->currentPage(),
            'last_page' => $entradas->lastPage(),
            'per_page' => $entradas->perPage(),
            'from' => $entradas->firstItem(),
            'to' => $entradas->lastItem()
        ]);
        
        // Log dos IDs das entradas para debug
        $entradaIds = $entradas->pluck('Id_Entrada')->toArray();
        \Log::info('🆔 IDs das entradas na página atual:', $entradaIds);


        $response = [
            'success' => true,
            'data' => EntradaResource::collection($entradas),
            'meta' => [
                'current_page' => $entradas->currentPage(),
                'last_page' => $entradas->lastPage(),
                'per_page' => $entradas->perPage(),
                'total' => $entradas->total()
            ]
        ];
        
        \Log::info('✅ Resposta da API:', $response);
        
        return response()->json($response);
    }

    /**
     * Obter entrada específica
     */
    public function show(Entrada $entrada): JsonResponse
    {
        $entrada->load(['colaborador', 'financeiros', 'judicial', 'pdfs', 'observacoes']);


        return response()->json([
            'success' => true,
            'data' => new EntradaResource($entrada)
        ]);
    }

    /**
     * Criar nova entrada
     */
    public function store(StoreEntradaRequest $request): JsonResponse
    {
        \Log::info('🆕 EntradaController::store - Criando nova entrada');
        \Log::info('📦 Dados recebidos:', $request->all());
        
        // Log específico para observações
        if ($request->has('OBSERVACOES_POSTS')) {
            \Log::info('📝 Observações recebidas (CREATE):', [
                'tipo' => gettype($request->get('OBSERVACOES_POSTS')),
                'valor' => $request->get('OBSERVACOES_POSTS'),
                'is_array' => is_array($request->get('OBSERVACOES_POSTS')),
                'count' => is_array($request->get('OBSERVACOES_POSTS')) ? count($request->get('OBSERVACOES_POSTS')) : 'N/A',
                'raw_data' => $request->get('OBSERVACOES_POSTS')
            ]);
        } else {
            \Log::info('❌ OBSERVACOES_POSTS não encontrado na requisição (CREATE)');
        }
        
        $data = $request->validated();
        \Log::info('✅ Dados validados:', $data);
        
        // Log específico para observações após validação
        if (isset($data['OBSERVACOES_POSTS'])) {
            \Log::info('📝 Observações após validação:', [
                'tipo' => gettype($data['OBSERVACOES_POSTS']),
                'valor' => $data['OBSERVACOES_POSTS'],
                'is_array' => is_array($data['OBSERVACOES_POSTS']),
                'count' => is_array($data['OBSERVACOES_POSTS']) ? count($data['OBSERVACOES_POSTS']) : 'N/A'
            ]);
        } else {
            \Log::info('❌ OBSERVACOES_POSTS não encontrado após validação');
        }
        
        $entrada = $this->entradaService->createEntrada($data);
        
        \Log::info('✅ EntradaController::store - Registro criado com sucesso:', [
            'id' => $entrada->Id_Entrada,
            'placa' => $entrada->PLACA,
            'marca' => $entrada->MARCA,
            'veiculo' => $entrada->VEICULO
        ]);


        $response = [
            'success' => true,
            'message' => 'Registro criado com sucesso',
            'data' => new EntradaResource($entrada)
        ];
        
        \Log::info('📤 EntradaController::store - Resposta:', $response);
        
        return response()->json($response, 201);
    }

    /**
     * Atualizar entrada
     */
    public function update(UpdateEntradaRequest $request, Entrada $entrada): JsonResponse
    {
        \Log::info('🔄 EntradaController::update - Atualizando entrada');
        \Log::info('📦 Dados recebidos para atualização:', $request->all());
        \Log::info('🆔 ID da entrada sendo atualizada:', ['id' => $entrada->Id_Entrada]);
        
        // Log específico para observações
        if ($request->has('OBSERVACOES_POSTS')) {
            \Log::info('📝 Observações recebidas (Update):', [
                'tipo' => gettype($request->get('OBSERVACOES_POSTS')),
                'valor' => $request->get('OBSERVACOES_POSTS'),
                'is_array' => is_array($request->get('OBSERVACOES_POSTS')),
                'count' => is_array($request->get('OBSERVACOES_POSTS')) ? count($request->get('OBSERVACOES_POSTS')) : 'N/A'
            ]);
        } else {
            \Log::info('❌ OBSERVACOES_POSTS não encontrado na requisição (Update)');
        }
        
        try {
            $data = $request->validated();
            \Log::info('✅ Dados validados (Update):', $data);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ Erro de validação (Update):', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            throw $e;
        }
        
        $entradaAnterior = $entrada->toArray();
        $entrada = $this->entradaService->updateEntrada($entrada, $data);


        return response()->json([
            'success' => true,
            'message' => 'Registro atualizado com sucesso',
            'data' => new EntradaResource($entrada)
        ]);
    }

    /**
     * Excluir entrada
     */
    public function destroy(Entrada $entrada): JsonResponse
    {
        $entradaId = $entrada->Id_Entrada;
        $placa = $entrada->PLACA;

        $this->entradaService->deleteEntrada($entrada);


        return response()->json([
            'success' => true,
            'message' => 'Registro excluído com sucesso'
        ]);
    }

    /**
     * Estatísticas das entradas
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->entradaService->getStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Verificar se uma placa já existe
     */
    public function checkPlaca(Request $request): JsonResponse
    {
        try {
            $placa = $request->get('placa');
            
            if (!$placa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Placa não fornecida'
                ], 400);
            }

            $exists = Entrada::where('PLACA', $placa)->exists();
            
            return response()->json([
                'success' => true,
                'exists' => $exists,
                'message' => $exists ? 'Placa já cadastrada' : 'Placa disponível'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erro ao verificar placa: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar placa'
            ], 500);
        }
    }

}

