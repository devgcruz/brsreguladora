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
        'NUMERO_RECIBO',
        'VALOR_TOTAL_RECIBO',
        'DATA_PAGAMENTO_RECIBO',
        'DATA_NOTA_FISCAL',
        'NUMERO_NOTA_FISCAL',
        'VALOR_NOTA_FISCAL',
        'DATA_PAGAMENTO_NOTA_FISCAL',
        'OBSERVACOES',
        'StatusPG'
    ];

    protected $casts = [
        'DATA_PAGAMENTO_RECIBO' => 'date',
        'DATA_NOTA_FISCAL' => 'date',
        'DATA_PAGAMENTO_NOTA_FISCAL' => 'date',
        'VALOR_TOTAL_RECIBO' => 'decimal:2',
        'VALOR_NOTA_FISCAL' => 'decimal:2'
    ];

    /**
     * Relacionamento com entrada
     */
    public function entrada(): BelongsTo
    {
        return $this->belongsTo(Entrada::class, 'ID_ENTRADA', 'Id_Entrada');
    }
}

