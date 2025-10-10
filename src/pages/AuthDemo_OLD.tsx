import { useState } from "react";
import { useRoleAuth, TEST_ACCOUNTS } from "../contexts/RoleAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  MapPin,
  Coins,
  Globe
} from "lucide-react";
import { 
  type UserRole,
  getUserPermissions,
  getRoleDisplayName,
  getRoleDescription,
  PERMISSIONS
} from "@/lib/permissions";
import { toast } from "sonner";

const AUTH_DEMO_USERS: Record<UserRole, any> = {
  ADMIN: {
    name: "Dr. Rajesh Kumar",
    email: "admin@bluecarbon.gov.in",
    organization: "National Centre for Coastal Research (NCCR)",
    location: "Chennai, Tamil Nadu",
    tokenBalance: 0,
    language: "English",
  },
  AUDITOR: {
    name: "Michael Chen",
    email: "michael@auditfirm.com",
    organization: "Global Audit Partners",
    location: "Singapore",
    tokenBalance: 0,
    language: "English",
  },
  NGO: {
    name: "Anjali Patel",
    email: "anjali@ocean-conservation.org",
    organization: "Ocean Conservation NGO",
    location: "Gujarat, India",
    tokenBalance: 75,
    language: "Gujarati",
  },
  BUYER: {
    name: "Sarah Johnson",
    email: "sarah@climatecorp.com",
    organization: "ClimateCorp Industries",
    location: "California, USA",
    tokenBalance: 500,
    language: "English",
  }
};

const AuthDemo = () => {
  const { user } = useAuth();
  const [demoRole, setDemoRole] = useState<UserRole>(user?.role as UserRole || 'NGO');
  const [demoUser, setDemoUser] = useState(AUTH_DEMO_USERS[demoRole]);

  // Get permissions for current demo role
  const permissions = getUserPermissions(demoRole);
  const allowedPermissions = Object.values(permissions).filter(p => p.allowed);
  const deniedPermissions = Object.values(permissions).filter(p => !p.allowed);

  const handleRoleSwitch = (newRole: string) => {
    const role = newRole as UserRole;
    setDemoRole(role);
    setDemoUser(AUTH_DEMO_USERS[role]);
    toast.success(`Switched to ${getRoleDisplayName(role)} role`);
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'AUDITOR': return 'secondary';
      case 'NGO': return 'default';
      case 'BUYER': return 'outline';
      default: return 'outline';
    }
  };

  const PermissionIcon = getRoleIcon(demoRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <PermissionIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Authentication System Demo
              </h1>
              <p className="text-gray-600">
                Test role-based access control and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Current User Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Current User</span>
                </CardTitle>
                <CardDescription>Active session information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-lg font-semibold">{demoUser.name}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Role</div>
                  <Badge variant={getRoleColor(demoRole)} className="text-sm">
                    {demoRole.toLowerCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Organization</div>
                  <div className="text-sm">{demoUser.organization}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Location</div>
                  <div className="text-sm flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{demoUser.location}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Token Balance</div>
                  <div className="text-sm flex items-center space-x-1">
                    <Coins className="h-3 w-3" />
                    <span>{demoUser.tokenBalance}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Language</div>
                  <div className="text-sm flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span>{demoUser.language}</span>
                  </div>
                </div>

                <Separator />
                
                {/* Role Switcher */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Switch Role</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Test different user permissions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(AUTH_DEMO_USERS).map((role) => (
                      <Button
                        key={role}
                        variant={role === demoRole ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRoleSwitch(role)}
                        className="text-xs"
                      >
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Current Role Permissions</span>
                </CardTitle>
                <CardDescription>Access control matrix</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Role Description */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      {getRoleDisplayName(demoRole)}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {getRoleDescription(demoRole)}
                    </p>
                  </div>

                  {/* Permissions Grid */}
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.values(permissions).map((permission, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                          permission.allowed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {permission.allowed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className={`font-medium text-sm ${
                              permission.allowed ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {permission.action}
                            </div>
                            {permission.description && (
                              <div className={`text-xs ${
                                permission.allowed ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {permission.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={permission.allowed ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {permission.allowed ? 'Allowed' : 'Denied'}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {allowedPermissions.length}
                      </div>
                      <div className="text-sm text-gray-600">Allowed Permissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {deniedPermissions.length}
                      </div>
                      <div className="text-sm text-gray-600">Restricted Permissions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-Based Content Demo */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Role-Based Content</CardTitle>
                <CardDescription>Content visibility based on user role</CardDescription>
              </CardHeader>
              <CardContent>
                {demoRole === 'NGO' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>NGO Content</span>
                    </h3>
                    <p className="text-green-700 text-sm">
                      This content is only visible to NGO workers. You have access to project 
                      submission tools, your project dashboard, and marketplace selling features.
                    </p>
                  </div>
                )}
                
                {demoRole === 'ADMIN' && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Administrator Content</span>
                    </h3>
                    <p className="text-red-700 text-sm">
                      Full administrative access. You can manage users, approve projects, 
                      mint credits, and access all system functions.
                    </p>
                  </div>
                )}
                
                {demoRole === 'BUYER' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                      <Coins className="h-5 w-5" />
                      <span>Buyer Content</span>
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Carbon credit marketplace access. You can browse, purchase, and retire 
                      carbon credits for your organization's sustainability goals.
                    </p>
                  </div>
                )}
                
                {demoRole === 'AUDITOR' && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Auditor Content</span>
                    </h3>
                    <p className="text-purple-700 text-sm">
                      Project verification and audit dashboard. Review submitted projects, validate evidence, 
                      verify compliance, and generate audit reports with full data access.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDemo;