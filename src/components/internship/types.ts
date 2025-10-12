// Core data types
export interface Internship {
  _id: string;
  companyId: {
    _id: string;
    name: string;
    industry: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
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
  createdAt: string;
  applicationsCount?: number;
}

export interface InternshipApplication {
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
  studentId: string | {
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
  reviewedBy?: string;
  feedback?: string;
  interviewSchedule?: {
    date: string;
    time: string;
    location: string;
    type: 'in_person' | 'video_call' | 'phone';
  };
}

export interface Company {
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

export interface ActiveInternship {
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

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  weight: number;
  requirements: string[];
  deliverables: string[];
}

export interface ProgressReport {
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

export interface FilterOptions {
  search: string;
  industry: string;
  workArrangement: string;
  minStipend: string;
  maxDuration: string;
  program: string;
}

// Component prop types
export interface InternshipBoardProps {
  internships: Internship[];
  filters: FilterOptions;
  onApply: (internshipId: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  loading?: boolean;
  userProgram?: string;
  userYearLevel?: number;
}

export interface ApplicationTrackerProps {
  applications: InternshipApplication[];
  onWithdraw: (applicationId: string) => void;
  onDownloadDocument: (filename: string) => void;
  loading?: boolean;
}

export interface CompanyDashboardProps {
  company: Company;
  applications: InternshipApplication[];
  internships: Internship[];
  onUpdateStatus: (applicationId: string, status: string, feedback?: string) => void;
  onScheduleInterview: (applicationId: string, schedule: any) => void;
  onDownloadDocument: (filename: string) => void;
  onCreateInternship: (internshipData: any) => void;
  loading?: boolean;
}

export interface ProgressTrackerProps {
  internship: ActiveInternship;
  milestones: Milestone[];
  reports: ProgressReport[];
  onSubmitReport: (report: Omit<ProgressReport, '_id' | 'submittedAt'>) => void;
  onUploadFile: (file: File, reportId?: string) => void;
  onDownloadFile: (filename: string) => void;
  loading?: boolean;
  userRole: 'student' | 'supervisor' | 'admin';
}