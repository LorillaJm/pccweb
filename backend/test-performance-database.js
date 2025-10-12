/**
 * Database Query Performance Testing and Optimization
 * Tests and optimizes database queries and API responses
 */

const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

// Import models
const User = require('./models/User');
const Event = require('./models/Event');
const EventTicket = require('./models/EventTicket');
const Notification = require('./models/Notification');
const Internship = require('./models/Internship');
const DigitalID = require('./models/DigitalID');
const ChatConversation = require('./models/ChatConversation');

// Metrics storage
const metrics = {
  queries: [],
  slowQueries: [],
  indexUsage: {},
  optimizationSuggestions: []
};

/**
 * Connect to database
 */
async function connectDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Measure query performance
 */
async function measureQuery(queryName, queryFn) {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;

    const queryMetric = {
      name: queryName,
      duration,
      success: true,
      resultCount: Array.isArray(result) ? result.length : 1
    };

    metrics.queries.push(queryMetric);

    // Flag slow queries (> 100ms)
    if (duration > 100) {
      metrics.slowQueries.push(queryMetric);
      console.log(`   ⚠️  Slow query detected: ${queryName} (${duration.toFixed(2)}ms)`);
    } else {
      console.log(`   ✅ ${queryName}: ${duration.toFixed(2)}ms`);
    }

    return { success: true, duration, result };
  } catch (error) {
    const duration = performance.now() - start;
    metrics.queries.push({
      name: queryName,
      duration,
      success: false,
      error: error.message
    });
    console.log(`   ❌ ${queryName} failed: ${error.message}`);
    return { success: false, duration, error: error.message };
  }
}

/**
 * Test User queries
 */
async function testUserQueries() {
  console.log('\n👤 Testing User Queries...');

  // Query 1: Find user by email (should use index)
  await measureQuery('User.findByEmail', async () => {
    return await User.findOne({ email: 'test@example.com' });
  });

  // Query 2: Find users by role
  await measureQuery('User.findByRole', async () => {
    return await User.find({ role: 'student' }).limit(100);
  });

  // Query 3: Find users with pagination
  await measureQuery('User.findWithPagination', async () => {
    return await User.find()
      .select('firstName lastName email role')
      .limit(50)
      .skip(0)
      .lean();
  });

  // Query 4: Count users by role
  await measureQuery('User.countByRole', async () => {
    return await User.countDocuments({ role: 'student' });
  });
}

/**
 * Test Event queries
 */
async function testEventQueries() {
  console.log('\n🎫 Testing Event Queries...');

  // Query 1: Find upcoming events
  await measureQuery('Event.findUpcoming', async () => {
    return await Event.find({
      startDate: { $gte: new Date() },
      status: 'published'
    })
      .sort({ startDate: 1 })
      .limit(20)
      .lean();
  });

  // Query 2: Find events with registrations
  await measureQuery('Event.findWithRegistrations', async () => {
    return await Event.find({ status: 'published' })
      .populate('organizer', 'firstName lastName')
      .limit(10);
  });

  // Query 3: Find events by category
  await measureQuery('Event.findByCategory', async () => {
    return await Event.find({ category: 'academic' })
      .select('title startDate venue capacity')
      .lean();
  });

  // Query 4: Aggregate event statistics
  await measureQuery('Event.aggregateStats', async () => {
    return await Event.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalRegistered: { $sum: '$registeredCount' }
        }
      }
    ]);
  });
}

/**
 * Test Notification queries
 */
async function testNotificationQueries() {
  console.log('\n🔔 Testing Notification Queries...');

  // Query 1: Find unread notifications
  await measureQuery('Notification.findUnread', async () => {
    return await Notification.find({
      userId: new mongoose.Types.ObjectId(),
      isRead: false
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  });

  // Query 2: Mark notifications as read
  await measureQuery('Notification.markAsRead', async () => {
    return await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(),
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );
  });

  // Query 3: Delete old notifications
  await measureQuery('Notification.deleteOld', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });
  });
}

/**
 * Test Internship queries
 */
async function testInternshipQueries() {
  console.log('\n💼 Testing Internship Queries...');

  // Query 1: Find active internships
  await measureQuery('Internship.findActive', async () => {
    return await Internship.find({
      status: 'published',
      applicationDeadline: { $gte: new Date() }
    })
      .populate('companyId', 'name industry')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  });

  // Query 2: Search internships by skills
  await measureQuery('Internship.searchBySkills', async () => {
    return await Internship.find({
      skills: { $in: ['JavaScript', 'React', 'Node.js'] },
      status: 'published'
    })
      .select('title companyId location duration')
      .lean();
  });

  // Query 3: Find internships with available slots
  await measureQuery('Internship.findAvailable', async () => {
    return await Internship.find({
      $expr: { $lt: ['$filledSlots', '$slots'] },
      status: 'published'
    })
      .limit(20)
      .lean();
  });
}

/**
 * Test Digital ID queries
 */
async function testDigitalIDQueries() {
  console.log('\n🆔 Testing Digital ID Queries...');

  // Query 1: Find digital ID by user
  await measureQuery('DigitalID.findByUser', async () => {
    return await DigitalID.findOne({
      userId: new mongoose.Types.ObjectId(),
      isActive: true
    }).lean();
  });

  // Query 2: Validate QR code
  await measureQuery('DigitalID.validateQR', async () => {
    return await DigitalID.findOne({
      qrCode: 'sample-qr-code',
      isActive: true,
      expiresAt: { $gte: new Date() }
    }).lean();
  });

  // Query 3: Find expiring IDs
  await measureQuery('DigitalID.findExpiring', async () => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return await DigitalID.find({
      expiresAt: { $lte: sevenDaysFromNow, $gte: new Date() },
      isActive: true
    })
      .populate('userId', 'firstName lastName email')
      .lean();
  });
}

/**
 * Check index usage
 */
async function checkIndexUsage() {
  console.log('\n📊 Checking Index Usage...');

  const collections = [
    { name: 'User', model: User },
    { name: 'Event', model: Event },
    { name: 'Notification', model: Notification },
    { name: 'Internship', model: Internship },
    { name: 'DigitalID', model: DigitalID }
  ];

  for (const collection of collections) {
    try {
      const indexes = await collection.model.collection.getIndexes();
      metrics.indexUsage[collection.name] = Object.keys(indexes).length;

      console.log(`\n   ${collection.name}:`);
      Object.entries(indexes).forEach(([name, index]) => {
        console.log(`      ✅ ${name}: ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.log(`   ❌ Failed to get indexes for ${collection.name}`);
    }
  }
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions() {
  console.log('\n💡 Optimization Suggestions...');

  // Analyze slow queries
  if (metrics.slowQueries.length > 0) {
    console.log('\n   Slow Queries Detected:');
    metrics.slowQueries.forEach(query => {
      console.log(`      ⚠️  ${query.name} (${query.duration.toFixed(2)}ms)`);

      // Suggest optimizations
      if (query.name.includes('find') && !query.name.includes('lean')) {
        metrics.optimizationSuggestions.push({
          query: query.name,
          suggestion: 'Use .lean() for read-only queries to improve performance'
        });
      }

      if (query.name.includes('populate')) {
        metrics.optimizationSuggestions.push({
          query: query.name,
          suggestion: 'Consider limiting populated fields with select()'
        });
      }

      if (query.duration > 500) {
        metrics.optimizationSuggestions.push({
          query: query.name,
          suggestion: 'Add appropriate indexes for frequently queried fields'
        });
      }
    });
  }

  // Display suggestions
  if (metrics.optimizationSuggestions.length > 0) {
    console.log('\n   Recommended Optimizations:');
    metrics.optimizationSuggestions.forEach((suggestion, index) => {
      console.log(`      ${index + 1}. ${suggestion.query}:`);
      console.log(`         ${suggestion.suggestion}`);
    });
  } else {
    console.log('   ✅ No immediate optimizations needed');
  }

  // General recommendations
  console.log('\n   General Recommendations:');
  console.log('      1. Use .lean() for read-only queries');
  console.log('      2. Limit fields with .select() when possible');
  console.log('      3. Use pagination for large result sets');
  console.log('      4. Create compound indexes for common query patterns');
  console.log('      5. Use aggregation pipeline for complex queries');
  console.log('      6. Implement query result caching with Redis');
  console.log('      7. Monitor slow query logs in production');
}

/**
 * Display performance report
 */
function displayReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATABASE PERFORMANCE REPORT');
  console.log('='.repeat(60));

  // Query statistics
  const successfulQueries = metrics.queries.filter(q => q.success);
  const failedQueries = metrics.queries.filter(q => !q.success);
  const durations = successfulQueries.map(q => q.duration);

  console.log('\n📈 Query Statistics:');
  console.log(`   Total Queries: ${metrics.queries.length}`);
  console.log(`   Successful: ${successfulQueries.length}`);
  console.log(`   Failed: ${failedQueries.length}`);
  console.log(`   Slow Queries (>100ms): ${metrics.slowQueries.length}`);

  if (durations.length > 0) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log('\n⏱️  Query Performance (ms):');
    console.log(`   Min: ${min.toFixed(2)}`);
    console.log(`   Max: ${max.toFixed(2)}`);
    console.log(`   Average: ${avg.toFixed(2)}`);
  }

  // Index usage
  console.log('\n📊 Index Usage:');
  Object.entries(metrics.indexUsage).forEach(([collection, count]) => {
    console.log(`   ${collection}: ${count} indexes`);
  });

  // Performance assessment
  console.log('\n✅ Performance Assessment:');
  const avgQueryTime = durations.reduce((a, b) => a + b, 0) / durations.length;
  const slowQueryRate = (metrics.slowQueries.length / metrics.queries.length) * 100;

  if (avgQueryTime < 50 && slowQueryRate < 10) {
    console.log('   🟢 EXCELLENT - Database queries are well optimized');
  } else if (avgQueryTime < 100 && slowQueryRate < 20) {
    console.log('   🟡 GOOD - Database performance is acceptable');
  } else if (avgQueryTime < 200 && slowQueryRate < 30) {
    console.log('   🟠 FAIR - Some queries need optimization');
  } else {
    console.log('   🔴 POOR - Database queries need significant optimization');
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Main test execution
 */
async function runDatabasePerformanceTests() {
  console.log('🚀 Starting Database Performance Tests...');

  try {
    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      console.error('❌ Cannot run tests without database connection');
      process.exit(1);
    }

    // Run query tests
    await testUserQueries();
    await testEventQueries();
    await testNotificationQueries();
    await testInternshipQueries();
    await testDigitalIDQueries();

    // Check indexes
    await checkIndexUsage();

    // Generate optimization suggestions
    generateOptimizationSuggestions();

    // Display report
    displayReport();

    // Cleanup
    await mongoose.connection.close();
    console.log('\n✅ Database performance tests completed');

    // Exit with appropriate code
    const slowQueryRate = (metrics.slowQueries.length / metrics.queries.length) * 100;
    if (slowQueryRate > 30) {
      console.log('\n⚠️  Warning: High number of slow queries detected');
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Database performance test error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runDatabasePerformanceTests();
}

module.exports = {
  measureQuery,
  checkIndexUsage,
  generateOptimizationSuggestions,
  displayReport
};
