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
} from '@mui/material';
import BlurredDialog from './BlurredDialog';
import OptimizedSelect from './OptimizedSelect';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PdfModal from './PdfModal';
import prestadorService from '../services/prestadorService';
import entradaService from '../services/entradaService';
import useOptimizedDropdowns from '../hooks/useOptimizedDropdowns';

const EditarRegistroModal = ({ open, onClose, onSave, onDelete, registroData }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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
    initializeData,
    clearCache
  } = useOptimizedDropdowns();

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

  // Estado para observações em formato de posts
  const [observacoes, setObservacoes] = useState([]);
  const [novaObservacao, setNovaObservacao] = useState('');
  
  // Estados para validação de placa
  const [placaSnackbar, setPlacaSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Opções para campos de seleção - memoizadas para performance
  const marcas = useMemo(() => ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Hyundai', 'Nissan', 'BMW', 'Mercedes-Benz'], []);
  const seguradoras = useMemo(() => [
    'Porto Seguro', 'SulAmérica', 'Bradesco Seguros', 'Itaú Seguros', 'Allianz', 'Zurich', 'HDI Seguros', 'Liberty Seguros',
    'Azul Seguros' // Adicionar seguradora que está no banco
  ], []);
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

  // Carregar dados iniciais quando o modal abrir
  useEffect(() => {
    if (open) {
      // Inicializar dados de forma otimizada
      initializeData().catch(error => {
        console.error('Erro ao inicializar dados:', error);
        setError('Erro ao carregar dados iniciais');
      });
    }
  }, [open, initializeData]);


  const posicoes = useMemo(() => [
    'DOCTOS RECEBIDO',
    'AGUARDA DOCUMENTOS',
    'DOCTOS ENVIADO REP',
    'VEÍCULO LIBERADO',
    'VEÍCULO REMOVIDO',
    'DOCTOS RECEBIDO REP',
    'FINALIZADO',
    'CANCELADO',
    'Pátio A', // Adicionar posição que está no banco
    'Pátio B'
  ], []);
  const tipos = useMemo(() => [
    'JUDICIAL', 
    'ADM',
    'Danos a Terceiros' // Adicionar tipo que está no banco
  ], []);

  // Função para garantir que valores sejam strings válidas
  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const safeValue = (value) => {
    if (value === null || value === undefined) return '';
    return value;
  };

  // ESTRATÉGIA FINAL: HIDRATAÇÃO GRANULAR E ESTADO INICIAL SEGURO

  // 1. EFEITO DE INICIALIZAÇÃO SEGURA
  useEffect(() => {
    if (open && registroData) {
      // Dispara o carregamento das opções primárias
      loadUfs();
      loadColaboradores();

      // Popula o formData APENAS com campos que não são selects assíncronos
      setFormData({
        protocolo: String(registroData.id || ''),
        entrada: registroData.data_entrada || '',
        marca: String(registroData.marca || ''), // Select estático, seguro para definir
        veiculo: String(registroData.veiculo || ''),
        placa: String(registroData.placa || ''),
        chassi: String(registroData.chassi || ''),
        anoVeiculo: String(registroData.ano_veiculo || ''),
        anoModelo: String(registroData.ano_modelo || ''),
        seguradora: String(registroData.seguradora || ''),
        codSinistro: String(registroData.cod_sinistro || ''),
        numeroBO: String(registroData.numero_bo || ''),
        posicao: String(registroData.posicao || ''), // Select estático, seguro
        numeroProcesso: String(registroData.numero_processo || ''),
        tipo: String(registroData.tipo || ''), // Select estático, seguro
        situacao: String(registroData.situacao || ''),
        // Novos campos
        cor: String(registroData.cor || ''),
        renavam: String(registroData.renavam || ''),
        numeroMotor: String(registroData.numero_motor || ''),
        // Campos condicionais para tipo Judicial
        comarca: String(registroData.comarca || ''),
        numeroProcessoJudicial: String(registroData.numero_processo_judicial || ''),
        notaFiscal: String(registroData.nota_fiscal || ''),
        numeroVara: String(registroData.numero_vara || ''),
        dataPagamento: String(registroData.data_pagamento || ''),
        honorario: String(registroData.honorario || ''),
        nomeBanco: String(registroData.nome_banco || ''),
        observacoes: String(registroData.observacoes || ''),

        // IMPORTANTE: Deixe os campos de selects assíncronos VAZIOS
        colaborador: '',
        ufSinistro: '',
        cidadeSinistro: '',
        uf: '',
        cidade: ''
      });

      // Carregar observações existentes
      if (registroData.observacoes_posts && Array.isArray(registroData.observacoes_posts)) {
        setObservacoes(registroData.observacoes_posts);
      } else {
        setObservacoes([]);
      }
    }
  }, [open, registroData, loadUfs, loadColaboradores]);

  // 2. EFEITOS DE HIDRATAÇÃO GRANULAR

  // Hidrata 'colaborador'
  useEffect(() => {
    if (registroData?.colaborador && colaboradorOptions.length > 0) {
      const nomeColaborador = registroData.colaborador.nome || registroData.colaborador.NOME;
      if (nomeColaborador) {
        setFormData(prev => ({ ...prev, colaborador: nomeColaborador }));
      }
    }
  }, [registroData, colaboradorOptions]);

  // Hidrata 'ufSinistro' e dispara carregamento de cidades
  useEffect(() => {
    if (registroData?.uf_sinistro && ufOptions.length > 0) {
      setFormData(prev => ({ ...prev, ufSinistro: registroData.uf_sinistro }));
      loadCidadesSinistro(registroData.uf_sinistro);
    }
  }, [registroData, ufOptions, loadCidadesSinistro]);

  // Hidrata 'cidadeSinistro'
  useEffect(() => {
    if (registroData?.cidade_sinistro && cidadeSinistroOptions.length > 0) {
      setFormData(prev => ({ ...prev, cidadeSinistro: registroData.cidade_sinistro }));
    }
  }, [registroData, cidadeSinistroOptions]);

  // Hidrata 'uf' (localização) e dispara carregamento de cidades
  useEffect(() => {
    if (registroData?.uf && ufOptions.length > 0) {
      setFormData(prev => ({ ...prev, uf: registroData.uf }));
      loadCidadesLocalizacao(registroData.uf);
    }
  }, [registroData, ufOptions, loadCidadesLocalizacao]);

  // Hidrata 'cidade' (localização)
  useEffect(() => {
    if (registroData?.cidade && cidadeLocalizacaoOptions.length > 0) {
      setFormData(prev => ({ ...prev, cidade: registroData.cidade }));
    }
  }, [registroData, cidadeLocalizacaoOptions]);


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

  // Função para adicionar nova observação
  const adicionarObservacao = useCallback(() => {
    if (novaObservacao.trim()) {
      const novaObs = {
        id: String(Date.now()),
        texto: novaObservacao.trim(),
        autor: 'Usuário Atual', // Em produção, pegar do contexto de autenticação
        data: new Date().toLocaleString('pt-BR'),
        timestamp: new Date().toISOString()
      };
      
      setObservacoes(prev => {
        const novasObservacoes = [novaObs, ...prev];
        return novasObservacoes;
      });
      setNovaObservacao('');
    }
  }, [novaObservacao]);

  // Função para remover observação
  const removerObservacao = useCallback((id) => {
    setObservacoes(prev => prev.filter(obs => obs.id !== id));
  }, []);

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
      
      // Validação básica
      if (!formData.protocolo || !formData.entrada || !formData.marca || !formData.veiculo) {
        throw new Error('Por favor, preencha os campos obrigatórios');
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
        OBSERVACOES: formData.observacoes,
        // Observações em formato de posts
        OBSERVACOES_POSTS: observacoes
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
  }, [formData, onSave, colaboradorOptions, registroData, observacoes]);

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
      observacoes: '',
      // Limpar campos auxiliares
      _originalUfSinistro: '',
      _originalCidadeSinistro: '',
      _originalUf: '',
      _originalCidade: ''
    });
    setPdfModalOpen(false);
    setError('');
    setSuccess('');
    setObservacoes([]);
    setNovaObservacao('');
    // Limpar cache dos dropdowns
    clearCache();
    // Limpar estados de validação de placa
    setPlacaSnackbar({
      open: false,
      message: '',
      severity: 'error'
    });
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
              value={safeValue(formData.protocolo)}
              onChange={handleInputChange('protocolo')}
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
            <OptimizedSelect
                label="Marca"
              value={formData.marca || ""}
                onChange={handleInputChange('marca')}
              options={marcas.map(marca => ({ value: marca, label: marca })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
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
              placeholder="Digite a placa..."
              value={formData.placa}
              onChange={handleInputChange('placa')}
              variant="outlined"
              size="small"
              autoComplete="off"
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
            <OptimizedSelect
                label="Seguradora"
              value={formData.seguradora || ""}
                onChange={handleInputChange('seguradora')}
              options={seguradoras.map(seguradora => ({ value: seguradora, label: seguradora })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
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
              key={`uf-sinistro-${ufOptions.length}`}
              label="UF do Sinistro"
              value={formData.ufSinistro || ""}
              onChange={handleUfSinistroChange}
              options={ufOptions || []}
              loading={loadingUfs}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              searchable={ufOptions.length > 10}
              disabled={false}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              key={`cidade-sinistro-${cidadeSinistroOptions.length}`}
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
            <OptimizedSelect
              key={`colaborador-${colaboradorOptions.length}`}
              label="Colaborador"
              value={formData.colaborador || ""}
              onChange={handleInputChange('colaborador')}
              options={colaboradorOptions || []}
              loading={loadingColaboradores}
              loadingMessage="Carregando colaboradores..."
              emptyMessage="Nenhum colaborador encontrado"
              searchable={colaboradorOptions.length > 10}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
                label="Posição"
              value={formData.posicao || ""}
                onChange={handleInputChange('posicao')}
              options={posicoes.map(posicao => ({ value: posicao, label: posicao })).filter(opt => opt.value && opt.label)}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              key={`uf-localizacao-${ufOptions.length}`}
              label="UF (Localização)"
              value={formData.uf || ""}
              onChange={handleUfLocalizacaoChange}
              options={ufOptions || []}
              loading={loadingUfs}
              loadingMessage="Carregando UFs..."
              emptyMessage="Nenhuma UF disponível"
              searchable={ufOptions.length > 10}
              disabled={false}
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <OptimizedSelect
              key={`cidade-localizacao-${cidadeLocalizacaoOptions.length}`}
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
            <OptimizedSelect
              label="Tipo"
              value={formData.tipo || ""}
              onChange={handleInputChange('tipo')}
              options={tipos.map(tipo => ({ value: tipo, label: tipo })).filter(opt => opt.value && opt.label)}
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

          {/* Seção 4: Observações em formato de Posts */}
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
              Observações
            </Typography>
          </Grid>

          {/* Campo para adicionar nova observação */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 1 }, 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'flex-end' }
            }}>
              <TextField
                fullWidth
                label="Nova observação"
                multiline
                rows={2}
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Digite uma nova observação..."
                variant="outlined"
                size="small"
                sx={fieldSx}
              />
              <Button
                variant="contained"
                onClick={adicionarObservacao}
                disabled={!novaObservacao.trim()}
                sx={{ 
                  minWidth: 'auto', 
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap'
                }}
              >
                Postar
              </Button>
            </Box>
          </Grid>

          {/* Lista de observações em formato de posts */}
          {observacoes.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ 
                maxHeight: { xs: 200, sm: 300 }, 
                overflow: 'auto', 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: { xs: 0.5, sm: 1 },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}>
                {observacoes.map((obs) => (
                  <Box
                    key={obs.id}
                    sx={{
                      p: { xs: 1, sm: 2 },
                      mb: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 0.5, sm: 0 }
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {obs.autor}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        flexDirection: { xs: 'row', sm: 'row' }
                      }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {obs.data}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removerObservacao(obs.id)}
                          sx={{ 
                            minWidth: 'auto', 
                            p: { xs: 0.25, sm: 0.5 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          ×
                        </Button>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {obs.texto}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}

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

        {renderFormContent()}
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
            <strong>Protocolo:</strong> {formData.protocolo}<br/>
            <strong>Veículo:</strong> {formData.veiculo}<br/>
            <strong>Placa:</strong> {formData.placa}
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
