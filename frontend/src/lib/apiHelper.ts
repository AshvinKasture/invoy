import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

class ApiHelper {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: "An error occurred",
          status: error.response?.status,
          data: error.response?.data,
        };

        if (error.response?.data && typeof error.response.data === "object") {
          const responseData = error.response.data as any;
          apiError.message =
            responseData.message || responseData.error || "Request failed";
        } else if (error.message) {
          apiError.message = error.message;
        }

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          // You can dispatch a logout action here if needed
          // window.location.href = '/login';
        }

        return Promise.reject(apiError);
      }
    );
  }

  // GET request
  async get<T = any>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // POST request
  async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // PUT request
  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // DELETE request
  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Method to update base URL if needed
  setBaseURL(baseURL: string) {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  // Method to get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem("token");
  }
}

// Create and export a singleton instance
export const apiHelper = new ApiHelper(import.meta.env.VITE_BACKEND_URL);

// Export the class for creating custom instances if needed
export default ApiHelper;
