<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ColaboradorController;
use App\Http\Controllers\EntradaController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\FinanceiroStatusController;
use App\Http\Controllers\JudicialController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\PrestadorController;
use App\Http\Controllers\PdfController;
use App\Http\Controllers\PosicaoController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\SeguradoraController;
use App\Http\Controllers\ObservacaoController;
use App\Http\Controllers\FormDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rotas públicas (sem autenticação)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// Rota de visualização de PDF (sem autenticação - usa token na query)
Route::get('/pdfs/{id}/view', [PdfController::class, 'view']);

// Rotas protegidas (requerem autenticação)
Route::middleware('auth:sanctum')->group(function () {
    
        // Autenticação
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/check-permission/{permission}', [AuthController::class, 'checkPermission']);

        // Perfil do usuário
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Entradas (Registros)
    Route::get('/entradas/check-placa', [EntradaController::class, 'checkPlaca']);
    Route::get('/entradas/statistics', [EntradaController::class, 'statistics']);
    Route::apiResource('entradas', EntradaController::class);
    
    // Dados de formulário unificados
    Route::get('/form-data/registros', [FormDataController::class, 'getRegistroFormData']);
    
    // Financeiros aninhados por entrada
    Route::get('/entradas/{entrada}/financeiros', [FinanceiroController::class, 'indexByEntrada']);
    Route::post('/entradas/{entrada}/financeiros', [FinanceiroController::class, 'storeForEntrada']);
    
        // Observações aninhadas por entrada
        Route::get('/entradas/{entrada}/observacoes', [ObservacaoController::class, 'index']);
        Route::post('/entradas/{entrada}/observacoes', [ObservacaoController::class, 'store']);
        Route::delete('/observacoes/{observacao}', [ObservacaoController::class, 'destroy']);

    // PDFs
    Route::get('/pdfs', [PdfController::class, 'index']);
    Route::post('/pdfs', [PdfController::class, 'store']);
    Route::get('/pdfs/{id}/download', [PdfController::class, 'download']);
    Route::delete('/pdfs/{id}', [PdfController::class, 'destroy']);

    // Financeiro
    Route::apiResource('financeiro', FinanceiroController::class);
    Route::get('/financeiro/entrada/{entrada}', [FinanceiroController::class, 'getByEntrada']);
    Route::get('/financeiro/statistics', [FinanceiroController::class, 'statistics']);
    Route::patch('/financeiros/{financeiro}/status', [FinanceiroStatusController::class, 'updateStatus']);

    // Judicial
    Route::apiResource('judicial', JudicialController::class);
    Route::get('/judicial/entrada/{entrada}', [JudicialController::class, 'getByEntrada']);
    Route::get('/judicial/statistics', [JudicialController::class, 'statistics']);

    // Prestadores
    Route::apiResource('prestadores', PrestadorController::class);
    Route::get('/prestadores/statistics', [PrestadorController::class, 'statistics']);

    // Colaboradores
    Route::apiResource('colaboradores', ColaboradorController::class);

    // Posições
    Route::apiResource('posicoes', PosicaoController::class);

    // Marcas
    Route::apiResource('marcas', MarcaController::class);

    // Seguradoras
    Route::apiResource('seguradoras', SeguradoraController::class);

    // UFs e Cidades removidos - agora usando dados fixos (JSON) e cache local

    // Rota de estatísticas de usuários (com middleware de permissão)
    Route::get('/usuarios/statistics', [UsuarioController::class, 'statistics'])->middleware(\App\Http\Middleware\PermissionMiddleware::class . ':usuarios');

    // Usuários (apenas administradores)
    Route::middleware([\App\Http\Middleware\PermissionMiddleware::class . ':usuarios'])->group(function () {
        // IMPORTANTE: Esta rota deve vir ANTES do apiResource para evitar conflitos
        Route::get('/usuarios/roles', [UsuarioController::class, 'getRoles']);
        Route::apiResource('usuarios', UsuarioController::class);
        Route::patch('/usuarios/{usuario}/toggle-status', [UsuarioController::class, 'toggleStatus']);
        Route::post('/usuarios/{usuario}/change-password', [UsuarioController::class, 'changePassword']);
    });

});

// Rota de teste
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});

