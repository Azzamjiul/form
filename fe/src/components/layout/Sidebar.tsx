import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useLogout } from '../../features/auth';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Orders', path: '/orders', icon: '📦' },
  { name: 'Products', path: '/products', icon: '🛍️' },
  { name: 'Customers', path: '/customers', icon: '👥' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-64'
        } bg-white shadow-lg min-h-screen transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-gray-800">form</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="text-2xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-red-600 hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''
            }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <span className="text-2xl">🚪</span>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
