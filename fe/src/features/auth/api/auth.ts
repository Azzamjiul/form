import { api } from '../../../utils/api';
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  UserResponse,
  LogoutResponse,
} from '../types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('auth/register', {
      json: data,
    }).json<AuthResponse>();

    return response;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('auth/login', {
      json: data,
    }).json<AuthResponse>();

    return response;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await api.post('auth/refresh', {
      json: data,
    }).json<AuthResponse>();

    return response;
  },

  /**
   * Get current user information
   */
  getMe: async (): Promise<UserResponse> => {
    const response = await api.get('auth/me').json<UserResponse>();

    return response;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await api.post('auth/logout').json<LogoutResponse>();

    return response;
  },
};
