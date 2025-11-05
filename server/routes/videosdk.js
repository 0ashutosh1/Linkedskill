const express = require('express');
const router = express.Router();
const videoSdkController = require('../controllers/videoSdkController');
const { authenticate } = require('../middleware/auth');

// Generate VideoSDK token
router.get('/token', authenticate, videoSdkController.generateToken);

// Create a new meeting
router.post('/create-meeting', authenticate, videoSdkController.createMeeting);

// Validate a meeting
router.get('/validate/:meetingId', authenticate, videoSdkController.validateMeeting);

module.exports = router;
