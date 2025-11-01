import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { User } from '../types';

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Store user data
        const user: User = {
          user_id: response.data.user_id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          created_at: response.data.created_at,
          last_login_at: response.data.last_login_at,
        };
        localStorage.setItem('user', JSON.stringify(user));

        // Update query cache
        queryClient.setQueryData(['user'], user);
      }
    },
  });
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Store user data
        const user: User = {
          user_id: response.data.user_id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          created_at: response.data.created_at,
          last_login_at: response.data.last_login_at,
        };
        localStorage.setItem('user', JSON.stringify(user));

        // Update query cache
        queryClient.setQueryData(['user'], user);
      }
    },
  });
};

/**
 * Hook for token refresh
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store new tokens
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Store user data
        const user: User = {
          user_id: response.data.user_id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          created_at: response.data.created_at,
          last_login_at: response.data.last_login_at,
        };
        localStorage.setItem('user', JSON.stringify(user));

        // Update query cache
        queryClient.setQueryData(['user'], user);
      }
    },
  });
};

/**
 * Hook to get current user
 */
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.success && response.data ? response.data : null;
    },
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    initialData: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : undefined;
    },
  });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Clear query cache
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('access_token');
  return !!accessToken;
};
