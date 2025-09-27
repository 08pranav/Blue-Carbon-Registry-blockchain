import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Shield, 
  Users, 
  CheckCircle, 
  Leaf,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Upload,
  Eye,
  CreditCard,
  Globe,
  Database,
  Activity,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
  description?: string;
  isNew?: boolean;
}

const navigationItems: NavigationItem[] = [
  // Main Navigation
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'AUDITOR', 'NGO', 'BUYER'],
    description: 'Overview and quick actions'
  },
  
  // Project Management
  {
    title: 'Submit Project',
    href: '/submit',
    icon: Upload,
    roles: ['NGO'],
    description: 'Submit new restoration project',
    isNew: true
  },
  {
    title: 'My Projects',
    href: '/projects',
    icon: FileText,
    roles: ['NGO', 'ADMIN', 'AUDITOR'],
    description: 'Manage your projects'
  },
  {
    title: 'Project Details',
    href: '/project-details',
    icon: Eye,
    roles: ['ADMIN', 'AUDITOR', 'NGO', 'BUYER'],
    description: 'View project information'
  },
  
  // Verification & Review
  {
    title: 'Verification',
    href: '/verification',
    icon: CheckCircle,
    roles: ['AUDITOR', 'ADMIN'],
    description: 'Review pending projects',
    badge: '3'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'AUDITOR'],
    description: 'System insights and reports'
  },
  
  // Marketplace
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingCart,
    roles: ['BUYER', 'NGO'],
    description: 'Buy/sell carbon credits'
  },
  {
    title: 'Registry',
    href: '/registry',
    icon: Globe,
    roles: ['ADMIN', 'AUDITOR', 'NGO', 'BUYER'],
    description: 'Public carbon registry'
  },
  
  // Administrative
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    roles: ['ADMIN'],
    description: 'System administration'
  },
  {
    title: 'User Management',
    href: '/admin-dashboard',
    icon: Users,
    roles: ['ADMIN'],
    description: 'Manage users and roles'
  },
  {
    title: 'System Stats',
    href: '/admin/stats',
    icon: Database,
    roles: ['ADMIN'],
    description: 'System performance metrics'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarEnhanced({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(!isOpen);
  const [notifications] = useState(5); // Mock notification count

  // Sync with external isOpen state
  useEffect(() => {
    setCollapsed(!isOpen);
  }, [isOpen]);

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const isActivePath = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/') return true;
    if (href === '/') return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'AUDITOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'NGO': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'BUYER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleToggle}
        />
      )}

      <aside 
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-border transition-all duration-300 ease-in-out lg:z-40',
          collapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-64 translate-x-0',
          'lg:static lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">BlueCarbon</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="p-1.5 hover:bg-accent"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className={cn('transition-all', collapsed ? 'h-8 w-8' : 'h-12 w-12')}>
                <AvatarImage src={`/api/avatar/${user.id}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    {notifications > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn('text-xs', getRoleBadgeColor(user.role))}>
                      {user.role}
                    </Badge>
                    {user.isEmailVerified && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {user.organization}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {/* Main Actions */}
              {!collapsed && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Main
                  </p>
                </div>
              )}
              
              {filteredItems.slice(0, 4).map((item) => {
                const isActive = isActivePath(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative',
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <div className="relative">
                      <Icon className={cn(
                        'flex-shrink-0 transition-all',
                        collapsed ? 'h-5 w-5' : 'h-5 w-5',
                        isActive && 'scale-110'
                      )} />
                      {item.isNew && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "default" : "secondary"} 
                              className="ml-auto h-5 px-2 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </Link>
                );
              })}

              {/* Separator for sections */}
              {!collapsed && filteredItems.length > 4 && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {user.role === 'ADMIN' ? 'Administration' : 
                       user.role === 'AUDITOR' ? 'Verification' :
                       user.role === 'BUYER' ? 'Trading' : 'Management'}
                    </p>
                  </div>
                </>
              )}

              {/* Remaining navigation items */}
              {filteredItems.slice(4).map((item) => {
                const isActive = isActivePath(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative',
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      'flex-shrink-0 transition-all',
                      collapsed ? 'h-5 w-5' : 'h-5 w-5',
                      isActive && 'scale-110'
                    )} />
                    
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "default" : "secondary"} 
                              className="ml-auto h-5 px-2 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}

                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-border p-4 space-y-2">
            {/* Settings */}
            <Link
              to="/profile"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Profile Settings' : undefined}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm">Settings</span>}
            </Link>
            
            {/* Logout */}
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                'w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}