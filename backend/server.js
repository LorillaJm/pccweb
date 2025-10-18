require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const connectDB = require('./config/mongodb');
const http = require('http');

// Import new infrastructure components
const redisConnection = require('./config/redis');
const socketManager = require('./config/socket');
const taskScheduler = require('./config/scheduler');
const { performanceMonitor, monitoring } = require('./config/monitoring');
const externalServices = require('./config/external-services');
const logger = require('./config/logger');

// Set default environment variables if not provided
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';
process.env.JWT_SECRET = process.env.JWT_SECRET || '8dd9d501bf3ccaadfd387d5396f34be6dd80e21a98544deb16933a6170562537e026230f73ea5031a097f408dcd92fa6dcb0231a2fe94d426d1010a0f2526d6d';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '589a7adde44c3e31e40a05df761dded4ab232e92d75078b5706bccd0648c45a2594247dd720de7198d37fdbcd18e12f930a5c2ccb08c903434011637f27a9f79';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || '73aea38842045fd1e893600a87f073c19e0e44a4c5938279e1b8125062496b7f4f084a8037f1d6b18bf79a9cf76a4744c6abe894aa6b76fb1673249ef28a4da0';

// Import routes
const authRoutes = require('./routes/auth-new');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements');
const subjectRoutes = require('./routes/subjects');
const materialRoutes = require('./routes/materials');
const adminRoutes = require('./routes/admin-simple');
const studentServicesRoutes = require('./routes/student-services');
const advancedFeaturesRoutes = require('./routes/advanced-features');
const healthRoutes = require('./routes/health');
const chatbotRoutes = require('./routes/chatbot');
const eventsRoutes = require('./routes/events');
const ticketsRoutes = require('./routes/tickets');
const digitalIdRoutes = require('./routes/digital-id');
const internshipsRoutes = require('./routes/internships');
const monitoringRoutes = require('./routes/monitoring');
const facebookRoutes = require('./routes/facebook');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy - Required for Render and other proxy services
app.set('trust proxy', 1);
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Session middleware for passport
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: isProduction, // true in production (https), false in development (http)
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for localhost
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    ...(isProduction ? {} : { domain: 'localhost' }) // Only set domain in development
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log session info (development only)
if (!isProduction) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      console.log('Session ID:', req.sessionID);
      console.log('Session exists:', !!req.session);
      console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
      console.log('User:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : 'None');
      console.log('---');
    }
    next();
  });
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Monitoring middleware
app.use(performanceMonitor.middleware());
app.use(logger.requestLogger());

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/admin', adminRoutes);
const adminJobsRoutes = require('./routes/admin-jobs');
app.use('/api/admin', adminJobsRoutes);
const alumniRoutes = require('./routes/alumni');
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentServicesRoutes);
app.use('/api/advanced', advancedFeaturesRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/digital-id', digitalIdRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/facebook', facebookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PCC Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize infrastructure components
async function initializeInfrastructure() {
  const results = {
    redis: false,
    socketio: false,
    scheduler: false
  };

  // Initialize Redis connection
  console.log('🔄 Connecting to Redis...');
  try {
    await redisConnection.connect();
    console.log('✅ Redis connected successfully');
    results.redis = true;
  } catch (error) {
    console.warn('⚠️  Redis connection failed, using fallback mode:', error.message);
    console.log('💡 To enable Redis features, install and start Redis server');
    results.redis = false;
  }

  // Initialize Socket.IO (works without Redis)
  console.log('🔄 Initializing Socket.IO...');
  try {
    socketManager.initialize(server);
    console.log('✅ Socket.IO initialized successfully');
    results.socketio = true;
  } catch (error) {
    console.error('❌ Socket.IO initialization failed:', error.message);
    results.socketio = false;
  }

  // Initialize task scheduler (works without Redis but with limited functionality)
  console.log('🔄 Initializing task scheduler...');
  try {
    taskScheduler.initialize();
    taskScheduler.startAllTasks();
    console.log('✅ Task scheduler initialized successfully');
    results.scheduler = true;
  } catch (error) {
    console.error('❌ Task scheduler initialization failed:', error.message);
    results.scheduler = false;
  }

  // Summary
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`📊 Infrastructure Status: ${successCount}/${totalCount} components initialized`);
  
  if (results.redis) {
    console.log('🎯 Full advanced features available');
  } else {
    console.log('🎯 Basic advanced features available (fallback mode)');
    console.log('💡 Install Redis for full functionality: https://redis.io/download');
  }
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  
  try {
    // Stop scheduled tasks
    taskScheduler.stopAllTasks();
    
    // Close Redis connection
    await redisConnection.disconnect();
    
    // Close server
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, shutting down gracefully...');
  
  try {
    // Stop scheduled tasks
    taskScheduler.stopAllTasks();
    
    // Close Redis connection
    await redisConnection.disconnect();
    
    // Close server
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 PCC Portal API server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  
  // Initialize infrastructure components
  await initializeInfrastructure();
  
  // Initialize external services
  await externalServices.initialize();
  
  console.log('🎉 All systems ready!');
});