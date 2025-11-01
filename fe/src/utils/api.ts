import ky from 'ky';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
              // Try to refresh the token
              const refreshResponse = await ky.post(`${API_BASE_URL}/auth/refresh`, {
                json: { refresh_token: refreshToken },
              }).json<{ access_token: string; refresh_token: string }>();

              // Store new tokens
              localStorage.setItem('access_token', refreshResponse.access_token);
              localStorage.setItem('refresh_token', refreshResponse.refresh_token);

              // Retry the original request with the new token
              request.headers.set('Authorization', `Bearer ${refreshResponse.access_token}`);
              return ky(request);
            } catch (error) {
              // If refresh fails, clear tokens and redirect to login
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
