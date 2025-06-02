
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
    path: '/dashboard',
    badge: null
  },
  {
    title: 'Applications',
    icon: FileText,
    path: '/dashboard/applications',
    badge: '12'
  },
  {
    title: 'Loan Processing',
    icon: TrendingUp,
    path: '/dashboard/loan-processing',
    badge: '8'
  },
  {
    title: 'Borrowers',
    icon: Users,
    path: '/dashboard/borrowers',
    badge: '15'
  },
  {
    title: 'Repayments',
    icon: CreditCard,
    path: '/dashboard/repayments',
    badge: '5'
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
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold text-gray-800">DayLoan</span>
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
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-purple-50 group",
                isActive 
                  ? "bg-purple-100 text-purple-700 border-l-4 border-purple-600" 
                  : "text-gray-600 hover:text-purple-700"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-purple-600" : "text-gray-400 group-hover:text-purple-600"
                )} />
                <span className="font-medium">{item.title}</span>
              </div>
              {item.badge && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
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
