const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.use(isRole(['ADMIN']));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/companies', adminController.getAllCompanies);
router.patch('/companies/:companyId/status', adminController.updateCompanyStatus);
router.get('/jobs', adminController.getAllJobs);
router.patch('/jobs/:jobId/status', adminController.updateJobStatus);
router.get('/students', adminController.getAllStudents);
router.get('/applications', adminController.getAllApplications);

module.exports = router;
