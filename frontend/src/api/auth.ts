import apiHelper from './apiHelper';
import type { ApiResponse } from './apiHelper';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiHelper.post<LoginResponse>('/auth/login', credentials);
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiHelper.post<void>('/auth/logout');
    localStorage.removeItem('token');
    return response;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiHelper.get<User>('/auth/me');
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return apiHelper.post<{ token: string }>('/auth/refresh');
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return apiHelper.post<void>('/auth/change-password', data);
  },

  requestPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
    return apiHelper.post<void>('/auth/forgot-password', { email });
  },

  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return apiHelper.post<void>('/auth/reset-password', data);
  },
};
