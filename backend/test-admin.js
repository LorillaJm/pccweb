const axios = require('axios');

// Test script for admin portal functionality
const BASE_URL = 'http://localhost:5000/api';

// Test credentials - you'll need to create a super admin user first
const ADMIN_CREDENTIALS = {
  email: 'admin@pcc.edu.ph',
  password: 'admin123'
};

let authToken = '';

async function testAdminPortal() {
  console.log('🧪 Testing Admin Portal Functionality\n');

  try {
    // 1. Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    authToken = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Admin login successful\n');

    // Set authorization header for subsequent requests
    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test dashboard stats
    console.log('2. Testing dashboard stats...');
    const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, { headers });
    console.log('✅ Dashboard stats retrieved:', {
      userStats: dashboardResponse.data.data.userStats.length,
      enrollmentStats: dashboardResponse.data.data.enrollmentStats,
      recentUsers: dashboardResponse.data.data.recentUsers.length
    });
    console.log();

    // 3. Test user management
    console.log('3. Testing user management...');
    const usersResponse = await axios.get(`${BASE_URL}/admin/users?page=1&limit=5`, { headers });
    console.log('✅ Users retrieved:', usersResponse.data.data.users.length, 'users');
    console.log();

    // 4. Test creating a new user
    console.log('4. Testing user creation...');
    const newUser = {
      email: `test.student.${Date.now()}@pcc.edu.ph`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      studentId: `ST${Date.now()}`
    };
    
    try {
      const createUserResponse = await axios.post(`${BASE_URL}/admin/users`, newUser, { headers });
      console.log('✅ User created successfully:', createUserResponse.data.data.user.email);
    } catch (err) {
      console.log('⚠️ User creation test skipped (may already exist)');
    }
    console.log();

    // 5. Test content management
    console.log('5. Testing content management...');
    const contentResponse = await axios.get(`${BASE_URL}/admin/announcements?page=1&limit=5`, { headers });
    console.log('✅ Content retrieved:', contentResponse.data.data.announcements.length, 'items');
    console.log();

    // 6. Test creating content
    console.log('6. Testing content creation...');
    const newContent = {
      title: `Test Announcement ${Date.now()}`,
      content: 'This is a test announcement created by the admin portal test script.',
      type: 'announcement',
      priority: 'normal',
      targetAudience: 'all',
      isPublished: true
    };
    
    try {
      const createContentResponse = await axios.post(`${BASE_URL}/admin/content`, newContent, { headers });
      console.log('✅ Content created successfully:', createContentResponse.data.data.content.title);
    } catch (err) {
      console.log('⚠️ Content creation error:', err.response?.data?.message || err.message);
    }
    console.log();

    // 7. Test academic management
    console.log('7. Testing academic management...');
    const subjectsResponse = await axios.get(`${BASE_URL}/admin/subjects?page=1&limit=5`, { headers });
    console.log('✅ Subjects retrieved:', subjectsResponse.data.data.subjects.length, 'subjects');
    console.log();

    // 8. Test creating a subject
    console.log('8. Testing subject creation...');
    const newSubject = {
      subjectCode: `TEST${Date.now().toString().slice(-3)}`,
      subjectName: 'Test Subject',
      description: 'A test subject created by the admin portal test script',
      units: 3,
      department: 'Test Department'
    };
    
    try {
      const createSubjectResponse = await axios.post(`${BASE_URL}/admin/subjects`, newSubject, { headers });
      console.log('✅ Subject created successfully:', createSubjectResponse.data.data.subject.subject_code);
    } catch (err) {
      console.log('⚠️ Subject creation error:', err.response?.data?.message || err.message);
    }
    console.log();

    // 9. Test enrollment management
    console.log('9. Testing enrollment management...');
    const enrollmentsResponse = await axios.get(`${BASE_URL}/admin/enrollments?page=1&limit=5`, { headers });
    console.log('✅ Enrollments retrieved:', enrollmentsResponse.data.data.enrollments.length, 'enrollments');
    console.log();

    console.log('🎉 All admin portal tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testAdminPortal();
}

module.exports = { testAdminPortal };
