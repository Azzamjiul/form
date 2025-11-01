/**
 * Complete Authentication Integration Examples
 * 
 * This file demonstrates all the auth features available in the application.
 */

import { useState } from 'react';
import { useIsAuthenticated, useLogin, useLogout, useRegister, useUser } from '../features/auth';

// ===========================
// Example 1: Simple Login
// ===========================
export function SimpleLoginExample() {
  const { mutate: login, isPending } = useLogin();

  const handleLogin = () => {
    login(
      { email: 'user@example.com', password: 'password123' },
      {
        onSuccess: () => {
          console.log('Login successful!');
          // Redirect or show success message
        },
        onError: (err) => {
          console.error('Login failed:', err);
        },
      }
    );
  };

  return (
    <button onClick={handleLogin} disabled={isPending}>
      {isPending ? 'Logging in...' : 'Login'}
    </button>
  );
}

// ===========================
// Example 2: Registration with Form
// ===========================
export function RegistrationExample() {
  const { mutate: register, isPending, error } = useRegister();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData, {
      onSuccess: () => {
        alert('Registration successful!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit" disabled={isPending}>
        Register
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}

// ===========================
// Example 3: Display User Info
// ===========================
export function UserProfileExample() {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) return <div>Loading user data...</div>;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>No user data</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
      <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
    </div>
  );
}

// ===========================
// Example 4: Logout Button
// ===========================
export function LogoutExample() {
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
    window.location.href = '/login';
  };

  return <button onClick={handleLogout}>Logout</button>;
}

// ===========================
// Example 5: Conditional Rendering
// ===========================
export function ConditionalRenderingExample() {
  const isAuthenticated = useIsAuthenticated();
  const { data: user } = useUser();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome back, {user?.name}!</p>
          <button>Go to Dashboard</button>
        </div>
      ) : (
        <div>
          <p>Please login to continue</p>
          <button>Login</button>
        </div>
      )}
    </div>
  );
}

// ===========================
// Example 6: Protected Component
// ===========================
export function ProtectedComponentExample() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <div>Access denied. Please login.</div>;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>This content is only visible to authenticated users.</p>
    </div>
  );
}

// ===========================
// Example 7: Complete Auth Flow Component
// ===========================
export function CompleteAuthFlowExample() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const isAuthenticated = useIsAuthenticated();
  const { data: user } = useUser();
  const logout = useLogout();

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: register, isPending: isRegistering } = useRegister();

  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login({ email: credentials.email, password: credentials.password });
    } else {
      register(credentials);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div>
        <h1>Welcome, {user.name}!</h1>
        <p>Email: {user.email}</p>
        <button onClick={() => logout.mutate()}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Name"
            value={credentials.name}
            onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
        <button type="submit" disabled={isLoggingIn || isRegistering}>
          {isLoggingIn || isRegistering ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        Switch to {mode === 'login' ? 'Register' : 'Login'}
      </button>
    </div>
  );
}

// ===========================
// Example 8: Making Authenticated API Calls
// ===========================
import { api } from '../utils/api';

export async function makeAuthenticatedRequest() {
  try {
    // The api client automatically adds the token
    const data = await api.get('some-endpoint').json();
    console.log('Data:', data);
    return data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

export async function createResource(resource: any) {
  try {
    const response = await api.post('resources', {
      json: resource,
    }).json();
    return response;
  } catch (error) {
    console.error('Failed to create resource:', error);
    throw error;
  }
}

// ===========================
// Example 9: Custom Hook Using Auth
// ===========================
export function useCustomAuthHook() {
  const isAuthenticated = useIsAuthenticated();
  const { data: user } = useUser();
  const logout = useLogout();

  const isAdmin = user?.email.includes('admin'); // Simple example
  const canEdit = isAuthenticated && user !== null;

  return {
    user,
    isAuthenticated,
    isAdmin,
    canEdit,
    logout,
  };
}

// Usage of custom hook
export function CustomHookExample() {
  const { user, isAdmin, canEdit, logout } = useCustomAuthHook();

  return (
    <div>
      {user && <p>Hello, {user.name}</p>}
      {isAdmin && <button>Admin Panel</button>}
      {canEdit && <button>Edit Content</button>}
      <button onClick={() => logout.mutate()}>Logout</button>
    </div>
  );
}

// ===========================
// Example 10: Route Guard Hook
// ===========================
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useRequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}

// Usage in a component
export function ProtectedPageExample() {
  const isAuthenticated = useRequireAuth();

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  );
}
