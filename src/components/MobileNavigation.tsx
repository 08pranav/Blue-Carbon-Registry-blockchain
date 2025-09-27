import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  X, 
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
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    roles: ['ADMIN', 'AUDITOR', 'NGO', 'BUYER']
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingCart,
    roles: ['BUYER', 'NGO']
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FileText,
    roles: ['NGO', 'ADMIN', 'AUDITOR']
  },
  {
    title: 'Submit Project',
    href: '/submit',
    icon: Leaf,
    roles: ['NGO']
  },
  {
    title: 'Verification',
    href: '/verification',
    icon: CheckCircle,
    roles: ['AUDITOR', 'ADMIN']
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'AUDITOR']
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Shield,
    roles: ['ADMIN']
  },
  {
    title: 'Users',
    href: '/admin-dashboard',
    icon: Users,
    roles: ['ADMIN']
  }
];

export function MobileNavigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const isActivePath = (href: string) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'AUDITOR': return 'bg-blue-100 text-blue-800';
      case 'NGO': return 'bg-green-100 text-green-800';
      case 'BUYER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-ocean to-nature rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">BlueCarbon</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/api/avatar/${user.id}`} />
              <AvatarFallback className="text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Sheet Header */}
            <SheetHeader className="border-b border-border p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/api/avatar/${user.id}`} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-left truncate">{user.name}</SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-xs", getRoleBadgeColor(user.role))}>
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
              </div>
            </SheetHeader>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-4">
              <div className="space-y-2">
                {filteredItems.map((item) => {
                  const isActive = isActivePath(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer Actions */}
            <div className="border-t border-border p-4 space-y-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>App Settings</span>
              </Link>
              
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start gap-3 px-3 py-2 h-auto text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30">
        <div className="grid grid-cols-5 gap-1">
          {filteredItems.slice(0, 5).map((item) => {
            const isActive = isActivePath(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
                  isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate max-w-full">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding to prevent content from being hidden behind bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}