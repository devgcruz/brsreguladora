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
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
// Removido date-fns - usando formatação nativa do JavaScript
import financeiroService from '../services/financeiroService';
import entradaService from '../services/entradaService';

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
                financeiros: financeiros.filter(fin => 
                  // Filtrar por data de pagamento da nota fiscal se especificada
                  !filtros.dataInicio || !filtros.dataFim || 
                  (fin.data_pagamento_nota_fiscal && 
                   new Date(fin.data_pagamento_nota_fiscal) >= new Date(filtros.dataInicio) &&
                   new Date(fin.data_pagamento_nota_fiscal) <= new Date(filtros.dataFim))
                )
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
    try {
      // Preparar dados para exportação
      const dadosExportacao = [];
      
      relatorios.forEach((relatorio) => {
        const { entrada, financeiros } = relatorio;
        
        if (financeiros.length === 0) {
          // Se não há lançamentos financeiros, adicionar apenas a entrada com campos vazios
          dadosExportacao.push({
            'Data': formatarData(entrada.data_registro),
            'Veículo': entrada.veiculo || '-',
            'Placa': entrada.placa || '-',
            'Chassi': entrada.chassi || '-',
            'Sinistro': entrada.cod_sinistro || '-',
            'Despesas': '-',
            'Data Pagto Despesas': '-',
            'Nota Fiscal': '-',
            'Honorários': '-',
            'Data Pagto Honorários': '-',
            'Status': '-',
            'Observações': '-'
          });
        } else {
          // Para cada lançamento financeiro, criar uma linha separada
          // SEMPRE repetindo os dados do veículo (Data, Veículo, Placa, Chassi, Sinistro)
          financeiros.forEach((financeiro) => {
            dadosExportacao.push({
              'Data': formatarData(entrada.data_registro),
              'Veículo': entrada.veiculo || '-',
              'Placa': entrada.placa || '-',
              'Chassi': entrada.chassi || '-',
              'Sinistro': entrada.cod_sinistro || '-',
              'Despesas': formatarMoeda(financeiro.valor_total_recibo),
              'Data Pagto Despesas': formatarData(financeiro.data_pagamento_recibo),
              'Nota Fiscal': financeiro.numero_nota_fiscal || '-',
              'Honorários': formatarMoeda(financeiro.valor_nota_fiscal),
              'Data Pagto Honorários': formatarData(financeiro.data_pagamento_nota_fiscal),
              'Status': financeiro.status_pagamento || 'Pendente',
              'Observações': financeiro.observacao || financeiro.OBSERVACOES || '-'
            });
          });
        }
      });

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      
      // Criar dados para o Excel com título e dados
      const excelData = [
        // Título na primeira linha
        ['PAGAMENTOS BRS - RELATÓRIOS FINANCEIROS'],
        // Linha em branco
        [],
        // Cabeçalho das colunas
        ['Data', 'Veículo', 'Placa', 'Chassi', 'Sinistro', 'Despesas', 'Data Pagto Despesas', 'Nota Fiscal', 'Honorários', 'Data Pagto Honorários', 'Status', 'Observações'],
        // Dados dos lançamentos
        ...dadosExportacao.map(item => [
          item['Data'],
          item['Veículo'],
          item['Placa'],
          item['Chassi'],
          item['Sinistro'],
          item['Despesas'],
          item['Data Pagto Despesas'],
          item['Nota Fiscal'],
          item['Honorários'],
          item['Data Pagto Honorários'],
          item['Status'],
          item['Observações']
        ])
      ];
      
      // Criar worksheet com os dados
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Mesclar células do título (A1 até L1)
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }
      ];
      
      // Definir larguras das colunas
      const colWidths = [
        { wch: 12 }, // Data
        { wch: 15 }, // Veículo
        { wch: 10 }, // Placa
        { wch: 20 }, // Chassi
        { wch: 12 }, // Sinistro
        { wch: 15 }, // Despesas
        { wch: 18 }, // Data Pagto Despesas
        { wch: 12 }, // Nota Fiscal
        { wch: 15 }, // Honorários
        { wch: 20 }, // Data Pagto Honorários
        { wch: 12 }, // Status
        { wch: 30 }  // Observações
      ];
      ws['!cols'] = colWidths;
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Relatórios Financeiros');
      
      // Gerar nome do arquivo com data atual
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const nomeArquivo = `Relatorios_Financeiros_${dataAtual}.xlsx`;
      
      // Salvar arquivo
      XLSX.writeFile(wb, nomeArquivo);
      
      setSuccess(`Relatório exportado com sucesso: ${nomeArquivo}`);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      setError('Erro ao exportar relatório para Excel');
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
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Registros de Entrada
                    </Typography>
                    <Typography variant="h4" component="div">
                      {calcularEstatisticas().totalRegistros}
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Recibos
                    </Typography>
                    <Typography variant="h4" component="div">
                      {formatarMoeda(calcularEstatisticas().totalRecibos)}
                    </Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Notas Fiscais
                    </Typography>
                    <Typography variant="h4" component="div">
                      {formatarMoeda(calcularEstatisticas().totalNotasFiscais)}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
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
