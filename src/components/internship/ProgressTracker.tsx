'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  User,
  FileText,
  Upload,
  Download,
  Plus,
  Edit,
  Target,
  TrendingUp
} from 'lucide-react';

// Types based on the design document
interface ActiveInternship {
  _id: string;
  internshipId: {
    _id: string;
    title: string;
    companyId: {
      name: string;
      contactPerson: {
        name: string;
        email: string;
        phone: string;
      };
    };
    location: string;
    duration: number;
    startDate: string;
    endDate: string;
  };
  studentId: string;
  status: 'active' | 'completed' | 'terminated';
  startedAt: string;
  completedAt?: string;
  supervisor?: {
    name: string;
    email: string;
    position: string;
  };
  overallRating?: number;
  finalEvaluation?: string;
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  weight: number; // Percentage weight of this milestone
  requirements: string[];
  deliverables: string[];
}

interface ProgressReport {
  _id?: string;
  internshipId: string;
  milestoneId?: string;
  reportType: 'weekly' | 'milestone' | 'final';
  weekNumber?: number;
  title: string;
  description: string;
  accomplishments: string[];
  challenges: string[];
  learnings: string[];
  nextSteps: string[];
  supervisorFeedback?: string;
  studentRating?: number;
  supervisorRating?: number;
  attachments: Array<{
    name: string;
    filename: string;
    uploadedAt: string;
  }>;
  submittedAt: string;
  reviewedAt?: string;
}

interface ProgressTrackerProps {
  internship: ActiveInternship;
  milestones: Milestone[];
  reports: ProgressReport[];
  onSubmitReport: (report: Omit<ProgressReport, '_id' | 'submittedAt'>) => void;
  onUploadFile: (file: File, reportId?: string) => void;
  onDownloadFile: (filename: string) => void;
  loading?: boolean;
  userRole: 'student' | 'supervisor' | 'admin';
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  internship,
  milestones,
  reports,
  onSubmitReport,
  onUploadFile,
  onDownloadFile,
  loading = false,
  userRole
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'weekly' | 'milestone' | 'final'>('weekly');
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    accomplishments: [''],
    challenges: [''],
    learnings: [''],
    nextSteps: ['']
  });

  // Calculate overall progress
  const calculateProgress = () => {
    const totalWeight = milestones.reduce((sum, milestone) => sum + milestone.weight, 0);
    const completedWeight = milestones
      .filter(milestone => milestone.status === 'completed')
      .reduce((sum, milestone) => sum + milestone.weight, 0);
    
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  // Get milestone status color
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get milestone status icon
  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle report submission
  const handleSubmitReport = () => {
    const report: Omit<ProgressReport, '_id' | 'submittedAt'> = {
      internshipId: internship._id,
      reportType,
      title: reportData.title,
      description: reportData.description,
      accomplishments: reportData.accomplishments.filter(item => item.trim() !== ''),
      challenges: reportData.challenges.filter(item => item.trim() !== ''),
      learnings: reportData.learnings.filter(item => item.trim() !== ''),
      nextSteps: reportData.nextSteps.filter(item => item.trim() !== ''),
      attachments: []
    };

    onSubmitReport(report);
    setShowReportModal(false);
    setReportData({
      title: '',
      description: '',
      accomplishments: [''],
      challenges: [''],
      learnings: [''],
      nextSteps: ['']
    });
  };

  // Add item to array field
  const addArrayItem = (field: keyof typeof reportData) => {
    setReportData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  // Update array item
  const updateArrayItem = (field: keyof typeof reportData, index: number, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  // Remove array item
  const removeArrayItem = (field: keyof typeof reportData, index: number) => {
    setReportData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const overallProgress = calculateProgress();
  const daysRemaining = getDaysRemaining(internship.internshipId.endDate);
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const overdueMilestones = milestones.filter(m => m.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Internship Progress</h1>
        <p className="text-gray-600 mt-1">
          Track your internship milestones and submit progress reports
        </p>
      </div>

      {/* Internship Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{internship.internshipId.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4" />
                {internship.internshipId.companyId.name}
              </CardDescription>
            </div>
            <Badge variant={internship.status === 'active' ? 'default' : 'secondary'}>
              {internship.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{internship.internshipId.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(internship.internshipId.startDate)} - {formatDate(internship.internshipId.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Completed'}</span>
            </div>
            {internship.supervisor && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{internship.supervisor.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={overallProgress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Milestones</p>
                <p className="text-2xl font-bold text-green-600">{completedMilestones}/{milestones.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{overdueMilestones}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Submitted</p>
                <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('milestones')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'milestones'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setSelectedTab('reports')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'reports'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
        </div>

        {userRole === 'student' && (
          <Button onClick={() => setShowReportModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        )}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 5).map((report, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <FileText className="h-4 w-4 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(report.submittedAt)}</p>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No reports submitted yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones
                  .filter(m => m.status !== 'completed')
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5)
                  .map((milestone, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      {getMilestoneStatusIcon(milestone.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{milestone.title}</p>
                        <p className="text-xs text-gray-500">Due: {formatDate(milestone.dueDate)}</p>
                      </div>
                    </div>
                  ))}
                {milestones.filter(m => m.status !== 'completed').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">All milestones completed!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'milestones' && (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <Card key={milestone._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getMilestoneStatusIcon(milestone.status)}
                    <div>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <CardDescription className="mt-1">{milestone.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMilestoneStatusColor(milestone.status)}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{milestone.weight}%</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {milestone.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {milestone.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <span>Due: {formatDate(milestone.dueDate)}</span>
                    {milestone.completedAt && (
                      <span className="ml-4">Completed: {formatDate(milestone.completedAt)}</span>
                    )}
                  </div>
                  {userRole === 'student' && milestone.status !== 'completed' && (
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'reports' && (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                      {report.weekNumber && ` - Week ${report.weekNumber}`}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(report.submittedAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Accomplishments</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.accomplishments.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Challenges</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.challenges.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 text-orange-500 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {report.supervisorFeedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Supervisor Feedback</h4>
                    <p className="text-sm text-blue-800">{report.supervisorFeedback}</p>
                  </div>
                )}

                {report.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.attachments.map((attachment, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadFile(attachment.filename)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {attachment.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {reports.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports submitted</h3>
                <p className="text-gray-600">Start by submitting your first progress report.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Report Submission Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Submit Progress Report</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="milestone">Milestone Report</SelectItem>
                      <SelectItem value="final">Final Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={reportData.title}
                    onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter report title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={reportData.description}
                    onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your progress and activities"
                    rows={3}
                  />
                </div>

                {/* Dynamic sections */}
                {(['accomplishments', 'challenges', 'learnings', 'nextSteps'] as const).map((section) => (
                  <div key={section}>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(section)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {reportData[section].map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => updateArrayItem(section, index, e.target.value)}
                            placeholder={`Enter ${section.slice(0, -1)}`}
                          />
                          {reportData[section].length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem(section, index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReport}>
                    Submit Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;