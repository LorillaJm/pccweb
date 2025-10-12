'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Scan,
  RefreshCw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessScannerProps {
  facilityId: string;
  facilityName: string;
  onAccessGrant: (userId: string, accessData: AccessResult) => void;
  onAccessDeny: (reason: string, attemptData: AccessAttempt) => void;
  className?: string;
}

interface AccessResult {
  userId: string;
  userName: string;
  userRole: string;
  accessTime: string;
  facilityId: string;
  facilityName: string;
}

interface AccessAttempt {
  qrData: string;
  facilityId: string;
  attemptTime: string;
  reason: string;
}

interface ScanResult {
  success: boolean;
  data?: AccessResult;
  error?: string;
  timestamp: string;
}

export default function AccessScanner({ 
  facilityId, 
  facilityName, 
  onAccessGrant, 
  onAccessDeny, 
  className 
}: AccessScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request camera permission and start scanning
  const startScanning = async () => {
    try {
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
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  };

  // Stop scanning and release camera
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Simulate QR code scanning (in real implementation, use a QR library like jsQR)
  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // In a real implementation, you would use jsQR or similar library here
      // For demo purposes, we'll simulate QR detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simulate QR code detection and validation
      const mockQRData = await simulateQRDetection(imageData);
      
      if (mockQRData) {
        await validateAccess(mockQRData);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate QR code detection (replace with actual QR library)
  const simulateQRDetection = async (imageData: ImageData): Promise<string | null> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo, randomly return QR data or null
    const hasQR = Math.random() > 0.7; // 30% chance of detecting QR
    
    if (hasQR) {
      // Return mock QR data
      return JSON.stringify({
        userId: Math.floor(Math.random() * 1000),
        userName: 'John Doe',
        userRole: 'student',
        digitalIdHash: 'mock-hash-' + Date.now(),
        expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
      });
    }
    
    return null;
  };

  // Validate access based on QR data
  const validateAccess = async (qrData: string) => {
    try {
      const parsedData = JSON.parse(qrData);
      const now = new Date();
      const expiryDate = new Date(parsedData.expiresAt);

      // Check if ID is expired
      if (expiryDate < now) {
        const result: ScanResult = {
          success: false,
          error: 'Digital ID has expired',
          timestamp: now.toISOString()
        };
        setLastScanResult(result);
        setScanHistory(prev => [result, ...prev.slice(0, 9)]);
        
        onAccessDeny('Digital ID expired', {
          qrData,
          facilityId,
          attemptTime: now.toISOString(),
          reason: 'Digital ID expired'
        });
        return;
      }

      // Simulate access validation API call
      const response = await fetch('/api/campus-access/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData,
          facilityId,
          timestamp: now.toISOString()
        })
      });

      if (response.ok) {
        const accessData: AccessResult = {
          userId: parsedData.userId,
          userName: parsedData.userName,
          userRole: parsedData.userRole,
          accessTime: now.toISOString(),
          facilityId,
          facilityName
        };

        const result: ScanResult = {
          success: true,
          data: accessData,
          timestamp: now.toISOString()
        };

        setLastScanResult(result);
        setScanHistory(prev => [result, ...prev.slice(0, 9)]);
        onAccessGrant(parsedData.userId, accessData);
      } else {
        const errorData = await response.json();
        const result: ScanResult = {
          success: false,
          error: errorData.message || 'Access denied',
          timestamp: now.toISOString()
        };

        setLastScanResult(result);
        setScanHistory(prev => [result, ...prev.slice(0, 9)]);
        
        onAccessDeny(errorData.message || 'Access denied', {
          qrData,
          facilityId,
          attemptTime: now.toISOString(),
          reason: errorData.message || 'Access denied'
        });
      }
    } catch (error) {
      console.error('Error validating access:', error);
      const result: ScanResult = {
        success: false,
        error: 'Invalid QR code format',
        timestamp: new Date().toISOString()
      };

      setLastScanResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]);
      
      onAccessDeny('Invalid QR code', {
        qrData,
        facilityId,
        attemptTime: new Date().toISOString(),
        reason: 'Invalid QR code format'
      });
    }
  };

  // Auto-scan when video is playing
  useEffect(() => {
    if (isScanning && videoRef.current) {
      const interval = setInterval(scanQRCode, 1000); // Scan every second
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl font-semibold">Access Scanner</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Facility: <span className="font-medium">{facilityName}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" aria-label="Scanner settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Scan className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      isProcessing && "animate-pulse"
                    )} />
                    <p className="text-sm">
                      {isProcessing ? 'Processing...' : 'Position QR code here'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <CameraOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Camera not active</p>
                <p className="text-sm opacity-75">Click start to begin scanning</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex items-center gap-2 w-full sm:w-auto" aria-label="Start QR code scanning">
              <Camera className="h-4 w-4" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex items-center gap-2 w-full sm:w-auto" aria-label="Stop QR code scanning">
              <CameraOff className="h-4 w-4" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Permission Status */}
        {hasPermission === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Camera Access Required</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please allow camera access to scan QR codes for facility access.
            </p>
          </div>
        )}

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className={cn(
            "border rounded-lg p-4",
            lastScanResult.success 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {lastScanResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={cn(
                "font-medium",
                lastScanResult.success ? "text-green-800" : "text-red-800"
              )}>
                {lastScanResult.success ? 'Access Granted' : 'Access Denied'}
              </span>
              <Badge variant="outline" className="ml-auto">
                {new Date(lastScanResult.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
            
            {lastScanResult.success && lastScanResult.data ? (
              <div className="text-sm text-green-700">
                <p><strong>User:</strong> {lastScanResult.data.userName}</p>
                <p><strong>Role:</strong> {lastScanResult.data.userRole}</p>
                <p><strong>User ID:</strong> {lastScanResult.data.userId}</p>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                {lastScanResult.error}
              </p>
            )}
          </div>
        )}

        {/* Recent Scan History */}
        {scanHistory.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recent Scans</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 rounded text-sm",
                    scan.success ? "bg-green-50" : "bg-red-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {scan.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {scan.success 
                        ? scan.data?.userName || 'Access granted'
                        : scan.error || 'Access denied'
                      }
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}