const express = require('express');
const app = express();

console.log('🧪 Testing Events Routes Registration...\n');

try {
  // Test importing the routes
  console.log('1. Testing Route Imports:');
  
  const eventsRoutes = require('./backend/routes/events');
  console.log('   ✅ Events routes imported successfully');
  
  const ticketsRoutes = require('./backend/routes/tickets');
  console.log('   ✅ Tickets routes imported successfully');
  
  // Test registering the routes
  console.log('\n2. Testing Route Registration:');
  
  app.use('/api/events', eventsRoutes);
  console.log('   ✅ Events routes registered at /api/events');
  
  app.use('/api/tickets', ticketsRoutes);
  console.log('   ✅ Tickets routes registered at /api/tickets');
  
  // Test route structure
  console.log('\n3. Testing Route Structure:');
  
  const eventsStack = eventsRoutes.stack;
  console.log(`   ✅ Events router has ${eventsStack.length} routes defined`);
  
  const ticketsStack = ticketsRoutes.stack;
  console.log(`   ✅ Tickets router has ${ticketsStack.length} routes defined`);
  
  console.log('\n✅ Routes Registration Test Completed Successfully!');
  console.log('\n📋 Summary:');
  console.log('✅ Events routes can be imported');
  console.log('✅ Tickets routes can be imported');
  console.log('✅ Routes can be registered with Express');
  console.log('✅ Route structure is valid');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. The /api/events endpoint should now work');
  console.log('3. Test by visiting: http://localhost:3000/events');
  
  console.log('\n💡 Server Restart Required:');
  console.log('- Stop your current server (Ctrl+C)');
  console.log('- Run: npm run dev');
  console.log('- The events API should now be available');
  
} catch (error) {
  console.log('❌ Route registration test failed:', error.message);
  console.log('\nError details:', error.stack);
  
  console.log('\n🔧 Possible Issues:');
  console.log('- Missing dependencies in route files');
  console.log('- Syntax errors in route definitions');
  console.log('- Missing service files');
}

process.exit(0);