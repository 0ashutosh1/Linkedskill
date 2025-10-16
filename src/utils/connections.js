const API_URL = 'http://localhost:4000'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Get user's connected experts
export const getMyConnections = async () => {
  try {
    const response = await fetch(`${API_URL}/connections/my-connections`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch connections')
    }

    const data = await response.json()
    return data.connections || []
  } catch (error) {
    console.error('Error fetching connections:', error)
    return []
  }
}

// Follow an expert
export const followExpert = async (expertId) => {
  try {
    console.log('followExpert called with:', expertId)
    console.log('API URL:', `${API_URL}/connections/follow/${expertId}`)
    console.log('Auth headers:', getAuthHeaders())
    
    const response = await fetch(`${API_URL}/connections/follow/${expertId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const error = await response.json()
      console.error('API Error response:', error)
      throw new Error(error.error || 'Failed to follow expert')
    }

    const result = await response.json()
    console.log('Follow success result:', result)
    return result
  } catch (error) {
    console.error('Error following expert:', error)
    throw error
  }
}

// Unfollow an expert
export const unfollowExpert = async (expertId) => {
  try {
    const response = await fetch(`${API_URL}/connections/unfollow/${expertId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to unfollow expert')
    }

    return await response.json()
  } catch (error) {
    console.error('Error unfollowing expert:', error)
    throw error
  }
}

// Check connection status with an expert
export const getConnectionStatus = async (expertId) => {
  try {
    const response = await fetch(`${API_URL}/connections/status/${expertId}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to check connection status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error checking connection status:', error)
    return { isConnected: false, connection: null }
  }
}

// Search for experts to connect with
export const searchExperts = async (query = '', interests = '', page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (query) params.append('query', query)
    if (interests) params.append('interests', interests)

    const response = await fetch(`${API_URL}/connections/search-experts?${params}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to search experts')
    }

    const data = await response.json()
    return data.experts || []
  } catch (error) {
    console.error('Error searching experts:', error)
    return []
  }
}

// Get expert statistics (for experts to see their follower stats)
export const getExpertStats = async () => {
  try {
    const response = await fetch(`${API_URL}/connections/stats`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch expert stats')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching expert stats:', error)
    return {
      totalFollowers: 0,
      pendingRequests: 0,
      acceptedConnections: 0,
      rejectedRequests: 0
    }
  }
}

// Update connection (add notes, tags, etc.)
export const updateConnection = async (connectionId, updates) => {
  try {
    const response = await fetch(`${API_URL}/connections/${connectionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update connection')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating connection:', error)
    throw error
  }
}