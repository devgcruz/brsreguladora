import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material';
import OptimizedSelect from './OptimizedSelect';

/**
 * Componente de teste que simula carregamento de dados de API
 * Demonstra como as correções previnem erros de "out-of-range value"
 */
const ApiDataTestExample = () => {
  const [formData, setFormData] = useState({
    marca: '',
    seguradora: '',
    status: '',
    cargo: '',
    uf: '',
    cidade: ''
  });

  // Estados de carregamento simulados
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingSeguradoras, setLoadingSeguradoras] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [loadingUfs, setLoadingUfs] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Estados de dados
  const [marcas, setMarcas] = useState([]);
  const [seguradoras, setSeguradoras] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [ufs, setUfs] = useState([]);
  const [cidades, setCidades] = useState([]);

  // Estado de inicialização
  const [initialized, setInitialized] = useState(false);

  // Simular carregamento de dados de API
  const loadMarcas = async () => {
    setLoadingMarcas(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMarcas(['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen']);
    setLoadingMarcas(false);
  };

  const loadSeguradoras = async () => {
    setLoadingSeguradoras(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSeguradoras(['Porto Seguro', 'SulAmérica', 'Bradesco Seguros', 'Itaú Seguros']);
    setLoadingSeguradoras(false);
  };

  const loadStatus = async () => {
    setLoadingStatus(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setStatusOptions(['PENDENTE', 'EM_ANALISE', 'FINALIZADO', 'CANCELADO']);
    setLoadingStatus(false);
  };

  const loadCargos = async () => {
    setLoadingCargos(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    setCargos(['Administrador', 'Analista', 'Operador', 'Consultor']);
    setLoadingCargos(false);
  };

  const loadUfs = async () => {
    setLoadingUfs(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setUfs(['SP', 'RJ', 'MG', 'RS', 'PR']);
    setLoadingUfs(false);
  };

  const loadCidades = async () => {
    setLoadingCidades(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCidades(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre']);
    setLoadingCidades(false);
  };

  // Inicializar todos os dados
  const initializeData = async () => {
    if (initialized) return;
    
    try {
      await Promise.all([
        loadMarcas(),
        loadSeguradoras(),
        loadStatus(),
        loadCargos(),
        loadUfs(),
        loadCidades()
      ]);
      
      setInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestInvalidValues = () => {
    // Simular valores inválidos vindos de uma API
    setFormData({
      marca: 'MarcaInexistente',
      seguradora: 'SeguradoraInexistente',
      status: 'STATUS_INEXISTENTE',
      cargo: 'CargoInexistente',
      uf: 'UF_INEXISTENTE',
      cidade: 'CidadeInexistente'
    });
  };

  const handleTestValidValues = () => {
    // Simular valores válidos
    setFormData({
      marca: 'Toyota',
      seguradora: 'Porto Seguro',
      status: 'PENDENTE',
      cargo: 'Administrador',
      uf: 'SP',
      cidade: 'São Paulo'
    });
  };

  const handleTestMixedValues = () => {
    // Simular mix de valores válidos e inválidos
    setFormData({
      marca: 'Ford', // Válido
      seguradora: 'SeguradoraInexistente', // Inválido
      status: 'FINALIZADO', // Válido
      cargo: 'CargoInexistente', // Inválido
      uf: 'RJ', // Válido
      cidade: 'CidadeInexistente' // Inválido
    });
  };

  if (!initialized) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Carregando Dados de API...
        </Typography>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rounded" width="100%" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teste de Correção com Dados de API
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        ✅ Todos os dados foram carregados com sucesso! Os OptimizedSelect agora têm proteção contra valores inválidos.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <OptimizedSelect
            label="Marca"
            value={formData.marca}
            onChange={handleInputChange('marca')}
            options={marcas.map(marca => ({ value: marca, label: marca }))}
            loading={loadingMarcas}
            loadingMessage="Carregando marcas..."
            emptyMessage="Nenhuma marca disponível"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OptimizedSelect
            label="Seguradora"
            value={formData.seguradora}
            onChange={handleInputChange('seguradora')}
            options={seguradoras.map(seguradora => ({ value: seguradora, label: seguradora }))}
            loading={loadingSeguradoras}
            loadingMessage="Carregando seguradoras..."
            emptyMessage="Nenhuma seguradora disponível"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OptimizedSelect
            label="Status"
            value={formData.status}
            onChange={handleInputChange('status')}
            options={statusOptions.map(status => ({ value: status, label: status }))}
            loading={loadingStatus}
            loadingMessage="Carregando status..."
            emptyMessage="Nenhum status disponível"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OptimizedSelect
            label="Cargo"
            value={formData.cargo}
            onChange={handleInputChange('cargo')}
            options={cargos.map(cargo => ({ value: cargo, label: cargo }))}
            loading={loadingCargos}
            loadingMessage="Carregando cargos..."
            emptyMessage="Nenhum cargo disponível"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OptimizedSelect
            label="UF"
            value={formData.uf}
            onChange={handleInputChange('uf')}
            options={ufs.map(uf => ({ value: uf, label: uf }))}
            loading={loadingUfs}
            loadingMessage="Carregando UFs..."
            emptyMessage="Nenhuma UF disponível"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OptimizedSelect
            label="Cidade"
            value={formData.cidade}
            onChange={handleInputChange('cidade')}
            options={cidades.map(cidade => ({ value: cidade, label: cidade }))}
            loading={loadingCidades}
            loadingMessage="Carregando cidades..."
            emptyMessage="Nenhuma cidade disponível"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          color="error"
          onClick={handleTestInvalidValues}
        >
          Testar Valores Inválidos
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          onClick={handleTestValidValues}
        >
          Testar Valores Válidos
        </Button>

        <Button 
          variant="contained" 
          color="warning"
          onClick={handleTestMixedValues}
        >
          Testar Valores Mistos
        </Button>
      </Box>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Estado Atual do Formulário:
        </Typography>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Paper>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Como funciona a proteção:</strong><br/>
          1. Valores válidos são mantidos normalmente<br/>
          2. Valores inválidos são automaticamente corrigidos para string vazia<br/>
          3. Não há mais erros de "out-of-range value"<br/>
          4. UX mantida com dropdowns funcionando corretamente
        </Typography>
      </Alert>
    </Box>
  );
};

export default ApiDataTestExample;
