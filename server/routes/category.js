const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');

// Create a new category (protected)
router.post('/', authenticate, categoryController.createCategory);

// Get all categories (public)
router.get('/', categoryController.getAllCategories);

// Get category by ID (public)
router.get('/:id', categoryController.getCategoryById);

// Update category (protected)
router.put('/:id', authenticate, categoryController.updateCategory);

// Delete category (protected)
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;
