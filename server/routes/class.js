const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate } = require('../middleware/auth');

// Create a new class (protected route)
router.post('/', authenticate, classController.createClass);

// Get all classes
router.get('/', classController.getAllClasses);

// Get a single class by ID
router.get('/:id', classController.getClassById);

// Get classes by user ID
router.get('/user/:userId', classController.getClassesByUser);

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

module.exports = router;
