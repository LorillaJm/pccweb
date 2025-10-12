// Alumni Portal Types

export interface AlumniProfile {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      photo?: string;
    };
  };
  graduationYear: number;
  degree: string;
  major?: string;
  currentPosition?: string;
  currentCompany?: string;
  industry?: string;
  location?: string;
  bio?: string;
  achievements: string[];
  skills: string[];
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  careerHistory: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  mentorshipAvailability: {
    isAvailable: boolean;
    expertise: string[];
    preferredMenteeLevel: string[];
    maxMentees: number;
  };
  privacySettings: {
    showContactInfo: boolean;
    showCareerHistory: boolean;
    allowDirectMessages: boolean;
  };
  isVerified: boolean;
}

export interface JobPosting {
  _id: string;
  posterId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  posterType: 'alumni' | 'company' | 'admin';
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  workType: 'full_time' | 'part_time' | 'contract' | 'internship';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationDeadline?: string;
  contactEmail: string;
  applicationInstructions?: string;
  targetAudience: 'students' | 'alumni' | 'both';
  preferredGraduationYears: number[];
  preferredPrograms: string[];
  status: 'active' | 'closed' | 'draft';
  applicationCount: number;
  viewCount: number;
  createdAt: string;
}

export interface MentorProfile {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      photo?: string;
    };
  };
  graduationYear: number;
  degree: string;
  currentPosition?: string;
  currentCompany?: string;
  industry?: string;
  expertise: string[];
  preferredMenteeLevel: string[];
  maxMentees: number;
  currentMentees: number;
  bio?: string;
  achievements: string[];
  isAvailable: boolean;
}

export interface Mentorship {
  _id: string;
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  menteeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: string;
  focusAreas: string[];
  status: 'requested' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  meetingSchedule?: string;
  goals: string[];
  progress: Array<{
    date: string;
    notes: string;
    milestones: string[];
    nextSteps: string[];
  }>;
  feedback?: {
    mentorFeedback?: string;
    menteeFeedback?: string;
    rating?: number;
  };
}

export interface AlumniEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  organizer: {
    firstName: string;
    lastName: string;
  };
  status: string;
  isPublic: boolean;
  targetAudience: 'alumni' | 'students' | 'both';
  availableSlots: number;
  isFull: boolean;
  isRegistrationOpen: boolean;
}

export interface AlumniFilters {
  search: string;
  graduationYear: string;
  degree: string;
  industry: string;
  location: string;
  mentorshipAvailable: boolean;
}

export interface JobFilters {
  search: string;
  workType: string;
  location: string;
  targetAudience: string;
  minSalary: string;
}

// Component Props
export interface AlumniDirectoryProps {
  alumni: AlumniProfile[];
  searchFilters: AlumniFilters;
  onConnect: (alumniId: string) => void;
  onFilterChange: (filters: AlumniFilters) => void;
  loading?: boolean;
  currentUserId?: string;
}

export interface JobBoardProps {
  jobs: JobPosting[];
  onApply: (jobId: string) => void;
  onFilterChange: (filters: JobFilters) => void;
  filters: JobFilters;
  userType: 'student' | 'alumni';
  loading?: boolean;
}

export interface MentorshipProgramProps {
  mentors: MentorProfile[];
  onRequestMentorship: (mentorId: string, message: string) => void;
  userMentorships?: Mentorship[];
  loading?: boolean;
}

export interface AlumniEventsProps {
  events: AlumniEvent[];
  onRegister: (eventId: string) => void;
  loading?: boolean;
  userType: 'student' | 'alumni';
}
