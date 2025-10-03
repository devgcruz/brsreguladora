<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nome',
        'Usuario',
        'Senha',
        'nivel',
        'email',
        'cargo',
        'permissoes',
        'status',
        'ultimo_acesso'
    ];

    protected $hidden = [
        'Senha',
        'remember_token'
    ];

    protected $casts = [
        'permissoes' => 'array',
        'ultimo_acesso' => 'datetime'
    ];

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->Senha;
    }

    /**
     * Mutator para hash da senha (removido para evitar problemas)
     */
    // public function setSenhaAttribute($value)
    // {
    //     $this->attributes['Senha'] = Hash::make($value);
    // }

    /**
     * Verifica se o usuário tem uma permissão específica
     */
    public function hasPermission($permission)
    {
        $permissoes = $this->permissoes ?? [];
        return in_array($permission, $permissoes);
    }

    /**
     * Verifica se o usuário é administrador
     */
    public function isAdmin()
    {
        return $this->nivel >= 3;
    }
}

