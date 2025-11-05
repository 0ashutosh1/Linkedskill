const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');

/**
 * Job Management Routes
 * All routes are protected and should be admin-only
 */

// Get scheduler statistics
router.get('/stats', authenticate, jobController.getSchedulerStats);

// Get all scheduled jobs
router.get('/', authenticate, jobController.getAllJobs);

// Get jobs for a specific class
router.get('/class/:classId', authenticate, jobController.getClassJobs);

// Reschedule a specific job
router.put('/:jobId/reschedule', authenticate, jobController.rescheduleJob);

// Cancel a specific job
router.delete('/:jobId', authenticate, jobController.cancelJob);

module.exports = router;
