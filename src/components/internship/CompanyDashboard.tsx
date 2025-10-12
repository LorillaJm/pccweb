'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Briefcase, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  MapPin,
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  Star,
  GraduationCap
} from 'lucide-react';

// Types based on the design document
interface Company {
  _id: string;
  name: string;
  description: string;
  industry: string;
  website?: string;
  address: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  partnershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
}

interface InternshipApplication {
  _id: string;
  internshipId: {
    _id: string;
    title: string;
  };
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      program: string;
      yearLevel: number;
      gpa?: number;
    };
  };
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
  feedback?: string;
  interviewSchedule?: {
    date: string;
    time: string;
    location: string;
    type: 'in_person' | 'video_call' | 'phone';
  };
}

interface Internship {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  duration: number;
  stipend: number;
  location: string;
  workArrangement: 'onsite' | 'remote' | 'hybrid';
  slots: number;
  filledSlots: number;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'closed' | 'completed';
  targetPrograms: string[];
  yearLevelRequirement: number;
  applicationsCount?: number;
}

interface CompanyDashboardProps {
  company: Company;
  applications: InternshipApplication[];
  internships: Internship[];
  onUpdateStatus: (applicationId: string, status: string, feedback?: string) => void;
  onScheduleInterview: (applicationId: string, schedule: any) => void;
  onDownloadDocument: (filename: string) => void;
  onCreateInternship: (internshipData: any) => void;
  loading?: boolean;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  company,
  applications,
  internships,
  onUpdateStatus,
  onScheduleInterview,
  onDownloadDocument,
  onCreateInternship,
  loading = false
}) => {
  const [selectedTab, setSelectedTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'shortlisted':
        return <Star className="h-4 w-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.studentId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internshipId.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'submitted').length;
    const reviewing = applications.filter(app => app.status === 'under_review').length;
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;

    return { total, pending, reviewing, shortlisted, accepted };
  };

  const getInternshipStats = () => {
    const total = internships.length;
    const active = internships.filter(i => i.status === 'published').length;
    const totalSlots = internships.reduce((sum, i) => sum + i.slots, 0);
    const filledSlots = internships.reduce((sum, i) => sum + i.filledSlots, 0);

    return { total, active, totalSlots, filledSlots };
  };

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    onUpdateStatus(applicationId, newStatus, feedback);
    setFeedback('');
    setSelectedApplication(null);
  };

  const stats = getApplicationStats();
  const internshipStats = getInternshipStats();
  const filteredApplications = filterApplications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{company.name} Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your internship postings and applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={company.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {company.verificationStatus}
          </Badge>
          <Badge variant="outline">
            {company.partnershipLevel}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Internships</p>
                <p className="text-2xl font-bold text-green-600">{internshipStats.active}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Slots Filled</p>
                <p className="text-2xl font-bold text-purple-600">
                  {internshipStats.filledSlots}/{internshipStats.totalSlots}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Applications ({stats.total})</TabsTrigger>
          <TabsTrigger value="internships">Internships ({internshipStats.total})</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">
                  No applications match your current filters.
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
                          {application.studentId.firstName} {application.studentId.lastName}
                          {getStatusIcon(application.status)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Applied for: {application.internshipId.title}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Student Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Email: {application.studentId.email}</p>
                        {application.studentId.profile && (
                          <>
                            <p className="text-gray-600">Program: {application.studentId.profile.program}</p>
                            <p className="text-gray-600">Year Level: {application.studentId.profile.yearLevel}</p>
                            {application.studentId.profile.gpa && (
                              <p className="text-gray-600">GPA: {application.studentId.profile.gpa}</p>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">Applied: {formatDate(application.submittedAt)}</p>
                        {application.reviewedAt && (
                          <p className="text-gray-600">Reviewed: {formatDate(application.reviewedAt)}</p>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded">
                        {application.coverLetter}
                      </p>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadDocument(application.resume)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                        {application.additionalDocuments.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => onDownloadDocument(doc.filename)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {doc.name}
                          </Button>
                        ))}
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
                      </div>
                    )}

                    {/* Actions */}
                    {application.status !== 'accepted' && application.status !== 'rejected' && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        {application.status === 'submitted' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application._id, 'under_review')}
                          >
                            Start Review
                          </Button>
                        )}
                        
                        {['submitted', 'under_review'].includes(application.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                          >
                            Shortlist
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleStatusUpdate(application._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedApplication(application._id);
                            // You would open a modal here for feedback
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Internships Tab */}
        <TabsContent value="internships" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Internship Postings</h2>
            <Button onClick={() => {/* Open create internship modal */}}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Internship
            </Button>
          </div>

          {internships.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships posted</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first internship posting.
                </p>
                <Button onClick={() => {/* Open create internship modal */}}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Internship
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internships.map((internship) => (
                <Card key={internship._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{internship.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {internship.location}
                        </CardDescription>
                      </div>
                      <Badge variant={internship.status === 'published' ? 'default' : 'secondary'}>
                        {internship.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {internship.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Duration: {internship.duration} weeks</p>
                        <p className="text-gray-600">Slots: {internship.filledSlots}/{internship.slots}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Applications: {internship.applicationsCount || 0}</p>
                        <p className="text-gray-600">Deadline: {formatDate(internship.applicationDeadline)}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Applications
                      </Button>
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

export default CompanyDashboard;