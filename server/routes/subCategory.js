const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const { authenticate } = require('../middleware/auth');

// Create a new subcategory (protected)
router.post('/', authenticate, subCategoryController.createSubCategory);

// Get all subcategories (public)
router.get('/', subCategoryController.getAllSubCategories);

// Get subcategories by category ID (public)
router.get('/category/:categoryId', subCategoryController.getSubCategoriesByCategory);

// Get subcategory by ID (public)
router.get('/:id', subCategoryController.getSubCategoryById);

// Update subcategory (protected)
router.put('/:id', authenticate, subCategoryController.updateSubCategory);

// Delete subcategory (protected)
router.delete('/:id', authenticate, subCategoryController.deleteSubCategory);

module.exports = router;
