const mongoose = require('mongoose');
const InternshipService = require('./services/InternshipService');
const InternshipWorkflowService = require('./services/InternshipWorkflowService');
const CandidateMatchingService = require('./services/CandidateMatchingService');
const User = require('./models/User');
const Company = require('./models/Company');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');

async function testInternshipWorkflow() {
  try {
    console.log('🚀 Starting Internship Workflow Tests...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test');
    console.log('✅ Connected to test database');

    // Clean up existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Internship.deleteMany({});
    await InternshipApplication.deleteMany({});
    console.log('✅ Cleaned up test data');

    // Create test users
    const studentUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@student.pcc.edu.ph',
      password: 'password123',
      role: 'student',
      program: 'Computer Science',
      yearLevel: 3,
      studentId: 'CS2021001',
      isActive: true
    });

    const companyUser = await User.create({
      firstName: 'Jane',
      lastName: '