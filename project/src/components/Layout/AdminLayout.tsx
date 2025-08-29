import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Scissors, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSalon } from '../../contexts/SalonContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { salonConfig } = useSalon();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Calendar },
    { name: 'Profissionais', href: '/admin/professionals', icon: Users },
    { name: 'Serviços', href: '/admin/services', icon: Scissors },
    { name: 'Agendamentos', href: '/admin/appointments', icon: ClipboardList },
    { name: 'Relatórios', href: '/admin/reports', icon: BarChart3 },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
              <h1 className="text-xl font-semibold text-white">Salon Admin</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white shadow-sm">
          <div className="flex items-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-semibold text-white">{salonConfig.name}</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;