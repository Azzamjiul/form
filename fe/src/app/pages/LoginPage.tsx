import { Link, Navigate } from 'react-router';
import { LoginForm, useIsAuthenticated } from '../../features/auth';

export const LoginPage = () => {
  const isAuthenticated = useIsAuthenticated();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Login</h1>
        <p className="text-gray-600 mb-6 text-center">Welcome back!</p>

        <LoginForm />

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
