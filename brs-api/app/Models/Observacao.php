<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Observacao extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'observacoes';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'entrada_id',
        'usuario_id',
        'texto'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relacionamento com Entrada
     */
    public function entrada(): BelongsTo
    {
        return $this->belongsTo(Entrada::class, 'entrada_id', 'Id_Entrada');
    }

    /**
     * Relacionamento com Usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id');
    }
}
