const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

// All profile routes require authentication
router.use(authenticate);

// Create or update profile
router.post('/', profileController.createOrUpdateProfile);
router.put('/', profileController.createOrUpdateProfile);

// Get authenticated user's profile
router.get('/me', profileController.getMyProfile);

// Check if profile is completed
router.get('/check-completion', profileController.checkProfileCompletion);

// Get all profiles (for search/admin)
router.get('/all', profileController.getAllProfiles);

// Get expert profiles only
router.get('/experts', profileController.getExpertProfiles);

// Search profiles by interest
router.get('/search', profileController.searchByInterest);

// Get profile by user ID
router.get('/:userId', profileController.getProfileByUserId);

// Delete profile
router.delete('/', profileController.deleteProfile);

module.exports = router;
