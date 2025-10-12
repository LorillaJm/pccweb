const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_STUDENT = {
  email: 'student@pcc.edu.ph',
  password: 'student123'
};
const TEST_FACULTY = {
  email: 'faculty@pcc.edu.ph', 
  password: 'faculty123'
};

let studentToken = '';
let facultyToken = '';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = `${status}: ${testName}${message ? ' - ' + message : ''}`;
  console.log(result);
  
  testResults.tests.push({ testName, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function authenticateUser(credentials, userType) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    if (response.data.token) {
      logTest(`${userType} Authentication`, true);
      return response.data.token;
    } else {
      logTest(`${userType} Authentication`, false, 'No token received');
      return null;
    }
  } catch (error) {
    logTest(`${userType} Authentication`, false, error.response?.data?.error || error.message);
    return null;
  }
}

async function testGradesSystem() {
  console.log('\n🎓 Testing Grades System...');
  
  try {
    // Test student viewing grades
    const gradesResponse = await axios.get(`${BASE_URL}/student-services/grades`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - View Grades', gradesResponse.status === 200);

    // Test grade summary
    const summaryResponse = await axios.get(`${BASE_URL}/student-services/grades/summary`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - Grade Summary', summaryResponse.status === 200);

    // Test faculty submitting grades
    const gradeData = {
      student_id: 1,
      class_section_id: 1,
      subject_id: 1,
      academic_year: '2024-2025',
      semester: 1,
      prelim_grade: 85.5,
      midterm_grade: 88.0,
      finals_grade: 90.0,
      final_grade: 87.8,
      letter_grade: 'B+',
      grade_points: 3.25,
      status: 'completed',
      remarks: 'Good performance'
    };

    const submitGradeResponse = await axios.post(`${BASE_URL}/student-services/grades`, gradeData, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    logTest('Faculty - Submit Grades', submitGradeResponse.status === 200);

  } catch (error) {
    logTest('Grades System Error', false, error.response?.data?.error || error.message);
  }
}

async function testEnrollmentSystem() {
  console.log('\n📚 Testing Enrollment System...');
  
  try {
    // Test viewing available subjects
    const availableResponse = await axios.get(`${BASE_URL}/student-services/enrollment/available-subjects`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - View Available Subjects', availableResponse.status === 200);

    // Test viewing current enrollments
    const enrollmentsResponse = await axios.get(`${BASE_URL}/student-services/enrollment/my-enrollments`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - View Current Enrollments', enrollmentsResponse.status === 200);

    // Test enrollment in subject (if available subjects exist)
    if (availableResponse.data.length > 0) {
      const enrollData = {
        class_section_id: availableResponse.data[0].id,
        academic_year: '2024-2025',
        semester: 1
      };

      const enrollResponse = await axios.post(`${BASE_URL}/student-services/enrollment/enroll`, enrollData, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      logTest('Student - Enroll in Subject', enrollResponse.status === 200);

      // Test dropping enrollment
      if (enrollResponse.status === 200) {
        const dropData = { drop_reason: 'Test drop' };
        const dropResponse = await axios.delete(`${BASE_URL}/student-services/enrollment/${enrollResponse.data.id}`, {
          headers: { Authorization: `Bearer ${studentToken}` },
          data: dropData
        });
        logTest('Student - Drop Enrollment', dropResponse.status === 200);
      }
    } else {
      logTest('Student - Enroll in Subject', false, 'No available subjects to test enrollment');
    }

  } catch (error) {
    logTest('Enrollment System Error', false, error.response?.data?.error || error.message);
  }
}

async function testPaymentSystem() {
  console.log('\n💰 Testing Payment System...');
  
  try {
    // Test viewing payments
    const paymentsResponse = await axios.get(`${BASE_URL}/student-services/payments`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - View Payments', paymentsResponse.status === 200);

    // Test payment summary
    const summaryResponse = await axios.get(`${BASE_URL}/student-services/payments/summary`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - Payment Summary', summaryResponse.status === 200);

    // Test payment transactions (if payments exist)
    if (paymentsResponse.data.length > 0) {
      const transactionsResponse = await axios.get(`${BASE_URL}/student-services/payments/${paymentsResponse.data[0].id}/transactions`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      logTest('Student - Payment Transactions', transactionsResponse.status === 200);
    } else {
      logTest('Student - Payment Transactions', false, 'No payments found to test transactions');
    }

  } catch (error) {
    logTest('Payment System Error', false, error.response?.data?.error || error.message);
  }
}

async function testLearningMaterials() {
  console.log('\n📄 Testing Learning Materials System...');
  
  try {
    // Test student viewing materials
    const materialsResponse = await axios.get(`${BASE_URL}/student-services/materials`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    logTest('Student - View Learning Materials', materialsResponse.status === 200);

    // Test faculty uploading material
    const testFilePath = path.join(__dirname, 'test-material.txt');
    fs.writeFileSync(testFilePath, 'This is a test learning material file.');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('class_section_id', '1');
    formData.append('title', 'Test Material');
    formData.append('description', 'Test material for automated testing');
    formData.append('material_type', 'handout');
    formData.append('is_public', 'true');
    formData.append('academic_year', '2024-2025');
    formData.append('semester', '1');

    const uploadResponse = await axios.post(`${BASE_URL}/student-services/materials`, formData, {
      headers: { 
        Authorization: `Bearer ${facultyToken}`,
        ...formData.getHeaders()
      }
    });
    logTest('Faculty - Upload Material', uploadResponse.status === 200);

    // Clean up test file
    fs.unlinkSync(testFilePath);

    // Test material download (if materials exist)
    const updatedMaterialsResponse = await axios.get(`${BASE_URL}/student-services/materials`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    if (updatedMaterialsResponse.data.length > 0) {
      const downloadResponse = await axios.get(`${BASE_URL}/student-services/materials/${updatedMaterialsResponse.data[0].id}/download`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        responseType: 'blob'
      });
      logTest('Student - Download Material', downloadResponse.status === 200);
    } else {
      logTest('Student - Download Material', false, 'No materials found to test download');
    }

  } catch (error) {
    logTest('Learning Materials Error', false, error.response?.data?.error || error.message);
  }
}

async function testDashboardData() {
  console.log('\n📊 Testing Dashboard Data...');
  
  try {
    // Test multiple endpoints that the dashboard uses
    const endpoints = [
      { name: 'Enrollments', url: '/student-services/enrollment/my-enrollments?academic_year=2024-2025&semester=1' },
      { name: 'Grade Summary', url: '/student-services/grades/summary' },
      { name: 'Payment Summary', url: '/student-services/payments/summary' },
      { name: 'Materials', url: '/student-services/materials?academic_year=2024-2025&semester=1' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        logTest(`Dashboard - ${endpoint.name}`, response.status === 200);
      } catch (error) {
        logTest(`Dashboard - ${endpoint.name}`, false, error.response?.data?.error || error.message);
      }
    }

  } catch (error) {
    logTest('Dashboard Data Error', false, error.message);
  }
}

async function testRoleBasedAccess() {
  console.log('\n🔒 Testing Role-Based Access Control...');
  
  try {
    // Test student accessing faculty-only endpoints
    try {
      await axios.post(`${BASE_URL}/student-services/grades`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      logTest('Student Access Control - Grades Submission', false, 'Student should not be able to submit grades');
    } catch (error) {
      logTest('Student Access Control - Grades Submission', error.response?.status === 403, 'Correctly blocked student from submitting grades');
    }

    try {
      const formData = new FormData();
      formData.append('title', 'Unauthorized Test');
      await axios.post(`${BASE_URL}/student-services/materials`, formData, {
        headers: { 
          Authorization: `Bearer ${studentToken}`,
          ...formData.getHeaders()
        }
      });
      logTest('Student Access Control - Material Upload', false, 'Student should not be able to upload materials');
    } catch (error) {
      logTest('Student Access Control - Material Upload', error.response?.status === 403, 'Correctly blocked student from uploading materials');
    }

  } catch (error) {
    logTest('Role-Based Access Control Error', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Student Services Test Suite...\n');

  // Authenticate users
  studentToken = await authenticateUser(TEST_STUDENT, 'Student');
  facultyToken = await authenticateUser(TEST_FACULTY, 'Faculty');

  if (!studentToken) {
    console.log('❌ Cannot proceed without student authentication');
    return;
  }

  if (!facultyToken) {
    console.log('⚠️  Proceeding without faculty authentication - some tests will be skipped');
  }

  // Run all test suites
  await testGradesSystem();
  await testEnrollmentSystem();
  await testPaymentSystem();
  await testLearningMaterials();
  await testDashboardData();
  await testRoleBasedAccess();

  // Print summary
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.testName}: ${test.message}`));
  }

  console.log('\n🎉 Student Services test suite completed!');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
