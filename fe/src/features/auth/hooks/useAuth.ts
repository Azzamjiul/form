import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update query cache
      queryClient.setQueryData(['user'], data.user);
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
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update query cache
      queryClient.setQueryData(['user'], data.user);
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
    onSuccess: (data) => {
      // Store new tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update query cache
      queryClient.setQueryData(['user'], data.user);
    },
  });
};

/**
 * Hook to get current user
 */
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authApi.getMe,
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

  return () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Clear query cache
    queryClient.setQueryData(['user'], null);
    queryClient.clear();
  };
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('access_token');
  return !!accessToken;
};
