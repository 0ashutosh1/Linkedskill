const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticate);

// Create a new notification
router.post('/', notificationController.createNotification);

// Get all notifications for the authenticated user
router.get('/', notificationController.getMyNotifications);

// Get unread notifications
router.get('/unread', notificationController.getUnreadNotifications);

// Get notifications by type
router.get('/type/:type', notificationController.getNotificationsByType);

// Get notifications by priority
router.get('/priority/:priority', notificationController.getNotificationsByPriority);

// Get connection-related notifications
router.get('/connections', notificationController.getConnectionNotifications);

// Handle notification actions (for connection requests)
router.post('/:id/action', notificationController.handleNotificationAction);

// Get a single notification by ID
router.get('/:id', notificationController.getNotificationById);

// Mark a notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read/all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Delete all read notifications
router.delete('/read/all', notificationController.deleteReadNotifications);

module.exports = router;
