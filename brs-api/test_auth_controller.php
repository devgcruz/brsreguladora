<?php

// Simular exatamente o que o AuthController faz
require_once 'vendor/autoload.php';

// Configurar o Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

echo "=== SIMULAÇÃO DO AUTHCONTROLLER ===\n";

// Dados de entrada (como vem do frontend)
$credentials = [
    'usuario' => 'guilherme.cruz',
    'senha' => '123456'
];

echo "Credenciais recebidas:\n";
echo "  Usuário: " . $credentials['usuario'] . "\n";
echo "  Senha: " . $credentials['senha'] . "\n\n";

// Buscar usuário (como no AuthController)
$usuario = Usuario::where('Usuario', $credentials['usuario'])->first();

if (!$usuario) {
    echo "❌ Usuário não encontrado\n";
    exit;
}

echo "✅ Usuário encontrado:\n";
echo "  ID: " . $usuario->id . "\n";
echo "  Nome: " . $usuario->nome . "\n";
echo "  Usuário: " . $usuario->Usuario . "\n";
echo "  Email: " . $usuario->email . "\n";
echo "  Status: " . $usuario->status . "\n";
echo "  Hash da senha: " . substr($usuario->Senha, 0, 20) . "...\n\n";

// Verificar senha (como no AuthController)
echo "Verificando senha com Hash::check...\n";
$senhaValida = Hash::check($credentials['senha'], $usuario->Senha);

if (!$senhaValida) {
    echo "❌ Senha incorreta\n";
    exit;
}

echo "✅ Senha válida!\n\n";

// Verificar status
if ($usuario->status !== 'ativo') {
    echo "❌ Usuário inativo\n";
    exit;
}

echo "✅ Usuário ativo!\n\n";

// Criar token
echo "Criando token...\n";
$token = $usuario->createToken('auth-token')->plainTextToken;
echo "✅ Token criado: " . substr($token, 0, 20) . "...\n\n";

echo "🎉 AUTENTICAÇÃO BEM-SUCEDIDA!\n";
echo "Resposta que seria enviada:\n";
echo json_encode([
    'success' => true,
    'message' => 'Login realizado com sucesso',
    'data' => [
        'user' => [
            'id' => $usuario->id,
            'nome' => $usuario->nome,
            'usuario' => $usuario->Usuario,
            'email' => $usuario->email,
            'nivel' => $usuario->nivel,
            'permissoes' => $usuario->permissoes,
            'status' => $usuario->status,
            'ultimo_acesso' => $usuario->ultimo_acesso,
            'profile_photo_path' => $usuario->profile_photo_path
        ],
        'token' => $token
    ]
], JSON_PRETTY_PRINT);
