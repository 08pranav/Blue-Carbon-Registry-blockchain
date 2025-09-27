import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Camera, 
  Upload, 
  FileImage, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  RotateCcw,
  Download,
  Zap,
  Leaf,
  Globe,
  Calendar,
  DollarSign,
  Target,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface ProjectImage {
  id: string;
  file: File;
  preview: string;
  type: 'before' | 'during' | 'current';
  timestamp: Date;
  location?: LocationData;
}

interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  area: number;
  projectType: string;
  ecosystemType: string;
  expectedCarbonCredits: number;
  timeline: number;
  budget: number;
  coordinates: LocationData | null;
  images: ProjectImage[];
  methodology: string;
  additionalNotes: string;
}

const PROJECT_TYPES = [
  { value: 'restoration', label: 'Mangrove Restoration', icon: '🌱' },
  { value: 'conservation', label: 'Coastal Conservation', icon: '🏖️' },
  { value: 'afforestation', label: 'Blue Carbon Afforestation', icon: '🌳' },
  { value: 'protection', label: 'Ecosystem Protection', icon: '🛡️' },
  { value: 'rehabilitation', label: 'Habitat Rehabilitation', icon: '🔄' }
];

const ECOSYSTEM_TYPES = [
  { value: 'mangrove', label: 'Mangrove Forests', description: 'Tidal wetland ecosystems' },
  { value: 'saltmarsh', label: 'Salt Marshes', description: 'Coastal grassland ecosystems' },
  { value: 'seagrass', label: 'Seagrass Meadows', description: 'Marine flowering plants' },
  { value: 'kelp', label: 'Kelp Forests', description: 'Large brown algae ecosystems' },
  { value: 'coral', label: 'Coral Reefs', description: 'Marine calcium carbonate structures' }
];

const METHODOLOGIES = [
  'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
  'VM0007 - REDD+ Methodology Framework',
  'VM0024 - Methodology for Coastal Wetland Creation',
  'AR-ACM0003 - Afforestation and reforestation of lands',
  'Custom Methodology (Pending Validation)'
];

export function SubmitProjectEnhanced() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    location: '',
    area: 0,
    projectType: '',
    ecosystemType: '',
    expectedCarbonCredits: 0,
    timeline: 12,
    budget: 0,
    coordinates: null,
    images: [],
    methodology: '',
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<'before' | 'during' | 'current'>('current');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Try to get address from coordinates (mock implementation)
      try {
        locationData.address = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setFormData(prev => ({ 
          ...prev, 
          coordinates: locationData,
          location: locationData.address || `${locationData.latitude}, ${locationData.longitude}`
        }));
      } catch (error) {
        console.error('Error getting address:', error);
        setFormData(prev => ({ 
          ...prev, 
          coordinates: locationData,
          location: `${locationData.latitude}, ${locationData.longitude}`
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setErrors(prev => [...prev, 'Unable to get your location. Please enter it manually.']);
    }
    setLocationLoading(false);
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrors(prev => [...prev, 'Unable to access camera. Please upload images manually.']);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `project-${selectedImageType}-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const imageData: ProjectImage = {
        id: `img-${Date.now()}`,
        file,
        preview: canvas.toDataURL('image/jpeg', 0.8),
        type: selectedImageType,
        timestamp: new Date(),
        location: formData.coordinates || undefined
      };

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageData]
      }));
    }, 'image/jpeg', 0.8);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData: ProjectImage = {
            id: `img-${Date.now()}-${Math.random()}`,
            file,
            preview: e.target?.result as string,
            type: selectedImageType,
            timestamp: new Date(),
            location: formData.coordinates || undefined
          };

          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageData]
          }));
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Calculate estimated carbon credits
  const calculateEstimatedCredits = (area: number, ecosystemType: string, projectType: string) => {
    const baseRates = {
      mangrove: 3.5,
      saltmarsh: 2.8,
      seagrass: 1.9,
      kelp: 2.2,
      coral: 1.5
    };

    const typeMultiplier = {
      restoration: 1.2,
      conservation: 0.8,
      afforestation: 1.5,
      protection: 0.6,
      rehabilitation: 1.0
    };

    const baseRate = baseRates[ecosystemType as keyof typeof baseRates] || 2.0;
    const multiplier = typeMultiplier[projectType as keyof typeof typeMultiplier] || 1.0;
    
    return Math.round(area * baseRate * multiplier);
  };

  // Update form field
  const updateField = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate carbon credits when area, ecosystem, or project type changes
      if (field === 'area' || field === 'ecosystemType' || field === 'projectType') {
        if (newData.area > 0 && newData.ecosystemType && newData.projectType) {
          newData.expectedCarbonCredits = calculateEstimatedCredits(
            newData.area, 
            newData.ecosystemType, 
            newData.projectType
          );
        }
      }
      
      return newData;
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push('Project name is required');
    if (!formData.description.trim()) newErrors.push('Project description is required');
    if (!formData.location.trim()) newErrors.push('Project location is required');
    if (formData.area <= 0) newErrors.push('Project area must be greater than 0');
    if (!formData.projectType) newErrors.push('Project type is required');
    if (!formData.ecosystemType) newErrors.push('Ecosystem type is required');
    if (formData.timeline < 6) newErrors.push('Timeline must be at least 6 months');
    if (formData.budget <= 0) newErrors.push('Budget must be greater than 0');
    if (!formData.methodology) newErrors.push('Methodology is required');
    if (formData.images.length === 0) newErrors.push('At least one project image is required');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitProgress(0);

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 20, message: 'Validating project data...' },
        { step: 40, message: 'Processing images...' },
        { step: 60, message: 'Uploading to system...' },
        { step: 80, message: 'Generating project ID...' },
        { step: 100, message: 'Project submitted successfully!' }
      ];

      for (const { step } of progressSteps) {
        setSubmitProgress(step);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Create form data for submission
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      submitData.append('area', formData.area.toString());
      submitData.append('projectType', formData.projectType);
      submitData.append('ecosystemType', formData.ecosystemType);
      submitData.append('expectedCarbonCredits', formData.expectedCarbonCredits.toString());
      submitData.append('timeline', formData.timeline.toString());
      submitData.append('budget', formData.budget.toString());
      submitData.append('methodology', formData.methodology);
      submitData.append('additionalNotes', formData.additionalNotes);
      
      if (formData.coordinates) {
        submitData.append('coordinates', JSON.stringify(formData.coordinates));
      }

      // Add images
      formData.images.forEach((image, index) => {
        submitData.append(`images`, image.file);
        submitData.append(`imageTypes`, image.type);
        submitData.append(`imageTimestamps`, image.timestamp.toISOString());
      });

      // Submit to API (mock implementation)
      await apiService.submitProject(Object.fromEntries(submitData));

      setSuccess(true);
      setErrors([]);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          location: '',
          area: 0,
          projectType: '',
          ecosystemType: '',
          expectedCarbonCredits: 0,
          timeline: 12,
          budget: 0,
          coordinates: null,
          images: [],
          methodology: '',
          additionalNotes: ''
        });
        setSuccess(false);
        setSubmitProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Error submitting project:', error);
      setErrors(['Failed to submit project. Please try again.']);
    }

    setLoading(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!user || user.role !== 'NGO') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Only NGO users can submit projects.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl text-white">
              <Upload className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Submit New Project</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Submit your blue carbon restoration project for verification and registration in the carbon credit marketplace.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Project submitted successfully! You will receive a confirmation email shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium">Submitting your project...</span>
              </div>
              <Progress value={submitProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide basic details about your restoration project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., Sundarbans Mangrove Restoration Initiative"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your project goals, methods, and expected impact..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => updateField('projectType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ecosystemType">Ecosystem Type *</Label>
                  <Select value={formData.ecosystemType} onValueChange={(value) => updateField('ecosystemType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select ecosystem type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ECOSYSTEM_TYPES.map((ecosystem) => (
                        <SelectItem key={ecosystem.value} value={ecosystem.value}>
                          <div className="flex flex-col">
                            <span>{ecosystem.label}</span>
                            <span className="text-xs text-muted-foreground">{ecosystem.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Geography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Geography
              </CardTitle>
              <CardDescription>
                Specify the location and area of your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="Enter project location or coordinates"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="px-3"
                    >
                      {locationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.coordinates && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coordinates: {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)} 
                      (±{formData.coordinates.accuracy}m accuracy)
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="area">Project Area (hectares) *</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.area}
                    onChange={(e) => updateField('area', parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expectedCredits">Expected Carbon Credits</Label>
                  <Input
                    id="expectedCredits"
                    type="number"
                    value={formData.expectedCarbonCredits}
                    onChange={(e) => updateField('expectedCarbonCredits', parseInt(e.target.value) || 0)}
                    placeholder="Auto-calculated"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically calculated based on area and ecosystem type
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Details
              </CardTitle>
              <CardDescription>
                Timeline, budget, and methodology information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Project Timeline (months) *</Label>
                  <Input
                    id="timeline"
                    type="number"
                    min="6"
                    max="120"
                    value={formData.timeline}
                    onChange={(e) => updateField('timeline', parseInt(e.target.value) || 12)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Project Budget (USD) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1000"
                    value={formData.budget}
                    onChange={(e) => updateField('budget', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="methodology">Methodology *</Label>
                  <Select value={formData.methodology} onValueChange={(value) => updateField('methodology', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select methodology" />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODOLOGIES.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => updateField('additionalNotes', e.target.value)}
                    placeholder="Any additional information about your project..."
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Project Documentation
              </CardTitle>
              <CardDescription>
                Upload or capture images of your project site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Type Selection */}
              <div>
                <Label>Image Type</Label>
                <div className="flex gap-2 mt-1">
                  {(['before', 'during', 'current'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={selectedImageType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedImageType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {cameraActive ? 'Stop Camera' : 'Start Camera'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images
                </Button>
                
                {cameraActive && (
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Capture Photo
                  </Button>
                )}
              </div>

              {/* Camera Preview */}
              {cameraActive && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Image Gallery */}
              {formData.images.length > 0 && (
                <div>
                  <Label>Uploaded Images ({formData.images.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Project ${image.type}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Badge 
                          className="absolute top-1 left-1 text-xs"
                          variant="secondary"
                        >
                          {image.type}
                        </Badge>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                          {image.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Summary */}
          {formData.area > 0 && formData.expectedCarbonCredits > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formData.area}</div>
                    <div className="text-sm text-muted-foreground">Hectares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formData.expectedCarbonCredits}</div>
                    <div className="text-sm text-muted-foreground">Carbon Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formData.timeline}</div>
                    <div className="text-sm text-muted-foreground">Months</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${formData.budget.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  location: '',
                  area: 0,
                  projectType: '',
                  ecosystemType: '',
                  expectedCarbonCredits: 0,
                  timeline: 12,
                  budget: 0,
                  coordinates: null,
                  images: [],
                  methodology: '',
                  additionalNotes: ''
                });
                setErrors([]);
              }}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Form
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}