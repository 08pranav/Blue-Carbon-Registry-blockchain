import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth, TEST_ACCOUNTS, UserRole } from '../contexts/RoleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Shield, Building2 } from 'lucide-react';

const RoleIcons = {
  NGO: User,
  AUDITOR: Shield,
  COMPANY: Building2
};

const RoleColors = {
  NGO: 'bg-green-100 text-green-800 border-green-200',
  AUDITOR: 'bg-blue-100 text-blue-800 border-blue-200', 
  COMPANY: 'bg-purple-100 text-purple-800 border-purple-200'
};

const RoleDescriptions = {
  NGO: 'Submit blue carbon projects and manage allocated credits',
  AUDITOR: 'Review and verify NGO projects, allocate carbon credits',
  COMPANY: 'Purchase verified carbon credits from the marketplace'
};

export default function RoleLogin() {
  const { login, authState } = useRoleAuth();
  const navigate = useNavigate();

  const handleRoleLogin = (role: UserRole) => {
    const account = TEST_ACCOUNTS.find(acc => acc.role === role);
    if (account) {
      login(account);
      // Navigate to role-specific dashboard
      switch (role) {
        case 'NGO':
          navigate('/ngo-dashboard');
          break;
        case 'AUDITOR':
          navigate('/auditor-dashboard');
          break;
        case 'COMPANY':
          navigate('/company-dashboard');
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blue Carbon Registry
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your role to access the platform
          </p>
          
          {authState.isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Currently logged in as: <strong>{authState.user?.name}</strong> ({authState.role})
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TEST_ACCOUNTS.map((account) => {
            const Icon = RoleIcons[account.role];
            
            return (
              <Card key={account.role} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <CardTitle className="text-2xl">{account.role}</CardTitle>
                  <CardDescription className="text-sm">
                    {RoleDescriptions[account.role]}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Organization:</span>
                      <Badge className={RoleColors[account.role]}>
                        {account.name}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-gray-600">{account.email}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Wallet:</span>
                      <span className="text-xs font-mono text-gray-500">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleRoleLogin(account.role)}
                    className="w-full"
                    variant={authState.role === account.role ? "default" : "outline"}
                  >
                    {authState.role === account.role ? 'Switch to Dashboard' : `Login as ${account.role}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a demo environment with test accounts for each role.</p>
          <p>In production, users would authenticate with their own wallets.</p>
        </div>
      </div>
    </div>
  );
}