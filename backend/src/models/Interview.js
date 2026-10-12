const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
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
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  roundName: {
    type: String,
    default: 'Technical Round 1',
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  mode: {
    type: String,
    enum: ['ONLINE', 'OFFLINE'],
    default: 'ONLINE',
  },
  meetingLinkOrVenue: {
    type: String,
    default: 'https://meet.google.com/xyz-placement',
  },
  instructions: {
    type: String,
    default: 'Please be ready with your resume and project demonstrations.',
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
  },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
