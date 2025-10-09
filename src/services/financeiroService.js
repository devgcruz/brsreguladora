import { makeRequest } from '../config/api';

const financeiroService = {
  // Buscar todos os lançamentos financeiros
  async getFinanceiros(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/financeiro?${queryString}` : '/financeiro';
      const response = await makeRequest(url);
      return response;
    } catch (error) {
      console.error('Erro ao buscar financeiros:', error);
      throw error;
    }
  },

  // Buscar lançamentos financeiros por entrada
  async getFinanceirosByEntrada(entradaId) {
    try {
      const response = await makeRequest(`/entradas/${entradaId}/financeiros`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar financeiros por entrada:', error);
      throw error;
    }
  },

  // Buscar lançamento financeiro específico
  async getFinanceiro(id) {
    try {
      const response = await makeRequest(`/financeiro/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar financeiro:', error);
      throw error;
    }
  },

  // Criar novo lançamento financeiro
  async createFinanceiro(data) {
    try {
      const response = await makeRequest('/financeiro', {
        method: 'POST',
        body: data
      });
      return response;
    } catch (error) {
      console.error('Erro ao criar financeiro:', error);
      throw error;
    }
  },

  // Criar lançamento financeiro para entrada específica
  async createFinanceiroForEntrada(entradaId, data) {
    try {
      const response = await makeRequest(`/entradas/${entradaId}/financeiros`, {
        method: 'POST',
        body: data
      });
      return response;
    } catch (error) {
      console.error('Erro ao criar financeiro para entrada:', error);
      throw error;
    }
  },

  // Atualizar lançamento financeiro
  async updateFinanceiro(id, data) {
    try {
      const response = await makeRequest(`/financeiro/${id}`, {
        method: 'PUT',
        body: data
      });
      return response;
    } catch (error) {
      console.error('Erro ao atualizar financeiro:', error);
      throw error;
    }
  },

  // Excluir lançamento financeiro
  async deleteFinanceiro(id) {
    try {
      const response = await makeRequest(`/financeiro/${id}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Erro ao excluir financeiro:', error);
      throw error;
    }
  },

  // Buscar financeiro por entrada (método antigo - manter para compatibilidade)
  async getByEntrada(entradaId) {
    try {
      const response = await makeRequest(`/financeiro/entrada/${entradaId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar financeiro por entrada:', error);
      throw error;
    }
  },

  // Estatísticas financeiras
  async getStatistics() {
    try {
      const response = await makeRequest('/financeiro/statistics');
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      throw error;
    }
  }
};

export default financeiroService;
