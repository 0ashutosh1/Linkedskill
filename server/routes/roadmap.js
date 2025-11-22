const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.post('/', authenticate, roadmapController.createRoadmap);
router.get('/my/active', authenticate, roadmapController.getMyRoadmap);
router.get('/my/all', authenticate, roadmapController.getAllMyRoadmaps);
router.get('/:id', authenticate, roadmapController.getRoadmapById);
router.put('/:id/task', authenticate, roadmapController.updateTaskCompletion);
router.put('/:id/status', authenticate, roadmapController.updateRoadmapStatus);
router.delete('/:id', authenticate, roadmapController.deleteRoadmap);

module.exports = router;
