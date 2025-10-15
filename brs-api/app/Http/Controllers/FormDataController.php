<?php

namespace App\Http\Controllers;

use App\Models\Colaborador; // Certifica-se de que está a usar o Modelo Colaborador
use App\Models\Marca;
use App\Models\Posicao;
use App\Models\Seguradora;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FormDataController extends Controller
{
    /**
     * Obter dados unificados para os formulários de registro de entrada.
     * Este endpoint é otimizado com cache para melhorar o desempenho.
     */
    public function getRegistroFormData()
    {
        // Tenta obter os dados do cache. Se não existirem, executa a função para buscar no banco.
        $data = Cache::remember('registro_form_data', 60, function () {
            // A chave 'registro_form_data' identifica este cache.
            // O número 60 indica que o cache será válido por 60 minutos.

            return [
                'posicoes' => Posicao::orderBy('nome')->get(['id', 'nome']),
                'marcas' => Marca::orderBy('nome')->get(['id', 'nome']),
                'seguradoras' => Seguradora::orderBy('nome')->get(['id', 'nome']),
                
                // CORREÇÃO APLICADA AQUI:
                // Buscamos da tabela 'Colaborador' e garantimos que a chave no JSON
                // seja 'colaboradores', que é o que o frontend espera.
                'colaboradores' => Colaborador::orderBy('nome')->get(['id', 'nome']),
            ];
        });

        // Retorna os dados em formato JSON
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}