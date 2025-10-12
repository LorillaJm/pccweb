const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./server');
const User = require('./models/User');
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const InternshipService = require('./services/InternshipService');
const ApplicationTrackingService = require('./services/ApplicationTrackingService');
const InternshipWorkflowService = require('./services/InternshipWorkflowService');

describe('Internship Application and Tracking Integration Tests', () => {
  let testStudent, testCompany, testInternship, testApplication;
  let studentToken, adminToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test');
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Internship.deleteMany({}),
      InternshipApplication.deleteMany({})
    ]);

    // Create test student
    testStudent = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@student.pcc.edu.ph',
      password: 'password123',
      role: 'student',
      studentId: 'STU2024001',
      program: 'Computer Science',
      yearLevel: 3,
      gpa: 3.5,
      skills: ['JavaScript', 'React', 'Node.js'],
      isActive: true
    });

    // Create test admin
    const testAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@pcc.edu.ph',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    // Create test company
    testCompany = await Company.create({
      name: 'Tech Solutions Inc.',
      description: 'Leading technology company',
      industry: 'Technology',
      website: 'https://techsolutions.com',
      address: '123 Tech Street, Manila',
      contactPerson: {
        name: 'Jane Smith',
        email: 'jane.smith@techsolutions.com',
        phone: '+639123456789',
        position: 'HR Manager'
      },
      verificationStatus: 'verified',
      isActive: true
    });

    // Create test internship
    testInternship = await Internship.create({
      companyId: testCompany._id,
      title: 'Software Development Intern',
      description: 'Learn full-stack development with our team',
      requirements: ['Programming knowledge', 'Good communication skills'],
      skills: ['JavaScript', 'React', 'Node.js'],
      duration: 12,
      stipend: 15000,
      location: 'Manila',
      workArrangement: 'hybrid',
      slots: 5,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
      status: 'published',
      targetPrograms: ['Computer Science', 'Information Technology'],
      yearLevelRequirement: 3,
      createdBy: testAdmin._id
    });

    // Generate tokens for authentication
    studentToken = generateTestToken(testStudent);
    adminToken = generateTestToken(testAdmin);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Enhanced Application Submission Workflow', () => {
    test('should submit application with automated workflow initiation', async () => {
      const applicationData = {
        coverLetter: 'I am very interested in this internship opportunity...',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5,
          expectedGraduation: new Date('2025-05-15'),
          skills: ['JavaScript', 'React', 'Node.js'],
          previousExperience: 'Built several web applications'
        },
        preferences: {
          startDate: testInternship.startDate,
          workArrangement: 'hybrid'
        }
      };

      const result = await ApplicationTrackingService.submitApplicationWithWorkflow(
        testInternship._id,
        testStudent._id,
        applicationData
      );

      expect(result).toBeDefined();
      expect(result.application).toBeDefined();
      expect(result.workflow).toBeDefined();
      expect(result.application.status).toBe('submitted');
      expect(result.workflow.automatedActions).toContain('student_confirmation_sent');
      expect(result.workflow.automatedActions).toContain('company_notification_sent');

      // Verify application was created in database
      const savedApplication = await InternshipApplication.findById(result.application._id);
      expect(savedApplication).toBeDefined();
      expect(savedApplication.coverLetter).toBe(applicationData.coverLetter);
      expect(savedApplication.studentInfo.gpa).toBe(3.5);
    });

    test('should prevent duplicate applications', async () => {
      // Submit first application
      const applicationData = {
        coverLetter: 'First application',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5,
          expectedGraduation: new Date('2025-05-15')
        }
      };

      await ApplicationTrackingService.submitApplicationWithWorkflow(
        testInternship._id,
        testStudent._id,
        applicationData
      );

      // Try to submit duplicate application
      await expect(
        ApplicationTrackingService.submitApplicationWithWorkflow(
          testInternship._id,
          testStudent._id,
          applicationData
        )
      ).rejects.toThrow('You have already applied for this internship');
    });

    test('should validate internship availability', async () => {
      // Close internship applications
      testInternship.status = 'closed';
      await testInternship.save();

      const applicationData = {
        coverLetter: 'Test application',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science'
        }
      };

      await expect(
        ApplicationTrackingService.submitApplicationWithWorkflow(
          testInternship._id,
          testStudent._id,
          applicationData
        )
      ).rejects.toThrow('Applications are closed for this internship');
    });
  });

  describe('Company Review Dashboard', () => {
    beforeEach(async () => {
      // Create test application
      testApplication = await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Test cover letter',
        resume: 'test-resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5,
          expectedGraduation: new Date('2025-05-15'),
          skills: ['JavaScript', 'React']
        },
        status: 'submitted'
      });
    });

    test('should get enhanced company review dashboard', async () => {
      const dashboard = await ApplicationTrackingService.getCompanyReviewDashboard(
        testCompany._id,
        { page: 1, limit: 10 }
      );

      expect(dashboard).toBeDefined();
      expect(dashboard.applications).toHaveLength(1);
      expect(dashboard.statistics).toBeDefined();
      expect(dashboard.priorityApplications).toBeDefined();
      expect(dashboard.recommendations).toBeDefined();

      const application = dashboard.applications[0];
      expect(application.workflowStatus).toBeDefined();
      expect(application.priorityLevel).toBeDefined();
      expect(application.timeMetrics).toBeDefined();
      expect(application.nextActions).toBeDefined();
    });

    test('should filter applications by status', async () => {
      // Create additional applications with different statuses
      await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Another application',
        resume: 'resume2.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science'
        },
        status: 'under_review'
      });

      const dashboard = await ApplicationTrackingService.getCompanyReviewDashboard(
        testCompany._id,
        { status: 'submitted' }
      );

      expect(dashboard.applications).toHaveLength(1);
      expect(dashboard.applications[0].status).toBe('submitted');
    });

    test('should identify priority applications', async () => {
      // Create an old application that should be priority
      const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Old application',
        resume: 'old-resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science'
        },
        status: 'submitted',
        submittedAt: oldDate
      });

      const dashboard = await ApplicationTrackingService.getCompanyReviewDashboard(
        testCompany._id
      );

      expect(dashboard.priorityApplications.length).toBeGreaterThan(0);
      expect(dashboard.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Tracking with Milestones', () => {
    beforeEach(async () => {
      // Create accepted application
      testApplication = await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Test cover letter',
        resume: 'test-resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5
        },
        status: 'accepted',
        internshipStatus: 'in_progress',
        startedAt: new Date()
      });
    });

    test('should track progress with milestone automation', async () => {
      const progressData = {
        milestone: 'First Week Orientation',
        description: 'Completed orientation and setup',
        completionPercentage: 25,
        supervisorNotes: 'Good start, enthusiastic learner',
        studentReflection: 'Excited to learn and contribute'
      };

      const result = await ApplicationTrackingService.trackProgressWithMilestones(
        testApplication._id,
        progressData,
        testStudent._id
      );

      expect(result).toBeDefined();
      expect(result.progressEntry).toBeDefined();
      expect(result.overallProgress).toBe(25);
      expect(result.milestoneAchievements).toBeDefined();
      expect(result.nextMilestones).toBeDefined();
      expect(result.notifications).toBeDefined();

      // Verify progress was saved
      const updatedApplication = await InternshipApplication.findById(testApplication._id);
      expect(updatedApplication.progressTracking).toHaveLength(1);
      expect(updatedApplication.progressTracking[0].milestone).toBe(progressData.milestone);
      expect(updatedApplication.lastProgressReport).toBeDefined();
    });

    test('should detect milestone achievements', async () => {
      const progressData = {
        milestone: 'Quarter Progress',
        description: 'Completed 25% of internship',
        completionPercentage: 25,
        supervisorNotes: 'Meeting expectations'
      };

      const result = await ApplicationTrackingService.trackProgressWithMilestones(
        testApplication._id,
        progressData,
        testStudent._id
      );

      expect(result.milestoneAchievements).toHaveLength(1);
      expect(result.milestoneAchievements[0].threshold).toBe(25);
      expect(result.milestoneAchievements[0].title).toContain('25%');
    });

    test('should generate next milestone suggestions', async () => {
      const progressData = {
        milestone: 'Initial Setup',
        description: 'Environment setup complete',
        completionPercentage: 10
      };

      const result = await ApplicationTrackingService.trackProgressWithMilestones(
        testApplication._id,
        progressData,
        testStudent._id
      );

      expect(result.nextMilestones).toBeDefined();
      expect(result.nextMilestones.length).toBeGreaterThan(0);
      expect(result.nextMilestones[0].suggested).toBe(true);
      expect(result.nextMilestones[0].estimatedDate).toBeDefined();
    });

    test('should prevent progress tracking for non-active internships', async () => {
      testApplication.internshipStatus = 'completed';
      await testApplication.save();

      const progressData = {
        milestone: 'Test milestone',
        description: 'Test description',
        completionPercentage: 50
      };

      await expect(
        ApplicationTrackingService.trackProgressWithMilestones(
          testApplication._id,
          progressData,
          testStudent._id
        )
      ).rejects.toThrow('Internship must be in progress to track progress');
    });
  });

  describe('Automated Reminder System', () => {
    beforeEach(async () => {
      // Create applications with different statuses and dates
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Pending review application',
        resume: 'resume.pdf',
        studentInfo: { currentYear: 3, program: 'Computer Science' },
        status: 'submitted',
        submittedAt: threeDaysAgo
      });

      await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Progress overdue application',
        resume: 'resume2.pdf',
        studentInfo: { currentYear: 3, program: 'Computer Science' },
        status: 'accepted',
        internshipStatus: 'in_progress',
        startedAt: oneWeekAgo,
        lastProgressReport: oneWeekAgo
      });
    });

    test('should send application review reminders', async () => {
      const results = await ApplicationTrackingService.sendAutomatedReminders('application_review');

      expect(results).toBeDefined();
      expect(results.type).toBe('application_review');
      expect(results.sent).toBeGreaterThanOrEqual(0);
      expect(results.failed).toBeGreaterThanOrEqual(0);
    });

    test('should send progress report reminders', async () => {
      const results = await ApplicationTrackingService.sendAutomatedReminders('progress_reports');

      expect(results).toBeDefined();
      expect(results.type).toBe('progress_reports');
      expect(results.sent).toBeGreaterThanOrEqual(0);
    });

    test('should send all reminder types', async () => {
      const results = await ApplicationTrackingService.sendAutomatedReminders('all');

      expect(results).toBeDefined();
      expect(results.type).toBe('all');
      expect(results.sent).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Workflow Status and Timeline', () => {
    beforeEach(async () => {
      testApplication = await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Test application',
        resume: 'resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science'
        },
        status: 'under_review',
        reviewedAt: new Date()
      });
    });

    test('should get comprehensive workflow status', async () => {
      const workflowStatus = await InternshipWorkflowService.getApplicationWorkflowStatus(
        testApplication._id
      );

      expect(workflowStatus).toBeDefined();
      expect(workflowStatus.applicationId).toBe(testApplication._id.toString());
      expect(workflowStatus.currentStatus).toBe('under_review');
      expect(workflowStatus.timeline).toBeDefined();
      expect(workflowStatus.nextSteps).toBeDefined();
      expect(workflowStatus.progress).toBeDefined();

      // Check timeline structure
      expect(workflowStatus.timeline.length).toBeGreaterThan(0);
      expect(workflowStatus.timeline[0].status).toBe('submitted');
      expect(workflowStatus.timeline[0].completed).toBe(true);
    });

    test('should calculate application progress correctly', async () => {
      const workflowStatus = await InternshipWorkflowService.getApplicationWorkflowStatus(
        testApplication._id
      );

      expect(workflowStatus.progress).toBeGreaterThan(0);
      expect(workflowStatus.progress).toBeLessThanOrEqual(100);
    });

    test('should provide relevant next steps', async () => {
      const workflowStatus = await InternshipWorkflowService.getApplicationWorkflowStatus(
        testApplication._id
      );

      expect(workflowStatus.nextSteps).toBeDefined();
      expect(workflowStatus.nextSteps.length).toBeGreaterThan(0);
      expect(workflowStatus.nextSteps[0].step).toBeDefined();
      expect(workflowStatus.nextSteps[0].description).toBeDefined();
      expect(workflowStatus.nextSteps[0].responsible).toBeDefined();
    });
  });

  describe('Internship Lifecycle Management', () => {
    beforeEach(async () => {
      testApplication = await InternshipApplication.create({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Test application',
        resume: 'resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science'
        },
        status: 'accepted',
        internshipStatus: 'not_started'
      });
    });

    test('should start internship tracking', async () => {
      const result = await InternshipWorkflowService.startInternshipTracking(
        testApplication._id
      );

      expect(result).toBeDefined();
      expect(result.internshipStatus).toBe('in_progress');
      expect(result.startedAt).toBeDefined();
      expect(result.milestones).toBeDefined();
      expect(result.nextMilestone).toBeDefined();

      // Verify database update
      const updatedApplication = await InternshipApplication.findById(testApplication._id);
      expect(updatedApplication.internshipStatus).toBe('in_progress');
      expect(updatedApplication.startedAt).toBeDefined();
      expect(updatedApplication.progressTracking).toHaveLength(1);
    });

    test('should complete internship with evaluation', async () => {
      // First start the internship
      await InternshipWorkflowService.startInternshipTracking(testApplication._id);

      const completionData = {
        supervisorNotes: 'Excellent performance throughout the internship',
        studentReflection: 'Great learning experience',
        finalRating: 4.5
      };

      const result = await InternshipWorkflowService.completeInternshipWithEvaluation(
        testApplication._id,
        completionData
      );

      expect(result).toBeDefined();
      expect(result.internshipStatus).toBe('completed');
      expect(result.completedAt).toBeDefined();
      expect(result.finalRating).toBe(4.5);

      // Verify database update
      const updatedApplication = await InternshipApplication.findById(testApplication._id);
      expect(updatedApplication.internshipStatus).toBe('completed');
      expect(updatedApplication.completedAt).toBeDefined();
      expect(updatedApplication.finalRating).toBe(4.5);
    });

    test('should prevent starting tracking for non-accepted applications', async () => {
      testApplication.status = 'submitted';
      await testApplication.save();

      await expect(
        InternshipWorkflowService.startInternshipTracking(testApplication._id)
      ).rejects.toThrow('Application must be accepted to start internship tracking');
    });

    test('should prevent completing non-active internships', async () => {
      const completionData = {
        supervisorNotes: 'Test notes',
        finalRating: 4.0
      };

      await expect(
        InternshipWorkflowService.completeInternshipWithEvaluation(
          testApplication._id,
          completionData
        )
      ).rejects.toThrow('Internship must be in progress to complete');
    });
  });

  describe('Integration with Notification System', () => {
    test('should send notifications during application workflow', async () => {
      const applicationData = {
        coverLetter: 'Test application with notifications',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science'
        }
      };

      // Mock notification service to track calls
      const originalSendNotification = require('./services/NotificationService').sendNotification;
      let notificationsSent = 0;
      
      require('./services/NotificationService').sendNotification = jest.fn().mockImplementation(() => {
        notificationsSent++;
        return Promise.resolve();
      });

      const result = await ApplicationTrackingService.submitApplicationWithWorkflow(
        testInternship._id,
        testStudent._id,
        applicationData
      );

      expect(notificationsSent).toBeGreaterThan(0);
      expect(result.workflow.automatedActions).toContain('student_confirmation_sent');

      // Restore original function
      require('./services/NotificationService').sendNotification = originalSendNotification;
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid application IDs gracefully', async () => {
      const invalidId = new mongoose.Types.ObjectId();

      await expect(
        ApplicationTrackingService.trackProgressWithMilestones(
          invalidId,
          { milestone: 'Test', completionPercentage: 50 },
          testStudent._id
        )
      ).rejects.toThrow('Application not found');
    });

    test('should handle invalid internship IDs gracefully', async () => {
      const invalidId = new mongoose.Types.ObjectId();

      await expect(
        ApplicationTrackingService.submitApplicationWithWorkflow(
          invalidId,
          testStudent._id,
          { coverLetter: 'Test' }
        )
      ).rejects.toThrow('Internship not found');
    });

    test('should handle missing required fields', async () => {
      await expect(
        ApplicationTrackingService.submitApplicationWithWorkflow(
          testInternship._id,
          testStudent._id,
          {} // Missing required fields
        )
      ).rejects.toThrow();
    });
  });
});

// Helper function to generate test tokens
function generateTestToken(user) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

// Export for use in other test files
module.exports = {
  generateTestToken
};