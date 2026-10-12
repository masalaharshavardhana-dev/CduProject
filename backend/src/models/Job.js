const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  roleType: {
    type: String,
    enum: ['INTERNSHIP', 'FULL_TIME'],
    default: 'FULL_TIME',
  },
  location: {
    type: String,
    default: 'Hyderabad / Bangalore',
  },
  salaryOrStipend: {
    type: String,
    required: true, // e.g. "₹8,00,000 - ₹12,00,000 PA" or "₹40,000/month"
  },
  minCgpa: {
    type: Number,
    default: 6.0,
  },
  maxBacklogs: {
    type: Number,
    default: 0,
  },
  eligibleDepartments: {
    type: [String],
    default: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED'],
    default: 'APPROVED', // Can be toggled by Admin
  },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
