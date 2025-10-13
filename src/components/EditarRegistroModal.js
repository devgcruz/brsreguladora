import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  Snackbar,
  Skeleton,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
import BlurredDialog from './BlurredDialog';
import GuardedSelect from './GuardedSelect'; // NOVO COMPONENTE ULTRA-SEGURO
import GenericAutocomplete from './GenericAutocomplete';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PdfModal from './PdfModal';
import FinanceiroTab from './financeiro/FinanceiroTab';
import ObservacoesFeed from './ObservacoesFeed';
import prestadorService from '../services/prestadorService';
import entradaService from '../services/entradaService';
import useOptimizedDropdowns from '../hooks/useOptimizedDropdowns';
import useRegistroEntradaDropdowns from '../hooks/useRegistroEntradaDropdowns';
import { validatePlaca } from '../utils/placaValidator';

// Estado inicial vazio para o formulário (apenas campos de texto)
const initialState = {
  protocolo: '', entrada: '', marca: '', veiculo: '', placa: '',
  chassi: '', anoVeiculo: '', anoModelo: '', seguradora: '', codSinistro: '',
  numeroBO: '', posicao: '', numeroProcesso: '', tipo: '', situacao: '', cor: '',
  renavam: '', numeroMotor: '', comarca: '', numeroProcessoJudicial: '',
  notaFiscal: '', numeroVara: '', dataPagamento: '', honorario: '',
  nomeBanco: '', observacoes: ''
};

const EditarRegistroModal = ({ open, onClose, onSave, onDelete, registroData }) => {
  const [textFieldsData, setTextFieldsData] = useState(initialState); // Renomeado para clareza
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Hook otimizado para dropdowns com estado centralizado
  const {
    loading: dropdownsLoading,
    dropdownValues,
    handleDropdownChange,
    initializeDropdownValues,
    ufOptions,
    cidadeSinistroOptions,
    cidadeLocalizacaoOptions,
    colaboradorOptions
  } = useOptimizedDropdowns();

  // Hook para dados dinâmicos dos selects
  const {
    posicoes,
    marcas,
    seguradoras,
    colaboradores: colaboradoresDinamicos,
    loading: loadingDropdowns,
    error: errorDropdowns,
    reloadData: reloadDropdowns
  } = useRegistroEntradaDropdowns();

  // Observações agora são gerenciadas na aba dedicada via ObservacoesFeed
  
  // Estados para validação de placa
  const [placaValidation, setPlacaValidation] = useState({
    isValid: null,
    message: '',
    format: null
  });
  const [placaSnackbar, setPlacaSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Handlers antigos removidos - agora gerenciados pelo hook centralizado

  // useEffect antigo removido - agora gerenciado pela nova arquitetura centralizada


  // Opções estáticas memoizadas (mantendo apenas as que não foram migradas)
  const tipos = useMemo(() => ['JUDICIAL', 'ADM', 'Danos a Terceiros'].map(t => ({ value: t, label: t })), []);


  // Função para garantir que valores sejam strings válidas
  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const safeValue = (value) => {
    if (value === null || value === undefined) return '';
    return value;
  };

  // SOLUÇÃO ARQUITETURAL DEFINITIVA: ESTADO CENTRALIZADO
  useEffect(() => {
    if (open && registroData) {
      // O hook agora cuida de todo o carregamento e preenchimento dos selects
      initializeDropdownValues(registroData);

      // O modal só se preocupa com os campos de texto
      setTextFieldsData({
        protocolo: String(registroData.id || ''),
        entrada: registroData.data_entrada || '',
        marca: String(registroData.marca || ''),
        veiculo: String(registroData.veiculo || ''),
        placa: String(registroData.placa || ''),
        chassi: String(registroData.chassi || ''),
        anoVeiculo: String(registroData.ano_veiculo || ''),
        anoModelo: String(registroData.ano_modelo || ''),
        seguradora: String(registroData.seguradora || ''),
        codSinistro: String(registroData.cod_sinistro || ''),
        numeroBO: String(registroData.numero_bo || ''),
        posicao: String(registroData.posicao || ''),
        numeroProcesso: String(registroData.numero_processo || ''),
        tipo: String(registroData.tipo || ''),
        situacao: String(registroData.situacao || ''),
        cor: String(registroData.cor || ''),
        renavam: String(registroData.renavam || ''),
        numeroMotor: String(registroData.numero_motor || ''),
        comarca: String(registroData.comarca || ''),
        numeroProcessoJudicial: String(registroData.numero_processo_judicial || ''),
        notaFiscal: String(registroData.nota_fiscal || ''),
        numeroVara: String(registroData.numero_vara || ''),
        dataPagamento: String(registroData.data_pagamento || ''),
        honorario: String(registroData.honorario || ''),
        nomeBanco: String(registroData.nome_banco || ''),
        observacoes: String(registroData.observacoes || '')
      });

      // Observações são carregadas automaticamente na aba dedicada
    } else if (!open) {
      setTextFieldsData(initialState); // Limpa ao fechar
    }
  }, [open, registroData, initializeDropdownValues]);


  // Função para validar formato da placa
  const validatePlacaFormat = useCallback((placa) => {
    if (!placa || placa.trim() === '') {
      setPlacaValidation({
        isValid: null,
        message: '',
        format: null
      });
      return false;
    }

    const validation = validatePlaca(placa);
    setPlacaValidation(validation);
    return validation.isValid;
  }, []);

  // Handler para os campos de TEXTO
  const handleTextFieldChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setTextFieldsData(prev => ({ ...prev, [field]: value }));
    
    // Validar formato da placa em tempo real
    if (field === 'placa') {
      validatePlacaFormat(value);
    }
  }, [validatePlacaFormat]);

  // Handler para os DROPDOWNS vindo do hook
  const handleSelectChange = useCallback((field) => (event) => {
    handleDropdownChange(field, event.target.value);
  }, [handleDropdownChange]);

  // Funções de observações removidas - agora gerenciadas via ObservacoesFeed

  const handleOpenPdfModal = useCallback(() => {
    setPdfModalOpen(true);
  }, []);

  const handleClosePdfModal = useCallback(() => {
    setPdfModalOpen(false);
  }, []);

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      setDeleting(true);
      setError('');
      
      // Chamar serviço de exclusão
      const response = await entradaService.deleteEntrada(registroData.id);
      
      if (response.success) {
        setSuccess('Registro excluído com sucesso!');
        
        // Chamar callback de exclusão
        if (onDelete) {
          onDelete(registroData.id);
        }

        // Fechar modal após um breve delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        throw new Error(response.message || 'Erro ao excluir registro');
      }
      
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
      setError(err.message || 'Erro ao excluir registro');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [registroData, onDelete]);

  const handleSave = useCallback(async () => {
    try {
      setError('');
      setSuccess('');
      
      // Combinar os dois estados
      const finalData = { ...textFieldsData, ...dropdownValues };
      
      // Validação básica
      if (!finalData.protocolo || !finalData.entrada || !finalData.marca || !finalData.veiculo) {
        throw new Error('Por favor, preencha os campos obrigatórios');
      }

      // Validação de placa
      if (finalData.placa && finalData.placa.trim() !== '') {
        const placaValidation = validatePlaca(finalData.placa.trim());
        if (!placaValidation.isValid) {
          throw new Error(`Placa inválida: ${placaValidation.message}`);
        }
      }

      // Preparar dados para a API
      const dadosParaAPI = {
        ID_COLABORADOR: finalData.colaborador ? colaboradorOptions.find(c => c && c.label === finalData.colaborador)?.id : null,
        DATA_ENTRADA: finalData.entrada,
        MARCA: finalData.marca,
        VEICULO: finalData.veiculo,
        PLACA: finalData.placa,
        CHASSI: finalData.chassi,
        ANO_VEIC: finalData.anoVeiculo,
        COD_SINISTRO: finalData.codSinistro,
        NUM_BO: finalData.numeroBO,
        UF_SINISTRO: finalData.ufSinistro,
        CIDADE_SINISTRO: finalData.cidadeSinistro,
        SEGURADORA: finalData.seguradora,
        POSICAO: finalData.posicao,
        SITUACAO: finalData.situacao,
        UF: finalData.uf,
        CIDADE: finalData.cidade,
        MES: new Date(finalData.entrada).toLocaleDateString('pt-BR', { month: 'long' }),
        TIPO: finalData.tipo,
        ANO_MODELO: finalData.anoModelo,
        COR_VEICULO: finalData.corVeiculo,
        PROTOCOLO: finalData.protocolo,
        NUMERO_PROCESSO: finalData.numeroProcesso,
        // Novos campos
        COR: finalData.cor,
        RENAVAM: finalData.renavam,
        NUMERO_MOTOR: finalData.numeroMotor,
        // Campos condicionais para tipo Judicial
        COMARCA: finalData.comarca,
        NUMERO_PROCESSO_JUDICIAL: finalData.numeroProcessoJudicial,
        NOTA_FISCAL: finalData.notaFiscal,
        NUMERO_VARA: finalData.numeroVara,
        DATA_PAGAMENTO: finalData.dataPagamento,
        HONORARIO: finalData.honorario,
        NOME_BANCO: finalData.nomeBanco,
        OBSERVACOES: finalData.observacoes
      };

      // Atualizar via API
      const response = await entradaService.updateEntrada(registroData.id, dadosParaAPI);
      
      if (response.success) {
        setSuccess('Registro atualizado com sucesso!');
        
        // Chamar callback de salvamento
        if (onSave) {
          onSave(response.data);
        }

        // Fechar modal após um breve delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        // Tratar erro específico de placa duplicada
        if (response.errorType === 'placa_duplicada') {
          setPlacaSnackbar({
            open: true,
            message: response.message,
            severity: 'error'
          });
        } else {
          throw new Error(response.message || 'Erro ao atualizar registro');
        }
      }
      
    } catch (err) {
      console.error('Erro ao atualizar registro:', err);
      setError(err.message || 'Erro ao atualizar registro');
    } finally {
      // Salvamento concluído
    }
  }, [textFieldsData, dropdownValues, onSave, colaboradorOptions, registroData]);

  const handleClose = useCallback(() => {
    // Resetar todos os campos para strings vazias para evitar mudança de controlado para não controlado
    setTextFieldsData(initialState);
    setPdfModalOpen(false);
    setError('');
    setSuccess('');
    // Observações são gerenciadas via aba dedicada
    // Limpar estados de validação de placa
    setPlacaValidation({
      isValid: null,
      message: '',
      format: null
    });
    setPlacaSnackbar({
      open: false,
      message: '',
      severity: 'error'
    });
    onClose();
  }, [onClose]);

  // Estilo comum para campos de formulário
  const fieldSx = {
    '& .MuiInputLabel-root': {
      fontSize: { xs: '0.8rem', sm: '0.875rem' }
    },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.8rem', sm: '0.875rem' }
    },
    '& .MuiSelect-select': {
      fontSize: { xs: '0.8rem', sm: '0.875rem' }
    }
  };

  const renderFormContent = () => {
    return (
      <Box sx={{ width: '100%', mt: { xs: 1, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {/* Seção 1: Dados Básicos */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Dados Básicos do Veículo
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Protocolo"
              value={safeValue(textFieldsData.protocolo)}
              onChange={handleTextFieldChange('protocolo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              disabled
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data de Entrada"
              type="date"
              value={textFieldsData.entrada}
              onChange={handleTextFieldChange('entrada')}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GenericAutocomplete
              name="marca"
              label="Marca"
              value={textFieldsData.marca || ""}
              onChange={handleTextFieldChange('marca')}
              options={marcas}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Veículo"
              value={textFieldsData.veiculo}
              onChange={handleTextFieldChange('veiculo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Placa"
              placeholder="Digite a placa (ABC-1234 ou ABC1D23)..."
              value={textFieldsData.placa}
              onChange={handleTextFieldChange('placa')}
              variant="outlined"
              size="small"
              autoComplete="off"
              error={placaValidation.isValid === false}
              helperText={
                placaValidation.message || 'Aceita padrão antigo (ABC-1234) ou Mercosul (ABC1D23)'
              }
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Chassi"
              value={textFieldsData.chassi}
              onChange={handleTextFieldChange('chassi')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Cor"
              value={textFieldsData.cor}
              onChange={handleTextFieldChange('cor')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="RENAVAM"
              value={textFieldsData.renavam}
              onChange={handleTextFieldChange('renavam')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número do Motor"
              value={textFieldsData.numeroMotor}
              onChange={handleTextFieldChange('numeroMotor')}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ano do Veículo"
              type="number"
              value={textFieldsData.anoVeiculo}
              onChange={handleTextFieldChange('anoVeiculo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ano do Modelo"
              type="number"
              value={textFieldsData.anoModelo}
              onChange={handleTextFieldChange('anoModelo')}
              variant="outlined"
              size="small"
              autoComplete="off"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={fieldSx}
            />
          </Grid>

          {/* Seção 2: Informações do Sinistro */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1, 
                mt: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Informações do Sinistro
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GenericAutocomplete
              name="seguradora"
              label="Seguradora"
              value={textFieldsData.seguradora || ""}
              onChange={handleTextFieldChange('seguradora')}
              options={seguradoras}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Código do Sinistro"
              value={textFieldsData.codSinistro}
              onChange={handleTextFieldChange('codSinistro')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número B.O."
              value={textFieldsData.numeroBO}
              onChange={handleTextFieldChange('numeroBO')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GuardedSelect
              label="UF do Sinistro"
              value={dropdownValues.ufSinistro || ""}
              onChange={handleSelectChange('ufSinistro')}
              options={ufOptions || []}
              loading={dropdownsLoading}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GuardedSelect
              label="Cidade do Sinistro"
              value={dropdownValues.cidadeSinistro || ""}
              onChange={handleSelectChange('cidadeSinistro')}
              options={cidadeSinistroOptions || []}
              loading={dropdownsLoading}
              disabled={!dropdownValues.ufSinistro}
              loadingMessage="Carregando cidades..."
              emptyMessage={!dropdownValues.ufSinistro ? "Selecione primeiro uma UF" : "Nenhuma cidade disponível"}
              sx={fieldSx}
            />
          </Grid>

          {/* Seção 3: Atribuição e Localização */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 1, 
                mt: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Atribuição e Localização
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GenericAutocomplete
              name="colaborador"
              label="Colaborador"
              value={dropdownValues.colaborador || ""}
              onChange={handleSelectChange('colaborador')}
              options={colaboradoresDinamicos}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GenericAutocomplete
              name="posicao"
              label="Posição"
              value={textFieldsData.posicao || ""}
              onChange={handleTextFieldChange('posicao')}
              options={posicoes}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GuardedSelect
              label="UF (Localização)"
              value={dropdownValues.uf || ""}
              onChange={handleSelectChange('uf')}
              options={ufOptions || []}
              loading={dropdownsLoading}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GuardedSelect
              label="Cidade (Localização)"
              value={dropdownValues.cidade || ""}
              onChange={handleSelectChange('cidade')}
              options={cidadeLocalizacaoOptions || []}
              loading={dropdownsLoading}
              disabled={!dropdownValues.uf}
              loadingMessage="Carregando cidades..."
              emptyMessage={!dropdownValues.uf ? "Selecione primeiro uma UF" : "Nenhuma cidade disponível"}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número do Processo"
              value={textFieldsData.numeroProcesso}
              onChange={handleTextFieldChange('numeroProcesso')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={tipos.filter(opt => opt.value)}
              getOptionLabel={(option) => option.label || option}
              value={tipos.find(t => t.value === textFieldsData.tipo) || null}
              onChange={(event, newValue) => {
                const simulatedEvent = { target: { value: newValue ? newValue.value : '' } };
                handleTextFieldChange('tipo')(simulatedEvent);
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Tipo"
                  sx={fieldSx}
                />
              )}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={['Pendente', 'Em Andamento', 'Finalizado']}
              value={textFieldsData.situacao || 'Pendente'}
              onChange={(event, newValue) => {
                // Simula o evento do handleChange para manter a compatibilidade
                const simulatedEvent = { target: { value: newValue || 'Pendente' } };
                handleTextFieldChange('situacao')(simulatedEvent);
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Situação"
                  sx={fieldSx}
                />
              )}
              disableClearable
              sx={fieldSx}
            />
          </Grid>

          {/* Seção Condicional: Dados Judiciais */}
          {textFieldsData.tipo === 'JUDICIAL' && (
            <>
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold', 
                    mb: 1, 
                    mt: 1,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Dados Judiciais
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Comarca"
                  value={textFieldsData.comarca}
                  onChange={handleTextFieldChange('comarca')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="N° Processo"
                  value={textFieldsData.numeroProcessoJudicial}
                  onChange={handleTextFieldChange('numeroProcessoJudicial')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nota Fiscal"
                  value={textFieldsData.notaFiscal}
                  onChange={handleTextFieldChange('notaFiscal')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="N° Vara"
                  value={textFieldsData.numeroVara}
                  onChange={handleTextFieldChange('numeroVara')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="DT Pagto"
                  type="date"
                  value={textFieldsData.dataPagamento}
                  onChange={handleTextFieldChange('dataPagamento')}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Honorário"
                  value={textFieldsData.honorario}
                  onChange={handleTextFieldChange('honorario')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nome Banco"
                  value={textFieldsData.nomeBanco}
                  onChange={handleTextFieldChange('nomeBanco')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

            </>
          )}

          {/* Observações agora são gerenciadas na aba dedicada */}

        </Grid>
      </Box>
    );
  };

  return (
        <BlurredDialog
          open={open}
          onClose={handleClose}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              height: { xs: '100vh', sm: '95vh' },
              maxHeight: { xs: '100vh', sm: '95vh' },
              width: { xs: '100vw', sm: '95vw', md: '90vw', lg: '85vw', xl: '80vw' },
              maxWidth: { xs: '100vw', sm: '95vw', md: '90vw', lg: '85vw', xl: '80vw' },
              margin: { xs: 0, sm: '2.5vh auto' },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: { xs: 0, sm: 1 }
            }
          }}
        >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0,
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 }
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            lineHeight: 1.2
          }}
        >
          Editar Registro de Entrada
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
          <IconButton 
            onClick={handleOpenDeleteDialog} 
            size="small"
            color="error"
            disabled={deleting}
            title="Excluir registro"
            sx={{ 
              p: { xs: 0.5, sm: 1 },
              '& .MuiSvgIcon-root': { fontSize: { xs: '1.2rem', sm: '1.5rem' } }
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ 
              p: { xs: 0.5, sm: 1 },
              '& .MuiSvgIcon-root': { fontSize: { xs: '1.2rem', sm: '1.5rem' } }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 1, flexShrink: 0 }}>
            {success}
          </Alert>
        )}

        {dropdownsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="abas do registro">
                <Tab label="Dados do Registro" />
                <Tab label="Financeiro" />
                <Tab label="Observações" />
              </Tabs>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && renderFormContent()}
              {activeTab === 1 && registroData?.id && (
                <FinanceiroTab entradaId={registroData.id} />
              )}
              {activeTab === 1 && !registroData?.id && (
                <Box textAlign="center" p={3}>
                  <Typography variant="body2" color="text.secondary">
                    Dados da entrada não disponíveis.
                  </Typography>
                </Box>
              )}
              {activeTab === 2 && registroData?.id && (
                <ObservacoesFeed entradaId={registroData.id} />
              )}
              {activeTab === 2 && !registroData?.id && (
                <Box textAlign="center" p={3}>
                  <Typography variant="body2" color="text.secondary">
                    Dados da entrada não disponíveis para carregar observações.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        gap: { xs: 1, sm: 2 }, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        flexShrink: 0,
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        {/* Botão de anexar documentos no canto esquerdo */}
        <Button
          onClick={handleOpenPdfModal}
          variant="outlined"
          startIcon={<AttachFileIcon />}
          disabled={false}
          sx={{ 
            mr: { xs: 0, sm: 'auto' },
            mb: { xs: 1, sm: 0 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          Anexar Documentos
        </Button>

        {/* Botões de ação no canto direito */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={false}
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={false}
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            Salvar Alterações
          </Button>
        </Box>
      </DialogActions>

      <PdfModal
        open={pdfModalOpen}
        onClose={handleClosePdfModal}
        registroId={registroData?.id}
      />
      

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          <DeleteIcon color="error" />
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Tem certeza que deseja excluir este registro de entrada?
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            <strong>Protocolo:</strong> {textFieldsData.protocolo}<br/>
            <strong>Veículo:</strong> {textFieldsData.veiculo}<br/>
            <strong>Placa:</strong> {textFieldsData.placa}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              py: { xs: 1, sm: 1.5 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={deleting}
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              py: { xs: 1, sm: 1.5 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens da placa */}
      <Snackbar
        open={placaSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setPlacaSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setPlacaSnackbar(prev => ({ ...prev, open: false }))}
          severity={placaSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {placaSnackbar.message}
        </Alert>
      </Snackbar>
    </BlurredDialog>
  );
};

export default memo(EditarRegistroModal);
