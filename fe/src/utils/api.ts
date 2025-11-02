import ky from 'ky';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Track if a refresh is in progress to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Create a ky instance with default configuration
export const api = ky.create({
  prefixUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Add access token to requests if available
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        // If we get a 401, try to refresh the token
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');

          if (refreshToken) {
            try {
              // If a refresh is already in progress, wait for it
              if (isRefreshing && refreshPromise) {
                await refreshPromise;
                // After refresh completes, retry with new token
                const newAccessToken = localStorage.getItem('access_token');
                if (newAccessToken) {
                  request.headers.set('Authorization', `Bearer ${newAccessToken}`);
                  return ky(request);
                }
                throw new Error('No access token after refresh');
              }

              // Start refresh process
              isRefreshing = true;
              refreshPromise = ky.post(`${API_BASE_URL}/auth/refresh`, {
                headers: {
                  'Content-Type': 'application/json',
                },
                json: { refresh_token: refreshToken },
                retry: 0, // Don't retry refresh requests
              }).json<{
                success: boolean;
                data: {
                  access_token: string;
                  refresh_token: string;
                } | null;
              }>();

              const refreshResponse = await refreshPromise;

              if (refreshResponse.success && refreshResponse.data) {
                // Store new tokens
                localStorage.setItem('access_token', refreshResponse.data.access_token);
                localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);

                // Retry the original request with the new token
                request.headers.set('Authorization', `Bearer ${refreshResponse.data.access_token}`);

                // Reset refresh state
                isRefreshing = false;
                refreshPromise = null;

                return ky(request);
              } else {
                throw new Error('Failed to refresh token');
              }
            } catch (error) {
              // Reset refresh state
              isRefreshing = false;
              refreshPromise = null;

              // If refresh fails, clear tokens and redirect to login
              console.error('Token refresh failed:', error);
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              throw error;
            }
          } else {
            // No refresh token, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }

        return response;
      },
    ],
  },
});
