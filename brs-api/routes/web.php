<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Rota de login para evitar erro de redirecionamento do middleware
Route::get('/login', function () {
    return response()->json([
        'message' => 'Sessão expirada. Faça login novamente.',
        'error' => 'Unauthenticated'
    ], 401);
})->name('login');

// Rota para servir arquivos de storage
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        abort(404, 'Arquivo não encontrado');
    }
    
    $mimeType = mime_content_type($filePath);
    
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->where('path', '.*');

