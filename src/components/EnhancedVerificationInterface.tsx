import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  MapPin,
  Calendar,
  Leaf,
  BarChart3,
  FileText,
  Camera,
  Download,
  ZoomIn,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  User,
  Building,
  Globe,
  Target,
  TrendingUp,
  Shield,
  Search,
  Filter,
  ExternalLink,
  Map,
  ImageIcon,
  FileImage
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Project {
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
  verificationNotes?: string;
  images?: Array<{
    id: string;
    url: string;
    type: 'before' | 'during' | 'current';
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }>;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  methodology?: string;
  timeline?: string;
  species?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface VerificationDecision {
  projectId: string;
  decision: 'VERIFIED' | 'REJECTED' | 'NEEDS_MORE_INFO';
  notes: string;
  rating: number;
  criteria: {
    locationAccuracy: number;
    documentationQuality: number;
    methodologyValid: number;
    carbonEstimateRealistic: number;
    overallAssessment: number;
  };
}

interface EnhancedVerificationProps {
  className?: string;
}

export function EnhancedVerificationInterface({ className }: EnhancedVerificationProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [verificationDecision, setVerificationDecision] = useState<VerificationDecision>({
    projectId: '',
    decision: 'VERIFIED',
    notes: '',
    rating: 5,
    criteria: {
      locationAccuracy: 5,
      documentationQuality: 5,
      methodologyValid: 5,
      carbonEstimateRealistic: 5,
      overallAssessment: 5
    }
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingProjects();
  }, [user]);

  const fetchPendingProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.getProjects();
      const projectsWithPriority = response.projects.map(project => ({
        ...project,
        priority: assignPriority(project),
        images: generateMockImages(project),
        documents: generateMockDocuments(project)
      }));
      setProjects(projectsWithPriority);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects for verification');
    } finally {
      setLoading(false);
    }
  };

  const assignPriority = (project: Project): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (project.carbonEstimate > 2000) return 'HIGH';
    if (project.area > 100) return 'MEDIUM';
    return 'LOW';
  };

  const generateMockImages = (project: Project) => [
    {
      id: '1',
      url: '/api/placeholder/400/300',
      type: 'before' as const,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: project.coordinates
    },
    {
      id: '2',
      url: '/api/placeholder/400/300',
      type: 'current' as const,
      timestamp: new Date().toISOString(),
      location: project.coordinates
    }
  ];

  const generateMockDocuments = (project: Project) => [
    {
      id: '1',
      name: 'Environmental Impact Assessment.pdf',
      url: '#',
      type: 'pdf'
    },
    {
      id: '2',
      name: 'Project Methodology Report.docx',
      url: '#',
      type: 'document'
    }
  ];

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // Mark as under review if it's pending
    if (project.status === 'PENDING') {
      updateProjectStatus(project.id, 'UNDER_REVIEW');
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      await apiService.updateProjectStatus(projectId, status as any);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: status as any } : p
      ));
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleVerificationDecision = (decision: 'VERIFIED' | 'REJECTED' | 'NEEDS_MORE_INFO') => {
    if (!selectedProject) return;
    
    setVerificationDecision({
      ...verificationDecision,
      projectId: selectedProject.id,
      decision
    });
    setShowDecisionDialog(true);
  };

  const submitVerificationDecision = async () => {
    if (!selectedProject) return;

    try {
      await apiService.updateProjectStatus(
        selectedProject.id, 
        verificationDecision.decision === 'NEEDS_MORE_INFO' ? 'PENDING' : verificationDecision.decision,
        verificationDecision.notes
      );

      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { 
              ...p, 
              status: verificationDecision.decision === 'NEEDS_MORE_INFO' ? 'PENDING' : verificationDecision.decision,
              verificationNotes: verificationDecision.notes 
            } 
          : p
      ));

      toast.success(`Project ${verificationDecision.decision.toLowerCase()} successfully`);
      setShowDecisionDialog(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error submitting verification decision:', error);
      toast.error('Failed to submit verification decision');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'secondary';
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

  const calculateCredibilityScore = (project: Project): number => {
    let score = 50; // Base score
    
    // Add points for documentation
    if (project.images && project.images.length > 1) score += 20;
    if (project.documents && project.documents.length > 0) score += 15;
    if (project.methodology) score += 10;
    if (project.coordinates) score += 5;
    
    return Math.min(score, 100);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.submitter || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && project.status === 'PENDING') ||
                         (statusFilter === 'under_review' && project.status === 'UNDER_REVIEW') ||
                         (statusFilter === 'completed' && (project.status === 'VERIFIED' || project.status === 'REJECTED'));
    
    const matchesPriority = priorityFilter === 'all' || project.priority?.toLowerCase?.() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'AUDITOR')) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Enhanced verification interface is only available for Admin and Auditor roles.
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
            <Shield className="h-6 w-6 text-blue-600" />
            Enhanced Project Verification
          </h2>
          <p className="text-gray-600">Comprehensive review and verification of submitted blue carbon projects</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredProjects.length} Projects
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, submitters, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Projects for Verification</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
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
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-l-4",
                    selectedProject?.id === project.id ? "ring-2 ring-blue-500 bg-blue-50" : "",
                    project.priority === 'HIGH' ? "border-l-red-500" : 
                    project.priority === 'MEDIUM' ? "border-l-orange-500" : "border-l-gray-300"
                  )}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <h4 className="font-semibold">{project.name}</h4>
                      </div>
                      <Badge variant={getPriorityColor(project.priority || 'LOW')}>
                        {project.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{project.submitter} • {project.submitterOrganization}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{project.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>{project.area} ha</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Leaf className="h-4 w-4" />
                          <span>{(project.carbonCreditsEstimated || project.carbonEstimate || 0).toLocaleString()} tCO₂</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{calculateCredibilityScore(project)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProjects.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                    <p className="text-gray-600">
                      No projects match your current search and filter criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          {selectedProject ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Project Review</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerificationDecision('NEEDS_MORE_INFO')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Need Info
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerificationDecision('REJECTED')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleVerificationDecision('VERIFIED')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedProject.status)}
                      {selectedProject.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(selectedProject.priority || 'LOW')}>
                        {selectedProject.priority}
                      </Badge>
                      <Badge variant="outline">
                        Credibility: {calculateCredibilityScore(selectedProject)}%
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{selectedProject.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="details" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="media">Media</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Submitter</Label>
                          <p className="font-medium">{selectedProject.submitter}</p>
                          <p className="text-sm text-gray-600">{selectedProject.submitterOrganization}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Ecosystem Type</Label>
                          <p className="font-medium">{selectedProject.ecosystem}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Project Area</Label>
                          <p className="font-medium">{selectedProject.area} hectares</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Carbon Estimate</Label>
                          <p className="font-medium">{(selectedProject.carbonCreditsEstimated || selectedProject.carbonEstimate || 0).toLocaleString()} tCO₂</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Submission Date</Label>
                          <p className="font-medium">{new Date(selectedProject.submissionDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                          <p className="font-medium">{new Date(selectedProject.lastUpdated).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {selectedProject.methodology && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Methodology</Label>
                          <p className="font-medium">{selectedProject.methodology}</p>
                        </div>
                      )}

                      {selectedProject.verificationNotes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Previous Notes</Label>
                          <Alert>
                            <MessageSquare className="h-4 w-4" />
                            <AlertDescription>{selectedProject.verificationNotes}</AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="location" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Project Location</Label>
                        <p className="font-medium mb-4">{selectedProject.location}</p>
                        
                        {selectedProject.coordinates ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Latitude</Label>
                                <p className="font-mono">{selectedProject.coordinates.latitude.toFixed(6)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Longitude</Label>
                                <p className="font-mono">{selectedProject.coordinates.longitude.toFixed(6)}</p>
                              </div>
                            </div>
                            
                            <div className="bg-gray-100 p-4 rounded-lg text-center">
                              <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Interactive map would be displayed here</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on Google Maps
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>No GPS coordinates provided</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="media" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Project Images</Label>
                        {selectedProject.images && selectedProject.images.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            {selectedProject.images.map((image) => (
                              <div key={image.id} className="relative">
                                <div 
                                  className="aspect-video bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center"
                                  onClick={() => setSelectedImage(image.url)}
                                >
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <Badge 
                                  variant="secondary" 
                                  className="absolute top-2 left-2 text-xs"
                                >
                                  {image.type}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(image.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Alert className="mt-2">
                            <Camera className="h-4 w-4" />
                            <AlertDescription>No images uploaded for this project</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Supporting Documents</Label>
                        {selectedProject.documents && selectedProject.documents.length > 0 ? (
                          <div className="space-y-2 mt-2">
                            {selectedProject.documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-blue-500" />
                                  <span className="font-medium">{doc.name}</span>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Alert className="mt-2">
                            <FileText className="h-4 w-4" />
                            <AlertDescription>No documents uploaded for this project</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                <p className="text-gray-600">
                  Choose a project from the list to begin the verification process.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Verification Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {verificationDecision.decision === 'VERIFIED' ? 'Verify Project' :
               verificationDecision.decision === 'REJECTED' ? 'Reject Project' :
               'Request More Information'}
            </DialogTitle>
            <DialogDescription>
              {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Verification Notes</Label>
              <Textarea
                value={verificationDecision.notes}
                onChange={(e) => setVerificationDecision(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={
                  verificationDecision.decision === 'VERIFIED' 
                    ? "Add any verification notes or conditions..."
                    : verificationDecision.decision === 'REJECTED'
                    ? "Explain the reasons for rejection..."
                    : "Specify what additional information is needed..."
                }
                className="min-h-[100px]"
              />
            </div>

            {verificationDecision.decision === 'VERIFIED' && (
              <div>
                <Label>Overall Rating (1-10)</Label>
                <Select 
                  value={verificationDecision.rating.toString()} 
                  onValueChange={(value) => setVerificationDecision(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} {i + 1 <= 3 ? '(Poor)' : i + 1 <= 6 ? '(Fair)' : i + 1 <= 8 ? '(Good)' : '(Excellent)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitVerificationDecision}
              className={
                verificationDecision.decision === 'VERIFIED' ? 'bg-green-600 hover:bg-green-700' :
                verificationDecision.decision === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {verificationDecision.decision === 'VERIFIED' ? 'Verify Project' :
               verificationDecision.decision === 'REJECTED' ? 'Reject Project' :
               'Request Information'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Project Image</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <div className="bg-gray-200 rounded-lg w-full aspect-video flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400" />
                <span className="ml-2 text-gray-500">Image preview would be displayed here</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}