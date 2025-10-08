<?php

namespace App\Http\Controllers;

use App\Models\Marca;
use App\Http\Requests\StoreMarcaRequest;
use App\Http\Requests\UpdateMarcaRequest;
use Illuminate\Http\Request;

class MarcaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        
        $query = Marca::query();
        
        // Aplicar busca se fornecida
        if (!empty($search)) {
            $query->where('nome', 'like', "%{$search}%");
        }
        
        // Ordenar por nome
        $query->orderBy('nome', 'asc');
        
        // Aplicar paginação
        $marcas = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $marcas->items(),
            'meta' => [
                'current_page' => $marcas->currentPage(),
                'last_page' => $marcas->lastPage(),
                'per_page' => $marcas->perPage(),
                'total' => $marcas->total(),
                'from' => $marcas->firstItem(),
                'to' => $marcas->lastItem(),
                'has_more_pages' => $marcas->hasMorePages()
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMarcaRequest $request)
    {
        try {
            $data = $request->validated();
            $marca = Marca::create($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Marca criada com sucesso!',
                'data' => $marca
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar marca: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $marca = Marca::find($id);
            
            if (!$marca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Marca não encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $marca
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar marca: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMarcaRequest $request, string $id)
    {
        try {
            $marca = Marca::find($id);
            
            if (!$marca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Marca não encontrada'
                ], 404);
            }
            
            $data = $request->validated();
            $marca->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Marca atualizada com sucesso!',
                'data' => $marca
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar marca: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $marca = Marca::find($id);
            
            if (!$marca) {
                return response()->json([
                    'success' => false,
                    'message' => 'Marca não encontrada'
                ], 404);
            }
            
            $marca->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Marca excluída com sucesso!'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir marca: ' . $e->getMessage()
            ], 500);
        }
    }
}