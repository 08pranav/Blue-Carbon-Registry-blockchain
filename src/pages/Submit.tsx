import DataUploadForm from "@/components/DataUploadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Camera, 
  Smartphone, 
  Plane,
  Database,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

const Submit = () => {
  const submissionStats = [
    { label: "Projects Submitted", value: "156", icon: FileText },
    { label: "Pending Review", value: "23", icon: Clock },
    { label: "Verified Projects", value: "133", icon: CheckCircle },
    { label: "Total Data Points", value: "8,450", icon: Database }
  ];

  const uploadMethods = [
    {
      title: "Mobile App Integration",
      description: "Connect your field data collection mobile app for automatic uploads",
      icon: Smartphone,
      status: "coming-soon",
      features: ["GPS coordinates", "Photo documentation", "Offline sync", "Real-time validation"]
    },
    {
      title: "Drone Data Upload",
      description: "Upload aerial footage and mapping data from drone surveys",
      icon: Plane,
      status: "coming-soon", 
      features: ["Aerial imagery", "Topographic mapping", "Progress monitoring", "3D modeling"]
    },
    {
      title: "Manual Data Entry",
      description: "Submit project data through web forms with document uploads",
      icon: Upload,
      status: "available",
      features: ["Project registration", "Progress updates", "Document submission", "Media uploads"]
    }
  ];

  const recentSubmissions = [
    {
      id: "SUB-001",
      projectName: "Mangaluru Seagrass Restoration",
      submittedBy: "Marine Conservation Trust",
      date: "2024-09-22",
      status: "pending",
      type: "new-project"
    },
    {
      id: "SUB-002", 
      projectName: "Sundarbans Mangrove Update",
      submittedBy: "Sundarbans Foundation",
      date: "2024-09-20",
      status: "verified",
      type: "progress-update"
    },
    {
      id: "SUB-003",
      projectName: "Kerala Backwater Monitoring",
      submittedBy: "Coastal Guard NGO", 
      date: "2024-09-18",
      status: "reviewing",
      type: "field-data"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "default";
      case "pending": return "secondary";
      case "reviewing": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return CheckCircle;
      case "pending": return Clock;
      case "reviewing": return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Submit Project Data
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload field data, verification documents, and monitoring reports for blue carbon 
              restoration projects. All submissions are validated and stored on blockchain.
            </p>
          </div>

          {/* Submission Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {submissionStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Submission Methods */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Data Submission Methods</h2>
            <p className="mt-2 text-muted-foreground">
              Choose the most convenient way to submit your project data
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {uploadMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className={`relative ${method.status === 'available' ? 'border-primary/50 shadow-lg' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{method.title}</CardTitle>
                          <Badge variant={method.status === 'available' ? 'default' : 'secondary'}>
                            {method.status === 'available' ? 'Available' : 'Coming Soon'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {method.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-4" 
                      variant={method.status === 'available' ? 'default' : 'outline'}
                      disabled={method.status !== 'available'}
                    >
                      {method.status === 'available' ? 'Get Started' : 'Notify When Available'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Upload Form */}
      <section className="py-8">
        <DataUploadForm />
      </section>

      {/* Recent Submissions */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Recent Submissions</h2>
              <p className="mt-2 text-muted-foreground">
                Track the status of recent data submissions and project updates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {recentSubmissions.map((submission) => {
              const StatusIcon = getStatusIcon(submission.status);
              return (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-muted">
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{submission.projectName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Submitted by {submission.submittedBy}</span>
                            <span>•</span>
                            <span>{new Date(submission.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{submission.type.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Submission Guidelines */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Submission Guidelines</h2>
            <p className="mt-2 text-muted-foreground">
              Follow these guidelines to ensure your submissions are processed quickly
            </p>
          </div>

          <Tabs defaultValue="requirements" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="formats">File Formats</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Project Registration</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Project location with GPS coordinates</li>
                      <li>• Total area to be restored (in hectares)</li>
                      <li>• Ecosystem type (mangrove, seagrass, salt marsh)</li>
                      <li>• Organization details and contact information</li>
                      <li>• Project timeline and milestones</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Field Data</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Species planted with scientific names</li>
                      <li>• Planting density and survival rates</li>
                      <li>• Growth measurements and monitoring data</li>
                      <li>• Photographic evidence with timestamps</li>
                      <li>• Water quality and soil condition reports</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="formats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supported File Formats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Documents</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• PDF - Project reports, certificates</li>
                      <li>• DOC/DOCX - Text documents</li>
                      <li>• XLS/XLSX - Data spreadsheets</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Media Files</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• JPG/PNG - Photos (max 10MB each)</li>
                      <li>• MP4 - Videos (max 100MB each)</li>
                      <li>• GeoTIFF - Satellite imagery</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Review Stages</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Initial data validation (automated)</li>
                      <li>• Technical review by NCCR experts</li>
                      <li>• Field verification if required</li>
                      <li>• Final approval and blockchain recording</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Timeline</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Initial review: 3-5 business days</li>
                      <li>• Technical assessment: 1-2 weeks</li>
                      <li>• Field verification: 2-4 weeks (if needed)</li>
                      <li>• Final approval: 1 week after verification</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Submit;