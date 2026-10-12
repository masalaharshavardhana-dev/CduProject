const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const PlacementOffer = require('../models/PlacementOffer');

// Aggregated Placement Portal Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ isPlaced: true });
    const totalCompanies = await Company.countDocuments({ status: 'APPROVED' });
    const pendingCompanies = await Company.countDocuments({ status: 'PENDING' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'APPROVED' });
    const totalApplications = await Application.countDocuments();
    const totalOffers = await PlacementOffer.countDocuments();

    // Application funnel breakdown
    const appliedCount = await Application.countDocuments({ status: 'APPLIED' });
    const shortlistedCount = await Application.countDocuments({ status: 'SHORTLISTED' });
    const interviewCount = await Application.countDocuments({ status: 'INTERVIEW_SCHEDULED' });
    const offeredCount = await Application.countDocuments({ status: 'OFFERED' });
    const rejectedCount = await Application.countDocuments({ status: 'REJECTED' });

    // Department-wise distribution
    const departments = ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical', 'Electrical'];
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const totalInDept = await StudentProfile.countDocuments({ department: dept });
        const placedInDept = await StudentProfile.countDocuments({ department: dept, isPlaced: true });
        return {
          department: dept,
          total: totalInDept,
          placed: placedInDept,
          placementRate: totalInDept > 0 ? Math.round((placedInDept / totalInDept) * 100) : 0,
        };
      })
    );

    // Status distribution data for recharts
    const funnelData = [
      { name: 'Applied', value: appliedCount, color: '#3b82f6' },
      { name: 'Shortlisted', value: shortlistedCount, color: '#8b5cf6' },
      { name: 'Interview', value: interviewCount, color: '#f59e0b' },
      { name: 'Offered', value: offeredCount, color: '#10b981' },
      { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
    ];

    res.status(200).json({
      metrics: {
        totalStudents,
        placedStudents,
        placementPercentage: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
        totalCompanies,
        pendingCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        totalOffers,
      },
      departmentStats,
      funnelData,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Failed to generate placement analytics' });
  }
};

// Get all companies with approval controls
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('recruiterId', 'email').sort({ createdAt: -1 });
    res.status(200).json(companies);
  } catch (error) {
    console.error('getAllCompanies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Approve or reject company
exports.updateCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const company = await Company.findByIdAndUpdate(companyId, { status }, { new: true });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json({ message: `Company status updated to ${status}`, company });
  } catch (error) {
    console.error('updateCompanyStatus error:', error);
    res.status(500).json({ error: 'Failed to update company status' });
  }
};

// Get all jobs across platform
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('companyId').sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('getAllJobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Approve or reject job
exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({ message: `Job status updated to ${status}`, job });
  } catch (error) {
    console.error('updateJobStatus error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find().populate('userId', 'email').sort({ cgpa: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get all applications system-wide
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('studentId')
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' }
      })
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    console.error('getAllApplications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};
