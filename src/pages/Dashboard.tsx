import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield,
  CheckCircle,
  Upload,
  FolderOpen,
  ShoppingCart,
  BarChart3,
  Users,
  Building2,
  Coins,
  Globe,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { type UserRole, hasPermission, PERMISSIONS, getRoleDisplayName, getRoleDescription } from "@/lib/permissions";
import { useEffect } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const location = useLocation();
  
  // Handle access denied notifications
  useEffect(() => {
    if (location.state?.accessDenied) {
      const deniedType = location.state.accessDenied;
      let message = 'Access denied.';
      
      if (deniedType === 'admin') {
        message = 'Administrator privileges required to access that page.';
      } else if (deniedType === 'verifier') {
        message = 'Verifier privileges required to access that page.';
      } else if (deniedType === 'permission') {
        message = 'You don\'t have permission to access that resource.';
      }
      
      toast.error(message);
      
      // Clear the state to prevent repeated toasts
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Mock data - in real app, this would come from API
  const mockStats = {
    ADMIN: {
      totalProjects: 156,
      pendingVerifications: 23,
      totalUsers: 1247,
      systemAlerts: 3
    },
    AUDITOR: {
      pendingVerifications: 23,
      verifiedThisWeek: 15,
      auditedProjects: 89,
      complianceScore: 98.5
    },
    NGO: {
      submittedProjects: 8,
      verifiedProjects: 5,
      earnedCredits: 12750,
      restorationArea: 125 // hectares
    },
    BUYER: {
      purchasedCredits: 25000,
      retiredCredits: 18500,
      portfolioValue: 125000,
      activeOrders: 3
    }
  };

  const getQuickActions = (role: UserRole) => {
    const actions = [];
    
    if (hasPermission(role, PERMISSIONS.SUBMIT_PROJECTS)) {
      actions.push({
        title: 'Submit New Project',
        description: 'Register a new blue carbon restoration project',
        href: '/submit',
        icon: Upload,
        color: 'bg-blue-500 hover:bg-blue-600'
      });
    }
    
    if (hasPermission(role, PERMISSIONS.VIEW_OWN_PROJECTS)) {
      actions.push({
        title: 'View My Projects',
        description: 'Manage and track your submitted projects',
        href: '/projects',
        icon: FolderOpen,
        color: 'bg-green-500 hover:bg-green-600'
      });
    }
    
    if (hasPermission(role, PERMISSIONS.VERIFY_DATA)) {
      actions.push({
        title: 'Verify Projects',
        description: 'Review and approve pending project submissions',
        href: '/verification',
        icon: CheckCircle,
        color: 'bg-purple-500 hover:bg-purple-600'
      });
    }
    
    if (hasPermission(role, PERMISSIONS.VIEW_MARKETPLACE)) {
      actions.push({
        title: 'Browse Marketplace',
        description: 'Buy and sell carbon credits',
        href: '/marketplace',
        icon: ShoppingCart,
        color: 'bg-orange-500 hover:bg-orange-600'
      });
    }
    
    if (hasPermission(role, PERMISSIONS.VIEW_ADMIN_DASHBOARD)) {
      actions.push({
        title: 'Admin Panel',
        description: 'System administration and user management',
        href: '/admin',
        icon: Shield,
        color: 'bg-red-500 hover:bg-red-600'
      });
    }
    
    return actions;
  };

  const getRoleSpecificStats = (role: UserRole) => {
    const stats = mockStats[role];
    if (!stats) return [];
    
    return Object.entries(stats).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: typeof value === 'number' ? value.toLocaleString() : value,
      trend: '+5%' // Mock trend
    }));
  };

  const currentRole = userRole || 'NGO';
  const quickActions = getQuickActions(currentRole);
  const roleStats = getRoleSpecificStats(currentRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                {getRoleDescription(currentRole)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {getRoleDisplayName(currentRole)}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {roleStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common tasks for your role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.href}>
                        <div className={`${action.color} text-white p-6 rounded-lg transition-colors cursor-pointer`}>
                          <div className="flex items-center space-x-3">
                            <Icon className="h-8 w-8" />
                            <div>
                              <h3 className="font-semibold text-lg">{action.title}</h3>
                              <p className="text-sm opacity-90 mt-1">{action.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 ml-auto" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                {quickActions.length === 0 && (
                  <div className="text-center py-8">
                    <Globe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Observer Access</h3>
                    <p className="text-gray-500">
                      You have read-only access to the Blue Carbon Registry system.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/registry">Browse Public Registry</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">New project verification requested</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Carbon credits minted successfully</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">System maintenance scheduled</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Your Role Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Submit Projects</span>
                    {hasPermission(currentRole, PERMISSIONS.SUBMIT_PROJECTS) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Verify Projects</span>
                    {hasPermission(currentRole, PERMISSIONS.VERIFY_DATA) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Buy Credits</span>
                    {hasPermission(currentRole, PERMISSIONS.BUY_CREDITS) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Admin Access</span>
                    {hasPermission(currentRole, PERMISSIONS.VIEW_ADMIN_DASHBOARD) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                  <Link to="/auth-demo">View All Permissions</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;