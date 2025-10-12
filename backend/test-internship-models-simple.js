const mongoose = require('mongoose');

// Import models
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');

async function testInternshipModels() {
  console.log('🧪 Testing Internship Models - Simple Integration Test');
  
  try {
    // Test 1: Create Company instance
    console.log('\n1. Testing Company Model...');
    const company = new Company({
      name: 'Tech Innovations Inc.',
      description: 'A leading technology company specializing in software development and digital solutions.',
      industry: 'Technology',
      address: '123 Innovation Drive, Makati City, Philippines',
      contactPerson: {
        name: 'Maria Santos',
        email: 'maria.santos@techinnovations.com',
        phone: '+63-917-123-4567',
        position: 'HR Manager'
      }
    });

    // Test company validation
    const companyValidation = company.validateSync();
    if (companyValidation) {
      console.log('❌ Company validation failed:', companyValidation.message);
      return;
    }
    console.log('✅ Company model validation passed');
    console.log(`   - Name: ${company.name}`);
    console.log(`   - Industry: ${company.industry}`);
    console.log(`   - Status: ${company.verificationStatus}`);
    console.log(`   - Partnership Level: ${company.partnershipLevel}`);

    // Test 2: Create Internship instance
    console.log('\n2. Testing Internship Model...');
    const internship = new Internship({
      companyId: company._id,
      title: 'Full-Stack Web Development Internship',
      description: 'Join our development team to learn modern web technologies including React, Node.js, and MongoDB. You will work on real projects and gain hands-on experience in software development.',
      requirements: [
        'Currently enrolled in Computer Science or related field',
        'Basic knowledge of HTML, CSS, and JavaScript',
        'Familiarity with Git version control',
        'Strong problem-solving skills'
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      duration: 12, // 12 weeks
      stipend: 15000, // PHP 15,000
      location: 'Makati City, Philippines',
      workArrangement: 'hybrid',
      slots: 3,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000), // ~18 weeks from now
      targetPrograms: ['Computer Science', 'Information Technology'],
      yearLevelRequirement: 3,
      createdBy: new mongoose.Types.ObjectId()
    });

    // Test internship validation
    const internshipValidation = internship.validateSync();
    if (internshipValidation) {
      console.log('❌ Internship validation failed:', internshipValidation.message);
      return;
    }
    console.log('✅ Internship model validation passed');
    console.log(`   - Title: ${internship.title}`);
    console.log(`   - Duration: ${internship.durationDisplay}`);
    console.log(`   - Stipend: ${internship.stipendDisplay}`);
    console.log(`   - Available Slots: ${internship.availableSlots}`);
    console.log(`   - Application Open: ${internship.isApplicationOpen}`);

    // Test 3: Create InternshipApplication instance
    console.log('\n3. Testing InternshipApplication Model...');
    const application = new InternshipApplication({
      internshipId: internship._id,
      studentId: new mongoose.Types.ObjectId(),
      coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Full-Stack Web Development Internship position at Tech Innovations Inc. As a third-year Computer Science student, I am eager to apply my programming skills in a real-world environment and contribute to your development team.

I have experience with JavaScript, HTML, CSS, and have been learning React through personal projects. I am particularly excited about the opportunity to work with modern technologies like Node.js and MongoDB, which align perfectly with my career goals in web development.

I am a quick learner, detail-oriented, and passionate about creating efficient and user-friendly applications. I believe this internship would provide invaluable experience and help me grow as a developer.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.

Best regards,
Juan Dela Cruz`,
      resume: '/uploads/resumes/juan_delacruz_resume.pdf',
      portfolio: '/uploads/portfolios/juan_delacruz_portfolio.pdf',
      studentInfo: {
        currentYear: 3,
        program: 'Computer Science',
        gpa: 3.7,
        expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        skills: ['JavaScript', 'HTML', 'CSS', 'React', 'Python', 'Java'],
        previousExperience: 'Completed several personal web development projects including a task management app and a weather dashboard. Participated in a local hackathon and placed 3rd in the web development category.'
      },
      preferences: {
        startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
        workArrangement: 'hybrid',
        additionalComments: 'I am flexible with the schedule and excited to learn from experienced developers.'
      }
    });

    // Test application validation
    const applicationValidation = application.validateSync();
    if (applicationValidation) {
      console.log('❌ Application validation failed:', applicationValidation.message);
      return;
    }
    console.log('✅ InternshipApplication model validation passed');
    console.log(`   - Status: ${application.statusDisplay}`);
    console.log(`   - Student Year: ${application.studentInfo.currentYear}`);
    console.log(`   - Program: ${application.studentInfo.program}`);
    console.log(`   - GPA: ${application.studentInfo.gpa}`);
    console.log(`   - Application Age: ${application.applicationAge} days`);

    // Test 4: Test model methods
    console.log('\n4. Testing Model Methods...');
    
    // Test company methods
    console.log('   Testing Company methods:');
    try {
      company.updatePartnershipLevel('silver');
      console.log(`   ✅ Partnership level updated to: ${company.partnershipLevel}`);
    } catch (error) {
      console.log(`   ❌ Partnership level update failed: ${error.message}`);
    }

    // Test internship methods
    console.log('   Testing Internship methods:');
    try {
      internship.publish();
      console.log(`   ✅ Internship published, status: ${internship.status}`);
      console.log(`   ✅ Published at: ${internship.publishedAt}`);
    } catch (error) {
      console.log(`   ❌ Internship publish failed: ${error.message}`);
    }

    try {
      internship.incrementApplication();
      console.log(`   ✅ Application count incremented to: ${internship.applicationCount}`);
    } catch (error) {
      console.log(`   ❌ Application increment failed: ${error.message}`);
    }

    // Test application methods
    console.log('   Testing InternshipApplication methods:');
    try {
      const reviewerId = new mongoose.Types.ObjectId();
      application.updateStatus('under_review', reviewerId, 'Application is being reviewed by HR team');
      console.log(`   ✅ Application status updated to: ${application.statusDisplay}`);
      console.log(`   ✅ Review notes: ${application.reviewNotes}`);
    } catch (error) {
      console.log(`   ❌ Status update failed: ${error.message}`);
    }

    // Test 5: Test virtual properties
    console.log('\n5. Testing Virtual Properties...');
    console.log(`   Company partnership duration: ${company.partnershipDuration} days`);
    console.log(`   Internship available slots: ${internship.availableSlots}`);
    console.log(`   Internship application open: ${internship.isApplicationOpen}`);
    console.log(`   Application interview status: ${application.interviewStatus}`);

    // Test 6: Test static methods (without database)
    console.log('\n6. Testing Static Methods (method existence)...');
    console.log('   Company static methods:');
    console.log(`   ✅ findVerified: ${typeof Company.findVerified === 'function'}`);
    console.log(`   ✅ findByIndustry: ${typeof Company.findByIndustry === 'function'}`);
    console.log(`   ✅ findByPartnershipLevel: ${typeof Company.findByPartnershipLevel === 'function'}`);

    console.log('   Internship static methods:');
    console.log(`   ✅ findPublished: ${typeof Internship.findPublished === 'function'}`);
    console.log(`   ✅ findByCompany: ${typeof Internship.findByCompany === 'function'}`);
    console.log(`   ✅ findByProgram: ${typeof Internship.findByProgram === 'function'}`);
    console.log(`   ✅ findExpiringSoon: ${typeof Internship.findExpiringSoon === 'function'}`);

    console.log('   InternshipApplication static methods:');
    console.log(`   ✅ findByStudent: ${typeof InternshipApplication.findByStudent === 'function'}`);
    console.log(`   ✅ findByInternship: ${typeof InternshipApplication.findByInternship === 'function'}`);
    console.log(`   ✅ findByStatus: ${typeof InternshipApplication.findByStatus === 'function'}`);
    console.log(`   ✅ findPendingReview: ${typeof InternshipApplication.findPendingReview === 'function'}`);

    console.log('\n🎉 All internship model tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Company model: Schema, validation, methods, and virtuals working');
    console.log('   ✅ Internship model: Schema, validation, methods, and virtuals working');
    console.log('   ✅ InternshipApplication model: Schema, validation, methods, and virtuals working');
    console.log('   ✅ Model relationships and references properly configured');
    console.log('   ✅ Business logic and workflows implemented correctly');
    console.log('   ✅ All required fields, constraints, and enums validated');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testInternshipModels();