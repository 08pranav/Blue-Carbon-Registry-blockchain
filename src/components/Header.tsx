import { NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Database, 
  FolderOpen, 
  Upload, 
  Shield, 
  Menu,
  X,
  Waves,
  User,
  LogOut,
  Settings,
  ShoppingCart,
  CheckCircle,
  Building2,
  Users,
  BarChart3,
  Globe,
  Coins,
  RefreshCw,
  Map
} from "lucide-react";
import { useState } from "react";
import { type UserRole, PERMISSIONS, hasPermission, getRoleDisplayName } from "@/lib/permissions";
import { toast } from "sonner";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

// Landing page navigation (public)
const landingNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: Globe },
  { name: "How It Works", href: "/how-it-works", icon: BarChart3 },
  { name: "Public Registry", href: "/registry", icon: Database },
  { name: "Map", href: "/map", icon: Map },
];

// Role-based navigation for authenticated users
const getRoleBasedNavigation = (userRole: UserRole | null) => {
  if (!userRole) return [];
  
  const navigation = [];
  
  // Dashboard - everyone gets a dashboard
  navigation.push({ name: "Dashboard", href: "/dashboard", icon: Home });
  
  // Projects - for those who can submit or view projects
  if (hasPermission(userRole, PERMISSIONS.SUBMIT_PROJECTS) || hasPermission(userRole, PERMISSIONS.VIEW_OWN_PROJECTS)) {
    navigation.push({ name: "My Projects", href: "/projects", icon: FolderOpen });
  }
  
  // Submit - for those who can submit projects
  if (hasPermission(userRole, PERMISSIONS.SUBMIT_PROJECTS)) {
    navigation.push({ name: "Submit Project", href: "/submit", icon: Upload });
  }
  
  // Verification - for verifiers and admins
  if (hasPermission(userRole, PERMISSIONS.VERIFY_DATA)) {
    navigation.push({ name: "Verification", href: "/verification", icon: CheckCircle });
  }
  
  // Marketplace - for buyers and sellers
  if (hasPermission(userRole, PERMISSIONS.VIEW_MARKETPLACE)) {
    navigation.push({ name: "Marketplace", href: "/marketplace", icon: ShoppingCart });
  }
  
  // Registry - public view for everyone
  navigation.push({ name: "Registry", href: "/registry", icon: Database });
  
  // Map - project visualization for everyone
  navigation.push({ name: "Map", href: "/map", icon: Map });
  
  // Analytics - for those with view analytics permission
  if (hasPermission(userRole, PERMISSIONS.VIEW_ANALYTICS)) {
    navigation.push({ name: "Analytics", href: "/analytics", icon: BarChart3 });
  }
  
  // Admin - for admins only
  if (hasPermission(userRole, PERMISSIONS.VIEW_ADMIN_DASHBOARD)) {
    navigation.push({ name: "Admin", href: "/admin", icon: Shield });
  }
  
  return navigation;
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);
  const location = useLocation();
  const { isAuthenticated, user, userRole, logout } = useAuth();

  // Use demo role if set, otherwise use actual user role
  const currentRole = demoRole || userRole;
  
  // Determine navigation items based on authentication status
  const getNavigationItems = () => {
    if (!isAuthenticated) return landingNavigation;
    return getRoleBasedNavigation(currentRole);
  };

  const navigation = getNavigationItems();
  
  // Demo role switcher for testing
  const handleRoleSwitch = (role: UserRole) => {
    setDemoRole(role);
    toast.success(`Switched to ${getRoleDisplayName(role)} role for demo`);
  };
  
  const clearDemoRole = () => {
    setDemoRole(null);
    toast.info('Using actual user role');
  };

  const getRoleLabel = (role: string) => {
    return getRoleDisplayName(role as UserRole);
  };
  
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'AUDITOR': return CheckCircle;
      case 'NGO': return Building2;
      case 'BUYER': return Coins;
      default: return User;
    }
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Blue Carbon Registry
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                             (item.href !== "/" && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Wallet connect */}
          <div className="mr-2 hidden md:block">
            <ConnectWalletButton />
          </div>

          {/* User Menu / Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={demoRole ? "destructive" : "secondary"} className="w-fit">
                        {getRoleLabel(currentRole || user?.role || '')}
                      </Badge>
                      {demoRole && (
                        <Badge variant="outline" className="text-xs">
                          Demo Mode
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Demo Role Switcher */}
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    <span>Demo Role Switcher</span>
                  </div>
                </DropdownMenuLabel>
                
                <div className="grid grid-cols-2 gap-1 p-2">
                  {(['ADMIN', 'AUDITOR', 'NGO', 'BUYER'] as UserRole[]).map((role) => {
                    const RoleIcon = getRoleIcon(role);
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                          currentRole === role ? 'bg-blue-100 text-blue-700' : ''
                        }`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>
                
                {demoRole && (
                  <DropdownMenuItem onClick={clearDemoRole} className="cursor-pointer text-blue-600">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Reset to Real Role</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                {hasPermission(currentRole || 'OBSERVER', PERMISSIONS.VIEW_OWN_PROJECTS) && (
                  <DropdownMenuItem asChild>
                    <Link to="/projects" className="cursor-pointer">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      <span>My Projects</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/auth-demo" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Auth Demo</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="px-4 py-2 space-y-1">
            {/* Navigation Links */}
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                             (item.href !== "/" && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            
            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <div className="text-xs text-gray-500 mb-1">Signed in as</div>
                  <div className="text-sm font-medium">{user?.name}</div>
                  <Badge variant="secondary" className="mt-1">
                    {getRoleLabel(user?.role || '')}
                  </Badge>
                </div>
                <NavLink
                  to="/profile"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <div className="px-3 py-2 space-y-2 border-t border-gray-200 mt-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;