<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DebugMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('🚀 DebugMiddleware - Nova requisição:', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'headers' => $request->headers->all(),
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip()
        ]);

        // Verificar autenticação
        if ($request->hasHeader('Authorization')) {
            $token = $request->bearerToken();
            \Log::info('🔐 Token encontrado:', ['token' => $token ? 'Presente' : 'Ausente']);
            
            if ($token) {
                \Log::info('🔍 Token completo:', ['token' => $token]);
            }
        } else {
            \Log::warning('⚠️ Nenhum token de autorização encontrado');
        }

        $response = $next($request);

        \Log::info('📤 DebugMiddleware - Resposta:', [
            'status' => $response->getStatusCode(),
            'headers' => $response->headers->all()
        ]);

        return $response;
    }
}
