import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Code, 
  FileText, 
  HelpCircle, 
  Download,
  ExternalLink,
  Search,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/projects",
      description: "Retrieve all registered blue carbon projects",
      parameters: ["status", "location", "limit", "offset"]
    },
    {
      method: "POST", 
      endpoint: "/api/projects",
      description: "Register a new blue carbon restoration project",
      parameters: ["name", "location", "area", "organization"]
    },
    {
      method: "GET",
      endpoint: "/api/projects/{id}",
      description: "Get detailed information about a specific project",
      parameters: ["id"]
    },
    {
      method: "POST",
      endpoint: "/api/verification",
      description: "Submit project data for verification",
      parameters: ["projectId", "dataType", "documents"]
    },
    {
      method: "GET",
      endpoint: "/api/credits",
      description: "Retrieve carbon credit information and marketplace data",
      parameters: ["projectId", "status", "vintage"]
    }
  ];

  const mrvSteps = [
    {
      title: "1. Project Registration",
      description: "Register your blue carbon restoration project with basic information",
      requirements: ["Project location and boundaries", "Ecosystem type identification", "Baseline measurements", "Restoration plan"],
      timeframe: "1-2 weeks"
    },
    {
      title: "2. Data Collection",
      description: "Systematic monitoring and data collection throughout the project lifecycle",
      requirements: ["Regular field surveys", "Species monitoring", "Growth measurements", "Photographic documentation"],
      timeframe: "Ongoing"
    },
    {
      title: "3. Verification Process", 
      description: "Independent verification of collected data and restoration progress",
      requirements: ["Third-party verification", "Field validation", "Document review", "Compliance check"],
      timeframe: "2-4 weeks"
    },
    {
      title: "4. Credit Generation",
      description: "Calculation and tokenization of verified carbon credits on blockchain",
      requirements: ["Carbon calculation", "Blockchain recording", "Credit tokenization", "Registry update"],
      timeframe: "1 week"
    }
  ];

  const faqs = [
    {
      question: "What is blue carbon and why is it important?",
      answer: "Blue carbon refers to the carbon captured by marine and coastal ecosystems like mangroves, seagrass beds, and salt marshes. These ecosystems are among the most carbon-rich on Earth and play a crucial role in climate change mitigation."
    },
    {
      question: "How does the blockchain verification work?",
      answer: "All project data, verification records, and carbon credits are stored on a blockchain network, ensuring transparency, immutability, and traceability. This prevents double counting and provides instant verification of carbon credit authenticity."
    },
    {
      question: "Who can participate in the blue carbon registry?",
      answer: "NGOs, community organizations, coastal panchayats, government agencies, and private entities involved in blue carbon restoration can participate. All participants must go through a verification process."
    },
    {
      question: "How are carbon credits calculated?",
      answer: "Carbon credits are calculated based on the verified carbon sequestration capacity of the restored ecosystem, using internationally recognized methodologies and regular monitoring data."
    },
    {
      question: "What data needs to be submitted for verification?",
      answer: "Required data includes project location, species information, planting records, growth measurements, survival rates, monitoring reports, and photographic evidence with GPS coordinates and timestamps."
    }
  ];

  const integrationGuides = [
    {
      title: "Mobile App Integration",
      description: "Connect your field data collection mobile application",
      status: "coming-soon",
      features: ["Real-time data sync", "Offline capability", "GPS integration"]
    },
    {
      title: "Drone Data Integration",
      description: "Integrate aerial survey data and drone footage",
      status: "coming-soon", 
      features: ["Automated image processing", "Progress tracking", "3D mapping"]
    },
    {
      title: "IoT Sensor Networks",
      description: "Connect environmental monitoring sensors",
      status: "coming-soon",
      features: ["Water quality monitoring", "Growth sensors", "Climate data"]
    },
    {
      title: "Satellite Data Integration",
      description: "Incorporate satellite imagery for large-scale monitoring",
      status: "planned",
      features: ["Change detection", "Area calculations", "Temporal analysis"]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "secondary";
      case "POST": return "default";
      case "PUT": return "outline"; 
      case "DELETE": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "default";
      case "coming-soon": return "secondary";
      case "planned": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">
                Documentation
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete documentation for the Blue Carbon Registry & MRV System. 
              Learn how to integrate, submit data, and use the API.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Code className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">API Reference</h3>
                <p className="text-sm text-muted-foreground">Complete API documentation and endpoints</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">MRV Guide</h3>
                <p className="text-sm text-muted-foreground">Monitoring, Reporting & Verification methodology</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Integration</h3>
                <p className="text-sm text-muted-foreground">Connect your apps and systems</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">FAQ & Support</h3>
                <p className="text-sm text-muted-foreground">Common questions and help resources</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="api" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api">API Reference</TabsTrigger>
              <TabsTrigger value="mrv">MRV Methodology</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="faq">FAQ & Support</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>
                    RESTful API endpoints for the Blue Carbon Registry system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Base URL</h4>
                        <code className="text-sm">https://api.bluecarbon.gov.in/v1</code>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download OpenAPI Spec
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {apiEndpoints.map((endpoint, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.endpoint}</code>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {endpoint.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <Badge key={paramIndex} variant="outline" className="text-xs">
                                {param}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center py-6">
                      <Button>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Full API Documentation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mrv" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>MRV Methodology</CardTitle>
                  <CardDescription>
                    Monitoring, Reporting, and Verification process for blue carbon projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mrvSteps.map((step, index) => (
                      <div key={index} className="p-6 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                            <p className="text-muted-foreground mb-4">{step.description}</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Requirements</h4>
                                <ul className="space-y-1">
                                  {step.requirements.map((req, reqIndex) => (
                                    <li key={reqIndex} className="text-sm text-muted-foreground flex items-center">
                                      <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Timeframe</h4>
                                <Badge variant="outline">{step.timeframe}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Guides</CardTitle>
                  <CardDescription>
                    Connect your applications and systems with the Blue Carbon Registry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {integrationGuides.map((guide, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{guide.title}</CardTitle>
                            <Badge variant={getStatusColor(guide.status)}>
                              {guide.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <CardDescription>{guide.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-4">
                            {guide.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="text-sm flex items-center">
                                <ArrowRight className="h-3 w-3 mr-2 text-primary flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            variant={guide.status === 'available' ? 'default' : 'outline'}
                            className="w-full"
                            disabled={guide.status !== 'available'}
                          >
                            {guide.status === 'available' ? 'Get Started' : 'Coming Soon'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Common questions about the Blue Carbon Registry system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need More Help?</CardTitle>
                  <CardDescription>
                    Get in touch with our support team for additional assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <HelpCircle className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Support Portal</div>
                        <div className="text-xs text-muted-foreground">Submit a ticket</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <BookOpen className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">User Guide</div>
                        <div className="text-xs text-muted-foreground">Step-by-step tutorials</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <ExternalLink className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Community Forum</div>
                        <div className="text-xs text-muted-foreground">Discuss with others</div>
                      </div>
                    </Button>
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

export default Docs;