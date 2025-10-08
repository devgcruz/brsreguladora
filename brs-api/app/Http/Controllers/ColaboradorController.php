<?php

namespace App\Http\Controllers;

use App\Models\Colaborador;
use App\Http\Requests\StoreColaboradorRequest;
use App\Http\Requests\UpdateColaboradorRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ColaboradorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        
        $query = Colaborador::query();
        
        // Aplicar busca se fornecida
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Ordenar por data de criação (mais recentes primeiro)
        $query->orderBy('created_at', 'desc');
        
        // Aplicar paginação
        $colaboradores = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $colaboradores->items(),
            'meta' => [
                'current_page' => $colaboradores->currentPage(),
                'last_page' => $colaboradores->lastPage(),
                'per_page' => $colaboradores->perPage(),
                'total' => $colaboradores->total(),
                'from' => $colaboradores->firstItem(),
                'to' => $colaboradores->lastItem(),
                'has_more_pages' => $colaboradores->hasMorePages()
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreColaboradorRequest $request)
    {
        try {
            $data = $request->validated();
            
            // Tratar upload da foto da CNH se fornecida
            if ($request->hasFile('cnh_foto')) {
                $file = $request->file('cnh_foto');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('colaboradores/cnh', $filename, 'public');
                $data['cnh_path'] = $path;
            }
            
            // Remover cnh_foto dos dados pois não é um campo da tabela
            unset($data['cnh_foto']);
            
            $colaborador = Colaborador::create($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Colaborador cadastrado com sucesso!',
                'data' => $colaborador
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cadastrar colaborador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $colaborador = Colaborador::find($id);
        
        if (!$colaborador) {
            return response()->json([
                'success' => false,
                'message' => 'Colaborador não encontrado'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $colaborador
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateColaboradorRequest $request, string $id)
    {
        try {
            $colaborador = Colaborador::find($id);
            
            if (!$colaborador) {
                return response()->json([
                    'success' => false,
                    'message' => 'Colaborador não encontrado'
                ], 404);
            }
            
            $data = $request->validated();
            
            // Tratar upload da foto da CNH se fornecida
            if ($request->hasFile('cnh_foto')) {
                // Remover arquivo antigo se existir
                if ($colaborador->cnh_path && Storage::disk('public')->exists($colaborador->cnh_path)) {
                    Storage::disk('public')->delete($colaborador->cnh_path);
                }
                
                $file = $request->file('cnh_foto');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('colaboradores/cnh', $filename, 'public');
                $data['cnh_path'] = $path;
            }
            
            // Remover cnh_foto dos dados pois não é um campo da tabela
            unset($data['cnh_foto']);
            
            $colaborador->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Colaborador atualizado com sucesso!',
                'data' => $colaborador
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar colaborador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $colaborador = Colaborador::find($id);
            
            if (!$colaborador) {
                return response()->json([
                    'success' => false,
                    'message' => 'Colaborador não encontrado'
                ], 404);
            }
            
            // Remover arquivo da CNH se existir
            if ($colaborador->cnh_path && Storage::disk('public')->exists($colaborador->cnh_path)) {
                Storage::disk('public')->delete($colaborador->cnh_path);
            }
            
            // Excluir colaborador
            $colaborador->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Colaborador excluído com sucesso!'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir colaborador: ' . $e->getMessage()
            ], 500);
        }
    }
}
