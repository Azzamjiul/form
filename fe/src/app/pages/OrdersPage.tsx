import { DashboardLayout } from '../../components/layout';
import { ProtectedRoute } from '../../features/auth';

export const OrdersPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Orders</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Order management will be displayed here.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};
