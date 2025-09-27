import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Leaf, 
  Users, 
  BarChart3, 
  FileText, 
  Shield, 
  ExternalLink,
  Download,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { apiService, type Project } from '@/services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const ProjectDetails = () => {
  const { id: urlId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = urlId || queryId; // Use URL param first, then query param
  
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }
      
      console.log('Loading project with ID:', id);
      setLoading(true);
      setError(null);
      
      try {
        const data = await apiService.getProject(id);
        console.log('API response:', data);
        
        // apiService.getProject returns Project; backend /api/projects/:id returns project object
        // Normalize possible shape differences
        const p: any = (data as any).project || data;
        
        if (!p) {
          throw new Error('Project data is empty');
        }
        
        setProject(p);
      } catch (e: any) {
        console.error('Error loading project:', e);
        setError(e?.message || 'Failed to load project');
        
        // If API fails, try to use mock data for demo
        const mockProject = {
          id: id,
          title: 'Sample Blue Carbon Project',
          name: 'Sample Blue Carbon Project',
          description: 'This is a sample project for demonstration purposes.',
          ecosystem: 'MANGROVE',
          location: 'Sundarbans, West Bengal, India',
          area: 25.5,
          status: 'VERIFIED',
          carbonCreditsEstimated: 150,
          carbonCreditsIssued: 125,
          submissionDate: '2024-01-15',
          evidenceFiles: [
            {
              id: '1',
              name: 'Site_Photo.jpg',
              url: '/api/placeholder/400/300',
              type: 'image/jpeg',
              size: 2048576
            }
          ],
          user: {
            name: 'Green Earth NGO',
            organization: 'Environmental Protection Society'
          }
        };
        setProject(mockProject);
        setError(null); // Clear error since we're using mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEcosystemIcon = (ecosystem: string) => {
    return <Leaf className="h-5 w-5 text-green-600" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading project…</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert>
          <AlertDescription>{error || 'Project not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const submittedAt = project.submissionDate || project.createdAt;
  const evidence = project.evidenceFiles || [];

  const handleReRunAi = async () => {
    if (!project?.id) return;
    try {
      setAiLoading(true);
      const { aiReview } = await apiService.getAiReview(project.id);
      setProject((prev: any) => ({ ...(prev || {}), aiReview }));
      toast.success(`AI review: ${aiReview.status}`);
    } catch (err: any) {
      console.error('AI review failed', err);
      toast.error(err?.message || 'Failed to re-run AI review');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {getEcosystemIcon(project.ecosystem)}
                <Badge className={`${getStatusColor(project.status)} border-0`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{project.status}</span>
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  ID: {project.tokenId || project.id}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-3">{project.title}</h1>
              <div className="flex items-center space-x-6 text-green-100">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {submittedAt ? new Date(submittedAt).toLocaleDateString() : '—'}
                </div>
                {project.submitterName && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {project.submitterName}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{project.area}</div>
              <div className="text-green-100">Hectares</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </CardContent>
            </Card>

            {/* Carbon Credits */}
            <Card>
              <CardHeader>
                <CardTitle>Carbon Credit Information</CardTitle>
                <CardDescription>
                  Verified carbon sequestration and credit issuance details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Credits Estimated</span>
                    <span className="font-bold">{project.carbonCreditsEstimated.toLocaleString()} tCO₂</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Credits Issued</span>
                    <span className="font-bold text-green-600">{project.carbonCreditsIssued.toLocaleString()} tCO₂</span>
                  </div>
                  <Progress 
                    value={(project.carbonCreditsIssued / project.carbonCreditsEstimated) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    {Math.round((project.carbonCreditsIssued / project.carbonCreditsEstimated) * 100)}% of estimated credits issued
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Evidence Review */}
            <Card>
              <CardHeader>
                <CardTitle>AI Evidence Review</CardTitle>
                <CardDescription>Automatic checks to assist verification and pre-screening</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm">
                    {project.aiReview ? (
                      <>
                        <span>Status: </span>
                        <span className="font-semibold">{project.aiReview.status}</span>
                        <span className="ml-2 text-gray-500">Score: {project.aiReview.score}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">No AI review data yet.</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReRunAi} disabled={aiLoading}>
                    {aiLoading ? 'Running…' : 'Re-run AI Review'}
                  </Button>
                </div>

                {project.aiReview && (
                  <div className="space-y-2 max-h-56 overflow-auto">
                    {project.aiReview.results.map((r: any, i: number) => (
                      <div key={i} className="text-xs p-2 border rounded">
                        <div className="font-medium">{r.file}</div>
                        {r.ok ? (
                          <div className="text-green-600">Passed</div>
                        ) : (
                          <ul className="list-disc ml-4 text-red-600">
                            {r.issues.map((iss: string, j: number) => <li key={j}>{iss}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence Files */}
            <Card>
              <CardHeader>
                <CardTitle>Supporting Evidence</CardTitle>
                <CardDescription>
                  Documents and files submitted as proof of project activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {evidence.map((file: any) => {
                    const isImg = (file.type || file.mimetype || '').startsWith('image') && file.url;
                    const ext = (file.type || file.mimetype || '').split('/')[1]?.toUpperCase?.() || 'FILE';
                    return (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {isImg ? (
                            <img src={file.url} alt={file.name || file.originalName || file.filename} className="h-12 w-16 object-cover rounded" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{file.name || file.originalName || file.filename}</div>
                            <div className="text-sm text-gray-500">
                              <span className={`px-2 py-0.5 rounded-full border mr-2 ${
                                isImg ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>{ext}</span>
                              {file.size ? formatFileSize(file.size) : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {file.url && (
                            <a href={file.url} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </a>
                          )}
                          {file.url && (
                            <a href={file.url} download>
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Area</span>
                  <span className="font-semibold">{project.area} ha</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ecosystem Type</span>
                  <span className="font-semibold capitalize">{(project.ecosystem || '').toLowerCase().replace('_', ' ')}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Carbon/Hectare</span>
                  <span className="font-semibold">{Math.round(project.carbonCreditsIssued / project.area)} tCO₂</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Evidence Files</span>
                  <span className="font-semibold">{project.evidenceFiles.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Project Team */}
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">Project Lead</div>
                  <div className="text-sm text-gray-600">{project.user.name}</div>
                  <div className="text-xs text-gray-500">{project.user.organization}</div>
                </div>
                {project.verifier && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium flex items-center">
                        <Shield className="h-3 w-3 mr-1 text-blue-600" />
                        Verified By
                      </div>
                      <div className="text-sm text-gray-600">{project.verifier.name}</div>
                      <div className="text-xs text-gray-500">{project.verifier.organization}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Information */}
            {project.blockchainTxHash && (
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Token ID</div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                      {project.tokenId}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Transaction Hash</div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                      {project.blockchainTxHash}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Explorer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Share Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;