const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./server');
const User = require('./models/User');
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const JobApplication = require('./models/JobApplication');
const Mentorship = require('./models/Mentorship');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const EventTicket = require('./models/EventTicket');
const JobWorkflowService = require('./services/JobWorkflowService');
const MentorshipMatchingService = require('./services/MentorshipMatchingService');

describe('Alumni Job Board and Mentorship Integration Tests', () => {
  let testUsers = {};
  let testAlumniProfiles = {};
  let testJobs = {};
  let testEvents = {};
  let authTokens = {};
  let jobWorkflowService;
  let mentorshipMatchingService;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal');
    }

    // Initialize services
    jobWorkflowService = new JobWorkflowService();
    mentorshipMatchingService = new MentorshipMatchingService();

    // Clean up existing test data
    await Promise.all([
      User.deleteMany({ email: /test.*@jobmentorship\.test/ }),
      AlumniProfile.deleteMany({}),
      JobPosting.deleteMany({}),
      JobApplication.deleteMany({}),
      Mentorship.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      EventTicket.deleteMany({})
    ]);

    // Create diverse test users with different experience levels
    const users = [
      {
        firstName: 'Senior',
        lastName: 'Developer',
        email: 'senior.dev@jobmentorship.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Junior',
        lastName: 'Developer',
        email: 'junior.dev@jobmentorship.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Marketing',
        lastName: 'Manager',
        email: 'marketing.mgr@jobmentorship.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Recent',
        lastName: 'Graduate',
        email: 'recent.grad@jobmentorship.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@jobmentorship.test',
        password: 'password123',
        role: 'admin',
        isActive: true
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      testUsers[userData.firstName.toLowerCase()] = user;

      // Get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });
      
      authTokens[userData.firstName.toLowerCase()] = loginResponse.body.token;
    }

    // Create alumni profiles with different experience levels
    const alumniProfiles = [
      {
        userId: testUsers.senior._id,
        graduationYear: 2015,
        degree: 'Computer Science',
        currentPosition: 'Senior Software Engineer',
        currentCompany: 'Tech Giant Corp',
        industry: 'Technology',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Leadership'],
        careerHistory: [
          {
            position: 'Junior Developer',
            company: 'Startup Inc',
            startDate: new Date('2015-06-01'),
            endDate: new Date('2017-05-31'),
            isCurrent: false
          },
          {
            position: 'Software Engineer',
            company: 'Mid-size Tech',
            startDate: new Date('2017-06-01'),
            endDate: new Date('2020-03-31'),
            isCurrent: false
          },
          {
            position: 'Senior Software Engineer',
            company: 'Tech Giant Corp',
            startDate: new Date('2020-04-01'),
            isCurrent: true
          }
        ],
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Web Development', 'Career Guidance', 'Technical Leadership'],
          maxMentees: 3,
          currentMentees: 0
        },
        verificationStatus: 'verified'
      },
      {
        userId: testUsers.junior._id,
        graduationYear: 2021,
        degree: 'Computer Science',
        currentPosition: 'Software Developer',
        currentCompany: 'Growing Startup',
        industry: 'Technology',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        careerHistory: [
          {
            position: 'Junior Developer',
            company: 'First Job Corp',
            startDate: new Date('2021-07-01'),
            endDate: new Date('2022-12-31'),
            isCurrent: false
          },
          {
            position: 'Software Developer',
            company: 'Growing Startup',
            startDate: new Date('2023-01-01'),
            isCurrent: true
          }
        ],
        mentorshipAvailability: {
          isAvailable: false
        },
        verificationStatus: 'verified'
      },
      {
        userId: testUsers.marketing._id,
        graduationYear: 2018,
        degree: 'Business Administration',
        currentPosition: 'Marketing Manager',
        currentCompany: 'Marketing Agency',
        industry: 'Marketing',
        skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Leadership'],
        careerHistory: [
          {
            position: 'Marketing Coordinator',
            company: 'Small Agency',
            startDate: new Date('2018-08-01'),
            endDate: new Date('2020-07-31'),
            isCurrent: false
          },
          {
            position: 'Marketing Manager',
            company: 'Marketing Agency',
            startDate: new Date('2020-08-01'),
            isCurrent: true
          }
        ],
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Marketing Strategy', 'Career Development', 'Leadership'],
          maxMentees: 2,
          currentMentees: 0
        },
        verificationStatus: 'verified'
      },
      {
        userId: testUsers.recent._id,
        graduationYear: 2024,
        degree: 'Computer Science',
        currentPosition: 'Intern',
        currentCompany: 'Tech Startup',
        industry: 'Technology',
        skills: ['Python', 'Django', 'PostgreSQL'],
        careerHistory: [
          {
            position: 'Intern',
            company: 'Tech Startup',
            startDate: new Date('2024-06-01'),
            isCurrent: true
          }
        ],
        mentorshipAvailability: {
          isAvailable: false
        },
        verificationStatus: 'verified'
      }
    ];

    for (const profileData of alumniProfiles) {
      const profile = new AlumniProfile(profileData);
      await profile.save();
      const userName = Object.keys(testUsers).find(key => 
        testUsers[key]._id.toString() === profileData.userId.toString()
      );
      testAlumniProfiles[userName] = profile;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await Promise.all([
      User.deleteMany({ email: /test.*@jobmentorship\.test/ }),
      AlumniProfile.deleteMany({}),
      JobPosting.deleteMany({}),
      JobApplication.deleteMany({}),
      Mentorship.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      EventTicket.deleteMany({})
    ]);

    await mongoose.connection.close();
  });

  describe('Enhanced Job Board Workflow', () => {
    test('should create job posting and submit for approval', async () => {
      const jobData = {
        title: 'Senior Full Stack Developer',
        company: 'Innovation Corp',
        description: 'Looking for an experienced full stack developer to lead our development team',
        location: 'Manila',
        workType: 'full_time',
        workArrangement: 'hybrid',
        experienceLevel: 'senior',
        contactEmail: 'hr@innovationcorp.com',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        targetAudience: 'alumni',
        salaryRange: {
          min: 80000,
          max: 120000,
          currency: 'PHP'
        },
        benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
        companyInfo: {
          industry: 'Technology',
          size: 'medium',
          description: 'Leading innovation in software development'
        }
      };

      const response = await request(app)
        .post('/api/alumni/jobs')
        .set('Authorization', `Bearer ${authTokens.senior}`)
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('draft');

      testJobs.seniorFullStack = response.body.data;

      // Submit for approval
      const approvalResponse = await request(app)
        .put(`/api/alumni/jobs/${testJobs.seniorFullStack._id}/submit-approval`)
        .set('Authorization', `Bearer ${authTokens.senior}`);

      expect(approvalResponse.status).toBe(200);
      expect(approvalResponse.body.data.status).toBe('pending_approval');
    });

    test('should auto-match candidates to job posting', async () => {
      const matches = await jobWorkflowService.autoMatchCandidates(testJobs.seniorFullStack._id, 5);

      expect(matches.success).toBe(true);
      expect(matches.data.matches).toBeInstanceOf(Array);
      expect(matches.data.matches.length).toBeGreaterThan(0);

      // Junior developer should be a match due to similar skills
      const juniorMatch = matches.data.matches.find(match => 
        match.candidate.userId.firstName === 'Junior'
      );
      expect(juniorMatch).toBeDefined();
      expect(juniorMatch.score).toBeGreaterThan(0);
      expect(juniorMatch.matchReasons).toContain('matching skills');
    });

    test('should approve job posting by admin', async () => {
      const response = await request(app)
        .put(`/api/admin/jobs/${testJobs.seniorFullStack._id}/review`)
        .set('Authorization', `Bearer ${authTokens.admin}`)
        .send({
          decision: 'approved',
          feedback: 'Job posting meets all requirements and is approved for publication'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
    });

    test('should apply for job with enhanced application tracking', async () => {
      const applicationData = {
        coverLetter: 'I am very interested in this senior developer position. My experience with React and Node.js makes me a great fit.',
        applicationAnswers: [
          {
            question: 'Why are you interested in this role?',
            answer: 'I want to take on more leadership responsibilities and work with cutting-edge technologies'
          },
          {
            question: 'What is your expected salary range?',
            answer: '90,000 - 110,000 PHP per month'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/alumni/jobs/${testJobs.seniorFullStack._id}/apply`)
        .set('Authorization', `Bearer ${authTokens.junior}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('submitted');
      expect(response.body.data.timeline).toHaveLength(1);
    });
  });

  describe('Advanced Mentorship Matching', () => {
    test('should find advanced mentorship matches', async () => {
      const matches = await mentorshipMatchingService.findAdvancedMatches(
        testUsers.recent._id,
        { expertise: 'Web Development' }
      );

      expect(matches.success).toBe(true);
      expect(matches.data.matches).toBeInstanceOf(Array);
      expect(matches.data.matches.length).toBeGreaterThan(0);

      // Senior developer should be top match for recent graduate
      const topMatch = matches.data.matches[0];
      expect(topMatch.mentor.userId.firstName).toBe('Senior');
      expect(topMatch.matchScore).toBeGreaterThan(50);
      expect(topMatch.compatibility).toBeDefined();
      expect(topMatch.recommendedProgram).toBe('career_guidance');
      expect(topMatch.estimatedDuration).toBe(9); // New graduate needs longer mentorship
    });

    test('should create detailed matching report', async () => {
      const report = await mentorshipMatchingService.createMatchingReport(testUsers.recent._id);

      expect(report.success).toBe(true);
      expect(report.data.mentee).toBeDefined();
      expect(report.data.topMatches).toHaveLength(5);
      expect(report.data.recommendations).toBeInstanceOf(Array);
      expect(report.data.nextSteps).toBeInstanceOf(Array);
    });

    test('should request mentorship with advanced matching data', async () => {
      const mentorshipData = {
        mentorId: testUsers.senior._id,
        program: 'career_guidance',
        focusAreas: ['Web Development', 'Career Growth', 'Technical Skills'],
        requestMessage: 'Based on our 85% compatibility match, I would like to request mentorship to advance my career in web development',
        goals: [
          {
            description: 'Master advanced React patterns and state management',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          },
          {
            description: 'Develop leadership and communication skills',
            targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          }
        ],
        duration: 9,
        meetingSchedule: {
          frequency: 'bi_weekly',
          preferredDay: 'friday',
          preferredTime: '14:00',
          meetingType: 'video_call'
        }
      };

      const response = await request(app)
        .post('/api/alumni/mentorship/request')
        .set('Authorization', `Bearer ${authTokens.recent}`)
        .send(mentorshipData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('requested');
      expect(response.body.data.goals).toHaveLength(2);
    });

    test('should accept mentorship with goal tracking', async () => {
      // Get the mentorship request
      const requestsResponse = await request(app)
        .get('/api/alumni/mentorship/requests')
        .set('Authorization', `Bearer ${authTokens.senior}`);

      const mentorshipId = requestsResponse.body.data[0]._id;

      const response = await request(app)
        .put(`/api/alumni/mentorship/${mentorshipId}/respond`)
        .set('Authorization', `Bearer ${authTokens.senior}`)
        .send({
          response: 'accepted',
          responseMessage: 'I would be happy to mentor you! Your goals are well-defined and achievable.'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
      expect(response.body.data.startDate).toBeDefined();
    });
  });

  describe('Career Progression Analytics Integration', () => {
    test('should track career progression with job applications', async () => {
      const careerData = {
        position: 'Senior Software Developer',
        company: 'Innovation Corp',
        startDate: new Date(),
        isCurrent: true,
        description: 'Promoted after successful job application and interview process'
      };

      const response = await request(app)
        .post('/api/alumni/career/track')
        .set('Authorization', `Bearer ${authTokens.junior}`)
        .send(careerData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.careerHistory).toHaveLength(3); // Previous + new position
    });

    test('should generate comprehensive career analytics', async () => {
      const response = await request(app)
        .get('/api/alumni/career/analytics')
        .set('Authorization', `Bearer ${authTokens.junior}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics.totalPositions).toBe(3);
      expect(response.body.data.timeline).toBeInstanceOf(Array);
      
      // Should include job application in timeline
      const jobApplicationEvent = response.body.data.timeline.find(event => 
        event.type === 'job_application'
      );
      expect(jobApplicationEvent).toBeDefined();

      // Should include mentorship in timeline
      const mentorshipEvent = response.body.data.timeline.find(event => 
        event.type === 'mentorship'
      );
      expect(mentorshipEvent).toBeDefined();
    });

    test('should compare career progression with peers', async () => {
      const response = await request(app)
        .get('/api/alumni/career/compare')
        .set('Authorization', `Bearer ${authTokens.junior}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comparison).toBeDefined();
      expect(response.body.data.peerCount).toBeGreaterThan(0);
      
      // Should compare with other CS graduates
      expect(response.body.data.degree).toBe('Computer Science');
    });
  });

  describe('Alumni Event Integration with Ticketing', () => {
    test('should create alumni networking event', async () => {
      const eventData = {
        title: 'Tech Alumni Career Fair 2024',
        description: 'Annual career fair featuring job opportunities and mentorship connections',
        category: 'career',
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        venue: 'PCC Alumni Center',
        capacity: 200,
        ticketPrice: 500,
        targetAudience: 'alumni',
        industryFocus: 'Technology',
        networkingOpportunities: true,
        mentorshipOpportunities: true,
        careerFocus: true,
        graduationYearRange: {
          start: 2015,
          end: 2024
        }
      };

      const response = await request(app)
        .post('/api/alumni/events')
        .set('Authorization', `Bearer ${authTokens.senior}`)
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.careerFocus).toBe(true);

      testEvents.careerFair = response.body.data;
    });

    test('should register for event with alumni discount and enhanced ticket', async () => {
      const registrationData = {
        networkingInterests: ['Job Opportunities', 'Mentorship', 'Industry Trends'],
        mentorshipInterests: {
          willingToMentor: false,
          seekingMentor: true,
          expertise: ['Web Development', 'Career Guidance']
        },
        careerGoals: ['Senior Developer Role', 'Technical Leadership', 'Startup Experience']
      };

      const response = await request(app)
        .post(`/api/alumni/events/${testEvents.careerFair._id}/register`)
        .set('Authorization', `Bearer ${authTokens.junior}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
      
      // Check if alumni discount was applied
      if (response.body.data.ticket) {
        expect(response.body.data.ticket.discountApplied).toBeGreaterThan(0);
        expect(response.body.data.ticket.alumniData).toBeDefined();
      }
    });

    test('should get networking opportunities at event', async () => {
      // Register senior developer for networking matching
      await request(app)
        .post(`/api/alumni/events/${testEvents.careerFair._id}/register`)
        .set('Authorization', `Bearer ${authTokens.senior}`)
        .send({
          networkingInterests: ['Mentorship', 'Leadership', 'Career Development'],
          mentorshipInterests: {
            willingToMentor: true,
            seekingMentor: false,
            expertise: ['Web Development', 'Technical Leadership', 'Career Guidance']
          }
        });

      const response = await request(app)
        .get(`/api/alumni/events/${testEvents.careerFair._id}/networking`)
        .set('Authorization', `Bearer ${authTokens.junior}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.networkingMatches).toBeInstanceOf(Array);
      
      // Should find senior developer as networking match
      const seniorMatch = response.body.data.networkingMatches.find(match => 
        match.user.firstName === 'Senior'
      );
      expect(seniorMatch).toBeDefined();
      expect(seniorMatch.matchReasons).toContain('Potential mentorship opportunity');
    });
  });

  describe('Cross-System Analytics and Reporting', () => {
    test('should get comprehensive alumni analytics including all systems', async () => {
      const response = await request(app)
        .get('/api/alumni/analytics')
        .set('Authorization', `Bearer ${authTokens.admin}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.totalAlumni).toBeGreaterThan(0);
      expect(response.body.data.mentorship.availableMentors).toBeGreaterThan(0);
      expect(response.body.data.graduationYears).toBeInstanceOf(Array);
    });

    test('should validate data consistency across all systems', async () => {
      // Check that all systems are properly integrated
      const juniorProfile = await AlumniProfile.findOne({ userId: testUsers.junior._id });
      expect(juniorProfile.careerHistory).toHaveLength(3);

      const jobApplications = await JobApplication.find({ applicantId: testUsers.junior._id });
      expect(jobApplications).toHaveLength(1);

      const mentorships = await Mentorship.find({ menteeId: testUsers.recent._id });
      expect(mentorships).toHaveLength(1);
      expect(mentorships[0].status).toBe('accepted');

      const eventRegistrations = await EventRegistration.find({ 
        eventId: testEvents.careerFair._id 
      });
      expect(eventRegistrations).toHaveLength(2); // Junior and Senior registered

      // Check mentor mentee count is updated
      const seniorProfile = await AlumniProfile.findOne({ userId: testUsers.senior._id });
      expect(seniorProfile.mentorshipAvailability.currentMentees).toBe(1);
    });

    test('should generate integrated career progression report', async () => {
      const response = await request(app)
        .get('/api/alumni/career/report')
        .set('Authorization', `Bearer ${authTokens.junior}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.insights).toBeInstanceOf(Array);
      expect(response.body.data.recommendations).toBeInstanceOf(Array);
      
      // Should include recommendations based on job applications and mentorship
      const recommendations = response.body.data.recommendations.join(' ');
      expect(recommendations.toLowerCase()).toContain('mentor');
    });

    test('should track end-to-end alumni journey', async () => {
      // Verify complete alumni journey from job search to mentorship to events
      const careerAnalytics = await request(app)
        .get('/api/alumni/career/analytics')
        .set('Authorization', `Bearer ${authTokens.junior}`);

      const timeline = careerAnalytics.body.data.timeline;
      
      // Should have career progression
      const careerEvent = timeline.find(event => event.type === 'career');
      expect(careerEvent).toBeDefined();

      // Should have job application
      const jobEvent = timeline.find(event => event.type === 'job_application');
      expect(jobEvent).toBeDefined();

      // Should show mentorship connection (as mentee)
      expect(careerAnalytics.body.data.mentorships).toHaveLength(0); // Junior is not in any mentorship

      // Check recent graduate's mentorship
      const recentCareerAnalytics = await request(app)
        .get('/api/alumni/career/analytics')
        .set('Authorization', `Bearer ${authTokens.recent}`);

      expect(recentCareerAnalytics.body.data.mentorships).toHaveLength(1);
    });
  });
});

// Helper function to wait for async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));