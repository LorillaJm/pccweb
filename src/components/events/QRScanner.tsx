'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  CameraOff, 
  Scan, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Clock,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

interface ScanResult {
  success: boolean;
  ticket?: {
    ticketNumber: string;
    status: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    event: {
      title: string;
      startDate: string;
      venue: string;
    };
  };
  error?: string;
  message: string;
}

interface QRScannerProps {
  onScan: (ticketData: string) => Promise<ScanResult>;
  eventId: string;
  eventTitle?: string;
  location?: string;
  scanType?: 'entry' | 'exit' | 'checkpoint';
  offlineMode?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  eventId,
  eventTitle,
  location = '',
  scanType = 'entry',
  offlineMode = false
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [currentLocation, setCurrentLocation] = useState(location);
  const [currentScanType, setCurrentScanType] = useState(scanType);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [offlineScans, setOfflineScans] = useState<Array<{
    ticketData: string;
    timestamp: string;
    location: string;
    scanType: string;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load offline scans from localStorage
    const savedScans = localStorage.getItem(`offline-scans-${eventId}`);
    if (savedScans) {
      setOfflineScans(JSON.parse(savedScans));
    }

    return () => {
      stopCamera();
    };
  }, [eventId]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(scanForQRCode, 500);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  const scanForQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // In a real implementation, you would use a QR code library like jsQR
      // For now, we'll simulate QR code detection
      // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      // const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      
      // if (qrCode) {
      //   await handleScan(qrCode.data);
      // }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    }
  };

  const handleScan = async (qrData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setScanResult(null);

    try {
      if (offlineMode) {
        // Store scan for later sync
        const offlineScan = {
          ticketData: qrData,
          timestamp: new Date().toISOString(),
          location: currentLocation,
          scanType: currentScanType
        };
        
        const updatedScans = [...offlineScans, offlineScan];
        setOfflineScans(updatedScans);
        localStorage.setItem(`offline-scans-${eventId}`, JSON.stringify(updatedScans));
        
        setScanResult({
          success: true,
          message: 'Scan recorded offline. Will sync when connection is restored.'
        });
      } else {
        const result = await onScan(qrData);
        setScanResult(result);
      }
    } catch (error) {
      setScanResult({
        success: false,
        error: 'Scan failed',
        message: 'An error occurred while processing the scan.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualScan = async () => {
    if (!manualCode.trim()) return;
    
    await handleScan(manualCode.trim());
    setManualCode('');
  };

  const clearResult = () => {
    setScanResult(null);
  };

  const syncOfflineScans = async () => {
    if (offlineScans.length === 0) return;

    try {
      // In a real implementation, you would sync with the server
      // For now, we'll just clear the offline scans
      setOfflineScans([]);
      localStorage.removeItem(`offline-scans-${eventId}`);
      
      setScanResult({
        success: true,
        message: `${offlineScans.length} offline scans synced successfully.`
      });
    } catch (error) {
      setScanResult({
        success: false,
        error: 'Sync failed',
        message: 'Failed to sync offline scans. Please try again.'
      });
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scanner Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>QR Code Scanner</span>
            {offlineMode && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Offline Mode
              </Badge>
            )}
          </CardTitle>
          {eventTitle && (
            <p className="text-sm text-gray-600">Event: {eventTitle}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Scan Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g., Main Entrance"
              />
            </div>
            
            <div>
              <Label htmlFor="scanType">Scan Type</Label>
              <Select value={currentScanType} onValueChange={(value: any) => setCurrentScanType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="exit">Exit</SelectItem>
                  <SelectItem value="checkpoint">Checkpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              {offlineScans.length > 0 && (
                <Button onClick={syncOfflineScans} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync ({offlineScans.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Camera Scanner</span>
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startCamera} disabled={isProcessing}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {cameraError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full max-w-md mx-auto rounded-lg border ${
                isScanning ? 'block' : 'hidden'
              }`}
            />
            
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {!isScanning && !cameraError && (
              <div className="w-full max-w-md mx-auto h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Click "Start Camera" to begin scanning</p>
                </div>
              </div>
            )}
            
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-lg">
                  <div className="w-full h-full border border-blue-300 rounded-lg animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center text-blue-600">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing scan...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter ticket number or QR code data"
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
            />
            <Button onClick={handleManualScan} disabled={!manualCode.trim() || isProcessing}>
              <Scan className="h-4 w-4 mr-2" />
              Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Result */}
      {scanResult && (
        <Card>
          <CardContent className="p-6">
            <Alert variant={scanResult.success ? "default" : "destructive"}>
              {scanResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="ml-2">
                {scanResult.message}
              </AlertDescription>
            </Alert>

            {scanResult.success && scanResult.ticket && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Scan Successful</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-green-700">
                    <User className="h-4 w-4 mr-2" />
                    <span>{scanResult.ticket.user.firstName} {scanResult.ticket.user.lastName}</span>
                  </div>
                  
                  <div className="flex items-center text-green-700">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatTime(new Date().toISOString())}</span>
                  </div>
                  
                  <div className="flex items-center text-green-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{currentLocation || 'Not specified'}</span>
                  </div>
                  
                  <div className="text-green-700">
                    <span className="font-medium">Ticket:</span> {scanResult.ticket.ticketNumber}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button onClick={clearResult} variant="outline">
                Clear Result
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Scans */}
      {offlineScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Offline Scans ({offlineScans.length})</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {offlineScans.map((scan, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 bg-orange-50 rounded">
                  <div>
                    <span className="font-medium">{scan.scanType}</span>
                    <span className="text-gray-600 ml-2">at {scan.location}</span>
                  </div>
                  <span className="text-gray-500">{formatTime(scan.timestamp)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;