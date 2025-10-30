// Test API connection and environment variables
const axios = require('axios');

console.log('🔍 Testing API Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Test API endpoints
const testEndpoints = async () => {
  const baseUrls = [
    'http://localhost:5000/api',
    'https://pccweb.onrender.com/api'
  ];

  for (const baseUrl of baseUrls) {
    console.log(`\n📡 Testing ${baseUrl}:`);
    
    try {
      // Test health endpoint
      const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
      console.log(`✅ Health check: ${healthResponse.status} - ${healthResponse.data.status}`);
      
      // Test announcements endpoint (should fail without auth)
      try {
        const announcementsResponse = await axios.get(`${baseUrl}/announcements`, { 
          timeout: 5000,
          withCredentials: true 
        });
        console.log(`✅ Announcements: ${announcementsResponse.status}`);
      } catch (authError) {
        if (authError.response?.status === 401) {
          console.log(`🔒 Announcements: 401 (Expected - requires authentication)`);
        } else {
          console.log(`❌ Announcements: ${authError.response?.status || 'Network error'}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
};

// Test session authentication
const testAuth = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 5000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    // Try to get current user (should fail if not logged in)
    const userResponse = await api.get('/auth/me');
    console.log('✅ User authenticated:', userResponse.data.data?.user?.email);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔒 Not authenticated (expected if not logged in)');
      
      // Try to login with test credentials
      try {
        console.log('🔑 Attempting test login...');
        const loginResponse = await api.post('/auth/login', {
          email: 'admin@pcc.edu.ph',
          password: 'admin123'
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful:', loginResponse.data.data.user.email);
          
          // Now try announcements again
          const announcementsResponse = await api.get('/announcements');
          console.log('✅ Announcements after login:', announcementsResponse.data.data.announcements.length, 'items');
        }
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      }
    } else {
      console.log('❌ Auth check failed:', error.response?.sta