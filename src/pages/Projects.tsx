import { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Leaf, 
  Camera, 
  FileText, 
  TrendingUp,
  ArrowLeft,
  ExternalLink,
  Download
} from "lucide-react";

const Projects = () => {
  const { id } = useParams();
  
  // Mock data - would come from API in real app
  const projects = [
    {
      id: "1",
      name: "Sundarbans Mangrove Restoration",
      location: "West Bengal, India",
      area: "2,500 hectares",
      organization: "Sundarbans Foundation",
      organizationType: "NGO",
      status: "verified",
      carbonCredits: 125000,
      startDate: "2023-01-15",
      lastUpdated: "2024-09-20",
      progress: 78,
      description: "Large-scale mangrove restoration project in the Sundarbans delta region focusing on climate resilience and biodiversity conservation.",
      species: ["Rhizophora mucronata", "Avicennia marina", "Sonneratia apetala"],
      verifications: [
        { date: "2024-09-20", status: "verified", verifier: "NCCR", credits: 25000 },
        { date: "2024-06-15", status: "verified", verifier: "NCCR", credits: 50000 },
        { date: "2024-03-10", status: "verified", verifier: "NCCR", credits: 50000 }
      ],
      media: [
        { type: "image", url: "/api/placeholder/400/300", caption: "Mangrove seedlings plantation" },
        { type: "drone", url: "/api/placeholder/600/400", caption: "Aerial view of restoration site" },
        { type: "image", url: "/api/placeholder/400/300", caption: "Community involvement" }
      ]
    }
  ];

  const project = id ? projects.find(p => p.id === id) : null;

  if (id && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
          <Button asChild>
            <NavLink to="/projects">Back to Projects</NavLink>
          </Button>
        </div>
      </div>
    );
  }

  if (project) {
    return (
      <div className="min-h-screen">
        {/* Project Header */}
        <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-8 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" asChild>
                <NavLink to="/projects">
                  <ArrowLeft className="h-4 w-4" />
                </NavLink>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <Badge variant={project.status === "verified" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{project.area}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{project.carbonCredits.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{project.progress}%</div>
                  <Progress value={project.progress} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{project.organization}</div>
                  <div className="text-sm text-muted-foreground">{project.organizationType}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Project Details */}
        <section className="py-8 px-4">
          <div className="mx-auto max-w-7xl">
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Species Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.species.map((species, index) => (
                        <Badge key={index} variant="outline">{species}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>Track progress and milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.verifications.map((verification, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <div className="font-medium">Verification Completed</div>
                            <div className="text-sm text-muted-foreground">
                              {verification.credits.toLocaleString()} credits verified by {verification.verifier}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(verification.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {project.media.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-0">
                        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-medium">{item.caption}</p>
                          <Badge variant="outline" className="mt-2">
                            {item.type === "drone" ? "Drone Footage" : "Photo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification History</CardTitle>
                    <CardDescription>Blockchain-verified milestones and carbon credit generation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.verifications.map((verification, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">
                              {verification.credits.toLocaleString()} Carbon Credits Generated
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Verified by {verification.verifier} on {new Date(verification.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View on Blockchain
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Certificate
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    );
  }

  // Projects listing page
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Blue Carbon Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Detailed view of individual restoration projects with progress tracking, 
              verification history, and impact measurements.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant={project.status === "verified" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Area</div>
                        <div className="font-medium">{project.area}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Credits</div>
                        <div className="font-medium">{project.carbonCredits.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>

                    <Button asChild className="w-full">
                      <NavLink to={`/projects/${project.id}`}>
                        View Details
                      </NavLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;