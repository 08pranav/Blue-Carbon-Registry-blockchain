import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  MapPin, 
  Calendar, 
  Leaf, 
  Eye, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Building
} from "lucide-react";

const mockProjects = [
  {
    id: "BC001",
    name: "Sundarbans Mangrove Restoration",
    location: "West Bengal, India",
    area: 125.5,
    organization: "Green Coast Foundation",
    organizationType: "NGO",
    status: "verified",
    carbonCredits: 15420,
    plantationDate: "2023-03-15",
    verificationDate: "2024-01-20",
    progress: 85,
  },
  {
    id: "BC002", 
    name: "Kerala Backwater Conservation",
    location: "Kochi, Kerala",
    area: 67.8,
    organization: "Coastal Panchayat Kollam",
    organizationType: "Panchayat",
    status: "pending",
    carbonCredits: 8740,
    plantationDate: "2023-08-10",
    verificationDate: null,
    progress: 92,
  },
  {
    id: "BC003",
    name: "Odisha Deltaic Restoration",
    location: "Bhitarkanika, Odisha",
    area: 203.2,
    organization: "Mangrove Conservation Trust",
    organizationType: "Community",
    status: "verified",
    carbonCredits: 26850,
    plantationDate: "2022-11-22",
    verificationDate: "2023-12-15",
    progress: 78,
  },
];

const RegistryDashboard = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="secondary" className="bg-nature/10 text-nature border-nature/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOrgIcon = (type: string) => {
    switch (type) {
      case "NGO":
        return <Building className="w-4 h-4" />;
      case "Panchayat":
        return <Shield className="w-4 h-4" />;
      case "Community":
        return <Users className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-accent/10 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Live Registry Data
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Blue Carbon Registry</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Immutable records of verified coastal ecosystem restoration projects
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-ocean text-white border-0 shadow-ocean">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-2">396.5</div>
              <div className="text-blue-100">Total Hectares</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-nature text-white border-0 shadow-nature">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-2">51,010</div>
              <div className="text-green-100">Carbon Credits</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-2 text-foreground">2</div>
              <div className="text-muted-foreground">Verified Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-2 text-foreground">1</div>
              <div className="text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Project Cards */}
        <div className="space-y-6">
          {mockProjects.map((project) => (
            <Card key={project.id} className="bg-gradient-card border-0 shadow-elegant hover:shadow-ocean transition-all duration-300">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-ocean font-mono">{project.id}</span>
                      <span>{project.name}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    {getStatusBadge(project.status)}
                    <Badge variant="outline" className="w-fit">
                      {getOrgIcon(project.organizationType)}
                      <span className="ml-1">{project.organizationType}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Area Restored</div>
                    <div className="text-2xl font-bold text-ocean">{project.area} ha</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Carbon Credits</div>
                    <div className="text-2xl font-bold text-nature">{project.carbonCredits.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Plantation Date
                    </div>
                    <div className="font-semibold">{new Date(project.plantationDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Organization</div>
                    <div className="font-semibold">{project.organization}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Restoration Progress</span>
                    <span className="text-sm font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                  {project.status === "verified" && (
                    <Button size="sm" className="flex-1 bg-gradient-nature hover:shadow-nature transition-all duration-300">
                      <Leaf className="w-4 h-4 mr-2" />
                      Generate Credits
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegistryDashboard;