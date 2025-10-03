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
  // Estados para UFs e cidades
  const [ufs, setUfs] = useState([]);
  const [cidadesSinistro, setCidadesSinistro] = useState([]);
  const [cidadesLocalizacao, setCidadesLocalizacao] = useState([]);
  
  // Estados de loading
  const [loadingUfs, setLoadingUfs] = useState(false);
  const [loadingCidadesSinistro, setLoadingCidadesSinistro] = useState(false);
  const [loadingCidadesLocalizacao, setLoadingCidadesLocalizacao] = useState(false);
  
  // Estados para colaboradores
  const [colaboradores, setColaboradores] = useState([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  
  // Estado de inicialização para evitar renderização prematura
  const [initialized, setInitialized] = useState(false);
  
  // Cache para evitar chamadas desnecessárias
  const cacheRef = useRef({
    ufs: null,
    cidades: {},
    colaboradores: null
  });

  // Função de inicialização que carrega todos os dados necessários
  const initializeData = useCallback(async () => {
    if (initialized) return;
    
    try {
      setLoadingUfs(true);
      setLoadingColaboradores(true);
      
      // Carregar UFs e colaboradores em paralelo
      await Promise.all([
        loadUfs(),
        loadColaboradores()
      ]);
      
      setInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    } finally {
      setLoadingUfs(false);
      setLoadingColaboradores(false);
    }
  }, [initialized]);


  // Função para carregar UFs (dados fixos do JSON)
  const loadUfs = useCallback(async () => {
    try {
      const response = optimizedUfCidadeService.getUfs();
      
      if (response.success && Array.isArray(response.data)) {
        setUfs(response.data);
        // Armazenar no cache
        cacheRef.current.ufs = response.data;
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
        return;
      }
    }

    setLoadingColaboradores(true);
    try {
      const response = await prestadorService.getPrestadores();
      
      if (response.success && Array.isArray(response.data)) {
        const colaboradoresValidos = response.data.filter(item => 
          item && typeof item === 'object' && (item.nome || item.NOME)
        );
        
        setColaboradores(colaboradoresValidos);
        cacheRef.current.colaboradores = colaboradoresValidos;
        
        // Salvar no cache
        cacheService.setColaboradores(colaboradoresValidos);
      } else {
        setColaboradores([]);
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      setColaboradores([]);
    } finally {
      setLoadingColaboradores(false);
    }
  }, []);

  // Função para carregar cidades do sinistro (com cache otimizado)
  const loadCidadesSinistro = useCallback(async (ufId) => {
    if (!ufId) {
      setCidadesSinistro([]);
      return;
    }

    setLoadingCidadesSinistro(true);
    try {
      const response = await optimizedUfCidadeService.getCidadesByUf(ufId);
      
      if (response.success && Array.isArray(response.data)) {
        const validData = response.data.filter(item => item && typeof item === 'object' && (item.value || item.id));
        setCidadesSinistro(validData);
      } else {
        setCidadesSinistro([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades do sinistro:', error);
      setCidadesSinistro([]);
    } finally {
      setLoadingCidadesSinistro(false);
    }
  }, []);

  // Função para carregar cidades de localização (com cache otimizado)
  const loadCidadesLocalizacao = useCallback(async (ufId) => {
    if (!ufId) {
      setCidadesLocalizacao([]);
      return;
    }

    setLoadingCidadesLocalizacao(true);
    try {
      const response = await optimizedUfCidadeService.getCidadesByUf(ufId);
      
      if (response.success && Array.isArray(response.data)) {
        const validData = response.data.filter(item => item && typeof item === 'object' && (item.value || item.id));
        setCidadesLocalizacao(validData);
      } else {
        setCidadesLocalizacao([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades de localização:', error);
      setCidadesLocalizacao([]);
    } finally {
      setLoadingCidadesLocalizacao(false);
    }
  }, []);

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
    // Estados
    ufs,
    cidadesSinistro,
    cidadesLocalizacao,
    colaboradores,
    loadingUfs,
    loadingCidadesSinistro,
    loadingCidadesLocalizacao,
    loadingColaboradores,
    initialized,
    
    // Opções formatadas
    ufOptions,
    cidadeSinistroOptions,
    cidadeLocalizacaoOptions,
    colaboradorOptions,
    
    // Funções
    loadUfs,
    loadColaboradores,
    loadCidadesSinistro,
    loadCidadesLocalizacao,
    initializeData,
    clearCache,
    getCacheStats
  };
};

export default useOptimizedDropdowns;
