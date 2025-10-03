<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\Usuario;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Login do usuário
     */
    public function login(LoginRequest $request): JsonResponse
    {
        \Log::info('🔐 Tentativa de login:', $request->all());
        
        $credentials = $request->validated();

        $usuario = Usuario::where('Usuario', $credentials['usuario'])->first();
        
        \Log::info('👤 Usuário encontrado:', $usuario ? ['id' => $usuario->id, 'nome' => $usuario->nome] : 'Não encontrado');

        if (!$usuario || !Hash::check($credentials['senha'], $usuario->Senha)) {
            $this->auditService->log('LOGIN', 'USUARIO', 'Tentativa de login falhada', [
                'usuario' => $credentials['usuario'],
                'ip' => $request->ip()
            ]);

            throw ValidationException::withMessages([
                'usuario' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        if ($usuario->status !== 'ativo') {
            $this->auditService->log('LOGIN', 'USUARIO', 'Tentativa de login com usuário inativo', [
                'usuario' => $credentials['usuario'],
                'ip' => $request->ip()
            ]);

            throw ValidationException::withMessages([
                'usuario' => ['Sua conta está inativa. Entre em contato com o administrador.'],
            ]);
        }

        // Atualizar último acesso
        $usuario->update(['ultimo_acesso' => now()]);

        // Criar token
        $token = $usuario->createToken('auth-token')->plainTextToken;

        $this->auditService->log('LOGIN', 'USUARIO', 'Login realizado com sucesso', [
            'usuario' => $usuario->Usuario,
            'ip' => $request->ip()
        ], $usuario);

        \Log::info('✅ Login bem-sucedido:', ['usuario' => $usuario->Usuario, 'token' => substr($token, 0, 20) . '...']);

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->nome,
                    'usuario' => $usuario->Usuario,
                    'nivel' => $usuario->nivel,
                    'permissoes' => $usuario->permissoes,
                    'status' => $usuario->status,
                    'ultimo_acesso' => $usuario->ultimo_acesso
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Logout do usuário
     */
    public function logout(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $this->auditService->log('LOGOUT', 'USUARIO', 'Logout realizado', [
            'usuario' => $usuario->Usuario,
            'ip' => $request->ip()
        ], $usuario);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    /**
     * Obter dados do usuário autenticado
     */
    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'usuario' => $usuario->Usuario,
                'nivel' => $usuario->nivel,
                'permissoes' => $usuario->permissoes,
                'status' => $usuario->status,
                'ultimo_acesso' => $usuario->ultimo_acesso
            ]
        ]);
    }

    /**
     * Verificar se o usuário tem permissão
     */
    public function checkPermission(Request $request, string $permission): JsonResponse
    {
        $usuario = $request->user();
        $hasPermission = $usuario->hasPermission($permission);

        return response()->json([
            'success' => true,
            'data' => [
                'permission' => $permission,
                'has_permission' => $hasPermission
            ]
        ]);
    }
}

