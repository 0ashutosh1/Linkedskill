const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// All profile routes require authentication
router.use(authenticate);

// Upload profile photo
router.post('/upload-photo', uploadProfile.single('photo'), profileController.uploadProfilePhoto);

// Remove profile photo
router.delete('/remove-photo', profileController.removeProfilePhoto);

// Update user role (for onboarding)
router.put('/role', async (req, res) => {
  try {
    const User = require('../models/User');
    const { roleId } = req.body;
    
    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { roleId },
      { new: true }
    ).populate('roleId', 'name displayName');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Create or update profile
router.post('/', profileController.createOrUpdateProfile);
router.put('/', profileController.createOrUpdateProfile);

// Get authenticated user's profile
router.get('/me', profileController.getMyProfile);

// Check if profile is completed
router.get('/completion', profileController.checkProfileCompletion);
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
