<?php

namespace App\Http\Controllers;

use App\Models\Seguradora;
use App\Http\Requests\StoreSeguradoraRequest;
use App\Http\Requests\UpdateSeguradoraRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SeguradoraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        
        $query = Seguradora::query();
        
        // Aplicar busca se fornecida
        if (!empty($search)) {
            $query->where('nome', 'like', "%{$search}%");
        }
        
        // Ordenar por nome
        $query->orderBy('nome', 'asc');
        
        // Aplicar paginação
        $seguradoras = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $seguradoras->items(),
            'meta' => [
                'current_page' => $seguradoras->currentPage(),
                'last_page' => $seguradoras->lastPage(),
                'per_page' => $seguradoras->perPage(),
                'total' => $seguradoras->total(),
                'from' => $seguradoras->firstItem(),
                'to' => $seguradoras->lastItem(),
                'has_more_pages' => $seguradoras->hasMorePages()
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSeguradoraRequest $request)
    {
        try {
            $data = $request->validated();
            $seguradora = Seguradora::create($data);
            
            // Invalidar cache de form-data para atualizar os dropdowns
            Cache::forget('registro_form_data');
            
            return response()->json([
                'success' => true,
                'message' => 'Seguradora criada com sucesso!',
                'data' => $seguradora
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar seguradora: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $seguradora = Seguradora::find($id);
            
            if (!$seguradora) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seguradora não encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $seguradora
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar seguradora: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSeguradoraRequest $request, string $id)
    {
        try {
            $seguradora = Seguradora::find($id);
            
            if (!$seguradora) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seguradora não encontrada'
                ], 404);
            }
            
            $data = $request->validated();
            $seguradora->update($data);
            
            // Invalidar cache de form-data para atualizar os dropdowns
            Cache::forget('registro_form_data');
            
            return response()->json([
                'success' => true,
                'message' => 'Seguradora atualizada com sucesso!',
                'data' => $seguradora
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar seguradora: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $seguradora = Seguradora::find($id);
            
            if (!$seguradora) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seguradora não encontrada'
                ], 404);
            }
            
            $seguradora->delete();
            
            // Invalidar cache de form-data para atualizar os dropdowns
            Cache::forget('registro_form_data');
            
            return response()->json([
                'success' => true,
                'message' => 'Seguradora excluída com sucesso!'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir seguradora: ' . $e->getMessage()
            ], 500);
        }
    }
}