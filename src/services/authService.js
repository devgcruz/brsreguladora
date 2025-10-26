// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Serviço de autenticação integrado com a API Laravel
const authService = {
  // Login real com a API
  async login(username, password) {
    try {
      // Adicionar timeout para evitar travamento
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          usuario: username,
          senha: password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        return data;
      } else {
        throw new Error(data.message || 'Erro no login');
      }
    } catch (error) {
      throw new Error(error.message || 'Erro de conexão com o servidor');
    }
  },

  // Registro de novo usuário
  async register(userData) {
    try {
      // Adicionar timeout para evitar travamento
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Erro no registro');
      }
    } catch (error) {
      throw new Error(error.message || 'Erro de conexão com o servidor');
    }
  },

  // Logout real com a API
  async logout() {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      // Erro silencioso no logout
    } finally {
      // Limpar dados locais
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  // Obter dados do usuário autenticado
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return null;
      }

      // Adicionar timeout para evitar travamento
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        this.logout();
        return null;
      }
    } catch (error) {
      this.logout();
      return null;
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Obter token de autenticação
  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Verificar permissão do usuário
  async checkPermission(permission) {
    try {
      const token = this.getToken();
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/check-permission/${permission}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      return data.success && data.data.has_permission;
    } catch (error) {
      return false;
    }
  }
};

export default authService;


