import { Link, Navigate } from 'react-router';
import { RegisterForm, useIsAuthenticated } from '../../features/auth';

export const RegisterPage = () => {
  const isAuthenticated = useIsAuthenticated();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Register</h1>
        <p className="text-gray-600 mb-6 text-center">Create your account</p>

        <RegisterForm />

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
