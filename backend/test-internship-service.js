const mongoose = require('mongoose');
const InternshipService = require('./services/InternshipService');
const CompanyService = require('./services/CompanyService');
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const User = require('./models/User');

// Mock NotificationService to avoid actual notifications during tests
jest.mock('./services/NotificationService', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
  broadcastNotification: jest.fn().mockResolvedValue({ success: true })
}));

describe('InternshipService', () => {
  let testCompany;
  let testUser;
  let testStudent;
  let testInternship;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean up test data
    await Company.deleteMany({});
    await Internship.deleteMany({});
    await InternshipApplication.deleteMany({});
    await User.deleteMany({});

    // Create test company
    testCompany = new Company({
      name: 'Test Tech Company',
      description: 'A test technology company',
      industry: 'Technology',
      website: 'https://testtech.com',
      address: '123 Test Street, Test City',
      contactPerson: {
        name: 'John Doe',
        email: 'john@testtech.com',
        phone: '+1234567890',
        position: 'HR Manager'
      },
      verificationStatus: 'verified',
      isActive: true
    });
    await testCompany.save();

    // Create test user (company contact)
    testUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@testtech.com',
      password: 'hashedpassword',
      role: 'company',
      isActive: true
    });
    await testUser.save();

    // Create test student
    testStudent = new User({
      firstName: 'Jane',
      lastName: 'Student',
      email: 'jane@student.com',
      password: 'hashedpassword',
      role: 'student',
      program: 'Computer Science',
      yearLevel: 3,
      gpa: 3.5,
      isActive: true
    });
    await testStudent.save();

    // Create test internship
    testInternship = new Internship({
      companyId: testCompany._id,
      title: 'Software Development Intern',
      description: 'Learn software development with our team',
      requirements: ['Programming knowledge', 'Good communication'],
      skills: ['JavaScript', 'React', 'Node.js'],
      duration: 12,
      stipend: 15000,
      location: 'Manila, Philippines',
      workArrangement: 'hybrid',
      slots: 5,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000), // ~4 months from now
      status: 'published',
      targetPrograms: ['Computer Science', 'Information Technology'],
      yearLevelRequirement: 2,
      createdBy: testUser._id
    });
    await testInternship.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('createInternshipPosting', () => {
    test('should create internship posting successfully', async () => {
      const internshipData = {
        title: 'Data Science Intern',
        description: 'Work with our data science team',
        requirements: ['Python knowledge', 'Statistics background'],
        skills: ['Python', 'Pandas', 'NumPy'],
        duration: 16,
        stipend: 20000,
        location: 'Quezon City, Philippines',
        workArrangement: 'onsite',
        slots: 3,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 157 * 24 * 60 * 60 * 1000),
        targetPrograms: ['Computer Science', 'Mathematics'],
        yearLevelRequirement: 3
      };

      const result = await InternshipService.createInternshipPosting(
        testCompany._id,
        internshipData,
        testUser._id
      );

      expect(result.success).toBe(true);
      expect(result.data.title).toBe(internshipData.title);
      expect(result.data.companyId.toString()).toBe(testCompany._id.toString());
      expect(result.data.createdBy.toString()).toBe(testUser._id.toString());

      // Verify company metrics updated
      const updatedCompany = await Company.findById(testCompany._id);
      expect(updatedCompany.totalInternships).toBe(1);
    });

    test('should fail if company is not verified', async () => {
      // Create unverified company
      const unverifiedCompany = new Company({
        name: 'Unverified Company',
        description: 'Test company',
        industry: 'Technology',
        address: '456 Test Ave',
        contactPerson: {
          name: 'Test Contact',
          email: 'test@unverified.com',
          phone: '+1234567890',
          position: 'Manager'
        },
        verificationStatus: 'pending'
      });
      await unverifiedCompany.save();

      const internshipData = {
        title: 'Test Intern',
        description: 'Test internship',
        duration: 8,
        location: 'Test City',
        slots: 1,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 101 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.createInternshipPosting(
          unverifiedCompany._id,
          internshipData,
          testUser._id
        )
      ).rejects.toThrow('Company must be verified to post internships');
    });

    test('should fail if company does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const internshipData = {
        title: 'Test Intern',
        description: 'Test internship',
        duration: 8,
        location: 'Test City',
        slots: 1,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 101 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.createInternshipPosting(
          nonExistentId,
          internshipData,
          testUser._id
        )
      ).rejects.toThrow('Company not found');
    });
  });

  describe('submitApplication', () => {
    test('should submit application successfully', async () => {
      const applicationData = {
        coverLetter: 'I am very interested in this internship opportunity...',
        resume: '/uploads/resumes/jane_resume.pdf',
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        skills: ['JavaScript', 'React', 'Node.js'],
        previousExperience: 'Built several web applications during coursework',
        preferences: {
          startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          workArrangement: 'hybrid'
        }
      };

      const result = await InternshipService.submitApplication(
        testStudent._id,
        testInternship._id,
        applicationData
      );

      expect(result.success).toBe(true);
      expect(result.data.studentId.toString()).toBe(testStudent._id.toString());
      expect(result.data.internshipId.toString()).toBe(testInternship._id.toString());
      expect(result.data.coverLetter).toBe(applicationData.coverLetter);
      expect(result.data.status).toBe('submitted');

      // Verify internship application count updated
      const updatedInternship = await Internship.findById(testInternship._id);
      expect(updatedInternship.applicationCount).toBe(1);
    });

    test('should fail if student already applied', async () => {
      // Create existing application
      const existingApplication = new InternshipApplication({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Previous application',
        resume: '/uploads/resume.pdf',
        studentInfo: {
          currentYear: testStudent.yearLevel,
          program: testStudent.program,
          gpa: testStudent.gpa,
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
      await existingApplication.save();

      const applicationData = {
        coverLetter: 'Second application attempt',
        resume: '/uploads/resume2.pdf',
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.submitApplication(
          testStudent._id,
          testInternship._id,
          applicationData
        )
      ).rejects.toThrow('You have already applied for this internship');
    });

    test('should fail if internship applications are closed', async () => {
      // Update internship to closed status
      testInternship.status = 'closed';
      await testInternship.save();

      const applicationData = {
        coverLetter: 'Application for closed internship',
        resume: '/uploads/resume.pdf',
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.submitApplication(
          testStudent._id,
          testInternship._id,
          applicationData
        )
      ).rejects.toThrow('Applications are closed for this internship');
    });

    test('should fail if student program is not eligible', async () => {
      // Create student with ineligible program
      const ineligibleStudent = new User({
        firstName: 'Bob',
        lastName: 'Ineligible',
        email: 'bob@student.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Fine Arts', // Not in targetPrograms
        yearLevel: 3,
        gpa: 3.0,
        isActive: true
      });
      await ineligibleStudent.save();

      const applicationData = {
        coverLetter: 'Application from ineligible program',
        resume: '/uploads/resume.pdf',
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.submitApplication(
          ineligibleStudent._id,
          testInternship._id,
          applicationData
        )
      ).rejects.toThrow('Your program is not eligible for this internship');
    });

    test('should fail if student year level is too low', async () => {
      // Create student with low year level
      const lowYearStudent = new User({
        firstName: 'Alice',
        lastName: 'Freshman',
        email: 'alice@student.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 1, // Below requirement of 2
        gpa: 3.8,
        isActive: true
      });
      await lowYearStudent.save();

      const applicationData = {
        coverLetter: 'Application from freshman',
        resume: '/uploads/resume.pdf',
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.submitApplication(
          lowYearStudent._id,
          testInternship._id,
          applicationData
        )
      ).rejects.toThrow('This internship requires year level 2 or higher');
    });
  });

  describe('trackProgress', () => {
    let testApplication;

    beforeEach(async () => {
      // Create accepted application for progress tracking
      testApplication = new InternshipApplication({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Test application',
        resume: '/uploads/resume.pdf',
        status: 'accepted',
        studentInfo: {
          currentYear: testStudent.yearLevel,
          program: testStudent.program,
          gpa: testStudent.gpa,
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
      await testApplication.save();
    });

    test('should track progress successfully', async () => {
      const progressData = {
        milestone: 'Week 4 - Project Setup Complete',
        description: 'Successfully set up development environment and completed initial project setup',
        completionPercentage: 25,
        supervisorNotes: 'Good progress, on track',
        studentReflection: 'Learning a lot about the development process'
      };

      const result = await InternshipService.trackProgress(
        testApplication._id,
        progressData,
        testUser._id
      );

      expect(result.success).toBe(true);
      expect(result.data.progressUpdate.milestone).toBe(progressData.milestone);
      expect(result.data.progressUpdate.completionPercentage).toBe(25);
    });

    test('should fail if application is not accepted', async () => {
      // Update application to submitted status
      testApplication.status = 'submitted';
      await testApplication.save();

      const progressData = {
        milestone: 'Test milestone',
        description: 'Test description',
        completionPercentage: 50
      };

      await expect(
        InternshipService.trackProgress(
          testApplication._id,
          progressData,
          testUser._id
        )
      ).rejects.toThrow('Can only track progress for accepted applications');
    });

    test('should fail if application does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const progressData = {
        milestone: 'Test milestone',
        description: 'Test description',
        completionPercentage: 50
      };

      await expect(
        InternshipService.trackProgress(
          nonExistentId,
          progressData,
          testUser._id
        )
      ).rejects.toThrow('Application not found');
    });
  });

  describe('getInternshipOpportunities', () => {
    beforeEach(async () => {
      // Create additional test internships
      const internship2 = new Internship({
        companyId: testCompany._id,
        title: 'Marketing Intern',
        description: 'Marketing internship opportunity',
        duration: 8,
        stipend: 12000,
        location: 'Cebu City, Philippines',
        workArrangement: 'onsite',
        slots: 2,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 96 * 24 * 60 * 60 * 1000),
        status: 'published',
        targetPrograms: ['Business Administration', 'Marketing'],
        createdBy: testUser._id
      });
      await internship2.save();
    });

    test('should get internship opportunities with default filters', async () => {
      const result = await InternshipService.getInternshipOpportunities();

      expect(result.success).toBe(true);
      expect(result.data.internships).toHaveLength(2);
      expect(result.data.pagination.total).toBe(2);
    });

    test('should filter by search term', async () => {
      const result = await InternshipService.getInternshipOpportunities({
        search: 'Software'
      });

      expect(result.success).toBe(true);
      expect(result.data.internships).toHaveLength(1);
      expect(result.data.internships[0].title).toContain('Software');
    });

    test('should filter by work arrangement', async () => {
      const result = await InternshipService.getInternshipOpportunities({
        workArrangement: 'onsite'
      });

      expect(result.success).toBe(true);
      expect(result.data.internships).toHaveLength(1);
      expect(result.data.internships[0].workArrangement).toBe('onsite');
    });

    test('should filter by stipend range', async () => {
      const result = await InternshipService.getInternshipOpportunities({
        minStipend: 15000
      });

      expect(result.success).toBe(true);
      expect(result.data.internships).toHaveLength(1);
      expect(result.data.internships[0].stipend).toBeGreaterThanOrEqual(15000);
    });
  });

  describe('updateApplicationStatus', () => {
    let testApplication;

    beforeEach(async () => {
      testApplication = new InternshipApplication({
        internshipId: testInternship._id,
        studentId: testStudent._id,
        coverLetter: 'Test application',
        resume: '/uploads/resume.pdf',
        status: 'submitted',
        studentInfo: {
          currentYear: testStudent.yearLevel,
          program: testStudent.program,
          gpa: testStudent.gpa,
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
      await testApplication.save();
    });

    test('should update application status to under_review', async () => {
      const result = await InternshipService.updateApplicationStatus(
        testApplication._id,
        'under_review',
        testUser._id,
        { notes: 'Application looks promising' }
      );

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('under_review');
      expect(result.data.reviewedBy.toString()).toBe(testUser._id.toString());
    });

    test('should update application status to accepted and increment internship slots', async () => {
      const initialFilledSlots = testInternship.filledSlots;

      const result = await InternshipService.updateApplicationStatus(
        testApplication._id,
        'accepted',
        testUser._id,
        { notes: 'Excellent candidate' }
      );

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('accepted');

      // Verify internship filled slots incremented
      const updatedInternship = await Internship.findById(testInternship._id);
      expect(updatedInternship.filledSlots).toBe(initialFilledSlots + 1);
      expect(updatedInternship.acceptedCount).toBe(1);
    });

    test('should schedule interview when status is interview_scheduled', async () => {
      const interviewDetails = {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '14:00',
        location: 'Company Office',
        type: 'in_person',
        interviewerName: 'John Doe',
        interviewerEmail: 'john@testtech.com'
      };

      const result = await InternshipService.updateApplicationStatus(
        testApplication._id,
        'interview_scheduled',
        testUser._id,
        { interviewDetails }
      );

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('interview_scheduled');
      expect(result.data.interviewSchedule.type).toBe('in_person');
    });

    test('should fail if application does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        InternshipService.updateApplicationStatus(
          nonExistentId,
          'under_review',
          testUser._id
        )
      ).rejects.toThrow('Application not found');
    });
  });

  describe('generateAnalytics', () => {
    beforeEach(async () => {
      // Create test applications with different statuses
      const applications = [
        {
          internshipId: testInternship._id,
          studentId: testStudent._id,
          coverLetter: 'Application 1',
          resume: '/uploads/resume1.pdf',
          status: 'submitted',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.5,
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        },
        {
          internshipId: testInternship._id,
          studentId: new mongoose.Types.ObjectId(),
          coverLetter: 'Application 2',
          resume: '/uploads/resume2.pdf',
          status: 'accepted',
          studentInfo: {
            currentYear: 4,
            program: 'Information Technology',
            gpa: 3.8,
            expectedGraduation: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          }
        }
      ];

      await InternshipApplication.insertMany(applications);
    });

    test('should generate comprehensive analytics', async () => {
      const result = await InternshipService.generateAnalytics();

      expect(result.success).toBe(true);
      expect(result.data.overview.totalInternships).toBeGreaterThan(0);
      expect(result.data.overview.totalApplications).toBe(2);
      expect(result.data.overview.acceptedApplications).toBe(1);
      expect(result.data.overview.placementRate).toBe('50.00');
      expect(result.data.applicationsByStatus).toHaveProperty('submitted');
      expect(result.data.applicationsByStatus).toHaveProperty('accepted');
    });

    test('should filter analytics by company', async () => {
      const result = await InternshipService.generateAnalytics({
        companyId: testCompany._id
      });

      expect(result.success).toBe(true);
      expect(result.data.overview.totalApplications).toBe(2);
    });

    test('should filter analytics by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const result = await InternshipService.generateAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      expect(result.success).toBe(true);
      expect(result.data.overview.totalApplications).toBe(2);
    });
  });
});

console.log('✅ InternshipService tests completed successfully');