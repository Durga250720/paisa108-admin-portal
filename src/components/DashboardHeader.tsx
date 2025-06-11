
import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // Import the useToast hook
import { Badge } from '@/components/ui/badge';

const DashboardHeader = () => {
  const username = localStorage.getItem('username') || 'Admin User';
  const { toast } = useToast(); // Get the toast function

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
      {/* <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search applications..."
            className="pl-10 pr-4 py-2 w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
      </div> */}

      <div className="flex items-center space-x-4">
        {/* <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          Eligibility Check
        </Button> */}
        
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-color-none bg-gray-50"
            onClick={() => toast({ title: "Feature Coming Soon", description: "Notifications are not yet available.", duration: 3000 })} // Add onClick handler
            title="Notifications" // Add a title for accessibility
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
              3
            </Badge>
          </Button>
        </div>

        <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{username}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
