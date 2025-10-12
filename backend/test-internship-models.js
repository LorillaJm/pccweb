const mongoose = require('mongoose');
const { expect } = require('chai');
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');

describe('Internship Models Unit Tests', function() {
  this.timeout(10000);

  before(async function() {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test_internship';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  beforeEach(async function() {
    // Clean up test data before each test
    await Company.deleteMany({});
    await Internship.deleteMany({});
    await InternshipApplication.deleteMany({});
  });

  after(async function() {
    // Clean up and close connection
    await Company.deleteMany({});
    await Internship.deleteMany({});
    await InternshipApplication.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Company Model', function() {
    describe('Validation', function() {
      it('should create a valid company with required fields', async function() {
        const companyData = {
          name: 'Tech Solutions Inc.',
          description: 'A leading technology company specializing in software development.',
          industry: 'Technology',
          address: '123 Tech Street, Manila, Philippines',
          contactPerson: {
            name: 'John Doe',
            email: 'john.doe@techsolutions.com',
            phone: '+63-912-345-6789',
            position: 'HR Manager'
          }
        };

        const company = new Company(companyData);
        const savedCompany = await company.save();

        expect(savedCompany._id).to.exist;
        expect(savedCompany.name).to.equal(companyData.name);
        expect(savedCompany.verificationStatus).to.equal('pending');
        expect(savedCompany.partnershipLevel).to.equal('bronze');
        expect(savedCompany.isActive).to.be.true;
      });

      it('should fail validation with missing required fields', async function() {
        const company = new Company({
          name: 'Incomplete Company'
          // Missing required fields
        });

        try {
          await company.save();
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error.name).to.equal('ValidationError');
          expect(error.errors.description).to.exist;
          expect(error.errors.industry).to.exist;
          expect(error.errors.address).to.exist;
        }
      });

      it('should validate email format in contact person', async function() {
        const company = new Company({
          name: 'Test Company',
          description: 'Test description',
          industry: 'Technology',
          address: 'Test address',
          contactPerson: {
            name: 'Test Person',
            email: 'invalid-email',
            phone: '+63-912-345-6789',
            position: 'Manager'
          }
        });

        try {
          await company.save();
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error.name).to.equal('ValidationError');
          expect(error.errors['contactPerson.email']).to.exist;
        }
      });

      it('should validate industry enum values', async function() {
        const company = new Company({
          name: 'Test Company',
          description: 'Test description',
          industry: 'InvalidIndustry',
          address: 'Test address',
          contactPerson: {
            name: 'Test Person',
            email: 'test@example.com',
            phone: '+63-912-345-6789',
            position: 'Manager'
          }
        });

        try {
          await company.save();
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error.name).to.equal('ValidationError');
          expect(error.errors.industry).to.exist;
        }
      });
    });

    describe('Instance Methods', function() {
      let company;

      beforeEach(async function() {
        company = new Company({
          name: 'Test Company',
          description: 'Test description',
          industry: 'Technology',
          address: 'Test address',
          contactPerson: {
            name: 'Test Person',
            email: 'test@example.com',
            phone: '+63-912-345-6789',
            position: 'Manager'
          }
        });
        await company.save();
      });

      it('should verify company successfully', async function() {
        await company.verify('admin123', 'Company verified successfully');
        
        expect(company.verificationStatus).to.equal('verified');
        expect(company.verificationDate).to.exist;
        expect(company.verificationNotes).to.equal('Company verified successfully');
      });

      it('should reject company with reason', async function() {
        await company.reject('admin123', 'Missing required documents');
        
        expect(company.verificationStatus).to.equal('rejected');
        expect(company.verificationNotes).to.equal('Missing required documents');
      });

      it('should update partnership level', async function() {
        await company.updatePartnershipLevel('gold');
        
        expect(company.partnershipLevel).to.equal('gold');
      });

      it('should throw error for invalid partnership level', async function() {
        try {
          await company.updatePartnershipLevel('invalid');
          expect.fail('Should have thrown error');
        } catch (error) {
          expect(error.message).to.equal('Invalid partnership level');
        }
      });
    });

    describe('Static Methods', function() {
      beforeEach(async function() {
        // Create test companies
        await Company.create([
          {
            name: 'Verified Tech Co',
            description: 'Verified technology company',
            industry: 'Technology',
            address: 'Tech Address',
            verificationStatus: 'verified',
            contactPerson: {
              name: 'Tech Manager',
              email: 'tech@example.com',
              phone: '+63-912-345-6789',
              position: 'Manager'
            }
          },
          {
            name: 'Pending Finance Co',
            description: 'Pending finance company',
            industry: 'Finance',
            address: 'Finance Address',
            verificationStatus: 'pending',
            contactPerson: {
              name: 'Finance Manager',
              email: 'finance@example.com',
              phone: '+63-912-345-6789',
              position: 'Manager'
            }
          }
        ]);
      });

      it('should find only verified companies', async function() {
        const verifiedCompanies = await Company.findVerified();
        
        expect(verifiedCompanies).to.have.length(1);
        expect(verifiedCompanies[0].name).to.equal('Verified Tech Co');
      });

      it('should find companies by industry', async function() {
        const techCompanies = await Company.findByIndustry('Technology');
        
        expect(techCompanies).to.have.length(1);
        expect(techCompanies[0].industry).to.equal('Technology');
      });
    });
  });

  describe('Internship Model', function() {
    let company;

    beforeEach(async function() {
      company = await Company.create({
        name: 'Test Company',
        description: 'Test description',
        industry: 'Technology',
        address: 'Test address',
        verificationStatus: 'verified',
        contactPerson: {
          name: 'Test Person',
          email: 'test@example.com',
          phone: '+63-912-345-6789',
          position: 'Manager'
        }
      });
    });

    describe('Validation', function() {
      it('should create a valid internship with required fields', async function() {
        const internshipData = {
          companyId: company._id,
          title: 'Software Development Intern',
          description: 'Learn software development in a professional environment.',
          duration: 12,
          location: 'Manila, Philippines',
          slots: 5,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000), // ~18 weeks from now
          createdBy: new mongoose.Types.ObjectId()
        };

        const internship = new Internship(internshipData);
        const savedInternship = await internship.save();

        expect(savedInternship._id).to.exist;
        expect(savedInternship.title).to.equal(internshipData.title);
        expect(savedInternship.status).to.equal('draft');
        expect(savedInternship.workArrangement).to.equal('onsite');
        expect(savedInternship.stipend).to.equal(0);
      });

      it('should fail validation with invalid date sequence', async function() {
        const internship = new Internship({
          companyId: company._id,
          title: 'Test Internship',
          description: 'Test description',
          duration: 12,
          location: 'Test location',
          slots: 5,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Before deadline
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          createdBy: new mongoose.Types.ObjectId()
        });

        try {
          await internship.save();
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error.name).to.equal('ValidationError');
        }
      });

      it('should validate duration limits', async function() {
        const internship = new Internship({
          companyId: company._id,
          title: 'Test Internship',
          description: 'Test description',
          duration: 100, // Exceeds maximum
          location: 'Test location',
          slots: 5,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
          createdBy: new mongoose.Types.ObjectId()
        });

        try {
          await internship.save();
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error.name).to.equal('ValidationError');
          expect(error.errors.duration).to.exist;
        }
      });
    });

    describe('Virtual Properties', function() {
      let internship;

      beforeEach(async function() {
        internship = await Internship.create({
          companyId: company._id,
          title: 'Test Internship',
          description: 'Test description',
          duration: 12,
          location: 'Test location',
          slots: 10,
          filledSlots: 3,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
          createdBy: new mongoose.Types.ObjectId(),
          status: 'published'
        });
      });

      it('should calculate available slots correctly', function() {
        expect(internship.availableSlots).to.equal(7);
      });

      it('should determine if application is open', function() {
        expect(internship.isApplicationOpen).to.be.true;
      });

      it('should display duration correctly', function() {
        expect(internship.durationDisplay).to.equal('3 months');
      });

      it('should display stipend correctly', function() {
        expect(internship.stipendDisplay).to.equal('Unpaid');
        
        internship.stipend = 15000;
        expect(internship.stipendDisplay).to.equal('PHP 15,000');
      });
    });

    describe('Instance Methods', function() {
      let internship;

      beforeEach(async function() {
        internship = await Internship.create({
          companyId: company._id,
          title: 'Test Internship',
          description: 'Test description',
          duration: 12,
          location: 'Test location',
          slots: 10,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
          createdBy: new mongoose.Types.ObjectId()
        });
      });

      it('should publish internship successfully', async function() {
        await internship.publish();
        
        expect(internship.status).to.equal('published');
        expect(internship.publishedAt).to.exist;
      });

      it('should increment application count', async function() {
        const initialCount = internship.applicationCount;
        await internship.incrementApplication();
        
        expect(internship.applicationCount).to.equal(initialCount + 1);
      });

      it('should increment accepted count and filled slots', async function() {
        const initialAccepted = internship.acceptedCount;
        const initialFilled = internship.filledSlots;
        
        await internship.incrementAccepted();
        
        expect(internship.acceptedCount).to.equal(initialAccepted + 1);
        expect(internship.filledSlots).to.equal(initialFilled + 1);
      });
    });
  });

  describe('InternshipApplication Model', function() {
    let company, internship, studentId;

    beforeEach(async function() {
      company = await Company.create({
        name: 'Test Company',
        description: 'Test description',
        industry: 'Technology',
        address: 'Test address',
        verificationStatus: 'verified',
        contactPerson: {
          name: 'Test Person',
          email: 'test@example.com',
          phone: '+63-912-345-6789',
          position: 'Manager'
        }
      });

      internship = await Internship.create({
        companyId: company._id,
        title: 'Test Internship',
        description: 'Test description',
        duration: 12,
        location: 'Test location',
        slots: 10,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
        createdBy: new mongoose.Types.ObjectId(),
        status: 'published'
      });

      studentId = new mongoose.Types.ObjectId();
    });

    describe('Validation', function() {
      it('should create a valid application with required fields', async function() {
        const applicationData = {
          internshipId: internship._id,
          studentId: studentId,
          coverLetter: 'I am very interested in this internship opportunity...',
          resume: '/uploads/resumes/student123_resume.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.5,
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            skills: ['JavaScript', 'Python', 'React']
          }
        };

        const application = new InternshipApplication(applicationData);
        const savedApplication = await application.save();

        expect(savedApplication._id).to.exist;
        expect(savedApplication.status).to.equal('submitted');
        expect(savedApplication.submittedAt).to.exist;
        expect(savedApplication.studentInfo.currentYear).to.equal(3);
      });

      it('should enforce unique application per student per internship', async function() {
        const applicationData = {
          internshipId: internship._id,
          studentId: studentId,
          coverLetter: 'Test cover letter',
          resume: '/uploads/test_resume.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.5,
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        };

        // Create first application
        await InternshipApplication.create(applicationData);

        // Try to create duplicate application
        try {
          await InternshipApplication.create(applicationData);
          expect.fail('Should have thrown duplicate key error');
        } catch (error) {
          expect(error.code).to.equal(11000); // MongoDB duplicate key error
        }
      });

      it('should validate GPA range', async function() {
        const application = new InternshipApplication({
          internshipId: internship._id,
          studentId: studentId,
          coverLetter: 'Test cover letter',
          resume: '/uploads/test_resume.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 5.0, // Invalid GPA
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });

        try {
          await application.save();
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error.name).to.equal('ValidationError');
          expect(error.errors['studentInfo.gpa']).to.exist;
        }
      });
    });

    describe('Virtual Properties', function() {
      let application;

      beforeEach(async function() {
        application = await InternshipApplication.create({
          internshipId: internship._id,
          studentId: studentId,
          coverLetter: 'Test cover letter',
          resume: '/uploads/test_resume.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.5,
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });
      });

      it('should calculate application age correctly', function() {
        expect(application.applicationAge).to.be.a('number');
        expect(application.applicationAge).to.be.at.least(0);
      });

      it('should display status correctly', function() {
        expect(application.statusDisplay).to.equal('Application Submitted');
        
        application.status = 'under_review';
        expect(application.statusDisplay).to.equal('Under Review');
      });

      it('should determine interview status correctly', function() {
        expect(application.interviewStatus).to.equal('not_scheduled');
        
        application.interviewSchedule = {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          time: '14:00'
        };
        expect(application.interviewStatus).to.equal('scheduled');
      });
    });

    describe('Instance Methods', function() {
      let application;

      beforeEach(async function() {
        application = await InternshipApplication.create({
          internshipId: internship._id,
          studentId: studentId,
          coverLetter: 'Test cover letter',
          resume: '/uploads/test_resume.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.5,
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });
      });

      it('should update status with valid transitions', async function() {
        const reviewerId = new mongoose.Types.ObjectId();
        
        await application.updateStatus('under_review', reviewerId, 'Initial review');
        
        expect(application.status).to.equal('under_review');
        expect(application.reviewedBy.toString()).to.equal(reviewerId.toString());
        expect(application.reviewNotes).to.equal('Initial review');
        expect(application.reviewedAt).to.exist;
      });

      it('should reject invalid status transitions', async function() {
        try {
          await application.updateStatus('accepted'); // Can't go directly from submitted to accepted
          expect.fail('Should have thrown error');
        } catch (error) {
          expect(error.message).to.include('Cannot transition');
        }
      });

      it('should schedule interview successfully', async function() {
        const interviewDetails = {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: '14:00',
          type: 'video_call',
          location: 'Zoom Meeting',
          meetingLink: 'https://zoom.us/j/123456789'
        };

        await application.scheduleInterview(interviewDetails);
        
        expect(application.status).to.equal('interview_scheduled');
        expect(application.interviewSchedule.date).to.exist;
        expect(application.interviewSchedule.type).to.equal('video_call');
        expect(application.interviewScheduledAt).to.exist;
      });

      it('should withdraw application with reason', async function() {
        await application.withdraw('Found another opportunity');
        
        expect(application.status).to.equal('withdrawn');
        expect(application.withdrawalReason).to.equal('Found another opportunity');
        expect(application.withdrawnAt).to.exist;
      });

      it('should accept application', async function() {
        const reviewerId = new mongoose.Types.ObjectId();
        
        // First move to valid status for acceptance
        await application.updateStatus('shortlisted', reviewerId);
        await application.accept(reviewerId, 'Excellent candidate');
        
        expect(application.status).to.equal('accepted');
        expect(application.feedback).to.equal('Excellent candidate');
        expect(application.finalDecisionAt).to.exist;
      });
    });

    describe('Static Methods', function() {
      let application1, application2, student2Id;

      beforeEach(async function() {
        student2Id = new mongoose.Types.ObjectId();

        application1 = await InternshipApplication.create({
          internshipId: internship._id,
          studentId: studentId,
          coverLetter: 'First application',
          resume: '/uploads/resume1.pdf',
          studentInfo: {
            currentYear: 3,
            program: 'Computer Science',
            gpa: 3.5,
            expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });

        application2 = await InternshipApplication.create({
          internshipId: internship._id,
          studentId: student2Id,
          coverLetter: 'Second application',
          resume: '/uploads/resume2.pdf',
          status: 'under_review',
          studentInfo: {
            currentYear: 4,
            program: 'Information Technology',
            gpa: 3.8,
            expectedGraduation: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          }
        });
      });

      it('should find applications by student', async function() {
        const studentApplications = await InternshipApplication.findByStudent(studentId);
        
        expect(studentApplications).to.have.length(1);
        expect(studentApplications[0].coverLetter).to.equal('First application');
      });

      it('should find applications by internship', async function() {
        const internshipApplications = await InternshipApplication.findByInternship(internship._id);
        
        expect(internshipApplications).to.have.length(2);
      });

      it('should find applications by status', async function() {
        const submittedApplications = await InternshipApplication.findByStatus('submitted');
        const reviewApplications = await InternshipApplication.findByStatus('under_review');
        
        expect(submittedApplications).to.have.length(1);
        expect(reviewApplications).to.have.length(1);
      });

      it('should find pending review applications', async function() {
        const pendingApplications = await InternshipApplication.findPendingReview();
        
        expect(pendingApplications).to.have.length(2);
      });
    });
  });

  describe('Model Integration', function() {
    it('should maintain referential integrity between models', async function() {
      // Create company
      const company = await Company.create({
        name: 'Integration Test Company',
        description: 'Test company for integration',
        industry: 'Technology',
        address: 'Test address',
        verificationStatus: 'verified',
        contactPerson: {
          name: 'Test Manager',
          email: 'manager@test.com',
          phone: '+63-912-345-6789',
          position: 'Manager'
        }
      });

      // Create internship
      const internship = await Internship.create({
        companyId: company._id,
        title: 'Integration Test Internship',
        description: 'Test internship for integration',
        duration: 12,
        location: 'Test location',
        slots: 5,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
        createdBy: new mongoose.Types.ObjectId(),
        status: 'published'
      });

      // Create application
      const application = await InternshipApplication.create({
        internshipId: internship._id,
        studentId: new mongoose.Types.ObjectId(),
        coverLetter: 'Integration test application',
        resume: '/uploads/integration_resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5,
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });

      // Test population
      const populatedApplication = await InternshipApplication
        .findById(application._id)
        .populate({
          path: 'internshipId',
          populate: {
            path: 'companyId',
            select: 'name industry verificationStatus'
          }
        });

      expect(populatedApplication.internshipId.title).to.equal('Integration Test Internship');
      expect(populatedApplication.internshipId.companyId.name).to.equal('Integration Test Company');
      expect(populatedApplication.internshipId.companyId.industry).to.equal('Technology');
    });
  });
});

// Export for use in other test files
module.exports = {
  Company,
  Internship,
  InternshipApplication
};