import { DashboardLayout } from '../../components/layout';
import { ProtectedRoute, useUser } from '../../features/auth';

export const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

const DashboardContent = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">This is a protected page. Only authenticated users can see this.</p>

          <div className="mt-6 space-y-2">
            <p><strong>Your ID:</strong> {user?.id}</p>
            <p><strong>Your Email:</strong> {user?.email}</p>
            <p><strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
