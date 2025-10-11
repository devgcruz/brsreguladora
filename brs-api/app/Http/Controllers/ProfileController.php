<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Obter dados do perfil do usuário
     */
    public function show(Request $request)
    {
        $usuario = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'profile_photo_path' => $usuario->profile_photo_path,
                'profile_photo_url' => $usuario->profile_photo_path ? 
                    url('storage/' . $usuario->profile_photo_path) : null
            ]
        ]);
    }

    /**
     * Atualizar dados do perfil
     */
    public function update(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,email,' . $usuario->id,
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = [
            'nome' => $request->nome,
            'email' => $request->email
        ];

        // Upload da nova foto de perfil se fornecida
        if ($request->hasFile('profile_photo')) {
            // Excluir foto antiga se existir
            if ($usuario->profile_photo_path && Storage::exists($usuario->profile_photo_path)) {
                Storage::delete($usuario->profile_photo_path);
            }

            $file = $request->file('profile_photo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/profile-photos', $filename);
            $data['profile_photo_path'] = 'profile-photos/' . $filename;
        }

        $usuario->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Perfil atualizado com sucesso!',
            'data' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'profile_photo_path' => $usuario->profile_photo_path,
                'profile_photo_url' => $usuario->profile_photo_path ? 
                    url('storage/' . $usuario->profile_photo_path) : null
            ]
        ]);
    }

    /**
     * Alterar senha do usuário
     */
    public function changePassword(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Verificar senha atual
        if (!Hash::check($request->current_password, $usuario->Senha)) {
            return response()->json([
                'success' => false,
                'message' => 'Senha atual incorreta.'
            ], 422);
        }

        // Atualizar senha
        $usuario->update([
            'Senha' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Senha alterada com sucesso!'
        ]);
    }
}