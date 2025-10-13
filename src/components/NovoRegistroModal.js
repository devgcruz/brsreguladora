import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
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
  Snackbar,
  Skeleton,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
import BlurredDialog from './BlurredDialog';
import OptimizedSelect from './OptimizedSelect';
import GenericAutocomplete from './GenericAutocomplete';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import PdfModal from './PdfModal';
import FinanceiroTab from './financeiro/FinanceiroTab';
import prestadorService from '../services/prestadorService';
import entradaService from '../services/entradaService';
import useOptimizedDropdowns from '../hooks/useOptimizedDropdowns';
import useRegistroEntradaDropdowns from '../hooks/useRegistroEntradaDropdowns';
import { validatePlaca } from '../utils/placaValidator';


const NovoRegistroModal = ({ open, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [savedEntradaId, setSavedEntradaId] = useState(null);
  const [validatingPlaca, setValidatingPlaca] = useState(false);
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
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Hook otimizado para dropdowns
  const {
    ufOptions,
    cidadeSinistroOptions,
    cidadeLocalizacaoOptions,
    colaboradorOptions,
    loadingUfs,
    loadingCidadesSinistro,
    loadingCidadesLocalizacao,
    loadingColaboradores,
    initialized,
    loadUfs,
    loadColaboradores,
    loadCidadesSinistro,
    loadCidadesLocalizacao,
    initializeDropdownValues,
    clearCache
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
  
  // Carregar dados dos dropdowns quando o modal for aberto
  useEffect(() => {
    if (open) {
      // Carrega UFs e Colaboradores em paralelo
      Promise.all([
        loadUfs(),
        loadColaboradores()
      ]).then(() => {
        console.log('[NovoRegistroModal] Dados dos dropdowns carregados com sucesso');
      }).catch((error) => {
        console.error('[NovoRegistroModal] Erro ao carregar dados dos dropdowns:', error);
        setError('Erro ao carregar dados dos dropdowns');
      });
    }
  }, [open, loadUfs, loadColaboradores]);

  const [formData, setFormData] = useState({
    protocolo: '',
    entrada: '',
    marca: '',
    veiculo: '',
    placa: '',
    chassi: '',
    anoVeiculo: '',
    anoModelo: '',
    seguradora: '',
    codSinistro: '',
    numeroBO: '',
    ufSinistro: '',
    cidadeSinistro: '',
    colaborador: '',
    posicao: '',
    uf: '',
    cidade: '',
    numeroProcesso: '',
    tipo: '',
    situacao: '',
    // Novos campos
    cor: '',
    renavam: '',
    numeroMotor: '',
    // Campos condicionais para tipo Judicial
    comarca: '',
    numeroProcessoJudicial: '',
    notaFiscal: '',
    numeroVara: '',
    dataPagamento: '',
    honorario: '',
    nomeBanco: '',
    observacoes: ''
  });

  // Observações agora são gerenciadas via textarea simples

  // Opções estáticas (mantendo apenas as que não foram migradas para dados dinâmicos)

  // Handlers otimizados para mudança de UF
  const handleUfSinistroChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      ufSinistro: value,
      cidadeSinistro: ''
    }));
    
    if (value) {
      const ufSelecionada = ufOptions.find(uf => uf.value === value);
      if (ufSelecionada) {
        loadCidadesSinistro(ufSelecionada.value);
      }
    }
  }, [ufOptions, loadCidadesSinistro]);

  const handleUfLocalizacaoChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      uf: value,
      cidade: ''
    }));
    
    if (value) {
      const ufSelecionada = ufOptions.find(uf => uf.value === value);
      if (ufSelecionada) {
        loadCidadesLocalizacao(ufSelecionada.value);
      }
    }
  }, [ufOptions, loadCidadesLocalizacao]);

  // Controlar estado de prontidão do formulário
  useEffect(() => {
    if (open) {
      setIsReady(false); // Reseta o estado de prontidão ao abrir
      // Aguarda um pequeno delay para garantir que os dados foram carregados
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [open]);

  const tipos = useMemo(() => ['JUDICIAL', 'ADM'], []);

  const handleInputChange = useCallback((field) => (eventOrValue) => {
    const value = (eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue)
      ? eventOrValue.target.value
      : eventOrValue;

    // Usar handlers específicos para UFs
    if (field === 'ufSinistro') {
      handleUfSinistroChange(value);
    } else if (field === 'uf') {
      handleUfLocalizacaoChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, [handleUfSinistroChange, handleUfLocalizacaoChange]);

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

  // Função para validar placa em tempo real (formato + existência)
  const validatePlacaComplete = useCallback(async (placa) => {
    if (!placa || placa.trim() === '') {
      return;
    }

    // Primeiro valida o formato
    const formatValidation = validatePlacaFormat(placa);
    if (!formatValidation) {
      return;
    }

    setValidatingPlaca(true);

    try {
      const response = await entradaService.checkPlacaExists(placa.trim());
      
      if (response.exists) {
        setPlacaSnackbar({
          open: true,
          message: 'Esta placa já está cadastrada no sistema',
          severity: 'error'
        });
      } else {
        // Placa válida e não existe no sistema
        setPlacaValidation(prev => ({
          ...prev,
          message: `${prev.message} - Disponível`
        }));
      }
    } catch (error) {
      console.error('Erro ao validar placa:', error);
      setPlacaSnackbar({
        open: true,
        message: 'Erro ao verificar placa. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setValidatingPlaca(false);
    }
  }, [validatePlacaFormat]);

  // Handler para o campo de placa
  const handlePlacaChange = useCallback((event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      placa: value
    }));
    
    // Validar formato em tempo real
    validatePlacaFormat(value);
  }, [validatePlacaFormat]);

  // Handler para quando o usuário sair do campo de placa
  const handlePlacaBlur = useCallback((event) => {
    const placa = event.target.value.trim();
    if (placa) {
      validatePlacaComplete(placa);
    }
  }, [validatePlacaComplete]);

  // Handler para fechar o Snackbar da placa
  const handleClosePlacaSnackbar = useCallback(() => {
    setPlacaSnackbar(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Funções de observações removidas - agora apenas textarea simples

  const handleOpenPdfModal = useCallback(() => {
    setPdfModalOpen(true);
  }, []);

  const handleClosePdfModal = useCallback(() => {
    setPdfModalOpen(false);
  }, []);


  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validação detalhada
      const camposObrigatorios = [];
      
      // Verificar se os campos obrigatórios estão preenchidos
      // Protocolo não é mais obrigatório - será preenchido automaticamente
      
      if (!formData.entrada || formData.entrada.toString().trim() === '') {
        camposObrigatorios.push('Data de Entrada');
      }
      
      if (!formData.marca || formData.marca.toString().trim() === '') {
        camposObrigatorios.push('Marca');
      }
      
      if (!formData.veiculo || formData.veiculo.toString().trim() === '') {
        camposObrigatorios.push('Veículo');
      }
      
      if (camposObrigatorios.length > 0) {
        throw new Error(`Por favor, preencha os seguintes campos obrigatórios: ${camposObrigatorios.join(', ')}`);
      }

      // Validação de placa
      if (formData.placa && formData.placa.trim() !== '') {
        const placaValidation = validatePlaca(formData.placa.trim());
        if (!placaValidation.isValid) {
          throw new Error(`Placa inválida: ${placaValidation.message}`);
        }
      }

      // Preparar dados para a API
      const dadosParaAPI = {
        ID_COLABORADOR: formData.colaborador ? colaboradorOptions.find(c => c && c.label === formData.colaborador)?.id : null,
        DATA_ENTRADA: formData.entrada,
        MARCA: formData.marca,
        VEICULO: formData.veiculo,
        PLACA: formData.placa,
        CHASSI: formData.chassi,
        ANO_VEIC: formData.anoVeiculo,
        COD_SINISTRO: formData.codSinistro,
        NUM_BO: formData.numeroBO,
        UF_SINISTRO: formData.ufSinistro,
        CIDADE_SINISTRO: formData.cidadeSinistro,
        SEGURADORA: formData.seguradora,
        POSICAO: formData.posicao,
        SITUACAO: formData.situacao,
        UF: formData.uf,
        CIDADE: formData.cidade,
        MES: new Date(formData.entrada).toLocaleDateString('pt-BR', { month: 'long' }),
        TIPO: formData.tipo,
        ANO_MODELO: formData.anoModelo,
        COR_VEICULO: formData.corVeiculo,
        PROTOCOLO: formData.protocolo,
        NUMERO_PROCESSO: formData.numeroProcesso,
        // Novos campos
        COR: formData.cor,
        RENAVAM: formData.renavam,
        NUMERO_MOTOR: formData.numeroMotor,
        // Campos condicionais para tipo Judicial
        COMARCA: formData.comarca,
        NUMERO_PROCESSO_JUDICIAL: formData.numeroProcessoJudicial,
        NOTA_FISCAL: formData.notaFiscal,
        NUMERO_VARA: formData.numeroVara,
        DATA_PAGAMENTO: formData.dataPagamento,
        HONORARIO: formData.honorario,
        NOME_BANCO: formData.nomeBanco,
        OBSERVACOES: formData.observacoes
      };


      // Salvar via API
      const response = await entradaService.createEntrada(dadosParaAPI);
      
      if (response.success) {
        setSuccess('Registro salvo com sucesso!');
        
        // Armazenar ID da entrada criada para permitir upload de PDFs
        const entradaId = response.data.Id_Entrada || response.data.id;
        setSavedEntradaId(entradaId);
        
        // Chamar callback de salvamento
        if (onSave) {
          onSave(response.data);
        }

        // Fechar modal após um breve delay
      setTimeout(() => {
        onClose();
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
          throw new Error(response.message || 'Erro ao salvar registro');
        }
      }
      
    } catch (err) {
      setError(err.message || 'Erro ao salvar registro');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, colaboradorOptions, onClose]);

  const handleClose = useCallback(() => {
    // Resetar todos os campos para strings vazias para evitar mudança de controlado para não controlado
    setFormData({
      protocolo: '',
      entrada: '',
      marca: '',
      veiculo: '',
      placa: '',
      chassi: '',
      anoVeiculo: '',
      anoModelo: '',
      seguradora: '',
      codSinistro: '',
      numeroBO: '',
      ufSinistro: '',
      cidadeSinistro: '',
      colaborador: '',
      posicao: '',
      uf: '',
      cidade: '',
      numeroProcesso: '',
      tipo: '',
      situacao: '',
      // Novos campos
      cor: '',
      renavam: '',
      numeroMotor: '',
      // Campos condicionais para tipo Judicial
      comarca: '',
      numeroProcessoJudicial: '',
      notaFiscal: '',
      numeroVara: '',
      dataPagamento: '',
      honorario: '',
      nomeBanco: '',
      observacoes: ''
    });
    setPdfModalOpen(false);
    setSavedEntradaId(null);
    setError('');
    setSuccess('');
    // Observações agora são gerenciadas via textarea simples
    setValidatingPlaca(false);
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
    // Limpar cache dos dropdowns
    clearCache();
    onClose();
  }, [onClose, clearCache]);

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
                  placeholder="Será gerado automaticamente (ID do registro)"
                  value={formData.protocolo}
                  onChange={handleInputChange('protocolo')}
                  variant="outlined"
                  size="small"
                  disabled
                  sx={fieldSx}
                />
              </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data de Entrada"
              type="date"
              value={formData.entrada}
              onChange={handleInputChange('entrada')}
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
              value={formData.marca || ""}
              onChange={handleInputChange('marca')}
              options={marcas}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Veículo"
              value={formData.veiculo}
              onChange={handleInputChange('veiculo')}
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
              value={formData.placa}
              onChange={handlePlacaChange}
              onBlur={handlePlacaBlur}
              variant="outlined"
              size="small"
              autoComplete="off"
              error={placaValidation.isValid === false}
              helperText={
                validatingPlaca 
                  ? 'Verificando placa...' 
                  : placaValidation.message || 'Aceita padrão antigo (ABC-1234) ou Mercosul (ABC1D23)'
              }
              InputProps={{
                endAdornment: validatingPlaca ? (
                  <CircularProgress size={16} />
                ) : null
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Chassi"
              value={formData.chassi}
              onChange={handleInputChange('chassi')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Cor"
              value={formData.cor}
              onChange={handleInputChange('cor')}
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
              value={formData.renavam}
              onChange={handleInputChange('renavam')}
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
              value={formData.numeroMotor}
              onChange={handleInputChange('numeroMotor')}
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
              value={formData.anoVeiculo}
              onChange={handleInputChange('anoVeiculo')}
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
              value={formData.anoModelo}
              onChange={handleInputChange('anoModelo')}
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
              value={formData.seguradora || ""}
              onChange={handleInputChange('seguradora')}
              options={seguradoras}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Código do Sinistro"
              value={formData.codSinistro}
              onChange={handleInputChange('codSinistro')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número B.O."
              value={formData.numeroBO}
              onChange={handleInputChange('numeroBO')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="UF do Sinistro"
              value={formData.ufSinistro || ""}
              onChange={handleUfSinistroChange}
              options={ufOptions || []}
              loading={loadingUfs}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              searchable={ufOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Cidade do Sinistro"
              value={formData.cidadeSinistro || ""}
              onChange={handleInputChange('cidadeSinistro')}
              options={cidadeSinistroOptions || []}
              loading={loadingCidadesSinistro}
              disabled={!formData.ufSinistro}
              loadingMessage="Carregando cidades..."
              emptyMessage={!formData.ufSinistro ? "Selecione primeiro uma UF" : "Nenhuma cidade disponível"}
              searchable={cidadeSinistroOptions.length > 10}
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
              value={formData.colaborador || ""}
              onChange={handleInputChange('colaborador')}
              options={colaboradoresDinamicos}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GenericAutocomplete
              name="posicao"
              label="Posição"
              value={formData.posicao || ""}
              onChange={handleInputChange('posicao')}
              options={posicoes}
              loading={loadingDropdowns}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="UF (Localização)"
              value={formData.uf || ""}
              onChange={handleUfLocalizacaoChange}
              options={ufOptions || []}
              loading={loadingUfs}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              searchable={ufOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              label="Cidade (Localização)"
              value={formData.cidade || ""}
              onChange={handleInputChange('cidade')}
              options={cidadeLocalizacaoOptions || []}
              loading={loadingCidadesLocalizacao}
              disabled={!formData.uf}
              loadingMessage="Carregando cidades..."
              emptyMessage={!formData.uf ? "Selecione primeiro uma UF" : "Nenhuma cidade disponível"}
              searchable={cidadeLocalizacaoOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número do Processo"
              value={formData.numeroProcesso}
              onChange={handleInputChange('numeroProcesso')}
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={tipos.filter(tipo => tipo)}
              value={formData.tipo || ""}
              onChange={(event, newValue) => {
                const simulatedEvent = { target: { value: newValue || '' } };
                handleInputChange('tipo')(simulatedEvent);
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

          {/* Seção Condicional: Dados Judiciais */}
          {formData.tipo === 'JUDICIAL' && (
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
                  value={formData.comarca}
                  onChange={handleInputChange('comarca')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="N° Processo"
                  value={formData.numeroProcessoJudicial}
                  onChange={handleInputChange('numeroProcessoJudicial')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nota Fiscal"
                  value={formData.notaFiscal}
                  onChange={handleInputChange('notaFiscal')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="N° Vara"
                  value={formData.numeroVara}
                  onChange={handleInputChange('numeroVara')}
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
                  value={formData.dataPagamento}
                  onChange={handleInputChange('dataPagamento')}
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
                  value={formData.honorario}
                  onChange={handleInputChange('honorario')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nome Banco"
                  value={formData.nomeBanco}
                  onChange={handleInputChange('nomeBanco')}
                  variant="outlined"
                  size="small"
                  sx={fieldSx}
                />
              </Grid>

            </>
          )}

          {/* Seção 4: Observação Inicial */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observação Inicial"
              multiline
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Digite uma observação inicial sobre este registro..."
              variant="outlined"
              size="small"
              sx={fieldSx}
            />
          </Grid>

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
        py: { xs: 1.5, sm: 2 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
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
          Novo Registro de Entrada
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 }, 
          alignItems: 'center',
          flexDirection: { xs: 'row', sm: 'row' },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
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

        {isReady ? (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="abas do registro">
                <Tab label="Dados do Registro" />
                <Tab label="Financeiro" />
              </Tabs>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && renderFormContent()}
              {activeTab === 1 && savedEntradaId && (
                <FinanceiroTab entradaId={savedEntradaId} />
              )}
              {activeTab === 1 && !savedEntradaId && (
                <Box textAlign="center" p={3}>
                  <Typography variant="body2" color="text.secondary">
                    Salve o registro primeiro para gerenciar os lançamentos financeiros.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" minHeight="400px">
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Carregando formulário...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Aguarde enquanto os dados são carregados
              </Typography>
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
        justifyContent: { xs: 'stretch', sm: 'space-between' },
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        {/* Botão de anexar documentos no canto esquerdo */}
        <Button
          onClick={handleOpenPdfModal}
          variant="outlined"
          startIcon={<AttachFileIcon />}
          disabled={loading || !savedEntradaId}
          sx={{ 
            mr: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {!savedEntradaId ? 'Salve primeiro o registro' : 'Anexar Documentos'}
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
            disabled={loading}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Cancelar
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </Button>
        </Box>
      </DialogActions>

      <PdfModal
        open={pdfModalOpen}
        onClose={handleClosePdfModal}
        registroId={savedEntradaId}
      />

      {/* Snackbar para mensagens da placa */}
      <Snackbar
        open={placaSnackbar.open}
        autoHideDuration={6000}
        onClose={handleClosePlacaSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClosePlacaSnackbar} 
          severity={placaSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {placaSnackbar.message}
        </Alert>
      </Snackbar>
      
    </BlurredDialog>
  );
};

export default memo(NovoRegistroModal);
