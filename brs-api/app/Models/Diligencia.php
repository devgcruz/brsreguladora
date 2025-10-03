<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diligencia extends Model
{
    use HasFactory;

    protected $table = 'tab_diligencia';
    protected $primaryKey = 'Id_Diligencia';

    protected $fillable = [
        'ID_JUDICIAL',
        'NUM_NF',
        'NUM_DILIGENCIA',
        'VALOR',
        'DATA_PAGTO',
        'DESPESAS',
        'DATA_PAGTO_DOIS'
    ];

    protected $casts = [
        'DATA_PAGTO' => 'date',
        'DATA_PAGTO_DOIS' => 'date',
        'VALOR' => 'decimal:2',
        'DESPESAS' => 'decimal:2'
    ];

    /**
     * Relacionamento com judicial
     */
    public function judicial(): BelongsTo
    {
        return $this->belongsTo(Judicial::class, 'ID_JUDICIAL', 'Id_Judicial');
    }
}

