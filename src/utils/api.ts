import axios from 'axios';
import { removePathFromUrl } from './utils';
import { swal } from './swal';

const api = axios.create({
  baseURL: removePathFromUrl(import.meta.env.VITE_BACKEND_URL || ''),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = localStorage.getItem('user-locale') || 'pt-BR';
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }

    if (error.response && error.response.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);
      swal.fire({
        icon: 'warning',
        title: 'Muitas tentativas',
        text: `Você atingiu o limite de requisições. Aguarde ${retryAfter} segundo${retryAfter > 1 ? 's' : ''} antes de tentar novamente.`,
        timer: Math.min(retryAfter * 1000, 10000),
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'Entendi'
      });
    }

    return Promise.reject(error);
  }
);

export default api;
