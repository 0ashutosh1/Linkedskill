// Auth utility functions for managing authentication state

const API_URL = 'http://localhost:4000'

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  return !!token
}

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

/**
 * Logout user - clear localStorage and reload page
 * The App component will detect no token and show login page
 */
export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  // Reload the page to reset app state and show login
  window.location.reload()
}

/**
 * Fetch user profile from API (protected route)
 */
export const fetchUserProfile = async () => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('No auth token found')
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        logout()
      }
      throw new Error('Failed to fetch user profile')
    }

    const userData = await response.json()
    // Update localStorage with fresh data
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Create authenticated fetch wrapper
 */
export const authFetch = async (url, options = {}) => {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  // Auto logout on 401
  if (response.status === 401) {
    logout()
  }

  return response
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export const requireAuth = () => {
  if (!isAuthenticated()) {
    // Clear any stale data and reload to show login
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.reload()
    return false
  }
  return true
}
