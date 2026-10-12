const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiter.controller');
const { verifyToken, isRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.use(isRole(['RECRUITER', 'ADMIN']));

router.get('/company', recruiterController.getCompany);
router.put('/company', recruiterController.updateCompany);
router.get('/jobs', recruiterController.getMyJobs);
router.post('/jobs', recruiterController.createJob);
router.put('/jobs/:jobId', recruiterController.updateJob);
router.get('/jobs/:jobId/applicants', recruiterController.getJobApplicants);
router.patch('/applications/:applicationId/status', recruiterController.updateApplicationStatus);
router.post('/interviews', recruiterController.scheduleInterview);
router.get('/interviews', recruiterController.getMyInterviews);
router.post('/offers', recruiterController.issueOffer);

module.exports = router;
