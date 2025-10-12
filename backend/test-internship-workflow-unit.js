const mongoose = require('mongoose');
const InternshipWorkflowService = require('./services/InternshipWorkflowService');
const InternshipApplication = require('./models/InternshipApplication');
const Internship = require('./models/Internship');
const User = require('./models/User');
const Company = require('./models/Company');

async function runTests() {
  console.log('Starting InternshipWorkflowService Unit Tests...');
  let testsPassed = 0;
  let testsFailed = 0;
  let studentUser, companyUser, company, internship, application;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test');
    }
  });

  beforeEach(async () => {
    // Clear existing data
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Company.deleteMany({ name: { $regex: /Test/ } });
    await Internship.deleteMany({ title: { $regex: /Test/ } });
    await InternshipApplication.deleteMany({});

    // Create test data
    studentUser = await User.create({
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      program: 'Computer Science',
      yearLevel: 3,
      isActive: true
    });

    companyUser = await User.create({
      firstName: 'Company',
      lastName: 'Rep',
      email: 'company@test.com',
      password: 'password123',
      role: 'company',
      isActive: true
    });

    company = await Company.create({
      name: 'Test Company',
      description: 'Test company description',
      industry: 'Technology',
      address: 'Test Address',
      contactPerson: {
        name: 'John Doe',
        email: 'contact@testcompany.com',
        phone: '+1234567890',
        position: 'HR Manager'
      },
      verificationStatus: 'verified',
      isActive: true
    });

    internship = await Internship.create({
      companyId: company._id,
      title: 'Test Internship',
      description: 'Test internship description',
      duration: 12,
      slots: 5,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
      status: 'published',
      createdBy: companyUser._id
    });

    application = await InternshipApplication.create({
      internshipId: internship._id,
      studentId: studentUser._id,
      coverLetter: 'Test cover letter',
      resume: 'test-resume.pdf',
      studentInfo: {
        currentYear: 3,
        program: 'Computer Science',
        gpa: 3.5,
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test processApplicationSubmission
  try {
    console.log('Testing processApplicationSubmission...');
      const result = await InternshipWorkflowService.processApplicationSubmission(application._id);

      expect(result).toHaveProperty('applicationId', application._id.toString());
      expect(result).toHaveProperty('currentStatus', 'submitted');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('notifications');
      expect(result.nextSteps).toHaveLength(1);
      expect(result.nextSteps[0].step).toBe('company_review');
      expect(result.notifications).toContain('Student confirmation sent');
      expect(result.notifications).toContain('Company notification sent');

      // Verify notifications were sent
      expect(NotificationService.sendNotification).toHaveBeenCalledTimes(2);
    });

    test('should throw error for non-existent application', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        InternshipWorkflowService.processApplicationSubmission(fakeId)
      ).rejects.toThrow('Application not found');
    });
  });

  describe('manageApplicationReview', () => {
    test('should start review process', async () => {
      const result = await InternshipWorkflowService.manageApplicationReview(
        application._id,
        'start_review',
        { reviewerId: companyUser._id }
      );

      expect(result.action).toBe('start_review');
      expect(result.newStatus).toBe('under_review');
      expect(result.notifications).toContain('Student notified of review start');

      // Verify application updated
      const updatedApp = await InternshipApplication.findById(application._id);
      expect(updatedApp.status).toBe('under_review');
      expect(updatedApp.reviewedAt).toBeDefined();
      expect(updatedApp.reviewedBy.toString()).toBe(companyUser._id.toString());
    });

    test('should shortlist candidate', async () => {
      const result = await InternshipWorkflowService.manageApplicationReview(
        application._id,
        'shortlist',
        { notes: 'Strong candidate' }
      );

      expect(result.newStatus).toBe('shortlisted');
      expect(result.notifications).toContain('Student notified of shortlisting');

      const updatedApp = await InternshipApplication.findById(application._id);
      expect(updatedApp.status).toBe('shortlisted');
      expect(updatedApp.reviewNotes).toBe('Strong candidate');
    });

    test('should schedule interview', async () => {
      const interviewDetails = {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '14:00',
        type: 'video_call',
        meetingLink: 'https://zoom.us/j/123456789'
      };

      const result = await InternshipWorkflowService.manageApplicationReview(
        application._id,
        'schedule_interview',
        { interviewDetails }
      );

      expect(result.newStatus).toBe('interview_scheduled');
      expect(result.notifications).toContain('Interview notification sent');

      const updatedApp = await InternshipApplication.findById(application._id);
      expect(updatedApp.status).toBe('interview_scheduled');
      expect(updatedApp.interviewSchedule.type).toBe('video_call');
    });

    test('should accept application', async () => {
      const result = await InternshipWorkflowService.manageApplicationReview(
        application._id,
        'accept',
        { feedback: 'Excellent candidate' }
      );

      expect(result.newStatus).toBe('accepted');
      expect(result.notifications).toContain('Acceptance notification and preparation workflow started');

      const updatedApp = await InternshipApplication.findById(application._id);
      expect(updatedApp.status).toBe('accepted');
      expect(updatedApp.feedback).toBe('Excellent candidate');
      expect(updatedApp.finalDecisionAt).toBeDefined();
    });

    test('should reject application', async () => {
      const result = await InternshipWorkflowService.manageApplicationReview(
        application._id,
        'reject',
        { feedback: 'Not selected' }
      );

      expect(result.newStatus).toBe('rejected');
      expect(result.notifications).toContain('Rejection notification sent');

      const updatedApp = await InternshipApplication.findById(application._id);
      expect(updatedApp.status).toBe('rejected');
      expect(updatedApp.feedback).toBe('Not selected');
    });

    test('should throw error for invalid action', async () => {
      await expect(
        InternshipWorkflowService.manageApplicationReview(
          application._id,
          'invalid_action',
          {}
        )
      ).rejects.toThrow('Unknown review action: invalid_action');
    });
  });

  describe('trackInternshipProgress', () => {
    beforeEach(async () => {
      // Set application to accepted status
      await InternshipApplication.findByIdAndUpdate(application._id, {
        status: 'accepted',
        internshipStatus: 'in_progress'
      });
    });

    test('should track progress successfully', async () => {
      const progressData = {
        milestone: 'Orientation Completed',
        description: 'Successfully completed orientation',
        completionPercentage: 25,
        supervisorNotes: 'Good start',
        studentReflection: 'Learning a lot'
      };

      const result = await InternshipWorkflowService.trackInternshipProgress(
        application._id,
        progressData,
        companyUser._id
      );

      expect(result.applicationId).toBe(application._id.toString());
      expect(result.progressEntry.milestone).toBe('Orientation Completed');
      expect(result.progressEntry.completionPercentage).toBe(25);
      expect(result.milestonesCompleted).toBe(1);

      // Verify progress saved
      const updatedApp = await InternshipApplication.findById(application._id);
      expect(updatedApp.progressTracking).toHaveLength(1);
      expect(updatedApp.lastProgressReport).toBeDefined();
    });

    test('should send milestone notifications', async () => {
      const progressData = {
        milestone: 'Mid-term Review',
        completionPercentage: 50,
        supervisorNotes: 'Excellent progress'
      };

      await InternshipWorkflowService.trackInternshipProgress(
        application._id,
        progressData,
        companyUser._id
      );

      // Should send 50% milestone notification
      expect(NotificationService.sendNotification).toHaveBeenCalledWith(
        studentUser._id,
        expect.objectContaining({
          title: 'Internship Milestone: 50% Progress Milestone'
        })
      );
    });

    test('should handle completion milestone', async () => {
      const progressData = {
        milestone: 'Final Evaluation',
        completionPercentage: 100,
        supervisorNotes: 'Successfully completed internship'
      };

      await InternshipWorkflowService.trackInternshipProgress(
        application._id,
        progressData,
        companyUser._id
      );

      // Should send completion notification
      expect(NotificationService.sendNotification).toHaveBeenCalledWith(
        studentUser._id,
        expect.objectContaining({
          title: 'Internship Milestone: Internship Completion'
        })
      );
    });
  });

  describe('getInternshipMilestones', () => {
    test('should return correct milestones for 4-week internship', () => {
      const milestones = InternshipWorkflowService.getInternshipMilestones(4);
      
      expect(milestones).toHaveLength(3);
      expect(milestones[0].title).toBe('Orientation and Setup');
      expect(milestones[1].title).toBe('Initial Training');
      expect(milestones[2].title).toBe('First Month Review');
    });

    test('should return correct milestones for 12-week internship', () => {
      const milestones = InternshipWorkflowService.getInternshipMilestones(12);
      
      expect(milestones).toHaveLength(5);
      expect(milestones[0].title).toBe('Orientation and Setup');
      expect(milestones[2].title).toBe('First Month Review');
      expect(milestones[3].title).toBe('Mid-term Evaluation');
      expect(milestones[4].title).toBe('Project Completion');
    });

    test('should always include final evaluation', () => {
      const shortMilestones = InternshipWorkflowService.getInternshipMilestones(2);
      const longMilestones = InternshipWorkflowService.getInternshipMilestones(24);
      
      expect(shortMilestones[shortMilestones.length - 1].title).toBe('Final Evaluation');
      expect(longMilestones[longMilestones.length - 1].title).toBe('Final Evaluation');
    });
  });

  describe('getApplicationWorkflowStatus', () => {
    test('should return complete workflow status', async () => {
      // Update application with some progress
      await InternshipApplication.findByIdAndUpdate(application._id, {
        status: 'under_review',
        reviewedAt: new Date(),
        reviewedBy: companyUser._id
      });

      const status = await InternshipWorkflowService.getApplicationWorkflowStatus(application._id);

      expect(status.applicationId).toBe(application._id.toString());
      expect(status.currentStatus).toBe('under_review');
      expect(status.progress).toBe(40);
      expect(status.timeline).toHaveLength(2); // submitted + under_review
      expect(status.nextSteps).toHaveLength(1);
      expect(status.nextSteps[0].title).toBe('Review in Progress');
    });

    test('should handle accepted status', async () => {
      await InternshipApplication.findByIdAndUpdate(application._id, {
        status: 'accepted',
        finalDecisionAt: new Date()
      });

      const status = await InternshipWorkflowService.getApplicationWorkflowStatus(application._id);

      expect(status.progress).toBe(100);
      expect(status.nextSteps[0].title).toBe('Prepare for Internship');
    });
  });

  describe('buildApplicationTimeline', () => {
    test('should build timeline for submitted application', () => {
      const timeline = InternshipWorkflowService.buildApplicationTimeline(application);

      expect(timeline).toHaveLength(1);
      expect(timeline[0].status).toBe('submitted');
      expect(timeline[0].title).toBe('Application Submitted');
      expect(timeline[0].completed).toBe(true);
    });

    test('should build complete timeline for accepted application', async () => {
      // Update application with full timeline
      application.reviewedAt = new Date();
      application.interviewScheduledAt = new Date();
      application.interviewCompletedAt = new Date();
      application.finalDecisionAt = new Date();
      application.status = 'accepted';

      const timeline = InternshipWorkflowService.buildApplicationTimeline(application);

      expect(timeline).toHaveLength(5);
      expect(timeline[0].status).toBe('submitted');
      expect(timeline[1].status).toBe('under_review');
      expect(timeline[2].status).toBe('interview_scheduled');
      expect(timeline[3].status).toBe('interview_completed');
      expect(timeline[4].status).toBe('accepted');
    });
  });

  describe('calculateApplicationProgress', () => {
    test('should calculate correct progress for each status', () => {
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'submitted' })).toBe(20);
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'under_review' })).toBe(40);
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'shortlisted' })).toBe(60);
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'interview_scheduled' })).toBe(70);
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'accepted' })).toBe(100);
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'rejected' })).toBe(100);
    });

    test('should return 0 for unknown status', () => {
      expect(InternshipWorkflowService.calculateApplicationProgress({ status: 'unknown' })).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing application in processApplicationSubmission', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        InternshipWorkflowService.processApplicationSubmission(fakeId)
      ).rejects.toThrow('Failed to process application submission: Application not found');
    });

    test('should handle missing application in manageApplicationReview', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        InternshipWorkflowService.manageApplicationReview(fakeId, 'start_review', {})
      ).rejects.toThrow('Failed to manage application review: Application not found');
    });

    test('should handle missing application in trackInternshipProgress', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        InternshipWorkflowService.trackInternshipProgress(fakeId, {}, companyUser._id)
      ).rejects.toThrow('Failed to track progress: Application not found');
    });
  });
});

// Helper function to run tests
if (require.main === module) {
  const { execSync } = require('child_process');
  
  try {
    console.log('Running Internship Workflow Unit Tests...');
    execSync('npm test -- --testPathPattern=test-internship-workflow-unit.js', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
  } catch (error) {
    console.error('Tests failed:', error.message);
    process.exit(1);
  }
}