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

const prestadorService = {
  // Obter todos os prestadores/colaboradores
  async getPrestadores(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros && typeof filtros === 'object') {
        Object.keys(filtros).forEach(key => {
          if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
            queryParams.append(key, filtros[key]);
          }
        });
      }

      const url = `/prestadores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeAuthenticatedRequest(url);
      
      return {
        success: true,
        data: response.data,
        meta: response.meta
      };
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  },

  // Obter prestador por ID
  async getPrestadorById(id) {
    try {
      const response = await makeAuthenticatedRequest(`/prestadores/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Criar novo prestador
  async createPrestador(data) {
    try {
      const response = await makeAuthenticatedRequest('/prestadores', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao criar prestador:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Atualizar prestador
  async updatePrestador(id, data) {
    try {
      const response = await makeAuthenticatedRequest(`/prestadores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao atualizar prestador:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Deletar prestador
  async deletePrestador(id) {
    try {
      const response = await makeAuthenticatedRequest(`/prestadores/${id}`, {
        method: 'DELETE'
      });
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Erro ao deletar prestador:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Obter estatísticas
  async getStatistics() {
    try {
      const response = await makeAuthenticatedRequest('/prestadores/statistics');
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
};

export default prestadorService;



