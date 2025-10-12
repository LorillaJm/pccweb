const mongoose = require('mongoose');
const { expect } = require('chai');

// Import models
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Mentorship = require('./models/Mentorship');
const AlumniConnection = require('./models/AlumniConnection');
const AlumniMessage = require('./models/AlumniMessage');

describe('Alumni Models Integration Tests', function() {
  const mockUserId1 = new mongoose.Types.ObjectId();
  const mockUserId2 = new mongoose.Types.ObjectId();
  const mockUserId3 = new mongoose.Types.ObjectId();

  describe('Model Relationships and Business Logic', function() {
    it('should create a complete alumni networking scenario', function() {
      // Create alumni profiles
      const alumniProfile1 = new AlumniProfile({
        userId: mockUserId1,
        graduationYear: 2020,
        degree: 'Bachelor of Science in Computer Science',
        currentPosition: 'Senior Software Developer',
        currentCompany: 'Tech Corp',
        industry: 'Technology',
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Web Development', 'Career Guidance'],
          maxMentees: 3,
          currentMentees: 0
        }
      });

      const alumniProfile2 = new AlumniProfile({
        userId: mockUserId2,
        graduationYear: 2021,
        degree: 'Bachelor of Science in Information Technology',
        currentPosition: 'Junior Developer',
        currentCompany: 'StartupCorp',
        industry: 'Technology'
      });

      // Verify profiles are valid
      expect(alumniProfile1.validateSync()).to.not.exist;
      expect(alumniProfile2.validateSync()).to.not.exist;
      expect(alumniProfile1.canAcceptMentees).to.be.true;
    });

    it('should create a job posting and validate targeting', function() {
      const jobPosting = new JobPosting({
        posterId: mockUserId1,
        posterType: 'alumni',
        title: 'Full Stack Developer Position',
        company: 'Tech Solutions Inc.',
        description: 'We are looking for a talented full stack developer.',
        location: 'Manila, Philippines',
        workType: 'full_time',
        contactEmail: 'hr@techsolutions.com',
        targetAudience: 'both',
        preferredPrograms: ['Computer Science', 'Information Technology'],
        preferredGraduationYears: [2020, 2021, 2022],
        skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
        status: 'active',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      expect(jobPosting.validateSync()).to.not.exist;
      expect(jobPosting.canAcceptApplications).to.be.true;
      expect(jobPosting.daysUntilDeadline).to.be.approximately(30, 1);
    });

    it('should create a mentorship relationship', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId1, // Senior developer
        menteeId: mockUserId3, // Student
        program: 'career_guidance',
        focusAreas: ['Web Development', 'Career Planning'],
        requestMessage: 'I would like guidance on transitioning to a software development career.',
        duration: 6,
        meetingSchedule: {
          frequency: 'bi_weekly',
          preferredDay: 'saturday',
          preferredTime: '14:00',
          meetingType: 'video_call'
        },
        goals: [
          {
            description: 'Learn modern web development frameworks',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            status: 'not_started'
          },
          {
            description: 'Build a portfolio website',
            targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
            status: 'not_started'
          }
        ]
      });

      expect(mentorship.validateSync()).to.not.exist;
      expect(mentorship.status).to.equal('requested');
      expect(mentorship.progressPercentage).to.equal(0);
      expect(mentorship.goals).to.have.length(2);
    });

    it('should create alumni connections', function() {
      const connection = new AlumniConnection({
        requesterId: mockUserId2,
        recipientId: mockUserId1,
        connectionType: 'professional',
        requestMessage: 'Hi! I\'d like to connect with you as we\'re both in the tech industry and I admire your career progression.',
        commonInterests: ['Web Development', 'Technology', 'Career Growth']
      });

      expect(connection.validateSync()).to.not.exist;
      expect(connection.status).to.equal('pending');
      expect(connection.connectionStrength).to.equal(1);
      expect(connection.isActive).to.be.true;
    });

    it('should create alumni messages', function() {
      const conversationId = AlumniMessage.generateConversationId(mockUserId1, mockUserId2);
      
      const message1 = new AlumniMessage({
        senderId: mockUserId2,
        recipientId: mockUserId1,
        conversationId: conversationId,
        subject: 'Thank you for connecting!',
        content: 'Hi! Thank you for accepting my connection request. I\'m really excited to learn from your experience in the tech industry.',
        messageType: 'connection_request',
        priority: 'normal'
      });

      const message2 = new AlumniMessage({
        senderId: mockUserId1,
        recipientId: mockUserId2,
        conversationId: conversationId,
        subject: 'Re: Thank you for connecting!',
        content: 'You\'re welcome! I\'m happy to help. Feel free to reach out if you have any questions about career development.',
        messageType: 'text',
        priority: 'normal',
        replyToMessageId: message1._id
      });

      expect(message1.validateSync()).to.not.exist;
      expect(message2.validateSync()).to.not.exist;
      expect(message1.conversationId).to.equal(message2.conversationId);
      expect(message1.isRead).to.be.false;
      expect(message1.hasAttachments).to.be.false;
    });

    it('should handle mentorship workflow progression', function() {
      const mentorship = new Mentorship({
        mentorId: mockUserId1,
        menteeId: mockUserId3,
        program: 'career_guidance',
        requestMessage: 'Test message',
        status: 'active',
        startDate: new Date(),
        goals: [
          { description: 'Goal 1', status: 'not_started' },
          { description: 'Goal 2', status: 'not_started' }
        ]
      });

      // Simulate goal completion
      mentorship.goals[0].status = 'completed';
      mentorship.goals[0].completedDate = new Date();

      // Add a session
      mentorship.sessions.push({
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'video_call',
        status: 'scheduled',
        agenda: 'Discuss progress and next steps'
      });

      // Add progress update
      mentorship.progress.push({
        milestone: 'Completed first project',
        description: 'Successfully built a responsive website',
        addedBy: mockUserId3
      });

      expect(mentorship.progressPercentage).to.equal(50);
      expect(mentorship.sessions).to.have.length(1);
      expect(mentorship.progress).to.have.length(1);
      expect(mentorship.nextSession).to.exist;
    });

    it('should handle connection workflow', function() {
      const connection = new AlumniConnection({
        requesterId: mockUserId2,
        recipientId: mockUserId1,
        connectionType: 'professional',
        requestMessage: 'Test connection request'
      });

      // Accept connection
      connection.status = 'accepted';
      connection.responseMessage = 'Great to connect!';
      connection.acceptedAt = new Date();

      // Simulate interactions
      connection.interactionCount = 5;
      connection.lastInteraction = new Date();

      // Add tags
      connection.tags = ['colleague', 'tech-industry', 'mentor'];

      expect(connection.status).to.equal('accepted');
      expect(connection.acceptedAt).to.exist;
      expect(connection.tags).to.include('colleague');
      expect(connection.connectionAge).to.be.at.least(0);
    });

    it('should validate business rules across models', function() {
      // Alumni profile with mentorship availability
      const mentorProfile = new AlumniProfile({
        userId: mockUserId1,
        graduationYear: 2020,
        degree: 'Test Degree',
        mentorshipAvailability: {
          isAvailable: true,
          maxMentees: 2,
          currentMentees: 1
        }
      });

      // Job posting with specific requirements
      const jobPosting = new JobPosting({
        posterId: mockUserId1,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'test@test.com',
        status: 'active', // Set to active to accept applications
        applicationLimit: 10,
        applicationCount: 5,
        autoCloseOnLimit: true
      });

      // Verify business logic
      expect(mentorProfile.canAcceptMentees).to.be.true;
      expect(jobPosting.canAcceptApplications).to.be.true;

      // Simulate reaching limits
      mentorProfile.mentorshipAvailability.currentMentees = 2;
      jobPosting.applicationCount = 10;
      jobPosting.status = 'closed'; // Manually set status since auto-close happens on save

      expect(mentorProfile.canAcceptMentees).to.be.false;
      expect(jobPosting.canAcceptApplications).to.be.false;
    });

    it('should maintain data consistency across related models', function() {
      // Create related data
      const alumniProfile = new AlumniProfile({
        userId: mockUserId1,
        graduationYear: 2020,
        degree: 'Computer Science',
        networkingStats: {
          connectionsCount: 0,
          profileViews: 0
        }
      });

      const connection = new AlumniConnection({
        requesterId: mockUserId2,
        recipientId: mockUserId1,
        requestMessage: 'Test message',
        status: 'accepted'
      });

      const message = new AlumniMessage({
        senderId: mockUserId2,
        recipientId: mockUserId1,
        content: 'Test message',
        conversationId: AlumniMessage.generateConversationId(mockUserId2, mockUserId1),
        metadata: {
          connectionId: connection._id
        }
      });

      // Verify relationships
      expect(message.metadata.connectionId.toString()).to.equal(connection._id.toString());
      expect(connection.requesterId.toString()).to.equal(mockUserId2.toString());
      expect(connection.recipientId.toString()).to.equal(alumniProfile.userId.toString());
    });
  });

  describe('Model Static Methods and Utilities', function() {
    it('should provide useful static methods for querying', function() {
      // Test static method existence and basic functionality
      expect(AlumniProfile.findByGraduationRange).to.be.a('function');
      expect(AlumniProfile.findAvailableMentors).to.be.a('function');
      expect(AlumniProfile.searchBySkillsOrIndustry).to.be.a('function');

      expect(JobPosting.findActiveJobs).to.be.a('function');
      expect(JobPosting.searchJobs).to.be.a('function');
      expect(JobPosting.findJobsForUser).to.be.a('function');

      expect(Mentorship.findActiveForUser).to.be.a('function');
      expect(Mentorship.findPendingRequests).to.be.a('function');
      expect(Mentorship.getMentorshipStats).to.be.a('function');

      expect(AlumniConnection.findUserConnections).to.be.a('function');
      expect(AlumniConnection.connectionExists).to.be.a('function');
      expect(AlumniConnection.findMutualConnections).to.be.a('function');

      expect(AlumniMessage.findConversation).to.be.a('function');
      expect(AlumniMessage.generateConversationId).to.be.a('function');
      expect(AlumniMessage.getUnreadCount).to.be.a('function');
    });

    it('should generate consistent conversation IDs', function() {
      const id1 = AlumniMessage.generateConversationId(mockUserId1, mockUserId2);
      const id2 = AlumniMessage.generateConversationId(mockUserId2, mockUserId1);
      
      expect(id1).to.equal(id2);
      expect(id1).to.include('conv_');
      expect(id1).to.be.a('string');
    });

    it('should handle model instance methods correctly', function() {
      const alumniProfile = new AlumniProfile({
        userId: mockUserId1,
        graduationYear: 2020,
        degree: 'Test Degree',
        networkingStats: { profileViews: 5 }
      });

      const jobPosting = new JobPosting({
        posterId: mockUserId1,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'test@test.com',
        viewCount: 10
      });

      const message = new AlumniMessage({
        senderId: mockUserId1,
        recipientId: mockUserId2,
        content: 'Test message',
        conversationId: 'test_conv',
        isRead: false
      });

      // Test instance methods exist
      expect(alumniProfile.incrementProfileViews).to.be.a('function');
      expect(jobPosting.incrementViewCount).to.be.a('function');
      expect(message.markAsRead).to.be.a('function');
      expect(message.archive).to.be.a('function');
      expect(message.softDelete).to.be.a('function');
    });
  });
});