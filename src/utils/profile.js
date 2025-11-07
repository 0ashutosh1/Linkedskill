const API_URL = 'http://localhost:4000'

/**
 * Check if the current user has completed their profile
 */
export async function checkProfileCompletion() {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return { completed: false, hasProfile: false }
    }

    const response = await fetch(`${API_URL}/profile/completion`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return { completed: false, hasProfile: false }
    }

    const data = await response.json()
    return {
      completed: data.completed,
      hasProfile: !!data.profile,
      profile: data.profile
    }
  } catch (error) {
    console.error('Error checking profile completion:', error)
    return { completed: false, hasProfile: false }
  }
}

/**
 * Get the current user's profile
 */
export async function getMyProfile() {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token')
    }

    const response = await fetch(`${API_URL}/profile/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to fetch profile')
    }

    const data = await response.json()
    return data.profile
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

/**
 * Update or create user profile
 */
export async function updateProfile(profileData) {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token')
    }

    const response = await fetch(`${API_URL}/profile/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update profile')
    }

    const data = await response.json()
    return data.profile
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}
