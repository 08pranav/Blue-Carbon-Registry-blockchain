import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Leaf,
  DollarSign,
  FileText,
  Search,
  Filter,
  TrendingUp,
  Download,
  RefreshCw,
  Bell,
  GitBranch,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description: string;
  ecosystem: string;
  location: string;
  area: number;
  carbonEstimate: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  submissionDate: string;
  lastUpdated: string;
  verificationNotes?: string;
  estimatedCompletionDate?: string;
  progress?: number;
  timeline?: Array<{
    date: string;
    status: string;
    notes: string;
    user: string;
  }>;
}

interface ProjectStatusTrackingProps {
  className?: string;
}

export function ProjectStatusTracking({ className }: ProjectStatusTrackingProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.getProjects({ userId: user.id });
      const projectsWithProgress = response.projects.map(project => ({
        ...project,
        progress: getProgressPercentage(project.status),
        timeline: generateTimeline(project),
        estimatedCompletionDate: calculateEstimatedCompletion(project)
      }));
      setProjects(projectsWithProgress);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserProjects();
    setRefreshing(false);
    toast.success('Projects updated');
  };

  const getProgressPercentage = (status: string): number => {
    switch (status) {
      case 'PENDING': return 25;
      case 'UNDER_REVIEW': return 50;
      case 'VERIFIED': return 100;
      case 'REJECTED': return 0;
      default: return 0;
    }
  };

  const generateTimeline = (project: Project) => {
    const timeline = [
      {
        date: project.submissionDate,
        status: 'SUBMITTED',
        notes: 'Project submitted for verification',
        user: 'You'
      }
    ];

    if (project.status === 'UNDER_REVIEW') {
      timeline.push({
        date: project.lastUpdated,
        status: 'UNDER_REVIEW',
        notes: 'Project is being reviewed by verification team',
        user: 'Verification Team'
      });
    }

    if (project.status === 'VERIFIED') {
      timeline.push({
        date: project.lastUpdated,
        status: 'VERIFIED',
        notes: project.verificationNotes || 'Project verified successfully',
        user: 'Auditor'
      });
    }

    if (project.status === 'REJECTED') {
      timeline.push({
        date: project.lastUpdated,
        status: 'REJECTED',
        notes: project.verificationNotes || 'Project rejected - see notes',
        user: 'Auditor'
      });
    }

    return timeline;
  };

  const calculateEstimatedCompletion = (project: Project): string => {
    if (project.status === 'VERIFIED' || project.status === 'REJECTED') {
      return 'Completed';
    }
    
    const submissionDate = new Date(project.submissionDate);
    const estimatedDays = project.status === 'PENDING' ? 14 : 7; // 2 weeks for pending, 1 week for under review
    const estimatedDate = new Date(submissionDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
    
    return estimatedDate.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'UNDER_REVIEW': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'VERIFIED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'default';
      case 'UNDER_REVIEW': return 'secondary';
      case 'VERIFIED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Awaiting initial review';
      case 'UNDER_REVIEW': return 'Under detailed verification';
      case 'VERIFIED': return 'Successfully verified';
      case 'REJECTED': return 'Verification failed';
      default: return 'Status unknown';
    }
  };

  const filteredProjects = projects.filter(project => {
    const name = (project as any).name ?? (project as any).title ?? '';
    const location = (project as any).location ?? '';
    const status = (project as any).status ?? '';

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(status).toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!user || user.role !== 'NGO') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Project status tracking is only available for NGO users.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Status Tracking</h2>
          <p className="text-gray-600">Monitor the verification progress of your submitted projects</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.PENDING || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold">{statusCounts.VERIFIED || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Carbon Credits</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + (p.carbonEstimate || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'pending', 'under_review', 'verified', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {getStatusIcon(project.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {project.area} hectares
                          </div>
                          <div className="flex items-center gap-1">
                            <Leaf className="h-4 w-4" />
                            {(project.carbonEstimate || 0).toLocaleString()} tCO₂
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Submitted {new Date(project.submissionDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {getStatusMessage(project.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Verification Progress</span>
                        <span className="text-sm text-gray-500">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Estimated Completion */}
                    {project.status === 'PENDING' || project.status === 'UNDER_REVIEW' ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Estimated completion: {project.estimatedCompletionDate}</span>
                      </div>
                    ) : null}

                    {/* Verification Notes */}
                    {project.verificationNotes && (
                      <Alert className="mt-4">
                        <MessageSquare className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Verification Notes:</strong> {project.verificationNotes}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No projects match your current filters.'
                    : "You haven't submitted any projects yet."}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button variant="outline">
                    Submit Your First Project
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Project Detail Modal/Sheet would go here */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
}

// Project Detail Modal Component
interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>Project Timeline and Details</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Project Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p>{project.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Area</p>
              <p>{project.area} hectares</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Carbon Estimate</p>
              <p>{project.carbonEstimate.toLocaleString()} tCO₂</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Project Timeline
            </h4>
            
            <div className="space-y-4">
              {project.timeline?.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    {index < project.timeline!.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{event.status.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{event.notes}</p>
                    <p className="text-xs text-gray-500">by {event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'default';
      case 'UNDER_REVIEW': return 'secondary';
      case 'VERIFIED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  }
}