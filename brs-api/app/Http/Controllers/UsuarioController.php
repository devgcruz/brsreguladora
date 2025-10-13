<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsuarioController extends Controller
{

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


        $usuarios = $query->orderBy('nome')->paginate(15);


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
        
        // Fazer hash da senha antes de criar o usuário
        $data['Senha'] = Hash::make($data['Senha']);
        
        // Garantir que permissões seja um array vazio se não for enviado
        $data['permissoes'] = $request->input('permissoes', []);
        
        $usuario = Usuario::create($data);

        // Atribuir roles se fornecidos
        if ($request->has('roles') && is_array($request->roles)) {
            $usuario->syncRoles($request->roles);
        }

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
        
        // Se a senha foi fornecida, fazer hash dela
        if (isset($data['Senha']) && !empty($data['Senha'])) {
            $data['Senha'] = Hash::make($data['Senha']);
        } else {
            // Se a senha não foi fornecida ou está vazia, remover do array para manter a senha atual
            unset($data['Senha']);
        }
        
        // Garantir que permissões seja um array vazio se não for enviado
        $data['permissoes'] = $request->input('permissoes', []);
        
        $usuario->update($data);

        // Atualizar roles se fornecidos
        if ($request->has('roles') && is_array($request->roles)) {
            $usuario->syncRoles($request->roles);
        }

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
            // Ajustado para contar usuários com o perfil 'Administrador'
            'administradores' => Usuario::whereHas('roles', function ($query) {
                $query->where('name', 'Administrador');
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Obter roles disponíveis
     */
    public function getRoles(): JsonResponse
    {
        try {
            $roles = Role::all(['name', 'id']);
            
            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter roles',
                'data' => []
            ]);
        }
    }
}

