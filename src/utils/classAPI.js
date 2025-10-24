// Class API utilities
const API_URL = 'http://localhost:4000'

export const classAPI = {
  // Start a class (only for class owner)
  startClass: async (classId, liveUrl = '') => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/classes/${classId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ liveUrl })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start class')
    }

    return response.json()
  },

  // End a class (only for class owner)
  endClass: async (classId) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/classes/${classId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to end class')
    }

    return response.json()
  },

  // Get all classes
  getAllClasses: async (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key])
      }
    })

    const response = await fetch(`${API_URL}/classes?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch classes')
    }

    return response.json()
  },

  // Create a new class
  createClass: async (classData) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(classData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create class')
    }

    return response.json()
  },

  // Join a class (add as attendee)
  joinClass: async (classId) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/classes/${classId}/attend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to join class')
    }

    return response.json()
  }
}