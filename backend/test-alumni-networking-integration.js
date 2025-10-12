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

describe('Alumni Networking Integration Tests', () => {
  let testUsers = {};
  let testAlumniProfiles = {};
  let testJobs = {};
  let testEvents = {};
  let authTokens = {};

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test');
    }

    // Clean up existing test data
    await Promise.all([
      User.deleteMany({ email: /test.*@alumni\.test/ }),
      AlumniProfile.deleteMany({}),
      JobPosting.deleteMany({}),
      JobApplication.deleteMany({}),
      Mentorship.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      EventTicket.deleteMany({})
    ]);

    // Create test users
    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@alumni.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@alumni.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@alumni.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
        isActive: true
      },
      {
        firstName: 'Alice',
        lastName: 'Wilson',
        email: 'alice.wilson@alumni.test',
        password: 'password123',
        role: 'student',
        isAlumni: true,
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

    // Create alumni profiles
    const alumniProfiles = [
      {
        userId: testUsers.john._id,
        graduationYear: 2020,
        degree: 'Computer Science',
        currentPosition: 'Software Engineer',
        currentCompany: 'Tech Corp',
        industry: 'Technology',
        skills: ['JavaScript', 'React', 'Node.js'],
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Web Development', 'Career Guidance'],
          maxMentees: 3
        },
        verificationStatus: 'verified'
      },
      {
        userId: testUsers.jane._id,
        graduationYear: 2019,
        degree: 'Business Administration',
        currentPosition: 'Marketing Manager',
        currentCompany: 'Marketing Inc',
        industry: 'Marketing',
        skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Marketing', 'Leadership'],
          maxMentees: 2
        },
        verificationStatus: 'verified'
      },
      {
        userId: testUsers.bob._id,
        graduationYear: 2021,
        degree: 'Computer Science',
        currentPosition: 'Junior Developer',
        currentCompany: 'Startup XYZ',
        industry: 'Technology',
        skills: ['Python', 'Django', 'PostgreSQL'],
        mentorshipAvailability: {
          isAvailable: false
        },
        verificationStatus: 'verified'
      },
      {
        userId: testUsers.alice._id,
        graduationYear: 2018,
        degree: 'Business Administration',
        currentPosition: 'Senior Analyst',
        currentCompany: 'Finance Corp',
        industry: 'Finance',
        skills: ['Financial Analysis', 'Excel', 'SQL'],
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Finance', 'Data Analysis'],
          maxMentees: 1
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
      User.deleteMany({ email: /test.*@alumni\.test/ }),
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

  describe('Job Board Integration', () => {
    test('should create job posting by alumni', async () => {
      const jobData = {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        description: 'Looking for an experienced software engineer',
        location: 'Manila',
        workType: 'full_time',
        contactEmail: 'hr@techcorp.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        targetAudience: 'alumni',
        experienceLevel: 'senior'
      };

      const response = await request(app)
        .post('/api/alumni/jobs')
        .set('Authorization', `Bearer ${authTokens.john}`)
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(jobData.title);
      expect(response.body.data.posterType).toBe('alumni');

      testJobs.seniorDev = response.body.data;
    });

    test('should get personalized job recommendations', async () => {
      const response = await request(app)
        .get('/api/alumni/jobs?personalized=true')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs).toBeInstanceOf(Array);
      
      // Bob should see the job posted by John due to similar skills
      const recommendedJob = response.body.data.jobs.find(job => 
        job.title === 'Senior Software Engineer'
      );
      expect(recommendedJob).toBeDefined();
      expect(recommendedJob.relevanceScore).toBeGreaterThan(0);
    });

    test('should apply for job with career progression tracking', async () => {
      const applicationData = {
        coverLetter: 'I am interested in this position...',
        applicationAnswers: [
          {
            question: 'Why are you interested in this role?',
            answer: 'I want to advance my career in software development'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/alumni/jobs/${testJobs.seniorDev._id}/apply`)
        .set('Authorization', `Bearer ${authTokens.bob}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('submitted');
    });

    test('should get job applications for job poster', async () => {
      const response = await request(app)
        .get(`/api/alumni/jobs/${testJobs.seniorDev._id}/applications`)
        .set('Authorization', `Bearer ${authTokens.john}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.applications).toHaveLength(1);
      expect(response.body.data.applications[0].applicantId.firstName).toBe('Bob');
    });
  });

  describe('Mentorship System Integration', () => {
    test('should find available mentors', async () => {
      const response = await request(app)
        .get('/api/alumni/mentors?expertise=Web Development')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Should find John as available mentor
      const johnMentor = response.body.data.find(mentor => 
        mentor.userId.firstName === 'John'
      );
      expect(johnMentor).toBeDefined();
      expect(johnMentor.mentorshipAvailability.isAvailable).toBe(true);
    });

    test('should request mentorship', async () => {
      const mentorshipData = {
        mentorId: testUsers.john._id,
        program: 'career_guidance',
        focusAreas: ['Web Development', 'Career Growth'],
        requestMessage: 'I would like guidance on advancing my career in web development',
        goals: [
          {
            description: 'Learn advanced React patterns',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
          }
        ]
      };

      const response = await request(app)
        .post('/api/alumni/mentorship/request')
        .set('Authorization', `Bearer ${authTokens.bob}`)
        .send(mentorshipData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('requested');
      expect(response.body.data.menteeId.firstName).toBe('Bob');
    });

    test('should get pending mentorship requests', async () => {
      const response = await request(app)
        .get('/api/alumni/mentorship/requests')
        .set('Authorization', `Bearer ${authTokens.john}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].menteeId.firstName).toBe('Bob');
    });

    test('should accept mentorship request', async () => {
      // First get the mentorship request
      const requestsResponse = await request(app)
        .get('/api/alumni/mentorship/requests')
        .set('Authorization', `Bearer ${authTokens.john}`);

      const mentorshipId = requestsResponse.body.data[0]._id;

      const response = await request(app)
        .put(`/api/alumni/mentorship/${mentorshipId}/respond`)
        .set('Authorization', `Bearer ${authTokens.john}`)
        .send({
          response: 'accepted',
          responseMessage: 'I would be happy to mentor you!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    });

    test('should get mentorship matches', async () => {
      const response = await request(app)
        .get('/api/alumni/mentorship/matches?expertise=Marketing')
        .set('Authorization', `Bearer ${authTokens.alice}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.matches).toBeInstanceOf(Array);
      
      // Should find Jane as a potential mentor for marketing
      const janeMatch = response.body.data.matches.find(match => 
        match.userId.firstName === 'Jane'
      );
      expect(janeMatch).toBeDefined();
      expect(janeMatch.matchScore).toBeGreaterThan(0);
    });
  });

  describe('Alumni Events Integration', () => {
    test('should create alumni event', async () => {
      const eventData = {
        title: 'Tech Alumni Networking Night',
        description: 'A networking event for technology alumni',
        category: 'social',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        venue: 'PCC Alumni Center',
        capacity: 50,
        targetAudience: 'alumni',
        industryFocus: 'Technology',
        networkingOpportunities: true,
        mentorshipOpportunities: true,
        notifyAlumni: false // Don't send notifications in test
      };

      const response = await request(app)
        .post('/api/alumni/events')
        .set('Authorization', `Bearer ${authTokens.john}`)
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(eventData.title);
      expect(response.body.data.tags).toContain('alumni');

      testEvents.networking = response.body.data;
    });

    test('should get alumni events with filtering', async () => {
      const response = await request(app)
        .get('/api/alumni/events?industry=Technology&networkingOpportunities=true')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toBeInstanceOf(Array);
      
      const networkingEvent = response.body.data.events.find(event => 
        event.title === 'Tech Alumni Networking Night'
      );
      expect(networkingEvent).toBeDefined();
      expect(networkingEvent.networkingOpportunities).toBe(true);
    });

    test('should register for alumni event with networking preferences', async () => {
      const registrationData = {
        networkingInterests: ['Career Development', 'Technology Trends'],
        mentorshipInterests: {
          willingToMentor: false,
          seekingMentor: true,
          expertise: ['Web Development']
        },
        careerGoals: ['Senior Developer Role', 'Technical Leadership']
      };

      const response = await request(app)
        .post(`/api/alumni/events/${testEvents.networking._id}/register`)
        .set('Authorization', `Bearer ${authTokens.bob}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });

    test('should register another alumni for networking matching', async () => {
      const registrationData = {
        networkingInterests: ['Career Development', 'Mentorship'],
        mentorshipInterests: {
          willingToMentor: true,
          seekingMentor: false,
          expertise: ['Web Development', 'Career Guidance']
        }
      };

      const response = await request(app)
        .post(`/api/alumni/events/${testEvents.networking._id}/register`)
        .set('Authorization', `Bearer ${authTokens.john}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should get networking opportunities for event', async () => {
      const response = await request(app)
        .get(`/api/alumni/events/${testEvents.networking._id}/networking`)
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.networkingMatches).toBeInstanceOf(Array);
      
      // Should find John as a networking match
      const johnMatch = response.body.data.networkingMatches.find(match => 
        match.user.firstName === 'John'
      );
      expect(johnMatch).toBeDefined();
      expect(johnMatch.matchScore).toBeGreaterThan(0);
      expect(johnMatch.matchReasons).toContain('Potential mentorship opportunity');
    });
  });

  describe('Career Progression Integration', () => {
    test('should track career progression', async () => {
      const careerData = {
        position: 'Senior Software Engineer',
        company: 'New Tech Corp',
        startDate: new Date(),
        isCurrent: true,
        description: 'Promoted to senior role with team leadership responsibilities'
      };

      const response = await request(app)
        .post('/api/alumni/career/track')
        .set('Authorization', `Bearer ${authTokens.bob}`)
        .send(careerData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.currentPosition).toBe(careerData.position);
      expect(response.body.data.careerHistory).toHaveLength(1);
    });

    test('should get career progression analytics', async () => {
      const response = await request(app)
        .get('/api/alumni/career/analytics')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.metrics.totalPositions).toBe(1);
      expect(response.body.data.timeline).toBeInstanceOf(Array);
    });

    test('should generate career progression report', async () => {
      const response = await request(app)
        .get('/api/alumni/career/report')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.alumni.name).toBe('Bob Johnson');
      expect(response.body.data.insights).toBeInstanceOf(Array);
      expect(response.body.data.recommendations).toBeInstanceOf(Array);
    });

    test('should compare career progression with peers', async () => {
      const response = await request(app)
        .get('/api/alumni/career/compare')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comparison).toBeDefined();
      expect(response.body.data.peerCount).toBeGreaterThan(0);
    });
  });

  describe('Cross-System Integration', () => {
    test('should show job applications in career timeline', async () => {
      const response = await request(app)
        .get('/api/alumni/career/analytics')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.data.timeline).toBeInstanceOf(Array);
      
      // Should include job application in timeline
      const jobApplicationEvent = response.body.data.timeline.find(event => 
        event.type === 'job_application'
      );
      expect(jobApplicationEvent).toBeDefined();
    });

    test('should show mentorship in career analytics', async () => {
      const response = await request(app)
        .get('/api/alumni/career/analytics')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.data.mentorships).toBeInstanceOf(Array);
      expect(response.body.data.mentorships).toHaveLength(1);
    });

    test('should get networking suggestions based on career and events', async () => {
      const response = await request(app)
        .get('/api/alumni/networking-suggestions?limit=5')
        .set('Authorization', `Bearer ${authTokens.bob}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Should suggest John due to similar industry and mentorship
      const johnSuggestion = response.body.data.find(suggestion => 
        suggestion.userId.firstName === 'John'
      );
      expect(johnSuggestion).toBeDefined();
    });
  });

  describe('Analytics and Reporting Integration', () => {
    test('should get comprehensive alumni analytics', async () => {
      // Create admin user for analytics access
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@alumni.test',
        password: 'password123',
        role: 'admin',
        isActive: true
      });
      await adminUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@alumni.test',
          password: 'password123'
        });

      const adminToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/alumni/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.graduationYears).toBeInstanceOf(Array);
      expect(response.body.data.industries).toBeInstanceOf(Array);
      expect(response.body.data.mentorship).toBeDefined();

      // Clean up admin user
      await User.findByIdAndDelete(adminUser._id);
    });

    test('should validate data consistency across systems', async () => {
      // Verify that all created data is properly linked
      const alumniProfile = await AlumniProfile.findOne({ userId: testUsers.bob._id });
      expect(alumniProfile).toBeDefined();

      const jobApplications = await JobApplication.find({ applicantId: testUsers.bob._id });
      expect(jobApplications).toHaveLength(1);

      const mentorships = await Mentorship.find({ menteeId: testUsers.bob._id });
      expect(mentorships).toHaveLength(1);

      const eventRegistrations = await EventRegistration.find({ userId: testUsers.bob._id });
      expect(eventRegistrations).toHaveLength(1);

      // Verify cross-references are maintained
      expect(alumniProfile.mentorshipAvailability.currentMentees).toBe(0); // Bob is mentee, not mentor
      expect(mentorships[0].status).toBe('accepted');
      expect(eventRegistrations[0].status).toBe('confirmed');
    });
  });
});

// Helper function to wait for async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));