const mongoose = require('mongoose');
const { expect } = require('chai');

// Import models
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Mentorship = require('./models/Mentorship');
const AlumniConnection = require('./models/AlumniConnection');
const AlumniMessage = require('./models/AlumniMessage');

describe('Alumni Models Validation Tests', function() {
  const mockUserId = new mongoose.Types.ObjectId();
  const mockUserId2 = new mongoose.Types.ObjectId();

  describe('AlumniProfile Model Validation', function() {
    it('should validate required fields', function() {
      const profile = new AlumniProfile();
      const error = profile.validateSync();
      
      expect(error).to.exist;
      expect(error.errors.userId).to.exist;
      expect(error.errors.graduationYear).to.exist;
      expect(error.errors.degree).to.exist;
    });

    it('should validate graduation year range', function() {
      const profile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 1900, // Invalid year
        degree: 'Test Degree'
      });
      
      const error = profile.validateSync();
      expect(error).to.exist;
      expect(error.errors.graduationYear).to.exist;
    });

    it('should validate social links format', function() {
      const profile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 2020,
        degree: 'Test Degree',
        socialLinks: {
          linkedin: 'invalid-url'
        }
      });
      
      const error = profile.validateSync();
      expect(error).to.exist;
      expect(error.errors['socialLinks.linkedin']).to.exist;
    });

    it('should validate bio length', function() {
      const profile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 2020,
        degree: 'Test Degree',
        bio: 'a'.repeat(501) // Exceeds maxlength
      });
      
      const error = profile.validateSync();
      expect(error).to.exist;
      expect(error.errors.bio).to.exist;
    });

    it('should validate mentorship availability settings', function() {
      const profile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 2020,
        degree: 'Test Degree',
        mentorshipAvailability: {
          maxMentees: 15 // Exceeds max limit
        }
      });
      
      const error = profile.validateSync();
      expect(error).to.exist;
      expect(error.errors['mentorshipAvailability.maxMentees']).to.exist;
    });

    it('should accept valid alumni profile data', function() {
      const profile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 2020,
        degree: 'Bachelor of Science in Computer Science',
        major: 'Software Engineering',
        currentPosition: 'Software Developer',
        currentCompany: 'Tech Corp',
        industry: 'Technology',
        location: 'Manila, Philippines',
        bio: 'Passionate software developer',
        skills: ['JavaScript', 'Node.js'],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe'
        },
        mentorshipAvailability: {
          isAvailable: true,
          maxMentees: 3
        }
      });
      
      const error = profile.validateSync();
      expect(error).to.not.exist;
    });

    it('should have correct virtual properties', function() {
      const profile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 2020,
        degree: 'Test Degree',
        mentorshipAvailability: {
          isAvailable: true,
          maxMentees: 3,
          currentMentees: 1
        }
      });
      
      expect(profile.canAcceptMentees).to.be.true;
      
      profile.mentorshipAvailability.currentMentees = 3;
      expect(profile.canAcceptMentees).to.be.false;
    });
  });

  describe('JobPosting Model Validation', function() {
    it('should validate required fields', function() {
      const job = new JobPosting();
      const error = job.validateSync();
      
      expect(error).to.exist;
      expect(error.errors.posterId).to.exist;
      expect(error.errors.posterType).to.exist;
      expect(error.errors.title).to.exist;
      expect(error.errors.company).to.exist;
      expect(error.errors.description).to.exist;
      expect(error.errors.location).to.exist;
      expect(error.errors.workType).to.exist;
      expect(error.errors.contactEmail).to.exist;
    });

    it('should validate email format', function() {
      const job = new JobPosting({
        posterId: mockUserId,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'invalid-email'
      });
      
      const error = job.validateSync();
      expect(error).to.exist;
      expect(error.errors.contactEmail).to.exist;
    });

    it('should validate salary range', function() {
      const job = new JobPosting({
        posterId: mockUserId,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'test@test.com',
        salaryRange: {
          min: 50000,
          max: 30000 // Max less than min
        }
      });
      
      const error = job.validateSync();
      expect(error).to.exist;
      expect(error.errors['salaryRange.max']).to.exist;
    });

    it('should validate application deadline', function() {
      const job = new JobPosting({
        posterId: mockUserId,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'test@test.com',
        applicationDeadline: new Date('2020-01-01') // Past date
      });
      
      const error = job.validateSync();
      expect(error).to.exist;
      expect(error.errors.applicationDeadline).to.exist;
    });

    it('should accept valid job posting data', function() {
      const job = new JobPosting({
        posterId: mockUserId,
        posterType: 'alumni',
        title: 'Software Developer',
        company: 'Tech Corp',
        description: 'We are looking for a talented developer',
        location: 'Manila, Philippines',
        workType: 'full_time',
        contactEmail: 'hr@techcorp.com',
        salaryRange: {
          min: 30000,
          max: 50000,
          currency: 'PHP'
        },
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      const error = job.validateSync();
      expect(error).to.not.exist;
    });

    it('should have correct virtual properties', function() {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const job = new JobPosting({
        posterId: mockUserId,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'test@test.com',
        status: 'active',
        applicationDeadline: futureDate
      });
      
      expect(job.isExpired).to.be.false;
      expect(job.canAcceptApplications).to.be.true;
      expect(job.daysUntilDeadline).to.be.approximately(30, 1);
    });
  });

  describe('Mentorship Model Validation', function() {
    it('should validate required fields', function() {
      const mentorship = new Mentorship();
      const error = mentorship.validateSync();
      
      expect(error).to.exist;
      expect(error.errors.mentorId).to.exist;
      expect(error.errors.menteeId).to.exist;
      expect(error.errors.program).to.exist;
      expect(error.errors.requestMessage).to.exist;
    });

    it('should validate program enum values', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'invalid_program',
        requestMessage: 'Test message'
      });
      
      const error = mentorship.validateSync();
      expect(error).to.exist;
      expect(error.errors.program).to.exist;
    });

    it('should validate meeting time format', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'career_guidance',
        requestMessage: 'Test message',
        meetingSchedule: {
          preferredTime: '25:00' // Invalid time
        }
      });
      
      const error = mentorship.validateSync();
      expect(error).to.exist;
      expect(error.errors['meetingSchedule.preferredTime']).to.exist;
    });

    it('should validate date ranges', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'career_guidance',
        requestMessage: 'Test message',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-11-01') // End before start
      });
      
      const error = mentorship.validateSync();
      expect(error).to.exist;
      expect(error.errors.endDate).to.exist;
    });

    it('should validate duration range', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'career_guidance',
        requestMessage: 'Test message',
        duration: 25 // Exceeds max
      });
      
      const error = mentorship.validateSync();
      expect(error).to.exist;
      expect(error.errors.duration).to.exist;
    });

    it('should accept valid mentorship data', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'career_guidance',
        requestMessage: 'I would like guidance on my career path',
        duration: 6,
        meetingSchedule: {
          frequency: 'bi_weekly',
          preferredTime: '14:00',
          meetingType: 'video_call'
        },
        goals: [
          {
            description: 'Learn new skills',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        ]
      });
      
      const error = mentorship.validateSync();
      expect(error).to.not.exist;
    });

    it('should have correct virtual properties', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'career_guidance',
        requestMessage: 'Test message',
        goals: [
          { description: 'Goal 1', status: 'completed' },
          { description: 'Goal 2', status: 'in_progress' }
        ]
      });
      
      expect(mentorship.progressPercentage).to.equal(50);
    });
  });

  describe('AlumniConnection Model Validation', function() {
    it('should validate required fields', function() {
      const connection = new AlumniConnection();
      const error = connection.validateSync();
      
      expect(error).to.exist;
      expect(error.errors.requesterId).to.exist;
      expect(error.errors.recipientId).to.exist;
      expect(error.errors.requestMessage).to.exist;
    });

    it('should validate request message length', function() {
      const connection = new AlumniConnection({
        requesterId: mockUserId,
        recipientId: mockUserId2,
        requestMessage: 'a'.repeat(501) // Exceeds maxlength
      });
      
      const error = connection.validateSync();
      expect(error).to.exist;
      expect(error.errors.requestMessage).to.exist;
    });

    it('should validate connection strength range', function() {
      const connection = new AlumniConnection({
        requesterId: mockUserId,
        recipientId: mockUserId2,
        requestMessage: 'Test message',
        connectionStrength: 6 // Exceeds max
      });
      
      const error = connection.validateSync();
      expect(error).to.exist;
      expect(error.errors.connectionStrength).to.exist;
    });

    it('should accept valid connection data', function() {
      const connection = new AlumniConnection({
        requesterId: mockUserId,
        recipientId: mockUserId2,
        connectionType: 'professional',
        requestMessage: 'I would like to connect with you',
        commonInterests: ['Web Development', 'Startups']
      });
      
      const error = connection.validateSync();
      expect(error).to.not.exist;
    });

    it('should have correct virtual properties', function() {
      const connection = new AlumniConnection({
        requesterId: mockUserId,
        recipientId: mockUserId2,
        requestMessage: 'Test message',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      });
      
      expect(connection.connectionAge).to.be.approximately(5, 1);
    });
  });

  describe('AlumniMessage Model Validation', function() {
    it('should validate required fields', function() {
      const message = new AlumniMessage();
      const error = message.validateSync();
      
      expect(error).to.exist;
      expect(error.errors.senderId).to.exist;
      expect(error.errors.recipientId).to.exist;
      expect(error.errors.content).to.exist;
    });

    it('should validate content length', function() {
      const message = new AlumniMessage({
        senderId: mockUserId,
        recipientId: mockUserId2,
        content: 'a'.repeat(5001) // Exceeds maxlength
      });
      
      const error = message.validateSync();
      expect(error).to.exist;
      expect(error.errors.content).to.exist;
    });

    it('should validate subject length', function() {
      const message = new AlumniMessage({
        senderId: mockUserId,
        recipientId: mockUserId2,
        content: 'Test content',
        subject: 'a'.repeat(201) // Exceeds maxlength
      });
      
      const error = message.validateSync();
      expect(error).to.exist;
      expect(error.errors.subject).to.exist;
    });

    it('should accept valid message data', function() {
      const message = new AlumniMessage({
        senderId: mockUserId,
        recipientId: mockUserId2,
        subject: 'Test Subject',
        content: 'This is a test message',
        messageType: 'text',
        priority: 'normal',
        conversationId: 'test_conv_id' // Add required field
      });
      
      const error = message.validateSync();
      expect(error).to.not.exist;
    });

    it('should have correct virtual properties', function() {
      const message = new AlumniMessage({
        senderId: mockUserId,
        recipientId: mockUserId2,
        content: 'Test content',
        createdAt: new Date(), // Recent message
        attachments: [
          {
            filename: 'test.pdf',
            originalName: 'Test.pdf',
            mimeType: 'application/pdf',
            size: 1024
          }
        ]
      });
      
      expect(message.isRecent).to.be.true;
      expect(message.hasAttachments).to.be.true;
    });

    it('should generate conversation ID correctly', function() {
      const conversationId = AlumniMessage.generateConversationId(mockUserId, mockUserId2);
      expect(conversationId).to.be.a('string');
      expect(conversationId).to.include('conv_');
      
      // Should be the same regardless of order
      const reverseConversationId = AlumniMessage.generateConversationId(mockUserId2, mockUserId);
      expect(conversationId).to.equal(reverseConversationId);
    });
  });

  describe('Model Schema Integrity', function() {
    it('should have proper indexes defined', function() {
      // Check that models have appropriate indexes
      const alumniProfileIndexes = AlumniProfile.schema.indexes();
      const jobPostingIndexes = JobPosting.schema.indexes();
      const mentorshipIndexes = Mentorship.schema.indexes();
      const connectionIndexes = AlumniConnection.schema.indexes();
      const messageIndexes = AlumniMessage.schema.indexes();
      
      expect(alumniProfileIndexes).to.be.an('array').that.is.not.empty;
      expect(jobPostingIndexes).to.be.an('array').that.is.not.empty;
      expect(mentorshipIndexes).to.be.an('array').that.is.not.empty;
      expect(connectionIndexes).to.be.an('array').that.is.not.empty;
      expect(messageIndexes).to.be.an('array').that.is.not.empty;
    });

    it('should have proper field types', function() {
      const alumniProfilePaths = AlumniProfile.schema.paths;
      const jobPostingPaths = JobPosting.schema.paths;
      const mentorshipPaths = Mentorship.schema.paths;
      const connectionPaths = AlumniConnection.schema.paths;
      const messagePaths = AlumniMessage.schema.paths;
      
      // Check key field types
      expect(alumniProfilePaths.userId.instance).to.equal('ObjectId');
      expect(alumniProfilePaths.graduationYear.instance).to.equal('Number');
      expect(alumniProfilePaths.degree.instance).to.equal('String');
      
      expect(jobPostingPaths.posterId.instance).to.equal('ObjectId');
      expect(jobPostingPaths.title.instance).to.equal('String');
      expect(jobPostingPaths.applicationCount.instance).to.equal('Number');
      
      expect(mentorshipPaths.mentorId.instance).to.equal('ObjectId');
      expect(mentorshipPaths.menteeId.instance).to.equal('ObjectId');
      expect(mentorshipPaths.duration.instance).to.equal('Number');
      
      expect(connectionPaths.requesterId.instance).to.equal('ObjectId');
      expect(connectionPaths.recipientId.instance).to.equal('ObjectId');
      expect(connectionPaths.connectionStrength.instance).to.equal('Number');
      
      expect(messagePaths.senderId.instance).to.equal('ObjectId');
      expect(messagePaths.recipientId.instance).to.equal('ObjectId');
      expect(messagePaths.isRead.instance).to.equal('Boolean');
    });

    it('should have proper default values', function() {
      const alumniProfile = new AlumniProfile({
        userId: mockUserId,
        graduationYear: 2020,
        degree: 'Test Degree'
      });
      
      const jobPosting = new JobPosting({
        posterId: mockUserId,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'test@test.com'
      });
      
      const mentorship = new Mentorship({
        mentorId: mockUserId,
        menteeId: mockUserId2,
        program: 'career_guidance',
        requestMessage: 'Test message'
      });
      
      const connection = new AlumniConnection({
        requesterId: mockUserId,
        recipientId: mockUserId2,
        requestMessage: 'Test message'
      });
      
      const message = new AlumniMessage({
        senderId: mockUserId,
        recipientId: mockUserId2,
        content: 'Test content'
      });
      
      // Check default values
      expect(alumniProfile.verificationStatus).to.equal('pending');
      expect(alumniProfile.isActive).to.be.true;
      expect(alumniProfile.mentorshipAvailability.isAvailable).to.be.false;
      
      expect(jobPosting.status).to.equal('draft');
      expect(jobPosting.applicationCount).to.equal(0);
      expect(jobPosting.viewCount).to.equal(0);
      
      expect(mentorship.status).to.equal('requested');
      expect(mentorship.duration).to.equal(6);
      
      expect(connection.status).to.equal('pending');
      expect(connection.connectionStrength).to.equal(1);
      expect(connection.isActive).to.be.true;
      
      expect(message.isRead).to.be.false;
      expect(message.messageType).to.equal('text');
      expect(message.priority).to.equal('normal');
    });
  });
});