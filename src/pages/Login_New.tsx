import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleAuth, TEST_ACCOUNTS } from '../contexts/RoleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Waves, User, Shield, Building2 } from 'lucide-react';

const Login = () => {
  const { authState, login } = useRoleAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = (account: any) => {
    login(account);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'NGO':
        return <User className="w-8 h-8 text-green-600" />;
      case 'AUDITOR':
        return <Shield className="w-8 h-8 text-blue-600" />;
      case 'COMPANY':
        return <Building2 className="w-8 h-8 text-purple-600" />;
      default:
        return <User className="w-8 h-8" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'NGO':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'AUDITOR':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'COMPANY':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'NGO':
        return 'Submit blue carbon projects and receive carbon credits';
      case 'AUDITOR':
        return 'Review and verify NGO projects, mint carbon credits';
      case 'COMPANY':
        return 'Purchase verified carbon credits for offsetting';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blue Carbon Credit System</h1>
              <p className="text-gray-600">Blockchain-Based Carbon Credit Trading Platform</p>
            </div>
          </div>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TEST_ACCOUNTS.map((account) => (
            <Card
              key={account.role}
              className={`cursor-pointer transition-all duration-200 ${getRoleColor(account.role)} ${
                selectedRole === account.role ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
              onClick={() => setSelectedRole(account.role)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {getRoleIcon(account.role)}
                </div>
                <CardTitle className="text-xl text-gray-900">
                  {account.role} Login
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {getRoleDescription(account.role)}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-gray-700">Organization:</strong>
                    <p className="text-gray-600">{account.name}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Email:</strong>
                    <p className="text-gray-600">{account.email}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Wallet:</strong>
                    <p className="text-xs text-gray-500 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleLogin(account)}
                  className="w-full mt-4"
                  variant={selectedRole === account.role ? "default" : "outline"}
                >
                  Login as {account.role}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-center text-gray-900">
              🎯 Demo Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 bg-green-100 text-green-800">
                  Step 1: NGO
                </Badge>
                <p className="text-gray-600">
                  Login as NGO → Submit blue carbon project → Wait for auditor approval
                </p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-800">
                  Step 2: Auditor
                </Badge>
                <p className="text-gray-600">
                  Login as Auditor → Review project → Approve and mint carbon credits
                </p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 bg-purple-100 text-purple-800">
                  Step 3: Company
                </Badge>
                <p className="text-gray-600">
                  Login as Company → Browse marketplace → Purchase carbon credits
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>🔗 Blockchain Integration:</strong> This system uses real Sepolia testnet transactions. 
                Each role corresponds to a fixed MetaMask wallet address for seamless blockchain interaction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;