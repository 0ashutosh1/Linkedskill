const User = require('../models/User')
const Profile = require('../models/Profile')
const Connection = require('../models/Connection')
const Role = require('../models/Role')

// Cache expert role ID to avoid repeated database queries
let expertRoleCache = null
const getExpertRole = async () => {
  if (!expertRoleCache) {
    expertRoleCache = await Role.findOne({ name: 'expert' }).select('_id').lean()
  }
  return expertRoleCache
}

// Optimized get all experts API
const getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, interests } = req.query
    const userId = req.user?.sub
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    // Get expert role ID (cached)
    const expertRole = await getExpertRole()
    if (!expertRole) {
      return res.json({
        success: true,
        data: { experts: [], pagination: { totalExperts: 0, currentPage: pageNum, totalPages: 0 } }
      })
    }
    
    // Build optimized search query
    const searchQuery = { roleId: expertRole._id }
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Build profile query for interests filter
    const profileQuery = interests 
      ? { areasOfInterest: { $regex: interests, $options: 'i' } }
      : {}
    
    // Use aggregation pipeline for better performance
    const expertsAggregation = User.aggregate([
      { $match: searchQuery },
      { 
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile',
          pipeline: [
            { $match: profileQuery },
            { $project: { areasOfInterest: 1, designation: 1, photoUrl: 1 } }
          ]
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      ...(interests ? [{ $match: { 'profile.areasOfInterest': { $exists: true } } }] : []),
      {
        $project: {
          name: 1,
          email: 1,
          areasOfInterest: { $ifNull: ['$profile.areasOfInterest', []] },
          designation: { $ifNull: ['$profile.designation', ''] },
          photoUrl: { $ifNull: ['$profile.photoUrl', ''] },
          createdAt: 1
        }
      },
      { $skip: skip },
      { $limit: limitNum }
    ])
    
    // Get connection status in parallel with experts query
    const [experts, connectionStatuses, total] = await Promise.all([
      expertsAggregation.exec(),
      userId ? Connection.find({
        expertId: { $in: [] }, // Will be populated after getting expert IDs
        followerId: userId,
        status: 'accepted',
        isActive: true
      }).select('expertId').lean() : Promise.resolve([]),
      User.countDocuments(searchQuery)
    ])
    
    // If we have experts and user is authenticated, get their connection statuses
    let connections = []
    if (userId && experts.length > 0) {
      const expertIds = experts.map(e => e._id)
      connections = await Connection.find({
        expertId: { $in: expertIds },
        followerId: userId,
        status: 'accepted',
        isActive: true
      }).select('expertId').lean()
    }
    
    // Create connection lookup map for O(1) access
    const connectionMap = new Map(connections.map(c => [c.expertId.toString(), true]))
    
    // Format response efficiently
    const expertsWithDetails = experts.map(expert => ({
      id: expert._id,
      name: expert.name || 'Expert',
      email: expert.email,
      areasOfInterest: expert.areasOfInterest,
      designation: expert.designation,
      photoUrl: expert.photoUrl,
      isConnected: connectionMap.has(expert._id.toString()),
      joinedDate: expert.createdAt
    }))
    
    res.json({
      success: true,
      data: {
        experts: expertsWithDetails,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalExperts: total,
          hasNextPage: pageNum * limitNum < total,
          hasPreviousPage: pageNum > 1,
          limit: limitNum
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching experts:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch experts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Optimized get single expert API
const getExpert = async (req, res) => {
  try {
    const { expertId } = req.params
    const userId = req.user?.sub
    
    // Use aggregation for single query with all data
    const expertData = await User.aggregate([
      { $match: { _id: require('mongoose').Types.ObjectId(expertId) } },
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile',
          pipeline: [
            { 
              $project: { 
                areasOfInterest: 1, 
                designation: 1, 
                education: 1,
                photoUrl: 1,
                bio: 1,
                skills: 1
              } 
            }
          ]
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          email: 1,
          areasOfInterest: { $ifNull: ['$profile.areasOfInterest', []] },
          designation: { $ifNull: ['$profile.designation', ''] },
          education: { $ifNull: ['$profile.education', ''] },
          photoUrl: { $ifNull: ['$profile.photoUrl', ''] },
          bio: { $ifNull: ['$profile.bio', ''] },
          skills: { $ifNull: ['$profile.skills', []] },
          createdAt: 1
        }
      }
    ])
    
    if (!expertData || expertData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expert not found'
      })
    }
    
    const expert = expertData[0]
    
    // Get connection status and follower count in parallel
    const [connection, followerCount] = await Promise.all([
      userId ? Connection.findOne({
        expertId: expertId,
        followerId: userId,
        status: 'accepted',
        isActive: true
      }).select('_id').lean() : Promise.resolve(null),
      
      Connection.countDocuments({
        expertId: expertId,
        status: 'accepted',
        isActive: true
      })
    ])
    
    res.json({
      success: true,
      data: {
        expert: {
          id: expert._id,
          name: expert.name,
          email: expert.email,
          areasOfInterest: expert.areasOfInterest,
          designation: expert.designation,
          education: expert.education,
          photoUrl: expert.photoUrl,
          bio: expert.bio,
          skills: expert.skills,
          followerCount,
          isConnected: !!connection,
          joinedDate: expert.createdAt
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching expert:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expert details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = {
  getExperts,
  getExpert
}