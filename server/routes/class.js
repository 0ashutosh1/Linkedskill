const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

// Create a new class (protected route)
router.post('/', authenticate, classController.createClass);

// Upload class thumbnail (protected route - only for class owner) - MUST BE BEFORE /:id
router.post('/:id/upload-thumbnail', authenticate, uploadThumbnail.single('thumbnail'), classController.uploadThumbnail);

// Get all classes
router.get('/', classController.getAllClasses);

// Get personalized classes based on user interests (protected route) - MUST BE BEFORE /:id
router.get('/personalized/me', authenticate, classController.getPersonalizedClasses);

// Get classes where current user is registered (protected route) - MUST BE BEFORE /:id
router.get('/registered/me', authenticate, classController.getRegisteredClasses);

// Get all classes related to current user - both created and registered (protected route) - MUST BE BEFORE /:id
router.get('/my/all', authenticate, classController.getMyClasses);

// Get classes by user ID - MUST BE BEFORE /:id
router.get('/user/:userId', classController.getClassesByUser);

// Get a single class by ID
router.get('/:id', classController.getClassById);

// Update a class (protected route)
router.put('/:id', authenticate, classController.updateClass);

// Delete a class (protected route)
router.delete('/:id', authenticate, classController.deleteClass);

// Add attendee to a class (protected route)
router.post('/:id/attend', authenticate, classController.addAttendee);

// Remove attendee from a class (protected route)
router.delete('/:id/attend', authenticate, classController.removeAttendee);

// Mark attendance (protected route)
router.post('/:id/attendance', authenticate, classController.markAttendance);

// Start a class (protected route - only for class owner)
router.post('/:id/start', authenticate, classController.startClass);

// End a class (protected route - only for class owner)
router.post('/:id/end', authenticate, classController.endClass);

// Track student joining live class (protected route)
router.post('/:id/track-join', authenticate, classController.trackStudentJoin);

module.exports = router;
