require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedAnnouncements = async () => {
  try {
    await connectDB();

    // Find an admin or faculty user to be the author
    let author = await User.findOne({ role: { $in: ['admin', 'faculty'] } });
    
    if (!author) {
      console.log('⚠️  No admin/faculty user found. Creating one...');
      author = await User.create({
        email: 'admin@pcc.edu.ph',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        authProvider: 'local',
        isActive: true
      });
      console.log('✅ Admin user created');
    }

    // Clear existing announcements (optional)
    await Announcement.deleteMany({});
    console.log('🗑️  Cleared existing announcements');

    // Sample announcements
    const announcements = [
      {
        title: 'Important: Midterm Examination Schedule Released',
        content: 'The midterm examination schedule for all programs has been released. Please check your student portal for your specific exam dates and times. Make sure to arrive 15 minutes before your scheduled exam. Bring your student ID and required materials. Good luck!',
        authorId: author._id,
        category: 'academic',
        priority: 'urgent',
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Tech Talk: Artificial Intelligence in Modern Education',
        content: 'Join us for an exciting tech talk on how AI is transforming education! Our guest speaker, Dr. Maria Santos from MIT, will discuss the latest trends and applications. Date: Next Friday, 2:00 PM - 4:00 PM. Venue: Auditorium Room 301. Free snacks and certificates will be provided!',
        authorId: author._id,
        category: 'events',
        priority: 'high',
        targetAudience: 'all',
        isPublished: true,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        title: 'Library Hours Extended During Finals Week',
        content: 'To support your studies during finals week, the library will be open 24/7 from December 10-17. Additional study rooms and computer stations will be available. Please maintain silence in designated quiet zones. Coffee and light refreshments will be available at the library café.',
        authorId: author._id,
        category: 'administrative',
        priority: 'normal',
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        title: 'New Online Learning Platform Launch',
        content: 'We are excited to announce the launch of our new online learning platform! Access course materials, submit assignments, and participate in discussions all in one place. Training sessions will be held next week. Check your email for login credentials and tutorial videos.',
        authorId: author._id,
        category: 'academic',
        priority: 'high',
        targetAudience: 'all',
        isPublished: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        title: 'Campus WiFi Maintenance Notice',
        content: 'The campus WiFi network will undergo scheduled maintenance this Saturday from 2:00 AM to 6:00 AM. Internet services will be temporarily unavailable during this period. We apologize for any inconvenience. Emergency contact: IT Helpdesk at ext. 2500.',
        authorId: author._id,
        category: 'administrative',
        priority: 'normal',
        targetAudience: 'all',
        isPublished: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        title: 'Student Council Elections - Nomination Period Open',
        content: 'The nomination period for Student Council elections is now open! If you are interested in running for a position, please submit your nomination form to the Student Affairs Office by next Friday. Campaign period starts on the 20th. Let your voice be heard!',
        authorId: author._id,
        category: 'events',
        priority: 'normal',
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        title: 'Career Fair 2024 - Meet Top Employers',
        content: 'Don\'t miss the biggest career fair of the year! Over 50 companies will be on campus looking for talented graduates and interns. Bring multiple copies of your resume. Professional attire required. Date: January 15, 2024. Time: 9:00 AM - 5:00 PM. Location: Main Gymnasium.',
        authorId: author._id,
        category: 'events',
        priority: 'high',
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        title: 'Scholarship Application Deadline Extended',
        content: 'Good news! The deadline for scholarship applications has been extended to December 31st. This includes academic merit scholarships, need-based grants, and athletic scholarships. Visit the Financial Aid Office or check the portal for application forms and requirements.',
        authorId: author._id,
        category: 'administrative',
        priority: 'high',
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        title: 'Faculty Development Workshop on Innovative Teaching Methods',
        content: 'All faculty members are invited to attend a workshop on innovative teaching methods and educational technology. Learn about flipped classrooms, gamification, and blended learning approaches. Date: Next Wednesday, 1:00 PM - 5:00 PM. Venue: Faculty Lounge. Lunch will be provided.',
        authorId: author._id,
        category: 'events',
        priority: 'normal',
        targetAudience: 'faculty',
        isPublished: true,
        publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        title: 'Reminder: Grade Submission Deadline',
        content: 'Faculty members, please be reminded that the deadline for submitting final grades is December 20th at 5:00 PM. Late submissions may delay the release of student transcripts. If you encounter any technical issues with the grading system, contact the Registrar\'s Office immediately.',
        authorId: author._id,
        category: 'administrative',
        priority: 'urgent',
        targetAudience: 'faculty',
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];

    // Insert announcements
    const created = await Announcement.insertMany(announcements);
    console.log(`✅ Created ${created.length} announcements`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   - Urgent: ${created.filter(a => a.priority === 'urgent').length}`);
    console.log(`   - High: ${created.filter(a => a.priority === 'high').length}`);
    console.log(`   - Normal: ${created.filter(a => a.priority === 'normal').length}`);
    console.log(`   - For Students: ${created.filter(a => a.targetAudience === 'students').length}`);
    console.log(`   - For Faculty: ${created.filter(a => a.targetAudience === 'faculty').length}`);
    console.log(`   - For All: ${created.filter(a => a.targetAudience === 'all').length}`);

    console.log('\n✨ Announcements seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding announcements:', error);
    process.exit(1);
  }
};

seedAnnouncements();
