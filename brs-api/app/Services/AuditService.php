<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Usuario;
use Illuminate\Http\Request;

class AuditService
{
    /**
     * Registrar log de auditoria
     */
    public function log(
        string $acao,
        string $entidade,
        string $descricao,
        array $detalhes = [],
        ?Usuario $usuario = null
    ): void {
        $request = request();
        
        AuditLog::create([
            'usuario' => $usuario ? $usuario->Usuario : 'sistema',
            'nome_usuario' => $usuario ? $usuario->nome : 'Sistema',
            'acao' => $acao,
            'entidade' => $entidade,
            'descricao' => $descricao,
            'detalhes' => $detalhes,
            'ip' => $this->getClientIp($request),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()
        ]);
    }

    /**
     * Obter IP do cliente
     */
    private function getClientIp(Request $request): string
    {
        $ipKeys = [
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }

        return $request->ip() ?? '0.0.0.0';
    }

    /**
     * Obter estatísticas de auditoria
     */
    public function getStatistics(): array
    {
        return [
            'total' => AuditLog::count(),
            'logs_hoje' => AuditLog::whereDate('timestamp', today())->count(),
            'usuarios' => AuditLog::distinct('usuario')->count(),
            'acoes' => AuditLog::selectRaw('acao, COUNT(*) as total')
                ->groupBy('acao')
                ->orderBy('total', 'desc')
                ->pluck('total', 'acao')
                ->toArray(),
            'entidades' => AuditLog::selectRaw('entidade, COUNT(*) as total')
                ->groupBy('entidade')
                ->orderBy('total', 'desc')
                ->pluck('total', 'entidade')
                ->toArray()
        ];
    }

    /**
     * Filtrar logs
     */
    public function filterLogs(array $filtros): \Illuminate\Database\Eloquent\Collection
    {
        $query = AuditLog::query();

        if (!empty($filtros['usuario'])) {
            $query->where('usuario', 'like', "%{$filtros['usuario']}%");
        }

        if (!empty($filtros['acao'])) {
            $query->where('acao', $filtros['acao']);
        }

        if (!empty($filtros['entidade'])) {
            $query->where('entidade', $filtros['entidade']);
        }

        if (!empty($filtros['data_inicio'])) {
            $query->where('timestamp', '>=', $filtros['data_inicio']);
        }

        if (!empty($filtros['data_fim'])) {
            $query->where('timestamp', '<=', $filtros['data_fim']);
        }

        return $query->orderBy('timestamp', 'desc')->get();
    }

    /**
     * Obter todos os logs
     */
    public function getAllLogs(): \Illuminate\Database\Eloquent\Collection
    {
        return AuditLog::orderBy('timestamp', 'desc')->get();
    }

    /**
     * Exportar logs para CSV
     */
    public function exportLogsToCSV(): string
    {
        $logs = AuditLog::orderBy('timestamp', 'desc')->get();
        
        $filename = 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $filepath = storage_path('app/exports/' . $filename);
        
        // Criar diretório se não existir
        if (!file_exists(dirname($filepath))) {
            mkdir(dirname($filepath), 0755, true);
        }

        $file = fopen($filepath, 'w');
        
        // Cabeçalho
        fputcsv($file, [
            'ID',
            'Usuário',
            'Nome do Usuário',
            'Ação',
            'Entidade',
            'Descrição',
            'IP',
            'Data/Hora'
        ]);

        // Dados
        foreach ($logs as $log) {
            fputcsv($file, [
                $log->id,
                $log->usuario,
                $log->nome_usuario,
                $log->acao,
                $log->entidade,
                $log->descricao,
                $log->ip,
                $log->timestamp->format('Y-m-d H:i:s')
            ]);
        }

        fclose($file);

        return $filepath;
    }

    /**
     * Limpar logs antigos
     */
    public function cleanOldLogs(int $dias = 30): int
    {
        $dataLimite = now()->subDays($dias);
        return AuditLog::where('timestamp', '<', $dataLimite)->delete();
    }
}

