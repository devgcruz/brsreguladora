import { makeRequest } from '../config/api';

const dashboardService = {
  /**
   * Busca dados para gráfico de pizza - Percentual por Montadora
   */
  async getDadosMontadora() {
    try {
      const response = await makeRequest('/dashboard/montadoras');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados de montadora:', error);
      throw error;
    }
  },

  /**
   * Busca dados para gráfico de rosca - Percentual por Tipo de Serviço
   */
  async getDadosTipoServico() {
    try {
      const response = await makeRequest('/dashboard/tiposervico');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados de tipo de serviço:', error);
      throw error;
    }
  },

  /**
   * Busca dados para gráfico de colunas - Situação dos Registros
   */
  async getDadosSituacao() {
    try {
      const response = await makeRequest('/dashboard/situacao');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados de situação:', error);
      throw error;
    }
  },

  /**
   * Busca dados para gráfico de linha - Evolução de Entradas por Mês
   */
  async getDadosEvolucaoEntradas() {
    try {
      const response = await makeRequest('/dashboard/evolucao-entradas');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados de evolução de entradas:', error);
      throw error;
    }
  },

  /**
   * Busca dados para gráfico de colunas - Evolução de Honorários por Mês
   */
  async getDadosEvolucaoHonorarios() {
    try {
      const response = await makeRequest('/dashboard/evolucao-honorarios');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados de evolução de honorários:', error);
      throw error;
    }
  },

  /**
   * Busca dados para gráfico de área - Evolução de Despesas por Mês
   */
  async getDadosEvolucaoDespesas() {
    try {
      const response = await makeRequest('/dashboard/evolucao-despesas');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados de evolução de despesas:', error);
      throw error;
    }
  },

  async getAllDashboardData() {
    try {
      const [
        montadoras,
        tipoServico,
        situacao,
        evolucaoEntradas,
        evolucaoHonorarios,
        evolucaoDespesas
      ] = await Promise.all([
        this.getDadosMontadora(),
        this.getDadosTipoServico(),
        this.getDadosSituacao(),
        this.getDadosEvolucaoEntradas(),
        this.getDadosEvolucaoHonorarios(),
        this.getDadosEvolucaoDespesas()
      ]);

      return {
        montadoras,
        tipoServico,
        situacao,
        evolucaoEntradas,
        evolucaoHonorarios,
        evolucaoDespesas
      };
    } catch (error) {
      console.error('Erro ao buscar todos os dados do dashboard:', error);
      throw error;
    }
  }
};

export default dashboardService;
