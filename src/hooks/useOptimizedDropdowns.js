import { useState, useCallback, useMemo, useRef } from 'react';
import prestadorService from '../services/prestadorService';
import optimizedUfCidadeService from '../services/optimizedUfCidadeService';
import cacheService from '../services/cacheService';

// Função debounce personalizada
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Hook personalizado para gerenciar dropdowns de forma otimizada
export const useOptimizedDropdowns = () => {
  // Estados das opções
  const [ufs, setUfs] = useState([]);
  const [cidadesSinistro, setCidadesSinistro] = useState([]);
  const [cidadesLocalizacao, setCidadesLocalizacao] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);

  // === INÍCIO DA MUDANÇA: ESTADOS DOS VALORES SELECIONADOS ===
  const [values, setValues] = useState({
    ufSinistro: '',
    cidadeSinistro: '',
    uf: '',
    cidade: '',
    colaborador: '',
  });
  // === FIM DA MUDANÇA ===

  // Cache para evitar chamadas desnecessárias
  const cacheRef = useRef({
    ufs: null,
    cidades: {},
    colaboradores: null
  });

  // Função para carregar UFs (dados fixos do JSON)
  const loadUfs = useCallback(async () => {
    try {
      console.log('[useOptimizedDropdowns] Carregando UFs...');
      const response = optimizedUfCidadeService.getUfs();
      
      if (response.success && Array.isArray(response.data)) {
        setUfs(response.data);
        cacheRef.current.ufs = response.data;
        console.log('[useOptimizedDropdowns] UFs carregadas:', response.data.length);
      } else {
        setUfs([]);
      }
    } catch (error) {
      console.error('Erro ao carregar UFs:', error);
      setUfs([]);
    }
  }, []);

  // Função para carregar colaboradores (com cache)
  const loadColaboradores = useCallback(async () => {
    // Verificar cache primeiro
    if (cacheService.hasValidColaboradores()) {
      const cachedColaboradores = cacheService.getColaboradores();
      if (cachedColaboradores && cachedColaboradores.length > 0) {
        setColaboradores(cachedColaboradores);
        cacheRef.current.colaboradores = cachedColaboradores;
        console.log('[useOptimizedDropdowns] Colaboradores carregados do cache:', cachedColaboradores.length);
        return;
      }
    }

    try {
      console.log('[useOptimizedDropdowns] Carregando colaboradores da API...');
      const response = await prestadorService.getPrestadores();
      
      if (response.success && Array.isArray(response.data)) {
        const colaboradoresValidos = response.data.filter(item => 
          item && typeof item === 'object' && (item.nome || item.NOME)
        );
        
        setColaboradores(colaboradoresValidos);
        cacheRef.current.colaboradores = colaboradoresValidos;
        
        // Salvar no cache
        cacheService.setColaboradores(colaboradoresValidos);
        console.log('[useOptimizedDropdowns] Colaboradores carregados da API:', colaboradoresValidos.length);
      } else {
        setColaboradores([]);
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      setColaboradores([]);
    }
  }, []);

  // Função para carregar cidades do sinistro (com cache otimizado)
  const loadCidadesSinistro = useCallback(async (ufId) => {
    if (!ufId) {
      setCidadesSinistro([]);
      return;
    }

    try {
      console.log(`[useOptimizedDropdowns] Carregando cidades do sinistro para UF: ${ufId}`);
      const response = await optimizedUfCidadeService.getCidadesByUf(ufId);
      
      if (response.success && Array.isArray(response.data)) {
        const validData = response.data.filter(item => item && typeof item === 'object' && (item.value || item.id));
        setCidadesSinistro(validData);
        console.log(`[useOptimizedDropdowns] Cidades do sinistro carregadas: ${validData.length}`);
      } else {
        setCidadesSinistro([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades do sinistro:', error);
      setCidadesSinistro([]);
    }
  }, []);

  // Função para carregar cidades de localização (com cache otimizado)
  const loadCidadesLocalizacao = useCallback(async (ufId) => {
    if (!ufId) {
      setCidadesLocalizacao([]);
      return;
    }

    try {
      console.log(`[useOptimizedDropdowns] Carregando cidades de localização para UF: ${ufId}`);
      const response = await optimizedUfCidadeService.getCidadesByUf(ufId);
      
      if (response.success && Array.isArray(response.data)) {
        const validData = response.data.filter(item => item && typeof item === 'object' && (item.value || item.id));
        setCidadesLocalizacao(validData);
        console.log(`[useOptimizedDropdowns] Cidades de localização carregadas: ${validData.length}`);
      } else {
        setCidadesLocalizacao([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades de localização:', error);
      setCidadesLocalizacao([]);
    }
  }, []);

  // === INÍCIO DA MUDANÇA: MANIPULADORES (HANDLERS) CENTRALIZADOS ===
  const handleChange = useCallback((field, value) => {
    console.log(`[useOptimizedDropdowns] Mudança no campo ${field}: ${value}`);
    setValues(prev => ({ ...prev, [field]: value }));

    // Lógica de dependência
    if (field === 'ufSinistro') {
      setValues(prev => ({ ...prev, cidadeSinistro: '' })); // Limpa a cidade
      if (value) loadCidadesSinistro(value);
    }
    if (field === 'uf') {
      setValues(prev => ({ ...prev, cidade: '' })); // Limpa a cidade
      if (value) loadCidadesLocalizacao(value);
    }
  }, [loadCidadesSinistro, loadCidadesLocalizacao]);

  // Função para popular o estado a partir de um registro existente
  const initializeValues = useCallback(async (registroData) => {
    if (!registroData) return;
    
    console.log('%c[useOptimizedDropdowns] INICIALIZANDO VALORES DOS DROPDOWNS', 'color: purple; font-weight: bold;', registroData);
    setLoading(true);
    
    try {
      const ufSinistro = registroData.uf_sinistro || '';
      const ufLocalizacao = registroData.uf || '';

      console.log('[useOptimizedDropdowns] Carregando todas as opções necessárias...');
      // Carrega todas as opções necessárias em paralelo
      await Promise.all([
        loadUfs(),
        loadColaboradores(),
        ufSinistro ? loadCidadesSinistro(ufSinistro) : Promise.resolve(),
        ufLocalizacao ? loadCidadesLocalizacao(ufLocalizacao) : Promise.resolve(),
      ]);

      console.log('[useOptimizedDropdowns] Definindo valores dos dropdowns...');
      // Define os valores DEPOIS que tudo foi carregado
      setValues({
        ufSinistro: ufSinistro,
        cidadeSinistro: registroData.cidade_sinistro || '',
        uf: ufLocalizacao,
        cidade: registroData.cidade || '',
        colaborador: registroData.colaborador?.nome || registroData.colaborador?.NOME || '',
      });
      
      console.log('%c[useOptimizedDropdowns] VALORES DOS DROPDOWNS DEFINIDOS', 'color: green; font-weight: bold;');
    } catch (error) {
      console.error("Erro ao inicializar valores dos dropdowns:", error);
    } finally {
      setLoading(false);
    }
  }, [loadUfs, loadColaboradores, loadCidadesSinistro, loadCidadesLocalizacao]);
  // === FIM DA MUDANÇA ===

  // Função para limpar cache
  const clearCache = useCallback(() => {
    // Limpar cache local
    cacheRef.current = {
      ufs: null,
      cidades: {},
      colaboradores: null
    };
    
    // Limpar cache do localStorage
    cacheService.clearAll();
    optimizedUfCidadeService.clearCache();
    
    // Resetar estados
    setUfs([]);
    setCidadesSinistro([]);
    setCidadesLocalizacao([]);
    setColaboradores([]);
    setValues({
      ufSinistro: '',
      cidadeSinistro: '',
      uf: '',
      cidade: '',
      colaborador: '',
    });
  }, []);

  // Opções memoizadas para dropdowns
  const ufOptions = useMemo(() => 
    ufs.map(uf => ({
      id: uf.id,
      value: uf.sigla,
      label: `${uf.sigla} - ${uf.nome}`,
      nome: uf.nome,
      sigla: uf.sigla
    })), [ufs]
  );

  const cidadeSinistroOptions = useMemo(() => 
    cidadesSinistro.map(cidade => ({
      id: cidade.id,
      value: cidade.nome,
      label: cidade.nome,
      nome: cidade.nome
    })), [cidadesSinistro]
  );

  const cidadeLocalizacaoOptions = useMemo(() => 
    cidadesLocalizacao.map(cidade => ({
      id: cidade.id,
      value: cidade.nome,
      label: cidade.nome,
      nome: cidade.nome
    })), [cidadesLocalizacao]
  );

  const colaboradorOptions = useMemo(() => 
    colaboradores.map(colaborador => {
      const nome = colaborador.nome || colaborador.NOME || `Colaborador ${colaborador.id}`;
      return {
        id: colaborador.id || colaborador.ID_PRESTADOR,
        value: nome,
        label: nome,
        nome: nome
      };
    }), [colaboradores]
  );

  // Função para obter estatísticas do cache
  const getCacheStats = useCallback(() => {
    return {
      local: cacheRef.current,
      localStorage: cacheService.getStats(),
      optimized: optimizedUfCidadeService.getCacheStats()
    };
  }, []);

  return {
    // Estados de loading
    loading,
    
    // Valores e Handlers centralizados
    dropdownValues: values,
    handleDropdownChange: handleChange,
    initializeDropdownValues: initializeValues,
    
    // Opções formatadas
    ufOptions,
    cidadeSinistroOptions,
    cidadeLocalizacaoOptions,
    colaboradorOptions,
    
    // Funções de carregamento (para compatibilidade)
    loadUfs,
    loadColaboradores,
    loadCidadesSinistro,
    loadCidadesLocalizacao,
    clearCache,
    getCacheStats
  };
};

export default useOptimizedDropdowns;