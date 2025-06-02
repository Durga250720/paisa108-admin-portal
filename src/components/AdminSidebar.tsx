
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  CreditCard, 
  HelpCircle,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    title: 'Applications',
    icon: FileText,
    path: '/dashboard/applications'
  },
  {
    title: 'Loan Processing',
    icon: TrendingUp,
    path: '/dashboard/loan-processing'
  },
  {
    title: 'Borrowers',
    icon: Users,
    path: '/dashboard/borrowers'
  },
  {
    title: 'Repayments',
    icon: CreditCard,
    path: '/dashboard/repayments'
  }
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system",
      duration: 3000,
    });
    navigate('/');
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/98681376-d0f7-4c33-a174-f96eefed8acf.png" 
            alt="Paisa108 Logo" 
            className="h-10 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 group",
                isActive 
                  ? "text-white border-l-4 border-[var(--primary-color)]" 
                  : "text-gray-600 hover:text-white hover:bg-[var(--primary-color)]"
              )}
              style={{
                backgroundColor: isActive ? 'var(--primary-color)' : undefined,
              }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                )} />
                <span className="font-medium">{item.title}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => handleMenuClick('/dashboard/settings')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        
        <button
          onClick={() => handleMenuClick('/dashboard/help')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Help</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
