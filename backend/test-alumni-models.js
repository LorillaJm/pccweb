const mongoose = require('mongoose');
const { expect } = require('chai');

// Import models
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Mentorship = require('./models/Mentorship');
const AlumniConnection = require('./models/AlumniConnection');
const AlumniMessage = require('./models/AlumniMessage');
const User = require('./models/User');

describe('Alumni Models Unit Tests', function() {
  let testUsers = [];
  let testAlumniProfile;
  let testJobPosting;
  let testMentorship;
  let testConnection;
  let testMessage;

  before(async function() {
    this.timeout(10000);
    
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Create test users
    const userData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        studentId: 'TEST001',
        role: 'alumni',
        program: 'Computer Science',
        yearLevel: 4,
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        studentId: 'TEST002',
        role: 'alumni',
        program: 'Information Technology',
        yearLevel: 4,
        isActive: true
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@test.com',
        studentId: 'TEST003',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 3,
        isActive: true
      }
    ];

    for (const data of userData) {
      const user = new User(data);
      await user.save();
      testUsers.push(user);
    }
  });

  after(async function() {
    // Clean up test data
    await AlumniProfile.deleteMany({ userId: { $in: testUsers.map(u => u._id) } });
    await JobPosting.deleteMany({ posterId: { $in: testUsers.map(u => u._id) } });
    await Mentorship.deleteMany({ 
      $or: [
        { mentorId: { $in: testUsers.map(u => u._id) } },
        { menteeId: { $in: testUsers.map(u => u._id) } }
      ]
    });
    await AlumniConnection.deleteMany({
      $or: [
        { requesterId: { $in: testUsers.map(u => u._id) } },
        { recipientId: { $in: testUsers.map(u => u._id) } }
      ]
    });
    await AlumniMessage.deleteMany({
      $or: [
        { senderId: { $in: testUsers.map(u => u._id) } },
        { recipientId: { $in: testUsers.map(u => u._id) } }
      ]
    });
    await User.deleteMany({ _id: { $in: testUsers.map(u => u._id) } });
  });

  describe('AlumniProfile Model', function() {
    it('should create a valid alumni profile', async function() {
      const profileData = {
        userId: testUsers[0]._id,
        graduationYear: 2020,
        degree: 'Bachelor of Science in Computer Science',
        major: 'Software Engineering',
        currentPosition: 'Software Developer',
        currentCompany: 'Tech Corp',
        industry: 'Technology',
        location: 'Manila, Philippines',
        bio: 'Passionate software developer with 3 years of experience',
        skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
        achievements: ['Dean\'s List', 'Best Thesis Award'],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe'
        },
        mentorshipAvailability: {
          isAvailable: true,
          expertise: ['Web Development', 'Career Guidance'],
          preferredMenteeLevel: ['undergraduate', 'new_graduate'],
          maxMentees: 3
        }
      };

      testAlumniProfile = new AlumniProfile(profileData);
      const savedProfile = await testAlumniProfile.save();

      expect(savedProfile).to.exist;
      expect(savedProfile.userId.toString()).to.equal(testUsers[0]._id.toString());
      expect(savedProfile.graduationYear).to.equal(2020);
      expect(savedProfile.degree).to.equal('Bachelor of Science in Computer Science');
      expect(savedProfile.skills).to.include('JavaScript');
      expect(savedProfile.mentorshipAvailability.isAvailable).to.be.true;
      expect(savedProfile.verificationStatus).to.equal('pending');
      expect(savedProfile.isActive).to.be.true;
    });

    it('should validate graduation year range', async function() {
      const invalidProfile = new AlumniProfile({
        userId: testUsers[1]._id,
        graduationYear: 1900, // Invalid year
        degree: 'Test Degree'
      });

      try {
        await invalidProfile.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.graduationYear).to.exist;
      }
    });

    it('should validate social links format', async function() {
      const invalidProfile = new AlumniProfile({
        userId: testUsers[1]._id,
        graduationYear: 2021,
        degree: 'Test Degree',
        socialLinks: {
          linkedin: 'invalid-url'
        }
      });

      try {
        await invalidProfile.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors['socialLinks.linkedin']).to.exist;
      }
    });

    it('should find alumni by graduation range', async function() {
      const alumni = await AlumniProfile.findByGraduationRange(2019, 2021);
      expect(alumni).to.be.an('array');
      expect(alumni.length).to.be.at.least(1);
      expect(alumni[0].graduationYear).to.be.within(2019, 2021);
    });

    it('should find available mentors', async function() {
      const mentors = await AlumniProfile.findAvailableMentors('Web Development');
      expect(mentors).to.be.an('array');
      expect(mentors.length).to.be.at.least(1);
      expect(mentors[0].mentorshipAvailability.isAvailable).to.be.true;
    });

    it('should increment profile views', async function() {
      const initialViews = testAlumniProfile.networkingStats.profileViews;
      await testAlumniProfile.incrementProfileViews();
      expect(testAlumniProfile.networkingStats.profileViews).to.equal(initialViews + 1);
    });

    it('should validate career history dates', async function() {
      testAlumniProfile.careerHistory.push({
        position: 'Junior Developer',
        company: 'StartupCorp',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2020-12-31'), // End date before start date
        isCurrent: false
      });

      try {
        await testAlumniProfile.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors['careerHistory.0.endDate']).to.exist;
      }
    });
  });

  describe('JobPosting Model', function() {
    it('should create a valid job posting', async function() {
      const jobData = {
        posterId: testUsers[0]._id,
        posterType: 'alumni',
        title: 'Software Developer Position',
        company: 'Tech Solutions Inc.',
        description: 'We are looking for a talented software developer to join our team.',
        requirements: ['Bachelor\'s degree in CS/IT', '2+ years experience', 'JavaScript proficiency'],
        skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
        location: 'Makati, Philippines',
        workType: 'full_time',
        workArrangement: 'hybrid',
        experienceLevel: 'junior',
        salaryRange: {
          min: 30000,
          max: 50000,
          currency: 'PHP',
          isNegotiable: true
        },
        benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        contactEmail: 'hr@techsolutions.com',
        contactPhone: '+639123456789',
        targetAudience: 'both',
        preferredPrograms: ['Computer Science', 'Information Technology'],
        requiredDocuments: ['resume', 'cover_letter'],
        status: 'active',
        tags: ['javascript', 'web-development', 'full-time']
      };

      testJobPosting = new JobPosting(jobData);
      const savedJob = await testJobPosting.save();

      expect(savedJob).to.exist;
      expect(savedJob.title).to.equal('Software Developer Position');
      expect(savedJob.workType).to.equal('full_time');
      expect(savedJob.salaryRange.min).to.equal(30000);
      expect(savedJob.skills).to.include('JavaScript');
      expect(savedJob.status).to.equal('active');
      expect(savedJob.applicationCount).to.equal(0);
      expect(savedJob.viewCount).to.equal(0);
    });

    it('should validate salary range', async function() {
      const invalidJob = new JobPosting({
        posterId: testUsers[0]._id,
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

      try {
        await invalidJob.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors['salaryRange.max']).to.exist;
      }
    });

    it('should validate email format', async function() {
      const invalidJob = new JobPosting({
        posterId: testUsers[0]._id,
        posterType: 'alumni',
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        location: 'Test Location',
        workType: 'full_time',
        contactEmail: 'invalid-email'
      });

      try {
        await invalidJob.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.contactEmail).to.exist;
      }
    });

    it('should find active jobs', async function() {
      const activeJobs = await JobPosting.findActiveJobs();
      expect(activeJobs).to.be.an('array');
      expect(activeJobs.length).to.be.at.least(1);
      expect(activeJobs[0].status).to.equal('active');
    });

    it('should search jobs by text', async function() {
      const searchResults = await JobPosting.searchJobs('Software Developer');
      expect(searchResults).to.be.an('array');
      expect(searchResults.length).to.be.at.least(1);
    });

    it('should increment view count', async function() {
      const initialViews = testJobPosting.viewCount;
      await testJobPosting.incrementViewCount();
      expect(testJobPosting.viewCount).to.equal(initialViews + 1);
    });

    it('should increment application count', async function() {
      const initialCount = testJobPosting.applicationCount;
      await testJobPosting.incrementApplicationCount();
      expect(testJobPosting.applicationCount).to.equal(initialCount + 1);
    });

    it('should check if job can accept applications', function() {
      expect(testJobPosting.canAcceptApplications).to.be.true;
    });

    it('should calculate days until deadline', function() {
      expect(testJobPosting.daysUntilDeadline).to.be.a('number');
      expect(testJobPosting.daysUntilDeadline).to.be.greaterThan(0);
    });
  });

  describe('Mentorship Model', function() {
    it('should create a valid mentorship request', async function() {
      const mentorshipData = {
        mentorId: testUsers[0]._id,
        menteeId: testUsers[2]._id,
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
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          },
          {
            description: 'Build a portfolio website',
            targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
          }
        ]
      };

      testMentorship = new Mentorship(mentorshipData);
      const savedMentorship = await testMentorship.save();

      expect(savedMentorship).to.exist;
      expect(savedMentorship.mentorId.toString()).to.equal(testUsers[0]._id.toString());
      expect(savedMentorship.menteeId.toString()).to.equal(testUsers[2]._id.toString());
      expect(savedMentorship.program).to.equal('career_guidance');
      expect(savedMentorship.status).to.equal('requested');
      expect(savedMentorship.goals).to.have.length(2);
      expect(savedMentorship.duration).to.equal(6);
    });

    it('should validate meeting time format', async function() {
      const invalidMentorship = new Mentorship({
        mentorId: testUsers[0]._id,
        menteeId: testUsers[2]._id,
        program: 'career_guidance',
        requestMessage: 'Test message',
        meetingSchedule: {
          preferredTime: '25:00' // Invalid time
        }
      });

      try {
        await invalidMentorship.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors['meetingSchedule.preferredTime']).to.exist;
      }
    });

    it('should validate date ranges', async function() {
      const invalidMentorship = new Mentorship({
        mentorId: testUsers[0]._id,
        menteeId: testUsers[2]._id,
        program: 'career_guidance',
        requestMessage: 'Test message',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-11-01') // End before start
      });

      try {
        await invalidMentorship.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.endDate).to.exist;
      }
    });

    it('should find active mentorships for user', async function() {
      // First accept the mentorship
      testMentorship.status = 'active';
      testMentorship.startDate = new Date();
      await testMentorship.save();

      const activeMentorships = await Mentorship.findActiveForUser(testUsers[0]._id);
      expect(activeMentorships).to.be.an('array');
      expect(activeMentorships.length).to.be.at.least(1);
    });

    it('should schedule a session', async function() {
      const sessionData = {
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'video_call',
        agenda: 'Discuss career goals and next steps'
      };

      await testMentorship.scheduleSession(sessionData);
      expect(testMentorship.sessions).to.have.length(1);
      expect(testMentorship.sessions[0].status).to.equal('scheduled');
      expect(testMentorship.statistics.totalSessions).to.equal(1);
    });

    it('should complete a session', async function() {
      const sessionId = testMentorship.sessions[0]._id;
      const sessionData = {
        duration: 60,
        notes: 'Great discussion about career planning',
        actionItems: [
          {
            description: 'Update resume',
            assignedTo: 'mentee',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        ],
        mentorRating: 5,
        menteeRating: 5
      };

      await testMentorship.completeSession(sessionId, sessionData);
      const completedSession = testMentorship.sessions.id(sessionId);
      expect(completedSession.status).to.equal('completed');
      expect(completedSession.duration).to.equal(60);
      expect(testMentorship.statistics.completedSessions).to.equal(1);
    });

    it('should add progress update', async function() {
      const progressData = {
        milestone: 'Completed first portfolio project',
        description: 'Built a responsive website using HTML, CSS, and JavaScript'
      };

      await testMentorship.addProgress(progressData, testUsers[2]._id);
      expect(testMentorship.progress).to.have.length(1);
      expect(testMentorship.progress[0].milestone).to.equal('Completed first portfolio project');
    });

    it('should update goal status', async function() {
      const goalId = testMentorship.goals[0]._id;
      await testMentorship.updateGoalStatus(goalId, 'completed', 'Successfully learned React and Vue.js');
      
      const updatedGoal = testMentorship.goals.id(goalId);
      expect(updatedGoal.status).to.equal('completed');
      expect(updatedGoal.completedDate).to.exist;
      expect(testMentorship.statistics.goalsCompleted).to.equal(1);
    });

    it('should calculate progress percentage', function() {
      expect(testMentorship.progressPercentage).to.equal(50); // 1 out of 2 goals completed
    });

    it('should submit feedback', async function() {
      const feedbackData = {
        rating: 5,
        helpfulness: 5,
        availability: 4,
        expertise: 5,
        comments: 'Excellent mentor, very helpful and knowledgeable',
        wouldRecommend: true
      };

      await testMentorship.submitFeedback(feedbackData, 'mentee');
      expect(testMentorship.feedback.menteeFeedback.rating).to.equal(5);
      expect(testMentorship.feedback.menteeFeedback.wouldRecommend).to.be.true;
    });
  });

  describe('AlumniConnection Model', function() {
    it('should create a valid connection request', async function() {
      const connectionData = {
        requesterId: testUsers[0]._id,
        recipientId: testUsers[1]._id,
        connectionType: 'professional',
        requestMessage: 'Hi! I\'d like to connect with you as we\'re both in the tech industry.',
        commonInterests: ['Web Development', 'Startups']
      };

      testConnection = new AlumniConnection(connectionData);
      const savedConnection = await testConnection.save();

      expect(savedConnection).to.exist;
      expect(savedConnection.requesterId.toString()).to.equal(testUsers[0]._id.toString());
      expect(savedConnection.recipientId.toString()).to.equal(testUsers[1]._id.toString());
      expect(savedConnection.status).to.equal('pending');
      expect(savedConnection.connectionType).to.equal('professional');
      expect(savedConnection.connectionStrength).to.equal(1);
    });

    it('should prevent duplicate connections', async function() {
      const duplicateConnection = new AlumniConnection({
        requesterId: testUsers[0]._id,
        recipientId: testUsers[1]._id,
        connectionType: 'professional',
        requestMessage: 'Another connection request'
      });

      try {
        await duplicateConnection.save();
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).to.equal(11000); // MongoDB duplicate key error
      }
    });

    it('should accept connection request', async function() {
      await testConnection.acceptConnection('Great to connect with you too!');
      expect(testConnection.status).to.equal('accepted');
      expect(testConnection.responseMessage).to.equal('Great to connect with you too!');
      expect(testConnection.acceptedAt).to.exist;
    });

    it('should find user connections', async function() {
      const connections = await AlumniConnection.findUserConnections(testUsers[0]._id);
      expect(connections).to.be.an('array');
      expect(connections.length).to.be.at.least(1);
      expect(connections[0].status).to.equal('accepted');
    });

    it('should check if connection exists', async function() {
      const exists = await AlumniConnection.connectionExists(testUsers[0]._id, testUsers[1]._id);
      expect(exists).to.exist;
      expect(exists.status).to.equal('accepted');
    });

    it('should update interaction', async function() {
      const initialCount = testConnection.interactionCount;
      await testConnection.updateInteraction();
      expect(testConnection.interactionCount).to.equal(initialCount + 1);
      expect(testConnection.lastInteraction).to.exist;
    });

    it('should add and remove tags', async function() {
      await testConnection.addTags(['colleague', 'tech-industry']);
      expect(testConnection.tags).to.include('colleague');
      expect(testConnection.tags).to.include('tech-industry');

      await testConnection.removeTags(['colleague']);
      expect(testConnection.tags).to.not.include('colleague');
      expect(testConnection.tags).to.include('tech-industry');
    });

    it('should calculate connection age', function() {
      expect(testConnection.connectionAge).to.be.a('number');
      expect(testConnection.connectionAge).to.be.at.least(0);
    });
  });

  describe('AlumniMessage Model', function() {
    it('should create a valid message', async function() {
      const messageData = {
        senderId: testUsers[0]._id,
        recipientId: testUsers[1]._id,
        subject: 'Great to connect!',
        content: 'Hi Jane, it\'s great to connect with you. I saw your profile and noticed we have similar interests in web development.',
        messageType: 'text',
        priority: 'normal',
        metadata: {
          connectionId: testConnection._id
        }
      };

      testMessage = new AlumniMessage(messageData);
      const savedMessage = await testMessage.save();

      expect(savedMessage).to.exist;
      expect(savedMessage.senderId.toString()).to.equal(testUsers[0]._id.toString());
      expect(savedMessage.recipientId.toString()).to.equal(testUsers[1]._id.toString());
      expect(savedMessage.subject).to.equal('Great to connect!');
      expect(savedMessage.isRead).to.be.false;
      expect(savedMessage.conversationId).to.exist;
      expect(savedMessage.threadId).to.exist;
    });

    it('should generate conversation ID correctly', function() {
      const conversationId = AlumniMessage.generateConversationId(testUsers[0]._id, testUsers[1]._id);
      expect(conversationId).to.be.a('string');
      expect(conversationId).to.include('conv_');
      
      // Should be the same regardless of order
      const reverseConversationId = AlumniMessage.generateConversationId(testUsers[1]._id, testUsers[0]._id);
      expect(conversationId).to.equal(reverseConversationId);
    });

    it('should mark message as read', async function() {
      expect(testMessage.isRead).to.be.false;
      await testMessage.markAsRead();
      expect(testMessage.isRead).to.be.true;
      expect(testMessage.readAt).to.exist;
      expect(testMessage.deliveryStatus).to.equal('delivered');
    });

    it('should find conversation between users', async function() {
      const conversation = await AlumniMessage.findConversation(testUsers[0]._id, testUsers[1]._id);
      expect(conversation).to.be.an('array');
      expect(conversation.length).to.be.at.least(1);
      expect(conversation[0].conversationId).to.equal(testMessage.conversationId);
    });

    it('should get unread count', async function() {
      // Create another unread message
      const unreadMessage = new AlumniMessage({
        senderId: testUsers[1]._id,
        recipientId: testUsers[0]._id,
        content: 'Reply message',
        messageType: 'text'
      });
      await unreadMessage.save();

      const unreadCount = await AlumniMessage.getUnreadCount(testUsers[0]._id);
      expect(unreadCount).to.be.at.least(1);
    });

    it('should archive message', async function() {
      await testMessage.archive();
      expect(testMessage.isArchived).to.be.true;
      expect(testMessage.archivedAt).to.exist;
    });

    it('should soft delete message', async function() {
      await testMessage.softDelete(testUsers[0]._id);
      expect(testMessage.isDeleted).to.be.true;
      expect(testMessage.deletedAt).to.exist;
      expect(testMessage.deletedBy.toString()).to.equal(testUsers[0]._id.toString());
    });

    it('should add tags to message', async function() {
      await testMessage.addTags(['important', 'follow-up']);
      expect(testMessage.tags).to.include('important');
      expect(testMessage.tags).to.include('follow-up');
    });

    it('should check if message is recent', function() {
      expect(testMessage.isRecent).to.be.true;
    });

    it('should check if message has attachments', function() {
      expect(testMessage.hasAttachments).to.be.false;
      
      testMessage.attachments.push({
        filename: 'test.pdf',
        originalName: 'Test Document.pdf',
        mimeType: 'application/pdf',
        size: 1024
      });
      
      expect(testMessage.hasAttachments).to.be.true;
    });
  });

  describe('Model Integration Tests', function() {
    it('should maintain referential integrity between models', async function() {
      // Verify that alumni profile references the correct user
      const profile = await AlumniProfile.findOne({ userId: testUsers[0]._id }).populate('userId');
      expect(profile.userId.email).to.equal('john.doe@test.com');

      // Verify that job posting references the correct poster
      const job = await JobPosting.findOne({ posterId: testUsers[0]._id }).populate('posterId');
      expect(job.posterId.email).to.equal('john.doe@test.com');

      // Verify that mentorship references correct mentor and mentee
      const mentorship = await Mentorship.findOne({ mentorId: testUsers[0]._id })
        .populate('mentorId menteeId');
      expect(mentorship.mentorId.email).to.equal('john.doe@test.com');
      expect(mentorship.menteeId.email).to.equal('bob.johnson@test.com');
    });

    it('should handle cascading operations correctly', async function() {
      // Test that related data is properly managed when user status changes
      const alumniProfile = await AlumniProfile.findOne({ userId: testUsers[0]._id });
      expect(alumniProfile.isActive).to.be.true;

      // Deactivate user and verify related data
      testUsers[0].isActive = false;
      await testUsers[0].save();

      // Alumni profile should still exist but could be marked as inactive in business logic
      const updatedProfile = await AlumniProfile.findOne({ userId: testUsers[0]._id });
      expect(updatedProfile).to.exist;
    });

    it('should support complex queries across models', async function() {
      // Find all mentorships for alumni who graduated in a specific year
      const mentorships = await Mentorship.aggregate([
        {
          $lookup: {
            from: 'alumniprofiles',
            localField: 'mentorId',
            foreignField: 'userId',
            as: 'mentorProfile'
          }
        },
        {
          $unwind: '$mentorProfile'
        },
        {
          $match: {
            'mentorProfile.graduationYear': 2020,
            status: 'active'
          }
        }
      ]);

      expect(mentorships).to.be.an('array');
    });
  });
});