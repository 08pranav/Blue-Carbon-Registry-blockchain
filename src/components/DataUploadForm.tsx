import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, MapPin, Calendar, Users, Waves } from "lucide-react";

const DataUploadForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    area: "",
    plantationDate: "",
    speciesType: "",
    carbonSequestration: "",
    organizationType: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Data Uploaded Successfully",
      description: "Your restoration data has been recorded on the blockchain for verification.",
    });
    
    // Reset form
    setFormData({
      projectName: "",
      location: "",
      area: "",
      plantationDate: "",
      speciesType: "",
      carbonSequestration: "",
      organizationType: "",
      description: "",
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background to-accent/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Upload className="w-4 h-4 mr-2" />
            Field Data Collection
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Upload Restoration Data</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit verified plantation and restoration data to the blockchain registry
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-6 h-6 text-ocean" />
                Blue Carbon Project Data
              </CardTitle>
              <CardDescription>
                All data will be stored immutably on the blockchain after verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="Mangrove Restoration Initiative"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select value={formData.organizationType} onValueChange={(value) => setFormData({ ...formData, organizationType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="community">Community Group</SelectItem>
                        <SelectItem value="panchayat">Coastal Panchayat</SelectItem>
                        <SelectItem value="research">Research Institution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Coordinates
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="12.9716° N, 77.5946° E"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (Hectares)</Label>
                    <Input
                      id="area"
                      type="number"
                      step="0.01"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="15.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="plantationDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Plantation Date
                    </Label>
                    <Input
                      id="plantationDate"
                      type="date"
                      value={formData.plantationDate}
                      onChange={(e) => setFormData({ ...formData, plantationDate: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="speciesType">Mangrove Species</Label>
                    <Select value={formData.speciesType} onValueChange={(value) => setFormData({ ...formData, speciesType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rhizophora">Rhizophora mucronata</SelectItem>
                        <SelectItem value="avicennia">Avicennia marina</SelectItem>
                        <SelectItem value="sonneratia">Sonneratia apetala</SelectItem>
                        <SelectItem value="kandelia">Kandelia candel</SelectItem>
                        <SelectItem value="mixed">Mixed Species</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbonSequestration">Estimated Carbon Sequestration (tCO2/year)</Label>
                  <Input
                    id="carbonSequestration"
                    type="number"
                    step="0.01"
                    value={formData.carbonSequestration}
                    onChange={(e) => setFormData({ ...formData, carbonSequestration: e.target.value })}
                    placeholder="45.8"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the restoration project, methodology, and monitoring approach..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" size="lg" className="bg-gradient-ocean hover:shadow-ocean transition-all duration-300">
                    <Upload className="w-5 h-5 mr-2" />
                    Submit to Blockchain
                  </Button>
                  <Button type="button" variant="outline" size="lg">
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DataUploadForm;