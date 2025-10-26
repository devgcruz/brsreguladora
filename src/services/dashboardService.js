// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Função para fazer requisições autenticadas
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions = {
    headers: {
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

  return response;
};

const dashboardService = {
  /**
   * Obter dados de montadoras (Top 10)
   */
  async getDadosMontadoras() {
    try {
      const response = await makeAuthenticatedRequest('/dashboard/montadoras');
      const data = await response.json();
      
      // Converter dados para formato do gráfico de pizza
      return data.map((item, index) => ({
        name: item.name,
        value: item.y,
        color: this.getColor(index)
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de montadoras:', error);
      return [];
    }
  },

  /**
   * Obter dados de tipo de serviço
   */
  async getDadosTipoServico() {
    try {
      const response = await makeAuthenticatedRequest('/dashboard/tiposervico');
      const data = await response.json();
      
      // Converter dados para formato do gráfico de rosca
      return data.map((item, index) => ({
        name: item.name,
        value: item.y,
        color: this.getColor(index)
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de tipo de serviço:', error);
      return [];
    }
  },

  /**
   * Obter dados de situação
   */
  async getDadosSituacao() {
    try {
      const response = await makeAuthenticatedRequest('/dashboard/situacao');
      const data = await response.json();
      
      // Converter dados para formato do gráfico de colunas
      return data.map((item) => ({
        name: item.name,
        value: item.y
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de situação:', error);
      return [];
    }
  },

  /**
   * Obter dados de evolução de entradas
   */
  async getDadosEvolucaoEntradas() {
    try {
      const response = await makeAuthenticatedRequest('/dashboard/evolucao-entradas');
      const data = await response.json();
      
      // Converter dados para formato do gráfico de linha
      return data.map((item) => ({
        mes: item.month,
        entradas: item.value
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de evolução de entradas:', error);
      return [];
    }
  },

  /**
   * Obter dados de evolução de honorários
   */
  async getDadosEvolucaoHonorarios() {
    try {
      const response = await makeAuthenticatedRequest('/dashboard/evolucao-honorarios');
      const data = await response.json();
      
      // Converter dados para formato do gráfico de barras
      return data.map((item) => ({
        mes: item.month,
        honorarios: item.value
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de evolução de honorários:', error);
      return [];
    }
  },

  /**
   * Obter dados de evolução de despesas
   */
  async getDadosEvolucaoDespesas() {
    try {
      const response = await makeAuthenticatedRequest('/dashboard/evolucao-despesas');
      const data = await response.json();
      
      // Converter dados para formato do gráfico de área
      return data.map((item) => ({
        mes: item.month,
        despesas: item.value
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de evolução de despesas:', error);
      return [];
    }
  },

  /**
   * Função auxiliar para gerar cores para os gráficos
   */
  getColor(index) {
    const colors = [
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff7300',
      '#00ff00',
      '#ff00ff',
      '#00ffff',
      '#ffff00',
      '#ff0000',
      '#0000ff'
    ];
    return colors[index % colors.length];
  }
};

export default dashboardService;
