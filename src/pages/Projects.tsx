import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  MapPin,
  Calendar,
  Leaf,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

// Mock projects data - will be replaced with API calls
const mockProjects = [
  {
    id: '1',
    title: 'Sundarbans Mangrove Restoration',
    description: 'Large-scale mangrove restoration covering 150 hectares in the Sundarbans region.',
    ecosystem: 'MANGROVE',
    location: 'West Bengal, India',
    area: 150,
    status: 'VERIFIED',
    carbonCreditsEstimated: 2500,
    carbonCreditsIssued: 2500,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Kerala Seagrass Conservation',
    description: 'Seagrass meadow restoration and conservation project along Kerala coast.',
    ecosystem: 'SEAGRASS',
    location: 'Kerala, India',
    area: 75,
    status: 'PENDING',
    carbonCreditsEstimated: 1200,
    carbonCreditsIssued: 0,
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: '3',
    title: 'Gujarat Salt Marsh Rehabilitation',
    description: 'Restoration of degraded salt marsh ecosystems in Gujarat.',
    ecosystem: 'SALT_MARSH',
    location: 'Gujarat, India',
    area: 200,
    status: 'REJECTED',
    carbonCreditsEstimated: 1800,
    carbonCreditsIssued: 0,
    createdAt: '2024-01-05T00:00:00Z',
  }
];

const Projects = () => {
  const { user } = useAuth();
  const [projects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ecosystemFilter, setEcosystemFilter] = useState<string>('all');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesEcosystem = ecosystemFilter === 'all' || project.ecosystem === ecosystemFilter;
    
    return matchesSearch && matchesStatus && matchesEcosystem;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'default';
      case 'PENDING': return 'secondary';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getEcosystemColor = (ecosystem: string) => {
    switch (ecosystem) {
      case 'MANGROVE': return 'bg-green-100 text-green-800';
      case 'SEAGRASS': return 'bg-blue-100 text-blue-800';
      case 'SALT_MARSH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteProject = (id: string) => {
    toast.success('Project deleted successfully');
  };

  const stats = {
    total: projects.length,
    verified: projects.filter(p => p.status === 'VERIFIED').length,
    pending: projects.filter(p => p.status === 'PENDING').length,
    totalCredits: projects.reduce((sum, p) => sum + p.carbonCreditsIssued, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Projects</h1>
              <p className="mt-2 text-blue-100">
                Manage your blue carbon restoration projects
              </p>
            </div>
            <Button className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/submit">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCredits.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Ecosystem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MANGROVE">Mangrove</SelectItem>
                  <SelectItem value="SEAGRASS">Seagrass</SelectItem>
                  <SelectItem value="SALT_MARSH">Salt Marsh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">Start by submitting your first project</p>
              <Button asChild>
                <Link to="/submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                        <Badge className={getEcosystemColor(project.ecosystem)}>
                          {project.ecosystem.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.location}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          {project.area} hectares
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Leaf className="h-4 w-4 mr-1" />
                          {project.carbonCreditsIssued.toLocaleString()} credits
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;