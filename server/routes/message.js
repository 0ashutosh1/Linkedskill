const express = require('express')
const router = express.Router()
const { authenticate: auth } = require('../middleware/auth')
const messageController = require('../controllers/messageController')

// Send a message
router.post('/send', auth, messageController.sendMessage)

// Get conversation between two users
router.get('/conversation/:connectionId', auth, messageController.getConversation)

// Get all conversations for a user
router.get('/conversations', auth, messageController.getConversations)

// Mark conversation as read
router.put('/read/:connectionId', auth, messageController.markConversationAsRead)

// Mark specific messages as read
router.put('/read-messages', auth, messageController.markMessagesAsRead)

// Get unread message count
router.get('/unread-count', auth, messageController.getUnreadCount)

// Delete a message
router.delete('/:messageId', auth, messageController.deleteMessage)

// Edit a message
router.put('/:messageId', auth, messageController.editMessage)

module.exports = router