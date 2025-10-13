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
    
    // Tratar erro 422 (Unprocessable Content) - geralmente placa duplicada
    if (response.status === 422) {
      try {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Dados inválidos';
        throw new Error(errorMessage);
      } catch (parseError) {
        throw new Error('Esta placa já está cadastrada no sistema');
      }
    }
    
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const entradaService = {
  // Verifica se uma placa já existe
  async checkPlacaExists(placa) {
    try {
      const response = await makeAuthenticatedRequest(`/entradas/check-placa?placa=${encodeURIComponent(placa)}`);
      return response;
    } catch (error) {
      console.error('Erro ao verificar placa:', error);
      throw error;
    }
  },

  // Retorna lista de entradas com suporte a paginação
  async getEntradas(filtros = {}, pagination = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Adicionar filtros à query string
      if (filtros && typeof filtros === 'object') {
        Object.keys(filtros).forEach(key => {
          if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
            queryParams.append(key, filtros[key]);
          }
        });
      }
      
      // Adicionar parâmetros de paginação
      if (pagination.page) {
        queryParams.append('page', pagination.page);
      }
      if (pagination.per_page) {
        queryParams.append('per_page', pagination.per_page);
      }

      const url = `/entradas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeAuthenticatedRequest(url);
      
      return {
        success: true,
        data: response.data,
        meta: response.meta
      };
    } catch (error) {
      console.error('Erro ao buscar entradas:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  },

  // Retorna entrada por ID
  async getEntradaById(id) {
    try {
      const response = await makeAuthenticatedRequest(`/entradas/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao buscar entrada:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Criar nova entrada
  async createEntrada(data) {
    try {
      const response = await makeAuthenticatedRequest('/entradas', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao criar entrada:', error);
      
      // Tratar especificamente erro de placa duplicada
      if (error.message.includes('placa') || error.message.includes('Placa')) {
        return {
          success: false,
          message: 'Esta placa já está cadastrada no sistema. Por favor, verifique a placa e tente novamente.',
          errorType: 'placa_duplicada'
        };
      }
      
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Atualizar entrada
  async updateEntrada(id, data) {
    try {
      const response = await makeAuthenticatedRequest(`/entradas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao atualizar entrada:', error);
      
      // Tratar especificamente erro de placa duplicada
      if (error.message.includes('placa') || error.message.includes('Placa')) {
        return {
          success: false,
          message: 'Esta placa já está cadastrada no sistema. Por favor, verifique a placa e tente novamente.',
          errorType: 'placa_duplicada'
        };
      }
      
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Deletar entrada
  async deleteEntrada(id) {
    try {
      const response = await makeAuthenticatedRequest(`/entradas/${id}`, {
        method: 'DELETE'
      });
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao deletar entrada:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Obter estatísticas
  async getStatistics() {
    try {
      const response = await makeAuthenticatedRequest('/entradas/statistics');
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
  },

  // Verificar se placa já existe
  async checkPlacaExists(placa) {
    try {
      // Simula verificação de placa duplicada
      // Em produção, seria uma chamada real à API
      const response = await makeAuthenticatedRequest(`/entradas/check-placa?placa=${encodeURIComponent(placa)}`);
      return {
        success: true,
        exists: response.exists
      };
    } catch (error) {
      console.error('Erro ao verificar placa:', error);
      // Para desenvolvimento, simula algumas placas existentes
      const placasExistentes = ['ABC1234', 'XYZ9876', 'DEF5678'];
      const placaNormalizada = placa.replace(/-/g, '').toUpperCase();
      return {
        success: true,
        exists: placasExistentes.includes(placaNormalizada)
      };
    }
  },

  // Obter dados unificados para formulários de registro
  async getRegistroFormData() {
    try {
      const response = await makeAuthenticatedRequest('/form-data/registros');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados do formulário:', error);
      return {
        success: false,
        message: error.message,
        data: {
          posicoes: [],
          marcas: [],
          seguradoras: [],
          colaboradores: [],
          prestadores: []
        }
      };
    }
  }

};

export default entradaService;


