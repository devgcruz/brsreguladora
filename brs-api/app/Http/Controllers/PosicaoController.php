<?php

namespace App\Http\Controllers;

use App\Models\Posicao;
use App\Http\Requests\StorePosicaoRequest;
use App\Http\Requests\UpdatePosicaoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PosicaoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        
        $query = Posicao::query();
        
        // Aplicar busca se fornecida
        if (!empty($search)) {
            $query->where('nome', 'like', "%{$search}%");
        }
        
        // Ordenar por nome
        $query->orderBy('nome', 'asc');
        
        // Aplicar paginação
        $posicoes = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $posicoes->items(),
            'meta' => [
                'current_page' => $posicoes->currentPage(),
                'last_page' => $posicoes->lastPage(),
                'per_page' => $posicoes->perPage(),
                'total' => $posicoes->total(),
                'from' => $posicoes->firstItem(),
                'to' => $posicoes->lastItem(),
                'has_more_pages' => $posicoes->hasMorePages()
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePosicaoRequest $request)
    {
        try {
            $data = $request->validated();
            $posicao = Posicao::create($data);
            
            // Invalidar cache de form-data para atualizar os dropdowns
            Cache::forget('registro_form_data');
            
            return response()->json([
                'success' => true,
                'message' => 'Posição criada com sucesso!',
                'data' => $posicao
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar posição: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $posicao = Posicao::find($id);
            
            if (!$posicao) {
                return response()->json([
                    'success' => false,
                    'message' => 'Posição não encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $posicao
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar posição: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePosicaoRequest $request, string $id)
    {
        try {
            $posicao = Posicao::find($id);
            
            if (!$posicao) {
                return response()->json([
                    'success' => false,
                    'message' => 'Posição não encontrada'
                ], 404);
            }
            
            $data = $request->validated();
            $posicao->update($data);
            
            // Invalidar cache de form-data para atualizar os dropdowns
            Cache::forget('registro_form_data');
            
            return response()->json([
                'success' => true,
                'message' => 'Posição atualizada com sucesso!',
                'data' => $posicao
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar posição: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $posicao = Posicao::find($id);
            
            if (!$posicao) {
                return response()->json([
                    'success' => false,
                    'message' => 'Posição não encontrada'
                ], 404);
            }
            
            $posicao->delete();
            
            // Invalidar cache de form-data para atualizar os dropdowns
            Cache::forget('registro_form_data');
            
            return response()->json([
                'success' => true,
                'message' => 'Posição excluída com sucesso!'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir posição: ' . $e->getMessage()
            ], 500);
        }
    }
}