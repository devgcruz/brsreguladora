<?php

namespace App\Http\Controllers;

use App\Models\Entrada;
use App\Models\Observacao;
use App\Http\Resources\ObservacaoResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ObservacaoController extends Controller
{
    /**
     * Listar todas as observações de uma entrada
     */
    public function index(Entrada $entrada): JsonResponse
    {
        $observacoes = Observacao::where('entrada_id', $entrada->Id_Entrada)
            ->with(['usuario:id,nome,profile_photo_path'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ObservacaoResource::collection($observacoes)
        ]);
    }

    /**
     * Criar uma nova observação
     */
    public function store(Request $request, Entrada $entrada): JsonResponse
    {
        // Validar dados
        $validated = $request->validate([
            'texto' => 'required|string|max:2000'
        ]);

        try {
            // Criar observação
            $observacao = Observacao::create([
                'entrada_id' => $entrada->Id_Entrada,
                'usuario_id' => auth()->id(),
                'texto' => $validated['texto']
            ]);

            // Carregar relacionamentos
            $observacao->load(['usuario:id,nome,profile_photo_path']);

            return response()->json([
                'success' => true,
                'message' => 'Observação criada com sucesso',
                'data' => new ObservacaoResource($observacao)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar observação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir uma observação
     */
    public function destroy(Observacao $observacao): JsonResponse
    {
        try {
            $observacao->delete();

            return response()->json([
                'success' => true,
                'message' => 'Observação excluída com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir observação: ' . $e->getMessage()
            ], 500);
        }
    }
}
