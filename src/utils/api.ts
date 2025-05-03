import axios from 'axios';
import { removePathFromUrl } from './utils';

// Cria uma instância centralizada do Axios com configurações padrão
const api = axios.create({
  baseURL: removePathFromUrl(import.meta.env.VITE_BACKEND_URL || ''),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptores para tratamento global de requisições
api.interceptors.request.use(
  (config) => {
    // Adicione aqui lógica para tokens de autenticação, etc.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptores para tratamento global de respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento global de erros (401, 403, etc)
    return Promise.reject(error);
  }
);

export default api;
