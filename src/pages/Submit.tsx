import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Upload,
  MapPin,
  FileText,
  Image,
  Video,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectFormData {
  title: string;
  description: string;
  ecosystem: string;
  location: string;
  latitude: string;
  longitude: string;
  area: string;
  carbonCreditsEstimated: string;
  species: string;
  methodology: string;
  timeline: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

const Submit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    ecosystem: '',
    location: '',
    latitude: '',
    longitude: '',
    area: '',
    carbonCreditsEstimated: '',
    species: '',
    methodology: '',
    timeline: ''
  });

  const steps = [
    { id: 1, name: 'Project Details', description: 'Basic information about your project' },
    { id: 2, name: 'Location & Area', description: 'Geographic and size details' },
    { id: 3, name: 'Evidence Upload', description: 'Supporting documents and media' },
    { id: 4, name: 'Review & Submit', description: 'Final review before submission' }
  ];

  const ecosystemOptions = [
    { value: 'MANGROVE', label: 'Mangrove Forest', description: 'Coastal mangrove restoration and conservation' },
    { value: 'SEAGRASS', label: 'Seagrass Meadow', description: 'Underwater seagrass bed restoration' },
    { value: 'SALT_MARSH', label: 'Salt Marsh', description: 'Salt marsh habitat restoration' }
  ];

  const methodologyOptions = [
    'VM0007 - REDD+ Methodology Framework',
    'VM0015 - Methodology for Avoided Unplanned Deforestation',
    'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
    'AR-AM0014 - Afforestation and Reforestation of Degraded Mangrove Habitats'
  ];

  const updateFormData = (field: keyof ProjectFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newFile.preview = e.target?.result as string;
          setFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setFiles(prev => [...prev, newFile]);
      }
    });

    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.ecosystem);
      case 2:
        return !!(formData.location && formData.latitude && formData.longitude && formData.area);
      case 3:
        return files.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fill in all required fields before proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // In production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Project submitted successfully! Our team will review your submission.');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Submit Blue Carbon Project</h1>
            <p className="text-green-100 text-lg mb-6">
              Upload your restoration project data for verification and carbon credit tokenization
            </p>
            
            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full h-2 mb-4">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Steps */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                      ${currentStep >= step.id 
                        ? 'bg-white text-green-600' 
                        : 'bg-green-500/30 text-white'
                      }
                    `}>
                      {currentStep > step.id ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-12 h-0.5 ml-2
                        ${currentStep > step.id ? 'bg-white' : 'bg-green-500/30'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Step {currentStep}:</span>
              <span>{steps[currentStep - 1].name}</span>
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Sundarbans Mangrove Restoration Project"
                    value={formData.title}
                    onChange={(e) => updateFormData('title')(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your blue carbon restoration project, including objectives, methodology, and expected outcomes..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description')(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ecosystem">Ecosystem Type *</Label>
                  <Select value={formData.ecosystem} onValueChange={updateFormData('ecosystem')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ecosystem type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ecosystemOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="species">Primary Species</Label>
                    <Input
                      id="species"
                      placeholder="e.g., Rhizophora mucronata, Avicennia marina"
                      value={formData.species}
                      onChange={(e) => updateFormData('species')(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., 3 years (2024-2027)"
                      value={formData.timeline}
                      onChange={(e) => updateFormData('timeline')(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="methodology">Carbon Methodology</Label>
                  <Select value={formData.methodology} onValueChange={updateFormData('methodology')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carbon accounting methodology" />
                    </SelectTrigger>
                    <SelectContent>
                      {methodologyOptions.map(methodology => (
                        <SelectItem key={methodology} value={methodology}>
                          {methodology}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {/* Step 2: Location & Area */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location">Project Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Sundarbans, West Bengal, India"
                    value={formData.location}
                    onChange={(e) => updateFormData('location')(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 21.9497"
                      value={formData.latitude}
                      onChange={(e) => updateFormData('latitude')(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 88.4297"
                      value={formData.longitude}
                      onChange={(e) => updateFormData('longitude')(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="area">Project Area (hectares) *</Label>
                    <Input
                      id="area"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 150"
                      value={formData.area}
                      onChange={(e) => updateFormData('area')(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carbonCredits">Estimated Carbon Credits (tCO₂)</Label>
                    <Input
                      id="carbonCredits"
                      type="number"
                      min="0"
                      placeholder="e.g., 2500"
                      value={formData.carbonCreditsEstimated}
                      onChange={(e) => updateFormData('carbonCreditsEstimated')(e.target.value)}
                    />
                  </div>
                </div>
                
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertTitle>Location Guidelines</AlertTitle>
                  <AlertDescription>
                    Ensure coordinates are accurate using GPS or mapping tools. The area should reflect the total restoration area in hectares.
                  </AlertDescription>
                </Alert>
              </>
            )}
            
            {/* Step 3: Evidence Upload */}
            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Upload Supporting Evidence *</Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload photos, videos, reports, and other documentation that supports your project
                    </p>
                  </div>
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.csv,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports images, videos, PDFs, and documents (max 10MB each)
                      </p>
                    </label>
                  </div>
                  
                  {/* Uploaded Files */}
                  {files.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Uploaded Files ({files.length})</h4>
                      <div className="grid gap-3">
                        {files.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div className="flex items-center space-x-3">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-5 w-5 text-blue-500" />
                              ) : file.type.startsWith('video/') ? (
                                <Video className="h-5 w-5 text-purple-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-500" />
                              )}
                              <div>
                                <div className="font-medium text-sm">{file.name}</div>
                                <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Evidence Requirements</AlertTitle>
                    <AlertDescription>
                      Please include site photos, species identification, monitoring data, and any relevant permits or documentation.
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
            
            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Ready to Submit</AlertTitle>
                  <AlertDescription>
                    Please review your project information before submitting. Our verification team will review your submission within 5-7 business days.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Title</div>
                        <div>{formData.title || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Ecosystem</div>
                        <div>{formData.ecosystem || 'Not selected'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Location</div>
                        <div>{formData.location || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Area</div>
                        <div>{formData.area ? `${formData.area} hectares` : 'Not provided'}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Files & Evidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">{files.length}</div>
                      <div className="text-sm text-gray-600">files uploaded</div>
                      {files.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {files.slice(0, 3).map(file => (
                            <div key={file.id} className="text-xs text-gray-500 truncate">
                              {file.name}
                            </div>
                          ))}
                          {files.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{files.length - 3} more files
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Project
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submit;
