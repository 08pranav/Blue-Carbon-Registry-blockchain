import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  Download,
  Share2,
  QrCode,
  Leaf,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  Globe,
  Hash,
  Users,
  BarChart3,
  Printer,
  Copy,
  ExternalLink,
  Shield,
  Waves,
  TreePine
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CertificateData {
  id: string;
  projectName: string;
  projectLocation: string;
  ecosystem: string;
  carbonCredits: number;
  issuedDate: Date;
  verificationDate: Date;
  certificateNumber: string;
  blockchainHash: string;
  organization: string;
  verifier: string;
  standard: string;
  vintage: string;
  methodology: string;
  area: number;
  serialNumber: string;
  retirementDate?: Date;
  isRetired: boolean;
}

interface CarbonCreditCertificateProps {
  certificateData: CertificateData;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function CarbonCreditCertificate({ 
  certificateData, 
  showActions = true, 
  compact = false,
  className 
}: CarbonCreditCertificateProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const getEcosystemIcon = (ecosystem: string) => {
    switch (ecosystem.toLowerCase()) {
      case 'mangrove': return TreePine;
      case 'seagrass': return Waves;
      case 'saltmarsh': return Leaf;
      default: return Leaf;
    }
  };

  const getEcosystemColor = (ecosystem: string) => {
    switch (ecosystem.toLowerCase()) {
      case 'mangrove': return 'text-green-600';
      case 'seagrass': return 'text-blue-600';
      case 'saltmarsh': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Mock PDF generation - in real implementation, this would generate actual PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Carbon Credit Certificate - ${certificateData.projectName}`,
          text: `${certificateData.carbonCredits} tCO₂ carbon credits from ${certificateData.projectName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate link copied to clipboard');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const EcosystemIcon = getEcosystemIcon(certificateData.ecosystem);

  if (compact) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <Badge 
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                variant="secondary"
              >
                <CheckCircle className="h-3 w-3" />
              </Badge>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{certificateData.projectName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{certificateData.carbonCredits} tCO₂</span>
                <span>•</span>
                <span>{certificateData.ecosystem}</span>
                <span>•</span>
                <span>{formatDate(certificateData.issuedDate)}</span>
              </div>
            </div>
            
            {showActions && (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Carbon Credit Certificate</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      )}

      {/* Certificate */}
      <Card 
        ref={certificateRef}
        className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 print:border-gray-300 print:bg-white print:shadow-none"
      >
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Waves className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blue Carbon Registry</h1>
                <p className="text-sm text-gray-600">Certified Carbon Credit Certificate</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-green-600 h-1 w-32 mx-auto"></div>
          </div>

          {/* Certificate Number and Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Certificate Number</p>
              <p className="font-mono text-lg font-semibold">{certificateData.certificateNumber}</p>
            </div>
            <div className="text-right">
              <Badge 
                variant={certificateData.isRetired ? "secondary" : "default"}
                className="mb-2"
              >
                {certificateData.isRetired ? 'RETIRED' : 'ACTIVE'}
              </Badge>
              <p className="text-sm text-gray-600">Serial: {certificateData.serialNumber}</p>
            </div>
          </div>

          {/* Main Certificate Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">CARBON CREDIT CERTIFICATE</h2>
            <p className="text-lg text-gray-700 mb-6">
              This certifies that <strong>{certificateData.carbonCredits} tonnes of CO₂ equivalent</strong>
            </p>
            <p className="text-gray-600 mb-4">
              have been sequestered through the blue carbon project
            </p>
            <h3 className="text-xl font-bold text-blue-700 mb-2">
              "{certificateData.projectName}"
            </h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{certificateData.projectLocation}</span>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <EcosystemIcon className={cn('h-8 w-8 mx-auto mb-2', getEcosystemColor(certificateData.ecosystem))} />
              <p className="text-sm text-gray-600">Ecosystem</p>
              <p className="font-semibold capitalize">{certificateData.ecosystem}</p>
            </div>
            
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Project Area</p>
              <p className="font-semibold">{certificateData.area} hectares</p>
            </div>
            
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Vintage Year</p>
              <p className="font-semibold">{certificateData.vintage}</p>
            </div>
            
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Organization</p>
              <p className="font-semibold text-sm">{certificateData.organization}</p>
            </div>
            
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-600">Standard</p>
              <p className="font-semibold">{certificateData.standard}</p>
            </div>
            
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Verifier</p>
              <p className="font-semibold text-sm">{certificateData.verifier}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Dates and Blockchain */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Verification Date</p>
              <p className="font-medium">{formatDate(certificateData.verificationDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Issuance Date</p>
              <p className="font-medium">{formatDate(certificateData.issuedDate)}</p>
            </div>
            {certificateData.retirementDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Retirement Date</p>
                <p className="font-medium">{formatDate(certificateData.retirementDate)}</p>
              </div>
            )}
          </div>

          {/* Blockchain Verification */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">Blockchain Verification</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transaction Hash:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white px-2 py-1 rounded border">
                    {certificateData.blockchainHash.slice(0, 10)}...{certificateData.blockchainHash.slice(-8)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(certificateData.blockchainHash, 'Hash')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://etherscan.io/tx/${certificateData.blockchainHash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Methodology:</span>
                <span className="text-sm font-medium">{certificateData.methodology}</span>
              </div>
            </div>
          </div>

          {/* QR Code and Verification */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-2">
                This certificate represents verified carbon sequestration in blue carbon ecosystems.
                <br />
                Certificate authenticity can be verified on the blockchain.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Blockchain Verified</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">Internationally Recognized</span>
                </div>
              </div>
            </div>
            
            {/* Mock QR Code */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded border-2 border-gray-300 flex items-center justify-center mb-1">
                <QrCode className="h-12 w-12 text-white" />
              </div>
              <p className="text-xs text-gray-500">Verify Online</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Blue Carbon Registry • Issued on {formatDate(certificateData.issuedDate)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Certificate ID: {certificateData.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example usage component
export function CertificateGallery() {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);

  const mockCertificates: CertificateData[] = [
    {
      id: 'cert-001',
      projectName: 'Sundarbans Mangrove Restoration',
      projectLocation: 'Sundarbans, West Bengal, India',
      ecosystem: 'mangrove',
      carbonCredits: 150.5,
      issuedDate: new Date('2024-01-15'),
      verificationDate: new Date('2023-12-20'),
      certificateNumber: 'BCR-2024-001',
      blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
      organization: 'Marine Conservation Foundation',
      verifier: 'Dr. Sarah Johnson, Blue Carbon Specialist',
      standard: 'Verified Carbon Standard (VCS)',
      vintage: '2023',
      methodology: 'VM0033 - Blue Carbon',
      area: 25.5,
      serialNumber: 'BCR-2024-001-001-150.5',
      isRetired: false
    },
    {
      id: 'cert-002',
      projectName: 'Kerala Seagrass Conservation',
      projectLocation: 'Kochi, Kerala, India',
      ecosystem: 'seagrass',
      carbonCredits: 89.2,
      issuedDate: new Date('2024-02-10'),
      verificationDate: new Date('2024-01-15'),
      certificateNumber: 'BCR-2024-002',
      blockchainHash: '0x9876543210fedcba9876543210fedcba87654321',
      organization: 'Coastal Restoration Initiative',
      verifier: 'Dr. Raj Patel, Marine Ecologist',
      standard: 'Gold Standard',
      vintage: '2024',
      methodology: 'VM0033 - Blue Carbon',
      area: 18.3,
      serialNumber: 'BCR-2024-002-001-89.2',
      retirementDate: new Date('2024-03-01'),
      isRetired: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Carbon Credit Certificates</h2>
        <p className="text-gray-600">
          View and manage your verified carbon credit certificates
        </p>
      </div>

      {selectedCertificate ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCertificate(null)}
          >
            ← Back to Gallery
          </Button>
          <CarbonCreditCertificate certificateData={selectedCertificate} />
        </div>
      ) : (
        <div className="grid gap-4">
          {mockCertificates.map((certificate) => (
            <div key={certificate.id}>
              <CarbonCreditCertificate 
                certificateData={certificate}
                compact
                showActions={false}
                className="cursor-pointer hover:shadow-md transition-shadow"
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm"
                  onClick={() => setSelectedCertificate(certificate)}
                >
                  View Full Certificate
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}