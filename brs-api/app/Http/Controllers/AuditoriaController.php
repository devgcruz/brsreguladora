<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditoriaController extends Controller
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Listar logs de auditoria
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query();

        // Filtros
        if ($request->has('usuario')) {
            $query->where('usuario', 'like', "%{$request->get('usuario')}%");
        }

        if ($request->has('acao')) {
            $query->where('acao', $request->get('acao'));
        }

        if ($request->has('entidade')) {
            $query->where('entidade', $request->get('entidade'));
        }

        if ($request->has('data_inicio')) {
            $query->where('timestamp', '>=', $request->get('data_inicio'));
        }

        if ($request->has('data_fim')) {
            $query->where('timestamp', '<=', $request->get('data_fim'));
        }

        $logs = $query->orderBy('timestamp', 'desc')->paginate(50);

        $this->auditService->log('VIEW', 'AUDITORIA', 'Listagem de logs de auditoria', [
            'filtros' => $request->all()
        ], $request->user());

        return response()->json([
            'success' => true,
            'data' => AuditLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total()
            ]
        ]);
    }

    /**
     * Obter log específico
     */
    public function show(AuditLog $auditLog): JsonResponse
    {
        $this->auditService->log('VIEW', 'AUDITORIA', 'Visualização de log de auditoria', [
            'log_id' => $auditLog->id
        ], request()->user());

        return response()->json([
            'success' => true,
            'data' => new AuditLogResource($auditLog)
        ]);
    }

    /**
     * Estatísticas de auditoria
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_logs' => AuditLog::count(),
            'logs_hoje' => AuditLog::whereDate('timestamp', today())->count(),
            'usuarios_ativos' => AuditLog::distinct('usuario')->count(),
            'acoes' => AuditLog::selectRaw('acao, COUNT(*) as total')
                ->groupBy('acao')
                ->orderBy('total', 'desc')
                ->get(),
            'entidades' => AuditLog::selectRaw('entidade, COUNT(*) as total')
                ->groupBy('entidade')
                ->orderBy('total', 'desc')
                ->get(),
            'por_dia' => AuditLog::selectRaw('DATE(timestamp) as data, COUNT(*) as total')
                ->where('timestamp', '>=', now()->subDays(30))
                ->groupBy('data')
                ->orderBy('data', 'desc')
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Exportar logs para CSV
     */
    public function export(Request $request): JsonResponse
    {
        $query = AuditLog::query();

        // Aplicar filtros se fornecidos
        if ($request->has('usuario')) {
            $query->where('usuario', 'like', "%{$request->get('usuario')}%");
        }

        if ($request->has('acao')) {
            $query->where('acao', $request->get('acao'));
        }

        if ($request->has('entidade')) {
            $query->where('entidade', $request->get('entidade'));
        }

        if ($request->has('data_inicio')) {
            $query->where('timestamp', '>=', $request->get('data_inicio'));
        }

        if ($request->has('data_fim')) {
            $query->where('timestamp', '<=', $request->get('data_fim'));
        }

        $logs = $query->orderBy('timestamp', 'desc')->get();

        $this->auditService->log('EXPORT', 'AUDITORIA', 'Exportação de logs de auditoria', [
            'total_logs' => $logs->count(),
            'filtros' => $request->all()
        ], $request->user());

        // Aqui você implementaria a lógica de exportação
        // Por exemplo, gerar um arquivo CSV e retornar o link para download

        return response()->json([
            'success' => true,
            'message' => 'Exportação iniciada. Você receberá um email quando estiver pronta.',
            'data' => [
                'total_logs' => $logs->count()
            ]
        ]);
    }

    /**
     * Limpar logs antigos
     */
    public function cleanOldLogs(Request $request): JsonResponse
    {
        $dias = $request->get('dias', 30);
        $dataLimite = now()->subDays($dias);

        $logsRemovidos = AuditLog::where('timestamp', '<', $dataLimite)->count();
        AuditLog::where('timestamp', '<', $dataLimite)->delete();

        $this->auditService->log('DELETE', 'AUDITORIA', 'Limpeza de logs antigos', [
            'dias' => $dias,
            'data_limite' => $dataLimite,
            'logs_removidos' => $logsRemovidos
        ], $request->user());

        return response()->json([
            'success' => true,
            'message' => "Logs antigos removidos com sucesso. {$logsRemovidos} registros foram excluídos.",
            'data' => [
                'logs_removidos' => $logsRemovidos,
                'data_limite' => $dataLimite
            ]
        ]);
    }
}

