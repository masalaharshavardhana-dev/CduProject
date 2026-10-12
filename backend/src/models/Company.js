const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    default: 'Technology',
  },
  location: {
    type: String,
    default: 'Remote / On-site',
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED', // default approved for ease of use in demo, admin can toggle
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
