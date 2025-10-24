const express = require('express')
const router = express.Router()
const expertsController = require('../controllers/expertsController')
const auth = require('../middleware/auth')

// Public routes (no auth required)
router.get('/', expertsController.getExperts)
router.get('/:expertId', expertsController.getExpert)

module.exports = router