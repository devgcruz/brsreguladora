<?php

namespace App\Http\Controllers;

use App\Models\Pdf;
use App\Models\Entrada;
use App\Http\Requests\PdfUploadRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PdfController extends Controller
{
    /**
     * Listar PDFs de uma entrada específica
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $entradaId = $request->get('entrada_id');
            
            if (!$entradaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID da entrada é obrigatório'
                ], 400);
            }

            // Verificar se a entrada existe
            $entrada = Entrada::find($entradaId);
            if (!$entrada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entrada não encontrada'
                ], 404);
            }

            $pdfs = Pdf::where('ID_ENTRADA', $entradaId)
                      ->orderBy('DATA_REGISTRO', 'desc')
                      ->get();

            return response()->json([
                'success' => true,
                'data' => $pdfs
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar PDFs:', [
                'error' => $e->getMessage(),
                'entrada_id' => $request->get('entrada_id')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    /**
     * Upload e salvar PDF
     */
    public function store(PdfUploadRequest $request): JsonResponse
    {
        try {
            // Log detalhado para debug
            Log::info('PDF Upload Request Debug:', [
                'entrada_id' => $request->input('entrada_id'),
                'entrada_id_type' => gettype($request->input('entrada_id')),
                'descricao' => $request->input('descricao'),
                'has_file' => $request->hasFile('pdf_file'),
                'user_id' => auth()->id(),
                'user_authenticated' => auth()->check(),
                'file_info' => $request->file('pdf_file') ? [
                    'name' => $request->file('pdf_file')->getClientOriginalName(),
                    'size' => $request->file('pdf_file')->getSize(),
                    'mime' => $request->file('pdf_file')->getMimeType(),
                    'extension' => $request->file('pdf_file')->getClientOriginalExtension()
                ] : null,
                'all_inputs' => $request->all()
            ]);

            // Validação já feita pelo PdfUploadRequest

            $entradaId = $request->input('entrada_id');
            $descricao = $request->input('descricao');
            $file = $request->file('pdf_file');

            // Entrada já validada pelo PdfUploadRequest

            // Usar nome original do arquivo com timestamp para evitar conflitos
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $fileName = $originalName . '_' . time() . '.' . $extension;
            
            // Criar diretório se não existir - salvar na pasta upload do projeto
            $uploadPath = 'upload/pdfs/' . date('Y/m');
            $fullPath = base_path($uploadPath);
            
            if (!file_exists($fullPath)) {
                mkdir($fullPath, 0755, true);
            }

            // Salvar arquivo
            $file->move($fullPath, $fileName);
            $filePath = $uploadPath . '/' . $fileName;

            // Salvar no banco de dados
            $pdf = Pdf::create([
                'ID_ENTRADA' => $entradaId,
                'DESCRICAO' => $descricao,
                'CAMINHOPDF' => $filePath,
                'DATA_REGISTRO' => now()
            ]);

            Log::info('PDF salvo com sucesso:', [
                'pdf_id' => $pdf->ID_PDF,
                'entrada_id' => $entradaId,
                'file_path' => $filePath
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PDF salvo com sucesso',
                'data' => $pdf
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('PDF Upload Validation Error:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erro ao salvar PDF:', [
                'error' => $e->getMessage(),
                'entrada_id' => $request->input('entrada_id')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    /**
     * Download PDF
     */
    public function download(string $id): JsonResponse
    {
        try {
            $pdf = Pdf::find($id);
            
            if (!$pdf) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDF não encontrado'
                ], 404);
            }

            $filePath = base_path($pdf->CAMINHOPDF);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Arquivo não encontrado no servidor'
                ], 404);
            }

            return response()->download($filePath, $pdf->DESCRICAO . '.pdf');

        } catch (\Exception $e) {
            Log::error('Erro ao fazer download do PDF:', [
                'error' => $e->getMessage(),
                'pdf_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    /**
     * Visualizar PDF (rota pública com token na query)
     */
    public function view(string $id, Request $request)
    {
        try {
            $pdf = Pdf::find($id);
            
            if (!$pdf) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDF não encontrado'
                ], 404);
            }

            $filePath = base_path($pdf->CAMINHOPDF);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Arquivo não encontrado no servidor'
                ], 404);
            }

            // Retornar arquivo com headers apropriados
            return response()->file($filePath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $pdf->DESCRICAO . '.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao visualizar PDF:', [
                'error' => $e->getMessage(),
                'pdf_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    /**
     * Excluir PDF
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $pdf = Pdf::find($id);
            
            if (!$pdf) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDF não encontrado'
                ], 404);
            }

            // Remover arquivo físico
            $filePath = base_path($pdf->CAMINHOPDF);
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Remover do banco de dados
            $pdf->delete();

            Log::info('PDF excluído com sucesso:', [
                'pdf_id' => $id,
                'file_path' => $pdf->CAMINHOPDF
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PDF excluído com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao excluir PDF:', [
                'error' => $e->getMessage(),
                'pdf_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }
}
