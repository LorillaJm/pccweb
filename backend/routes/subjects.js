const express = require('express');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
const User = require('../models/User');
const { requireStudent, requireFaculty, requireAnyRole } = require('../middleware/sessionAuth');

const router = express.Router();

// Get available subjects for students
router.get('/available', ...requireStudent, async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Get student's profile information
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get available class sections
    const availableSections = await ClassSection.find({
      isActive: true,
      $expr: { $lt: ['$enrolledStudents', '$maxStudents'] }
    })
      .populate('subjectId', 'subjectCode subjectName description units prerequisites yearLevel')
      .populate('facultyId', 'firstName lastName')
      .sort({ 'subjectId.subjectCode': 1 });

    // Filter sections and check enrollment status
    const subjects = availableSections.map(section => {
      const isEnrolled = section.enrollments && section.enrollments.some(
        enrollment => enrollment.studentId.toString() === studentId.toString() &&
          enrollment.status === 'enrolled'
      );

      return {
        sectionId: section._id,
        sectionName: section.sectionName,
        schedule: section.schedule,
        room: section.room,
        maxStudents: section.maxStudents,
        enrolledStudents: section.enrolledStudents,
        academicYear: section.academicYear,
        semester: section.semester,
        subjectCode: section.subjectId.subjectCode,
        subjectName: section.subjectId.subjectName,
        description: section.subjectId.description,
        units: section.subjectId.units,
        prerequisites: section.subjectId.prerequisites,
        facultyName: section.facultyId ? `${section.facultyId.firstName} ${section.facultyId.lastName}` : 'TBA',
        isEnrolled
      };
    });

    res.json({
      success: true,
      data: {
        subjects,
        studentInfo: {
          yearLevel: student.yearLevel || 1,
          program: student.program || 'General',
          semester: 1 // Default semester
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get enrolled subjects for student
router.get('/enrolled', ...requireStudent, async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Find class sections where student is enrolled
    const enrolledSections = await ClassSection.find({
      'enrollments.studentId': studentId,
      'enrollments.status': 'enrolled',
      isActive: true
    })
      .populate('subjectId', 'subjectCode subjectName description units')
      .populate('facultyId', 'firstName lastName email')
      .sort({ 'subjectId.subjectCode': 1 });

    // Transform data to match expected format
    const enrolledSubjects = enrolledSections.map(section => {
      const enrollment = section.enrollments.find(e =>
        e.studentId.toString() === studentId.toString() && e.status === 'enrolled'
      );

      return {
        sectionId: section._id,
        sectionName: section.sectionName,
        schedule: section.schedule,
        room: section.room,
        maxStudents: section.maxStudents,
        enrolledStudents: section.enrolledStudents,
        academicYear: section.academicYear,
        semester: section.semester,
        subjectCode: section.subjectId.subjectCode,
        subjectName: section.subjectId.subjectName,
        description: section.subjectId.description,
        units: section.subjectId.units,
        facultyName: section.facultyId ? `${section.facultyId.firstName} ${section.facultyId.lastName}` : 'TBA',
        isEnrolled: true,
        materialCount: 0 // Will be updated when materials system is implemented
      };
    });

    res.json({
      success: true,
      data: {
        enrolledSubjects
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get faculty's assigned subjects
router.get('/assigned', ...requireFaculty, async (req, res, next) => {
  try {
    const facultyId = req.user._id;

    // Find class sections assigned to this faculty
    const assignedSections = await ClassSection.find({
      facultyId: facultyId,
      isActive: true
    })
      .populate('subjectId', 'subjectCode subjectName description units')
      .sort({ 'subjectId.subjectCode': 1, sectionName: 1 });

    // Transform data to match expected format
    const assignedSubjects = assignedSections.map(section => ({
      sectionId: section._id,
      sectionName: section.sectionName,
      schedule: section.schedule,
      room: section.room,
      maxStudents: section.maxStudents,
      enrolledStudents: section.enrolledStudents,
      academicYear: section.academicYear,
      semester: section.semester,
      subjectCode: section.subjectId.subjectCode,
      subjectName: section.subjectId.subjectName,
      description: section.subjectId.description,
      units: section.subjectId.units,
      materialCount: 0 // Will be updated when materials system is implemented
    }));

    res.json({
      success: true,
      data: {
        assignedSubjects
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get students in a specific section (faculty only)
router.get('/section/:sectionId/students', ...requireFaculty, async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const facultyId = req.user._id;

    // Verify faculty owns this section
    const section = await ClassSection.findOne({
      _id: sectionId,
      facultyId: facultyId,
      isActive: true
    });

    if (!section) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this section'
      });
    }

    // Get enrolled students
    const enrolledStudents = section.enrollments
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment => ({
        enrollmentId: enrollment._id,
        enrollmentDate: enrollment.enrolledAt,
        status: enrollment.status,
        grade: enrollment.grade || null,
        studentId: enrollment.studentId
      }));

    // Populate student details
    const studentIds = enrolledStudents.map(e => e.studentId);
    const students = await User.find({
      _id: { $in: studentIds }
    }).select('firstName lastName middleName email studentId program yearLevel');

    // Combine enrollment and student data
    const studentsWithDetails = enrolledStudents.map(enrollment => {
      const student = students.find(s => s._id.toString() === enrollment.studentId.toString());
      return {
        enrollmentId: enrollment.enrollmentId,
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status,
        grade: enrollment.grade,
        studentId: student._id,
        studentNumber: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
        email: student.email,
        program: student.program,
        yearLevel: student.yearLevel
      };
    });

    res.json({
      success: true,
      data: {
        students: studentsWithDetails
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;