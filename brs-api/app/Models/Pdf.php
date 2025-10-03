<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pdf extends Model
{
    use HasFactory;

    protected $table = 'tab_pdf';
    protected $primaryKey = 'ID_PDF';

    protected $fillable = [
        'ID_ENTRADA',
        'DESCRICAO',
        'CAMINHOPDF',
        'DATA_REGISTRO'
    ];

    protected $casts = [
        'DATA_REGISTRO' => 'datetime'
    ];

    /**
     * Relacionamento com entrada
     */
    public function entrada(): BelongsTo
    {
        return $this->belongsTo(Entrada::class, 'ID_ENTRADA', 'Id_Entrada');
    }
}

