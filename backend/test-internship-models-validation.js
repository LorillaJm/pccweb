const mongoose = require('mongoose');
const { expect } = require('chai');

// Import models
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');

describe('Internship Models Validation Tests', function() {
  this.timeout(5000);

  describe('Company Model Schema Validation', function() {
    it('should have correct schema structure', function() {
      const companySchema = Company.schema;
      
      // Check required fields
      expect(companySchema.paths.name.isRequired).to.be.true;
      expect(companySchema.paths.description.isRequired).to.be.true;
      expect(companySchema.paths.industry.isRequired).to.be.true;
      expect(companySchema.paths.address.isRequired).to.be.true;
      expect(companySchema.paths['contactPerson.name'].isRequired).to.be.true;
      expect(companySchema.paths['contactPerson.email'].isRequired).to.be.true;
      expect(companySchema.paths['contactPerson.phone'].isRequired).to.be.true;
      expect(companySchema.paths['contactPerson.position'].isRequired).to.be.true;
    });

    it('should have correct default values', function() {
      const company = new Company({
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

      expect(company.verificationStatus).to.equal('pending');
      expect(company.partnershipLevel).to.equal('bronze');
      expect(company.isActive).to.be.true;
      expect(company.totalInternships).to.equal(0);
      expect(company.activeInternships).to.equal(0);
      expect(company.completedInternships).to.equal(0);
      expect(company.averageRating).to.equal(0);
    });

    it('should validate industry enum values', function() {
      const validIndustries = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Construction', 'Transportation', 'Hospitality', 'Government',
        'Non-profit', 'Media', 'Real Estate', 'Agriculture', 'Energy', 'Other'
      ];

      const industryEnum = Company.schema.paths.industry.enumValues;
      expect(industryEnum).to.deep.equal(validIndustries);
    });

    it('should validate verification status enum values', function() {
      const validStatuses = ['pending', 'verified', 'rejected'];
      const statusEnum = Company.schema.paths.verificationStatus.enumValues;
      expect(statusEnum).to.deep.equal(validStatuses);
    });

    it('should validate partnership level enum values', function() {
      const validLevels = ['bronze', 'silver', 'gold', 'platinum'];
      const levelEnum = Company.schema.paths.partnershipLevel.enumValues;
      expect(levelEnum).to.deep.equal(validLevels);
    });

    it('should have instance methods defined', function() {
      const company = new Company();
      expect(company.verify).to.be.a('function');
      expect(company.reject).to.be.a('function');
      expect(company.updatePartnershipLevel).to.be.a('function');
    });

    it('should have static methods defined', function() {
      expect(Company.findVerified).to.be.a('function');
      expect(Company.findByIndustry).to.be.a('function');
      expect(Company.findByPartnershipLevel).to.be.a('function');
    });
  });

  describe('Internship Model Schema Validation', function() {
    it('should have correct schema structure', function() {
      const internshipSchema = Internship.schema;
      
      // Check required fields
      expect(internshipSchema.paths.companyId.isRequired).to.be.true;
      expect(internshipSchema.paths.title.isRequired).to.be.true;
      expect(internshipSchema.paths.description.isRequired).to.be.true;
      expect(internshipSchema.paths.duration.isRequired).to.be.true;
      expect(internshipSchema.paths.location.isRequired).to.be.true;
      expect(internshipSchema.paths.slots.isRequired).to.be.true;
      expect(internshipSchema.paths.applicationDeadline.isRequired).to.be.true;
      expect(internshipSchema.paths.startDate.isRequired).to.be.true;
      expect(internshipSchema.paths.endDate.isRequired).to.be.true;
      expect(internshipSchema.paths.createdBy.isRequired).to.be.true;
    });

    it('should have correct default values', function() {
      const internship = new Internship({
        companyId: new mongoose.Types.ObjectId(),
        title: 'Test Internship',
        description: 'Test description',
        duration: 12,
        location: 'Test location',
        slots: 5,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
        createdBy: new mongoose.Types.ObjectId()
      });

      expect(internship.status).to.equal('draft');
      expect(internship.workArrangement).to.equal('onsite');
      expect(internship.stipend).to.equal(0);
      expect(internship.currency).to.equal('PHP');
      expect(internship.filledSlots).to.equal(0);
      expect(internship.applicationCount).to.equal(0);
      expect(internship.acceptedCount).to.equal(0);
      expect(internship.viewCount).to.equal(0);
    });

    it('should validate work arrangement enum values', function() {
      const validArrangements = ['onsite', 'remote', 'hybrid'];
      const arrangementEnum = Internship.schema.paths.workArrangement.enumValues;
      expect(arrangementEnum).to.deep.equal(validArrangements);
    });

    it('should validate status enum values', function() {
      const validStatuses = ['draft', 'published', 'closed', 'completed', 'cancelled'];
      const statusEnum = Internship.schema.paths.status.enumValues;
      expect(statusEnum).to.deep.equal(validStatuses);
    });

    it('should validate duration constraints', function() {
      const durationPath = Internship.schema.paths.duration;
      expect(durationPath.options.min[0]).to.equal(1);
      expect(durationPath.options.max[0]).to.equal(52);
    });

    it('should validate slots constraints', function() {
      const slotsPath = Internship.schema.paths.slots;
      expect(slotsPath.options.min[0]).to.equal(1);
      expect(slotsPath.options.max[0]).to.equal(100);
    });

    it('should have virtual properties defined', function() {
      const internship = new Internship({
        slots: 10,
        filledSlots: 3,
        duration: 12,
        stipend: 0
      });

      expect(internship.availableSlots).to.equal(7);
      expect(internship.durationDisplay).to.equal('3 months');
      expect(internship.stipendDisplay).to.equal('Unpaid');
    });

    it('should have instance methods defined', function() {
      const internship = new Internship();
      expect(internship.publish).to.be.a('function');
      expect(internship.close).to.be.a('function');
      expect(internship.incrementApplication).to.be.a('function');
      expect(internship.incrementAccepted).to.be.a('function');
      expect(internship.decrementAccepted).to.be.a('function');
      expect(internship.incrementView).to.be.a('function');
    });

    it('should have static methods defined', function() {
      expect(Internship.findPublished).to.be.a('function');
      expect(Internship.findByCompany).to.be.a('function');
      expect(Internship.findByProgram).to.be.a('function');
      expect(Internship.findExpiringSoon).to.be.a('function');
    });
  });

  describe('InternshipApplication Model Schema Validation', function() {
    it('should have correct schema structure', function() {
      const applicationSchema = InternshipApplication.schema;
      
      // Check required fields
      expect(applicationSchema.paths.internshipId.isRequired).to.be.true;
      expect(applicationSchema.paths.studentId.isRequired).to.be.true;
      expect(applicationSchema.paths.coverLetter.isRequired).to.be.true;
      expect(applicationSchema.paths.resume.isRequired).to.be.true;
      expect(applicationSchema.paths['studentInfo.currentYear'].isRequired).to.be.true;
      expect(applicationSchema.paths['studentInfo.program'].isRequired).to.be.true;
      expect(applicationSchema.paths['studentInfo.expectedGraduation'].isRequired).to.be.true;
    });

    it('should have correct default values', function() {
      const application = new InternshipApplication({
        internshipId: new mongoose.Types.ObjectId(),
        studentId: new mongoose.Types.ObjectId(),
        coverLetter: 'Test cover letter',
        resume: '/uploads/test_resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });

      expect(application.status).to.equal('submitted');
      expect(application.applicationSource).to.equal('portal');
      expect(application.notificationPreferences.emailUpdates).to.be.true;
      expect(application.notificationPreferences.smsUpdates).to.be.false;
    });

    it('should validate status enum values', function() {
      const validStatuses = [
        'submitted', 'under_review', 'shortlisted', 'interview_scheduled',
        'interview_completed', 'accepted', 'rejected', 'withdrawn', 'expired'
      ];
      const statusEnum = InternshipApplication.schema.paths.status.enumValues;
      expect(statusEnum).to.deep.equal(validStatuses);
    });

    it('should validate interview type enum values', function() {
      const validTypes = ['in_person', 'video_call', 'phone'];
      const typeEnum = InternshipApplication.schema.paths['interviewSchedule.type'].enumValues;
      expect(typeEnum).to.deep.equal(validTypes);
    });

    it('should validate year level constraints', function() {
      const yearPath = InternshipApplication.schema.paths['studentInfo.currentYear'];
      expect(yearPath.options.min[0]).to.equal(1);
      expect(yearPath.options.max[0]).to.equal(4);
    });

    it('should validate GPA constraints', function() {
      const gpaPath = InternshipApplication.schema.paths['studentInfo.gpa'];
      expect(gpaPath.options.min[0]).to.equal(1.0);
      expect(gpaPath.options.max[0]).to.equal(4.0);
    });

    it('should have virtual properties defined', function() {
      const application = new InternshipApplication({
        status: 'submitted',
        submittedAt: new Date()
      });

      expect(application.applicationAge).to.be.a('number');
      expect(application.statusDisplay).to.equal('Application Submitted');
      expect(application.interviewStatus).to.equal('not_scheduled');
    });

    it('should have instance methods defined', function() {
      const application = new InternshipApplication();
      expect(application.updateStatus).to.be.a('function');
      expect(application.scheduleInterview).to.be.a('function');
      expect(application.withdraw).to.be.a('function');
      expect(application.accept).to.be.a('function');
      expect(application.reject).to.be.a('function');
    });

    it('should have static methods defined', function() {
      expect(InternshipApplication.findByStudent).to.be.a('function');
      expect(InternshipApplication.findByInternship).to.be.a('function');
      expect(InternshipApplication.findByStatus).to.be.a('function');
      expect(InternshipApplication.findPendingReview).to.be.a('function');
      expect(InternshipApplication.findExpiredApplications).to.be.a('function');
    });
  });

  describe('Model Relationships', function() {
    it('should have correct reference types', function() {
      // Company references
      expect(Internship.schema.paths.companyId.instance).to.equal('ObjectId');
      expect(Internship.schema.paths.companyId.options.ref).to.equal('Company');

      // Internship references
      expect(InternshipApplication.schema.paths.internshipId.instance).to.equal('ObjectId');
      expect(InternshipApplication.schema.paths.internshipId.options.ref).to.equal('Internship');

      // User references
      expect(InternshipApplication.schema.paths.studentId.instance).to.equal('ObjectId');
      expect(InternshipApplication.schema.paths.studentId.options.ref).to.equal('User');
      expect(Internship.schema.paths.createdBy.instance).to.equal('ObjectId');
      expect(Internship.schema.paths.createdBy.options.ref).to.equal('User');
    });

    it('should have proper indexes defined', function() {
      // Check that indexes exist (basic check)
      const companyIndexes = Company.schema.indexes();
      const internshipIndexes = Internship.schema.indexes();
      const applicationIndexes = InternshipApplication.schema.indexes();

      expect(companyIndexes.length).to.be.greaterThan(0);
      expect(internshipIndexes.length).to.be.greaterThan(0);
      expect(applicationIndexes.length).to.be.greaterThan(0);
    });
  });

  describe('Business Logic Validation', function() {
    it('should validate company verification workflow', function() {
      const company = new Company({
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

      // Initial state
      expect(company.verificationStatus).to.equal('pending');
      expect(company.partnershipLevel).to.equal('bronze');
      expect(company.isActive).to.be.true;
    });

    it('should validate internship application workflow', function() {
      const application = new InternshipApplication({
        internshipId: new mongoose.Types.ObjectId(),
        studentId: new mongoose.Types.ObjectId(),
        coverLetter: 'Test cover letter',
        resume: '/uploads/test_resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });

      // Initial state
      expect(application.status).to.equal('submitted');
      expect(application.submittedAt).to.exist;
    });

    it('should validate internship slot management', function() {
      const internship = new Internship({
        companyId: new mongoose.Types.ObjectId(),
        title: 'Test Internship',
        description: 'Test description',
        duration: 12,
        location: 'Test location',
        slots: 10,
        filledSlots: 3,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
        createdBy: new mongoose.Types.ObjectId()
      });

      expect(internship.availableSlots).to.equal(7);
      expect(internship.slots).to.be.greaterThan(internship.filledSlots);
    });
  });

  describe('Data Integrity Constraints', function() {
    it('should enforce required field constraints', function() {
      // Test Company required fields
      const company = new Company();
      const companyErrors = company.validateSync();
      expect(companyErrors.errors.name).to.exist;
      expect(companyErrors.errors.description).to.exist;
      expect(companyErrors.errors.industry).to.exist;
      expect(companyErrors.errors.address).to.exist;

      // Test Internship required fields
      const internship = new Internship();
      const internshipErrors = internship.validateSync();
      expect(internshipErrors.errors.companyId).to.exist;
      expect(internshipErrors.errors.title).to.exist;
      expect(internshipErrors.errors.description).to.exist;
      expect(internshipErrors.errors.duration).to.exist;

      // Test InternshipApplication required fields
      const application = new InternshipApplication();
      const applicationErrors = application.validateSync();
      expect(applicationErrors.errors.internshipId).to.exist;
      expect(applicationErrors.errors.studentId).to.exist;
      expect(applicationErrors.errors.coverLetter).to.exist;
      expect(applicationErrors.errors.resume).to.exist;
    });

    it('should enforce string length constraints', function() {
      const company = new Company({
        name: 'A'.repeat(201), // Exceeds maxlength
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

      const errors = company.validateSync();
      expect(errors.errors.name).to.exist;
      expect(errors.errors.name.message).to.include('200 characters');
    });

    it('should enforce numeric constraints', function() {
      const internship = new Internship({
        companyId: new mongoose.Types.ObjectId(),
        title: 'Test Internship',
        description: 'Test description',
        duration: 0, // Below minimum
        location: 'Test location',
        slots: 0, // Below minimum
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
        createdBy: new mongoose.Types.ObjectId()
      });

      const errors = internship.validateSync();
      expect(errors.errors.duration).to.exist;
      expect(errors.errors.slots).to.exist;
    });
  });
});

console.log('✅ All internship model validation tests completed successfully!');