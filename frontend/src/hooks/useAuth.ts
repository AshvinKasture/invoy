import { useEffect } from 'react';
import { authApi } from '@/api/auth';
import apiHelper from '@/api/apiHelper';
import { useAuth as useAuthStore } from '@/store';
import type { LoginRequest } from '@/api/auth';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginStart,
    loginSuccess,
    loginFailure,
    logout: logoutStore,
    clearAuthError,
  } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkCurrentUser();
    } else {
      // Set loading to false if no token
      if (isLoading) {
        // This will be handled by the initial state
      }
    }
  }, []);

  const checkCurrentUser = async () => {
    try {
      loginStart();
      const response = await authApi.getCurrentUser();
      if (response.success) {
        loginSuccess(response.data);
      } else {
        localStorage.removeItem('token');
        loginFailure('Invalid token');
      }
    } catch (err: any) {
      console.error('Failed to get current user:', err);
      localStorage.removeItem('token');
      loginFailure('Failed to authenticate');
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      clearAuthError();
      loginStart();
      const response = await authApi.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        // Convert login response user to full User object
        const fullUser = {
          ...response.data.user,
          name: response.data.user.email, // Use email as name for now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        loginSuccess(fullUser);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        loginFailure(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = apiHelper.formatError(err);
      loginFailure(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logoutStore();
      localStorage.removeItem('token');
    }
  };

  return {
    user,
    loading: isLoading,
    error,
    login,
    logout,
    isAuthenticated,
    clearError: clearAuthError,
  };
};
