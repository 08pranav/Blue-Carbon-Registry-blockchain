import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SidebarEnhanced } from './SidebarEnhanced';
import Header from './Header';
import { MobileNavigation } from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Don't show sidebar for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNavigation />
        <main className="pb-safe">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <SidebarEnhanced isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
      }`}>
        
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Page title area - can be customized per page */}
          <div className="flex-1 lg:hidden">
            <h1 className="font-semibold text-gray-900">Blue Carbon Registry</h1>
          </div>
          
          {/* Right side controls can go here */}
          <div className="flex items-center space-x-2">
            {/* Optional: notifications, user menu, etc. */}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;