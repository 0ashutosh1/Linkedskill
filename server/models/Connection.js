const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema({
  expertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending' // Requires expert approval
  },
  connectionType: {
    type: String,
    enum: ['follower', 'student', 'mentee'],
    default: 'follower'
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional metadata
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    maxlength: 50
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound index to prevent duplicate connections
connectionSchema.index({ expertId: 1, followerId: 1 }, { unique: true })

// Index for efficient queries
connectionSchema.index({ expertId: 1, status: 1, isActive: 1 })
connectionSchema.index({ followerId: 1, status: 1, isActive: 1 })

// Virtual for expert details
connectionSchema.virtual('expert', {
  ref: 'User',
  localField: 'expertId',
  foreignField: '_id',
  justOne: true
})

// Virtual for follower details  
connectionSchema.virtual('follower', {
  ref: 'User',
  localField: 'followerId', 
  foreignField: '_id',
  justOne: true
})

// Instance methods
connectionSchema.methods.updateLastInteraction = function() {
  this.lastInteraction = new Date()
  return this.save()
}

connectionSchema.methods.deactivate = function() {
  this.isActive = false
  return this.save()
}

// Static methods
connectionSchema.statics.findByExpert = function(expertId, options = {}) {
  const query = { 
    expertId, 
    isActive: true,
    status: options.status || 'accepted'
  }
  
  return this.find(query)
    .populate('follower', 'name email')
    .sort({ connectedAt: -1 })
}

connectionSchema.statics.findByFollower = function(followerId, options = {}) {
  const query = { 
    followerId, 
    isActive: true,
    status: options.status || 'accepted'
  }
  
  return this.find(query)
    .populate('expert', 'name email')
    .sort({ lastInteraction: -1 })
}

connectionSchema.statics.getConnectionStatus = function(expertId, followerId) {
  return this.findOne({ expertId, followerId, isActive: true })
}

connectionSchema.statics.getAnyConnection = function(expertId, followerId) {
  return this.findOne({ expertId, followerId }).sort({ updatedAt: -1 })
}

connectionSchema.statics.getExpertStats = function(expertId) {
  return this.aggregate([
    { $match: { expertId: new mongoose.Types.ObjectId(expertId), isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
}

// Pre-save middleware
connectionSchema.pre('save', function(next) {
  // Update lastInteraction when status changes
  if (this.isModified('status')) {
    this.lastInteraction = new Date()
  }
  next()
})

// Pre-remove middleware to handle cleanup
connectionSchema.pre('remove', function(next) {
  // Could add cleanup logic here (like removing related chat messages)
  next()
})

module.exports = mongoose.model('Connection', connectionSchema)