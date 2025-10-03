<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'usuario',
        'nome_usuario',
        'acao',
        'entidade',
        'descricao',
        'detalhes',
        'ip',
        'user_agent',
        'timestamp'
    ];

    protected $casts = [
        'detalhes' => 'array',
        'timestamp' => 'datetime'
    ];

    /**
     * Scope para filtrar por usuário
     */
    public function scopeByUser($query, $usuario)
    {
        return $query->where('usuario', $usuario);
    }

    /**
     * Scope para filtrar por ação
     */
    public function scopeByAction($query, $acao)
    {
        return $query->where('acao', $acao);
    }

    /**
     * Scope para filtrar por entidade
     */
    public function scopeByEntity($query, $entidade)
    {
        return $query->where('entidade', $entidade);
    }

    /**
     * Scope para filtrar por período
     */
    public function scopeByDateRange($query, $dataInicio, $dataFim)
    {
        return $query->whereBetween('timestamp', [$dataInicio, $dataFim]);
    }
}

