import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Shield,
  Leaf,
  Database,
  Settings,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for demonstration - will be replaced with API calls
const mockStats = {
  totalUsers: 1247,
  totalProjects: 892,
  pendingVerification: 23,
  verifiedProjects: 756,
  rejectedProjects: 13,
  totalCarbonCredits: 125690,
  activeCredits: 98450,
  retiredCredits: 27240,
  totalRevenue: 2840000,
  monthlyGrowth: 12.5
};

const mockUsers = [
  {
    id: '1',
    name: 'Coastal Conservation NGO',
    email: 'info@coastalconservation.org',
    role: 'NGO',
    organization: 'Coastal Conservation Trust',
    location: 'Kerala, India',
    projectsCount: 15,
    creditsEarned: 12500,
    lastActive: '2024-03-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'ClimateCorp Industries',
    email: 'procurement@climatecorp.com',
    role: 'BUYER',
    organization: 'ClimateCorp Industries',
    location: 'California, USA',
    projectsCount: 0,
    creditsEarned: 0,
    lastActive: '2024-03-14',
    status: 'active'
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    email: 'michael@auditfirm.com',
    role: 'AUDITOR',
    organization: 'Global Audit Partners',
    location: 'Singapore',
    projectsCount: 45,
    creditsEarned: 0,
    lastActive: '2024-03-16',
    status: 'active'
  },
  {
    id: '4',
    name: 'Your Name',
    email: 'you@example.com',
    role: 'NGO',
    organization: 'Your Organization',
    location: 'Your Location',
    projectsCount: 0,
    creditsEarned: 0,
    lastActive: '2024-03-17',
    status: 'active'
  }
];

const mockProjects = [
  {
    id: '1',
    name: 'Sundarbans Mangrove Restoration Phase-II',
    submitter: 'Coastal Conservation NGO',
    ecosystem: 'MANGROVE',
    location: 'West Bengal, India',
    area: 150,
    status: 'PENDING',
    submissionDate: '2024-03-10',
    carbonEstimate: 2500,
    priority: 'HIGH'
  },
  {
    id: '2',
    name: 'Kerala Seagrass Conservation',
    submitter: 'Marine Foundation',
    ecosystem: 'SEAGRASS',
    location: 'Kerala, India',
    area: 75,
    status: 'UNDER_REVIEW',
    submissionDate: '2024-03-08',
    carbonEstimate: 1200,
    priority: 'MEDIUM'
  },
  {
    id: '3',
    name: 'Gujarat Salt Marsh Rehabilitation',
    submitter: 'Coastal Panchayat Gujarat',
    ecosystem: 'SALT_MARSH',
    location: 'Gujarat, India',
    area: 200,
    status: 'VERIFIED',
    submissionDate: '2024-02-28',
    carbonEstimate: 1800,
    priority: 'LOW'
  }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [projects, setProjects] = useState(mockProjects);
  const [stats, setStats] = useState(mockStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Access denied. Admin privileges required.');
      // In real app, redirect to appropriate dashboard
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'default';
      case 'PENDING': return 'secondary';
      case 'UNDER_REVIEW': return 'outline';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'AUDITOR': return 'secondary';
      case 'NGO': return 'default';
      case 'BUYER': return 'outline';
      default: return 'secondary';
    }
  };

  const handleVerifyProject = (projectId: string, decision: 'VERIFIED' | 'REJECTED') => {
    // Update project status
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: decision } : p
    ));
    toast.success(`Project ${decision.toLowerCase()} successfully`);
  };

  const handleUserAction = (userId: string, action: 'approve' | 'suspend' | 'delete') => {
    toast.success(`User ${action} action completed`);
  };

  const handlePromoteToAdmin = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: 'ADMIN' } : u
    ));
    toast.success('User promoted to administrator successfully');
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    toast.success(`User role changed to ${newRole}`);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">NCCR Admin Dashboard</h1>
              <p className="text-blue-100 mt-2">
                Blue Carbon Registry Management & Verification System
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white">
                <Shield className="w-4 h-4 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="credits">Carbon Credits</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-blue-200">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    +{stats.monthlyGrowth}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Total Projects</CardTitle>
                  <FileText className="h-4 w-4 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects.toLocaleString()}</div>
                  <p className="text-xs text-green-200">
                    {stats.verifiedProjects} verified, {stats.pendingVerification} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Carbon Credits</CardTitle>
                  <Leaf className="h-4 w-4 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCarbonCredits.toLocaleString()}</div>
                  <p className="text-xs text-purple-200">
                    {stats.activeCredits.toLocaleString()} active, {stats.retiredCredits.toLocaleString()} retired
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">System Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
                  <p className="text-xs text-amber-200">From carbon credit transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Pending Verifications
                  </CardTitle>
                  <CardDescription>Projects awaiting admin review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.submitter} • {project.location}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={getPriorityColor(project.priority)}>{project.priority}</Badge>
                          <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyProject(project.id, 'VERIFIED')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyProject(project.id, 'REJECTED')}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    System Analytics
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Verification Rate</span>
                      <span className="text-sm text-gray-600">84.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84.2%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">User Engagement</span>
                      <span className="text-sm text-gray-600">92.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92.1%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">System Uptime</span>
                      <span className="text-sm text-gray-600">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Review and manage all blue carbon projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {projects.map(project => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {project.submitter}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {project.location}
                              </div>
                              <div className="flex items-center">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                {project.area} hectares
                              </div>
                              <div className="flex items-center">
                                <Leaf className="w-4 h-4 mr-1" />
                                {project.carbonEstimate.toLocaleString()} tCO2
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                              <Badge variant={getPriorityColor(project.priority)}>{project.priority}</Badge>
                              <Badge variant="outline">{project.ecosystem}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage system users and their permissions</CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Organization:</span> {user.organization}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span> {user.location}
                              </div>
                              <div>
                                <span className="font-medium">Projects:</span> {user.projectsCount}
                              </div>
                              <div>
                                <span className="font-medium">Credits:</span> {user.creditsEarned.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                              <Badge variant="outline">{user.status}</Badge>
                              <span className="text-xs text-gray-500">Last active: {user.lastActive}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {user.role !== 'ADMIN' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePromoteToAdmin(user.id)}
                                className="text-blue-600"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Make Admin
                              </Button>
                            )}
                            <Select onValueChange={(value) => handleChangeRole(user.id, value)}>
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue placeholder="Change Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NGO">NGO</SelectItem>
                                <SelectItem value="AUDITOR">Auditor</SelectItem>
                                <SelectItem value="BUYER">Buyer</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-3 h-3 mr-1" />
                              Suspend
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Carbon Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-green-700">Total Credits Issued</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{stats.totalCarbonCredits.toLocaleString()}</div>
                  <p className="text-sm text-green-600">tCO2 equivalent</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="text-blue-700">Active Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{stats.activeCredits.toLocaleString()}</div>
                  <p className="text-sm text-blue-600">Available for trading</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-slate-50">
                <CardHeader>
                  <CardTitle className="text-gray-700">Retired Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-700">{stats.retiredCredits.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Permanently retired</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Carbon Credit Management</CardTitle>
                <CardDescription>Issue, track, and manage carbon credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Recent credit transactions and issuances</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button>
                      <Leaf className="w-4 h-4 mr-2" />
                      Issue Credits
                    </Button>
                  </div>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Carbon credit management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system parameters and blockchain settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>System configuration interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;