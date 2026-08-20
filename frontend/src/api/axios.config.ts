import axios from 'axios'
import { showToast } from '@/composables/useToast'

export const baseURL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_DEV) ||
  'http://localhost:3000'

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor: clean empty params
apiClient.interceptors.request.use((config) => {
  if (config.params) {
    Object.keys(config.params).forEach((key) => {
      if (config.params[key] === '' || config.params[key] === null || config.params[key] === undefined) {
        delete config.params[key];
      }
    });
  }
  return config
})

// Response interceptor: handle 401, refresh token, retry, and global success toast
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const url = response.config.url;

    const hideToast = response.config.headers?.['X-Hide-Global-Toast'] === 'true' || response.config.headers?.['x-hide-global-toast'] === 'true';

    if (method && ['post', 'patch', 'put', 'delete'].includes(method) && url && !url.includes('/auth/') && !hideToast) {
      let msg = 'Operación completada con éxito';
      if (method === 'post') msg = 'Registro creado exitosamente';
      if (method === 'patch' || method === 'put') msg = 'Registro actualizado exitosamente';
      if (method === 'delete') msg = 'Registro eliminado exitosamente';
      showToast(msg, 'success');
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/me')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          originalRequest._retry = true;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
        processQueue(null)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
