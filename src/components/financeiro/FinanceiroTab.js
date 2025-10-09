import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import financeiroService from '../../services/financeiroService';

const FinanceiroTab = ({ entradaId }) => {
  const [financeiros, setFinanceiros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFinanceiro, setEditingFinanceiro] = useState(null);
  const [formData, setFormData] = useState({
    NUMERO_RECIBO: '',
    VALOR_TOTAL_RECIBO: '',
    DATA_PAGAMENTO_RECIBO: '',
    DATA_NOTA_FISCAL: '',
    NUMERO_NOTA_FISCAL: '',
    VALOR_NOTA_FISCAL: '',
    DATA_PAGAMENTO_NOTA_FISCAL: '',
    OBSERVACAO: '',
    StatusPG: 'Pendente'
  });

  const statusOptions = [
    'Pendente',
    'Pago',
    'Em análise',
    'Rejeitado'
  ];

  const statusColors = {
    'Pendente': 'warning',
    'Pago': 'success',
    'Em análise': 'info',
    'Rejeitado': 'error'
  };

  useEffect(() => {
    console.log('FinanceiroTab - entradaId recebido:', entradaId);
    if (entradaId) {
      fetchFinanceiros();
    }
  }, [entradaId]);

  const fetchFinanceiros = async () => {
    try {
      setLoading(true);
      console.log('FinanceiroTab - Buscando financeiros para entradaId:', entradaId);
      const response = await financeiroService.getFinanceirosByEntrada(entradaId);
      console.log('FinanceiroTab - Resposta da API:', response);
      setFinanceiros(response.data || []);
    } catch (error) {
      setError('Erro ao carregar lançamentos financeiros');
      console.error('Erro ao carregar financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      NUMERO_RECIBO: '',
      VALOR_TOTAL_RECIBO: '',
      DATA_PAGAMENTO_RECIBO: '',
      DATA_NOTA_FISCAL: '',
      NUMERO_NOTA_FISCAL: '',
      VALOR_NOTA_FISCAL: '',
      DATA_PAGAMENTO_NOTA_FISCAL: '',
      OBSERVACAO: '',
      StatusPG: 'Pendente'
    });
    setEditingFinanceiro(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingFinanceiro) {
        await financeiroService.updateFinanceiro(editingFinanceiro.id, formData);
        setSuccess('Lançamento financeiro atualizado com sucesso!');
      } else {
        await financeiroService.createFinanceiroForEntrada(entradaId, formData);
        setSuccess('Lançamento financeiro criado com sucesso!');
      }
      
      setEditModalOpen(false);
      resetForm();
      fetchFinanceiros();
    } catch (error) {
      setError('Erro ao salvar lançamento financeiro');
      console.error('Erro ao salvar financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (financeiro) => {
    setEditingFinanceiro(financeiro);
    setFormData({
      NUMERO_RECIBO: financeiro.numero_recibo || '',
      VALOR_TOTAL_RECIBO: financeiro.valor_total_recibo || '',
      DATA_PAGAMENTO_RECIBO: financeiro.data_pagamento_recibo || '',
      DATA_NOTA_FISCAL: financeiro.data_nota_fiscal || '',
      NUMERO_NOTA_FISCAL: financeiro.numero_nota_fiscal || '',
      VALOR_NOTA_FISCAL: financeiro.valor_nota_fiscal || '',
      DATA_PAGAMENTO_NOTA_FISCAL: financeiro.data_pagamento_nota_fiscal || '',
      OBSERVACAO: financeiro.observacao || '',
      StatusPG: financeiro.status_pagamento || 'Pendente'
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (financeiro) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento financeiro?')) {
      try {
        setLoading(true);
        await financeiroService.deleteFinanceiro(financeiro.id);
        setSuccess('Lançamento financeiro excluído com sucesso!');
        fetchFinanceiros();
      } catch (error) {
        setError('Erro ao excluir lançamento financeiro');
        console.error('Erro ao excluir financeiro:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    resetForm();
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateTotal = () => {
    const totalRecibo = financeiros.reduce((sum, item) => {
      return sum + (parseFloat(item.valor_total_recibo) || 0);
    }, 0);
    
    const totalNotaFiscal = financeiros.reduce((sum, item) => {
      return sum + (parseFloat(item.valor_nota_fiscal) || 0);
    }, 0);
    
    return {
      totalRecibo,
      totalNotaFiscal,
      totalGeral: totalRecibo + totalNotaFiscal
    };
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Lançamentos Financeiros</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditModalOpen(true)}
          disabled={loading}
        >
          Adicionar Lançamento
        </Button>
      </Box>

      {loading && !financeiros.length && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {!loading && financeiros.length === 0 && (
        <Box textAlign="center" p={3}>
          <Typography variant="body2" color="textSecondary">
            Nenhum lançamento financeiro encontrado para esta entrada.
          </Typography>
        </Box>
      )}

      {financeiros.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Recibo</TableCell>
                <TableCell>Valor Recibo</TableCell>
                <TableCell>Data Pag. Recibo</TableCell>
                <TableCell>Nº Nota Fiscal</TableCell>
                <TableCell>Valor Nota Fiscal</TableCell>
                <TableCell>Data Pag. NF</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financeiros.map((financeiro) => (
                <TableRow key={financeiro.id}>
                  <TableCell>{financeiro.numero_recibo}</TableCell>
                  <TableCell>{formatCurrency(financeiro.valor_total_recibo)}</TableCell>
                  <TableCell>{formatDate(financeiro.data_pagamento_recibo)}</TableCell>
                  <TableCell>{financeiro.numero_nota_fiscal}</TableCell>
                  <TableCell>{formatCurrency(financeiro.valor_nota_fiscal)}</TableCell>
                  <TableCell>{formatDate(financeiro.data_pagamento_nota_fiscal)}</TableCell>
                  <TableCell>
                    <Chip
                      label={financeiro.status_pagamento}
                      color={statusColors[financeiro.status_pagamento] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(financeiro)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(financeiro)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {/* Linha de total */}
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <TableCell colSpan={1} sx={{ fontWeight: 'bold' }}>
                  TOTAL GERAL:
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(calculateTotal().totalRecibo)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(calculateTotal().totalNotaFiscal)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatCurrency(calculateTotal().totalGeral)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Edição/Criação */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingFinanceiro ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Dados do Recibo
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="NUMERO_RECIBO"
                  label="Número do Recibo"
                  value={formData.NUMERO_RECIBO}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="VALOR_TOTAL_RECIBO"
                  label="Valor Total do Recibo"
                  type="number"
                  value={formData.VALOR_TOTAL_RECIBO}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="DATA_PAGAMENTO_RECIBO"
                  label="Data de Pagamento do Recibo"
                  type="date"
                  value={formData.DATA_PAGAMENTO_RECIBO}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="StatusPG"
                    value={formData.StatusPG}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Dados da Nota Fiscal
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="DATA_NOTA_FISCAL"
                  label="Data da Nota Fiscal"
                  type="date"
                  value={formData.DATA_NOTA_FISCAL}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="NUMERO_NOTA_FISCAL"
                  label="Número da Nota Fiscal"
                  value={formData.NUMERO_NOTA_FISCAL}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="VALOR_NOTA_FISCAL"
                  label="Valor da Nota Fiscal"
                  type="number"
                  value={formData.VALOR_NOTA_FISCAL}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="DATA_PAGAMENTO_NOTA_FISCAL"
                  label="Data de Pagamento da Nota Fiscal"
                  type="date"
                  value={formData.DATA_PAGAMENTO_NOTA_FISCAL}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="OBSERVACAO"
                  label="Observação"
                  value={formData.OBSERVACAO}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseModal}
              disabled={loading}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              {loading ? <CircularProgress size={20} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FinanceiroTab;
