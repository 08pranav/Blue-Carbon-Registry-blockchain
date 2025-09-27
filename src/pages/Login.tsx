import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Waves, Eye, EyeOff, Loader2, Shield, CheckCircle, Building2, Users, Coins, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { type UserRole } from '@/lib/permissions';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Demo users for quick testing
  const demoUsers = {
    ADMIN: { email: 'admin@bluecarbon.org', password: 'demo123', name: 'Dr. Rajesh Kumar' },
    AUDITOR: { email: 'auditor@coastal.org', password: 'demo123', name: 'Priya Sharma' },
    NGO: { email: 'ngo@ocean.org', password: 'demo123', name: 'Anjali Patel' },
    BUYER: { email: 'buyer@corp.com', password: 'demo123', name: 'Sarah Johnson' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, simulate login with mock data
      simulateLogin();
    } finally {
      setLoading(false);
    }
  };
  
  const simulateLogin = () => {
    // Mock login for demo - in real app this would be handled by backend
    const mockUser = {
      id: '1',
      name: 'Demo User',
      email: email,
      role: 'NGO' as const,
      organization: 'Demo Organization',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store mock token and user for demo
    localStorage.setItem('auth-token', 'demo-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    toast.success('Demo login successful!');
    navigate(from, { replace: true });
    window.location.reload(); // Refresh to update auth context
  };
  
  const handleDemoLogin = async (role: UserRole) => {
    const demoUser = demoUsers[role];
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    
    setLoading(true);
    
    try {
      // Simulate real login with demo credentials
      await login(demoUser.email, demoUser.password);
      navigate(from, { replace: true });
    } catch (error) {
      // If API login fails, create demo user session
      const mockUser = {
        id: role.toLowerCase(),
        name: demoUser.name,
        email: demoUser.email,
        role: role,
        organization: role === 'ADMIN' ? 'NCCR' : role === 'BUYER' ? 'ClimateCorp' : 'Demo Org',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('auth-token', 'demo-token-' + role + '-' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast.success(`Logged in as ${demoUser.name} (${role})`);
      navigate(from, { replace: true });
      // Force auth context to reload user state
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 mb-4">
            <Waves className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Blue Carbon Registry</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Quick Demo Login */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-blue-900 text-lg">Quick Demo Login</CardTitle>
            <CardDescription className="text-blue-700">
              Test different user roles instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={loading}
                className="flex items-center gap-2 hover:bg-red-50 border-red-200 text-red-700"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('AUDITOR')}
                disabled={loading}
                className="flex items-center gap-2 hover:bg-purple-50 border-purple-200 text-purple-700"
              >
                <CheckCircle className="h-4 w-4" />
                Auditor
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('NGO')}
                disabled={loading}
                className="flex items-center gap-2 hover:bg-green-50 border-green-200 text-green-700"
              >
                <Building2 className="h-4 w-4" />
                NGO
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('BUYER')}
                disabled={loading}
                className="flex items-center gap-2 hover:bg-yellow-50 border-yellow-200 text-yellow-700"
              >
                <Coins className="h-4 w-4" />
                Buyer
              </Button>
            </div>
            
            <div className="text-xs text-blue-600 text-center">
              Click any role to login instantly and test permissions
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;