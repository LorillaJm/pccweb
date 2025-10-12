const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const testCredentials = {
  student: { email: 'student@pcc.edu.ph', password: 'password123' },
  admin: { email: 'admin@pcc.edu.ph', password: 'admin123' }
};

let tokens = {};

async function login(userType) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testCredentials[userType]);
    if (response.data.success) {
      tokens[userType] = response.data.data.tokens.accessToken;
      console.log(`✅ ${userType} login successful`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${userType} login failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testChatbot() {
  console.log('\n🤖 Testing AI Chatbot...');
  
  try {
    // Test FAQ categories
    const categoriesResponse = await axios.get(`${BASE_URL}/advanced/chatbot/categories`);
    console.log(`✅ FAQ categories fetched: ${categoriesResponse.data.length} categories`);

    // Test chatbot ask
    const askResponse = await axios.post(`${BASE_URL}/advanced/chatbot/ask`, {
      message: 'How do I enroll in subjects?',
      sessionId: 'test-session-123'
    }, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    
    console.log(`✅ Chatbot response: ${askResponse.data.response.substring(0, 50)}...`);
    console.log(`   Intent: ${askResponse.data.intent}, Confidence: ${askResponse.data.confidence}`);

    // Test chat history
    const historyResponse = await axios.get(`${BASE_URL}/advanced/chatbot/history?limit=10`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Chat history fetched: ${historyResponse.data.length} messages`);

  } catch (error) {
    console.log('❌ Chatbot test failed:', error.response?.data?.message || error.message);
  }
}

async function testEvents() {
  console.log('\n🎫 Testing Event Ticketing System...');
  
  try {
    // Test get events
    const eventsResponse = await axios.get(`${BASE_URL}/advanced/events`);
    console.log(`✅ Events fetched: ${eventsResponse.data.length} events`);

    if (eventsResponse.data.length > 0) {
      const eventId = eventsResponse.data[0].id;
      
      // Test event details
      const eventDetailsResponse = await axios.get(`${BASE_URL}/advanced/events/${eventId}`);
      console.log(`✅ Event details fetched: ${eventDetailsResponse.data.title}`);

      // Test event registration
      try {
        const registerResponse = await axios.post(`${BASE_URL}/advanced/events/${eventId}/register`, {
          specialRequirements: 'Test registration'
        }, {
          headers: { Authorization: `Bearer ${tokens.student}` }
        });
        console.log(`✅ Event registration successful: ${registerResponse.data.message}`);
      } catch (regError) {
        if (regError.response?.status === 400) {
          console.log(`ℹ️ Event registration: ${regError.response.data.error}`);
        } else {
          throw regError;
        }
      }

      // Test get user tickets
      const ticketsResponse = await axios.get(`${BASE_URL}/advanced/events/my-tickets`, {
        headers: { Authorization: `Bearer ${tokens.student}` }
      });
      console.log(`✅ User tickets fetched: ${ticketsResponse.data.length} tickets`);
    }

  } catch (error) {
    console.log('❌ Events test failed:', error.response?.data?.message || error.message);
  }
}

async function testDigitalId() {
  console.log('\n🆔 Testing Digital ID System...');
  
  try {
    // Test get digital ID
    const digitalIdResponse = await axios.get(`${BASE_URL}/advanced/digital-id`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Digital ID fetched: ${digitalIdResponse.data.id_number}`);

    // Test access history
    const historyResponse = await axios.get(`${BASE_URL}/advanced/digital-id/access-history`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Access history fetched: ${historyResponse.data.length} records`);

    // Test QR scan (admin only)
    if (tokens.admin) {
      try {
        const scanResponse = await axios.post(`${BASE_URL}/advanced/digital-id/scan`, {
          qrData: JSON.stringify({
            userId: 1,
            idNumber: digitalIdResponse.data.id_number,
            name: 'Test User',
            role: 'student',
            issued: new Date().toISOString()
          }),
          location: 'Library',
          scannerDevice: 'Test Scanner'
        }, {
          headers: { Authorization: `Bearer ${tokens.admin}` }
        });
        console.log(`✅ QR scan successful: ${scanResponse.data.message}`);
      } catch (scanError) {
        console.log(`ℹ️ QR scan test: ${scanError.response?.data?.error || scanError.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Digital ID test failed:', error.response?.data?.message || error.message);
  }
}

async function testInternships() {
  console.log('\n💼 Testing Internship Portal...');
  
  try {
    // Test get companies
    const companiesResponse = await axios.get(`${BASE_URL}/advanced/companies`);
    console.log(`✅ Companies fetched: ${companiesResponse.data.length} companies`);

    // Test get internships
    const internshipsResponse = await axios.get(`${BASE_URL}/advanced/internships`);
    console.log(`✅ Internships fetched: ${internshipsResponse.data.length} positions`);

    if (internshipsResponse.data.length > 0) {
      const internshipId = internshipsResponse.data[0].id;
      
      // Test internship details
      const detailsResponse = await axios.get(`${BASE_URL}/advanced/internships/${internshipId}`);
      console.log(`✅ Internship details fetched: ${detailsResponse.data.title}`);
    }

    // Test get student applications
    const applicationsResponse = await axios.get(`${BASE_URL}/advanced/internships/my-applications`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Student applications fetched: ${applicationsResponse.data.length} applications`);

  } catch (error) {
    console.log('❌ Internships test failed:', error.response?.data?.message || error.message);
  }
}

async function testAlumni() {
  console.log('\n🎓 Testing Alumni Portal...');
  
  try {
    // Test get alumni directory
    const alumniResponse = await axios.get(`${BASE_URL}/advanced/alumni`);
    console.log(`✅ Alumni directory fetched: ${alumniResponse.data.length} alumni`);

    // Test get job postings
    const jobsResponse = await axios.get(`${BASE_URL}/advanced/jobs`);
    console.log(`✅ Job postings fetched: ${jobsResponse.data.length} jobs`);

    // Test get mentorship opportunities
    const mentorsResponse = await axios.get(`${BASE_URL}/advanced/mentorship`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Mentorship opportunities fetched: ${mentorsResponse.data.length} mentors`);

  } catch (error) {
    console.log('❌ Alumni portal test failed:', error.response?.data?.message || error.message);
  }
}

async function testNotifications() {
  console.log('\n🔔 Testing Notifications System...');
  
  try {
    // Test get notifications
    const notificationsResponse = await axios.get(`${BASE_URL}/advanced/notifications`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Notifications fetched: ${notificationsResponse.data.length} notifications`);

    // Test mark all as read
    const markReadResponse = await axios.put(`${BASE_URL}/advanced/notifications/mark-all-read`, {}, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    console.log(`✅ Mark all notifications as read: ${markReadResponse.data.success}`);

  } catch (error) {
    console.log('❌ Notifications test failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Advanced Features Tests...\n');

  // Login users
  const studentLogin = await login('student');
  const adminLogin = await login('admin');

  if (!studentLogin) {
    console.log('❌ Cannot proceed without student login');
    return;
  }

  // Run all tests
  await testChatbot();
  await testEvents();
  await testDigitalId();
  await testInternships();
  await testAlumni();
  await testNotifications();

  console.log('\n✨ Advanced Features Tests Completed!');
  console.log('\nTest Summary:');
  console.log('- AI Chatbot: FAQ system with intelligent responses');
  console.log('- Event Ticketing: QR-based event registration and tickets');
  console.log('- Digital ID: QR-coded campus access system');
  console.log('- Internship Portal: Company listings and application system');
  console.log('- Alumni Portal: Directory, job board, and mentorship');
  console.log('- Notifications: Real-time user notifications');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
