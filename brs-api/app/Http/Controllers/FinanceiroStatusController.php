<?php

namespace App\Http\Controllers;

use App\Models\Financeiro;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class FinanceiroStatusController extends Controller
{
    /**
     * Atualizar status de um lançamento financeiro
     */
    public function updateStatus(Request $request, Financeiro $financeiro): JsonResponse
    {
        // Validar o novo status
        $validated = $request->validate([
            'status' => 'required|string|in:Pago,Pendente,Em análise,Rejeitado'
        ]);

        try {
            // Atualizar o status
            $financeiro->update([
                'StatusPG' => $validated['status']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status atualizado com sucesso',
                'data' => [
                    'id' => $financeiro->Id_Financeiro,
                    'status' => $financeiro->StatusPG,
                    'entrada_id' => $financeiro->ID_ENTRADA
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status: ' . $e->getMessage()
            ], 500);
        }
    }
}
