import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  File,
  Image,
  Video,
  FileText,
  X,
  Check,
  AlertCircle,
  Download,
  ExternalLink,
  Copy,
  Trash2,
  Camera,
  Folder,
  Cloud,
  Hash,
  Eye,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  ipfsHash: string;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'failed';
  progress: number;
  gateway?: string;
}

interface FileUploadIPFSProps {
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedTypes?: string[];
  onFilesUploaded?: (files: UploadedFile[]) => void;
  className?: string;
  title?: string;
  description?: string;
}

export function FileUploadIPFS({
  maxFiles = 10,
  maxSizePerFile = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', '.doc', '.docx', '.csv', '.json'],
  onFilesUploaded,
  className,
  title = "Upload Files to IPFS",
  description = "Drag and drop files or click to browse. Files will be stored on IPFS."
}: FileUploadIPFSProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMockHash = () => {
    // Mock IPFS hash generation
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = 'Qm';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const uploadToIPFS = async (file: File): Promise<UploadedFile> => {
    // Mock IPFS upload - in real implementation, this would use IPFS API
    const mockFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      ipfsHash: generateMockHash(),
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
      gateway: 'https://ipfs.io/ipfs/'
    };

    // Simulate upload progress
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        mockFile.progress += Math.random() * 30;
        if (mockFile.progress >= 100) {
          mockFile.progress = 100;
          mockFile.status = 'completed';
          clearInterval(interval);
          resolve(mockFile);
        }
        
        setFiles(prev => prev.map(f => f.id === mockFile.id ? { ...mockFile } : f));
      }, 500);
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizePerFile) {
      return `File size exceeds ${formatFileSize(maxSizePerFile)}`;
    }

    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type);
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        return `File type not supported. Accepted: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const handleFileUpload = useCallback(async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    
    if (files.length + filesArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);

    try {
      for (const file of filesArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          continue;
        }

        // Add file to list with uploading status
        const uploadingFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          ipfsHash: '',
          uploadedAt: new Date(),
          status: 'uploading',
          progress: 0,
        };

        setFiles(prev => [...prev, uploadingFile]);

        try {
          const uploadedFile = await uploadToIPFS(file);
          toast.success(`${file.name} uploaded to IPFS successfully`);
        } catch (error) {
          console.error('Upload failed:', error);
          setFiles(prev => prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'failed' as const }
              : f
          ));
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      const completedFiles = files.filter(f => f.status === 'completed');
      onFilesUploaded?.(completedFiles);

    } finally {
      setIsUploading(false);
    }
  }, [files, maxFiles, onFilesUploaded]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400',
              isUploading && 'pointer-events-none opacity-50'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop files'}
            </h3>
            <p className="text-gray-600 mb-4">
              or click to browse from your device
            </p>
            <div className="text-sm text-gray-500">
              <p>Maximum {maxFiles} files, {formatFileSize(maxSizePerFile)} each</p>
              <p>Supported: Images, Videos, PDFs, Documents</p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileIcon className="h-8 w-8 text-gray-500 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{file.name}</p>
                          <Badge 
                            variant={
                              file.status === 'completed' ? 'default' :
                              file.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {file.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                            {file.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {file.status === 'uploading' && <Clock className="h-3 w-3 mr-1" />}
                            {file.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>{formatFileSize(file.size)}</span>
                          {file.ipfsHash && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">
                                {file.ipfsHash.slice(0, 8)}...{file.ipfsHash.slice(-6)}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="h-2" />
                        )}
                        
                        {file.status === 'completed' && file.ipfsHash && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(file.ipfsHash)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Hash
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`${file.gateway}${file.ipfsHash}`, '_blank')}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(`${file.gateway}${file.ipfsHash}`)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Gateway URL
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* IPFS Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">IPFS Storage</h4>
                  <p className="text-sm text-blue-700">
                    Files are stored on the InterPlanetary File System (IPFS), a decentralized 
                    storage network. Each file gets a unique hash that can be used to retrieve 
                    it from any IPFS gateway worldwide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}