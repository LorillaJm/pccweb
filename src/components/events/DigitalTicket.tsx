'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Mail, 
  Download, 
  Share2, 
  QrCode,
  Ticket as TicketIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Ticket {
  _id: string;
  ticketNumber: string;
  qrCode: string;
  qrCodeImage: string;
  status: 'active' | 'used' | 'cancelled' | 'expired';
  issuedAt: string;
  expiresAt?: string;
  attendanceRecords: Array<{
    scannedAt: string;
    location: string;
    scanType: string;
  }>;
  eventId: {
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    venue: string;
    organizer: {
      firstName: string;
      lastName: string;
    };
  };
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  registrationData?: {
    specialRequests?: string;
    dietaryRestrictions?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
}

interface DigitalTicketProps {
  ticket: Ticket;
  onDownload: () => void;
  onShare: () => void;
  showQRCode?: boolean;
  compact?: boolean;
}

const DigitalTicket: React.FC<DigitalTicketProps> = ({
  ticket,
  onDownload,
  onShare,
  showQRCode = true,
  compact = false
}) => {
  const [qrCodeExpanded, setQrCodeExpanded] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 border-blue-200',
      cultural: 'bg-purple-100 text-purple-800 border-purple-200',
      sports: 'bg-green-100 text-green-800 border-green-200',
      seminar: 'bg-orange-100 text-orange-800 border-orange-200',
      workshop: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      conference: 'bg-red-100 text-red-800 border-red-200',
      social: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800">Used</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{ticket.status}</Badge>;
    }
  };

  const getStatusAlert = () => {
    if (ticket.status === 'cancelled') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This ticket has been cancelled and is no longer valid for entry.
          </AlertDescription>
        </Alert>
      );
    }

    if (ticket.status === 'expired') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This ticket has expired and is no longer valid for entry.
          </AlertDescription>
        </Alert>
      );
    }

    if (ticket.status === 'used' && ticket.attendanceRecords.length > 0) {
      const lastAttendance = ticket.attendanceRecords[ticket.attendanceRecords.length - 1];
      return (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Ticket used on {formatDateTime(lastAttendance.scannedAt)} at {lastAttendance.location}
          </AlertDescription>
        </Alert>
      );
    }

    if (ticket.expiresAt && new Date(ticket.expiresAt) < new Date()) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This ticket expired on {formatDateTime(ticket.expiresAt)}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const handleDownloadTicket = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow && ticketRef.current) {
      const ticketHTML = ticketRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Event Ticket - ${ticket.ticketNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .ticket { max-width: 600px; margin: 0 auto; }
              .qr-code { text-align: center; margin: 20px 0; }
              .qr-code img { max-width: 200px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="ticket">${ticketHTML}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    onDownload();
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TicketIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-sm">{ticket.eventId.title}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(ticket.eventId.startDate)} • {ticket.ticketNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              <Button size="sm" variant="outline" onClick={() => setQrCodeExpanded(!qrCodeExpanded)}>
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {qrCodeExpanded && showQRCode && (
            <div className="mt-4 text-center">
              <img
                src={ticket.qrCodeImage}
                alt="QR Code"
                className="mx-auto w-32 h-32"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden" ref={ticketRef}>
        {/* Ticket Header */}
        <CardHeader className={`${getCategoryColor(ticket.eventId.category)} border-b`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TicketIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Event Ticket</span>
              </div>
              <CardTitle className="text-xl">{ticket.eventId.title}</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Status Alert */}
          {getStatusAlert()}

          {/* Event Details */}
          <div>
            <h3 className="font-semibold mb-3">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(ticket.eventId.startDate)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatTime(ticket.eventId.startDate)} - {formatTime(ticket.eventId.endDate)}</span>
              </div>
              
              <div className="flex items-center text-gray-600 md:col-span-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{ticket.eventId.venue}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ticket Information */}
          <div>
            <h3 className="font-semibold mb-3">Ticket Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Ticket Number:</span>
                <p className="font-mono font-medium">{ticket.ticketNumber}</p>
              </div>
              
              <div>
                <span className="text-gray-600">Issued:</span>
                <p>{formatDateTime(ticket.issuedAt)}</p>
              </div>
              
              {ticket.expiresAt && (
                <div>
                  <span className="text-gray-600">Expires:</span>
                  <p>{formatDateTime(ticket.expiresAt)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Attendee Information */}
          <div>
            <h3 className="font-semibold mb-3">Attendee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{ticket.userId.firstName} {ticket.userId.lastName}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{ticket.userId.email}</span>
              </div>
            </div>

            {/* Special Requests */}
            {ticket.registrationData?.specialRequests && (
              <div className="mt-3">
                <span className="text-gray-600 text-sm">Special Requests:</span>
                <p className="text-sm mt-1">{ticket.registrationData.specialRequests}</p>
              </div>
            )}

            {/* Dietary Restrictions */}
            {ticket.registrationData?.dietaryRestrictions && ticket.registrationData.dietaryRestrictions.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-600 text-sm">Dietary Restrictions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.registrationData.dietaryRestrictions.map((restriction, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          {showQRCode && ticket.status === 'active' && (
            <>
              <Separator />
              <div className="text-center">
                <h3 className="font-semibold mb-3">Entry QR Code</h3>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={ticket.qrCodeImage}
                    alt="Entry QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Present this QR code at the event entrance
                </p>
              </div>
            </>
          )}

          {/* Attendance History */}
          {ticket.attendanceRecords.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Attendance History</h3>
                <div className="space-y-2">
                  {ticket.attendanceRecords.map((record, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{record.scanType}</span>
                        <span className="text-gray-600 ml-2">at {record.location}</span>
                      </div>
                      <span className="text-gray-500">{formatDateTime(record.scannedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Organizer Information */}
          <Separator />
          <div className="text-center text-sm text-gray-600">
            <p>Organized by {ticket.eventId.organizer.firstName} {ticket.eventId.organizer.lastName}</p>
          </div>
        </CardContent>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t no-print">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadTicket} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download/Print
            </Button>
            
            <Button onClick={onShare} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DigitalTicket;