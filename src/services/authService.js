// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Serviço de autenticação integrado com a API Laravel
const authService = {
  // Login real com a API
  async login(username, password) {
    try {
      console.log('🔐 Tentando login:', { username, apiUrl: API_BASE_URL });
      
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

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);

      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        console.log('✅ Login realizado com sucesso!');
        return data;
      } else {
        console.error('❌ Login falhou:', data.message);
        throw new Error(data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('💥 Erro no login:', error);
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
      console.error('Erro no logout:', error);
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
        console.log('🔍 AuthService: Nenhum token encontrado');
        return null;
      }

      console.log('📡 AuthService: Verificando usuário atual...');
      
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

      console.log('📡 AuthService: Resposta /me:', response.status);

      if (!response.ok) {
        console.log('❌ AuthService: Token inválido, limpando dados...');
        this.logout();
        return null;
      }

      const data = await response.json();
      console.log('📦 AuthService: Dados do usuário:', data);
      
      if (data.success) {
        return data.data;
      } else {
        console.log('❌ AuthService: Resposta não bem-sucedida, limpando dados...');
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('💥 AuthService: Erro ao obter usuário:', error);
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
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }
};

export default authService;


