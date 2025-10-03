import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Comment as CommentIcon } from '@mui/icons-material';
import entradaService from '../services/entradaService';
import NovoRegistroModal from '../components/NovoRegistroModal';
import EditarRegistroModal from '../components/EditarRegistroModal';
import PaginationControls from '../components/PaginationControls';
import AccessibleFab from '../components/AccessibleFab';

const RegistrosPage = () => {
  const [entradas, setEntradas] = useState([]);
  const [filteredEntradas, setFilteredEntradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15
  });

  const loadEntradas = useCallback(async (page = pagination.currentPage, perPage = pagination.perPage) => {
    try {
      setLoading(true);
      const response = await entradaService.getEntradas({}, { page, per_page: perPage });
      
      if (response.success) {
        setEntradas(response.data);
        setPagination({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page
        });
        setError('');
      } else {
        setError(response.message || 'Erro ao carregar registros');
      }
    } catch (err) {
      setError('Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage]); // Dependências de paginação

  const filterEntradas = () => {
    if (!searchTerm.trim()) {
      setFilteredEntradas(entradas);
      return;
    }

    const filtered = entradas.filter(entrada =>
      String(entrada.placa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(entrada.veiculo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(entrada.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(entrada.seguradora || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(entrada.posicao || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntradas(filtered);
  };

  useEffect(() => {
    loadEntradas(1, 15); // Carrega primeira página com 15 registros
  }, []); // Executa apenas uma vez na montagem

  useEffect(() => {
    filterEntradas();
  }, [searchTerm, entradas]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSaveRegistro = async (formData) => {
    try {
      await loadEntradas();
      setSnackbar({
        open: true,
        message: 'Registro criado com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao criar registro',
        severity: 'error'
      });
    }
  };

  const handleEditClick = (registro) => {
    setSelectedRegistro(registro);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedRegistro(null);
  };

  const handleSaveEdit = async (formData) => {
    try {
      // Recarrega a lista de registros para mostrar as alterações
      await loadEntradas();
      
      // Fechar o modal
      setEditModalOpen(false);
      setSelectedRegistro(null);
      
      // Mostrar notificação de sucesso
      setSnackbar({
        open: true,
        message: 'Registro atualizado com sucesso!',
        severity: 'success'
      });
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar registro',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (registroId) => {
    try {
      await loadEntradas(); // Recarrega a lista de registros
      setEditModalOpen(false);
      setSelectedRegistro(null);
      
      // Mostrar notificação de sucesso
      setSnackbar({
        open: true,
        message: 'Registro excluído com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir registro',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Funções de paginação
  const handlePageChange = (newPage) => {
    if (newPage !== pagination.currentPage) {
      loadEntradas(newPage, pagination.perPage);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    if (newPerPage !== pagination.perPage) {
      loadEntradas(1, newPerPage); // Volta para primeira página
    }
  };

  const getPosicaoColor = (posicao) => {
    switch (posicao) {
      // Pátios - Azul
      case 'Pátio A':
        return 'primary';
      case 'Pátio B':
        return 'primary';
      case 'Pátio C':
        return 'primary';
      
      // Oficina - Laranja
      case 'Oficina Parceira':
        return 'warning';
      
      // Documentos - Amarelo/Laranja
      case 'AGUARDA DOCUMENTOS':
        return 'warning';
      case 'DOCTOS RECEBIDO':
        return 'info';
      case 'DOCTOS RECEBIDO REP':
        return 'info';
      case 'DOCTOS ENVIADO REP':
        return 'info';
      
      // Status finais - Verde/Vermelho
      case 'FINALIZADO':
        return 'success';
      case 'CANCELADO':
        return 'error';
      
      // Padrão
      default:
        return 'default';
    }
  };


  // Função para obter o último post de observação
  const getUltimaObservacao = (entrada) => {
    if (!entrada.observacoes_posts || !Array.isArray(entrada.observacoes_posts) || entrada.observacoes_posts.length === 0) {
      return null;
    }
    
    return entrada.observacoes_posts[entrada.observacoes_posts.length - 1];
  };

  // Função para formatar a data da observação
  const formatarDataObservacao = (data) => {
    if (!data) return 'Data não disponível';
    
    try {
      let dateObj;
      
      if (typeof data === 'string') {
        // Tenta diferentes estratégias de parsing
        if (data.includes('T') || data.includes('Z')) {
          // Formato ISO
          dateObj = new Date(data);
        } else if (data.includes('/') && data.includes(',')) {
          // Formato brasileiro DD/MM/YYYY, HH:MM:SS
          const [datePart, timePart] = data.split(', ');
          const [day, month, year] = datePart.split('/');
          const [hour, minute, second] = timePart.split(':');
          
          dateObj = new Date(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );
        } else if (data.includes('/')) {
          // Formato brasileiro DD/MM/YYYY
          const parts = data.split('/');
          if (parts.length === 3) {
            dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
          } else {
            dateObj = new Date(data);
          }
        } else if (data.includes('-')) {
          // Formato YYYY-MM-DD
          dateObj = new Date(data);
        } else {
          // Tenta parsear diretamente
          dateObj = new Date(data);
        }
      } else if (data instanceof Date) {
        dateObj = data;
      } else if (typeof data === 'number') {
        // Timestamp
        dateObj = new Date(data);
      } else {
        return 'Data não disponível';
      }
      
      // Verifica se a data é válida
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  // Componente para o tooltip das observações
  const ObservacoesTooltip = ({ observacoes }) => {
    if (!observacoes || !Array.isArray(observacoes) || observacoes.length === 0) {
      return (
        <Paper sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="body2" color="text.secondary">
            Nenhuma observação encontrada
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 2, maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Observações ({observacoes.length})
        </Typography>
        <List dense>
          {observacoes.map((obs, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {obs.usuario || obs.nome || 'Usuário'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatarDataObservacao(obs.data || obs.data_criacao || obs.created_at)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {obs.texto || obs.observacao || obs.descricao || 'Sem texto'}
                    </Typography>
                  }
                />
              </ListItem>
              {index < observacoes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registros de Entrada
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Buscar por placa, veículo, marca, seguradora ou posição..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {filteredEntradas.map((entrada) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={entrada.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleEditClick(entrada)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  flex: 1
                }}
              >
                <Typography variant="h6" component="div" gutterBottom>
                  {String(entrada.marca || '')} {String(entrada.veiculo || '')}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Placa: {String(entrada.placa || '')}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Seguradora: {String(entrada.seguradora || '')}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Colaborador: {entrada.colaborador?.nome || entrada.colaborador?.NOME || 'N/A'}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={String(entrada.posicao || '')}
                    color={getPosicaoColor(entrada.posicao)}
                    size="small"
                  />
                </Box>

                {/* Área de observações */}
                <Box sx={{ mt: 2, flex: 1 }}>
                  {getUltimaObservacao(entrada) ? (
                    <Tooltip
                      title={<ObservacoesTooltip observacoes={entrada.observacoes_posts} />}
                      placement="top"
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            maxWidth: 'none',
                            '& .MuiTooltip-tooltip': {
                              backgroundColor: 'transparent',
                              boxShadow: 'none',
                              padding: 0
                            }
                          }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'grey.100'
                          }
                        }}
                      >
                        <CommentIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontWeight: 'bold',
                              color: 'primary.main'
                            }}
                          >
                            Última observação
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'text.secondary'
                            }}
                          >
                            {getUltimaObservacao(entrada).texto || getUltimaObservacao(entrada).observacao || getUltimaObservacao(entrada).descricao || 'Sem texto'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatarDataObservacao(getUltimaObservacao(entrada).data || getUltimaObservacao(entrada).data_criacao || getUltimaObservacao(entrada).created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        backgroundColor: 'grey.50',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200',
                         minHeight: '81.92px'
                      }}
                    >
                      <CommentIcon sx={{ fontSize: 16, color: 'grey.400' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontWeight: 'bold',
                            color: 'grey.500'
                          }}
                        >
                          Observações
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.disabled',
                            fontStyle: 'italic'
                          }}
                        >
                          Ainda não há observações.
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mt: 'auto', pt: 1 }}>
                  Entrada: {entrada.data_entrada ? new Date(entrada.data_entrada).toLocaleDateString('pt-BR') : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Controles de paginação */}
      <PaginationControls
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        total={pagination.total}
        perPage={pagination.perPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        loading={loading}
      />

      {filteredEntradas.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'Nenhum registro encontrado para a busca' : 'Nenhum registro encontrado'}
          </Typography>
        </Box>
      )}

      <AccessibleFab
        color="primary"
        ariaLabel="adicionar novo registro"
        tooltip="Adicionar novo registro"
        onClick={handleAddClick}
      >
        <AddIcon />
      </AccessibleFab>

      <NovoRegistroModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveRegistro}
      />

      <EditarRegistroModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        registroData={selectedRegistro}
      />

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrosPage;


