<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Listar usuários
     */
    public function index(Request $request): JsonResponse
    {
        $query = Usuario::query();

        // Filtros
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('Usuario', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('nivel')) {
            $query->where('nivel', $request->get('nivel'));
        }

        $usuarios = $query->orderBy('nome')->paginate(15);

        $this->auditService->log('VIEW', 'USUARIO', 'Listagem de usuários', [
            'filtros' => $request->all()
        ], $request->user());

        return response()->json([
            'success' => true,
            'data' => UsuarioResource::collection($usuarios),
            'meta' => [
                'current_page' => $usuarios->currentPage(),
                'last_page' => $usuarios->lastPage(),
                'per_page' => $usuarios->perPage(),
                'total' => $usuarios->total()
            ]
        ]);
    }

    /**
     * Obter usuário específico
     */
    public function show(Usuario $usuario): JsonResponse
    {
        $this->auditService->log('VIEW', 'USUARIO', 'Visualização de usuário', [
            'usuario_id' => $usuario->id,
            'usuario_nome' => $usuario->nome
        ], request()->user());

        return response()->json([
            'success' => true,
            'data' => new UsuarioResource($usuario)
        ]);
    }

    /**
     * Criar usuário
     */
    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        $usuario = Usuario::create($data);

        $this->auditService->log('CREATE', 'USUARIO', 'Usuário criado', [
            'usuario_id' => $usuario->id,
            'usuario_nome' => $usuario->nome,
            'usuario_login' => $usuario->Usuario
        ], $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Usuário criado com sucesso',
            'data' => new UsuarioResource($usuario)
        ], 201);
    }

    /**
     * Atualizar usuário
     */
    public function update(UpdateUsuarioRequest $request, Usuario $usuario): JsonResponse
    {
        $data = $request->validated();
        
        $dadosAnteriores = $usuario->toArray();
        $usuario->update($data);

        $this->auditService->log('UPDATE', 'USUARIO', 'Usuário atualizado', [
            'usuario_id' => $usuario->id,
            'dados_anteriores' => $dadosAnteriores,
            'dados_novos' => $usuario->toArray()
        ], $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Usuário atualizado com sucesso',
            'data' => new UsuarioResource($usuario)
        ]);
    }

    /**
     * Excluir usuário
     */
    public function destroy(Usuario $usuario): JsonResponse
    {
        $usuarioId = $usuario->id;
        $usuarioNome = $usuario->nome;
        $usuarioLogin = $usuario->Usuario;

        $usuario->delete();

        $this->auditService->log('DELETE', 'USUARIO', 'Usuário excluído', [
            'usuario_id' => $usuarioId,
            'usuario_nome' => $usuarioNome,
            'usuario_login' => $usuarioLogin
        ], request()->user());

        return response()->json([
            'success' => true,
            'message' => 'Usuário excluído com sucesso'
        ]);
    }

    /**
     * Alterar status do usuário
     */
    public function toggleStatus(Usuario $usuario): JsonResponse
    {
        $statusAnterior = $usuario->status;
        $novoStatus = $usuario->status === 'ativo' ? 'inativo' : 'ativo';
        
        $usuario->update(['status' => $novoStatus]);

        $this->auditService->log('UPDATE', 'USUARIO', 'Status do usuário alterado', [
            'usuario_id' => $usuario->id,
            'status_anterior' => $statusAnterior,
            'novo_status' => $novoStatus
        ], request()->user());

        return response()->json([
            'success' => true,
            'message' => "Status do usuário alterado para {$novoStatus}",
            'data' => new UsuarioResource($usuario)
        ]);
    }

    /**
     * Alterar senha do usuário
     */
    public function changePassword(Request $request, Usuario $usuario): JsonResponse
    {
        $request->validate([
            'senha_atual' => 'required|string',
            'nova_senha' => 'required|string|min:6|confirmed'
        ]);

        if (!Hash::check($request->senha_atual, $usuario->Senha)) {
            return response()->json([
                'success' => false,
                'message' => 'Senha atual incorreta'
            ], 400);
        }

        $usuario->update(['Senha' => Hash::make($request->nova_senha)]);

        $this->auditService->log('UPDATE', 'USUARIO', 'Senha do usuário alterada', [
            'usuario_id' => $usuario->id
        ], request()->user());

        return response()->json([
            'success' => true,
            'message' => 'Senha alterada com sucesso'
        ]);
    }

    /**
     * Estatísticas dos usuários
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Usuario::count(),
            'ativos' => Usuario::where('status', 'ativo')->count(),
            'inativos' => Usuario::where('status', 'inativo')->count(),
            'administradores' => Usuario::where('nivel', '>=', 3)->count(),
            'por_nivel' => Usuario::selectRaw('nivel, COUNT(*) as total')
                ->groupBy('nivel')
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}

