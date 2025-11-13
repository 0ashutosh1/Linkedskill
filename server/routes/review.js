const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// Submit a review (protected - students only)
router.post('/', authenticate, reviewController.createReview);

// Get reviews for an expert
router.get('/expert/:expertId', reviewController.getExpertReviews);

// Get reviews for a class
router.get('/class/:classId', reviewController.getClassReviews);

// Check if student can review a class
router.get('/can-review/:classId', authenticate, reviewController.canReviewClass);

// Update a review (protected - review owner only)
router.put('/:reviewId', authenticate, reviewController.updateReview);

// Delete a review (protected - review owner only)
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;
