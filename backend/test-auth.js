// Test auth middleware imports
try {
  const auth = require('./middleware/auth');
  console.log('✅ Auth middleware loaded successfully');
  console.log('Available exports:', Object.keys(auth));
  
  // Test each middleware function
  const middlewares = [
    'authenticateToken',
    'requireStudent', 
    'requireFaculty',
    'requireStudentOrFaculty',
    'requireAdmin'
  ];
  
  middlewares.forEach(name => {
    if (typeof auth[name] === 'function') {
      console.log(`✅ ${name}: function`);
    } else {
      console.log(`❌ ${name}: ${typeof auth[name]}`);
    }
  });
  
} catch (error) {
  console.error('❌ Auth middleware error:', error.message);
  console.error(error.stack);
}

// Test student-services import
try {
  const studentServices = require('./routes/student-services');
  console.log('✅ Student services loaded successfully');
} catch (error) {
  console.error('❌ Student services error:', error.message);
  console.error('Stack:', error.stack);
}
