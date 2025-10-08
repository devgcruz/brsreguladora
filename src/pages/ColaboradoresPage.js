import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import colaboradorService from '../services/colaboradorService';
import ColaboradorModal from '../components/ColaboradorModal';

const ColaboradoresPage = () => {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, colaborador: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState(null);
  const [cnhModal, setCnhModal] = useState({ open: false, colaborador: null, imageUrl: null });
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({});

  // Carregar colaboradores ao montar o componente
  useEffect(() => {
    loadColaboradores();
  }, [currentPage, perPage]);

  // Carregar colaboradores quando o termo de busca mudar (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        loadColaboradores();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadColaboradores = async () => {
    setLoading(true);
    try {
      const response = await colaboradorService.getAll(currentPage, perPage, searchTerm);
      
      // Atualizar dados dos colaboradores
      setColaboradores(response.data || []);
      
      // Atualizar informações de paginação
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setTotalItems(response.meta.total || 0);
        setPaginationInfo(response.meta);
      }
    } catch (error) {
      setAlert({
        show: true,
        message: 'Erro ao carregar colaboradores',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções de paginação
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(event.target.value);
    setCurrentPage(1); // Voltar para primeira página
  };

  // Abrir modal para novo colaborador
  const handleNewColaborador = () => {
    setEditingColaborador(null);
    setModalOpen(true);
  };

  // Abrir modal para editar colaborador
  const handleEditColaborador = (colaborador) => {
    setEditingColaborador(colaborador);
    setModalOpen(true);
  };

  // Abrir dialog de confirmação para exclusão
  const handleDeleteColaborador = (colaborador) => {
    setDeleteDialog({ open: true, colaborador });
  };

  // Visualizar CNH do colaborador
  const handleViewCnh = (colaborador) => {
    if (colaborador.cnh_path) {
      // Construir URL completa da imagem
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const imageUrl = `${baseUrl}/storage/${colaborador.cnh_path}`;
      
      setCnhModal({ 
        open: true, 
        colaborador, 
        imageUrl 
      });
    } else {
      setAlert({
        show: true,
        message: 'Este colaborador não possui CNH cadastrada',
        type: 'info'
      });
    }
  };

  // Confirmar exclusão
  const confirmDelete = async () => {
    if (!deleteDialog.colaborador) return;

    try {
      const response = await colaboradorService.delete(deleteDialog.colaborador.id);
      
      setAlert({
        show: true,
        message: response.message || 'Colaborador excluído com sucesso!',
        type: 'success'
      });
      loadColaboradores(); // Recarregar lista
    } catch (error) {
      let errorMessage = 'Erro ao excluir colaborador';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, colaborador: null });
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingColaborador(null);
  };

  // Callback após salvar colaborador
  const handleColaboradorSaved = () => {
    loadColaboradores();
    handleCloseModal();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Gerenciar Colaboradores
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewColaborador}
            sx={{ minWidth: 160 }}
          >
            Novo Colaborador
          </Button>
        </Box>

        {alert.show && (
          <Alert 
            severity={alert.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlert({ show: false, message: '', type: 'success' })}
          >
            {alert.message}
          </Alert>
        )}

        {/* Campo de busca */}
        <TextField
          fullWidth
          placeholder="Buscar por nome, CPF ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Lista de colaboradores */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : colaboradores.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewColaborador}
                sx={{ mt: 2 }}
              >
                Cadastrar Primeiro Colaborador
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Celular</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {colaborador.nome}
                      </Box>
                    </TableCell>
                    <TableCell>{colaborador.cpf}</TableCell>
                    <TableCell>{colaborador.email}</TableCell>
                    <TableCell>{colaborador.celular}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        onClick={() => handleViewCnh(colaborador)}
                        title="Visualizar CNH"
                        disabled={!colaborador.cnh_path}
                      >
                        {colaborador.cnh_path ? <VisibilityIcon /> : <ImageIcon />}
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditColaborador(colaborador)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteColaborador(colaborador)}
                        title="Excluir"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Controles de paginação */}
        {colaboradores.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {/* Informações de paginação */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {paginationInfo.from || 0} a {paginationInfo.to || 0} de {totalItems} colaboradores
              </Typography>
              
              {/* Seletor de itens por página */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Por página</InputLabel>
                <Select
                  value={perPage}
                  label="Por página"
                  onChange={handlePerPageChange}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Componente de paginação */}
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              disabled={loading}
            />
          </Box>
        )}
      </Paper>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, colaborador: null })}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o colaborador "{deleteDialog.colaborador?.nome}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, colaborador: null })}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de visualização da CNH */}
      <Dialog
        open={cnhModal.open}
        onClose={() => setCnhModal({ open: false, colaborador: null, imageUrl: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          CNH - {cnhModal.colaborador?.nome}
        </DialogTitle>
        <DialogContent>
          {cnhModal.imageUrl && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <img
                src={cnhModal.imageUrl}
                alt={`CNH de ${cnhModal.colaborador?.nome}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <Box sx={{ display: 'none', py: 4 }}>
                <Typography variant="h6" color="error">
                  Erro ao carregar imagem
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  A imagem da CNH não pôde ser carregada
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => window.open(cnhModal.imageUrl, '_blank')}
                  >
                    Tentar abrir em nova aba
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCnhModal({ open: false, colaborador: null, imageUrl: null })}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de cadastro/edição */}
      <ColaboradorModal
        open={modalOpen}
        onClose={handleCloseModal}
        colaborador={editingColaborador}
        onSaved={handleColaboradorSaved}
      />
    </Container>
  );
};

export default ColaboradoresPage;
