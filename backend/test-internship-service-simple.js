const mongoose = require('mongoose');
const InternshipService = require('./services/InternshipService');
const CompanyService = require('./services/CompanyService');
const CandidateMatchingService = require('./services/CandidateMatchingService');
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const User = require('./models/User');

// Simple test framework
class SimpleTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  describe(description, testFn) {
    console.log(`\n📋 ${description}`);
    testFn();
  }

  test(description, testFn) {
    this.tests.push({ description, testFn });
  }

  async run() {
    console.log('🚀 Starting Internship Service Tests...\n');
    
    for (const { description, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${description}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${description}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, got ${actual}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error('Expected value to be defined');
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toBeInstanceOf: (expected) => {
        if (!(actual instanceof expected)) {
          throw new Error(`Expected ${actual} to be instance of ${expected.name}`);
        }
      },
      rejects: {
        toThrow: async (expectedMessage) => {
          try {
            await actual;
            throw new Error('Expected function to throw');
          } catch (error) {
            if (expectedMessage && !error.message.includes(expectedMessage)) {
              throw new Error(`Expected error message to contain "${expectedMessage}", got "${error.message}"`);
            }
          }
        }
      }
    };
  }
}

// Mock NotificationService
const NotificationService = {
  sendNotification: async () => ({ success: true }),
  broadcastNotification: async () => ({ success: true })
};

// Replace the real NotificationService with mock
require.cache[require.resolve('./services/NotificationService')] = {
  exports: NotificationService
};

const test = new SimpleTest();

// Test data
let testCompany, testUser, testStudent, testInternship, testApplication;

async function setupTestData() {
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
}

// Test cases
test.describe('InternshipService Tests', () => {
  test.test('should create internship successfully', async () => {
    await setupTestData();
    
    const internshipData = {
      companyId: testCompany._id,
      title: 'Data Science Intern',
      description: 'Work with our data science team on machine learning projects',
      requirements: ['Python programming', 'Statistics knowledge'],
      skills: ['Python', 'Pandas', 'NumPy'],
      duration: 16,
      stipend: 25000,
      location: 'Quezon City, Philippines',
      workArrangement: 'onsite',
      slots: 3,
      applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 152 * 24 * 60 * 60 * 1000),
      targetPrograms: ['Computer Science', 'Mathematics'],
      yearLevelRequirement: 3
    };

    const result = await InternshipService.createInternship(internshipData, testUser._id);

    test.expect(result).toBeDefined();
    test.expect(result.title).toBe('Data Science Intern');
    test.expect(result.companyId.name).toBe(testCompany.name);
  });

  test.test('should fail when company is not verified', async () => {
    await setupTestData();
    
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

    await test.expect(
      InternshipService.createInternship(internshipData, testUser._id)
    ).rejects.toThrow('Company must be verified');
  });

  test.test('should get published internships', async () => {
    await setupTestData();
    
    const result = await InternshipService.getInternships();

    test.expect(result).toBeDefined();
    test.expect(result.internships).toBeInstanceOf(Array);
    test.expect(result.internships.length).toBeGreaterThan(0);
    test.expect(result.pagination).toBeDefined();
  });

  test.test('should submit application successfully', async () => {
    await setupTestData();
    
    const newStudent = await User.create({
      firstName: 'Bob',
      lastName: 'Applicant',
      email: 'bob.applicant@test.com',
      password: 'hashedpassword',
      role: 'student',
      program: 'Computer Science',
      yearLevel: 3,
      gpa: 3.7,
      isActive: true
    });

    const applicationData = {
      coverLetter: 'I am excited about this opportunity.',
      resume: '/uploads/resumes/bob_resume.pdf',
      studentInfo: {
        currentYear: 3,
        program: 'Computer Science',
        gpa: 3.7,
        expectedGraduation: new Date('2025-05-15'),
        skills: ['JavaScript', 'Python']
      }
    };

    const result = await InternshipService.submitApplication(
      testInternship._id,
      newStudent._id,
      applicationData
    );

    test.expect(result).toBeDefined();
    test.expect(result.status).toBe('submitted');
  });

  test.test('should update application status', async () => {
    await setupTestData();
    
    const result = await InternshipService.updateApplicationStatus(
      testApplication._id,
      'under_review',
      testUser._id,
      { notes: 'Application looks promising' }
    );

    test.expect(result.status).toBe('under_review');
  });

  test.test('should track internship progress', async () => {
    await setupTestData();
    
    // Set application to accepted status
    testApplication.status = 'accepted';
    testApplication.internshipStatus = 'in_progress';
    await testApplication.save();

    const progressData = {
      milestone: 'Week 2 - Environment Setup Complete',
      description: 'Successfully set up development environment',
      completionPercentage: 20,
      supervisorNotes: 'Good progress'
    };

    const result = await InternshipService.trackProgress(
      testApplication._id,
      progressData,
      testUser._id
    );

    test.expect(result.progressTracking).toBeDefined();
    test.expect(result.progressTracking.length).toBeGreaterThan(0);
  });

  test.test('should get candidate recommendations', async () => {
    await setupTestData();
    
    const result = await InternshipService.getCandidateRecommendations(
      testInternship._id,
      { limit: 5 }
    );

    test.expect(result).toBeDefined();
    test.expect(result).toBeInstanceOf(Array);
  });

  test.test('should get analytics', async () => {
    await setupTestData();
    
    const result = await InternshipService.getAnalytics();

    test.expect(result).toBeDefined();
    test.expect(result.totals).toBeDefined();
    test.expect(result.rates).toBeDefined();
  });
});

test.describe('CompanyService Tests', () => {
  test.test('should register company successfully', async () => {
    await setupTestData();
    
    const companyData = {
      name: 'New Tech Company',
      description: 'A new technology company',
      industry: 'Technology',
      address: '456 New Street',
      contactPerson: {
        name: 'New Contact',
        email: 'contact@newtech.com',
        phone: '+1987654321',
        position: 'Manager'
      }
    };

    const result = await CompanyService.registerCompany(companyData, testUser._id);

    test.expect(result).toBeDefined();
    test.expect(result.name).toBe('New Tech Company');
    test.expect(result.verificationStatus).toBe('pending');
  });

  test.test('should verify company', async () => {
    await setupTestData();
    
    const result = await CompanyService.verifyCompany(
      testCompany._id,
      testUser._id,
      'Company meets requirements'
    );

    test.expect(result.verificationStatus).toBe('verified');
  });

  test.test('should get company dashboard', async () => {
    await setupTestData();
    
    const result = await CompanyService.getCompanyDashboard(testCompany._id);

    test.expect(result).toBeDefined();
    test.expect(result.company).toBeDefined();
    test.expect(result.statistics).toBeDefined();
  });
});

test.describe('CandidateMatchingService Tests', () => {
  test.test('should match candidates for internship', async () => {
    await setupTestData();
    
    const result = await CandidateMatchingService.matchCandidatesForInternship(
      testInternship._id,
      { limit: 5 }
    );

    test.expect(result).toBeDefined();
    test.expect(result).toBeInstanceOf(Array);
  });

  test.test('should find internships for student', async () => {
    await setupTestData();
    
    const result = await CandidateMatchingService.findInternshipsForStudent(
      testStudent._id,
      { limit: 5 }
    );

    test.expect(result).toBeDefined();
    test.expect(result).toBeInstanceOf(Array);
  });
});

// Run tests
async function runTests() {
  try {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test_simple';
    await mongoose.connect(mongoUri);
    console.log('📡 Connected to test database');

    // Run all tests
    const success = await test.run();

    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    if (success) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };