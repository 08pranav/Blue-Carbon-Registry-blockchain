import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  BarChart3,
  FileText,
  Plus,
  CheckCircle,
  ShoppingCart,
  Users,
  Shield,
  User,
  Settings,
  LogOut,
  Leaf,
  MapPin,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { type UserRole, hasPermission, PERMISSIONS, getRoleDisplayName } from '@/lib/permissions';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  permission?: string;
  badge?: string | number;
  subItems?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, userRole, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Role-based menu items
  const getMenuItems = (role: UserRole): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/dashboard'
      },
      {
        id: 'projects',
        label: 'Projects',
        icon: FileText,
        path: '/projects',
        permission: PERMISSIONS.VIEW_OWN_PROJECTS
      }
    ];

    const roleSpecificItems: Record<UserRole, MenuItem[]> = {
      ADMIN: [
        {
          id: 'admin',
          label: 'Admin Panel',
          icon: Shield,
          path: '/admin',
          permission: PERMISSIONS.VIEW_ADMIN_DASHBOARD
        },
        {
          id: 'users',
          label: 'User Management',
          icon: Users,
          path: '/admin/users',
          permission: PERMISSIONS.MANAGE_USERS
        },
        {
          id: 'verifications',
          label: 'Verifications',
          icon: CheckCircle,
          path: '/verification',
          permission: PERMISSIONS.VERIFY_DATA,
          badge: 3 // Mock pending count
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          path: '/analytics',
          permission: PERMISSIONS.VIEW_ANALYTICS
        },
        {
          id: 'marketplace',
          label: 'Marketplace',
          icon: ShoppingCart,
          path: '/marketplace',
          permission: PERMISSIONS.VIEW_MARKETPLACE
        }
      ],
      AUDITOR: [
        {
          id: 'verifications',
          label: 'Verification Queue',
          icon: CheckCircle,
          path: '/verification',
          permission: PERMISSIONS.VERIFY_DATA,
          badge: 3
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          path: '/analytics',
          permission: PERMISSIONS.VIEW_ANALYTICS
        },
        {
          id: 'marketplace',
          label: 'Marketplace',
          icon: ShoppingCart,
          path: '/marketplace',
          permission: PERMISSIONS.VIEW_MARKETPLACE
        }
      ],
      NGO: [
        {
          id: 'submit',
          label: 'Submit Project',
          icon: Plus,
          path: '/submit',
          permission: PERMISSIONS.SUBMIT_PROJECTS
        },
        {
          id: 'marketplace',
          label: 'Marketplace',
          icon: ShoppingCart,
          path: '/marketplace',
          permission: PERMISSIONS.VIEW_MARKETPLACE
        },
        {
          id: 'analytics',
          label: 'My Analytics',
          icon: BarChart3,
          path: '/analytics',
          permission: PERMISSIONS.VIEW_ANALYTICS
        }
      ],
      BUYER: [
        {
          id: 'marketplace',
          label: 'Marketplace',
          icon: ShoppingCart,
          path: '/marketplace',
          permission: PERMISSIONS.VIEW_MARKETPLACE
        },
        {
          id: 'portfolio',
          label: 'My Portfolio',
          icon: Leaf,
          path: '/portfolio',
          permission: PERMISSIONS.BUY_CREDITS
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          path: '/analytics',
          permission: PERMISSIONS.VIEW_ANALYTICS
        }
      ]
    };

    const allItems = [...baseItems];
    
    if (role && roleSpecificItems[role]) {
      allItems.push(...roleSpecificItems[role]);
    }

    // Add common items at the end
    allItems.push(
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        path: '/profile'
      }
    );

    // Filter items based on permissions
    return allItems.filter(item => 
      !item.permission || (role && hasPermission(role, item.permission))
    );
  };

  const menuItems = userRole ? getMenuItems(userRole) : [];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isOpen ? 'w-64' : 'w-0'}
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'lg:w-64' : 'lg:w-16'}
        flex flex-col
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className={`flex items-center space-x-3 ${!isOpen && 'lg:justify-center lg:space-x-0'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-gray-900">Blue Carbon</h1>
                <p className="text-xs text-gray-500">Registry</p>
              </div>
            )}
          </div>
          
          {/* Toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:flex hidden"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Info */}
        {user && isOpen && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {userRole && getRoleDisplayName(userRole)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors duration-200 group relative
                      ${active 
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${!isOpen && 'lg:justify-center lg:px-2'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
                    {isOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant={active ? "default" : "secondary"} 
                            className="ml-2 px-2 py-0.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1 bg-blue-600 px-1 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t">
          {isOpen ? (
            <div className="space-y-1">
              <Link
                to="/auth-demo"
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <Settings className="w-5 h-5 mr-3" />
                Role Demo
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/auth-demo"
                className="flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 group relative"
              >
                <Settings className="w-5 h-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  Role Demo
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-lg text-red-700 hover:bg-red-50 group relative"
              >
                <LogOut className="w-5 h-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  Sign Out
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;