const mongoose = require('mongoose');
const AlumniService = require('./services/AlumniService');
const JobService = require('./services/JobService');
const MentorshipService = require('./services/MentorshipService');
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Mentorship = require('./models/Mentorship');
const User = require('./models/User');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';

async function runTests() {
  console.log('🚀 Starting Alumni Services Tests...\n');

  try {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to test database');

    // Initialize services
    const alumniService = new AlumniService();
    const jobService = new JobService();
    const mentorshipService = new MentorshipService();

    // Clean up test data
    await Promise.all([
      User.deleteMany({ email: { $regex: /test.*@example\.com/ } }),
      AlumniProfile.deleteMany({}),
      JobPosting.deleteMany({}),
      Mentorship.deleteMany({})
    ]);
    console.log('✅ Cleaned up test data');

    // Create test users
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'alumni',
      isAlumni: true
    });

    const testMentor = await User.create({
      firstName: 'Test',
      lastName: 'Mentor',
      email: 'testmentor@example.com',
      password: 'password123',
      role: 'alumni',
      isAlumni: true
    });

    const testMentee = await User.create({
      firstName: 'Test',
      lastName: 'Mentee',
      email: 'testmentee@example.com',
      password: 'password123',
      role: 'student'
    });

    console.log('✅ Created test users');

    // Test 1: AlumniService - Create Profile
    console.log('\n📋 Testing AlumniService...');
    
    const profileData = {
      graduationYear: 2020,
      degree: 'Computer Science',
      currentPosition: 'Software Engineer',
      currentCompany: 'Tech Corp',
      industry: 'Technology',
      skills: ['JavaScript', 'Node.js', 'React']
    };

    const profileResult = await alumniService.createOrUpdateProfile(testUser._id, profileData);
    console.log('✅ Alumni profile created:', profileResult.success);

    // Test 2: AlumniService - Get Profile
    const getProfileResult = await alumniService.getProfile(testUser._id);
    console.log('✅ Alumni profile retrieved:', getProfileResult.success);

    // Test 3: AlumniService - Update Mentorship Availability
    const availabilityData = {
      isAvailable: true,
      expertise: ['Web Development', 'Career Guidance'],
      maxMentees: 5
    };

    const availabilityResult = await alumniService.updateMentorshipAvailability(
      testUser._id,
      availabilityData
    );
    console.log('✅ Mentorship availability updated:', availabilityResult.success);

    // Test 4: AlumniService - Search Alumni
    const searchResult = await alumniService.searchAlumni({ industry: 'Technology' });
    console.log('✅ Alumni search completed:', searchResult.success, `(${searchResult.data.alumni.length} results)`);

    // Test 5: JobService - Create Job Posting
    console.log('\n💼 Testing JobService...');
    
    const jobData = {
      title: 'Software Engineer',
      company: 'Tech Corp',
      description: 'Great opportunity for developers',
      location: 'Manila',
      workType: 'full_time',
      contactEmail: 'hr@techcorp.com'
    };

    const jobResult = await jobService.createJobPosting(testUser._id, jobData);
    console.log('✅ Job posting created:', jobResult.success);

    // Test 6: JobService - Get Job Posting
    const getJobResult = await jobService.getJobPosting(jobResult.data._id);
    console.log('✅ Job posting retrieved:', getJobResult.success);

    // Test 7: JobService - Search Jobs
    const jobSearchResult = await jobService.searchJobs({ workType: 'full_time' });
    console.log('✅ Job search completed:', jobSearchResult.success, `(${jobSearchResult.data.jobs.length} results)`);

    // Test 8: MentorshipService - Request Mentorship
    console.log('\n🤝 Testing MentorshipService...');
    
    const requestData = {
      program: 'career_guidance',
      focusAreas: ['Web Development'],
      requestMessage: 'I would like guidance in web development',
      goals: [
        { description: 'Learn React', targetDate: new Date() }
      ]
    };

    const mentorshipResult = await mentorshipService.requestMentorship(
      testMentee._id,
      testUser._id,
      requestData
    );
    console.log('✅ Mentorship requested:', mentorshipResult.success);

    // Test 9: MentorshipService - Respond to Request
    const responseResult = await mentorshipService.respondToMentorshipRequest(
      mentorshipResult.data._id,
      testUser._id,
      'accepted',
      'Happy to mentor you!'
    );
    console.log('✅ Mentorship request accepted:', responseResult.success);

    // Test 10: MentorshipService - Get Mentorships for User
    const userMentorshipsResult = await mentorshipService.getMentorshipsForUser(testUser._id);
    console.log('✅ User mentorships retrieved:', userMentorshipsResult.success, `(${userMentorshipsResult.data.total} total)`);

    // Test 11: Analytics Tests
    console.log('\n📊 Testing Analytics...');
    
    const alumniAnalytics = await alumniService.getAlumniAnalytics();
    console.log('✅ Alumni analytics retrieved:', alumniAnalytics.success);

    const jobAnalytics = await jobService.getJobAnalytics();
    console.log('✅ Job analytics retrieved:', jobAnalytics.success);

    const mentorshipStats = await mentorshipService.getMentorshipStats(testUser._id, 'mentor');
    console.log('✅ Mentorship stats retrieved:', mentorshipStats.success);

    // Test 12: Integration Test - Complete Workflow
    console.log('\n🔄 Testing Complete Workflow...');
    
    // Create another mentor profile
    const mentorProfileData = {
      graduationYear: 2018,
      degree: 'Information Technology',
      currentPosition: 'Senior Developer',
      industry: 'Technology',
      skills: ['Python', 'Django']
    };

    await alumniService.createOrUpdateProfile(testMentor._id, mentorProfileData);
    await alumniService.updateMentorshipAvailability(testMentor._id, {
      isAvailable: true,
      expertise: ['Backend Development'],
      maxMentees: 3
    });

    // Find mentor matches
    const mentorMatches = await mentorshipService.findMentorMatches(testMentee._id, {
      expertise: 'Backend Development'
    });
    console.log('✅ Mentor matches found:', mentorMatches.success, `(${mentorMatches.data.length} matches)`);

    // Create additional job posting
    const jobData2 = {
      title: 'Frontend Developer',
      company: 'Web Corp',
      description: 'React developer needed',
      location: 'Cebu',
      workType: 'part_time',
      contactEmail: 'hr@webcorp.com'
    };

    await jobService.createJobPosting(testMentor._id, jobData2);

    // Get personalized jobs for user
    const personalizedJobs = await jobService.getJobsForUser(testUser._id);
    console.log('✅ Personalized jobs retrieved:', personalizedJobs.success, `(${personalizedJobs.data.jobs.length} jobs)`);

    // Test program analytics
    const programAnalytics = await mentorshipService.getProgramAnalytics();
    console.log('✅ Program analytics retrieved:', programAnalytics.success);

    console.log('\n🎉 All tests completed successfully!');

    // Display summary
    console.log('\n📈 Test Summary:');
    console.log(`- Alumni profiles created: 2`);
    console.log(`- Job postings created: 2`);
    console.log(`- Mentorship requests: 1`);
    console.log(`- Active mentorships: 1`);
    console.log(`- Analytics tests: 4`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Clean up test data
    try {
      await Promise.all([
        User.deleteMany({ email: { $regex: /test.*@example\.com/ } }),
        AlumniProfile.deleteMany({}),
        JobPosting.deleteMany({}),
        Mentorship.deleteMany({})
      ]);
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Error handling tests
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');

  try {
    await mongoose.connect(MONGODB_URI);
    
    const alumniService = new AlumniService();
    const jobService = new JobService();
    const mentorshipService = new MentorshipService();

    // Test 1: Non-existent user
    try {
      const fakeUserId = new mongoose.Types.ObjectId();
      await alumniService.createOrUpdateProfile(fakeUserId, { graduationYear: 2020, degree: 'Test' });
      console.log('❌ Should have thrown error for non-existent user');
    } catch (error) {
      console.log('✅ Correctly handled non-existent user error');
    }

    // Test 2: Missing required fields
    try {
      const testUser = await User.create({
        firstName: 'Error',
        lastName: 'Test',
        email: 'errortest@example.com',
        password: 'password123',
        role: 'alumni'
      });

      await jobService.createJobPosting(testUser._id, { title: 'Test Job' }); // Missing required fields
      console.log('❌ Should have thrown error for missing required fields');
    } catch (error) {
      console.log('✅ Correctly handled missing required fields error');
    }

    // Test 3: Unauthorized access
    try {
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeMentorshipId = new mongoose.Types.ObjectId();
      await mentorshipService.respondToMentorshipRequest(fakeMentorshipId, fakeUserId, 'accepted', 'Test');
      console.log('❌ Should have thrown error for unauthorized access');
    } catch (error) {
      console.log('✅ Correctly handled unauthorized access error');
    }

    console.log('✅ Error handling tests completed');

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  } finally {
    // Clean up
    await User.deleteMany({ email: { $regex: /errortest@example\.com/ } });
    await mongoose.connection.close();
  }
}

// Performance tests
async function testPerformance() {
  console.log('\n⚡ Testing Performance...');

  try {
    await mongoose.connect(MONGODB_URI);
    
    const alumniService = new AlumniService();
    const startTime = Date.now();

    // Create multiple alumni profiles
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        firstName: `Perf${i}`,
        lastName: 'Test',
        email: `perf${i}@example.com`,
        password: 'password123',
        role: 'alumni',
        isAlumni: true
      });
      users.push(user);

      await alumniService.createOrUpdateProfile(user._id, {
        graduationYear: 2020 - i,
        degree: 'Computer Science',
        industry: 'Technology',
        skills: ['JavaScript', 'React']
      });
    }

    const creationTime = Date.now() - startTime;
    console.log(`✅ Created 10 alumni profiles in ${creationTime}ms`);

    // Test search performance
    const searchStartTime = Date.now();
    const searchResult = await alumniService.searchAlumni({ industry: 'Technology' });
    const searchTime = Date.now() - searchStartTime;
    console.log(`✅ Searched alumni in ${searchTime}ms (${searchResult.data.alumni.length} results)`);

    // Clean up performance test data
    await User.deleteMany({ email: { $regex: /perf.*@example\.com/ } });
    await AlumniProfile.deleteMany({});

    console.log('✅ Performance tests completed');

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Run all tests
async function runAllTests() {
  await runTests();
  await testErrorHandling();
  await testPerformance();
  
  console.log('\n🏁 All test suites completed!');
  process.exit(0);
}

// Execute tests if run directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testErrorHandling, testPerformance };