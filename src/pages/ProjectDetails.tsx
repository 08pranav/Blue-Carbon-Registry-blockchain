import { useParams } from 'react-router-dom';
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

// Mock data - will be replaced with API call
const mockProject = {
  id: '1',
  title: 'Sundarbans Mangrove Restoration Project',
  description: 'Large-scale mangrove restoration initiative covering 150 hectares in the Sundarbans region of West Bengal. This project aims to restore degraded mangrove ecosystems, enhance coastal protection, and sequester significant amounts of carbon dioxide.',
  ecosystem: 'MANGROVE',
  location: 'Sundarbans, West Bengal, India',
  coordinates: { latitude: 21.9497, longitude: 88.4297 },
  area: 150,
  status: 'VERIFIED',
  carbonCreditsEstimated: 2500,
  carbonCreditsIssued: 2500,
  createdAt: '2024-01-15T00:00:00Z',
  user: {
    id: '1',
    name: 'Sundarbans Conservation Society',
    organization: 'Environmental NGO',
    role: 'NGO'
  },
  verifier: {
    id: '2',
    name: 'Dr. Priya Sharma',
    organization: 'National Centre for Coastal Research',
    role: 'VERIFIER'
  },
  evidenceFiles: [
    { id: '1', filename: 'site_photos_jan_2024.jpg', originalName: 'Site Photos January 2024', mimeType: 'image/jpeg', size: 5200000 },
    { id: '2', filename: 'species_report.pdf', originalName: 'Species Assessment Report', mimeType: 'application/pdf', size: 1800000 },
    { id: '3', filename: 'monitoring_data.csv', originalName: 'Monthly Monitoring Data', mimeType: 'text/csv', size: 450000 }
  ],
  blockchainTxHash: '0x1234567890abcdef...',
  tokenId: 'BCR-MAN-001'
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // In real implementation, fetch project data based on ID
  const project = mockProject;

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
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {project.user.name}
                </div>
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
                  {project.evidenceFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{file.originalName}</div>
                          <div className="text-sm text-gray-500">
                            {file.mimeType.split('/')[1].toUpperCase()} • {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  <span className="font-semibold capitalize">{project.ecosystem.toLowerCase().replace('_', ' ')}</span>
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