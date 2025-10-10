import React from "react";
import { useRoleAuth, TEST_ACCOUNTS } from "../contexts/RoleAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Shield,
  User,
  Building2,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const AuthDemo = () => {
  const { authState, login, logout } = useRoleAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'NGO':
        return <User className="w-5 h-5 text-green-600" />;
      case 'AUDITOR':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'COMPANY':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'NGO':
        return 'bg-green-100 text-green-800';
      case 'AUDITOR':
        return 'bg-blue-100 text-blue-800';
      case 'COMPANY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blue Carbon Credit System - Authentication Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the complete carbon credit workflow by switching between different user roles. 
            Each role has specific permissions and access to different parts of the system.
          </p>
        </div>

        {/* Current Auth Status */}
        {authState.isAuthenticated ? (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900">Currently Logged In</CardTitle>
                    <CardDescription className="text-green-700">
                      Authenticated as {authState.user?.name}
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {getRoleIcon(authState.role || '')}
                <Badge className={getRoleBadgeColor(authState.role || '')}>
                  {authState.role}
                </Badge>
                <span className="text-sm text-gray-600">
                  {authState.user?.email}
                </span>
                <Button 
                  onClick={() => window.location.href = '/dashboard'} 
                  size="sm"
                  className="ml-auto"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-900">Not Authenticated</CardTitle>
              <CardDescription className="text-yellow-700">
                Please select a demo account to login and explore the system.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Demo Accounts */}
        <div className="grid md:grid-cols-3 gap-6">
          {TEST_ACCOUNTS.map((account) => (
            <Card 
              key={account.role} 
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {getRoleIcon(account.role)}
                  <CardTitle className="text-lg">{account.role} Account</CardTitle>
                </div>
                <Badge className={getRoleBadgeColor(account.role)} variant="secondary">
                  {account.role}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Organization</p>
                    <p className="text-sm text-gray-600">{account.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{account.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Wallet Address</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {account.address.slice(0, 8)}...{account.address.slice(-6)}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => login(account)} 
                  className="w-full"
                  disabled={authState.isAuthenticated && authState.role === account.role}
                >
                  {authState.isAuthenticated && authState.role === account.role 
                    ? 'Currently Active' 
                    : `Login as ${account.role}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">How to Use the Demo</CardTitle>
            <CardDescription>
              Follow these steps to experience the complete carbon credit workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">1. NGO Role</h3>
                <p className="text-sm text-green-700">
                  Submit blue carbon projects, view project status, and receive minted carbon credits
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">2. Auditor Role</h3>
                <p className="text-sm text-blue-700">
                  Review submitted projects, verify eligibility, and mint carbon credits to NGO wallets
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">3. Company Role</h3>
                <p className="text-sm text-purple-700">
                  Browse marketplace, purchase verified carbon credits for ESG compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthDemo;