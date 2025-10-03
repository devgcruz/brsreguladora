import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import BlurredDialog from './BlurredDialog';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import pdfService from '../services/pdfService';


const PdfModal = ({ open, onClose, registroId }) => {
  const [pdfs, setPdfs] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewingPdf, setViewingPdf] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  

  // Carregar PDFs quando o modal abrir
  useEffect(() => {
    if (open && registroId) {
      loadPdfs();
    }
  }, [open, registroId]);

  const loadPdfs = async () => {
    try {
      setLoading(true);
      const response = await pdfService.getPdfsByEntrada(registroId);
      
      if (response.success) {
        setPdfs(response.data);
      } else {
        setError(response.message || 'Erro ao carregar PDFs');
      }
    } catch (err) {
      setError('Erro ao carregar PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setLoading(true);
      setError('');
      
      if (!registroId) {
        setError('ID do registro não encontrado. Feche e abra o modal novamente.');
        setLoading(false);
        return;
      }
      
      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Processar todos os arquivos
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Validar arquivo
          const validationErrors = pdfService.validatePdfFile(file);
          if (validationErrors.length > 0) {
            errors.push(`${file.name}: ${validationErrors.join(', ')}`);
            errorCount++;
            continue;
          }

          // Fazer upload de cada arquivo
          const response = await pdfService.uploadPdf(registroId, descricao || file.name, file);
          
          if (response.success) {
            successCount++;
          } else {
            errors.push(`${file.name}: ${response.message || 'Erro no upload'}`);
            errorCount++;
          }
        }
        
        // Mostrar resultado
        if (successCount > 0) {
          setSuccess(`${successCount} PDF(s) enviado(s) com sucesso!`);
          setDescricao('');
          await loadPdfs(); // Recarregar lista
        }
        
        if (errorCount > 0) {
          setError(`${errorCount} arquivo(s) com erro: ${errors.join('; ')}`);
        }
        
      } catch (err) {
        setError('Erro ao enviar PDFs');
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    }
  };

  const handleDeletePdf = (pdf) => {
    setPdfToDelete(pdf);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePdf = async () => {
    if (pdfToDelete) {
      try {
        setLoading(true);
        const response = await pdfService.deletePdf(pdfToDelete.ID_PDF);
        
        if (response.success) {
          setSuccess(response.message || 'PDF removido com sucesso!');
          await loadPdfs(); // Recarregar lista
        } else {
          setError(response.message || 'Erro ao remover PDF');
        }
      } catch (err) {
        setError('Erro ao remover PDF');
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setPdfToDelete(null);
      }
    }
  };

  const cancelDeletePdf = () => {
    setDeleteDialogOpen(false);
    setPdfToDelete(null);
  };

  const handleViewPdf = (pdf) => {
    try {
      setViewingPdf(pdf);
    } catch (err) {
      setError('Erro ao abrir PDF para visualização');
    }
  };


  const handleClose = () => {
    setDescricao('');
    setError('');
    setSuccess('');
    setViewingPdf(null);
    setDeleteDialogOpen(false);
    setPdfToDelete(null);
    setPdfs([]); // Limpar lista de PDFs
    onClose();
  };

  return (
    <BlurredDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="pdf-modal-title"
    >
      <DialogTitle id="pdf-modal-title">
        Gerenciamento de PDFs - Registro #{registroId}
      </DialogTitle>
      <DialogContent sx={{ mt: 3.125 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Descrição do PDF (opcional - será usado para todos os arquivos)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Se não preenchido, será usado o nome original de cada arquivo"
          />
          
          <Button
            variant="contained"
            component="label"
            startIcon={<AttachFileIcon />}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Selecionar PDFs (Múltiplos)'}
            <input
              type="file"
              hidden
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
            />
          </Button>
        </Box>


        <Typography variant="h6" gutterBottom>
          PDFs Anexados ({pdfs.length})
        </Typography>

        <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
          {loading && pdfs.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : pdfs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum PDF anexado ainda
              </Typography>
            </Box>
          ) : (
            <List>
              {pdfs.map((pdf) => (
                <ListItem key={pdf.ID_PDF} divider>
                  <ListItemText
                    primary={pdf.DESCRICAO}
                    secondary={`Upload: ${new Date(pdf.DATA_REGISTRO).toLocaleDateString('pt-BR')}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="visualizar"
                      onClick={() => handleViewPdf(pdf)}
                      color="primary"
                      sx={{ mr: 1 }}
                      disabled={loading}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="deletar"
                      onClick={() => handleDeletePdf(pdf)}
                      color="error"
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>

      {/* Dialog de Visualização de PDF */}
      <Dialog
        open={!!viewingPdf}
        onClose={() => setViewingPdf(null)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="pdf-viewer-title"
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(15px)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            WebkitBackdropFilter: 'blur(15px)'
          }
        }}
      >
        <DialogTitle id="pdf-viewer-title">
          {viewingPdf?.DESCRICAO}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            height: '70vh',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #ccc',
            borderRadius: 1,
            bgcolor: '#f5f5f5'
          }}>
            {viewingPdf && (
              <iframe
                src={`${pdfService.getViewPdfUrl(viewingPdf.ID_PDF)}?token=${localStorage.getItem('auth_token')}`}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '4px' }}
                title={viewingPdf.DESCRICAO}
                onError={() => setError('Erro ao carregar PDF. Verifique se o arquivo existe.')}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingPdf(null)} variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeletePdf}
        aria-labelledby="delete-dialog-title"
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(15px)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            WebkitBackdropFilter: 'blur(15px)'
          }
        }}
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar o PDF "{pdfToDelete?.DESCRICAO}"? 
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={cancelDeletePdf} 
            variant="contained" 
            color="error"
          >
            NÃO
          </Button>
          <Button 
            onClick={confirmDeletePdf} 
            variant="outlined" 
            sx={{ 
              color: 'grey.600',
              borderColor: 'grey.400',
              '&:hover': {
                borderColor: 'grey.500',
                backgroundColor: 'grey.50'
              }
            }}
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </BlurredDialog>
  );
};

export default PdfModal;


