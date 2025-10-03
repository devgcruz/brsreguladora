<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Parceiro extends Model
{
    use HasFactory;

    protected $table = 'tab_cad_parceiros';
    protected $primaryKey = 'ID_PARCEIRO';

    protected $fillable = [
        'NOME',
        'STATUS'
    ];

    /**
     * Relacionamento com prestadores
     */
    public function prestadores(): HasMany
    {
        return $this->hasMany(Prestador::class, 'FK_PARCEIRO', 'ID_PARCEIRO');
    }
}

