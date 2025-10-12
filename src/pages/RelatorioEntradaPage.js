import React, { useState } from 'react';
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
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import entradaService from '../services/entradaService';

const RelatorioEntradaPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [entradas, setEntradas] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: ''
  });

  // Função para buscar relatórios
  const buscarRelatorios = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await entradaService.getEntradas();

      if (response.success) {
        let dados = response.data || [];

        // Aplica o filtro de data
        if (filtros.dataInicio && filtros.dataFim) {
          const inicio = new Date(filtros.dataInicio);
          const fim = new Date(filtros.dataFim);
          dados = dados.filter(item => {
            const dataRegistro = new Date(item.data_registro);
            return dataRegistro >= inicio && dataRegistro <= fim;
          });
        }

        setEntradas(dados);
        setSuccess(`${dados.length} registros encontrados`);
      } else {
        setError('Erro ao buscar dados de entrada');
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios de entrada:', error);
      setError('Erro ao buscar relatórios de entrada');
    } finally {
      setLoading(false);
    }
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

  // Função para exportar para Excel
  const exportarParaExcel = () => {
    try {
      const dadosExportacao = entradas.map(e => ({
        'Id Entrada': e.id,
        'Dt Entrada': formatarData(e.dt_entrada),
        'Marca': e.marca || '-',
        'Veículo': e.veiculo || '-',
        'Placa': e.placa || '-',
        'Chassi': e.chassi || '-',
        'Ano Veículo': e.ano_veiculo || '-',
        'Cód Sinistro': e.cod_sinistro || '-',
        'Núm BO': e.num_bo || '-',
        'UF Sinistro': e.uf_sinistro || '-',
        'Cidade Sinistro': e.cidade_sinistro || '-',
        'Seguradora': e.seguradora || '-',
        'Colaborador': e.colaborador || '-',
        'Posição': e.posicao || '-',
        'Situação': e.situacao || '-',
        'UF': e.uf || '-',
        'Cidade': e.cidade || '-',
        'Data Registro': formatarData(e.data_registro),
        'Data Alteração': formatarData(e.updated_at),
        'Tipo': e.tipo || '-',
        'Núm Processo': e.numero_processo || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registros de Entrada');

      // Ajuste automático da largura das colunas
      const colWidths = Object.keys(dadosExportacao[0] || {}).map(key => ({
        wch: Math.max(key.length, 25) // Define uma largura mínima ou o tamanho do cabeçalho
      }));
      ws['!cols'] = colWidths;

      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      XLSX.writeFile(wb, `Relatorio_Entradas_${dataAtual}.xlsx`);
      setSuccess('Relatório Excel exportado com sucesso.');

    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      setError('Erro ao exportar relatório para Excel');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatório de Entradas
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Relatório detalhado de todos os registros de entrada.
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
              disabled={loading || entradas.length === 0}
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

      {/* Tabela de Entradas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Data Entrada</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Veículo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Placa</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Chassi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sinistro</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Situação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entradas.map((entrada) => (
              <TableRow hover key={entrada.id}>
                <TableCell>{entrada.id}</TableCell>
                <TableCell>{formatarData(entrada.dt_entrada)}</TableCell>
                <TableCell>{entrada.veiculo || '-'}</TableCell>
                <TableCell>{entrada.placa || '-'}</TableCell>
                <TableCell>{entrada.chassi || '-'}</TableCell>
                <TableCell>{entrada.cod_sinistro || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={entrada.situacao || 'Indefinido'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {entradas.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Clique em "Buscar" para carregar os registros de entrada.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RelatorioEntradaPage;

