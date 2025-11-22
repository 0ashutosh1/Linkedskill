const express = require('express');
const router = express.Router();
const counsellingController = require('../controllers/counsellingController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.post('/generate', authenticate, counsellingController.generateCounselling);
router.post('/save', authenticate, counsellingController.saveCounsellingSession);

module.exports = router;
