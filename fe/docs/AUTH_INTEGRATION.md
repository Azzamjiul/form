# Authentication Integration

This document describes the authentication integration between the backend and frontend.

## Backend Endpoints

The backend provides the following authentication endpoints:

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login with email and password
- **POST** `/api/auth/refresh` - Refresh access token
- **GET** `/api/auth/me` - Get current user information (requires authentication)

## Frontend Integration

### Files Structure

```
fe/src/
├── features/auth/
│   ├── api/
│   │   └── auth.ts          # Auth API functions
│   ├── components/
│   │   ├── LoginForm.tsx    # Login form component
│   │   ├── RegisterForm.tsx # Registration form component
│   │   └── ProtectedRoute.tsx # Route protection component
│   ├── hooks/
│   │   └── useAuth.ts       # Auth hooks
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── index.ts             # Feature exports
└── utils/
    └── api.ts               # Ky HTTP client configuration
```

### Setup

1. **Environment Configuration**
   
   Create a `.env` file in the `fe` directory:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

2. **Start the Backend Server**
   ```bash
   cd be
   go run main.go
   ```
   The backend will run on `http://localhost:8080`

3. **Start the Frontend Development Server**
   ```bash
   cd fe
   npm run dev
   ```

### Usage Examples

#### 1. User Registration

```tsx
import { RegisterForm } from '@/features/auth';

function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
```

#### 2. User Login

```tsx
import { LoginForm } from '@/features/auth';

function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
```

#### 3. Protected Routes

```tsx
import { ProtectedRoute } from '@/features/auth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

#### 4. Using Auth Hooks

```tsx
import { useUser, useLogout, useIsAuthenticated } from '@/features/auth';

function UserProfile() {
  const { data: user, isLoading } = useUser();
  const logout = useLogout();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 5. Custom API Calls

```tsx
import { api } from '@/utils/api';

// Making authenticated requests
async function fetchData() {
  const data = await api.get('some-endpoint').json();
  return data;
}

// Making POST requests
async function createItem(item: Item) {
  const response = await api.post('items', {
    json: item,
  }).json();
  return response;
}
```

### Authentication Flow

1. **Login/Register**: 
   - User submits credentials
   - Backend returns `access_token`, `refresh_token`, and `user` data
   - Tokens are stored in `localStorage`
   - User data is cached in React Query

2. **Authenticated Requests**:
   - Access token is automatically added to request headers via `beforeRequest` hook
   - If token is valid, request proceeds normally

3. **Token Refresh**:
   - If a request receives a 401 status, the `afterResponse` hook triggers
   - System attempts to refresh the token using the refresh token
   - If successful, the original request is retried with the new token
   - If refresh fails, user is redirected to login

4. **Logout**:
   - Tokens and user data are removed from `localStorage`
   - React Query cache is cleared
   - User is redirected to login

### API Client Features

The `api` client (in `utils/api.ts`) includes:

- **Automatic Token Management**: Access tokens are automatically added to requests
- **Token Refresh**: Expired tokens are automatically refreshed
- **Error Handling**: 401 errors trigger token refresh or logout
- **Type Safety**: Full TypeScript support

### Available Hooks

- `useRegister()` - Register a new user
- `useLogin()` - Login with email and password
- `useRefreshToken()` - Manually refresh tokens
- `useUser()` - Get current user data
- `useLogout()` - Logout function
- `useIsAuthenticated()` - Check if user is authenticated

### TypeScript Types

All backend models are typed in `features/auth/types/index.ts`:

- `User` - User data model
- `RegisterRequest` - Registration payload
- `LoginRequest` - Login payload
- `RefreshTokenRequest` - Token refresh payload
- `AuthResponse` - Authentication response
- `AuthError` - Error response

### Storage

Authentication tokens are stored in `localStorage`:

- `access_token` - JWT access token
- `refresh_token` - JWT refresh token
- `user` - Serialized user object

### Security Considerations

1. Tokens are stored in localStorage (consider httpOnly cookies for production)
2. CORS is configured on the backend to accept requests from the frontend
3. All authenticated routes use the `AuthMiddleware` on the backend
4. Token refresh happens automatically on 401 responses
5. Sensitive user data (password) is never exposed in responses

### Customization

To customize the API base URL, update the `.env` file:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

To modify token refresh behavior, edit `fe/src/utils/api.ts`.

To add more auth-related features, extend the `authApi` in `features/auth/api/auth.ts`.
