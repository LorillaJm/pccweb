const mongoose = require('mongoose');
const AlumniService = require('./services/AlumniService');
const JobService = require('./services/JobService');
const MentorshipService = require('./services/MentorshipService');
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Mentorship = require('./models/Mentorship');
const User = require('./models/User');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';

describe('Alumni Services Unit Tests', () => {
  let alumniService;
  let jobService;
  let mentorshipService;
  let testUser;
  let testAlumni;
  let testMentor;
  let testMentee;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Initialize services
    alumniService = new AlumniService();
    jobService = new JobService();
    mentorshipService = new MentorshipService();
  });

  beforeEach(async () => {
    // Clean up test data
    await Promise.all([
      User.deleteMany({ email: { $regex: /test.*@example\.com/ } }),
      AlumniProfile.deleteMany({}),
      JobPosting.deleteMany({}),
      Mentorship.deleteMany({})
    ]);

    // Create test users
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'alumni',
      isAlumni: true
    });

    testMentor = await User.create({
      firstName: 'Test',
      lastName: 'Mentor',
      email: 'testmentor@example.com',
      password: 'password123',
      role: 'alumni',
      isAlumni: true
    });

    testMentee = await User.create({
      firstName: 'Test',
      lastName: 'Mentee',
      email: 'testmentee@example.com',
      password: 'password123',
      role: 'student'
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await Promise.all([
      User.deleteMany({ email: { $regex: /test.*@example\.com/ } }),
      AlumniProfile.deleteMany({}),
      JobPosting.deleteMany({}),
      Mentorship.deleteMany({})
    ]);
    await mongoose.connection.close();
  });

  describe('AlumniService', () => {
    describe('createOrUpdateProfile', () => {
      test('should create new alumni profile successfully', async () => {
        const profileData = {
          graduationYear: 2020,
          degree: 'Computer Science',
          currentPosition: 'Software Engineer',
          currentCompany: 'Tech Corp',
          industry: 'Technology',
          skills: ['JavaScript', 'Node.js', 'React']
        };

        const result = await alumniService.createOrUpdateProfile(testUser._id, profileData);

        expect(result.success).toBe(true);
        expect(result.data.graduationYear).toBe(2020);
        expect(result.data.degree).toBe('Computer Science');
        expect(result.data.userId.toString()).toBe(testUser._id.toString());
      });

      test('should update existing alumni profile', async () => {
        // Create initial profile
        const initialData = {
          graduationYear: 2020,
          degree: 'Computer Science',
          currentPosition: 'Junior Developer'
        };

        await alumniService.createOrUpdateProfile(testUser._id, initialData);

        // Update profile
        const updateData = {
          currentPosition: 'Senior Developer',
          currentCompany: 'New Tech Corp'
        };

        const result = await alumniService.createOrUpdateProfile(testUser._id, updateData);

        expect(result.success).toBe(true);
        expect(result.data.currentPosition).toBe('Senior Developer');
        expect(result.data.currentCompany).toBe('New Tech Corp');
      });

      test('should throw error for non-existent user', async () => {
        const fakeUserId = new mongoose.Types.ObjectId();
        const profileData = { graduationYear: 2020, degree: 'Test' };

        await expect(
          alumniService.createOrUpdateProfile(fakeUserId, profileData)
        ).rejects.toThrow('User not found');
      });
    });

    describe('getProfile', () => {
      beforeEach(async () => {
        testAlumni = await AlumniProfile.create({
          userId: testUser._id,
          graduationYear: 2020,
          degree: 'Computer Science',
          currentPosition: 'Software Engineer',
          industry: 'Technology',
          skills: ['JavaScript', 'Node.js'],
          verificationStatus: 'verified'
        });
      });

      test('should get alumni profile successfully', async () => {
        const result = await alumniService.getProfile(testUser._id);

        expect(result.success).toBe(true);
        expect(result.data.graduationYear).toBe(2020);
        expect(result.data.degree).toBe('Computer Science');
      });

      test('should increment profile views when viewed by others', async () => {
        const initialViews = testAlumni.networkingStats.profileViews;
        const viewerId = new mongoose.Types.ObjectId();

        await alumniService.getProfile(testUser._id, viewerId);

        const updatedProfile = await AlumniProfile.findById(testAlumni._id);
        expect(updatedProfile.networkingStats.profileViews).toBe(initialViews + 1);
      });

      test('should not increment views when viewed by profile owner', async () => {
        const initialViews = testAlumni.networkingStats.profileViews;

        await alumniService.getProfile(testUser._id, testUser._id);

        const updatedProfile = await AlumniProfile.findById(testAlumni._id);
        expect(updatedProfile.networkingStats.profileViews).toBe(initialViews);
      });

      test('should throw error for non-existent profile', async () => {
        const fakeUserId = new mongoose.Types.ObjectId();

        await expect(
          alumniService.getProfile(fakeUserId)
        ).rejects.toThrow('Alumni profile not found');
      });
    });

    describe('searchAlumni', () => {
      beforeEach(async () => {
        // Create multiple alumni profiles for testing
        await Promise.all([
          AlumniProfile.create({
            userId: testUser._id,
            graduationYear: 2020,
            degree: 'Computer Science',
            industry: 'Technology',
            skills: ['JavaScript', 'React'],
            verificationStatus: 'verified',
            privacySettings: { showInDirectory: true }
          }),
          AlumniProfile.create({
            userId: testMentor._id,
            graduationYear: 2018,
            degree: 'Information Technology',
            industry: 'Finance',
            skills: ['Python', 'Django'],
            verificationStatus: 'verified',
            privacySettings: { showInDirectory: true }
          })
        ]);
      });

      test('should search alumni without filters', async () => {
        const result = await alumniService.searchAlumni();

        expect(result.success).toBe(true);
        expect(result.data.alumni).toHaveLength(2);
        expect(result.data.pagination.total).toBe(2);
      });

      test('should filter alumni by graduation year', async () => {
        const filters = { graduationYear: 2020 };
        const result = await alumniService.searchAlumni(filters);

        expect(result.success).toBe(true);
        expect(result.data.alumni).toHaveLength(1);
        expect(result.data.alumni[0].graduationYear).toBe(2020);
      });

      test('should filter alumni by industry', async () => {
        const filters = { industry: 'Technology' };
        const result = await alumniService.searchAlumni(filters);

        expect(result.success).toBe(true);
        expect(result.data.alumni).toHaveLength(1);
        expect(result.data.alumni[0].industry).toBe('Technology');
      });

      test('should filter alumni by skills', async () => {
        const filters = { skills: ['JavaScript'] };
        const result = await alumniService.searchAlumni(filters);

        expect(result.success).toBe(true);
        expect(result.data.alumni).toHaveLength(1);
        expect(result.data.alumni[0].skills).toContain('JavaScript');
      });
    });

    describe('updateMentorshipAvailability', () => {
      beforeEach(async () => {
        testAlumni = await AlumniProfile.create({
          userId: testUser._id,
          graduationYear: 2020,
          degree: 'Computer Science',
          verificationStatus: 'verified'
        });
      });

      test('should update mentorship availability successfully', async () => {
        const availabilityData = {
          isAvailable: true,
          expertise: ['Web Development', 'Career Guidance'],
          maxMentees: 5
        };

        const result = await alumniService.updateMentorshipAvailability(
          testUser._id,
          availabilityData
        );

        expect(result.success).toBe(true);
        expect(result.data.mentorshipAvailability.isAvailable).toBe(true);
        expect(result.data.mentorshipAvailability.expertise).toContain('Web Development');
        expect(result.data.mentorshipAvailability.maxMentees).toBe(5);
      });

      test('should throw error for non-existent profile', async () => {
        const fakeUserId = new mongoose.Types.ObjectId();
        const availabilityData = { isAvailable: true };

        await expect(
          alumniService.updateMentorshipAvailability(fakeUserId, availabilityData)
        ).rejects.toThrow('Alumni profile not found');
      });
    });

    describe('getAlumniAnalytics', () => {
      beforeEach(async () => {
        // Create test data for analytics
        await Promise.all([
          AlumniProfile.create({
            userId: testUser._id,
            graduationYear: 2020,
            degree: 'Computer Science',
            industry: 'Technology',
            verificationStatus: 'verified',
            mentorshipAvailability: { isAvailable: true, maxMentees: 3 }
          }),
          AlumniProfile.create({
            userId: testMentor._id,
            graduationYear: 2019,
            degree: 'Information Technology',
            industry: 'Finance',
            verificationStatus: 'verified',
            mentorshipAvailability: { isAvailable: false }
          })
        ]);
      });

      test('should get alumni analytics successfully', async () => {
        const result = await alumniService.getAlumniAnalytics();

        expect(result.success).toBe(true);
        expect(result.data.overview.totalAlumni).toBe(2);
        expect(result.data.overview.totalMentors).toBe(1);
        expect(result.data.graduationYears).toHaveLength(2);
        expect(result.data.industries).toHaveLength(2);
      });

      test('should filter analytics by date range', async () => {
        const filters = {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31')
        };

        const result = await alumniService.getAlumniAnalytics(filters);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });
  });

  describe('JobService', () => {
    describe('createJobPosting', () => {
      test('should create job posting successfully', async () => {
        const jobData = {
          title: 'Software Engineer',
          company: 'Tech Corp',
          description: 'Great opportunity for developers',
          location: 'Manila',
          workType: 'full_time',
          contactEmail: 'hr@techcorp.com'
        };

        const result = await jobService.createJobPosting(testUser._id, jobData);

        expect(result.success).toBe(true);
        expect(result.data.title).toBe('Software Engineer');
        expect(result.data.company).toBe('Tech Corp');
        expect(result.data.posterId.toString()).toBe(testUser._id.toString());
      });

      test('should throw error for missing required fields', async () => {
        const incompleteJobData = {
          title: 'Software Engineer'
          // Missing required fields
        };

        await expect(
          jobService.createJobPosting(testUser._id, incompleteJobData)
        ).rejects.toThrow('company is required');
      });

      test('should throw error for non-existent poster', async () => {
        const fakeUserId = new mongoose.Types.ObjectId();
        const jobData = {
          title: 'Test Job',
          company: 'Test Corp',
          description: 'Test description',
          location: 'Test Location',
          workType: 'full_time',
          contactEmail: 'test@test.com'
        };

        await expect(
          jobService.createJobPosting(fakeUserId, jobData)
        ).rejects.toThrow('Poster not found');
      });
    });

    describe('getJobPosting', () => {
      let testJob;

      beforeEach(async () => {
        testJob = await JobPosting.create({
          posterId: testUser._id,
          posterType: 'alumni',
          title: 'Software Engineer',
          company: 'Tech Corp',
          description: 'Great opportunity',
          location: 'Manila',
          workType: 'full_time',
          contactEmail: 'hr@techcorp.com',
          status: 'active'
        });
      });

      test('should get job posting successfully', async () => {
        const result = await jobService.getJobPosting(testJob._id);

        expect(result.success).toBe(true);
        expect(result.data.title).toBe('Software Engineer');
        expect(result.data.company).toBe('Tech Corp');
      });

      test('should increment view count when viewed by others', async () => {
        const initialViews = testJob.viewCount;
        const viewerId = new mongoose.Types.ObjectId();

        await jobService.getJobPosting(testJob._id, viewerId);

        const updatedJob = await JobPosting.findById(testJob._id);
        expect(updatedJob.viewCount).toBe(initialViews + 1);
      });

      test('should throw error for non-existent job', async () => {
        const fakeJobId = new mongoose.Types.ObjectId();

        await expect(
          jobService.getJobPosting(fakeJobId)
        ).rejects.toThrow('Job posting not found');
      });
    });

    describe('searchJobs', () => {
      beforeEach(async () => {
        await Promise.all([
          JobPosting.create({
            posterId: testUser._id,
            posterType: 'alumni',
            title: 'Frontend Developer',
            company: 'Web Corp',
            description: 'React developer needed',
            location: 'Manila',
            workType: 'full_time',
            contactEmail: 'hr@webcorp.com',
            status: 'active',
            skills: ['React', 'JavaScript']
          }),
          JobPosting.create({
            posterId: testMentor._id,
            posterType: 'alumni',
            title: 'Backend Developer',
            company: 'API Corp',
            description: 'Node.js developer needed',
            location: 'Cebu',
            workType: 'part_time',
            contactEmail: 'hr@apicorp.com',
            status: 'active',
            skills: ['Node.js', 'MongoDB']
          })
        ]);
      });

      test('should search jobs without filters', async () => {
        const result = await jobService.searchJobs();

        expect(result.success).toBe(true);
        expect(result.data.jobs).toHaveLength(2);
        expect(result.data.pagination.total).toBe(2);
      });

      test('should filter jobs by work type', async () => {
        const filters = { workType: 'full_time' };
        const result = await jobService.searchJobs(filters);

        expect(result.success).toBe(true);
        expect(result.data.jobs).toHaveLength(1);
        expect(result.data.jobs[0].workType).toBe('full_time');
      });

      test('should filter jobs by location', async () => {
        const filters = { location: 'Manila' };
        const result = await jobService.searchJobs(filters);

        expect(result.success).toBe(true);
        expect(result.data.jobs).toHaveLength(1);
        expect(result.data.jobs[0].location).toBe('Manila');
      });

      test('should search jobs by text', async () => {
        const filters = { searchTerm: 'React' };
        const result = await jobService.searchJobs(filters);

        expect(result.success).toBe(true);
        expect(result.data.jobs.length).toBeGreaterThan(0);
      });
    });

    describe('getJobAnalytics', () => {
      beforeEach(async () => {
        await Promise.all([
          JobPosting.create({
            posterId: testUser._id,
            posterType: 'alumni',
            title: 'Developer 1',
            company: 'Corp 1',
            description: 'Job 1',
            location: 'Manila',
            workType: 'full_time',
            contactEmail: 'hr1@corp.com',
            status: 'active',
            applicationCount: 5,
            viewCount: 20
          }),
          JobPosting.create({
            posterId: testMentor._id,
            posterType: 'alumni',
            title: 'Developer 2',
            company: 'Corp 2',
            description: 'Job 2',
            location: 'Cebu',
            workType: 'part_time',
            contactEmail: 'hr2@corp.com',
            status: 'closed',
            applicationCount: 3,
            viewCount: 15
          })
        ]);
      });

      test('should get job analytics successfully', async () => {
        const result = await jobService.getJobAnalytics();

        expect(result.success).toBe(true);
        expect(result.data.overview.totalJobs).toBe(2);
        expect(result.data.overview.totalApplications).toBe(8);
        expect(result.data.overview.totalViews).toBe(35);
        expect(result.data.statusDistribution).toHaveLength(2);
        expect(result.data.workTypeDistribution).toHaveLength(2);
      });
    });
  });

  describe('MentorshipService', () => {
    let mentorProfile;

    beforeEach(async () => {
      // Create mentor profile
      mentorProfile = await AlumniProfile.create({
        userId: testMentor._id,
        graduationYear: 2018,
        degree: 'Computer Science',
        verificationStatus: 'verified',
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Web Development'],
          maxMentees: 3,
          currentMentees: 0
        }
      });
    });

    describe('requestMentorship', () => {
      test('should create mentorship request successfully', async () => {
        const requestData = {
          program: 'career_guidance',
          focusAreas: ['Web Development'],
          requestMessage: 'I would like guidance in web development',
          goals: [
            { description: 'Learn React', targetDate: new Date() }
          ]
        };

        const result = await mentorshipService.requestMentorship(
          testMentee._id,
          testMentor._id,
          requestData
        );

        expect(result.success).toBe(true);
        expect(result.data.program).toBe('career_guidance');
        expect(result.data.status).toBe('requested');
        expect(result.data.mentorId.toString()).toBe(testMentor._id.toString());
        expect(result.data.menteeId.toString()).toBe(testMentee._id.toString());
      });

      test('should throw error for unavailable mentor', async () => {
        // Make mentor unavailable
        mentorProfile.mentorshipAvailability.isAvailable = false;
        await mentorProfile.save();

        const requestData = {
          program: 'career_guidance',
          requestMessage: 'Test request'
        };

        await expect(
          mentorshipService.requestMentorship(testMentee._id, testMentor._id, requestData)
        ).rejects.toThrow('Mentor is not available for mentorship');
      });

      test('should throw error for duplicate request', async () => {
        const requestData = {
          program: 'career_guidance',
          requestMessage: 'Test request'
        };

        // Create first request
        await mentorshipService.requestMentorship(testMentee._id, testMentor._id, requestData);

        // Try to create duplicate request
        await expect(
          mentorshipService.requestMentorship(testMentee._id, testMentor._id, requestData)
        ).rejects.toThrow('Mentorship request already exists or is active');
      });

      test('should throw error for missing required fields', async () => {
        const incompleteData = {
          program: 'career_guidance'
          // Missing requestMessage
        };

        await expect(
          mentorshipService.requestMentorship(testMentee._id, testMentor._id, incompleteData)
        ).rejects.toThrow('requestMessage is required');
      });
    });

    describe('respondToMentorshipRequest', () => {
      let mentorshipRequest;

      beforeEach(async () => {
        const requestData = {
          program: 'career_guidance',
          requestMessage: 'Test request'
        };

        const result = await mentorshipService.requestMentorship(
          testMentee._id,
          testMentor._id,
          requestData
        );
        mentorshipRequest = result.data;
      });

      test('should accept mentorship request successfully', async () => {
        const result = await mentorshipService.respondToMentorshipRequest(
          mentorshipRequest._id,
          testMentor._id,
          'accepted',
          'Happy to mentor you!'
        );

        expect(result.success).toBe(true);
        expect(result.data.status).toBe('active');
        expect(result.data.responseMessage).toBe('Happy to mentor you!');

        // Check that mentor's mentee count was updated
        const updatedMentorProfile = await AlumniProfile.findOne({ userId: testMentor._id });
        expect(updatedMentorProfile.mentorshipAvailability.currentMentees).toBe(1);
      });

      test('should reject mentorship request successfully', async () => {
        const result = await mentorshipService.respondToMentorshipRequest(
          mentorshipRequest._id,
          testMentor._id,
          'rejected',
          'Sorry, I am not available at this time'
        );

        expect(result.success).toBe(true);
        expect(result.data.status).toBe('rejected');
        expect(result.data.responseMessage).toBe('Sorry, I am not available at this time');

        // Check that mentor's mentee count was not updated
        const updatedMentorProfile = await AlumniProfile.findOne({ userId: testMentor._id });
        expect(updatedMentorProfile.mentorshipAvailability.currentMentees).toBe(0);
      });

      test('should throw error for unauthorized response', async () => {
        const unauthorizedUserId = new mongoose.Types.ObjectId();

        await expect(
          mentorshipService.respondToMentorshipRequest(
            mentorshipRequest._id,
            unauthorizedUserId,
            'accepted',
            'Test response'
          )
        ).rejects.toThrow('Unauthorized to respond to this mentorship request');
      });

      test('should throw error for already responded request', async () => {
        // First response
        await mentorshipService.respondToMentorshipRequest(
          mentorshipRequest._id,
          testMentor._id,
          'accepted',
          'First response'
        );

        // Try to respond again
        await expect(
          mentorshipService.respondToMentorshipRequest(
            mentorshipRequest._id,
            testMentor._id,
            'rejected',
            'Second response'
          )
        ).rejects.toThrow('Mentorship request has already been responded to');
      });
    });

    describe('getMentorshipsForUser', () => {
      beforeEach(async () => {
        // Create test mentorships
        await Promise.all([
          Mentorship.create({
            mentorId: testMentor._id,
            menteeId: testMentee._id,
            program: 'career_guidance',
            requestMessage: 'Test request 1',
            status: 'active'
          }),
          Mentorship.create({
            mentorId: testUser._id,
            menteeId: testMentor._id,
            program: 'skill_development',
            requestMessage: 'Test request 2',
            status: 'completed'
          })
        ]);
      });

      test('should get mentorships for mentor', async () => {
        const result = await mentorshipService.getMentorshipsForUser(testMentor._id);

        expect(result.success).toBe(true);
        expect(result.data.asMentor).toHaveLength(1);
        expect(result.data.asMentee).toHaveLength(1);
        expect(result.data.total).toBe(2);
      });

      test('should filter mentorships by status', async () => {
        const filters = { status: 'active' };
        const result = await mentorshipService.getMentorshipsForUser(testMentor._id, filters);

        expect(result.success).toBe(true);
        expect(result.data.total).toBe(1);
      });
    });

    describe('getMentorshipStats', () => {
      beforeEach(async () => {
        // Create test mentorships with different statuses
        await Promise.all([
          Mentorship.create({
            mentorId: testMentor._id,
            menteeId: testMentee._id,
            program: 'career_guidance',
            requestMessage: 'Test 1',
            status: 'active',
            statistics: { totalSessions: 5, completedSessions: 3 }
          }),
          Mentorship.create({
            mentorId: testMentor._id,
            menteeId: testUser._id,
            program: 'skill_development',
            requestMessage: 'Test 2',
            status: 'completed',
            statistics: { totalSessions: 8, completedSessions: 8 }
          })
        ]);
      });

      test('should get mentorship statistics for mentor', async () => {
        const result = await mentorshipService.getMentorshipStats(testMentor._id, 'mentor');

        expect(result.success).toBe(true);
        expect(result.data.overview.totalMentorships).toBe(2);
        expect(result.data.overview.activeMentorships).toBe(1);
        expect(result.data.overview.completedMentorships).toBe(1);
        expect(result.data.completionRate).toBe('50.0');
      });
    });

    describe('findMentorMatches', () => {
      beforeEach(async () => {
        // Create additional mentor profiles for matching
        const additionalMentor = await User.create({
          firstName: 'Additional',
          lastName: 'Mentor',
          email: 'additional@example.com',
          password: 'password123',
          role: 'alumni',
          isAlumni: true
        });

        await AlumniProfile.create({
          userId: additionalMentor._id,
          graduationYear: 2017,
          degree: 'Information Technology',
          industry: 'Technology',
          skills: ['Python', 'Django'],
          verificationStatus: 'verified',
          mentorshipAvailability: {
            isAvailable: true,
            expertise: ['Backend Development'],
            maxMentees: 2,
            currentMentees: 0
          }
        });
      });

      test('should find mentor matches successfully', async () => {
        const preferences = {
          expertise: 'Web Development',
          industry: 'Technology'
        };

        const result = await mentorshipService.findMentorMatches(testMentee._id, preferences);

        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty('matchScore');
      });

      test('should throw error for non-existent mentee', async () => {
        const fakeUserId = new mongoose.Types.ObjectId();
        const preferences = { expertise: 'Web Development' };

        await expect(
          mentorshipService.findMentorMatches(fakeUserId, preferences)
        ).rejects.toThrow('Mentee not found');
      });
    });

    describe('getProgramAnalytics', () => {
      beforeEach(async () => {
        // Create test mentorships for analytics
        await Promise.all([
          Mentorship.create({
            mentorId: testMentor._id,
            menteeId: testMentee._id,
            program: 'career_guidance',
            requestMessage: 'Test 1',
            status: 'completed',
            feedback: { mentorFeedback: { rating: 5 } }
          }),
          Mentorship.create({
            mentorId: testUser._id,
            menteeId: testMentee._id,
            program: 'skill_development',
            requestMessage: 'Test 2',
            status: 'active',
            feedback: { mentorFeedback: { rating: 4 } }
          })
        ]);
      });

      test('should get program analytics successfully', async () => {
        const result = await mentorshipService.getProgramAnalytics();

        expect(result.success).toBe(true);
        expect(result.data.overview.totalMentorships).toBe(2);
        expect(result.data.overview.completedMentorships).toBe(1);
        expect(result.data.overview.activeMentorships).toBe(1);
        expect(result.data.programDistribution).toHaveLength(2);
        expect(result.data.statusDistribution).toHaveLength(2);
      });
    });
  });

  // Integration tests
  describe('Integration Tests', () => {
    test('should create complete alumni workflow', async () => {
      // 1. Create alumni profile
      const profileData = {
        graduationYear: 2020,
        degree: 'Computer Science',
        currentPosition: 'Software Engineer',
        industry: 'Technology',
        skills: ['JavaScript', 'React']
      };

      const profileResult = await alumniService.createOrUpdateProfile(testUser._id, profileData);
      expect(profileResult.success).toBe(true);

      // 2. Update mentorship availability
      const availabilityData = {
        isAvailable: true,
        expertise: ['Web Development'],
        maxMentees: 3
      };

      const availabilityResult = await alumniService.updateMentorshipAvailability(
        testUser._id,
        availabilityData
      );
      expect(availabilityResult.success).toBe(true);

      // 3. Create job posting
      const jobData = {
        title: 'Frontend Developer',
        company: 'Tech Startup',
        description: 'Looking for React developer',
        location: 'Manila',
        workType: 'full_time',
        contactEmail: 'hr@techstartup.com'
      };

      const jobResult = await jobService.createJobPosting(testUser._id, jobData);
      expect(jobResult.success).toBe(true);

      // 4. Request mentorship
      const requestData = {
        program: 'career_guidance',
        requestMessage: 'Need guidance in career development'
      };

      const mentorshipResult = await mentorshipService.requestMentorship(
        testMentee._id,
        testUser._id,
        requestData
      );
      expect(mentorshipResult.success).toBe(true);

      // 5. Accept mentorship
      const acceptResult = await mentorshipService.respondToMentorshipRequest(
        mentorshipResult.data._id,
        testUser._id,
        'accepted',
        'Happy to help!'
      );
      expect(acceptResult.success).toBe(true);

      // Verify the complete workflow
      const finalProfile = await alumniService.getProfile(testUser._id);
      expect(finalProfile.data.mentorshipAvailability.currentMentees).toBe(1);
    });
  });
});

// Helper function to run tests
if (require.main === module) {
  console.log('Running Alumni Services Unit Tests...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Run the tests (this would typically be done with Jest or another test runner)
  console.log('Tests completed. Use a proper test runner like Jest to execute these tests.');
}