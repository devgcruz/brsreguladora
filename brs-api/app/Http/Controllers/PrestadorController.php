<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrestadorRequest;
use App\Http\Requests\UpdatePrestadorRequest;
use App\Http\Resources\PrestadorResource;
use App\Models\Prestador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrestadorController extends Controller
{

    /**
     * Listar todos os prestadores
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Prestador::with('parceiro');

            // Filtros
            if ($request->has('nome') && $request->nome) {
                $query->where('NOME', 'like', '%' . $request->nome . '%');
            }

            if ($request->has('status') && $request->status) {
                $query->where('STATUS', $request->status);
            }

            if ($request->has('parceiro_id') && $request->parceiro_id) {
                $query->where('FK_PARCEIRO', $request->parceiro_id);
            }

            // Paginação
            $perPage = $request->get('per_page', 15);
            $prestadores = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => PrestadorResource::collection($prestadores->items()),
                'meta' => [
                    'current_page' => $prestadores->currentPage(),
                    'last_page' => $prestadores->lastPage(),
                    'per_page' => $prestadores->perPage(),
                    'total' => $prestadores->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar prestadores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar novo prestador
     */
    public function store(StorePrestadorRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            
            // Hash da senha
            if (isset($data['SENHA'])) {
                $data['SENHA'] = password_hash($data['SENHA'], PASSWORD_DEFAULT);
            }

            $prestador = Prestador::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Prestador criado com sucesso',
                'data' => new PrestadorResource($prestador)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar prestador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir prestador específico
     */
    public function show(Prestador $prestador): JsonResponse
    {
        try {
            $prestador->load('parceiro');
            
            return response()->json([
                'success' => true,
                'data' => new PrestadorResource($prestador)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar prestador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar prestador
     */
    public function update(UpdatePrestadorRequest $request, Prestador $prestador): JsonResponse
    {
        try {
            $data = $request->validated();
            
            // Hash da senha se fornecida
            if (isset($data['SENHA']) && $data['SENHA']) {
                $data['SENHA'] = password_hash($data['SENHA'], PASSWORD_DEFAULT);
            } else {
                unset($data['SENHA']); // Não atualizar senha se não fornecida
            }

            $prestador->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Prestador atualizado com sucesso',
                'data' => new PrestadorResource($prestador)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar prestador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar prestador
     */
    public function destroy(Prestador $prestador): JsonResponse
    {
        try {
            $prestadorId = $prestador->ID_PRESTADOR;
            $prestadorNome = $prestador->NOME;
            
            $prestador->delete();

            return response()->json([
                'success' => true,
                'message' => 'Prestador deletado com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar prestador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas dos prestadores
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total' => Prestador::count(),
                'ativos' => Prestador::where('STATUS', 'ativo')->count(),
                'inativos' => Prestador::where('STATUS', 'inativo')->count(),
                'por_parceiro' => Prestador::selectRaw('FK_PARCEIRO, COUNT(*) as total')
                    ->with('parceiro')
                    ->groupBy('FK_PARCEIRO')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'parceiro_id' => $item->FK_PARCEIRO,
                            'parceiro_nome' => $item->parceiro->NOME ?? 'N/A',
                            'total' => $item->total
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter estatísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}





