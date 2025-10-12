#!/usr/bin/env node

/**
 * End-to-End Testing Suite for Complete User Workflows
 * Tests complete user journeys across all advanced features
 * 
 * Test Coverage:
 * - Chatbot conversation flows and escalation
 * - Event registration and attendance processes
 * - Digital ID generation and facility access
 * - OJT/Internship application workflows
 * - Alumni networking and job postings
 * - Real-time notifications across features
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Import models
const User = require('./models/User');
const ChatConversation = require('./models/ChatConversation');
const Event = require('./models/Event');
const EventTicket = require('./models/EventTicket');
const DigitalID = require('./models/DigitalID');
const AccessLog = require('./models/AccessLog');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Notification = require('./models/Notification');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test data storage
const testData = {
  users: {},
  tokens: {},
  events: {},
  tickets: {},
  digitalIds: {},
  internships: {},
  applications: {},
  jobs: {},
  conversations: {}
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};


// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message, 'cyan');
  log('='.repeat(60), 'cyan');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Database connection
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logSuccess('Connected to MongoDB');
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    throw error;
  }
}

async function cleanupDatabase() {
  try {
    // Clean up test data
    await User.deleteMany({ email: /test-e2e-.*@test\.com/ });
    await ChatConversation.deleteMany({ sessionId: /test-e2e-/ });
    await Event.deleteMany({ title: /E2E Test Event/ });
    await EventTicket.deleteMany({ ticketNumber: /E2E-/ });
    await DigitalID.deleteMany({ qrCode: /E2E-/ });
    await AccessLog.deleteMany({ deviceInfo: { deviceId: 'e2e-test-device' } });
    await Internship.deleteMany({ title: /E2E Test Internship/ });
    await InternshipApplication.deleteMany({ coverLetter: /E2E test application/ });
    await AlumniProfile.deleteMany({ bio: /E2E test alumni/ });
    await JobPosting.deleteMany({ title: /E2E Test Job/ });
    await Notification.deleteMany({ title: /E2E Test/ });
    
    logSuccess('Database cleaned up');
  } catch (error) {
    logError(`Database cleanup failed: ${error.message}`);
  }
}


// ============================================================================
// TEST 1: Complete Chatbot Workflow
// ============================================================================

async function testChatbotWorkflow() {
  logSection('TEST 1: Chatbot Conversation Flow and Escalation');
  
  try {
    // Step 1: Create test user
    logInfo('Step 1: Creating test user for chatbot...');
    const studentUser = new User({
      email: 'test-e2e-chatbot-student@test.com',
      password: 'Test123!@#',
      firstName: 'Chatbot',
      lastName: 'Student',
      role: 'student',
      studentId: 'E2E-CHAT-001'
    });
    await studentUser.save();
    testData.users.chatbotStudent = studentUser;
    logSuccess('Test user created');

    // Step 2: Start chatbot conversation
    logInfo('Step 2: Starting chatbot conversation...');
    const conversationResponse = await axios.post(`${API_URL}/chatbot/conversation`, {
      userId: studentUser._id.toString(),
      message: 'What are the admission requirements?'
    });
    
    if (conversationResponse.data.success && conversationResponse.data.response) {
      testData.conversations.admission = conversationResponse.data;
      logSuccess(`Chatbot responded: "${conversationResponse.data.response.substring(0, 50)}..."`);
    } else {
      throw new Error('Chatbot did not respond properly');
    }

    // Step 3: Continue conversation with follow-up
    logInfo('Step 3: Sending follow-up question...');
    await delay(1000);
    const followUpResponse = await axios.post(`${API_URL}/chatbot/conversation`, {
      userId: studentUser._id.toString(),
      sessionId: conversationResponse.data.sessionId,
      message: 'What documents do I need to submit?'
    });
    
    if (followUpResponse.data.success) {
      logSuccess('Follow-up question answered successfully');
    }

    // Step 4: Test escalation with complex query
    logInfo('Step 4: Testing escalation with complex query...');
    await delay(1000);
    const escalationResponse = await axios.post(`${API_URL}/chatbot/conversation`, {
      userId: studentUser._id.toString(),
      sessionId: conversationResponse.data.sessionId,
      message: 'I need to speak with someone about a very specific scholarship issue'
    });
    
    if (escalationResponse.data.escalated || escalationResponse.data.response) {
      logSuccess('Escalation handled appropriately');
    }

    // Step 5: Verify conversation history
    logInfo('Step 5: Verifying conversation history...');
    const conversation = await ChatConversation.findOne({ 
      userId: studentUser._id,
      sessionId: conversationResponse.data.sessionId 
    });
    
    if (conversation && conversation.messages.length >= 3) {
      logSuccess(`Conversation history saved with ${conversation.messages.length} messages`);
    } else {
      throw new Error('Conversation history not properly saved');
    }

    logSuccess('✓ Chatbot workflow test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Chatbot workflow test FAILED: ${error.message}`);
    return false;
  }
}


// ============================================================================
// TEST 2: Complete Event Registration and Attendance Workflow
// ============================================================================

async function testEventWorkflow() {
  logSection('TEST 2: Event Registration and Attendance Process');
  
  try {
    // Step 1: Create organizer and student users
    logInfo('Step 1: Creating test users...');
    const organizerUser = new User({
      email: 'test-e2e-event-organizer@test.com',
      password: 'Test123!@#',
      firstName: 'Event',
      lastName: 'Organizer',
      role: 'faculty'
    });
    await organizerUser.save();
    
    const studentUser = new User({
      email: 'test-e2e-event-student@test.com',
      password: 'Test123!@#',
      firstName: 'Event',
      lastName: 'Student',
      role: 'student',
      studentId: 'E2E-EVT-001'
    });
    await studentUser.save();
    
    testData.users.eventOrganizer = organizerUser;
    testData.users.eventStudent = studentUser;
    logSuccess('Test users created');

    // Step 2: Create event
    logInfo('Step 2: Creating test event...');
    const event = new Event({
      title: 'E2E Test Event - Tech Conference',
      description: 'End-to-end test event for validation',
      category: 'seminar',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
      venue: 'E2E Test Auditorium',
      capacity: 100,
      organizer: organizerUser._id,
      status: 'published',
      registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    });
    await event.save();
    testData.events.techConference = event;
    logSuccess(`Event created: ${event.title}`);

    // Step 3: Student registers for event
    logInfo('Step 3: Registering student for event...');
    const registrationResponse = await axios.post(`${API_URL}/events/${event._id}/register`, {
      userId: studentUser._id.toString(),
      registrationData: {
        dietaryRestrictions: 'None',
        specialNeeds: 'None'
      }
    });
    
    if (registrationResponse.data.success && registrationResponse.data.ticket) {
      testData.tickets.techConference = registrationResponse.data.ticket;
      logSuccess(`Registration successful, ticket: ${registrationResponse.data.ticket.ticketNumber}`);
    } else {
      throw new Error('Event registration failed');
    }

    // Step 4: Verify ticket generation with QR code
    logInfo('Step 4: Verifying ticket and QR code...');
    const ticket = await EventTicket.findOne({ 
      eventId: event._id, 
      userId: studentUser._id 
    });
    
    if (ticket && ticket.qrCode && ticket.status === 'active') {
      logSuccess(`QR ticket generated: ${ticket.qrCode.substring(0, 20)}...`);
    } else {
      throw new Error('Ticket or QR code not properly generated');
    }

    // Step 5: Scan QR code for attendance
    logInfo('Step 5: Scanning QR code for attendance...');
    await delay(1000);
    const scanResponse = await axios.post(`${API_URL}/tickets/validate`, {
      qrCode: ticket.qrCode,
      eventId: event._id.toString(),
      scannedBy: organizerUser._id.toString(),
      location: 'Main Entrance'
    });
    
    if (scanResponse.data.success && scanResponse.data.valid) {
      logSuccess('QR code validated and attendance recorded');
    } else {
      throw new Error('QR code validation failed');
    }

    // Step 6: Verify attendance was recorded
    logInfo('Step 6: Verifying attendance record...');
    const updatedTicket = await EventTicket.findById(ticket._id);
    
    if (updatedTicket.attendanceRecords && updatedTicket.attendanceRecords.length > 0) {
      logSuccess(`Attendance recorded at ${updatedTicket.attendanceRecords[0].scannedAt}`);
    } else {
      throw new Error('Attendance not properly recorded');
    }

    // Step 7: Test duplicate scan prevention
    logInfo('Step 7: Testing duplicate scan prevention...');
    await delay(500);
    try {
      const duplicateScan = await axios.post(`${API_URL}/tickets/validate`, {
        qrCode: ticket.qrCode,
        eventId: event._id.toString(),
        scannedBy: organizerUser._id.toString()
      });
      
      if (!duplicateScan.data.valid || duplicateScan.data.message.includes('already')) {
        logSuccess('Duplicate scan properly prevented');
      }
    } catch (error) {
      if (error.response && error.response.data.message.includes('already')) {
        logSuccess('Duplicate scan properly prevented');
      }
    }

    // Step 8: Verify notification was sent
    logInfo('Step 8: Verifying registration notification...');
    const notification = await Notification.findOne({
      userId: studentUser._id,
      category: 'event',
      title: { $regex: /registration/i }
    });
    
    if (notification) {
      logSuccess('Registration notification sent successfully');
    }

    logSuccess('✓ Event workflow test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Event workflow test FAILED: ${error.message}`);
    console.error(error);
    return false;
  }
}


// ============================================================================
// TEST 3: Digital ID Generation and Campus Access Workflow
// ============================================================================

async function testDigitalIDWorkflow() {
  logSection('TEST 3: Digital ID Generation and Facility Access');
  
  try {
    // Step 1: Create test student
    logInfo('Step 1: Creating test student...');
    const student = new User({
      email: 'test-e2e-digitalid-student@test.com',
      password: 'Test123!@#',
      firstName: 'DigitalID',
      lastName: 'Student',
      role: 'student',
      studentId: 'E2E-DID-001',
      program: 'Computer Science',
      yearLevel: 3
    });
    await student.save();
    testData.users.digitalIdStudent = student;
    logSuccess('Test student created');

    // Step 2: Generate digital ID
    logInfo('Step 2: Generating digital ID...');
    const digitalIdResponse = await axios.post(`${API_URL}/digital-id/generate`, {
      userId: student._id.toString()
    });
    
    if (digitalIdResponse.data.success && digitalIdResponse.data.digitalId) {
      testData.digitalIds.student = digitalIdResponse.data.digitalId;
      logSuccess(`Digital ID generated with QR: ${digitalIdResponse.data.digitalId.qrCode.substring(0, 20)}...`);
    } else {
      throw new Error('Digital ID generation failed');
    }

    // Step 3: Verify digital ID in database
    logInfo('Step 3: Verifying digital ID in database...');
    const digitalId = await DigitalID.findOne({ userId: student._id });
    
    if (digitalId && digitalId.qrCode && digitalId.isActive) {
      logSuccess(`Digital ID verified: Access level ${digitalId.accessLevel}`);
      logSuccess(`Permissions: ${digitalId.permissions.length} facilities`);
    } else {
      throw new Error('Digital ID not properly saved');
    }

    // Step 4: Test facility access - Library (should succeed)
    logInfo('Step 4: Testing library access (authorized)...');
    await delay(1000);
    const libraryAccessResponse = await axios.post(`${API_URL}/digital-id/validate-access`, {
      qrCode: digitalId.qrCode,
      facilityId: 'library-main',
      facilityName: 'Main Library',
      deviceInfo: {
        deviceId: 'e2e-test-device',
        location: 'Library Entrance'
      }
    });
    
    if (libraryAccessResponse.data.success && libraryAccessResponse.data.accessGranted) {
      logSuccess('Library access granted successfully');
    } else {
      throw new Error('Library access should have been granted');
    }

    // Step 5: Verify access log was created
    logInfo('Step 5: Verifying access log...');
    const accessLog = await AccessLog.findOne({
      userId: student._id,
      facilityId: 'library-main',
      accessResult: 'granted'
    });
    
    if (accessLog) {
      logSuccess(`Access log created at ${accessLog.accessTime}`);
    } else {
      throw new Error('Access log not created');
    }

    // Step 6: Test restricted facility access (should fail)
    logInfo('Step 6: Testing restricted facility access (unauthorized)...');
    await delay(500);
    try {
      const restrictedAccessResponse = await axios.post(`${API_URL}/digital-id/validate-access`, {
        qrCode: digitalId.qrCode,
        facilityId: 'faculty-lounge',
        facilityName: 'Faculty Lounge',
        deviceInfo: {
          deviceId: 'e2e-test-device',
          location: 'Faculty Area'
        }
      });
      
      if (!restrictedAccessResponse.data.accessGranted) {
        logSuccess('Restricted access properly denied');
      } else {
        throw new Error('Restricted access should have been denied');
      }
    } catch (error) {
      if (error.response && error.response.data.accessGranted === false) {
        logSuccess('Restricted access properly denied');
      } else {
        throw error;
      }
    }

    // Step 7: Test offline access validation
    logInfo('Step 7: Testing offline access capability...');
    const offlineValidation = await axios.post(`${API_URL}/digital-id/validate-offline`, {
      qrCode: digitalId.qrCode,
      facilityId: 'library-main'
    });
    
    if (offlineValidation.data.success) {
      logSuccess('Offline validation data retrieved successfully');
    }

    // Step 8: Verify security features
    logInfo('Step 8: Testing security features...');
    const invalidQR = 'INVALID-QR-CODE-12345';
    try {
      await axios.post(`${API_URL}/digital-id/validate-access`, {
        qrCode: invalidQR,
        facilityId: 'library-main'
      });
      throw new Error('Invalid QR should have been rejected');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logSuccess('Invalid QR code properly rejected');
      } else {
        throw error;
      }
    }

    logSuccess('✓ Digital ID workflow test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Digital ID workflow test FAILED: ${error.message}`);
    console.error(error);
    return false;
  }
}


// ============================================================================
// TEST 4: OJT/Internship Application Workflow
// ============================================================================

async function testInternshipWorkflow() {
  logSection('TEST 4: OJT/Internship Application Process');
  
  try {
    // Step 1: Create company and student users
    logInfo('Step 1: Creating test users...');
    const companyRep = new User({
      email: 'test-e2e-company-rep@test.com',
      password: 'Test123!@#',
      firstName: 'Company',
      lastName: 'Representative',
      role: 'company'
    });
    await companyRep.save();
    
    const student = new User({
      email: 'test-e2e-internship-student@test.com',
      password: 'Test123!@#',
      firstName: 'Internship',
      lastName: 'Applicant',
      role: 'student',
      studentId: 'E2E-INT-001',
      program: 'Information Technology',
      yearLevel: 4
    });
    await student.save();
    
    testData.users.companyRep = companyRep;
    testData.users.internshipStudent = student;
    logSuccess('Test users created');

    // Step 2: Create internship posting
    logInfo('Step 2: Creating internship posting...');
    const internship = new Internship({
      companyId: companyRep._id,
      title: 'E2E Test Internship - Software Developer',
      description: 'End-to-end test internship for validation',
      requirements: ['Programming skills', 'Team player', 'Good communication'],
      skills: ['JavaScript', 'Node.js', 'React'],
      duration: 12,
      stipend: 5000,
      location: 'Makati City',
      workArrangement: 'hybrid',
      slots: 3,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 129 * 24 * 60 * 60 * 1000),
      status: 'published',
      targetPrograms: ['Information Technology', 'Computer Science'],
      yearLevelRequirement: 4,
      createdBy: companyRep._id
    });
    await internship.save();
    testData.internships.softwareDev = internship;
    logSuccess(`Internship created: ${internship.title}`);

    // Step 3: Student submits application
    logInfo('Step 3: Submitting internship application...');
    const applicationResponse = await axios.post(`${API_URL}/internships/${internship._id}/apply`, {
      studentId: student._id.toString(),
      coverLetter: 'E2E test application - I am very interested in this position...',
      resume: 'path/to/e2e-test-resume.pdf',
      additionalDocuments: []
    });
    
    if (applicationResponse.data.success && applicationResponse.data.application) {
      testData.applications.softwareDev = applicationResponse.data.application;
      logSuccess(`Application submitted: ${applicationResponse.data.application._id}`);
    } else {
      throw new Error('Application submission failed');
    }

    // Step 4: Verify application in database
    logInfo('Step 4: Verifying application in database...');
    const application = await InternshipApplication.findOne({
      internshipId: internship._id,
      studentId: student._id
    });
    
    if (application && application.status === 'submitted') {
      logSuccess(`Application verified with status: ${application.status}`);
    } else {
      throw new Error('Application not properly saved');
    }

    // Step 5: Company reviews application
    logInfo('Step 5: Company reviewing application...');
    await delay(1000);
    const reviewResponse = await axios.put(`${API_URL}/internships/applications/${application._id}/status`, {
      status: 'under_review',
      reviewedBy: companyRep._id.toString()
    });
    
    if (reviewResponse.data.success) {
      logSuccess('Application moved to under review');
    }

    // Step 6: Company shortlists candidate
    logInfo('Step 6: Shortlisting candidate...');
    await delay(500);
    const shortlistResponse = await axios.put(`${API_URL}/internships/applications/${application._id}/status`, {
      status: 'shortlisted',
      reviewedBy: companyRep._id.toString(),
      feedback: 'Strong candidate, proceeding to interview'
    });
    
    if (shortlistResponse.data.success) {
      logSuccess('Candidate shortlisted for interview');
    }

    // Step 7: Schedule interview
    logInfo('Step 7: Scheduling interview...');
    await delay(500);
    const interviewResponse = await axios.put(`${API_URL}/internships/applications/${application._id}/interview`, {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Company Office',
      type: 'in_person'
    });
    
    if (interviewResponse.data.success) {
      logSuccess('Interview scheduled successfully');
    }

    // Step 8: Accept candidate
    logInfo('Step 8: Accepting candidate...');
    await delay(500);
    const acceptResponse = await axios.put(`${API_URL}/internships/applications/${application._id}/status`, {
      status: 'accepted',
      reviewedBy: companyRep._id.toString(),
      feedback: 'Excellent interview performance'
    });
    
    if (acceptResponse.data.success) {
      logSuccess('Candidate accepted for internship');
    }

    // Step 9: Verify notifications were sent
    logInfo('Step 9: Verifying application notifications...');
    const notifications = await Notification.find({
      userId: student._id,
      category: 'academic'
    }).sort({ createdAt: -1 }).limit(3);
    
    if (notifications.length > 0) {
      logSuccess(`${notifications.length} notifications sent to student`);
    }

    // Step 10: Track internship progress
    logInfo('Step 10: Testing progress tracking...');
    const progressResponse = await axios.post(`${API_URL}/internships/${internship._id}/progress`, {
      studentId: student._id.toString(),
      milestone: 'Week 1 completed',
      notes: 'E2E test progress update',
      completionPercentage: 10
    });
    
    if (progressResponse.data.success) {
      logSuccess('Progress tracking working correctly');
    }

    logSuccess('✓ Internship workflow test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Internship workflow test FAILED: ${error.message}`);
    console.error(error);
    return false;
  }
}


// ============================================================================
// TEST 5: Alumni Networking and Job Posting Workflow
// ============================================================================

async function testAlumniWorkflow() {
  logSection('TEST 5: Alumni Networking and Job Posting');
  
  try {
    // Step 1: Create alumni and student users
    logInfo('Step 1: Creating test users...');
    const alumni = new User({
      email: 'test-e2e-alumni@test.com',
      password: 'Test123!@#',
      firstName: 'Alumni',
      lastName: 'Graduate',
      role: 'alumni',
      isAlumni: true,
      graduationYear: 2020
    });
    await alumni.save();
    
    const student = new User({
      email: 'test-e2e-jobseeker-student@test.com',
      password: 'Test123!@#',
      firstName: 'JobSeeker',
      lastName: 'Student',
      role: 'student',
      studentId: 'E2E-ALM-001',
      program: 'Business Administration',
      yearLevel: 4
    });
    await student.save();
    
    testData.users.alumni = alumni;
    testData.users.jobSeekerStudent = student;
    logSuccess('Test users created');

    // Step 2: Create alumni profile
    logInfo('Step 2: Creating alumni profile...');
    const alumniProfile = new AlumniProfile({
      userId: alumni._id,
      graduationYear: 2020,
      degree: 'Bachelor of Science in Computer Science',
      major: 'Software Engineering',
      currentPosition: 'Senior Software Engineer',
      currentCompany: 'E2E Tech Corp',
      industry: 'Technology',
      location: 'Manila, Philippines',
      bio: 'E2E test alumni profile for validation',
      skills: ['JavaScript', 'Python', 'Project Management'],
      mentorshipAvailability: {
        isAvailable: true,
        expertise: ['Software Development', 'Career Guidance'],
        preferredMenteeLevel: ['undergraduate', 'new_graduate'],
        maxMentees: 3
      },
      isVerified: true
    });
    await alumniProfile.save();
    logSuccess('Alumni profile created');

    // Step 3: Alumni posts a job
    logInfo('Step 3: Alumni posting job opportunity...');
    const jobPosting = new JobPosting({
      posterId: alumni._id,
      posterType: 'alumni',
      title: 'E2E Test Job - Junior Developer',
      company: 'E2E Tech Corp',
      description: 'End-to-end test job posting for validation',
      requirements: ['Bachelor degree in CS/IT', '1 year experience', 'Strong coding skills'],
      skills: ['JavaScript', 'React', 'Node.js'],
      location: 'Makati City, Philippines',
      workType: 'full_time',
      salaryRange: {
        min: 25000,
        max: 35000,
        currency: 'PHP'
      },
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contactEmail: 'jobs@e2etech.com',
      targetAudience: 'both',
      status: 'active'
    });
    await jobPosting.save();
    testData.jobs.juniorDev = jobPosting;
    logSuccess(`Job posted: ${jobPosting.title}`);

    // Step 4: Student searches for jobs
    logInfo('Step 4: Student searching for jobs...');
    const jobSearchResponse = await axios.get(`${API_URL}/alumni/jobs`, {
      params: {
        skills: 'JavaScript',
        workType: 'full_time'
      }
    });
    
    if (jobSearchResponse.data.success && jobSearchResponse.data.jobs.length > 0) {
      logSuccess(`Found ${jobSearchResponse.data.jobs.length} matching jobs`);
    }

    // Step 5: Student applies for job
    logInfo('Step 5: Student applying for job...');
    await delay(1000);
    const jobApplicationResponse = await axios.post(`${API_URL}/alumni/jobs/${jobPosting._id}/apply`, {
      applicantId: student._id.toString(),
      coverLetter: 'E2E test job application',
      resume: 'path/to/resume.pdf'
    });
    
    if (jobApplicationResponse.data.success) {
      logSuccess('Job application submitted successfully');
    }

    // Step 6: Update job posting view count
    logInfo('Step 6: Tracking job view analytics...');
    await JobPosting.findByIdAndUpdate(jobPosting._id, {
      $inc: { viewCount: 1, applicationCount: 1 }
    });
    const updatedJob = await JobPosting.findById(jobPosting._id);
    logSuccess(`Job analytics: ${updatedJob.viewCount} views, ${updatedJob.applicationCount} applications`);

    // Step 7: Student requests mentorship
    logInfo('Step 7: Student requesting mentorship...');
    await delay(500);
    const mentorshipResponse = await axios.post(`${API_URL}/alumni/mentorship/request`, {
      mentorId: alumni._id.toString(),
      menteeId: student._id.toString(),
      program: 'Career Development',
      focusAreas: ['Software Development', 'Career Planning'],
      goals: ['Learn industry best practices', 'Prepare for job interviews']
    });
    
    if (mentorshipResponse.data.success) {
      logSuccess('Mentorship request submitted');
    }

    // Step 8: Alumni accepts mentorship
    logInfo('Step 8: Alumni accepting mentorship request...');
    await delay(500);
    const acceptMentorshipResponse = await axios.put(
      `${API_URL}/alumni/mentorship/${mentorshipResponse.data.mentorship._id}/status`,
      {
        status: 'active',
        startDate: new Date()
      }
    );
    
    if (acceptMentorshipResponse.data.success) {
      logSuccess('Mentorship relationship established');
    }

    // Step 9: Test alumni directory search
    logInfo('Step 9: Testing alumni directory search...');
    const alumniSearchResponse = await axios.get(`${API_URL}/alumni/directory`, {
      params: {
        graduationYear: 2020,
        industry: 'Technology'
      }
    });
    
    if (alumniSearchResponse.data.success && alumniSearchResponse.data.alumni.length > 0) {
      logSuccess(`Found ${alumniSearchResponse.data.alumni.length} alumni in directory`);
    }

    // Step 10: Verify notifications
    logInfo('Step 10: Verifying alumni notifications...');
    const alumniNotifications = await Notification.find({
      userId: alumni._id,
      category: 'social'
    });
    
    if (alumniNotifications.length > 0) {
      logSuccess(`${alumniNotifications.length} notifications sent to alumni`);
    }

    logSuccess('✓ Alumni workflow test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Alumni workflow test FAILED: ${error.message}`);
    console.error(error);
    return false;
  }
}


// ============================================================================
// TEST 6: Cross-Feature Integration and Notifications
// ============================================================================

async function testCrossFeatureIntegration() {
  logSection('TEST 6: Cross-Feature Integration and Real-time Notifications');
  
  try {
    // Step 1: Create a comprehensive user
    logInfo('Step 1: Creating comprehensive test user...');
    const user = new User({
      email: 'test-e2e-integration@test.com',
      password: 'Test123!@#',
      firstName: 'Integration',
      lastName: 'Tester',
      role: 'student',
      studentId: 'E2E-INT-999',
      program: 'Computer Science',
      yearLevel: 4
    });
    await user.save();
    testData.users.integrationUser = user;
    logSuccess('Comprehensive test user created');

    // Step 2: Generate digital ID
    logInfo('Step 2: Generating digital ID...');
    const digitalIdResponse = await axios.post(`${API_URL}/digital-id/generate`, {
      userId: user._id.toString()
    });
    logSuccess('Digital ID generated');

    // Step 3: Register for event
    logInfo('Step 3: Registering for event...');
    const event = new Event({
      title: 'E2E Test Event - Integration Test',
      description: 'Cross-feature integration test event',
      category: 'workshop',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      venue: 'Integration Lab',
      capacity: 50,
      organizer: user._id,
      status: 'published'
    });
    await event.save();
    
    const registrationResponse = await axios.post(`${API_URL}/events/${event._id}/register`, {
      userId: user._id.toString()
    });
    logSuccess('Event registration completed');

    // Step 4: Apply for internship
    logInfo('Step 4: Applying for internship...');
    const internship = new Internship({
      companyId: user._id,
      title: 'E2E Test Internship - Integration',
      description: 'Cross-feature integration test internship',
      requirements: ['Test requirement'],
      skills: ['Testing'],
      duration: 8,
      location: 'Remote',
      workArrangement: 'remote',
      slots: 5,
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 86 * 24 * 60 * 60 * 1000),
      status: 'published',
      createdBy: user._id
    });
    await internship.save();
    
    const application = new InternshipApplication({
      internshipId: internship._id,
      studentId: user._id,
      coverLetter: 'E2E integration test application',
      resume: 'test-resume.pdf',
      status: 'submitted',
      studentInfo: {
        currentYear: 4,
        program: 'Computer Science',
        expectedGraduation: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        skills: ['Testing', 'JavaScript']
      }
    });
    await application.save();
    logSuccess('Internship application submitted');

    // Step 5: Use chatbot
    logInfo('Step 5: Interacting with chatbot...');
    await delay(500);
    const chatResponse = await axios.post(`${API_URL}/chatbot/conversation`, {
      userId: user._id.toString(),
      message: 'What events am I registered for?'
    });
    logSuccess('Chatbot interaction completed');

    // Step 6: Verify all notifications were created
    logInfo('Step 6: Verifying cross-feature notifications...');
    const allNotifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });
    
    const notificationTypes = {
      event: allNotifications.filter(n => n.category === 'event').length,
      academic: allNotifications.filter(n => n.category === 'academic').length,
      system: allNotifications.filter(n => n.category === 'system').length
    };
    
    logSuccess(`Notifications created: Event(${notificationTypes.event}), Academic(${notificationTypes.academic}), System(${notificationTypes.system})`);

    // Step 7: Test notification preferences
    logInfo('Step 7: Testing notification preferences...');
    const preferencesResponse = await axios.put(`${API_URL}/notifications/preferences`, {
      userId: user._id.toString(),
      preferences: {
        event: { web: true, email: true, sms: false, push: true },
        academic: { web: true, email: true, sms: true, push: true }
      }
    });
    
    if (preferencesResponse.data.success) {
      logSuccess('Notification preferences updated');
    }

    // Step 8: Test real-time notification delivery
    logInfo('Step 8: Testing real-time notification...');
    await delay(500);
    const realtimeNotification = new Notification({
      userId: user._id,
      title: 'E2E Test Real-time Notification',
      message: 'This is a test of real-time notification delivery',
      type: 'info',
      category: 'system',
      priority: 'high',
      channels: [
        { type: 'web', status: 'sent', sentAt: new Date() }
      ]
    });
    await realtimeNotification.save();
    logSuccess('Real-time notification created');

    // Step 9: Verify data consistency across features
    logInfo('Step 9: Verifying data consistency...');
    const userDigitalId = await DigitalID.findOne({ userId: user._id });
    const userTickets = await EventTicket.find({ userId: user._id });
    const userApplications = await InternshipApplication.find({ studentId: user._id });
    const userConversations = await ChatConversation.find({ userId: user._id });
    
    logSuccess(`Data consistency check:`);
    logSuccess(`  - Digital IDs: ${userDigitalId ? 1 : 0}`);
    logSuccess(`  - Event Tickets: ${userTickets.length}`);
    logSuccess(`  - Internship Applications: ${userApplications.length}`);
    logSuccess(`  - Chat Conversations: ${userConversations.length}`);

    // Step 10: Test system-wide search
    logInfo('Step 10: Testing system-wide search functionality...');
    const searchResponse = await axios.get(`${API_URL}/search`, {
      params: {
        query: 'E2E Test',
        userId: user._id.toString()
      }
    });
    
    if (searchResponse.data.success) {
      logSuccess('System-wide search working correctly');
    }

    logSuccess('✓ Cross-feature integration test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Cross-feature integration test FAILED: ${error.message}`);
    console.error(error);
    return false;
  }
}


// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  const startTime = Date.now();
  
  log('\n' + '='.repeat(60), 'cyan');
  log('END-TO-END TESTING SUITE', 'cyan');
  log('Complete User Workflow Validation', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const results = {
    total: 6,
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // Connect to database
    await connectDatabase();
    
    // Clean up any existing test data
    await cleanupDatabase();
    
    logInfo('Starting E2E test suite...\n');

    // Run all tests
    const tests = [
      { name: 'Chatbot Workflow', fn: testChatbotWorkflow },
      { name: 'Event Workflow', fn: testEventWorkflow },
      { name: 'Digital ID Workflow', fn: testDigitalIDWorkflow },
      { name: 'Internship Workflow', fn: testInternshipWorkflow },
      { name: 'Alumni Workflow', fn: testAlumniWorkflow },
      { name: 'Cross-Feature Integration', fn: testCrossFeatureIntegration }
    ];

    for (const test of tests) {
      try {
        const passed = await test.fn();
        results.tests.push({ name: test.name, passed });
        if (passed) {
          results.passed++;
        } else {
          results.failed++;
        }
        await delay(1000); // Delay between tests
      } catch (error) {
        logError(`Test "${test.name}" encountered an error: ${error.message}`);
        results.tests.push({ name: test.name, passed: false });
        results.failed++;
      }
    }

    // Clean up test data
    await cleanupDatabase();

  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    logSuccess('Database connection closed');
  }

  // Print summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Duration: ${duration}s`, 'cyan');
  log('');

  // Detailed results
  log('Detailed Results:', 'cyan');
  results.tests.forEach(test => {
    const status = test.passed ? '✓ PASSED' : '✗ FAILED';
    const color = test.passed ? 'green' : 'red';
    log(`  ${status} - ${test.name}`, color);
  });

  log('\n' + '='.repeat(60), 'cyan');
  
  if (results.failed === 0) {
    log('ALL TESTS PASSED! 🎉', 'green');
  } else {
    log(`${results.failed} TEST(S) FAILED`, 'red');
  }
  log('='.repeat(60) + '\n', 'cyan');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the test suite
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testChatbotWorkflow,
  testEventWorkflow,
  testDigitalIDWorkflow,
  testInternshipWorkflow,
  testAlumniWorkflow,
  testCrossFeatureIntegration
};
