import React, { useState, useMemo, memo } from 'react';
import userService from '../services/userService';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Avatar,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import OptimizedSelect from '../components/OptimizedSelect';

// Dados mockados dos usuários
const mockUsuarios = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@brs.com',
    cargo: 'Administrador',
    status: 'ativo',
    ultimoAcesso: '2024-01-15T10:30:00',
    permissoes: {
      dashboard: true,
      registros: true,
      financeiro: true,
      judicial: true,
      prestadores: true,
      relatorios: true,
      usuarios: true
    }
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@brs.com',
    cargo: 'Analista',
    status: 'ativo',
    ultimoAcesso: '2024-01-15T09:15:00',
    permissoes: {
      dashboard: true,
      registros: true,
      financeiro: false,
      judicial: true,
      prestadores: false,
      relatorios: true,
      usuarios: false
    }
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro.costa@brs.com',
    cargo: 'Operador',
    status: 'inativo',
    ultimoAcesso: '2024-01-10T14:20:00',
    permissoes: {
      dashboard: true,
      registros: true,
      financeiro: false,
      judicial: false,
      prestadores: false,
      relatorios: false,
      usuarios: false
    }
  }
];

// Opções de permissões
const permissoesDisponiveis = [
  { key: 'dashboard', label: 'Dashboard', description: 'Acesso ao painel principal' },
  { key: 'registros', label: 'Registros', description: 'Gerenciar registros de entrada' },
  { key: 'financeiro', label: 'Financeiro', description: 'Acesso a informações financeiras' },
  { key: 'judicial', label: 'Judicial', description: 'Processos judiciais' },
  { key: 'prestadores', label: 'Prestadores', description: 'Gerenciar prestadores de serviço' },
  { key: 'relatorios', label: 'Relatórios', description: 'Gerar e visualizar relatórios' },
  { key: 'usuarios', label: 'Usuários', description: 'Gerenciar usuários do sistema' }
];

const UsuariosPage = memo(() => {
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: '',
    status: 'ativo',
    permissoes: {
      dashboard: false,
      registros: false,
      financeiro: false,
      judicial: false,
      prestadores: false,
      relatorios: false,
      usuarios: false
    }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Função para abrir modal de criação
  const handleNovoUsuario = () => {
    setUsuarioEditando(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      cargo: '',
      status: 'ativo',
      permissoes: {
        dashboard: false,
        registros: false,
        financeiro: false,
        judicial: false,
        prestadores: false,
        relatorios: false,
        usuarios: false
      }
    });
    setModalAberto(true);
  };

  // Função para abrir modal de edição
  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Senha não é exibida por segurança
      cargo: usuario.cargo,
      status: usuario.status,
      permissoes: { ...usuario.permissoes }
    });
    setModalAberto(true);
  };

  // Função para salvar usuário
  const handleSalvar = () => {
    if (!formData.nome || !formData.email || !formData.cargo) {
      setSnackbar({
        open: true,
        message: 'Preencha todos os campos obrigatórios',
        severity: 'error'
      });
      return;
    }

    // Para novos usuários, senha é obrigatória
    if (!usuarioEditando && !formData.senha) {
      setSnackbar({
        open: true,
        message: 'Senha é obrigatória para novos usuários',
        severity: 'error'
      });
      return;
    }

    if (usuarioEditando) {
      // Editar usuário existente
      const dadosAtualizacao = { ...formData };
      // Se não foi informada nova senha, manter a senha atual
      if (!formData.senha) {
        delete dadosAtualizacao.senha;
      }
      
      // Usar o userService para registrar a auditoria
      const usuarioAtualizado = userService.updateUser(usuarioEditando.id, dadosAtualizacao);
      
      if (usuarioAtualizado) {
        setUsuarios(prev => prev.map(u => 
          u.id === usuarioEditando.id ? usuarioAtualizado : u
        ));
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success'
        });
      }
    } else {
      // Criar novo usuário
      const novoUsuario = userService.createUser(formData);
      
      if (novoUsuario) {
        setUsuarios(prev => [...prev, novoUsuario]);
        setSnackbar({
          open: true,
          message: 'Usuário criado com sucesso!',
          severity: 'success'
        });
      }
    }

    setModalAberto(false);
  };

  // Função para excluir usuário
  const handleExcluir = (usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      const sucesso = userService.deleteUser(usuario.id);
      
      if (sucesso) {
        setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
        setSnackbar({
          open: true,
          message: 'Usuário excluído com sucesso!',
          severity: 'success'
        });
      }
    }
  };

  // Função para alternar status do usuário
  const handleToggleStatus = (usuario) => {
    setUsuarios(prev => prev.map(u => 
      u.id === usuario.id 
        ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' }
        : u
    ));
    setSnackbar({
      open: true,
      message: `Usuário ${usuario.status === 'ativo' ? 'desativado' : 'ativado'} com sucesso!`,
      severity: 'success'
    });
  };

  // Função para alterar permissão
  const handlePermissaoChange = (permissao) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissao]: !prev.permissoes[permissao]
      }
    }));
  };

  // Estatísticas dos usuários
  const estatisticas = useMemo(() => {
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'ativo').length;
    const inativos = total - ativos;
    const administradores = usuarios.filter(u => u.cargo === 'Administrador').length;
    
    return { total, ativos, inativos, administradores };
  }, [usuarios]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gerenciamento de Usuários
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNovoUsuario}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Usuários
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <VisibilityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.ativos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuários Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <VisibilityOffIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.inativos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuários Inativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AdminIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.administradores}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administradores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Usuários */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Último Acesso</TableCell>
                  <TableCell>Permissões</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {usuario.nome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {usuario.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.cargo}
                        color={usuario.cargo === 'Administrador' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        color={usuario.status === 'ativo' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.entries(usuario.permissoes)
                          .filter(([_, temPermissao]) => temPermissao)
                          .map(([permissao, _]) => (
                            <Chip
                              key={permissao}
                              label={permissoesDisponiveis.find(p => p.key === permissao)?.label}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditarUsuario(usuario)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={usuario.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleStatus(usuario)}
                          >
                            {usuario.status === 'ativo' ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleExcluir(usuario)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
      <Dialog 
        open={modalAberto} 
        onClose={() => setModalAberto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={usuarioEditando ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                required={!usuarioEditando}
                helperText={usuarioEditando ? "Deixe em branco para manter a senha atual" : "Senha obrigatória para novos usuários"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <OptimizedSelect
                label="Cargo"
                value={formData.cargo}
                onChange={(value) => setFormData(prev => ({ ...prev, cargo: value }))}
                options={[
                  { value: "Administrador", label: "Administrador" },
                  { value: "Analista", label: "Analista" },
                  { value: "Operador", label: "Operador" },
                  { value: "Consultor", label: "Consultor" }
                ]}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <OptimizedSelect
                label="Status"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                options={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" }
                ]}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Permissões de Acesso
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Selecione quais funcionalidades este usuário pode acessar:
              </Typography>
            </Grid>

            {permissoesDisponiveis.map((permissao) => (
              <Grid item xs={12} sm={6} md={4} key={permissao.key}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permissoes[permissao.key]}
                          onChange={() => handlePermissaoChange(permissao.key)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">
                            {permissao.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permissao.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar} 
            variant="contained"
            disabled={!formData.nome || !formData.email || !formData.cargo || (!usuarioEditando && !formData.senha)}
          >
            {usuarioEditando ? 'Atualizar' : 'Criar'} Usuário
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default UsuariosPage;
