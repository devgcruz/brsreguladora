<?php

use Illuminate\Support\Facades\Route;

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

