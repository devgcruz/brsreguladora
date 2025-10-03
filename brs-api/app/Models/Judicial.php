<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Judicial extends Model
{
    use HasFactory;

    protected $table = 'tab_judicial';
    protected $primaryKey = 'Id_Judicial';

    protected $fillable = [
        'ID_ENTRADA',
        'COMARCA',
        'NUM_PROCESSO',
        'NOTA_FISCAL',
        'NUM_VARA',
        'DT_PAGTO',
        'HONORARIO',
        'NOME_BANCO',
        'OBSERVACOES'
    ];

    protected $casts = [
        'DT_PAGTO' => 'date',
        'HONORARIO' => 'decimal:2'
    ];

    /**
     * Relacionamento com entrada
     */
    public function entrada(): BelongsTo
    {
        return $this->belongsTo(Entrada::class, 'ID_ENTRADA', 'Id_Entrada');
    }

    /**
     * Relacionamento com diligências
     */
    public function diligencias(): HasMany
    {
        return $this->hasMany(Diligencia::class, 'ID_JUDICIAL', 'Id_Judicial');
    }
}

