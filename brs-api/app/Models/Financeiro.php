<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Financeiro extends Model
{
    use HasFactory;

    protected $table = 'tab_financeiro';
    protected $primaryKey = 'Id_Financeiro';

    protected $fillable = [
        'ID_ENTRADA',
        'DATA_NF',
        'NUM_NF',
        'Honorarios',
        'Data_Pagto_Honor',
        'Vlr_Despesas',
        'Data_pagto_Desp',
        'Baixa_NF',
        'Valor',
        'Data_Pagamento',
        'Banco',
        'OBSERVACOES',
        'INFO_ADICIONAIS',
        'StatusPG'
    ];

    protected $casts = [
        'DATA_NF' => 'date',
        'Data_Pagto_Honor' => 'date',
        'Data_pagto_Desp' => 'date',
        'Data_Pagamento' => 'date',
        'Honorarios' => 'decimal:2',
        'Vlr_Despesas' => 'decimal:2',
        'Valor' => 'decimal:2'
    ];

    /**
     * Relacionamento com entrada
     */
    public function entrada(): BelongsTo
    {
        return $this->belongsTo(Entrada::class, 'ID_ENTRADA', 'Id_Entrada');
    }
}

