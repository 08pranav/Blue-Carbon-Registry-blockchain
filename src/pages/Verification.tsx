import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  MapPin, 
  Calendar, 
  Leaf, 
  Image, 
  Download,
  AlertTriangle,
  User,
  Building
} from "lucide-react";
import { toast } from "sonner";

interface PendingProject {
  id: string;
  name: string;
  submitter: {
    name: string;
    organization: string;
    email: string;
  };
  ecosystem: string;
  location: string;
  area: number;
  estimatedCredits: number;
  submissionDate: string;
  evidenceCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  methodology: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const Verification = () => {
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for pending verifications
  const pendingProjects: PendingProject[] = [
    {
      id: '1',
      name: 'Sundarbans Mangrove Restoration Phase-II',
      submitter: {
        name: 'Coastal Conservation NGO',
        organization: 'Coastal Conservation Trust',
        email: 'info@coastalconservation.org'
      },
      ecosystem: 'MANGROVE',
      location: 'West Bengal, India',
      area: 150,
      estimatedCredits: 2500,
      submissionDate: '2024-03-10',
      evidenceCount: 8,
      priority: 'HIGH',
      description: 'Large-scale mangrove restoration project in the Sundarbans delta region focusing on climate-resilient species and community engagement.',
      methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
      coordinates: { lat: 21.9497, lng: 88.2636 }
    },
    {
      id: '2',
      name: 'Kerala Seagrass Conservation',
      submitter: {
        name: 'Marine Foundation',
        organization: 'Kerala Marine Conservation Society',
        email: 'marine@kerala.org'
      },
      ecosystem: 'SEAGRASS',
      location: 'Kerala, India',
      area: 75,
      estimatedCredits: 1200,
      submissionDate: '2024-03-08',
      evidenceCount: 5,
      priority: 'MEDIUM',
      description: 'Seagrass meadow restoration project in Kerala backwaters with focus on Zostera marina and Halophila ovalis species.',
      methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
      coordinates: { lat: 9.9312, lng: 76.2673 }
    },
    {
      id: '3',
      name: 'Gujarat Salt Marsh Rehabilitation',
      submitter: {
        name: 'Coastal Panchayat Gujarat',
        organization: 'Gujarat Coastal Development Authority',
        email: 'coastal@gujarat.gov.in'
      },
      ecosystem: 'SALT_MARSH',
      location: 'Gujarat, India',
      area: 200,
      estimatedCredits: 1800,
      submissionDate: '2024-02-28',
      evidenceCount: 12,
      priority: 'LOW',
      description: 'Salt marsh ecosystem rehabilitation project focusing on halophytic vegetation restoration and soil carbon sequestration.',
      methodology: 'AR-AM0014 - Afforestation and Reforestation of Degraded Mangrove Habitats',
      coordinates: { lat: 22.2587, lng: 71.1924 }
    }
  ];

  const getEcosystemColor = (ecosystem: string) => {
    switch (ecosystem) {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Project ${decision === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedProject(null);
      setVerificationNotes('');
    } catch (error) {
      toast.error('Failed to process verification');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="text-right">
              <div className="text-2xl font-bold">{pendingProjects.length}</div>
              <div className="text-sm text-purple-200">Pending Reviews</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
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
                {pendingProjects.map((project) => (
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
                      <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                        {project.priority}
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
                        <span>{new Date(project.submissionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={`text-xs ${getEcosystemColor(project.ecosystem)}`}>
                        {project.ecosystem}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {project.evidenceCount} files
                      </div>
                    </div>
                  </div>
                ))}
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
                      {new Date(selectedProject.submissionDate).toLocaleDateString()}
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
                            <span className="font-medium">{selectedProject.area} hectares</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Est. Credits:</span>
                            <span className="font-medium">{selectedProject.estimatedCredits.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Evidence Files:</span>
                            <span className="font-medium">{selectedProject.evidenceCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Project Description</Label>
                      <p className="mt-1 text-sm text-gray-700">{selectedProject.description}</p>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Methodology</Label>
                      <p className="mt-1 text-sm text-gray-700">{selectedProject.methodology}</p>
                    </div>
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
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Project
                      </Button>
                      
                      <Button
                        onClick={() => handleVerifyProject(selectedProject.id, 'reject')}
                        disabled={loading || !verificationNotes.trim()}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Project
                      </Button>
                      
                      <Button variant="outline" disabled={loading}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Evidence
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