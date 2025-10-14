import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  FileDownload as DownloadIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
// Removido date-fns - usando formatação nativa do JavaScript
import financeiroService from '../services/financeiroService';
import entradaService from '../services/entradaService';
import { exportToExcel } from '../utils/excelExporter';
import StatCard from '../components/StatCard';

const RelatoriosFinanceiroPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [relatorios, setRelatorios] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Filtros
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    status: 'todos'
  });

  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Em análise', label: 'Em análise' },
    { value: 'Rejeitado', label: 'Rejeitado' }
  ];

  // Função para buscar relatórios financeiros
  const buscarRelatorios = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Buscar todas as entradas que têm lançamentos financeiros
      const response = await entradaService.getEntradas();
      
      if (response.success) {
        const entradas = response.data || [];
        
        // Para cada entrada, buscar os lançamentos financeiros
        const relatoriosCompletos = await Promise.all(
          entradas.map(async (entrada) => {
            try {
              const financeirosResponse = await financeiroService.getFinanceirosByEntrada(entrada.id);
              const financeiros = financeirosResponse.data || [];
              
              
              return {
                entrada,
                financeiros: financeiros.filter(fin => {
                  // Se não há filtros de data, retornar todos os lançamentos
                  if (!filtros.dataInicio || !filtros.dataFim) {
                    return true;
                  }
                  
                  // Verificar se o lançamento tem alguma data que corresponde ao filtro
                  const dataInicio = new Date(filtros.dataInicio);
                  const dataFim = new Date(filtros.dataFim);
                  
                  // Verificar múltiplas datas possíveis para o filtro
                  const datasParaVerificar = [
                    fin.data_pagamento_recibo,
                    fin.data_pagamento_nota_fiscal,
                    fin.data_nota_fiscal,
                    fin.data_recibo,
                    fin.created_at
                  ].filter(Boolean); // Remove datas nulas/undefined
                  
                  // Se não há datas para verificar, incluir o lançamento
                  if (datasParaVerificar.length === 0) {
                    return true;
                  }
                  
                  // Verificar se alguma das datas está no intervalo
                  return datasParaVerificar.some(data => {
                    const dataLancamento = new Date(data);
                    return dataLancamento >= dataInicio && dataLancamento <= dataFim;
                  });
                })
              };
            } catch (error) {
              console.error(`Erro ao buscar financeiros para entrada ${entrada.id}:`, error);
              return { entrada, financeiros: [] };
            }
          })
        );
        
        // Filtrar apenas entradas que têm lançamentos financeiros
        const relatoriosFiltrados = relatoriosCompletos.filter(rel => 
          rel.financeiros.length > 0
        );
        
        setRelatorios(relatoriosFiltrados);
        setSuccess(`${relatoriosFiltrados.length} registros encontrados`);
      } else {
        setError('Erro ao buscar dados');
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      setError('Erro ao buscar relatórios financeiros');
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar expansão de linha
  const toggleExpansao = (entradaId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(entradaId)) {
      newExpanded.delete(entradaId);
    } else {
      newExpanded.add(entradaId);
    }
    setExpandedRows(newExpanded);
  };

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return '-';
    }
  };

  // Função para formatar moeda
  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const cores = {
      'Pago': 'success',
      'Pendente': 'warning',
      'Em análise': 'info',
      'Rejeitado': 'error'
    };
    return cores[status] || 'default';
  };

  // Função para calcular estatísticas
  const calcularEstatisticas = () => {
    let totalRegistros = 0;
    let totalRecibos = 0;
    let totalNotasFiscais = 0;

    relatorios.forEach((relatorio) => {
      const { entrada, financeiros } = relatorio;
      
      if (financeiros.length > 0) {
        totalRegistros++;
        
        financeiros.forEach((financeiro) => {
          totalRecibos += parseFloat(financeiro.valor_total_recibo) || 0;
          totalNotasFiscais += parseFloat(financeiro.valor_nota_fiscal) || 0;
        });
      }
    });

    return {
      totalRegistros,
      totalRecibos,
      totalNotasFiscais
    };
  };


  // Função para exportar para Excel
  const exportarParaExcel = () => {
      // Preparar dados para exportação
      const dadosExportacao = [];
      
      relatorios.forEach((relatorio) => {
        const { entrada, financeiros } = relatorio;
        
        if (financeiros.length === 0) {
          // Se não há lançamentos financeiros, adicionar apenas a entrada com campos vazios
          dadosExportacao.push({
            'Protocolo': entrada.id || entrada.protocolo || '-',
            'Data Registro Entrada': formatarData(entrada.data_registro),
            'Veículo': entrada.veiculo || '-',
            'Placa': entrada.placa || '-',
            'Chassi': entrada.chassi || '-',
            'Sinistro': entrada.cod_sinistro || '-',
            'Seguradora': entrada.seguradora || '-',
            'Data Inclusao Despesa': '-',
            'Despesas': '-',
            'Data Pagto Despesas': '-',
            'Data Inclusao Nota Fiscal': '-',
            'Nota Fiscal': '-',
            'Honorários': '-',
            'Data Pagto Honorários': '-',
            'Status': '-',
            'Observações': entrada.observacoes || '-'
          });
        } else {
          // Para cada lançamento financeiro, criar uma linha separada
          financeiros.forEach((financeiro) => {
            dadosExportacao.push({
              'Protocolo': entrada.id || entrada.protocolo || '-',
              'Data Registro Entrada': formatarData(entrada.data_registro),
              'Veículo': entrada.veiculo || '-',
              'Placa': entrada.placa || '-',
              'Chassi': entrada.chassi || '-',
              'Sinistro': entrada.cod_sinistro || '-',
              'Seguradora': entrada.seguradora || '-',
              'Data Inclusao Despesa': formatarData(financeiro.data_recibo || financeiro.created_at),
              'Despesas': formatarMoeda(financeiro.valor_total_recibo),
              'Data Pagto Despesas': formatarData(financeiro.data_pagamento_recibo),
              'Data Inclusao Nota Fiscal': formatarData(financeiro.data_nota_fiscal),
              'Nota Fiscal': financeiro.numero_nota_fiscal || '-',
              'Honorários': formatarMoeda(financeiro.valor_nota_fiscal),
              'Data Pagto Honorários': formatarData(financeiro.data_pagamento_nota_fiscal),
              'Status': financeiro.status_pagamento || 'Pendente',
              'Observações': financeiro.observacao || financeiro.OBSERVACOES || entrada.observacoes || '-'
            });
          });
        }
      });

    const result = exportToExcel(dadosExportacao, 'Relatorios_Financeiros');

    if (result.success) {
      setSuccess('Relatório financeiro exportado com sucesso.');
    } else {
      setError('Erro ao exportar relatório para Excel.');
    }
  };

  // Removido: busca automática ao carregar a página
  // Os relatórios só serão carregados quando o usuário clicar em "Buscar"

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatórios Financeiros
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Relatório de lançamentos financeiros por registro de entrada
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros de Pesquisa
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              onClick={buscarRelatorios}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportarParaExcel}
              disabled={loading || relatorios.length === 0}
              sx={{ height: '56px' }}
              color="success"
            >
              Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      {relatorios.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<AssignmentIcon />}
              title="Registros de Entrada"
              value={calcularEstatisticas().totalRegistros}
              color="primary.main"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<ReceiptIcon />}
              title="Total Recibos"
              value={formatarMoeda(calcularEstatisticas().totalRecibos)}
              color="success.main"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<AssessmentIcon />}
              title="Total Notas Fiscais"
              value={formatarMoeda(calcularEstatisticas().totalNotasFiscais)}
              color="warning.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabela de Relatórios */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Data do Registro</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Veículo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Placa</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Chassi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sinistro</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lançamentos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatorios.map((relatorio) => {
              const { entrada, financeiros } = relatorio;
              const isExpanded = expandedRows.has(entrada.id);
              
              return (
                <React.Fragment key={entrada.id}>
                  {/* Linha principal - Registro de Entrada */}
                  <TableRow 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleExpansao(entrada.id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{formatarData(entrada.data_registro)}</TableCell>
                    <TableCell>{entrada.veiculo || '-'}</TableCell>
                    <TableCell>{entrada.placa || '-'}</TableCell>
                    <TableCell>{entrada.chassi || '-'}</TableCell>
                    <TableCell>{entrada.cod_sinistro || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${financeiros.length} lançamento(s)`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  
                  {/* Linhas expandidas - Lançamentos Financeiros */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, backgroundColor: '#fafafa' }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Lançamentos Financeiros
                          </Typography>
                          
                          {financeiros.length === 0 ? (
                            <Alert severity="info">
                              Nenhum lançamento financeiro encontrado para este registro.
                            </Alert>
                          ) : (
                            <>
                              <Grid container spacing={2}>
                              {financeiros.map((financeiro, index) => (
                                <Grid item xs={12} key={financeiro.id}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Grid container spacing={2}>
                                        {/* Despesas (Recibo) */}
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ReceiptIcon color="primary" />
                                            <Box>
                                              <Typography variant="caption" color="text.secondary">
                                                Despesas (Recibo)
                                              </Typography>
                                              <Typography variant="body2" fontWeight="bold">
                                                {formatarMoeda(financeiro.valor_total_recibo)}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Grid>
                                        
                                        {/* Data de Pagamento do Recibo */}
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Data Pag. Recibo
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                              {formatarData(financeiro.data_pagamento_recibo)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        
                                        {/* Número da Nota Fiscal */}
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Nº Nota Fiscal
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                              {financeiro.numero_nota_fiscal || '-'}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        
                                        {/* Valor da Nota Fiscal */}
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MoneyIcon color="success" />
                                            <Box>
                                              <Typography variant="caption" color="text.secondary">
                                                Valor Nota Fiscal
                                              </Typography>
                                              <Typography variant="body2" fontWeight="bold">
                                                {formatarMoeda(financeiro.valor_nota_fiscal)}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Grid>
                                        
                                        {/* Data de Pagamento da Nota Fiscal */}
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Data Pag. Nota Fiscal
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                              {formatarData(financeiro.data_pagamento_nota_fiscal)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        
                                        {/* Status */}
                                        <Grid item xs={12} sm={6} md={3}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Status
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                              <Chip 
                                                label={financeiro.status_pagamento || 'Pendente'}
                                                color={getStatusColor(financeiro.status_pagamento)}
                                                size="small"
                                              />
                                            </Box>
                                          </Box>
                                        </Grid>
                                        
                                        {/* Observações */}
                                        {(financeiro.observacao || financeiro.OBSERVACOES) && (
                                          <Grid item xs={12}>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                              <DescriptionIcon color="action" sx={{ mt: 0.5 }} />
                                              <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                  Observações
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                  {financeiro.observacao || financeiro.OBSERVACOES}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          </Grid>
                                        )}
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                            
                            {/* Totais do Registro */}
                            {financeiros.length > 0 && (
                              <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  Totais do Registro
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReceiptIcon color="success" />
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">
                                            Total Despesas (Recibos)
                                          </Typography>
                                          <Typography variant="h6" fontWeight="bold" color="success.main">
                                            {formatarMoeda(
                                              financeiros.reduce((total, fin) => 
                                                total + (parseFloat(fin.valor_total_recibo) || 0), 0
                                              )
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, backgroundColor: '#e3f2fd', border: '1px solid #2196f3' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccountBalanceWalletIcon color="primary" />
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">
                                            Total Honorários (Notas Fiscais)
                                          </Typography>
                                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            {formatarMoeda(
                                              financeiros.reduce((total, fin) => 
                                                total + (parseFloat(fin.valor_nota_fiscal) || 0), 0
                                              )
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Paper sx={{ p: 2, backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                        <CalculateIcon color="warning" />
                                        <Box sx={{ textAlign: 'center' }}>
                                          <Typography variant="caption" color="text.secondary">
                                            Total Geral do Registro
                                          </Typography>
                                          <Typography variant="h5" fontWeight="bold" color="warning.main">
                                            {formatarMoeda(
                                              financeiros.reduce((total, fin) => 
                                                total + (parseFloat(fin.valor_total_recibo) || 0) + (parseFloat(fin.valor_nota_fiscal) || 0), 0
                                              )
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Box>
                            )}
                            </>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {relatorios.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Clique em "Buscar" para carregar os relatórios financeiros.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RelatoriosFinanceiroPage;
