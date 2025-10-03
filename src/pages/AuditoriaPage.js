import React, { useState, useMemo, memo, useEffect } from 'react';
import {
  Box,
  Typography,
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
  TextField,
  Button,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import OptimizedSelect from '../components/OptimizedSelect';
import auditService from '../services/auditService';

// Mapeamento de ações para ícones e cores
const actionConfig = {
  CREATE: { icon: <AddIcon />, color: 'success', label: 'Criar' },
  UPDATE: { icon: <EditIcon />, color: 'warning', label: 'Atualizar' },
  DELETE: { icon: <DeleteIcon />, color: 'error', label: 'Excluir' },
  LOGIN: { icon: <LoginIcon />, color: 'info', label: 'Login' },
  LOGOUT: { icon: <LogoutIcon />, color: 'default', label: 'Logout' },
  VIEW: { icon: <VisibilityIcon />, color: 'primary', label: 'Visualizar' }
};

// Mapeamento de entidades para ícones
const entityConfig = {
  USUARIO: { icon: <PersonIcon />, label: 'Usuário' },
  REGISTRO: { icon: <AssessmentIcon />, label: 'Registro' },
  SISTEMA: { icon: <ComputerIcon />, label: 'Sistema' },
  FINANCEIRO: { icon: <SecurityIcon />, label: 'Financeiro' }
};

const AuditoriaPage = memo(() => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    usuario: '',
    acao: '',
    entidade: '',
    dataInicio: '',
    dataFim: ''
  });
  const [logsFiltrados, setLogsFiltrados] = useState([]);
  const [modalDetalhes, setModalDetalhes] = useState({ open: false, log: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estatísticas dos logs
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    usuarios: 0,
    acoes: {},
    tipos: {}
  });

  // Função para carregar logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando logs de auditoria...');
      const response = await auditService.getAllLogs();
      if (response.success) {
        console.log('✅ Logs carregados:', response.data.length);
        setLogs(response.data);
        setLogsFiltrados(response.data);
      } else {
        console.error('❌ Erro ao carregar logs:', response.message);
        setLogs([]);
        setLogsFiltrados([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar logs:', error);
      setLogs([]);
      setLogsFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar logs
  useEffect(() => {
    loadLogs();
  }, []);

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await auditService.getLogStats();
        if (response.success) {
          setEstatisticas(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };
    
    loadStats();
  }, [logs]);

  // Aplicar filtros
  const aplicarFiltros = async () => {
    try {
      const response = await auditService.filterLogs(filtros);
      if (response.success) {
        setLogsFiltrados(response.data);
      }
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      usuario: '',
      acao: '',
      entidade: '',
      dataInicio: '',
      dataFim: ''
    });
    setLogsFiltrados(logs);
  };

  // Abrir modal de detalhes
  const handleVerDetalhes = (log) => {
    console.log('🔍 Log selecionado para detalhes:', log);
    console.log('🔍 Detalhes do log:', log.detalhes);
    setModalDetalhes({ open: true, log });
  };

  // Exportar logs
  const handleExportar = () => {
    try {
      auditService.exportLogsToCSV();
      setSnackbar({
        open: true,
        message: 'Logs exportados com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao exportar logs',
        severity: 'error'
      });
    }
  };

  // Limpar logs antigos
  const handleLimparLogs = () => {
    if (window.confirm('Tem certeza que deseja limpar logs antigos (mais de 30 dias)?')) {
      auditService.cleanOldLogs();
      setLogs(auditService.getAllLogs());
      setLogsFiltrados(auditService.getAllLogs());
      setSnackbar({
        open: true,
        message: 'Logs antigos removidos com sucesso!',
        severity: 'success'
      });
    }
  };

  // Formatar data
  const formatarData = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Formatar dados para exibição
  const formatarDados = (dados) => {
    if (!dados) return 'N/A';
    
    // Se for um objeto, formatar de forma mais legível
    if (typeof dados === 'object') {
      try {
        return JSON.stringify(dados, null, 2);
      } catch (error) {
        return String(dados);
      }
    }
    
    return String(dados);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Log de Auditoria
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={loadLogs}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportar}
          >
            Exportar CSV
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleLimparLogs}
          >
            Limpar Logs Antigos
          </Button>
        </Box>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Logs
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
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.logsHoje}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Logs Hoje
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.usuarios}
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
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ComputerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {estatisticas.acoes ? Object.keys(estatisticas.acoes).length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipos de Ações
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Usuário"
                value={filtros.usuario}
                onChange={(e) => setFiltros(prev => ({ ...prev, usuario: e.target.value }))}
                placeholder="Nome ou email do usuário"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OptimizedSelect
                label="Ação"
                value={filtros.acao}
                onChange={(value) => setFiltros(prev => ({ ...prev, acao: value }))}
                options={[
                  { value: "", label: "Todas" },
                  { value: "CREATE", label: "Criar" },
                  { value: "UPDATE", label: "Atualizar" },
                  { value: "DELETE", label: "Excluir" },
                  { value: "LOGIN", label: "Login" },
                  { value: "LOGOUT", label: "Logout" },
                  { value: "VIEW", label: "Visualizar" }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OptimizedSelect
                label="Entidade"
                value={filtros.entidade}
                onChange={(value) => setFiltros(prev => ({ ...prev, entidade: value }))}
                options={[
                  { value: "", label: "Todas" },
                  { value: "USUARIO", label: "Usuário" },
                  { value: "REGISTRO", label: "Registro" },
                  { value: "SISTEMA", label: "Sistema" },
                  { value: "FINANCEIRO", label: "Financeiro" }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={aplicarFiltros}
                  fullWidth
                >
                  Filtrar
                </Button>
                <Button
                  variant="outlined"
                  onClick={limparFiltros}
                  fullWidth
                >
                  Limpar
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Ação</TableCell>
                  <TableCell>Entidade</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(logsFiltrados || []).map((log) => {
                  const actionInfo = actionConfig[log.acao] || { icon: <SecurityIcon />, color: 'default', label: log.acao || 'Desconhecida' };
                  const entityInfo = entityConfig[log.entidade] || { icon: <SecurityIcon />, label: log.entidade || 'Desconhecida' };
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {formatarData(log.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {log.nomeUsuario ? log.nomeUsuario.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {log.nomeUsuario || 'Usuário Desconhecido'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.usuario || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={actionInfo.icon}
                          label={actionInfo.label}
                          color={actionInfo.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {entityInfo.icon}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {entityInfo.label}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {log.descricao || 'Sem descrição'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {log.ip || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Detalhes">
                          <IconButton 
                            size="small" 
                            onClick={() => handleVerDetalhes(log)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog 
        open={modalDetalhes.open} 
        onClose={() => setModalDetalhes({ open: false, log: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Log de Auditoria
        </DialogTitle>
        <DialogContent>
          {modalDetalhes.log && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data/Hora
                  </Typography>
                  <Typography variant="body1">
                    {formatarData(modalDetalhes.log.timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Usuário
                  </Typography>
                  <Typography variant="body1">
                    {modalDetalhes.log.nomeUsuario} ({modalDetalhes.log.usuario})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ação
                  </Typography>
                  <Chip
                    icon={actionConfig[modalDetalhes.log.acao]?.icon}
                    label={actionConfig[modalDetalhes.log.acao]?.label}
                    color={actionConfig[modalDetalhes.log.acao]?.color}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entidade
                  </Typography>
                  <Typography variant="body1">
                    {entityConfig[modalDetalhes.log.entidade]?.label}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Descrição
                  </Typography>
                  <Typography variant="body1">
                    {modalDetalhes.log.descricao}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Dados Anteriores */}
              {modalDetalhes.log.detalhes?.dados_anteriores || modalDetalhes.log.detalhes?.dadosAnteriores ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Dados Anteriores
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                      {formatarDados(modalDetalhes.log.detalhes?.dados_anteriores || modalDetalhes.log.detalhes?.dadosAnteriores)}
                    </pre>
                  </Paper>
                </>
              ) : null}

              {/* Dados Novos */}
              {modalDetalhes.log.detalhes?.dados_novos || modalDetalhes.log.detalhes?.dadosNovos ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Dados Novos
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                      {formatarDados(modalDetalhes.log.detalhes?.dados_novos || modalDetalhes.log.detalhes?.dadosNovos)}
                    </pre>
                  </Paper>
                </>
              ) : null}

              <Divider sx={{ my: 2 }} />

              {/* Seção de detalhes completos */}
              <Typography variant="h6" gutterBottom>
                Detalhes Completos
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  {formatarDados(modalDetalhes.log.detalhes)}
                </pre>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    IP
                  </Typography>
                  <Typography variant="body1">
                    {modalDetalhes.log.ip || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Agent
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '12px', wordBreak: 'break-all' }}>
                    {modalDetalhes.log.userAgent || modalDetalhes.log.user_agent || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDetalhes({ open: false, log: null })}>
            Fechar
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

export default AuditoriaPage;
