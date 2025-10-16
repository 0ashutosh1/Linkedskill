const express = require('express')
const router = express.Router()
const { authenticate: auth } = require('../middleware/auth')
const connectionController = require('../controllers/connectionController')

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Connection routes working' })
})

// Follow/Unfollow expert routes
router.post('/follow/:expertId', auth, connectionController.followExpert)
router.delete('/unfollow/:expertId', auth, connectionController.unfollowExpert)

// Connection request management routes
router.post('/accept/:connectionId', auth, connectionController.acceptConnectionRequest)
router.post('/reject/:connectionId', auth, connectionController.rejectConnectionRequest)
router.get('/pending-requests', auth, connectionController.getPendingRequests)

// Get connections
router.get('/my-connections', auth, connectionController.getMyConnections)
router.get('/my-followers', auth, connectionController.getExpertFollowers)

// Connection status and management
router.get('/status/:expertId', auth, connectionController.getConnectionStatus)
router.put('/:connectionId', auth, connectionController.updateConnection)

// Expert statistics
router.get('/stats', auth, connectionController.getExpertStats)

// Search experts
router.get('/search-experts', auth, connectionController.searchExperts)

module.exports = router