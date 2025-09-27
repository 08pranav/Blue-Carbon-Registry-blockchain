import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, type Verification as VerificationData } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  MapPin, 
  Calendar, 
  Leaf, 
  Download,
  AlertTriangle,
  User,
  Building,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface PendingProject extends VerificationData {
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  methodology?: string;
}

const Verification = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);

  // Fetch pending verifications from backend
  const fetchPendingVerifications = async () => {
    if (!user || (user.role !== 'AUDITOR' && user.role !== 'ADMIN')) {
      return;
    }

    setDataLoading(true);
    setError(null);
    try {
      const response = await apiService.getPendingVerifications();
      const projects = response.verifications.map((verification: VerificationData) => ({
        ...verification,
        priority: 'MEDIUM' as const,
        description: `${verification.ecosystemType} restoration project in ${verification.location}`,
        methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration'
      }));
      setPendingProjects(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending verifications');
      console.error('Error fetching pending verifications:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, [user]);

  const getEcosystemColor = (ecosystem: string) => {
    switch (ecosystem?.toUpperCase()) {
      case 'MANGROVE': return 'bg-green-100 text-green-800';
      case 'SEAGRASS': return 'bg-blue-100 text-blue-800';
      case 'SALT_MARSH': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifyProject = async (projectId: string, decision: 'approve' | 'reject') => {
    if (!verificationNotes.trim()) {
      toast.error('Please add verification notes before proceeding');
      return;
    }

    setLoading(true);
    try {
      const status = decision === 'approve' ? 'VERIFIED' : 'REJECTED';
      await apiService.updateProjectStatus(projectId, status, verificationNotes);
      
      // Remove the project from the pending list
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast.success(`Project ${decision === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedProject(null);
      setVerificationNotes('');
    } catch (error) {
      toast.error('Failed to process verification');
      console.error('Error processing verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPendingVerifications();
  };

  if (!user || (user.role !== 'AUDITOR' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
              <p className="text-gray-600">You need AUDITOR or ADMIN privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Project Verification Dashboard</h1>
              <p className="text-purple-100 mt-2">
                Review and verify blue carbon restoration projects for MRV compliance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={dataLoading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {dataLoading ? '...' : pendingProjects.length}
                </div>
                <div className="text-sm text-purple-200">Pending Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Error State */}
        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Project List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Pending Verifications</span>
                </CardTitle>
                <CardDescription>Click on a project to review details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : pendingProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">No pending verifications</p>
                  </div>
                ) : (
                  pendingProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProject?.id === project.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{project.name}</h3>
                        <Badge className={`text-xs ${getPriorityColor(project.priority || 'MEDIUM')}`}>
                          {project.priority || 'MEDIUM'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{project.submitter.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(project.submissionTimestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <Badge className={`text-xs ${getEcosystemColor(project.ecosystemType)}`}>
                          {project.ecosystemType}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {project.evidenceFiles.length} files
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedProject.name}</CardTitle>
                    <CardDescription>
                      Submitted by {selectedProject.submitter.organization} on{' '}
                      {new Date(selectedProject.submissionTimestamp).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Submitter Details</Label>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{selectedProject.submitter.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{selectedProject.submitter.organization}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedProject.submitter.email}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Project Metrics</Label>
                        <div className="mt-1 space-y-2">
                          <div className="flex justify-between">
                            <span>Area:</span>
                            <span className="font-medium">{selectedProject.areaSize} hectares</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Est. Credits:</span>
                            <span className="font-medium">{selectedProject.estimatedCarbonCapture.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Evidence Files:</span>
                            <span className="font-medium">{selectedProject.evidenceFiles.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">
                              {selectedProject.coordinates.latitude.toFixed(4)}, {selectedProject.coordinates.longitude.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedProject.description && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-500">Project Description</Label>
                        <p className="mt-1 text-sm text-gray-700">{selectedProject.description}</p>
                      </div>
                    )}
                    
                    {selectedProject.methodology && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-500">Methodology</Label>
                        <p className="mt-1 text-sm text-gray-700">{selectedProject.methodology}</p>
                      </div>
                    )}

                    {/* Evidence Files */}
                    {selectedProject.evidenceFiles.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-500">Evidence Files</Label>
                        <div className="mt-2 space-y-2">
                          {selectedProject.evidenceFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => window.open(`${process.env.NODE_ENV === 'production' ? 'https://api.bluecarbon.org' : 'http://localhost:3001'}${file.url}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Verification Action */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Decision</CardTitle>
                    <CardDescription>Add your verification notes and approve or reject this project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Verification Notes *</Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter your detailed verification notes, including any findings, recommendations, or concerns..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your decision will be recorded permanently. Please ensure all evidence has been thoroughly reviewed.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleVerifyProject(selectedProject.id, 'approve')}
                        disabled={loading || !verificationNotes.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve Project
                      </Button>
                      
                      <Button
                        onClick={() => handleVerifyProject(selectedProject.id, 'reject')}
                        disabled={loading || !verificationNotes.trim()}
                        variant="destructive"
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Project to Review</h3>
                  <p className="text-gray-500">
                    Choose a project from the list to view details and make verification decisions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;