import { create } from 'zustand';
import authService from '../services/authService';
import userService from '../services/userService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false,
  isInitializing: false,

  // Inicializa o estado de autenticação
  init: async () => {
    const { loading, isAuthenticated, initialized, isInitializing } = get();
    
    // Evitar múltiplas inicializações
    if (initialized) {
      console.log('✅ AuthStore: Já inicializado, ignorando...');
      return;
    }
    
    if (isInitializing) {
      console.log('🔄 AuthStore: Já está inicializando, ignorando...');
      return;
    }
    
    set({ loading: true, isInitializing: true });
    
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('🔍 AuthStore: Verificando autenticação...', { hasToken: !!token, hasUserData: !!userData });
      
      if (token && userData) {
        try {
          // Verificar se o token ainda é válido
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            console.log('✅ AuthStore: Usuário autenticado:', currentUser.nome);
            set({
              token,
              isAuthenticated: true,
              user: currentUser,
              loading: false,
              initialized: true,
              isInitializing: false
            });
          } else {
            console.log('❌ AuthStore: Token inválido, limpando dados...');
            // Token inválido, limpar dados
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            set({
              token: null,
              isAuthenticated: false,
              user: null,
              loading: false,
              initialized: true,
              isInitializing: false
            });
          }
        } catch (error) {
          console.error('❌ AuthStore: Erro ao verificar usuário:', error);
          // Em caso de erro, limpar dados
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          set({
            token: null,
            isAuthenticated: false,
            user: null,
            loading: false,
            initialized: true,
            isInitializing: false
          });
        }
      } else {
        console.log('ℹ️ AuthStore: Nenhum token encontrado');
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          loading: false,
          initialized: true,
          isInitializing: false
        });
      }
    } catch (error) {
      console.error('💥 AuthStore: Erro na inicialização:', error);
      set({
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        initialized: true,
        isInitializing: false
      });
    }
  },

  // Verifica se usuário tem permissão
  hasPermission: (permission) => {
    const { user } = get();
    
    if (!user) return false;
    
    // Se for administrador, dar acesso total
    if (user.nivel >= 3) {
      return true;
    }
    
    // Verificar permissões específicas
    return user.permissoes && user.permissoes.includes(permission);
  },

  // Verifica se usuário é administrador
  isAdmin: () => {
    const { user } = get();
    return user && user.nivel >= 3;
  },

  // Login
  login: async (username, password) => {
    console.log('🚀 AuthStore: Iniciando login...');
    set({ loading: true, error: null });
    try {
      console.log('📞 AuthStore: Chamando authService.login...');
      const response = await authService.login(username, password);
      console.log('📨 AuthStore: Resposta recebida:', response);
      
      if (response.success) {
        console.log('✅ AuthStore: Login bem-sucedido, atualizando estado...');
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          loading: false,
          error: null
        });
        return { success: true };
      } else {
        console.log('❌ AuthStore: Login falhou:', response.message);
        set({
          loading: false,
          error: response.message || 'Erro ao fazer login'
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('💥 AuthStore: Erro no login:', error);
      set({
        loading: false,
        error: error.message || 'Erro ao fazer login'
      });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        initialized: false
      });
    }
  },

  // Limpa erros
  clearError: () => set({ error: null })
}));

export default useAuthStore;

