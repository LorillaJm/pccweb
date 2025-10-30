/**
 * Test the enrolled subjects API
 * This will help debug why the dashboard shows "No enrolled subjects"
 */

console.log('🧪 Testing Enrolled Subjects API\n');

console.log('📋 Checklist:');
console.log('1. ✅ Database has enrollments (verified by check-enrollments.js)');
console.log('2. ❓ API endpoint working?');
console.log('3. ❓ User logged in correctly?');
console.log('4. ❓ Frontend calling correct API?\n');

console.log('🔍 Debugging Steps:\n');

console.log('Step 1: Check if backend is running');
console.log('   Run: npm run dev (in backend folder)');
console.log('   Or: node backend/server.js\n');

console.log('Step 2: Check API endpoint manually');
console.log('   Open browser console (F12)');
console.log('   Go to: http://localhost:3000/portal/student');
console.log('   Check Network tab for API calls');
console.log('   Look for: /api/subjects/enrolled\n');

console.log('Step 3: Test API directly');
console.log('   Option A: Use browser (must be logged in)');
console.log('      Visit: http://localhost:5000/api/subjects/enrolled');
console.log('   Option B: Use curl with session cookie');
console.log('      (Need to copy session cookie from browser)\n');

console.log('Step 4: Check which user you\'re logged in as');
console.log('   Look at browser console logs');
console.log('   Should see user email in AuthContext\n');

console.log('Step 5: Try logging in with these accounts:');
console.log('   - dev080022jm@gmail.com');
console.log('   - lavillajero944@gmail.com');
console.log('   - anna.garcia@student.pcc.edu.ph\n');

console.log('📊 Expected Result:');
console.log('   Each student should see 5 enrolled subjects:');
console.log('   1. CS101 - Introduction to Computer Science');
console.log('   2. CS102 - Programming Fundamentals');
console.log('   3. CS201 - Data Structures and Algorithms');
console.log('   4. CS202 - Web Development');
console.log('   5. CS301 - Database Systems\n');

console.log('🔧 Quick Fixes:\n');

console.log('Fix 1: Restart Frontend');
console.log('   Ctrl+C to stop');
console.log('   npm run dev to restart\n');

console.log('Fix 2: Clear Browser Cache');
console.log('   Ctrl+Shift+Delete');
console.log('   Clear cookies and cache\n');

console.log('Fix 3: Re-login');
console.log('   Logout');
console.log('   Login again with student account\n');

console.log('Fix 4: Check API URL');
console.log('   Frontend .env should have:');
console.log('   NEXT_PUBLIC_API_URL=http://localhost:5000/api\n');

console.log('Fix 5: Re-run seed (if needed)');
console.log('   node backend/scripts/seed-student-enrollments.js\n');

console.log('🎯 Most Likely Issue:');
console.log('   You need to RESTART the frontend server!');
console.log('   The frontend might be caching old data.\n');

console.log('💡 Quick Test:');
console.log('   1. Make sure backend is running (port 5000)');
console.log('   2. Restart frontend (Ctrl+C, then npm run dev)');
console.log('   3. Clear browser cache (Ctrl+Shift+Delete)');
console.log('   4. Login as: dev080022jm@gmail.com');
console.log('   5. Go to: http://localhost:3000/portal/student');
console.log('   6. You should see 5 subjects!\n');

console.log('✨ If still not working, check browser console for errors!');
