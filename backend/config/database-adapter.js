// Temporary adapter to make PostgreSQL queries work with MongoDB
// This allows existing routes to work while we migrate to full Mongoose models

const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
const StudentEnrollment = require('../models/StudentEnrollment');
const ClassMaterial = require('../models/ClassMaterial');

// Simple query adapter that converts basic PostgreSQL queries to MongoDB operations
const query = async (sqlQuery, params = []) => {
  try {
    // Handle basic SELECT queries
    if (sqlQuery.includes('SELECT') && sqlQuery.includes('FROM users')) {
      if (sqlQuery.includes('WHERE email = $1')) {
        const user = await User.findOne({ email: params[0] });
        return { rows: user ? [user.toObject()] : [] };
      }
      if (sqlQuery.includes('WHERE id = $1')) {
        const user = await User.findById(params[0]);
        return { rows: user ? [user.toObject()] : [] };
      }
    }

    // Handle user updates
    if (sqlQuery.includes('UPDATE users')) {
      const userId = params[params.length - 1]; // Usually last parameter
      const updateData = {};
      
      // Extract update fields (this is a simplified approach)
      if (params[0]) updateData.firstName = params[0];
      if (params[1]) updateData.lastName = params[1];
      if (params[2]) updateData.middleName = params[2];
      
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      return { rows: user ? [user.toObject()] : [] };
    }

    // Handle announcements
    if (sqlQuery.includes('FROM announcements')) {
      const announcements = await Announcement.find().populate('authorId', 'firstName lastName');
      return { rows: announcements.map(a => a.toObject()) };
    }

    // Handle subjects
    if (sqlQuery.includes('FROM subjects')) {
      const subjects = await Subject.find();
      return { rows: subjects.map(s => s.toObject()) };
    }

    // Handle class sections
    if (sqlQuery.includes('FROM class_sections')) {
      const sections = await ClassSection.find().populate('subjectId').populate('facultyId', 'firstName lastName');
      return { rows: sections.map(s => s.toObject()) };
    }

    // Handle enrollments
    if (sqlQuery.includes('FROM student_enrollments')) {
      const enrollments = await StudentEnrollment.find()
        .populate('studentId', 'firstName lastName email studentId')
        .populate({
          path: 'sectionId',
          populate: {
            path: 'subjectId',
            select: 'subjectCode subjectName'
          }
        });
      return { rows: enrollments.map(e => e.toObject()) };
    }

    // Handle materials
    if (sqlQuery.includes('FROM class_materials')) {
      const materials = await ClassMaterial.find()
        .populate('facultyId', 'firstName lastName')
        .populate('sectionId');
      return { rows: materials.map(m => m.toObject()) };
    }

    // For unsupported queries, return empty result
    console.warn('Unsupported query:', sqlQuery);
    return { rows: [] };

  } catch (error) {
    console.error('Database adapter error:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool: null // Not needed for MongoDB
};