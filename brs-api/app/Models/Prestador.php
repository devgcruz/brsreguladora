<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;

class Prestador extends Model
{
    use HasFactory;

    protected $table = 'tab_login_prestadores';
    protected $primaryKey = 'ID_PRESTADOR';

    protected $fillable = [
        'FK_PARCEIRO',
        'NOME',
        'LOGIN',
        'SENHA'
    ];

    protected $hidden = [
        'SENHA'
    ];

    /**
     * Mutator para hash da senha
     */
    public function setSenhaAttribute($value)
    {
        $this->attributes['SENHA'] = Hash::make($value);
    }

    /**
     * Relacionamento com parceiro
     */
    public function parceiro(): BelongsTo
    {
        return $this->belongsTo(Parceiro::class, 'FK_PARCEIRO', 'ID_PARCEIRO');
    }

    /**
     * Relacionamento com entradas
     */
    public function entradas(): HasMany
    {
        return $this->hasMany(Entrada::class, 'ID_COLABORADOR', 'ID_PRESTADOR');
    }
}

