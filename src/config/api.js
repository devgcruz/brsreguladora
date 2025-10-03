// Configuração da API
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Headers padrão para todas as requisições
const getDefaultHeaders = () => {
  const token = localStorage.getItem('auth_token');
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Função para fazer requisições com retry automático
const makeRequest = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  const defaultOptions = {
    headers: getDefaultHeaders(),
    timeout: API_CONFIG.TIMEOUT,
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  };

  let lastError;
  
  for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(fullUrl, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

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
    } catch (error) {
      lastError = error;
      
      if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
};

export { API_CONFIG, makeRequest };
