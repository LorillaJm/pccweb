const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schedule: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  maxStudents: {
    type: Number,
    required: true,
    min: 1,
    default: 40
  },
  enrolledStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollments: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'dropped', 'completed'],
      default: 'enrolled'
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
classSectionSchema.index({ subjectId: 1, academicYear: 1, semester: 1 });
classSectionSchema.index({ facultyId: 1 });
classSectionSchema.index({ 'enrollments.studentId': 1 });
classSectionSchema.index({ isActive: 1 });

// Virtual for available slots
classSectionSchema.virtual('availableSlots').get(function() {
  return this.maxStudents - this.enrolledStudents;
});

// Virtual for subject details
classSectionSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subjectId',
  foreignField: '_id',
  justOne: true
});

// Virtual for faculty details
classSectionSchema.virtual('faculty', {
  ref: 'User',
  localField: 'facultyId',
  foreignField: '_id',
  justOne: true
});

// Method to check if student is enrolled
classSectionSchema.methods.isStudentEnrolled = function(studentId) {
  return this.enrollments.some(enrollment => 
    enrollment.studentId.toString() === studentId.toString() && 
    enrollment.status === 'enrolled'
  );
};

// Method to enroll student
classSectionSchema.methods.enrollStudent = function(studentId) {
  if (this.enrolledStudents >= this.maxStudents) {
    throw new Error('Section is full');
  }
  
  if (this.isStudentEnrolled(studentId)) {
    throw new Error('Student is already enrolled');
  }
  
  this.enrollments.push({ studentId });
  this.enrolledStudents += 1;
  return this.save();
};

// Method to drop student
classSectionSchema.methods.dropStudent = function(studentId) {
  const enrollment = this.enrollments.find(e => 
    e.studentId.toString() === studentId.toString() && 
    e.status === 'enrolled'
  );
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this section');
  }
  
  enrollment.status = 'dropped';
  this.enrolledStudents -= 1;
  return this.save();
};

module.exports = mongoose.model('ClassSection', classSectionSchema);
