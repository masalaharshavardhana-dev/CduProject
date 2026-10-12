const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken, isRole } = require('../middlewares/auth.middleware');

// All routes require authenticated student
router.use(verifyToken);
router.use(isRole(['STUDENT']));

router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/jobs', studentController.getJobsWithEligibility);
router.post('/jobs/:jobId/apply', studentController.applyToJob);
router.get('/applications', studentController.getMyApplications);
router.post('/offers/:offerId/respond', studentController.respondToOffer);

module.exports = router;
