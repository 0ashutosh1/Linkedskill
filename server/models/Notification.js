const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'success', 'reminder', 'update', 'announcement', 'message', 
           'connection_request', 'connection_accepted', 'connection_rejected',
           'class_reminder', 'class_started', 'class_ended'],
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    trim: true
  },
  is_read: { 
    type: Boolean, 
    default: false 
  },
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
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal' 
  },
  // Additional data for connection-related notifications
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: false
  },
  actionType: {
    type: String,
    enum: ['pending', 'approve', 'reject', 'none'],
    default: 'none'
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
