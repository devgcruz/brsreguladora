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
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon
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

  // Carregar colaboradores ao montar o componente
  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    setLoading(true);
    try {
      const response = await colaboradorService.getAll();
      setColaboradores(response.data || []);
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

  // Filtrar colaboradores por termo de busca
  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.cpf.includes(searchTerm) ||
    colaborador.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Confirmar exclusão
  const confirmDelete = async () => {
    if (!deleteDialog.colaborador) return;

    try {
      await colaboradorService.delete(deleteDialog.colaborador.id);
      setAlert({
        show: true,
        message: 'Colaborador excluído com sucesso!',
        type: 'success'
      });
      loadColaboradores(); // Recarregar lista
    } catch (error) {
      setAlert({
        show: true,
        message: 'Erro ao excluir colaborador',
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
        ) : filteredColaboradores.length === 0 ? (
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
                {filteredColaboradores.map((colaborador) => (
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
