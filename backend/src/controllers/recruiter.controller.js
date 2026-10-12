const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Interview = require('../models/Interview');
const PlacementOffer = require('../models/PlacementOffer');
const Notification = require('../models/Notification');

// Get company profile for recruiter
exports.getCompany = async (req, res) => {
  try {
    let company = await Company.findOne({ recruiterId: req.user.id });
    if (!company) {
      company = new Company({
        recruiterId: req.user.id,
        name: 'My Company',
        description: 'Leading innovations',
        industry: 'Technology',
        location: 'Hyderabad / Bangalore',
        status: 'APPROVED',
      });
      await company.save();
    }
    res.status(200).json(company);
  } catch (error) {
    console.error('getCompany error:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

// Update company profile
exports.updateCompany = async (req, res) => {
  try {
    const { name, description, website, industry, location } = req.body;
    let company = await Company.findOne({ recruiterId: req.user.id });
    if (!company) {
      company = new Company({ recruiterId: req.user.id });
    }

    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (industry) company.industry = industry;
    if (location) company.location = location;

    await company.save();
    res.status(200).json({ message: 'Company profile updated', company });
  } catch (error) {
    console.error('updateCompany error:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
};

// Get all jobs posted by this recruiter
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });

    // Attach applicant counts to each job
    const jobsWithMetrics = await Promise.all(
      jobs.map(async (job) => {
        const totalApplicants = await Application.countDocuments({ jobId: job._id });
        const shortlisted = await Application.countDocuments({ jobId: job._id, status: 'SHORTLISTED' });
        const interviews = await Application.countDocuments({ jobId: job._id, status: 'INTERVIEW_SCHEDULED' });
        const offered = await Application.countDocuments({ jobId: job._id, status: 'OFFERED' });

        return {
          ...job.toObject(),
          stats: {
            totalApplicants,
            shortlisted,
            interviews,
            offered,
          },
        };
      })
    );

    res.status(200).json(jobsWithMetrics);
  } catch (error) {
    console.error('getMyJobs error:', error);
    res.status(500).json({ error: 'Failed to fetch posted jobs' });
  }
};

// Create a new job posting
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      roleType,
      location,
      salaryOrStipend,
      minCgpa,
      maxBacklogs,
      eligibleDepartments,
      skillsRequired,
      deadline,
    } = req.body;

    if (!title || !description || !salaryOrStipend || !deadline) {
      return res.status(400).json({ error: 'Title, description, salary/stipend, and deadline are required' });
    }

    let company = await Company.findOne({ recruiterId: req.user.id });
    if (!company) {
      company = await Company.create({
        recruiterId: req.user.id,
        name: 'Recruiter Company',
        status: 'APPROVED',
      });
    }

    const newJob = new Job({
      companyId: company._id,
      recruiterId: req.user.id,
      title,
      description,
      roleType: roleType || 'FULL_TIME',
      location: location || company.location || 'Remote',
      salaryOrStipend,
      minCgpa: minCgpa !== undefined ? parseFloat(minCgpa) : 6.0,
      maxBacklogs: maxBacklogs !== undefined ? parseInt(maxBacklogs) : 0,
      eligibleDepartments: eligibleDepartments || ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      skillsRequired: skillsRequired || [],
      deadline: new Date(deadline),
      status: 'APPROVED',
    });

    await newJob.save();
    res.status(201).json({ message: 'Job opening posted successfully', job: newJob });
  } catch (error) {
    console.error('createJob error:', error);
    res.status(500).json({ error: error.message || 'Failed to create job posting' });
  }
};

// Update job opening
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user.id });
    if (!job) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Get applicants for a job
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const filter = jobId && jobId !== 'all' ? { jobId } : {};

    // If recruiter requests all applicants across their posted jobs
    if (!jobId || jobId === 'all') {
      const myJobs = await Job.find({ recruiterId: req.user.id }).select('_id');
      const jobIds = myJobs.map(j => j._id);
      filter.jobId = { $in: jobIds };
    }

    const applications = await Application.find(filter)
      .populate('studentId')
      .populate('jobId')
      .sort({ createdAt: -1 });

    // Fetch any interviews scheduled for these applications
    const interviews = await Interview.find({ applicationId: { $in: applications.map(a => a._id) } });
    const interviewMap = new Map();
    interviews.forEach(i => interviewMap.set(i.applicationId.toString(), i));

    const results = applications.map(app => ({
      ...app.toObject(),
      interview: interviewMap.get(app._id.toString()) || null,
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error('getJobApplicants error:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

// Update status of an application
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;

    const allowed = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findById(applicationId)
      .populate('studentId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    if (feedback !== undefined) application.feedback = feedback;
    await application.save();

    // Notify student about status change
    if (application.studentId?.userId) {
      await Notification.create({
        userId: application.studentId.userId,
        title: `Application Status Updated: ${status}`,
        message: `Your application for ${application.jobId?.title} has been moved to status: ${status}`,
        type: 'APPLICATION_UPDATE',
        link: '/student/dashboard?tab=applications',
      });
    }

    res.status(200).json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Schedule an Interview
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      roundName,
      scheduledAt,
      mode,
      meetingLinkOrVenue,
      instructions,
    } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ error: 'Application ID and scheduled date/time are required' });
    }

    const application = await Application.findById(applicationId)
      .populate('studentId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Upsert interview
    let interview = await Interview.findOne({ applicationId });
    if (!interview) {
      interview = new Interview({
        applicationId,
        studentId: application.studentId._id,
        jobId: application.jobId._id,
        companyId: application.jobId.companyId,
      });
    }

    interview.roundName = roundName || 'Technical Round';
    interview.scheduledAt = new Date(scheduledAt);
    interview.mode = mode || 'ONLINE';
    interview.meetingLinkOrVenue = meetingLinkOrVenue || 'https://meet.google.com/cdu-interview';
    interview.instructions = instructions || 'Please join on time with your camera enabled.';
    interview.status = 'SCHEDULED';

    await interview.save();

    // Advance application status
    application.status = 'INTERVIEW_SCHEDULED';
    await application.save();

    // Create Notification for the student
    if (application.studentId?.userId) {
      await Notification.create({
        userId: application.studentId.userId,
        title: `Interview Scheduled for ${application.jobId.title}! 📅`,
        message: `${interview.roundName} scheduled on ${new Date(interview.scheduledAt).toLocaleString()}. Link/Venue: ${interview.meetingLinkOrVenue}`,
        type: 'INTERVIEW',
        link: '/student/dashboard?tab=applications',
      });
    }

    res.status(201).json({ message: 'Interview scheduled successfully', interview });
  } catch (error) {
    console.error('scheduleInterview error:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
};

// Release / Issue Placement Offer
exports.issueOffer = async (req, res) => {
  try {
    const {
      applicationId,
      designation,
      ctc,
      joiningDate,
      offerLetterUrl,
    } = req.body;

    if (!applicationId || !designation || !ctc || !joiningDate) {
      return res.status(400).json({ error: 'Application ID, designation, CTC, and joining date are required' });
    }

    const application = await Application.findById(applicationId)
      .populate('studentId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    let offer = await PlacementOffer.findOne({ applicationId });
    if (!offer) {
      offer = new PlacementOffer({
        applicationId,
        studentId: application.studentId._id,
        jobId: application.jobId._id,
        companyId: application.jobId.companyId,
      });
    }

    offer.designation = designation;
    offer.ctc = ctc;
    offer.joiningDate = new Date(joiningDate);
    offer.offerLetterUrl = offerLetterUrl || 'https://drive.google.com/file/d/sample-offer-letter/view';
    offer.status = 'OFFERED';

    await offer.save();

    // Advance application status
    application.status = 'OFFERED';
    await application.save();

    // Notify student
    if (application.studentId?.userId) {
      await Notification.create({
        userId: application.studentId.userId,
        title: `Offer Letter Received from ${application.jobId.title}! 🌟`,
        message: `Congratulations! You received an offer of ${ctc} for the position of ${designation}. Review and accept in your portal.`,
        type: 'OFFER',
        link: '/student/dashboard?tab=offers',
      });
    }

    res.status(201).json({ message: 'Offer released successfully', offer });
  } catch (error) {
    console.error('issueOffer error:', error);
    res.status(500).json({ error: 'Failed to release placement offer' });
  }
};

// Get all interviews scheduled by this recruiter
exports.getMyInterviews = async (req, res) => {
  try {
    const myJobs = await Job.find({ recruiterId: req.user.id }).select('_id');
    const jobIds = myJobs.map(j => j._id);

    const interviews = await Interview.find({ jobId: { $in: jobIds } })
      .populate('studentId')
      .populate('jobId')
      .sort({ scheduledAt: 1 });

    res.status(200).json(interviews);
  } catch (error) {
    console.error('getMyInterviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};
