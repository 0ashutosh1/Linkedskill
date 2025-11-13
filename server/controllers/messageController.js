const Message = require('../models/Message')
const Connection = require('../models/Connection')
const User = require('../models/User')
const Notification = require('../models/Notification')

// Helper function to create notifications
const createNotification = async (type, message, senderId, receiverId, priority = 'normal') => {
  try {
    const notification = new Notification({
      type,
      message,
      senderId,
      receiverId,
      priority
    })
    await notification.save()
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    // Don't throw - notification failure shouldn't stop message sending
  }
}

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', replyTo } = req.body
    const senderId = req.user.sub

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' })
    }

    // Find the connection between sender and receiver
    const connection = await Connection.findOne({
      $or: [
        { expertId: senderId, followerId: receiverId, status: 'accepted', isActive: true },
        { expertId: receiverId, followerId: senderId, status: 'accepted', isActive: true }
      ]
    })

    if (!connection) {
      return res.status(403).json({ error: 'No active connection found between users' })
    }

    // Create the message
    const message = new Message({
      senderId,
      receiverId,
      connectionId: connection._id,
      content: content.trim(),
      messageType,
      replyTo: replyTo || undefined
    })

    await message.save()

    // Populate sender and receiver info
    await message.populate('senderId', 'name photoUrl')
    await message.populate('receiverId', 'name photoUrl')
    if (replyTo) {
      await message.populate('replyTo', 'content senderId')
    }

    // Update connection's last interaction
    connection.lastInteraction = new Date()
    await connection.save()

    // Create notification for message recipient
    const senderName = message.senderId.name || 'Someone'
    const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content
    await createNotification(
      'message',
      `${senderName}: ${messagePreview}`,
      senderId,
      receiverId,
      'normal'
    )

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    })

  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { connectionId } = req.params
    const { limit = 50, page = 1 } = req.query
    const userId = req.user.sub

    // Verify user is part of this connection
    const connection = await Connection.findById(connectionId)
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' })
    }

    if (connection.expertId.toString() !== userId && connection.followerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' })
    }

    const messages = await Message.getConversation(connectionId, parseInt(limit), parseInt(page))
    
    // Mark messages as read for the current user (only messages received by this user)
    await Message.markAsRead(connectionId, userId)

    // Add read status information to each message
    const messagesWithReadStatus = messages.map(message => ({
      ...message,
      readStatus: {
        isRead: message.isRead,
        readAt: message.readAt,
        isSentByMe: message.senderId._id.toString() === userId
      }
    }))

    res.status(200).json({
      messages: messagesWithReadStatus.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Error getting conversation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.sub
    const { limit = 20, page = 1 } = req.query

    // Get user's connections
    const connections = await Connection.find({
      $or: [
        { expertId: userId, status: 'accepted', isActive: true },
        { followerId: userId, status: 'accepted', isActive: true }
      ]
    })
      .populate('expertId', 'name photoUrl designation')
      .populate('followerId', 'name photoUrl designation')
      .sort({ lastInteraction: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    // Get latest message for each connection
    const conversationsWithMessages = await Promise.all(
      connections.map(async (connection) => {
        const latestMessage = await Message.findOne({
          connectionId: connection._id,
          isDeleted: false
        })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name')

        // Get unread count for this conversation
        const unreadCount = await Message.countDocuments({
          connectionId: connection._id,
          receiverId: userId,
          isRead: false,
          isDeleted: false
        })

        // Determine the other user (not the current user)
        const otherUser = connection.expertId._id.toString() === userId 
          ? connection.followerId 
          : connection.expertId

        return {
          connectionId: connection._id,
          otherUser: {
            id: otherUser._id,
            name: otherUser.name,
            photoUrl: otherUser.photoUrl,
            designation: otherUser.designation
          },
          latestMessage: latestMessage ? {
            content: latestMessage.content,
            sentAt: latestMessage.createdAt,
            isFromMe: latestMessage.senderId._id.toString() === userId,
            senderName: latestMessage.senderId.name
          } : null,
          unreadCount,
          lastActivity: connection.lastInteraction || connection.connectedAt
        }
      })
    )

    res.status(200).json({
      conversations: conversationsWithMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: connections.length
      }
    })

  } catch (error) {
    console.error('Error getting conversations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Mark conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const { connectionId } = req.params
    const userId = req.user.sub

    // Verify user is part of this connection
    const connection = await Connection.findById(connectionId)
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' })
    }

    if (connection.expertId.toString() !== userId && connection.followerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' })
    }

    const result = await Message.markAsRead(connectionId, userId)

    res.status(200).json({
      message: 'Conversation marked as read',
      updatedCount: result.modifiedCount
    })

  } catch (error) {
    console.error('Error marking conversation as read:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Mark specific messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body
    const userId = req.user.sub

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'Message IDs array is required' })
    }

    const result = await Message.markMessagesAsReadAndReturn(messageIds, userId)

    res.status(200).json({
      message: 'Messages marked as read',
      updatedCount: result.modifiedCount
    })

  } catch (error) {
    console.error('Error marking messages as read:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.sub
    const unreadCount = await Message.getUnreadCount(userId)

    res.status(200).json({
      unreadCount
    })

  } catch (error) {
    console.error('Error getting unread count:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.sub

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    // Only sender can delete their own message
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' })
    }

    await message.softDelete()

    res.status(200).json({
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const { content } = req.body
    const userId = req.user.sub

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    // Only sender can edit their own message
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this message' })
    }

    // Can't edit messages older than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    if (message.createdAt < fifteenMinutesAgo) {
      return res.status(400).json({ error: 'Message is too old to edit' })
    }

    message.content = content.trim()
    message.editedAt = new Date()
    await message.save()

    await message.populate('senderId', 'name photoUrl')
    await message.populate('receiverId', 'name photoUrl')

    res.status(200).json({
      message: 'Message updated successfully',
      data: message
    })

  } catch (error) {
    console.error('Error editing message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}