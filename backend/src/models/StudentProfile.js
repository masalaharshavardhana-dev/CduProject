const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    default: 'Computer Science',
  },
  program: {
    type: String,
    default: 'B.Tech',
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  cgpa: {
    type: Number,
    required: true,
    default: 0.0,
  },
  backlogCount: {
    type: Number,
    default: 0,
  },
  skills: {
    type: [String],
    default: [],
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  githubUrl: {
    type: String,
    default: '',
  },
  linkedinUrl: {
    type: String,
    default: '',
  },
  isPlaced: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
