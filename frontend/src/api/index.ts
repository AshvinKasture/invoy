import axios from 'axios';
import envHelper from '@/utils/environment';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: envHelper.getApiUrl(),
  timeout: envHelper.getApiTimeout(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API requests in development mode
    if (envHelper.isDebugMode()) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    if (envHelper.isLoggingEnabled()) {
      console.error('❌ API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful API responses in debug mode
    if (envHelper.isDebugMode()) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (envHelper.isLoggingEnabled()) {
      console.error('❌ API Response Error:', error.response?.status, error.config?.url);
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Log API configuration in development
if (envHelper.isDev() && envHelper.isLoggingEnabled()) {
  console.log(`🔗 API configured with baseURL: ${envHelper.getApiUrl()}`);
}

export default api;

// Export all API services
export { authApi } from './auth';
export { partiesApi } from './parties';
export { itemsApi } from './items';
export { invoicesApi } from './invoices';
export { default as apiHelper } from './apiHelper';
