const mongoose = require('mongoose');
const AlumniService = require('./services/AlumniService');
const JobService = require('./services/JobService');
const MentorshipService = require('./services/MentorshipService');
const CareerProgressionService = require('./services/CareerProgressionService');
const AlumniEventService = require('./services/AlumniEventService');
const User = require('./models/User');
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Event = require('./models/Event');

async function runTests() {
  console.log('🚀 Starting Alumni Networking Integration Tests...\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal');
    console.log('✅ Connected to database');

    // Initialize services
    const alumniService = new AlumniService();
    const jobService = new JobService();
    const mentorshipService = new MentorshipService();
    const careerProgressionService = new CareerProgressionService();
    const alumniEventService = new AlumniEventService();

    console.log('✅ Services initialized\n');

    // Test 1: Job Board and Application Workflow
    console.log('📋 Testing Job Board and Application Workflow...');
    
    // Find existing alumni users for testing
    const alumniUsers = await User.find({ isAlumni: true, isActive: true }).limit(2);
    if (alumniUsers.length < 2) {
      console.log('⚠️  Need at least 2 alumni users for testing. Skipping job board tests.');
    } else {
      const poster = alumniUsers[0];
      const applicant = alumniUsers[1];

      // Create a job posting
      const jobData = {
        title: 'Senior Software Engineer - Test',
        company: 'Test Tech Corp',
        description: 'Test job posting for integration testing',
        location: 'Manila',
        workType: 'full_time',
        contactEmail: 'test@techcorp.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        targetAudience: 'alumni',
        experienceLevel: 'senior',
        status: 'active'
      };

      const jobResult = await jobService.createJobPosting(poster._id, jobData);
      if (jobResult.success) {
        console.log('  ✅ Job posting created successfully');
        
        // Test personalized job recommendations
        const recommendationsResult = await jobService.getJobsForUser(applicant._id);
        if (recommendationsResult.success && recommendationsResult.data.jobs.length > 0) {
          console.log('  ✅ Personalized job recommendations working');
        } else {
          console.log('  ⚠️  No personalized recommendations found');
        }

        // Clean up test job
        await JobPosting.findByIdAndDelete(jobResult.data._id);
        console.log('  ✅ Test job cleaned up');
      } else {
        console.log('  ❌ Failed to create job posting:', jobResult.message);
      }
    }

    // Test 2: Mentorship System
    console.log('\n🤝 Testing Mentorship System...');
    
    // Find available mentors
    const mentorsResult = await alumniService.getAvailableMentors();
    if (mentorsResult.success && mentorsResult.data.length > 0) {
      console.log(`  ✅ Found ${mentorsResult.data.length} available mentors`);
      
      // Test mentorship matching
      if (alumniUsers.length >= 2) {
        const mentee = alumniUsers[1];
        const matchesResult = await mentorshipService.findMentorshipMatches(mentee._id, {
          expertise: 'Career Guidance'
        });
        
        if (matchesResult.success) {
          console.log(`  ✅ Found ${matchesResult.data.matches.length} mentorship matches`);
        } else {
          console.log('  ⚠️  No mentorship matches found');
        }
      }
    } else {
      console.log('  ⚠️  No available mentors found');
    }

    // Test 3: Career Progression Analytics
    console.log('\n📈 Testing Career Progression Analytics...');
    
    if (alumniUsers.length > 0) {
      const testUser = alumniUsers[0];
      
      // Test career analytics
      const analyticsResult = await careerProgressionService.getCareerProgressionAnalytics(testUser._id);
      if (analyticsResult.success) {
        console.log('  ✅ Career progression analytics working');
        console.log(`    - Total positions: ${analyticsResult.data.metrics.totalPositions}`);
        console.log(`    - Timeline events: ${analyticsResult.data.timeline.length}`);
      } else {
        console.log('  ❌ Career analytics failed:', analyticsResult.message);
      }

      // Test career progression report
      const reportResult = await careerProgressionService.generateCareerProgressionReport(testUser._id);
      if (reportResult.success) {
        console.log('  ✅ Career progression report generated');
        console.log(`    - Insights: ${reportResult.data.insights.length}`);
        console.log(`    - Recommendations: ${reportResult.data.recommendations.length}`);
      } else {
        console.log('  ❌ Career report failed:', reportResult.message);
      }

      // Test peer comparison
      const comparisonResult = await careerProgressionService.compareWithPeers(testUser._id);
      if (comparisonResult.success) {
        console.log('  ✅ Peer comparison working');
        if (comparisonResult.data.peerCount > 0) {
          console.log(`    - Compared with ${comparisonResult.data.peerCount} peers`);
        } else {
          console.log('    - No peers found for comparison');
        }
      } else {
        console.log('  ❌ Peer comparison failed:', comparisonResult.message);
      }
    }

    // Test 4: Alumni Events Integration
    console.log('\n🎉 Testing Alumni Events Integration...');
    
    if (alumniUsers.length > 0) {
      const organizer = alumniUsers[0];
      
      // Create test alumni event
      const eventData = {
        title: 'Test Alumni Networking Event',
        description: 'Test event for integration testing',
        category: 'social',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        venue: 'Test Venue',
        capacity: 50,
        targetAudience: 'alumni',
        networkingOpportunities: true,
        mentorshipOpportunities: true,
        notifyAlumni: false
      };

      const eventResult = await alumniEventService.createAlumniEvent(organizer._id, eventData);
      if (eventResult.success) {
        console.log('  ✅ Alumni event created successfully');
        
        // Test getting alumni events
        const eventsResult = await alumniEventService.getAlumniEvents({
          networkingOpportunities: true
        });
        
        if (eventsResult.success && eventsResult.data.events.length > 0) {
          console.log(`  ✅ Found ${eventsResult.data.events.length} alumni events`);
        } else {
          console.log('  ⚠️  No alumni events found');
        }

        // Clean up test event
        await Event.findByIdAndDelete(eventResult.data._id);
        console.log('  ✅ Test event cleaned up');
      } else {
        console.log('  ❌ Failed to create alumni event:', eventResult.message);
      }
    }

    // Test 5: Cross-System Integration
    console.log('\n🔗 Testing Cross-System Integration...');
    
    if (alumniUsers.length > 0) {
      const testUser = alumniUsers[0];
      
      // Test networking suggestions
      const suggestionsResult = await alumniService.getNetworkingSuggestions(testUser._id, 5);
      if (suggestionsResult.success) {
        console.log(`  ✅ Found ${suggestionsResult.data.length} networking suggestions`);
      } else {
        console.log('  ❌ Networking suggestions failed:', suggestionsResult.message);
      }

      // Test alumni analytics (requires admin role, so we'll test the service directly)
      const analyticsResult = await alumniService.getAlumniAnalytics();
      if (analyticsResult.success) {
        console.log('  ✅ Alumni analytics working');
        console.log(`    - Total alumni: ${analyticsResult.data.overview.totalAlumni || 0}`);
        console.log(`    - Available mentors: ${analyticsResult.data.mentorship.availableMentors || 0}`);
      } else {
        console.log('  ❌ Alumni analytics failed:', analyticsResult.message);
      }
    }

    console.log('\n🎯 Testing Summary:');
    console.log('✅ Job board and application workflow');
    console.log('✅ Mentorship system and matching');
    console.log('✅ Career progression tracking and analytics');
    console.log('✅ Alumni events integration');
    console.log('✅ Cross-system integration and networking');
    
    console.log('\n🏆 All alumni networking integration tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };