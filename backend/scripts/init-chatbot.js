#!/usr/bin/env node

/**
 * Initialize Chatbot Knowledge Base
 * This script sets up default FAQs and initializes the chatbot system
 */

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const KnowledgeBaseService = require('../services/KnowledgeBaseService');

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function findOrCreateSystemUser() {
  try {
    // Look for an admin user to use as the creator
    let systemUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    if (!systemUser) {
      // Create a system user for FAQ creation
      systemUser = await User.create({
        email: 'system@pcc.edu.ph',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        password: 'system123', // This will be hashed
        emailVerified: true
      });
      console.log('✅ Created system user for FAQ management');
    } else {
      console.log('✅ Using existing admin user for FAQ management');
    }
    
    return systemUser;
  } catch (error) {
    console.error('Error finding/creating system user:', error);
    throw error;
  }
}

async function initializeDefaultFAQs() {
  try {
    console.log('🔍 Checking existing FAQs...');
    
    const existingFAQs = await FAQ.countDocuments();
    if (existingFAQs > 0) {
      console.log(`ℹ️ Found ${existingFAQs} existing FAQs. Skipping initialization.`);
      return;
    }

    console.log('📚 Initializing default FAQs...');
    
    const systemUser = await findOrCreateSystemUser();
    
    const defaultFAQs = [
      // Enrollment FAQs
      {
        question: "How do I enroll for the next semester?",
        answer: "To enroll for the next semester: 1) Log into your student portal, 2) Go to the Enrollment section, 3) Select your subjects based on your curriculum, 4) Submit your enrollment form, 5) Complete payment before the deadline. Contact the registrar's office if you need assistance.",
        category: "enrollment",
        keywords: ["enroll", "enrollment", "semester", "subjects", "payment", "registrar"],
        priority: 10,
        language: "en"
      },
      {
        question: "What documents do I need for enrollment?",
        answer: "Required documents for enrollment: 1) Previous semester's grades (Form 137), 2) Certificate of Good Moral Character, 3) Medical certificate, 4) 2x2 ID photos, 5) Birth certificate (for new students), 6) Transfer credentials (for transferees). Bring original and photocopies.",
        category: "enrollment",
        keywords: ["documents", "requirements", "enrollment", "grades", "certificate"],
        priority: 9,
        language: "en"
      },
      {
        question: "When is the enrollment period?",
        answer: "Enrollment periods: Early enrollment (March-April for 1st semester, October-November for 2nd semester), Regular enrollment (May-June for 1st semester, December-January for 2nd semester), Late enrollment (first week of classes with penalty). Check the academic calendar for exact dates.",
        category: "enrollment",
        keywords: ["enrollment", "period", "schedule", "deadline", "calendar"],
        priority: 9,
        language: "en"
      },

      // Academics FAQs
      {
        question: "How can I check my grades?",
        answer: "To check your grades: 1) Log into the student portal, 2) Navigate to the 'Grades' section, 3) Select the semester/term, 4) View your grades by subject. Grades are typically updated within 2 weeks after the end of each term. Contact your instructor if you have questions about specific grades.",
        category: "academics",
        keywords: ["grades", "check", "portal", "student", "term", "semester"],
        priority: 10,
        language: "en"
      },
      {
        question: "What is the grading system?",
        answer: "PCC uses a 5.0 grading system: 1.0 (Excellent), 1.25-1.75 (Very Good), 2.0-2.75 (Good), 3.0 (Passing), 4.0-5.0 (Failing). The passing grade is 3.0. GPA is computed as the weighted average of all grades. INC (Incomplete) and W (Withdrawal) are also used.",
        category: "academics",
        keywords: ["grading", "system", "GPA", "passing", "grade", "scale"],
        priority: 8,
        language: "en"
      },
      {
        question: "How do I request a transcript of records?",
        answer: "To request a transcript: 1) Go to the Registrar's Office, 2) Fill out the transcript request form, 3) Pay the required fee, 4) Submit valid ID and clearance, 5) Wait for processing (3-5 working days). For rush requests, additional fees apply. Alumni can also request online through the portal.",
        category: "academics",
        keywords: ["transcript", "records", "request", "registrar", "fee", "processing"],
        priority: 7,
        language: "en"
      },

      // Payments FAQs
      {
        question: "What are the tuition fee payment options?",
        answer: "Payment options: 1) Full payment (with discount), 2) Installment plan (3-4 payments per semester), 3) Online banking, 4) Over-the-counter bank payments, 5) School cashier. Scholarships and financial aid are available. Contact the finance office for payment arrangements.",
        category: "payments",
        keywords: ["tuition", "payment", "installment", "discount", "scholarship", "finance"],
        priority: 10,
        language: "en"
      },
      {
        question: "When are tuition fees due?",
        answer: "Payment deadlines: Full payment (before start of classes for discount), 1st installment (enrollment), 2nd installment (midterm), 3rd installment (before finals). Late payment incurs penalties. Check your assessment slip for exact due dates. Emergency payment extensions may be available.",
        category: "payments",
        keywords: ["deadline", "due", "payment", "installment", "penalty", "assessment"],
        priority: 9,
        language: "en"
      },

      // Facilities FAQs
      {
        question: "What are the library hours?",
        answer: "Library hours: Monday-Friday: 7:00 AM - 7:00 PM, Saturday: 8:00 AM - 5:00 PM, Sunday: Closed. Extended hours during finals week. You need your student ID to enter. Digital resources are available 24/7 through the online portal. Study rooms can be reserved in advance.",
        category: "facilities",
        keywords: ["library", "hours", "schedule", "access", "student", "digital", "study"],
        priority: 8,
        language: "en"
      },
      {
        question: "Where is the computer laboratory?",
        answer: "Computer labs are located on the 2nd floor of the IT Building. Lab hours: Monday-Friday: 8:00 AM - 6:00 PM, Saturday: 8:00 AM - 4:00 PM. Students can use labs for coursework, research, and printing. Bring your student ID. Internet access and software for various courses are available.",
        category: "facilities",
        keywords: ["computer", "lab", "laboratory", "IT", "building", "hours", "access"],
        priority: 7,
        language: "en"
      },

      // Technical Support FAQs
      {
        question: "How do I reset my portal password?",
        answer: "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password', 3) Enter your email address, 4) Check your email for reset instructions, 5) Follow the link and create a new password. If you don't receive the email, contact IT support or visit the IT office with your student ID.",
        category: "technical",
        keywords: ["password", "reset", "login", "portal", "email", "IT", "support"],
        priority: 10,
        language: "en"
      },
      {
        question: "I can't access my student portal account",
        answer: "If you can't access your account: 1) Check your internet connection, 2) Try clearing browser cache/cookies, 3) Use the correct login credentials, 4) Try a different browser, 5) Check if your account is active. If problems persist, contact IT support at itsupport@pcc.edu.ph or visit the IT office.",
        category: "technical",
        keywords: ["access", "portal", "account", "login", "browser", "IT", "support"],
        priority: 9,
        language: "en"
      },

      // Admissions FAQs
      {
        question: "What are the admission requirements?",
        answer: "Admission requirements: 1) Completed application form, 2) High school diploma/certificate, 3) Transcript of records (Form 138), 4) Certificate of Good Moral Character, 5) Birth certificate (NSO copy), 6) Medical certificate, 7) 2x2 ID photos, 8) Entrance exam results. Additional requirements may vary by program.",
        category: "admissions",
        keywords: ["admission", "requirements", "application", "diploma", "transcript", "entrance"],
        priority: 10,
        language: "en"
      },
      {
        question: "When is the entrance exam schedule?",
        answer: "Entrance exams are held: March-April (for 1st semester admission), October-November (for 2nd semester admission). Special exams may be scheduled for transferees. Exam covers English, Math, Science, and General Knowledge. Registration fee required. Check the admissions office for exact dates and venues.",
        category: "admissions",
        keywords: ["entrance", "exam", "schedule", "admission", "registration", "fee"],
        priority: 9,
        language: "en"
      },

      // General FAQs
      {
        question: "What are the office hours?",
        answer: "Office hours: Monday-Friday: 8:00 AM - 5:00 PM, Saturday: 8:00 AM - 12:00 PM, Sunday: Closed. Some offices have extended hours during enrollment periods. The registrar, cashier, and student affairs offices follow these hours. Emergency contacts are available for urgent matters.",
        category: "general",
        keywords: ["office", "hours", "schedule", "registrar", "cashier", "student"],
        priority: 7,
        language: "en"
      },
      {
        question: "How do I contact the college?",
        answer: "Contact information: Main office: (033) 396-2291, Email: info@pcc.edu.ph, Address: Passi City College, Passi City, Iloilo. Specific offices: Registrar (registrar@pcc.edu.ph), Admissions (admissions@pcc.edu.ph), IT Support (itsupport@pcc.edu.ph). Visit our website for more contact details.",
        category: "general",
        keywords: ["contact", "phone", "email", "address", "office", "information"],
        priority: 8,
        language: "en"
      }
    ];

    // Add FAQs to the knowledge base
    let successCount = 0;
    let errorCount = 0;

    for (const faqData of defaultFAQs) {
      try {
        await KnowledgeBaseService.addFAQ(faqData, systemUser._id);
        successCount++;
      } catch (error) {
        console.error(`Error adding FAQ "${faqData.question}":`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ Successfully added ${successCount} FAQs`);
    if (errorCount > 0) {
      console.log(`⚠️ Failed to add ${errorCount} FAQs`);
    }

  } catch (error) {
    console.error('Error initializing FAQs:', error);
    throw error;
  }
}

async function runInitialization() {
  console.log('🤖 Initializing Chatbot Knowledge Base...\n');

  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Initialize FAQs
    await initializeDefaultFAQs();

    console.log('\n🎉 Chatbot initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your backend server: npm run dev (in backend folder)');
    console.log('2. Start your frontend server: npm run dev (in root folder)');
    console.log('3. Log into the portal and look for the chat widget in the bottom-right corner');
    console.log('4. Try asking questions like "How do I enroll?" or "What are the library hours?"');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run initialization
runInitialization().catch(error => {
  console.error('Initialization failed:', error);
  process.exit(1);
});