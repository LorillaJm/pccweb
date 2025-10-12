const mongoose = require('mongoose');
const InternshipService = require('./services/InternshipService');
const CompanyService = require('./services/CompanyService');
const CandidateMatchingService = require('./services/CandidateMatchingService');
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const User = require('./models/User');

// Mock NotificationService to avoid external dependencies
jest.mock('./services/NotificationService', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
  broadcastNotification: jest.fn().mockResolvedValue({ success: true })
}));

describe('InternshipService Unit Tests', () => {
  let testCompany;
  let testUser;
  let testStudent;
  let testInternship;
  let testApplication;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test_unit';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await Promise.all([
      Company.deleteMany({}),
      Internship.deleteMany({}),
      InternshipApplication.deleteMany({}),
      User.deleteMany({})
    ]);

    // Create test data
    testUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      password: 'hashedpassword',
      role: 'company',
      isActive: true
    });

    testStudent = await User.create({
      firstName: 'Jane',
      lastName: 'Student',
      email: 'jane.student@test.com',
      password: 'hashedpassword',
      role: 'student',
      program: 'Computer Science',
      yearLevel: 3,
      gpa: 3.5,
      skills: ['JavaScript', 'React', 'Node.js'],
      isActive: true
    });

    testCompany = await Company.create({
      name: 'Tech Innovations Inc',
      description: 'Leading technology company',
      industry: 'Technology',
      website: 'https://techinnovations.com',
      address: '123 Innovation Drive, Tech City',
      contactPerson: {
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        position: 'HR Manager'
      },
      verificationStatus: 'verified',
      partnershipLevel: 'gold',
      isActive: true
    });

    testInternship = await Internship.create({
      companyId: testCompany._id,
      title: 'Full Stack Development Intern',
      description: 'Work on cutting-edge web applications using modern technologies',
      requirements: ['Programming knowledge', 'Problem-solving skills', 'Team collaboration'],
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      duration: 12,
      stipend: 20000,
      currency: 'PHP',
      location: 'Makati City, Philippines',
      workArrangement: 'hybrid',
      slots: 5,
      filledSlots: 0,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
      status: 'published',
      targetPrograms: ['Computer Science', 'Information Technology', 'Software Engineering'],
      yearLevelRequirement: 3,
      gpaRequirement: 3.0,
      createdBy: testUser._id
    });

    testApplication = await InternshipApplication.create({
      internshipId: testInternship._id,
      studentId: testStudent._id,
      coverLetter: 'I am very interested in this internship opportunity and believe my skills align well with your requirements.',
      resume: '/uploads/resumes/jane_student_resume.pdf',
      status: 'submitted',
      studentInfo: {
        currentYear: testStudent.yearLevel,
        program: testStudent.program,
        gpa: testStudent.gpa,
        expectedGraduation: new Date('2025-05-15'),
        skills: testStudent.skills,
        previousExperience: 'Built several web applications during coursework and personal projects'
      }
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('createInternship', () => {
    test('should create internship successfully with all required fields', async () => {
      const internshipData = {
        companyId: testCompany._id,
        title: 'Data Science Intern',
        description: 'Work with our data science team on machine learning projects',
        requirements: ['Python programming', 'Statistics knowledge', 'Data analysis skills'],
        skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
        duration: 16,
        stipend: 25000,
        location: 'Quezon City, Philippines',
        workArrangement: 'onsite',
        slots: 3,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 152 * 24 * 60 * 60 * 1000),
        targetPrograms: ['Computer Science', 'Mathematics', 'Statistics'],
        yearLevelRequirement: 3,
        gpaRequirement: 3.2
      };

      const result = await InternshipService.createInternship(internshipData, testUser._id);

      expect(result).toBeDefined();
      expect(result.title).toBe('Data Science Intern');
      expect(result.companyId.name).toBe(testCompany.name);
      expect(result.createdBy.toString()).toBe(testUser._id.toString());
      expect(result.status).toBe('draft');

      // Verify company metrics updated
      const updatedCompany = await Company.findById(testCompany._id);
      expect(updatedCompany.totalInternships).toBe(1);
    });

    test('should fail when company is not verified', async () => {
      const unverifiedCompany = await Company.create({
        name: 'Unverified Startup',
        description: 'New startup company',
        industry: 'Technology',
        address: '456 Startup Ave',
        contactPerson: {
          name: 'Startup Owner',
          email: 'owner@startup.com',
          phone: '+1987654321',
          position: 'CEO'
        },
        verificationStatus: 'pending'
      });

      const internshipData = {
        companyId: unverifiedCompany._id,
        title: 'Should Fail Internship',
        description: 'This should fail',
        duration: 8,
        location: 'Manila',
        slots: 1,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.createInternship(internshipData, testUser._id)
      ).rejects.toThrow('Company must be verified to post internships');
    });

    test('should fail when company is inactive', async () => {
      testCompany.isActive = false;
      await testCompany.save();

      const internshipData = {
        companyId: testCompany._id,
        title: 'Inactive Company Internship',
        description: 'Should fail due to inactive company',
        duration: 8,
        location: 'Manila',
        slots: 1,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.createInternship(internshipData, testUser._id)
      ).rejects.toThrow('Company account is inactive');
    });

    test('should fail when company does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const internshipData = {
        companyId: nonExistentId,
        title: 'Non-existent Company Internship',
        description: 'Should fail',
        duration: 8,
        location: 'Manila',
        slots: 1,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000)
      };

      await expect(
        InternshipService.createInternship(internshipData, testUser._id)
      ).rejects.toThrow('Company not found');
    });
  });

  describe('getInternships', () => {
    beforeEach(async () => {
      // Create additional test internships
      await Internship.create({
        companyId: testCompany._id,
        title: 'Marketing Intern',
        description: 'Digital marketing internship',
        duration: 8,
        stipend: 15000,
        location: 'Cebu City, Philippines',
        workArrangement: 'remote',
        slots: 2,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000),
        status: 'published',
        targetPrograms: ['Business Administration', 'Marketing'],
        createdBy: testUser._id
      });
    });

    test('should get published internships with default pagination', async () => {
      const result = await InternshipService.getInternships();

      expect(result).toBeDefined();
      expect(result.internships).toBeInstanceOf(Array);
      expect(result.internships.length).toBeGreaterThan(0);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBeGreaterThan(0);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    test('should filter internships by work arrangement', async () => {
      const result = await InternshipService.getInternships(
        { workArrangement: 'hybrid' },
        { page: 1, limit: 5 }
      );

      expect(result.internships).toBeDefined();
      expect(result.internships.length).toBeGreaterThan(0);
      result.internships.forEach(internship => {
        expect(internship.workArrangement).toBe('hybrid');
      });
    });

    test('should filter internships by target programs', async () => {
      const result = await InternshipService.getInternships(
        { targetPrograms: ['Computer Science'] }
      );

      expect(result.internships).toBeDefined();
      result.internships.forEach(internship => {
        expect(internship.targetPrograms).toContain('Computer Science');
      });
    });

    test('should filter internships by minimum stipend', async () => {
      const result = await InternshipService.getInternships(
        { minStipend: 18000 }
      );

      expect(result.internships).toBeDefined();
      result.internships.forEach(internship => {
        expect(internship.stipend).toBeGreaterThanOrEqual(18000);
      });
    });

    test('should search internships by text', async () => {
      const result = await InternshipService.getInternships(
        {},
        { search: 'Full Stack' }
      );

      expect(result.internships).toBeDefined();
      expect(result.internships.length).toBeGreaterThan(0);
      expect(result.internships[0].title).toContain('Full Stack');
    });

    test('should handle pagination correctly', async () => {
      const result = await InternshipService.getInternships(
        {},
        { page: 1, limit: 1 }
      );

      expect(result.internships).toBeDefined();
      expect(result.internships.length).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.pages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('submitApplication', () => {
    test('should submit application successfully', async () => {
      const newStudent = await User.create({
        firstName: 'Bob',
        lastName: 'Applicant',
        email: 'bob.applicant@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 3,
        gpa: 3.7,
        skills: ['JavaScript', 'Python'],
        isActive: true
      });

      const applicationData = {
        coverLetter: 'I am excited about this opportunity to learn and contribute to your team.',
        resume: '/uploads/resumes/bob_applicant_resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.7,
          expectedGraduation: new Date('2025-05-15'),
          skills: ['JavaScript', 'Python', 'React'],
          previousExperience: 'Completed several coding bootcamps and built personal projects'
        },
        preferences: {
          startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          workArrangement: 'hybrid'
        }
      };

      const result = await InternshipService.submitApplication(
        testInternship._id,
        newStudent._id,
        applicationData
      );

      expect(result).toBeDefined();
      expect(result.internshipId.toString()).toBe(testInternship._id.toString());
      expect(result.studentId.toString()).toBe(newStudent._id.toString());
      expect(result.status).toBe('submitted');
      expect(result.coverLetter).toBe(applicationData.coverLetter);

      // Verify internship application count updated
      const updatedInternship = await Internship.findById(testInternship._id);
      expect(updatedInternship.applicationCount).toBe(1);
    });

    test('should prevent duplicate applications', async () => {
      const applicationData = {
        coverLetter: 'Duplicate application attempt',
        resume: '/uploads/resumes/duplicate_resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5,
          expectedGraduation: new Date('2025-05-15')
        }
      };

      await expect(
        InternshipService.submitApplication(
          testInternship._id,
          testStudent._id,
          applicationData
        )
      ).rejects.toThrow('You have already applied for this internship');
    });

    test('should fail when internship applications are closed', async () => {
      testInternship.status = 'closed';
      await testInternship.save();

      const newStudent = await User.create({
        firstName: 'Late',
        lastName: 'Applicant',
        email: 'late.applicant@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 3,
        isActive: true
      });

      const applicationData = {
        coverLetter: 'Late application',
        resume: '/uploads/resumes/late_resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.0,
          expectedGraduation: new Date('2025-05-15')
        }
      };

      await expect(
        InternshipService.submitApplication(
          testInternship._id,
          newStudent._id,
          applicationData
        )
      ).rejects.toThrow('Applications are closed for this internship');
    });

    test('should fail when internship does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const applicationData = {
        coverLetter: 'Application for non-existent internship',
        resume: '/uploads/resumes/resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.0,
          expectedGraduation: new Date('2025-05-15')
        }
      };

      await expect(
        InternshipService.submitApplication(
          nonExistentId,
          testStudent._id,
          applicationData
        )
      ).rejects.toThrow('Internship not found');
    });

    test('should fail when student does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const applicationData = {
        coverLetter: 'Application from non-existent student',
        resume: '/uploads/resumes/resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.0,
          expectedGraduation: new Date('2025-05-15')
        }
      };

      await expect(
        InternshipService.submitApplication(
          testInternship._id,
          nonExistentId,
          applicationData
        )
      ).rejects.toThrow('Student not found');
    });
  });

  describe('updateApplicationStatus', () => {
    test('should update application status to under_review', async () => {
      const result = await InternshipService.updateApplicationStatus(
        testApplication._id,
        'under_review',
        testUser._id,
        { notes: 'Application shows promise, moving to detailed review' }
      );

      expect(result.status).toBe('under_review');
      expect(result.reviewedBy.toString()).toBe(testUser._id.toString());
      expect(result.reviewedAt).toBeDefined();
    });

    test('should update application status to accepted and update internship metrics', async () => {
      const initialFilledSlots = testInternship.filledSlots;
      const initialAcceptedCount = testInternship.acceptedCount;

      const result = await InternshipService.updateApplicationStatus(
        testApplication._id,
        'accepted',
        testUser._id,
        { notes: 'Excellent candidate, perfect fit for the role' }
      );

      expect(result.status).toBe('accepted');
      expect(result.internshipStatus).toBe('not_started');

      // Verify internship metrics updated
      const updatedInternship = await Internship.findById(testInternship._id);
      expect(updatedInternship.filledSlots).toBe(initialFilledSlots + 1);
      expect(updatedInternship.acceptedCount).toBe(initialAcceptedCount + 1);
    });

    test('should schedule interview when updating to interview_scheduled', async () => {
      const interviewDetails = {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '14:00',
        duration: 60,
        location: 'Company Conference Room A',
        type: 'in_person',
        meetingLink: null,
        interviewerName: 'John Doe',
        interviewerEmail: 'john.doe@company.com',
        notes: 'Please bring a copy of your portfolio'
      };

      // First update to shortlisted
      await InternshipService.updateApplicationStatus(
        testApplication._id,
        'shortlisted',
        testUser._id
      );

      const result = await InternshipService.updateApplicationStatus(
        testApplication._id,
        'interview_scheduled',
        testUser._id,
        { interviewDetails }
      );

      expect(result.status).toBe('interview_scheduled');
      expect(result.interviewSchedule).toBeDefined();
      expect(result.interviewSchedule.type).toBe('in_person');
      expect(result.interviewSchedule.interviewerName).toBe('John Doe');
    });

    test('should fail with invalid status transition', async () => {
      await expect(
        InternshipService.updateApplicationStatus(
          testApplication._id,
          'accepted',
          testUser._id
        )
      ).rejects.toThrow();
    });

    test('should fail when application does not exist', async () => {
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

  describe('trackProgress', () => {
    beforeEach(async () => {
      // Set application to accepted status for progress tracking
      testApplication.status = 'accepted';
      testApplication.internshipStatus = 'in_progress';
      testApplication.startedAt = new Date();
      await testApplication.save();
    });

    test('should track internship progress successfully', async () => {
      const progressData = {
        milestone: 'Week 2 - Environment Setup Complete',
        description: 'Successfully set up development environment, completed onboarding, and started first project tasks',
        completionPercentage: 20,
        supervisorNotes: 'Student is adapting well to the team and showing good initiative',
        studentReflection: 'Learning a lot about professional development practices and team collaboration'
      };

      const result = await InternshipService.trackProgress(
        testApplication._id,
        progressData,
        testUser._id
      );

      expect(result.progressTracking).toBeDefined();
      expect(result.progressTracking.length).toBe(1);
      expect(result.progressTracking[0].milestone).toBe(progressData.milestone);
      expect(result.progressTracking[0].completionPercentage).toBe(20);
      expect(result.progressTracking[0].updatedBy.toString()).toBe(testUser._id.toString());
      expect(result.lastProgressReport).toBeDefined();
    });

    test('should add multiple progress entries', async () => {
      const progressData1 = {
        milestone: 'Week 1 - Orientation Complete',
        description: 'Completed company orientation and team introductions',
        completionPercentage: 10,
        supervisorNotes: 'Good start'
      };

      const progressData2 = {
        milestone: 'Week 3 - First Task Complete',
        description: 'Successfully completed first assigned development task',
        completionPercentage: 30,
        supervisorNotes: 'Excellent work quality'
      };

      await InternshipService.trackProgress(testApplication._id, progressData1, testUser._id);
      const result = await InternshipService.trackProgress(testApplication._id, progressData2, testUser._id);

      expect(result.progressTracking.length).toBe(2);
      expect(result.progressTracking[1].completionPercentage).toBe(30);
    });

    test('should fail when application is not accepted', async () => {
      testApplication.status = 'submitted';
      await testApplication.save();

      const progressData = {
        milestone: 'Should fail',
        description: 'This should fail',
        completionPercentage: 50
      };

      await expect(
        InternshipService.trackProgress(
          testApplication._id,
          progressData,
          testUser._id
        )
      ).rejects.toThrow('Application not found');
    });

    test('should fail when application does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const progressData = {
        milestone: 'Non-existent application',
        description: 'Should fail',
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

  describe('submitEvaluation', () => {
    beforeEach(async () => {
      testApplication.status = 'accepted';
      testApplication.internshipStatus = 'in_progress';
      await testApplication.save();
    });

    test('should submit evaluation successfully', async () => {
      const evaluationData = {
        evaluatorType: 'company',
        period: 'midterm',
        ratings: {
          technicalSkills: 4,
          communication: 5,
          teamwork: 4,
          initiative: 4,
          reliability: 5,
          overallPerformance: 4
        },
        comments: 'Student is performing exceptionally well. Shows great potential and learning ability.',
        recommendations: 'Continue with current approach. Consider assigning more challenging tasks.'
      };

      const result = await InternshipService.submitEvaluation(
        testApplication._id,
        evaluationData,
        testUser._id
      );

      expect(result.evaluations).toBeDefined();
      expect(result.evaluations.length).toBe(1);
      expect(result.evaluations[0].evaluatorId.toString()).toBe(testUser._id.toString());
      expect(result.evaluations[0].evaluatorType).toBe('company');
      expect(result.evaluations[0].overallRating).toBeCloseTo(4.3, 1);
      expect(result.evaluations[0].comments).toBe(evaluationData.comments);
    });

    test('should submit multiple evaluations', async () => {
      const midtermEvaluation = {
        evaluatorType: 'company',
        period: 'midterm',
        ratings: {
          technicalSkills: 3,
          communication: 4,
          teamwork: 4,
          initiative: 3,
          reliability: 4,
          overallPerformance: 4
        },
        comments: 'Good progress at midterm'
      };

      const finalEvaluation = {
        evaluatorType: 'company',
        period: 'final',
        ratings: {
          technicalSkills: 4,
          communication: 5,
          teamwork: 5,
          initiative: 4,
          reliability: 5,
          overallPerformance: 5
        },
        comments: 'Excellent improvement and final performance'
      };

      await InternshipService.submitEvaluation(testApplication._id, midtermEvaluation, testUser._id);
      const result = await InternshipService.submitEvaluation(testApplication._id, finalEvaluation, testUser._id);

      expect(result.evaluations.length).toBe(2);
      expect(result.evaluations[1].period).toBe('final');
      expect(result.evaluations[1].overallRating).toBeCloseTo(4.7, 1);
    });

    test('should fail when application does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const evaluationData = {
        evaluatorType: 'company',
        period: 'final',
        ratings: {
          technicalSkills: 4,
          communication: 4,
          teamwork: 4,
          initiative: 4,
          reliability: 4,
          overallPerformance: 4
        }
      };

      await expect(
        InternshipService.submitEvaluation(
          nonExistentId,
          evaluationData,
          testUser._id
        )
      ).rejects.toThrow('Application not found');
    });
  });

  describe('completeInternship', () => {
    beforeEach(async () => {
      testApplication.status = 'accepted';
      testApplication.internshipStatus = 'in_progress';
      testApplication.startedAt = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      await testApplication.save();
    });

    test('should complete internship successfully', async () => {
      const completionData = {
        finalRating: 4.5
      };

      const result = await InternshipService.completeInternship(
        testApplication._id,
        completionData
      );

      expect(result.internshipStatus).toBe('completed');
      expect(result.completedAt).toBeDefined();
      expect(result.finalRating).toBe(4.5);

      // Verify company metrics updated
      const updatedCompany = await Company.findById(testCompany._id);
      expect(updatedCompany.completedInternships).toBe(1);
    });

    test('should complete internship without final rating', async () => {
      const result = await InternshipService.completeInternship(testApplication._id, {});

      expect(result.internshipStatus).toBe('completed');
      expect(result.completedAt).toBeDefined();
      expect(result.finalRating).toBeUndefined();
    });

    test('should fail when application does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        InternshipService.completeInternship(nonExistentId, {})
      ).rejects.toThrow('Application not found');
    });
  });

  describe('getCandidateRecommendations', () => {
    beforeEach(async () => {
      // Create additional students for matching
      await User.create({
        firstName: 'Alice',
        lastName: 'Developer',
        email: 'alice.developer@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 4,
        gpa: 3.8,
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        isActive: true
      });

      await User.create({
        firstName: 'Charlie',
        lastName: 'Programmer',
        email: 'charlie.programmer@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Information Technology',
        yearLevel: 3,
        gpa: 3.6,
        skills: ['Java', 'Spring', 'MySQL'],
        isActive: true
      });
    });

    test('should get candidate recommendations for internship', async () => {
      const result = await InternshipService.getCandidateRecommendations(
        testInternship._id,
        { limit: 10 }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that results are sorted by match score
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].matchScore.total).toBeGreaterThanOrEqual(result[i].matchScore.total);
      }

      // Verify structure of recommendation
      const firstRecommendation = result[0];
      expect(firstRecommendation.student).toBeDefined();
      expect(firstRecommendation.matchScore).toBeDefined();
      expect(firstRecommendation.matchReasons).toBeDefined();
      expect(typeof firstRecommendation.matchScore.total).toBe('number');
    });

    test('should handle internship with no eligible candidates', async () => {
      // Create internship with very specific requirements
      const restrictiveInternship = await Internship.create({
        companyId: testCompany._id,
        title: 'Senior AI Research Intern',
        description: 'Advanced AI research position',
        duration: 6,
        location: 'Manila',
        slots: 1,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 77 * 24 * 60 * 60 * 1000),
        status: 'published',
        targetPrograms: ['PhD Computer Science'], // Very specific program
        yearLevelRequirement: 5, // Graduate level
        gpaRequirement: 3.9,
        createdBy: testUser._id
      });

      const result = await InternshipService.getCandidateRecommendations(restrictiveInternship._id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should return empty array or very few candidates
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getInternshipRecommendations', () => {
    beforeEach(async () => {
      // Create additional internships for recommendations
      await Internship.create({
        companyId: testCompany._id,
        title: 'Frontend Developer Intern',
        description: 'Focus on React and modern frontend technologies',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        duration: 10,
        stipend: 18000,
        location: 'Manila, Philippines',
        workArrangement: 'remote',
        slots: 3,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000),
        status: 'published',
        targetPrograms: ['Computer Science', 'Information Technology'],
        yearLevelRequirement: 2,
        createdBy: testUser._id
      });
    });

    test('should get internship recommendations for student', async () => {
      const preferences = {
        workArrangement: 'hybrid',
        minStipend: 15000,
        limit: 5
      };

      const result = await InternshipService.getInternshipRecommendations(
        testStudent._id,
        preferences
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check that results are sorted by match score
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].matchScore.total).toBeGreaterThanOrEqual(result[i].matchScore.total);
      }

      // Verify structure
      const firstRecommendation = result[0];
      expect(firstRecommendation.title).toBeDefined();
      expect(firstRecommendation.companyId).toBeDefined();
      expect(firstRecommendation.matchScore).toBeDefined();
      expect(firstRecommendation.recommendationReasons).toBeDefined();
    });

    test('should handle student with no matching internships', async () => {
      const unmatchedStudent = await User.create({
        firstName: 'Unmatched',
        lastName: 'Student',
        email: 'unmatched@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Fine Arts', // No matching internships
        yearLevel: 1,
        gpa: 2.5,
        isActive: true
      });

      const result = await InternshipService.getInternshipRecommendations(unmatchedStudent._id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should return empty array or very few low-scoring matches
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getApplicationWorkflow', () => {
    test('should get application workflow information', async () => {
      const result = await InternshipService.getApplicationWorkflow(testApplication._id);

      expect(result).toBeDefined();
      expect(result.application).toBeDefined();
      expect(result.workflow).toBeDefined();
      expect(result.timeline).toBeDefined();

      expect(result.application.id.toString()).toBe(testApplication._id.toString());
      expect(result.application.status).toBe('submitted');
      expect(result.workflow.nextSteps).toBeDefined();
      expect(result.timeline).toBeInstanceOf(Array);
      expect(result.timeline.length).toBeGreaterThan(0);
    });

    test('should fail when application does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        InternshipService.getApplicationWorkflow(nonExistentId)
      ).rejects.toThrow('Application not found');
    });
  });

  describe('bulkUpdateApplicationStatus', () => {
    let additionalApplications;

    beforeEach(async () => {
      // Create additional applications for bulk testing
      const student2 = await User.create({
        firstName: 'Bob',
        lastName: 'Bulk',
        email: 'bob.bulk@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 3,
        isActive: true
      });

      const student3 = await User.create({
        firstName: 'Carol',
        lastName: 'Bulk',
        email: 'carol.bulk@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Information Technology',
        yearLevel: 4,
        isActive: true
      });

      additionalApplications = await InternshipApplication.create([
        {
          internshipId: testInternship._id,
          studentId: student2._id,
          coverLetter: 'Bulk application 1',
          resume: '/uploads/bulk1.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.4,
            expectedGraduation: new Date('2025-05-15')
          }
        },
        {
          internshipId: testInternship._id,
          studentId: student3._id,
          coverLetter: 'Bulk application 2',
          resume: '/uploads/bulk2.pdf',
          studentInfo: {
            currentYear: 4,
            program: 'Information Technology',
            gpa: 3.6,
            expectedGraduation: new Date('2024-12-15')
          }
        }
      ]);
    });

    test('should bulk update application statuses successfully', async () => {
      const applicationIds = [
        testApplication._id,
        additionalApplications[0]._id,
        additionalApplications[1]._id
      ];

      const result = await InternshipService.bulkUpdateApplicationStatus(
        applicationIds,
        'under_review',
        testUser._id,
        { notes: 'Bulk review process initiated' }
      );

      expect(result.successful).toBeDefined();
      expect(result.failed).toBeDefined();
      expect(result.successful.length).toBe(3);
      expect(result.failed.length).toBe(0);

      // Verify all applications were updated
      for (const success of result.successful) {
        expect(success.application.status).toBe('under_review');
      }
    });

    test('should handle partial failures in bulk update', async () => {
      const applicationIds = [
        testApplication._id,
        new mongoose.Types.ObjectId(), // Non-existent application
        additionalApplications[0]._id
      ];

      const result = await InternshipService.bulkUpdateApplicationStatus(
        applicationIds,
        'under_review',
        testUser._id
      );

      expect(result.successful.length).toBe(2);
      expect(result.failed.length).toBe(1);
      expect(result.failed[0].error).toContain('Application not found');
    });
  });

  describe('getAnalytics', () => {
    beforeEach(async () => {
      // Create additional test data for analytics
      const student2 = await User.create({
        firstName: 'Analytics',
        lastName: 'Student',
        email: 'analytics@test.com',
        password: 'hashedpassword',
        role: 'student',
        program: 'Computer Science',
        yearLevel: 3,
        isActive: true
      });

      await InternshipApplication.create([
        {
          internshipId: testInternship._id,
          studentId: student2._id,
          coverLetter: 'Analytics application',
          resume: '/uploads/analytics.pdf',
          status: 'accepted',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.7,
            expectedGraduation: new Date('2025-05-15')
          }
        }
      ]);
    });

    test('should generate comprehensive analytics', async () => {
      const result = await InternshipService.getAnalytics();

      expect(result).toBeDefined();
      expect(result.totals).toBeDefined();
      expect(result.rates).toBeDefined();

      expect(typeof result.totals.internships).toBe('number');
      expect(typeof result.totals.applications).toBe('number');
      expect(typeof result.totals.acceptedApplications).toBe('number');
      expect(typeof result.rates.applicationRate).toBe('number');
      expect(typeof result.rates.acceptanceRate).toBe('number');
      expect(typeof result.rates.completionRate).toBe('number');

      expect(result.totals.internships).toBeGreaterThan(0);
      expect(result.totals.applications).toBeGreaterThan(0);
    });

    test('should filter analytics by company', async () => {
      const result = await InternshipService.getAnalytics({
        companyId: testCompany._id
      });

      expect(result).toBeDefined();
      expect(result.totals.applications).toBeGreaterThan(0);
    });

    test('should filter analytics by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const result = await InternshipService.getAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      expect(result).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('✅ InternshipService unit tests defined successfully');
  console.log('Run with: npm test or jest backend/test-internship-service-unit.js');
}

module.exports = {
  // Export test suite for potential use in other test files
  testSuite: 'InternshipService Unit Tests'
};