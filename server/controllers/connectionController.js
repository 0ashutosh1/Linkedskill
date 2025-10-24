const Connection = require('../models/Connection')
const User = require('../models/User')
const Profile = require('../models/Profile')
const Role = require('../models/Role')
const Notification = require('../models/Notification')

// Helper function to create notifications
const createNotification = async (type, message, senderId, receiverId, connectionId = null, actionType = 'none') => {
  try {
    const notification = new Notification({
      type,
      message,
      senderId,
      receiverId,
      connectionId,
      actionType,
      priority: type.includes('connection') ? 'high' : 'normal'
    })
    await notification.save()
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Send connection request to an expert
exports.followExpert = async (req, res) => {
  try {
    const { expertId } = req.params
    const followerId = req.user.sub

    // Get follower details for notification
    const follower = await User.findById(followerId).select('name email')
    if (!follower) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Validate expert exists and has expert role
    const expert = await User.findById(expertId).select('name email roleId').populate('roleId')
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' })
    }

    // Check if expert has expert role
    const expertRole = await Role.findOne({ name: 'expert' })
    if (!expertRole) {
      return res.status(500).json({ error: 'Expert role not found in system' })
    }
    
    // More flexible role checking - also check if user has a profile that indicates they're an expert
    const hasExpertRole = expert.roleId?.toString() === expertRole._id.toString() || 
                         expert.roleId?.name === 'expert'
    
    if (!hasExpertRole) {
      // As a fallback, check if user has an expert profile (some experts might not have role properly set)
      const expertProfile = await Profile.findOne({ userId: expertId })
      if (!expertProfile) {
        return res.status(400).json({ error: 'User is not an expert - no profile found' })
      }
      
      // If they have a profile, we'll allow the connection (profile creation implies they're meant to be an expert)
      console.log(`User ${expertId} doesn't have expert role but has profile - allowing connection`)
    }

    // Check if already following or request pending (including inactive connections)
    const existingConnection = await Connection.getAnyConnection(expertId, followerId)
    if (existingConnection) {
      if (existingConnection.status === 'pending' && existingConnection.isActive) {
        return res.status(400).json({ error: 'Connection request already pending' })
      }
      if (existingConnection.status === 'accepted' && existingConnection.isActive) {
        return res.status(400).json({ error: 'Already connected to this expert' })
      }
      if (!existingConnection.isActive) {
        try {
          // Reactivate connection with pending status
          existingConnection.isActive = true
          existingConnection.status = 'pending'
          existingConnection.connectedAt = new Date()
          await existingConnection.save()
          
          // Send notification to expert about the new request
          await createNotification(
            'connection_request',
            `${follower.name} wants to connect with you as a student.`,
            followerId,
            expertId,
            existingConnection._id,
            'pending'
          )
          
          return res.status(200).json({
            message: 'Connection request sent successfully',
            connection: existingConnection
          })
        } catch (reactivationError) {
          console.error('Error during connection reactivation:', reactivationError)
          return res.status(500).json({ error: 'Failed to reactivate connection' })
        }
      }
    }

    // Create new connection request (pending status)
    const connection = new Connection({
      expertId,
      followerId,
      status: 'pending', // Requires expert approval
      connectionType: 'follower'
    })

    await connection.save()

    // Send notification to expert about the connection request
    await createNotification(
      'connection_request',
      `${follower.name} wants to connect with you as a student.`,
      followerId,
      expertId,
      connection._id,
      'pending'
    )

    // Populate the connection with expert details
    await connection.populate('expert', 'name email')

    res.status(201).json({
      message: 'Connection request sent successfully. Waiting for expert approval.',
      connection
    })

  } catch (error) {
    console.error('Error sending connection request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Accept connection request (expert only)
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params
    const expertId = req.user.sub

    const connection = await Connection.findById(connectionId)
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' })
    }

    // Verify the expert is the one who received the request
    if (connection.expertId.toString() !== expertId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' })
    }

    // Check if request is still pending
    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'Connection request is not pending' })
    }

    // Update connection status to accepted
    connection.status = 'accepted'
    connection.connectedAt = new Date()
    await connection.save()

    // Get user details for notification
    const expert = await User.findById(expertId).select('name')
    const follower = await User.findById(connection.followerId).select('name')

    // Send notification to the user that their request was accepted
    await createNotification(
      'connection_accepted',
      `${expert.name} has accepted your connection request. You are now connected!`,
      expertId,
      connection.followerId,
      connection._id,
      'none'
    )

    // Populate connection details
    await connection.populate('follower', 'name email')

    res.status(200).json({
      message: 'Connection request accepted successfully',
      connection
    })

  } catch (error) {
    console.error('Error accepting connection request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Reject connection request (expert only)
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params
    const expertId = req.user.sub
    const { reason } = req.body // Optional rejection reason

    const connection = await Connection.findById(connectionId)
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' })
    }

    // Verify the expert is the one who received the request
    if (connection.expertId.toString() !== expertId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' })
    }

    // Check if request is still pending
    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'Connection request is not pending' })
    }

    // Update connection status to rejected
    connection.status = 'rejected'
    if (reason) {
      connection.notes = reason
    }
    await connection.save()

    // Get user details for notification
    const expert = await User.findById(expertId).select('name')
    const follower = await User.findById(connection.followerId).select('name')

    // Send notification to the user that their request was rejected
    const rejectionMessage = reason 
      ? `${expert.name} has declined your connection request. Reason: ${reason}`
      : `${expert.name} has declined your connection request.`

    await createNotification(
      'connection_rejected',
      rejectionMessage,
      expertId,
      connection.followerId,
      connection._id,
      'none'
    )

    res.status(200).json({
      message: 'Connection request rejected successfully',
      connection
    })

  } catch (error) {
    console.error('Error rejecting connection request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get pending connection requests for expert
exports.getPendingRequests = async (req, res) => {
  try {
    const expertId = req.user.sub
    const { limit = 20, page = 1 } = req.query

    const requests = await Connection.find({
      expertId,
      status: 'pending',
      isActive: true
    })
      .populate('follower', 'name email photoUrl designation')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Connection.countDocuments({
      expertId,
      status: 'pending',
      isActive: true
    })

    const formattedRequests = requests.map(request => ({
      id: request._id,
      requesterId: request.followerId,
      requesterName: request.follower.name,
      requesterEmail: request.follower.email,
      requesterPhoto: request.follower.photoUrl,
      requesterDesignation: request.follower.designation,
      requestedAt: request.createdAt,
      connectionType: request.connectionType
    }))

    res.status(200).json({
      requests: formattedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Error getting pending requests:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Unfollow an expert
exports.unfollowExpert = async (req, res) => {
  try {
    const { expertId } = req.params
    const followerId = req.user.sub

    const connection = await Connection.getConnectionStatus(expertId, followerId)
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' })
    }

    // Soft delete - deactivate connection
    await connection.deactivate()

    res.status(200).json({
      message: 'Successfully unfollowed expert'
    })

  } catch (error) {
    console.error('Error unfollowing expert:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get user's followed experts
exports.getMyConnections = async (req, res) => {
  try {
    const followerId = req.user.sub
    const { status = 'accepted', limit = 50, page = 1 } = req.query

    const connections = await Connection.findByFollower(followerId, { status })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    // Transform data to match frontend format
    const connectedExperts = connections.map(conn => ({
      id: conn.expert._id,
      name: conn.expert.name,
      expertise: conn.expert.designation || 'Expert',
      photoUrl: conn.expert.photoUrl,
      isOnline: false, // Would need real-time status
      isVerified: true, // Could add verification field to User model
      lastMessage: '', // Would come from chat messages
      lastSeen: conn.lastInteraction,
      email: conn.expert.email,
      designation: conn.expert.designation,
      areasOfInterest: conn.expert.areasOfInterest || [],
      connectionId: conn._id,
      connectedAt: conn.connectedAt,
      connectionType: conn.connectionType
    }))

    const total = await Connection.countDocuments({
      followerId,
      status,
      isActive: true
    })

    res.status(200).json({
      connections: connectedExperts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Error getting connections:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get expert's followers
exports.getExpertFollowers = async (req, res) => {
  try {
    const expertId = req.user.sub // Assuming the logged-in user is the expert
    const { status = 'accepted', limit = 50, page = 1 } = req.query

    const connections = await Connection.findByExpert(expertId, { status })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const followers = connections.map(conn => ({
      id: conn.follower._id,
      name: conn.follower.name,
      email: conn.follower.email,
      photoUrl: conn.follower.photoUrl,
      designation: conn.follower.designation,
      connectionId: conn._id,
      connectedAt: conn.connectedAt,
      lastInteraction: conn.lastInteraction,
      connectionType: conn.connectionType
    }))

    const total = await Connection.countDocuments({
      expertId,
      status,
      isActive: true
    })

    res.status(200).json({
      followers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Error getting followers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Check connection status between user and expert
exports.getConnectionStatus = async (req, res) => {
  try {
    const { expertId } = req.params
    const followerId = req.user.sub

    const connection = await Connection.getConnectionStatus(expertId, followerId)

    if (connection) {
      res.status(200).json({
        isConnected: connection.status === 'accepted',
        connectionExists: true,
        status: connection.status,
        connection: connection
      })
    } else {
      res.status(200).json({
        isConnected: false,
        connectionExists: false,
        status: null,
        connection: null
      })
    }

  } catch (error) {
    console.error('Error checking connection status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Batch check connection status for multiple experts
exports.getConnectionStatusBatch = async (req, res) => {
  try {
    const { expertIds } = req.body
    const followerId = req.user.sub

    if (!expertIds || !Array.isArray(expertIds) || expertIds.length === 0) {
      return res.status(400).json({ error: 'expertIds array is required' })
    }

    // Limit batch size to prevent abuse
    if (expertIds.length > 100) {
      return res.status(400).json({ error: 'Too many expertIds. Maximum 100 allowed per batch.' })
    }

    // Get all connections for the user with the specified experts
    const connections = await Connection.find({
      expertId: { $in: expertIds },
      followerId,
      isActive: true
    }).select('expertId status')

    // Build status object
    const statuses = {}
    expertIds.forEach(expertId => {
      const connection = connections.find(c => c.expertId.toString() === expertId)
      statuses[expertId] = {
        isConnected: connection?.status === 'accepted' || false,
        connectionExists: !!connection,
        status: connection?.status || null
      }
    })

    res.status(200).json({
      statuses
    })

  } catch (error) {
    console.error('Error checking batch connection status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get expert statistics
exports.getExpertStats = async (req, res) => {
  try {
    const expertId = req.user.sub
    
    const stats = await Connection.getExpertStats(expertId)
    
    // Transform stats into readable format
    const formattedStats = {
      totalFollowers: 0,
      pendingRequests: 0,
      acceptedConnections: 0,
      rejectedRequests: 0
    }

    stats.forEach(stat => {
      switch (stat._id) {
        case 'accepted':
          formattedStats.acceptedConnections = stat.count
          formattedStats.totalFollowers += stat.count
          break
        case 'pending':
          formattedStats.pendingRequests = stat.count
          break
        case 'rejected':
          formattedStats.rejectedRequests = stat.count
          break
      }
    })

    res.status(200).json(formattedStats)

  } catch (error) {
    console.error('Error getting expert stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update connection (for changing status, adding notes, etc.)
exports.updateConnection = async (req, res) => {
  try {
    const { connectionId } = req.params
    const { status, notes, tags } = req.body
    const userId = req.user.sub

    const connection = await Connection.findById(connectionId)
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' })
    }

    // Verify user owns this connection (either as expert or follower)
    if (connection.expertId.toString() !== userId && connection.followerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this connection' })
    }

    // Update allowed fields
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      connection.status = status
    }
    if (notes !== undefined) {
      connection.notes = notes
    }
    if (tags && Array.isArray(tags)) {
      connection.tags = tags
    }

    await connection.save()

    res.status(200).json({
      message: 'Connection updated successfully',
      connection
    })

  } catch (error) {
    console.error('Error updating connection:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Search for experts to connect with
exports.searchExperts = async (req, res) => {
  try {
    const { query, interests, limit = 20, page = 1 } = req.query
    const userId = req.user.sub

    // Get expert role
    const expertRole = await Role.findOne({ name: 'expert' })
    if (!expertRole) {
      return res.status(404).json({ error: 'Expert role not found' })
    }

    // Build search criteria
    let searchCriteria = { roleId: expertRole._id, _id: { $ne: userId } }
    
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }

    // Find experts
    const experts = await User.find(searchCriteria)
      .select('name email photoUrl designation')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    // Get their profiles with areas of interest
    const expertIds = experts.map(expert => expert._id)
    const profiles = await Profile.find({ userId: { $in: expertIds } })
      .select('userId areasOfInterest')

    // Get connection status for each expert
    const connections = await Connection.find({
      expertId: { $in: expertIds },
      followerId: userId,
      isActive: true
    }).select('expertId status')

    // Combine data
    const expertsWithDetails = experts.map(expert => {
      const profile = profiles.find(p => p.userId?.toString() === expert._id.toString())
      const connection = connections.find(c => c.expertId.toString() === expert._id.toString())
      
      return {
        id: expert._id,
        name: expert.name,
        email: expert.email,
        photoUrl: expert.photoUrl,
        designation: expert.designation,
        areasOfInterest: profile?.areasOfInterest || [],
        isConnected: !!connection,
        connectionStatus: connection?.status || null
      }
    })

    // Filter by interests if provided
    let filteredExperts = expertsWithDetails
    if (interests) {
      const interestArray = interests.split(',').map(i => i.trim().toLowerCase())
      filteredExperts = expertsWithDetails.filter(expert =>
        expert.areasOfInterest.some(interest =>
          interestArray.some(searchInterest =>
            interest.toLowerCase().includes(searchInterest)
          )
        )
      )
    }

    const total = await User.countDocuments(searchCriteria)

    res.status(200).json({
      experts: filteredExperts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Error searching experts:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}