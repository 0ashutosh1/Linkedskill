const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');

// Create a new role (protected - admin only in production)
router.post('/', authenticate, roleController.createRole);

// Get all roles (public - needed for signup)
router.get('/', roleController.getAllRoles);

// Get role by name (public)
router.get('/name/:name', roleController.getRoleByName);

// Get role by ID (public)
router.get('/:id', roleController.getRoleById);

// Update role (protected)
router.put('/:id', authenticate, roleController.updateRole);

// Delete role (protected)
router.delete('/:id', authenticate, roleController.deleteRole);

module.exports = router;
