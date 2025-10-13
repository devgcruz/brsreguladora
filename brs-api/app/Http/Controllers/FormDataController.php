<?php

namespace App\Http\Controllers;

use App\Models\Posicao;
use App\Models\Marca;
use App\Models\Seguradora;
use App\Models\Prestador;
use Illuminate\Http\JsonResponse;

class FormDataController extends Controller
{
    /**
     * Retorna todos os dados necessários para popular os formulários de registro
     */
    public function getRegistroFormData(): JsonResponse
    {
        try {
            // Buscar todos os dados em paralelo para melhor performance
            $data = [
                'posicoes' => Posicao::select('id', 'nome')
                    ->orderBy('nome')
                    ->get(),
                    
                'marcas' => Marca::select('id', 'nome')
                    ->orderBy('nome')
                    ->get(),
                    
                'seguradoras' => Seguradora::select('id', 'nome')
                    ->orderBy('nome')
                    ->get(),
                    
                'colaboradores' => Prestador::select('ID_PRESTADOR as id', 'NOME as nome')
                    ->orderBy('NOME')
                    ->get(),
                    
                'prestadores' => Prestador::select('ID_PRESTADOR as id', 'NOME as nome')
                    ->orderBy('NOME')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'timestamp' => now(),
                    'count' => [
                        'posicoes' => $data['posicoes']->count(),
                        'marcas' => $data['marcas']->count(),
                        'seguradoras' => $data['seguradoras']->count(),
                        'colaboradores' => $data['colaboradores']->count(),
                        'prestadores' => $data['prestadores']->count(),
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erro ao buscar dados do formulário:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar dados do formulário',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}