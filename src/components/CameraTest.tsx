import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, AlertTriangle } from 'lucide-react';

export function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const startCamera = async () => {
    try {
      setError('');
      console.log('Starting camera...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: 'environment' }
        },
        audio: false
      });

      console.log('Got media stream:', mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setCameraActive(true);
          setDebugInfo({
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState,
            streamActive: mediaStream.active,
            tracks: mediaStream.getVideoTracks().map(track => ({
              label: track.label,
              enabled: track.enabled,
              readyState: track.readyState
            }))
          });
        };
        
        videoRef.current.play();
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.label);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDebugInfo({});
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImages(prev => [...prev, dataUrl]);
    console.log('Photo captured');
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Camera Test & Debug</CardTitle>
          <CardDescription>
            Test camera functionality and debug any issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={cameraActive ? stopCamera : startCamera}
              variant={cameraActive ? "destructive" : "default"}
            >
              {cameraActive ? 'Stop Camera' : 'Start Camera'}
            </Button>
            {cameraActive && (
              <Button onClick={capturePhoto} variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          <div className="text-sm space-y-2">
            <div><strong>Camera Status:</strong> {cameraActive ? 'Active' : 'Inactive'}</div>
            <div><strong>Stream:</strong> {stream ? 'Connected' : 'None'}</div>
            {debugInfo.videoWidth && (
              <div><strong>Video Dimensions:</strong> {debugInfo.videoWidth} x {debugInfo.videoHeight}</div>
            )}
            {debugInfo.tracks && (
              <div>
                <strong>Video Tracks:</strong>
                <ul className="ml-4 list-disc">
                  {debugInfo.tracks.map((track: any, idx: number) => (
                    <li key={idx}>
                      {track.label} - {track.enabled ? 'Enabled' : 'Disabled'} - {track.readyState}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Video Preview */}
          <div className="border rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black object-cover"
              style={{ 
                minHeight: '256px',
                transform: 'scaleX(-1)' // Mirror the video horizontally
              }}
            />
          </div>

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Captured Images */}
          {capturedImages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Captured Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {capturedImages.map((image, idx) => (
                  <img 
                    key={idx} 
                    src={image} 
                    alt={`Captured ${idx + 1}`} 
                    className="w-full h-32 object-cover border rounded"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}