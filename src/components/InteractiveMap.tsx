import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Map,
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Leaf,
  BarChart3,
  Calendar,
  User,
  Navigation,
  Satellite,
  Globe,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProjectPin {
  id: string;
  name: string;
  description: string;
  ecosystem: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area: number;
  carbonEstimate: number;
  status: string;
  submitter: string;
  submissionDate: string;
}

interface InteractiveMapProps {
  className?: string;
  height?: string;
}

export function InteractiveMap({ className, height = "600px" }: InteractiveMapProps) {
  const [projects, setProjects] = useState<ProjectPin[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectPin | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [zoomLevel, setZoomLevel] = useState(5);
  const [mapType, setMapType] = useState<'terrain' | 'satellite' | 'hybrid'>('terrain');
  const [ecosystemFilter, setEcosystemFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  useEffect(() => {
    fetchMapProjects();
  }, []);

  const fetchMapProjects = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProjects();
      
      // Transform projects to map pins with mock coordinates
      const mapProjects: ProjectPin[] = response.projects.map((project, index) => ({
        ...project,
        coordinates: project.coordinates || generateMockCoordinates(index),
      })).filter(project => project.coordinates);

      setProjects(mapProjects);
    } catch (error) {
      console.error('Error fetching map projects:', error);
      toast.error('Failed to load project locations');
    } finally {
      setLoading(false);
    }
  };

  const generateMockCoordinates = (index: number) => {
    // Generate coordinates for major coastal regions of India
    const coastalRegions = [
      { lat: 21.9497, lng: 88.4297 }, // Sundarbans, West Bengal
      { lat: 9.5981, lng: 76.4619 },  // Kerala backwaters
      { lat: 15.2993, lng: 74.1240 }, // Goa coast
      { lat: 19.0760, lng: 72.8777 }, // Mumbai coast
      { lat: 13.0827, lng: 80.2707 }, // Chennai coast
      { lat: 22.2587, lng: 71.1924 }, // Gujarat coast
      { lat: 20.2961, lng: 85.8245 }, // Odisha coast
    ];
    
    const baseCoord = coastalRegions[index % coastalRegions.length];
    return {
      latitude: baseCoord.lat + (Math.random() - 0.5) * 0.5,
      longitude: baseCoord.lng + (Math.random() - 0.5) * 0.5
    };
  };

  const getEcosystemColor = (ecosystem: string): string => {
    switch (ecosystem?.toLowerCase?.()) {
      case 'mangrove': return '#10B981'; // Green
      case 'seagrass': return '#3B82F6'; // Blue
      case 'saltmarsh': return '#8B5CF6'; // Purple
      case 'coral': return '#F59E0B'; // Orange
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return '✓';
      case 'PENDING': return '●';
      case 'UNDER_REVIEW': return '◐';
      case 'REJECTED': return '✗';
      default: return '●';
    }
  };

  const handleProjectClick = (project: ProjectPin) => {
    setSelectedProject(project);
    setShowProjectDialog(true);
    // Center map on selected project
    setMapCenter({ lat: project.coordinates.latitude, lng: project.coordinates.longitude });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };

  const handleResetView = () => {
    setMapCenter({ lat: 20.5937, lng: 78.9629 });
    setZoomLevel(5);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      (project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEcosystem = ecosystemFilter === 'all' || 
      project.ecosystem?.toLowerCase?.() === ecosystemFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesEcosystem && matchesStatus;
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Map Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ecosystems</SelectItem>
                  <SelectItem value="mangrove">Mangrove</SelectItem>
                  <SelectItem value="seagrass">Seagrass</SelectItem>
                  <SelectItem value="saltmarsh">Salt Marsh</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={mapType} onValueChange={setMapType as any}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terrain">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Terrain
                    </span>
                  </SelectItem>
                  <SelectItem value="satellite">
                    <span className="flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      Satellite
                    </span>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Hybrid
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Blue Carbon Projects Map
              </CardTitle>
              <CardDescription>
                Interactive map showing {filteredProjects.length} projects across coastal India
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button variant="outline" size="sm" onClick={fetchMapProjects} disabled={loading}>
                <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative" style={{ height }}>
            {/* Map Placeholder - In a real app, this would be a Leaflet or Google Maps component */}
            <div 
              className="w-full h-full bg-gradient-to-b from-blue-100 to-green-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e0' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}
            >
              {/* Map Info */}
              <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
                <div className="text-sm font-medium mb-2">Map View</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Center: {mapCenter.lat.toFixed(2)}, {mapCenter.lng.toFixed(2)}</div>
                  <div>Zoom: {zoomLevel}</div>
                  <div>Type: {mapType}</div>
                </div>
              </div>
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Project Pins */}
              <div className="absolute inset-0">
                {filteredProjects.map((project, index) => {
                  // Calculate pin position based on coordinates (simplified)
                  const x = ((project.coordinates.longitude - 68) / (98 - 68)) * 100;
                  const y = ((37 - project.coordinates.latitude) / (37 - 6)) * 100;
                  
                  return (
                    <div
                      key={project.id}
                      className="absolute cursor-pointer transition-transform hover:scale-110"
                      style={{ 
                        left: `${Math.max(5, Math.min(95, x))}%`, 
                        top: `${Math.max(5, Math.min(95, y))}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getEcosystemColor(project.ecosystem) }}
                        title={`${project.name} - ${project.ecosystem}`}
                      >
                        {getStatusIcon(project.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Fallback content for empty map */}
              {filteredProjects.length === 0 && !loading && (
                <div className="text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                  <p className="text-gray-600 max-w-md">
                    No blue carbon projects match your current filters. 
                    Try adjusting the search or filter criteria.
                  </p>
                </div>
              )}
              
              {loading && (
                <div className="text-center">
                  <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Loading Projects</h3>
                  <p className="text-gray-600">Fetching project locations...</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Map Legend</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getEcosystemColor('mangrove') }}></div>
                <span>Mangrove</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getEcosystemColor('seagrass') }}></div>
                <span>Seagrass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getEcosystemColor('saltmarsh') }}></div>
                <span>Salt Marsh</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <span className="font-mono">✓ Verified</span>
                <span className="font-mono">● Pending</span>
                <span className="font-mono">◐ Review</span>
                <span className="font-mono">✗ Rejected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Project Details Dialog */}
      {selectedProject && (
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" style={{ color: getEcosystemColor(selectedProject.ecosystem) }} />
                {selectedProject.name}
              </DialogTitle>
              <DialogDescription>
                {selectedProject.location}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Ecosystem</div>
                  <Badge style={{ backgroundColor: getEcosystemColor(selectedProject.ecosystem), color: 'white' }}>
                    {selectedProject.ecosystem}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <Badge variant="outline">{selectedProject.status}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Area</div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <span>{selectedProject.area} hectares</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Carbon Estimate</div>
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span>{selectedProject.carbonEstimate?.toLocaleString()} tCO₂</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Coordinates</div>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                  {selectedProject.coordinates.latitude.toFixed(6)}, {selectedProject.coordinates.longitude.toFixed(6)}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>by {selectedProject.submitter}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedProject.submissionDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowProjectDialog(false)}>
                Close
              </Button>
              <Button className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}