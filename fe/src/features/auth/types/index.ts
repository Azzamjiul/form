export interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
  last_login_at?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthData {
  user_id: string;
  email: string;
  name: string;
  role: string;
  access_token: string;
  refresh_token: string;
  created_at?: string;
  last_login_at?: string;
}

export interface LogoutData {
  message: string;
}

export interface ErrorData {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorData | null;
  timestamp: string;
}

export type AuthResponse = APIResponse<AuthData>;
export type UserResponse = APIResponse<User>;
export type LogoutResponse = APIResponse<LogoutData>;

export interface AuthError {
  error: string;
}
