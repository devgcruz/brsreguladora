<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,email',
            'senha' => ['required', 'confirmed', Password::min(8)],
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = [
            'nome' => $request->nome,
            'Usuario' => $request->email, // Usando email como usuário
            'email' => $request->email,
            'Senha' => Hash::make($request->senha),
            'nivel' => 1, // Usuário padrão
            'cargo' => 'Usuário',
            'permissoes' => ['dashboard'], // Permissões básicas
            'status' => 'ativo',
            'ultimo_acesso' => now()
        ];

        // Upload da foto de perfil se fornecida
        if ($request->hasFile('profile_photo')) {
            $file = $request->file('profile_photo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/profile-photos', $filename);
            $data['profile_photo_path'] = 'profile-photos/' . $filename;
        }

        $usuario = Usuario::create($data);

        // Atribuir role padrão
        $usuario->assignRole('Usuário');

        return response()->json([
            'success' => true,
            'message' => 'Usuário cadastrado com sucesso!',
            'data' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'profile_photo_path' => $usuario->profile_photo_path
            ]
        ], 201);
    }
}