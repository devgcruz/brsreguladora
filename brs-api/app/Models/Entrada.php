<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Entrada extends Model
{
    use HasFactory;

    protected $table = 'tab_entrada';
    protected $primaryKey = 'Id_Entrada';

    protected $fillable = [
        'ID_COLABORADOR',
        'DATA_ENTRADA',
        'MARCA',
        'VEICULO',
        'PLACA',
        'CHASSI',
        'ANO_VEIC',
        'ANO_MODELO',
        'COD_SINISTRO',
        'NUM_BO',
        'UF_SINISTRO',
        'CIDADE_SINISTRO',
        'SEGURADORA',
        'POSICAO',
        'SITUACAO',
        'UF',
        'CIDADE',
        'MES',
        'TIPO',
        'NUMERO_PROCESSO',
        // Novos campos
        'COR',
        'RENAVAM',
        'NUMERO_MOTOR',
        // Campos condicionais para tipo Judicial
        'COMARCA',
        'NUMERO_PROCESSO_JUDICIAL',
        'NOTA_FISCAL',
        'NUMERO_VARA',
        'DATA_PAGAMENTO',
        'HONORARIO',
        'NOME_BANCO',
        'OBSERVACOES',
        // Observações em formato de posts
        'OBSERVACOES_POSTS'
    ];

    protected $casts = [
        'DATA_ENTRADA' => 'date',
        'DATA_REGISTRO' => 'datetime',
        'DATA_ALTERACAO' => 'datetime',
        'DATA_PAGAMENTO' => 'date',
        'OBSERVACOES_POSTS' => 'array'
    ];

    /**
     * Relacionamento com colaborador (prestador)
     */
    public function colaborador(): BelongsTo
    {
        return $this->belongsTo(Prestador::class, 'ID_COLABORADOR', 'ID_PRESTADOR');
    }

    /**
     * Relacionamento com financeiros
     */
    public function financeiros(): HasMany
    {
        return $this->hasMany(Financeiro::class, 'ID_ENTRADA', 'Id_Entrada');
    }

    /**
     * Relacionamento com judicial
     */
    public function judicial(): HasOne
    {
        return $this->hasOne(Judicial::class, 'ID_ENTRADA', 'Id_Entrada');
    }

    /**
     * Relacionamento com PDFs
     */
    public function pdfs(): HasMany
    {
        return $this->hasMany(Pdf::class, 'ID_ENTRADA', 'Id_Entrada');
    }
}

