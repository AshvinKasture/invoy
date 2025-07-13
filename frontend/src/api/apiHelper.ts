/**
 * API Helper Utility
 * 
 * This utility provides a comprehensive abstraction layer over axios
 * with built-in error handling, request/response transformation,
 * and convenient methods for common API operations.
 */

import api from './index';
import envHelper from '@/utils/environment';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiHelper {
  /**
   * Transform axios response to standardized API response
   */
  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data?.data ?? response.data,
      message: response.data?.message,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
    };
  }

  /**
   * Transform axios error to standardized API error
   */
  private transformError(error: any): ApiError {
    const response = error.response;
    
    if (response) {
      return {
        message: response.data?.message || response.statusText || 'Request failed',
        status: response.status,
        errors: response.data?.errors,
        code: response.data?.code,
      };
    }
    
    if (error.request) {
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }

  /**
   * Log API operations in development mode
   */
  private log(operation: string, url: string, data?: any): void {
    if (envHelper.isDebugMode()) {
      console.group(`🔄 API ${operation.toUpperCase()}: ${url}`);
      if (data) {
        console.log('Data:', data);
      }
      console.groupEnd();
    }
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      this.log('GET', fullUrl);
      
      const response = await api.get(fullUrl, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ GET Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      this.log('POST', url, data);
      
      const response = await api.post(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ POST Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      this.log('PUT', url, data);
      
      const response = await api.put(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ PUT Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      this.log('PATCH', url, data);
      
      const response = await api.patch(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ PATCH Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      this.log('DELETE', url);
      
      const response = await api.delete(url, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ DELETE Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Upload file(s)
   */
  async upload<T>(url: string, files: File | File[], additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      } else {
        formData.append('file', files);
      }
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }
      
      this.log('UPLOAD', url, { fileCount: Array.isArray(files) ? files.length : 1 });
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return this.transformResponse<T>(response);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ UPLOAD Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Download file
   */
  async download(url: string, filename?: string): Promise<void> {
    try {
      this.log('DOWNLOAD', url);
      
      const response = await api.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ DOWNLOAD Error:', url, apiError);
      }
      throw apiError;
    }
  }

  /**
   * Batch requests (parallel execution)
   */
  async batch<T>(requests: Array<() => Promise<ApiResponse<any>>>): Promise<ApiResponse<T[]>> {
    try {
      this.log('BATCH', `${requests.length} requests`);
      
      const results = await Promise.allSettled(requests.map(request => request()));
      
      const data = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value.data;
        } else {
          if (envHelper.isLoggingEnabled()) {
            console.error(`❌ Batch request ${index} failed:`, result.reason);
          }
          return null;
        }
      });
      
      return {
        data: data as T[],
        success: true,
        status: 200,
      };
    } catch (error) {
      const apiError = this.transformError(error);
      if (envHelper.isLoggingEnabled()) {
        console.error('❌ BATCH Error:', apiError);
      }
      throw apiError;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  /**
   * Get API configuration info
   */
  getConfig() {
    return {
      baseURL: envHelper.getApiUrl(),
      timeout: envHelper.getApiTimeout(),
      isDevelopment: envHelper.isDev(),
      isLoggingEnabled: envHelper.isLoggingEnabled(),
      isDebugMode: envHelper.isDebugMode(),
    };
  }

  /**
   * Format error for user display
   */
  formatError(error: ApiError): string {
    if (error.errors) {
      // Handle validation errors
      const validationErrors = Object.entries(error.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      return `${error.message}: ${validationErrors}`;
    }
    
    return error.message;
  }

  /**
   * Check if error is a specific type
   */
  isErrorType(error: ApiError, type: 'validation' | 'authentication' | 'authorization' | 'network'): boolean {
    switch (type) {
      case 'validation':
        return error.status === 400 || !!error.errors;
      case 'authentication':
        return error.status === 401;
      case 'authorization':
        return error.status === 403;
      case 'network':
        return error.status === 0 || !error.status;
      default:
        return false;
    }
  }
}

// Create singleton instance
const apiHelper = new ApiHelper();

// Log API configuration in development
if (envHelper.isDev() && envHelper.isLoggingEnabled()) {
  console.log('🔗 API Helper initialized with config:', apiHelper.getConfig());
}

export default apiHelper;
