const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  editedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
})

// Indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 })
messageSchema.index({ connectionId: 1, createdAt: -1 })
messageSchema.index({ isRead: 1, receiverId: 1 })

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(connectionId, limit = 50, page = 1) {
  const skip = (page - 1) * limit
  
  return await this.find({
    connectionId,
    isDeleted: false
  })
    .populate('senderId', 'name photoUrl')
    .populate('receiverId', 'name photoUrl')
    .populate('replyTo', 'content senderId')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
}

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function(connectionId, userId) {
  return await this.updateMany(
    {
      connectionId,
      receiverId: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  )
}

// Static method to mark specific messages as read and return them
messageSchema.statics.markMessagesAsReadAndReturn = async function(messageIds, userId) {
  const result = await this.updateMany(
    {
      _id: { $in: messageIds },
      receiverId: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  )
  
  return result
}

// Static method to get unread count
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    isRead: false,
    isDeleted: false
  })
}

// Static method to get latest message for each conversation
messageSchema.statics.getLatestMessages = async function(userId) {
  return await this.aggregate([
    {
      $match: {
        $or: [{ senderId: mongoose.Types.ObjectId(userId) }, { receiverId: mongoose.Types.ObjectId(userId) }],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$connectionId',
        latestMessage: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestMessage' }
    },
    {
      $populate: {
        path: 'senderId receiverId',
        select: 'name photoUrl'
      }
    }
  ])
}

// Method to soft delete
messageSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

module.exports = mongoose.model('Message', messageSchema)