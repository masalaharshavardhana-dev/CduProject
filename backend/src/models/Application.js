const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  status: {
    type: String,
    enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'],
    default: 'APPLIED',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Prevent duplicate applications by same student to the same job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
