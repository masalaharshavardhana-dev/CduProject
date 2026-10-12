const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const PlacementOffer = require('../models/PlacementOffer');
const Notification = require('../models/Notification');
const Company = require('../models/Company');

// Get current student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'email role');
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      rollNumber,
      department,
      program,
      graduationYear,
      cgpa,
      backlogCount,
      skills,
      resumeUrl,
      githubUrl,
      linkedinUrl,
    } = req.body;

    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    if (fullName) student.fullName = fullName;
    if (phone !== undefined) student.phone = phone;
    if (rollNumber) student.rollNumber = rollNumber;
    if (department) student.department = department;
    if (program) student.program = program;
    if (graduationYear) student.graduationYear = parseInt(graduationYear);
    if (cgpa !== undefined) student.cgpa = parseFloat(cgpa);
    if (backlogCount !== undefined) student.backlogCount = parseInt(backlogCount);
    if (skills) student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    if (resumeUrl !== undefined) student.resumeUrl = resumeUrl;
    if (githubUrl !== undefined) student.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) student.linkedinUrl = linkedinUrl;

    await student.save();
    res.status(200).json({ message: 'Profile updated successfully', student });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
};

// Get all approved jobs with real-time eligibility check for this student
exports.getJobsWithEligibility = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Fetch approved jobs and populate company
    const jobs = await Job.find({ status: 'APPROVED' })
      .populate('companyId', 'name description website industry location')
      .sort({ createdAt: -1 });

    // Fetch student's existing applications
    const applications = await Application.find({ studentId: student._id });
    const appliedMap = new Map();
    applications.forEach(app => {
      appliedMap.set(app.jobId.toString(), {
        status: app.status,
        appliedAt: app.appliedAt,
        applicationId: app._id,
      });
    });

    const evaluatedJobs = jobs.map(job => {
      const reasons = [];

      // CGPA Check
      if (student.cgpa < job.minCgpa) {
        reasons.push(`Minimum CGPA requirement is ${job.minCgpa} (your CGPA: ${student.cgpa})`);
      }

      // Backlog Check
      if (student.backlogCount > job.maxBacklogs) {
        reasons.push(`Maximum allowed backlogs is ${job.maxBacklogs} (your backlogs: ${student.backlogCount})`);
      }

      // Department Check
      if (
        job.eligibleDepartments &&
        job.eligibleDepartments.length > 0 &&
        !job.eligibleDepartments.includes(student.department)
      ) {
        reasons.push(`Eligible departments: ${job.eligibleDepartments.join(', ')} (your department: ${student.department})`);
      }

      // Deadline Check
      const isExpired = new Date(job.deadline) < new Date();
      if (isExpired) {
        reasons.push(`Application deadline has passed (${new Date(job.deadline).toLocaleDateString()})`);
      }

      const applicationInfo = appliedMap.get(job._id.toString());

      return {
        ...job.toObject(),
        isEligible: reasons.length === 0,
        ineligibilityReasons: reasons,
        hasApplied: !!applicationInfo,
        application: applicationInfo || null,
        isExpired,
      };
    });

    res.status(200).json(evaluatedJobs);
  } catch (error) {
    console.error('getJobsWithEligibility error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resumeUrl } = req.body;

    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const job = await Job.findById(jobId).populate('companyId');
    if (!job || job.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Job opening not found or not active' });
    }

    // Check deadline
    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({ error: 'Application deadline has already passed' });
    }

    // Check duplicate application
    const existing = await Application.findOne({ studentId: student._id, jobId: job._id });
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Server-side Eligibility Verification
    if (student.cgpa < job.minCgpa) {
      return res.status(400).json({ 
        error: `Ineligible: Minimum CGPA required is ${job.minCgpa}, but your CGPA is ${student.cgpa}` 
      });
    }

    if (student.backlogCount > job.maxBacklogs) {
      return res.status(400).json({ 
        error: `Ineligible: Maximum active backlogs permitted is ${job.maxBacklogs}, but you have ${student.backlogCount}` 
      });
    }

    if (
      job.eligibleDepartments &&
      job.eligibleDepartments.length > 0 &&
      !job.eligibleDepartments.includes(student.department)
    ) {
      return res.status(400).json({ 
        error: `Ineligible: Your department (${student.department}) is not among the eligible departments` 
      });
    }

    const applicationResume = resumeUrl || student.resumeUrl || 'https://drive.google.com/view/sample-resume';

    const newApplication = new Application({
      studentId: student._id,
      jobId: job._id,
      status: 'APPLIED',
      resumeUrl: applicationResume,
    });

    await newApplication.save();

    // Create In-App Notification for Student
    await Notification.create({
      userId: req.user.id,
      title: 'Application Submitted Successfully! 🎉',
      message: `You applied for ${job.title} at ${job.companyId?.name || 'the company'}. Status: APPLIED`,
      type: 'APPLICATION_UPDATE',
      link: '/student/dashboard?tab=applications',
    });

    // Create Notification for Recruiter
    if (job.recruiterId) {
      await Notification.create({
        userId: job.recruiterId,
        title: 'New Candidate Applied',
        message: `${student.fullName} (${student.department}, CGPA: ${student.cgpa}) applied for ${job.title}`,
        type: 'JOB_ALERT',
        link: '/recruiter/dashboard?tab=applicants',
      });
    }

    res.status(201).json({ 
      message: 'Successfully applied to job!', 
      application: newApplication 
    });
  } catch (error) {
    console.error('applyToJob error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
};

// Get all applications submitted by student
exports.getMyApplications = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' }
      })
      .sort({ createdAt: -1 });

    // Fetch related interviews and offers
    const interviews = await Interview.find({ studentId: student._id });
    const offers = await PlacementOffer.find({ studentId: student._id });

    const interviewMap = new Map();
    interviews.forEach(i => interviewMap.set(i.applicationId.toString(), i));

    const offerMap = new Map();
    offers.forEach(o => offerMap.set(o.applicationId.toString(), o));

    const detailedApplications = applications.map(app => ({
      ...app.toObject(),
      interview: interviewMap.get(app._id.toString()) || null,
      offer: offerMap.get(app._id.toString()) || null,
    }));

    res.status(200).json(detailedApplications);
  } catch (error) {
    console.error('getMyApplications error:', error);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
};

// Respond to Placement Offer (Accept / Decline)
exports.respondToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { action } = req.body; // 'ACCEPTED' or 'DECLINED'

    if (!['ACCEPTED', 'DECLINED'].includes(action)) {
      return res.status(400).json({ error: 'Action must be ACCEPTED or DECLINED' });
    }

    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const offer = await PlacementOffer.findOne({ _id: offerId, studentId: student._id }).populate('companyId jobId');
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    offer.status = action;
    await offer.save();

    if (action === 'ACCEPTED') {
      student.isPlaced = true;
      await student.save();
    }

    // Update application
    await Application.findByIdAndUpdate(offer.applicationId, {
      status: action === 'ACCEPTED' ? 'OFFERED' : 'REJECTED',
    });

    // Notify student
    await Notification.create({
      userId: req.user.id,
      title: action === 'ACCEPTED' ? 'Congratulations on your Placement! 🎓' : 'Offer Declined',
      message: `You have ${action.toLowerCase()} the offer for ${offer.designation} at ${offer.companyId?.name}.`,
      type: 'OFFER',
    });

    res.status(200).json({ message: `Offer ${action.toLowerCase()} successfully`, offer });
  } catch (error) {
    console.error('respondToOffer error:', error);
    res.status(500).json({ error: 'Failed to respond to offer' });
  }
};
