const User = require('../models/User')
const Profile = require('../models/Profile')
const Connection = require('../models/Connection')
const Role = require('../models/Role')

// Simplified get all experts API
const getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, interests } = req.query
    const userId = req.user?.sub // Current user ID
    
    // Get expert role ID first
    const expertRole = await Role.findOne({ name: 'expert' })
    if (!expertRole) {
      return res.json({
        success: true,
        data: { experts: [], pagination: { totalExperts: 0 } }
      })
    }
    
    // Build search query
    const searchQuery = {
      roleId: expertRole._id
    }
    
    // Add text search if provided
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Get experts with basic info
    const experts = await User.find(searchQuery)
      .select('name email phoneNo createdAt')
      .lean() // Use lean() for better performance
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
    
    // Get additional profile data in parallel
    const expertIds = experts.map(expert => expert._id)
    
    const [profiles, connections] = await Promise.all([
      // Get profiles with interests
      interests 
        ? Profile.find({ 
            user: { $in: expertIds },
            areasOfInterest: { $regex: interests, $options: 'i' }
          }).select('user areasOfInterest occupation').lean()
        : Profile.find({ user: { $in: expertIds } })
            .select('user areasOfInterest occupation').lean(),
      
      // Get connection status if user is authenticated
      userId 
        ? Connection.find({
            expert: { $in: expertIds },
            follower: userId,
            status: 'accepted'
          }).select('expert').lean()
        : []
    ])
    
    // Combine data efficiently
    const expertsWithDetails = experts.map(expert => {
      const profile = profiles.find(p => p.user.toString() === expert._id.toString())
      const isConnected = connections.some(c => c.expert.toString() === expert._id.toString())
      
      return {
        id: expert._id,
        name: expert.name || 'Expert',
        email: expert.email,
        phoneNo: expert.phoneNo,
        areasOfInterest: profile?.areasOfInterest || [],
        occupation: profile?.occupation || '',
        isConnected,
        joinedDate: expert.createdAt
      }
    })
    
    // Get total count for pagination
    const total = await User.countDocuments(searchQuery)
    
    res.json({
      success: true,
      data: {
        experts: expertsWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalExperts: total,
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching experts:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch experts' 
    })
  }
}

// Simplified get single expert API
const getExpert = async (req, res) => {
  try {
    const { expertId } = req.params
    const userId = req.user?.sub
    
    // Get expert basic info
    const expert = await User.findById(expertId)
      .select('name email phoneNo createdAt')
      .lean()
    
    if (!expert) {
      return res.status(404).json({
        success: false,
        error: 'Expert not found'
      })
    }
    
    // Get additional data in parallel
    const [profile, connection, followerCount] = await Promise.all([
      Profile.findOne({ user: expertId })
        .select('areasOfInterest occupation education linkedin website')
        .lean(),
      
      userId 
        ? Connection.findOne({
            expert: expertId,
            follower: userId,
            status: 'accepted'
          }).lean()
        : null,
        
      Connection.countDocuments({
        expert: expertId,
        status: 'accepted'
      })
    ])
    
    res.json({
      success: true,
      data: {
        expert: {
          id: expert._id,
          name: expert.name,
          email: expert.email,
          phoneNo: expert.phoneNo,
          areasOfInterest: profile?.areasOfInterest || [],
          occupation: profile?.occupation || '',
          education: profile?.education || '',
          linkedin: profile?.linkedin || '',
          website: profile?.website || '',
          followerCount,
          isConnected: !!connection,
          joinedDate: expert.createdAt
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching expert:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expert details'
    })
  }
}

module.exports = {
  getExperts,
  getExpert
}