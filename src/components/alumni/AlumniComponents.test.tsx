/**
 * Manual Test Component for Alumni Portal Components
 * This file can be used to manually test the Alumni Portal components
 * To use: Import and render this component in a test page
 */

'use client';

import React, { useState } from 'react';
import AlumniDirectory from './AlumniDirectory';
import JobBoard from './JobBoard';
import MentorshipProgram from './MentorshipProgram';
import AlumniEvents from './AlumniEvents';
import { 
  AlumniProfile, 
  JobPosting, 
  MentorProfile, 
  AlumniEvent,
  AlumniFilters,
  JobFilters
} from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockAlumniProfiles: AlumniProfile[] = [
  {
    _id: '1',
    userId: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    graduationYear: 2020,
    degree: 'Computer Science',
    major: 'Software Engineering',
    currentPosition: 'Senior Software Engineer',
    currentCompany: 'Tech Corp',
    industry: 'Technology',
    location: 'Manila, Philippines',
    bio: 'Passionate about building scalable systems',
    achievements: ['Led team of 5 developers', 'Launched 3 major products'],
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      facebook: 'https://facebook.com/johndoe'
    },
    careerHistory: [
      {
        position: 'Senior Software Engineer',
        company: 'Tech Corp',
        startDate: '2022-01-01',
        description: 'Leading development team'
      }
    ],
    mentorshipAvailability: {
      isAvailable: true,
      expertise: ['Web Development', 'Career Guidance'],
      preferredMenteeLevel: ['undergraduate', 'new_graduate'],
      maxMentees: 3
    },
    privacySettings: {
      showContactInfo: true,
      showCareerHistory: true,
      allowDirectMessages: true
    },
    isVerified: true
  },
  {
    _id: '2',
    userId: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    },
    graduationYear: 2019,
    degree: 'Business Administration',
    currentPosition: 'Marketing Manager',
    currentCompany: 'Marketing Inc',
    industry: 'Marketing',
    location: 'Quezon City, Philippines',
    bio: 'Digital marketing expert',
    achievements: ['Increased ROI by 200%'],
    skills: ['SEO', 'Content Marketing', 'Analytics'],
    socialLinks: {},
    careerHistory: [],
    mentorshipAvailability: {
      isAvailable: false,
      expertise: [],
      preferredMenteeLevel: [],
      maxMentees: 0
    },
    privacySettings: {
      showContactInfo: false,
      showCareerHistory: true,
      allowDirectMessages: true
    },
    isVerified: false
  }
];

const mockJobPostings: JobPosting[] = [
  {
    _id: 'job1',
    posterId: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe'
    },
    posterType: 'alumni',
    title: 'Software Developer',
    company: 'Tech Corp',
    description: 'Looking for talented developers',
    requirements: ['3+ years experience', 'Strong JavaScript skills'],
    skills: ['JavaScript', 'React', 'Node.js'],
    location: 'Manila, Philippines',
    workType: 'full_time',
    salaryRange: {
      min: 50000,
      max: 80000,
      currency: 'PHP'
    },
    applicationDeadline: '2025-12-31',
    contactEmail: 'jobs@techcorp.com',
    targetAudience: 'both',
    preferredGraduationYears: [2020, 2021, 2022],
    preferredPrograms: ['Computer Science', 'Information Technology'],
    status: 'active',
    applicationCount: 15,
    viewCount: 120,
    createdAt: '2025-01-01'
  },
  {
    _id: 'job2',
    posterId: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith'
    },
    posterType: 'alumni',
    title: 'Marketing Intern',
    company: 'Marketing Inc',
    description: 'Internship opportunity for students',
    requirements: ['Currently enrolled', 'Good communication skills'],
    skills: ['Social Media', 'Content Writing'],
    location: 'Remote',
    workType: 'internship',
    contactEmail: 'hr@marketinginc.com',
    targetAudience: 'students',
    preferredGraduationYears: [],
    preferredPrograms: ['Business Administration', 'Marketing'],
    status: 'active',
    applicationCount: 8,
    viewCount: 45,
    createdAt: '2025-01-15'
  }
];

const mockMentors: MentorProfile[] = [
  {
    _id: '1',
    userId: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    graduationYear: 2020,
    degree: 'Computer Science',
    currentPosition: 'Senior Software Engineer',
    currentCompany: 'Tech Corp',
    industry: 'Technology',
    expertise: ['Web Development', 'Career Guidance', 'Technical Leadership'],
    preferredMenteeLevel: ['undergraduate', 'new_graduate'],
    maxMentees: 3,
    currentMentees: 1,
    bio: 'Passionate about helping students transition to tech careers',
    achievements: ['Led team of 5 developers', 'Launched 3 major products'],
    isAvailable: true
  }
];

const mockAlumniEvents: AlumniEvent[] = [
  {
    _id: 'event1',
    title: 'Alumni Networking Night',
    description: 'Connect with fellow alumni',
    category: 'networking',
    startDate: '2025-03-15T18:00:00Z',
    endDate: '2025-03-15T21:00:00Z',
    venue: 'PCC Main Campus',
    capacity: 100,
    registeredCount: 45,
    organizer: {
      firstName: 'Admin',
      lastName: 'User'
    },
    status: 'published',
    isPublic: true,
    targetAudience: 'alumni',
    availableSlots: 55,
    isFull: false,
    isRegistrationOpen: true
  },
  {
    _id: 'event2',
    title: 'Career Development Workshop',
    description: 'Learn about career advancement',
    category: 'career',
    startDate: '2025-04-20T14:00:00Z',
    endDate: '2025-04-20T17:00:00Z',
    venue: 'Online',
    capacity: 50,
    registeredCount: 50,
    organizer: {
      firstName: 'John',
      lastName: 'Doe'
    },
    status: 'published',
    isPublic: true,
    targetAudience: 'both',
    availableSlots: 0,
    isFull: true,
    isRegistrationOpen: true
  }
];

// Test Component
export const AlumniComponentsTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('directory');
  
  // Alumni Directory State
  const [alumniFilters, setAlumniFilters] = useState<AlumniFilters>({
    search: '',
    graduationYear: '',
    degree: '',
    industry: '',
    location: '',
    mentorshipAvailable: false
  });

  // Job Board State
  const [jobFilters, setJobFilters] = useState<JobFilters>({
    search: '',
    workType: '',
    location: '',
    targetAudience: '',
    minSalary: ''
  });

  // Event handlers
  const handleConnect = (alumniId: string) => {
    console.log('Connect with alumni:', alumniId);
    alert(`Connection request sent to alumni ${alumniId}`);
  };

  const handleApplyJob = (jobId: string) => {
    console.log('Apply for job:', jobId);
    alert(`Application submitted for job ${jobId}`);
  };

  const handleRequestMentorship = (mentorId: string, message: string) => {
    console.log('Request mentorship:', mentorId, message);
    alert(`Mentorship request sent to mentor ${mentorId}`);
  };

  const handleRegisterEvent = (eventId: string) => {
    console.log('Register for event:', eventId);
    alert(`Registered for event ${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Alumni Portal Components Test</h1>
          <p className="text-gray-600">
            Manual testing interface for all alumni portal components
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory">Alumni Directory</TabsTrigger>
            <TabsTrigger value="jobs">Job Board</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Alumni Directory Test</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Test Features:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Search alumni by name, company, position, or industry</li>
                  <li>Filter by graduation year, degree, industry, and location</li>
                  <li>Filter by mentorship availability</li>
                  <li>View alumni profiles with career information</li>
                  <li>Connect with alumni via messaging or email</li>
                  <li>Responsive grid layout (1/2/3 columns)</li>
                </ul>
              </div>
            </div>
            <AlumniDirectory
              alumni={mockAlumniProfiles}
              searchFilters={alumniFilters}
              onConnect={handleConnect}
              onFilterChange={setAlumniFilters}
              currentUserId="current-user-id"
            />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Job Board Test</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Test Features:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Search jobs by title, company, or keywords</li>
                  <li>Filter by work type, location, and target audience</li>
                  <li>Filter by minimum salary</li>
                  <li>View job details including requirements and skills</li>
                  <li>Apply for jobs with one click</li>
                  <li>Responsive grid layout (1/2 columns)</li>
                </ul>
              </div>
            </div>
            <JobBoard
              jobs={mockJobPostings}
              onApply={handleApplyJob}
              onFilterChange={setJobFilters}
              filters={jobFilters}
              userType="student"
            />
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mentorship Program Test</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Test Features:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Search mentors by name, expertise, or industry</li>
                  <li>View mentor profiles with expertise and achievements</li>
                  <li>Check mentor availability and current mentee count</li>
                  <li>Request mentorship with a personalized message</li>
                  <li>View mentorship statistics (active, pending, completed)</li>
                  <li>Responsive grid layout (1/2/3 columns)</li>
                </ul>
              </div>
            </div>
            <MentorshipProgram
              mentors={mockMentors}
              onRequestMentorship={handleRequestMentorship}
              userMentorships={[]}
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Alumni Events Test</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Test Features:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Search events by title, description, or venue</li>
                  <li>Filter by category and target audience</li>
                  <li>View event details with date, time, and location</li>
                  <li>See registration progress and capacity</li>
                  <li>Register for events with one click</li>
                  <li>Responsive grid layout (1/2/3 columns)</li>
                </ul>
              </div>
            </div>
            <AlumniEvents
              events={mockAlumniEvents}
              onRegister={handleRegisterEvent}
              userType="alumni"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
