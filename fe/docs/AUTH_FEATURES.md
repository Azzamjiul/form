# Authentication Features Reference

## 🎯 Available Hooks

### `useLogin()`
Login mutation hook for authenticating users.

**Returns:**
- `mutate(data, options)` - Function to trigger login
- `isPending` - Loading state
- `error` - Error object if login fails
- `data` - AuthResponse on success

**Example:**
```tsx
const { mutate: login, isPending, error } = useLogin();

login(
  { email: 'user@example.com', password: 'pass123' },
  {
    onSuccess: (data) => {
      console.log('Logged in as:', data.user.name);
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error('Login failed:', err);
    }
  }
);
```

---

### `useRegister()`
Registration mutation hook for creating new users.

**Returns:**
- `mutate(data, options)` - Function to trigger registration
- `isPending` - Loading state
- `error` - Error object if registration fails
- `data` - AuthResponse on success

**Example:**
```tsx
const { mutate: register, isPending } = useRegister();

register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure123'
});
```

---

### `useUser()`
Query hook to fetch and cache current user data.

**Returns:**
- `data` - User object
- `isLoading` - Initial loading state
- `error` - Error object if fetch fails
- `refetch()` - Function to manually refetch user

**Example:**
```tsx
const { data: user, isLoading, error } = useUser();

if (isLoading) return <Spinner />;
if (error) return <Error />;

return <div>Welcome, {user.name}!</div>;
```

---

### `useLogout()`
Returns a function to logout the user.

**Returns:**
- `logout()` - Function to clear auth state and tokens

**Example:**
```tsx
const logout = useLogout();

<button onClick={() => {
  logout();
  navigate('/login');
}}>
  Logout
</button>
```

---

### `useIsAuthenticated()`
Simple hook to check if user is authenticated.

**Returns:**
- `boolean` - True if access token exists

**Example:**
```tsx
const isAuthenticated = useIsAuthenticated();

return isAuthenticated ? <Dashboard /> : <LoginPrompt />;
```

---

### `useRefreshToken()`
Manual token refresh hook (usually automatic).

**Returns:**
- `mutate(data, options)` - Function to trigger refresh
- `isPending` - Loading state
- `error` - Error object if refresh fails

**Example:**
```tsx
const { mutate: refresh } = useRefreshToken();

refresh({ refresh_token: token });
```

---

## 🧩 Components

### `<LoginForm />`
Pre-built login form component with validation and error handling.

**Props:** None

**Features:**
- Email and password inputs
- Loading state
- Error display
- Automatic redirect on success

**Example:**
```tsx
import { LoginForm } from '@/features/auth';

<LoginForm />
```

---

### `<RegisterForm />`
Pre-built registration form component.

**Props:** None

**Features:**
- Name, email, and password inputs
- Client-side validation
- Loading state
- Error display
- Automatic redirect on success

**Example:**
```tsx
import { RegisterForm } from '@/features/auth';

<RegisterForm />
```

---

### `<ProtectedRoute>`
Route guard component that redirects unauthenticated users.

**Props:**
- `children: ReactNode` - Content to protect

**Example:**
```tsx
import { ProtectedRoute } from '@/features/auth';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🔧 API Functions

All API functions are available from `features/auth/api/auth.ts`

### `authApi.register(data)`
Register a new user.

**Parameters:**
- `data: RegisterRequest` - { name, email, password }

**Returns:** `Promise<AuthResponse>`

---

### `authApi.login(data)`
Authenticate a user.

**Parameters:**
- `data: LoginRequest` - { email, password }

**Returns:** `Promise<AuthResponse>`

---

### `authApi.refreshToken(data)`
Refresh access token.

**Parameters:**
- `data: RefreshTokenRequest` - { refresh_token }

**Returns:** `Promise<AuthResponse>`

---

### `authApi.getMe()`
Get current authenticated user.

**Returns:** `Promise<User>`

---

## 📦 Types

### `User`
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

### `RegisterRequest`
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
```

### `LoginRequest`
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

### `RefreshTokenRequest`
```typescript
interface RefreshTokenRequest {
  refresh_token: string;
}
```

### `AuthResponse`
```typescript
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
```

### `AuthError`
```typescript
interface AuthError {
  error: string;
}
```

---

## 🌐 API Client

The HTTP client is available from `utils/api.ts`

### Basic Usage
```typescript
import { api } from '@/utils/api';

// GET request
const data = await api.get('endpoint').json();

// POST request
const response = await api.post('endpoint', {
  json: { key: 'value' }
}).json();

// PUT request
const updated = await api.put('endpoint/id', {
  json: { key: 'new-value' }
}).json();

// DELETE request
await api.delete('endpoint/id');
```

### Features
- Automatic token management
- Auto-refresh on 401
- Type-safe requests
- Error handling
- CORS support

---

## 🔐 Storage

Authentication data is stored in `localStorage`:

### Keys
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token  
- `user` - JSON stringified user object

### Manual Access
```typescript
// Get tokens
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

// Get user
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

// Clear auth data
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
```

---

## 🚀 Common Patterns

### Pattern 1: Conditional Navigation
```tsx
import { useIsAuthenticated } from '@/features/auth';
import { Navigate } from 'react-router';

function MyComponent() {
  const isAuth = useIsAuthenticated();
  
  if (!isAuth) {
    return <Navigate to="/login" />;
  }
  
  return <div>Protected Content</div>;
}
```

### Pattern 2: User-Specific Rendering
```tsx
import { useUser } from '@/features/auth';

function UserGreeting() {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) return <Skeleton />;
  
  return <h1>Hello, {user?.name}!</h1>;
}
```

### Pattern 3: Role-Based Access
```tsx
import { useUser } from '@/features/auth';

function AdminPanel() {
  const { data: user } = useUser();
  const isAdmin = user?.email.endsWith('@admin.com');
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <AdminControls />;
}
```

### Pattern 4: Auth State in Context
```tsx
import { useUser, useLogout, useIsAuthenticated } from '@/features/auth';

function Navbar() {
  const isAuth = useIsAuthenticated();
  const { data: user } = useUser();
  const logout = useLogout();
  
  return (
    <nav>
      {isAuth ? (
        <>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
```

### Pattern 5: Protected API Calls
```tsx
import { api } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Token automatically added
      return api.get('orders').json();
    },
  });
}
```

---

## 🎨 Customization

### Custom Login Form
```tsx
import { useLogin } from '@/features/auth';

function CustomLoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  // ... your custom implementation
}
```

### Custom Error Handling
```tsx
const { mutate: login } = useLogin();

login(credentials, {
  onError: (error) => {
    if (error.message.includes('invalid')) {
      toast.error('Invalid credentials');
    } else {
      toast.error('Login failed. Please try again.');
    }
  }
});
```

### Custom Redirect Logic
```tsx
const { mutate: login } = useLogin();

login(credentials, {
  onSuccess: (data) => {
    const returnUrl = new URLSearchParams(location.search).get('return');
    navigate(returnUrl || '/dashboard');
  }
});
```

---

## 🔍 Debugging

### Check Auth State
```typescript
// In browser console
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
```

### Monitor API Calls
The `api` client logs are visible in Network tab of DevTools.

### Clear Auth State
```typescript
// In browser console
localStorage.clear();
location.reload();
```

---

## 📖 Related Documentation

- [Integration Guide](./AUTH_INTEGRATION.md)
- [Quick Start](./QUICK_START.md)
- [Integration Summary](./INTEGRATION_SUMMARY.md)
- [Code Examples](./src/examples/AuthExamples.tsx)
