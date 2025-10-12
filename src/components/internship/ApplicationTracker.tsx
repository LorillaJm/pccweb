'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  Building2,
  MapPin,
  FileText,
  Download,
  Trash2
} from 'lucide-react';

// Types based on the design document
interface InternshipApplication {
  _id: string;
  internshipId: {
    _id: string;
    title: string;
    companyId: {
      name: string;
      industry: string;
    };
    location: string;
    duration: number;
    stipend: number;
    startDate: string;
    endDate: string;
  };
  studentId: string;
  coverLetter: string;
  resume: string;
  additionalDocuments: Array<{
    name: string;
    filename: string;
    uploadedAt: string;
  }>;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  interviewSchedule?: {
    date: string;
    time: string;
    location: string;
    type: 'in_person' | 'video_call' | 'phone';
  };
}

interface ApplicationTrackerProps {
  applications: InternshipApplication[];
  onWithdraw: (applicationId: string) => void;
  onDownloadDocument: (filename: string) => void;
  loading?: boolean;
}

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onWithdraw,
  onDownloadDocument,
  loading = false
}) => {
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'shortlisted':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  const filterApplications = (status: string) => {
    if (status === 'all') return applications;
    if (status === 'active') {
      return applications.filter(app => 
        ['submitted', 'under_review', 'shortlisted'].includes(app.status)
      );
    }
    if (status === 'completed') {
      return applications.filter(app => 
        ['accepted', 'rejected', 'withdrawn'].includes(app.status)
      );
    }
    return applications.filter(app => app.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStipend = (amount: number) => {
    if (amount === 0) return 'Unpaid';
    return `₱${amount.toLocaleString()}`;
  };

  const canWithdraw = (status: string) => {
    return ['submitted', 'under_review'].includes(status);
  };

  const filteredApplications = filterApplications(selectedTab);

  const getApplicationCounts = () => {
    return {
      all: applications.length,
      active: applications.filter(app => 
        ['submitted', 'under_review', 'shortlisted'].includes(app.status)
      ).length,
      completed: applications.filter(app => 
        ['accepted', 'rejected', 'withdrawn'].includes(app.status)
      ).length
    };
  };

  const counts = getApplicationCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your internship applications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-orange-600">{counts.active}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{counts.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">
                  {selectedTab === 'all' 
                    ? "You haven't submitted any applications yet."
                    : `No ${selectedTab} applications found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application._id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {application.internshipId.title}
                          {getStatusIcon(application.status)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Building2 className="h-4 w-4" />
                          {application.internshipId.companyId.name}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Internship Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{application.internshipId.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{application.internshipId.duration} weeks</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {formatDate(application.submittedAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>Stipend: {formatStipend(application.internshipId.stipend)}</span>
                      </div>
                    </div>

                    {/* Interview Schedule */}
                    {application.interviewSchedule && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Interview Scheduled</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><strong>Date:</strong> {formatDate(application.interviewSchedule.date)}</p>
                          <p><strong>Time:</strong> {application.interviewSchedule.time}</p>
                          <p><strong>Type:</strong> {application.interviewSchedule.type.replace('_', ' ')}</p>
                          <p><strong>Location:</strong> {application.interviewSchedule.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {application.feedback && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                        <p className="text-sm text-gray-700">{application.feedback}</p>
                        {application.reviewedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Reviewed on {formatDateTime(application.reviewedAt)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Submitted Documents</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Resume</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadDocument(application.resume)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {application.additionalDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{doc.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDownloadDocument(doc.filename)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4 border-t">
                      {canWithdraw(application.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onWithdraw(application._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Withdraw Application
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationTracker;