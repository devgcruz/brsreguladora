/**
 * Utilitários para gerenciamento de cache
 */

import cacheService from '../services/cacheService';

/**
 * Limpa todo o cache da aplicação
 */
export const clearAllCache = () => {
  console.log('🗑️ Limpando todo o cache da aplicação...');
  
  try {
    // Limpar cache do localStorage
    const cleared = cacheService.clearAll();
    
    if (cleared) {
      console.log('✅ Cache do localStorage limpo com sucesso!');
    } else {
      console.log('⚠️ Erro ao limpar cache do localStorage');
    }
    
    // Limpar cache específico de dropdowns
    cacheService.remove('dropdownData');
    console.log('✅ Cache de dropdowns limpo!');
    
    // Limpar outros caches se necessário
    const keysToRemove = [
      'colaboradores_v2',
      'cidades_v2',
      'cache_metadata',
      'dropdownData'
    ];
    
    keysToRemove.forEach(key => {
      cacheService.remove(key);
    });
    
    console.log('✅ Todos os caches específicos foram limpos!');
    
    // Recarregar a página para forçar nova busca de dados
    console.log('🔄 Recarregando página para aplicar mudanças...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return false;
  }
};

/**
 * Limpa apenas o cache de colaboradores
 */
export const clearColaboradoresCache = () => {
  console.log('🗑️ Limpando cache de colaboradores...');
  
  try {
    cacheService.remove('dropdownData');
    cacheService.remove('colaboradores_v2');
    console.log('✅ Cache de colaboradores limpo!');
    
    // Recarregar a página
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache de colaboradores:', error);
    return false;
  }
};

/**
 * Força o recarregamento dos dados de dropdown
 */
export const forceReloadDropdowns = async () => {
  console.log('🔄 Forçando recarregamento dos dados de dropdown...');
  
  try {
    // Limpar cache
    cacheService.remove('dropdownData');
    
    // Tentar acessar o store se estiver disponível
    if (typeof window !== 'undefined' && window.forceReloadAppData) {
      window.forceReloadAppData();
    }
    
    console.log('✅ Recarregamento forçado!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao forçar recarregamento:', error);
    return false;
  }
};

/**
 * Exibe estatísticas do cache
 */
export const getCacheStats = () => {
  console.log('📊 Estatísticas do cache:');
  
  try {
    const stats = cacheService.getStats();
    console.table(stats);
    
    // Verificar cache de dropdowns
    const dropdownCache = cacheService.get('dropdownData');
    if (dropdownCache) {
      console.log('📦 Cache de dropdowns:', {
        colaboradores: dropdownCache.data?.colaboradores?.length || 0,
        marcas: dropdownCache.data?.marcas?.length || 0,
        seguradoras: dropdownCache.data?.seguradoras?.length || 0,
        posicoes: dropdownCache.data?.posicoes?.length || 0,
        timestamp: new Date(dropdownCache.metadata?.timestamp).toLocaleString()
      });
    } else {
      console.log('❌ Nenhum cache de dropdowns encontrado');
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return null;
  }
};

/**
 * Disponibiliza funções globalmente para uso no console
 */
if (typeof window !== 'undefined') {
  window.clearAllCache = clearAllCache;
  window.clearColaboradoresCache = clearColaboradoresCache;
  window.forceReloadDropdowns = forceReloadDropdowns;
  window.getCacheStats = getCacheStats;
  
  console.log('🔧 Utilitários de cache disponíveis no console:');
  console.log('- clearAllCache() - Limpa todo o cache');
  console.log('- clearColaboradoresCache() - Limpa cache de colaboradores');
  console.log('- forceReloadDropdowns() - Força recarregamento');
  console.log('- getCacheStats() - Mostra estatísticas do cache');
}

export default {
  clearAllCache,
  clearColaboradoresCache,
  forceReloadDropdowns,
  getCacheStats
};
