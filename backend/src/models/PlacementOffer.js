const mongoose = require('mongoose');

const placementOfferSchema = new mongoose.Schema({
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
  designation: {
    type: String,
    required: true,
  },
  ctc: {
    type: String,
    required: true, // e.g. "₹14,50,000 PA"
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  offerLetterUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['OFFERED', 'ACCEPTED', 'DECLINED'],
    default: 'OFFERED',
  },
}, { timestamps: true });

module.exports = mongoose.model('PlacementOffer', placementOfferSchema);
