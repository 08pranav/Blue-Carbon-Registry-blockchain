import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MapPin,
  Calendar,
  Leaf,
  BarChart3,
  FileText,
  Camera,
  Download,
  Search,
  Filter,
  RefreshCw,
  User,
  Building2,
  Globe,
  Award,
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VerificationProject {
  id: string;
  name: string;
  description: string;
  ecosystem: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  area: number;
  carbonEstimate: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  submissionDate: string;
  lastUpdated: string;
  submitter: string;
  submitterOrganization: string;
  evidenceFiles: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  verificationNotes?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reviewDeadline?: string;
  aiDecision?: { status: 'SHORTLIST' | 'HOLD'; reasons: string[] };
  aiReview?: any;
}

interface VerificationStats {
  pendingReview: number;
  underReview: number;
  completedThisMonth: number;
  averageReviewTime: number;
  verificationRate: number;
  totalCarbonVerified: number;
}

interface VerificationDashboardProps {
  className?: string;
}

export function VerificationDashboard({ className }: VerificationDashboardProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<VerificationProject[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<VerificationProject | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationDecision, setVerificationDecision] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPendingVerifications();
      
      // Transform verifications for this view
      const verificationProjects: VerificationProject[] = response.verifications.map((v: any) => ({
        id: v.id,
        name: v.name,
        description: `${v.ecosystemType} restoration project in ${v.location}`,
        ecosystem: v.ecosystemType,
        location: v.location,
        coordinates: v.coordinates,
        area: v.areaSize,
        carbonEstimate: v.estimatedCarbonCapture,
        status: v.status,
        submissionDate: v.submissionTimestamp,
        lastUpdated: v.submissionTimestamp,
        submitter: v.submitter.name,
        submitterOrganization: v.submitter.organization,
        evidenceFiles: v.evidenceFiles || [],
        priority: assignPriority({ carbonEstimate: v.estimatedCarbonCapture, area: v.areaSize }),
        reviewDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        aiDecision: v.aiDecision,
        aiReview: v.aiReview
      }))
      // Shortlisted first
      .sort((a, b) => {
        const aS = a.aiDecision?.status === 'SHORTLIST' ? 0 : 1;
        const bS = b.aiDecision?.status === 'SHORTLIST' ? 0 : 1;
        return aS - bS;
      });

      setProjects(verificationProjects);
      
      // Calculate stats
      const pending = verificationProjects.filter(p => p.status === 'PENDING').length;
      const underReview = verificationProjects.filter(p => p.status === 'UNDER_REVIEW').length;
      const verified = verificationProjects.filter(p => p.status === 'VERIFIED').length;
      const totalCarbon = verificationProjects
        .filter(p => p.status === 'VERIFIED')
        .reduce((sum, p) => sum + (p.carbonEstimate || 0), 0);

      setStats({
        pendingReview: pending,
        underReview,
        completedThisMonth: verified,
        averageReviewTime: 3.2,
        verificationRate: verified / (verified + verificationProjects.filter(p => p.status === 'REJECTED').length) * 100 || 0,
        totalCarbonVerified: totalCarbon
      });

    } catch (error) {
      console.error('Error fetching verification data:', error);
      toast.error('Failed to fetch verification data');
    } finally {
      setLoading(false);
    }
  };

  const assignPriority = (project: any): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (project.carbonEstimate > 2000) return 'HIGH';
    if (project.area > 100) return 'MEDIUM';
    return 'LOW';
  };

  const handleStartReview = async (projectId: string) => {
    try {
      await apiService.updateProjectStatus(projectId, 'UNDER_REVIEW', 'Review started by auditor');
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: 'UNDER_REVIEW', lastUpdated: new Date().toISOString() } : p
      ));
      toast.success('Project review started');
    } catch (error) {
      console.error('Error starting review:', error);
      toast.error('Failed to start review');
    }
  };

  const handleCompleteVerification = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await apiService.updateProjectStatus(
        selectedProject.id, 
        verificationDecision,
        verificationNotes
      );

      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { 
              ...p, 
              status: verificationDecision,
              verificationNotes,
              lastUpdated: new Date().toISOString()
            } 
          : p
      ));

      toast.success(`Project ${(verificationDecision || '').toLowerCase()} successfully`);
      setShowVerificationDialog(false);
      setSelectedProject(null);
      setVerificationNotes('');
      
    } catch (error) {
      console.error('Error completing verification:', error);
      toast.error('Failed to complete verification');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'UNDER_REVIEW': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'VERIFIED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'UNDER_REVIEW': return 'default';
      case 'VERIFIED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      (project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.submitter || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && project.status === 'PENDING') ||
      (statusFilter === 'reviewing' && project.status === 'UNDER_REVIEW') ||
      (statusFilter === 'completed' && (project.status === 'VERIFIED' || project.status === 'REJECTED'));
    
    const matchesPriority = priorityFilter === 'all' || 
      (project.priority || '').toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!user || user.role !== 'AUDITOR') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Verification dashboard is only available for Auditor role.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Verification Dashboard
          </h2>
          <p className="text-gray-600">Review and verify blue carbon restoration projects</p>
        </div>
        
        <Button onClick={fetchVerificationData} variant="outline" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReview}</p>
                  <p className="text-xs text-gray-500">awaiting verification</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
                  <p className="text-xs text-gray-500">in progress</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
                  <p className="text-2xl font-bold text-green-600">{stats.averageReviewTime}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Carbon Verified</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCarbonVerified.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">tCO₂ this month</p>
                </div>
                <Leaf className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects, submitters, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-gray-600">
                No projects match your current search and filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(project.status)}
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      {project.aiDecision && (
                        <Badge className={`text-xs ${project.aiDecision.status === 'SHORTLIST' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          AI: {project.aiDecision.status === 'SHORTLIST' ? 'Shortlist' : 'Hold'}
                        </Badge>
                      )}
                      <Badge variant={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{project.submitter}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{project.submitterOrganization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(project.submissionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {project.aiDecision?.reasons?.length ? (
                      <div className="text-xs text-gray-500 mt-2">{project.aiDecision.reasons.join('; ')}</div>
                    ) : null}
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{project.ecosystem}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                        <span>{project.area} hectares</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-gray-400" />
                        <span>{project.carbonEstimate?.toLocaleString()} tCO₂</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{project.evidenceFiles?.length || 0} files</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      {project.reviewDeadline && project.status === 'PENDING' && (
                        <Badge variant="outline" className="text-orange-600">
                          Due: {new Date(project.reviewDeadline).toLocaleDateString()}
                        </Badge>
                      )}
                      {project.aiDecision && (
                        <Badge variant="outline" className={project.aiDecision.status === 'SHORTLIST' ? 'text-green-700 border-green-200' : 'text-amber-700 border-amber-200'}>
                          AI {project.aiDecision.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowVerificationDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    
                    {project.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartReview(project.id)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Start Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Verification Dialog */}
      {selectedProject && (
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Project Verification
              </DialogTitle>
              <DialogDescription>
                {selectedProject.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Project Overview */}
              <div>
                <h4 className="font-semibold mb-2">Project Overview</h4>
                <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Project Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ecosystem:</span>
                      <span className="font-medium">{selectedProject.ecosystem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Area:</span>
                      <span className="font-medium">{selectedProject.area} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Carbon Estimate:</span>
                      <span className="font-medium text-green-600">
                        {selectedProject.carbonEstimate?.toLocaleString()} tCO₂
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Submission Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitter:</span>
                      <span className="font-medium">{selectedProject.submitter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Organization:</span>
                      <span className="font-medium">{selectedProject.submitterOrganization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted:</span>
                      <span className="font-medium">
                        {new Date(selectedProject.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Evidence Files */}
              <div>
                <h4 className="font-semibold mb-3">Evidence Files</h4>
                <div className="space-y-2">
                  {selectedProject.evidenceFiles?.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  )) || (
                    <p className="text-gray-500">No evidence files available</p>
                  )}
                </div>
              </div>
              
              {/* Location */}
              {selectedProject.coordinates && (
                <div>
                  <h4 className="font-semibold mb-2">Location Coordinates</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Latitude:</span>
                        <span className="font-mono ml-2">{selectedProject.coordinates.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Longitude:</span>
                        <span className="font-mono ml-2">{selectedProject.coordinates.longitude.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Verification Decision */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Verification Decision</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Decision</label>
                    <Select 
                      value={verificationDecision} 
                      onValueChange={(value) => setVerificationDecision(value as 'VERIFIED' | 'REJECTED')}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VERIFIED">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Verify Project
                          </span>
                        </SelectItem>
                        <SelectItem value="REJECTED">
                          <span className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Reject Project
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Verification Notes</label>
                    <Textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder={
                        verificationDecision === 'VERIFIED' 
                          ? "Project meets all MRV requirements and is ready for carbon credit issuance..."
                          : "Please provide detailed reasons for rejection..."
                      }
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowVerificationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteVerification}
                disabled={processing || !verificationNotes.trim()}
                className={verificationDecision === 'VERIFIED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {verificationDecision === 'VERIFIED' ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {verificationDecision === 'VERIFIED' ? 'Verify Project' : 'Reject Project'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}