// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Função para fazer requisições autenticadas
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido, redirecionar para login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Serviço de auditoria integrado com a API
class AuditService {
  constructor() {
    // Não carregar dados mockados mais
  }

  // Registrar ação de auditoria (agora apenas para compatibilidade local)
  logAction(action, entity, entityId, description, details = {}) {
    // A auditoria agora é feita automaticamente pelo backend
    console.log('Ação de auditoria registrada:', { action, entity, entityId, description });
  }

  // Obter usuário atual
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
    }
    return null;
  }

  // Obter todos os logs da API
  async getAllLogs(filtros = {}) {
    try {
      console.log('🔍 AuditService: Buscando logs de auditoria...', { filtros });
      
      const queryParams = new URLSearchParams();
      
      if (filtros && typeof filtros === 'object') {
        Object.keys(filtros).forEach(key => {
          if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
            queryParams.append(key, filtros[key]);
          }
        });
      }

      const url = `/auditoria${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('📡 AuditService: URL da requisição:', url);
      
      const response = await makeAuthenticatedRequest(url);
      console.log('📦 AuditService: Resposta recebida:', response);
      
      return {
        success: true,
        data: response.data,
        meta: response.meta
      };
    } catch (error) {
      console.error('❌ AuditService: Erro ao buscar logs de auditoria:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // Filtrar logs por critérios
  async filterLogs(filters = {}) {
    return await this.getAllLogs(filters);
  }

  // Obter estatísticas dos logs
  async getLogStats() {
    try {
      const response = await makeAuthenticatedRequest('/auditoria/statistics');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Limpar logs antigos
  async cleanOldLogs() {
    try {
      const response = await makeAuthenticatedRequest('/auditoria/clean', {
        method: 'POST'
      });
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Exportar logs para CSV
  async exportLogsToCSV(filtros = {}) {
    try {
      const response = await makeAuthenticatedRequest('/auditoria/export', {
        method: 'POST',
        body: JSON.stringify(filtros)
      });
      
      // Criar link de download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return {
        success: true,
        message: 'Logs exportados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// Instância única do serviço
const auditService = new AuditService();

export default auditService;
