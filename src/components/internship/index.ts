export { default as InternshipBoard } from './InternshipBoard';
export { default as ApplicationTracker } from './ApplicationTracker';
export { default as CompanyDashboard } from './CompanyDashboard';
export { default as ProgressTracker } from './ProgressTracker';

// Export types for external use
export type {
  InternshipBoardProps,
  ApplicationTrackerProps,
  CompanyDashboardProps,
  ProgressTrackerProps
} from './types';

// Re-export common types that might be used by parent components
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

export interface FilterOptions {
  search: string;
  industry: string;
  workArrangement: string;
  minStipend: string;
  maxDuration: string;
  program: string;
}