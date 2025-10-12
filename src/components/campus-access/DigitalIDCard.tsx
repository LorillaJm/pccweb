'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Share2, User, Calendar, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DigitalIDProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    role: 'student' | 'faculty' | 'staff' | 'admin';
    profilePicture?: string;
    studentId?: string;
    employeeId?: string;
  };
  qrCode: string;
  accessLevel: string;
  expiresAt: string;
  onRefresh: () => void;
  className?: string;
}

export default function DigitalIDCard({ 
  user, 
  qrCode, 
  accessLevel, 
  expiresAt, 
  onRefresh, 
  className 
}: DigitalIDProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState('');

  // Calculate time until expiry
  useEffect(() => {
    const updateTimeUntilExpiry = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilExpiry('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setTimeUntilExpiry(`${days} day${days > 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setTimeUntilExpiry(`${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilExpiry(`${minutes} minute${minutes > 1 ? 's' : ''}`);
      }
    };

    updateTimeUntilExpiry();
    const interval = setInterval(updateTimeUntilExpiry, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = () => {
    // Create a canvas to generate the ID card image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 250;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw header
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PCC Digital ID', 20, 30);

    // Draw user info
    ctx.font = '14px Arial';
    ctx.fillText(`${user.firstName} ${user.lastName}`, 20, 60);
    ctx.fillText(`${user.role.toUpperCase()}`, 20, 80);
    ctx.fillText(`ID: ${user.studentId || user.employeeId || user.id}`, 20, 100);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-id-${user.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PCC Digital ID',
          text: `Digital ID for ${user.firstName} ${user.lastName}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'restricted': return 'bg-yellow-100 text-yellow-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg sm:text-xl font-semibold">Digital ID Card</CardTitle>
          <div className="flex gap-2 justify-end sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh digital ID"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} aria-label="Download digital ID">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} aria-label="Share digital ID">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Photo and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 sm:h-8 sm:w-8 text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="text-lg font-semibold truncate">
              {user.firstName} {user.middleName && `${user.middleName.charAt(0)}.`} {user.lastName}
            </h3>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
              <Badge className={getRoleColor(user.role)}>
                {user.role.toUpperCase()}
              </Badge>
              <Badge className={getAccessLevelColor(accessLevel)}>
                {accessLevel}
              </Badge>
            </div>
          </div>
        </div>

        {/* ID Numbers */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">ID Number:</span>
            <p className="font-medium">{user.studentId || user.employeeId || user.id}</p>
          </div>
          <div>
            <span className="text-gray-500">Access Level:</span>
            <p className="font-medium capitalize">{accessLevel}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-2 py-4 bg-gray-50 rounded-lg" role="region" aria-label="QR Code Section">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img
              src={qrCode}
              alt={`Digital ID QR Code for ${user.firstName} ${user.lastName}`}
              className="w-32 h-32"
              role="img"
              aria-describedby="qr-description"
            />
          </div>
          <p id="qr-description" className="text-xs text-gray-500 text-center">
            Scan this QR code for facility access
          </p>
        </div>

        {/* Expiry Information */}
        <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800">Expires in:</span>
          </div>
          <span className={cn(
            "font-medium",
            timeUntilExpiry === 'Expired' ? "text-red-600" : "text-blue-800"
          )}>
            {timeUntilExpiry}
          </span>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
          <Shield className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p>
            This digital ID is for authorized access only. Do not share your QR code with others. 
            Report any suspicious activity immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}