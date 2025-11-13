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

  // Get personalized classes based on user interests/hobbies
  getPersonalizedClasses: async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/classes/personalized/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch personalized classes')
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
  },

  // Get classes by category name
  getClassesByCategory: async (categoryName) => {
    try {
      // First get the category ID by name
      const categoriesResponse = await fetch(`${API_URL}/categories`)
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories')
      }
      const categoriesData = await categoriesResponse.json()
      
      // Find the category by name (case insensitive)
      const category = categoriesData.categories?.find(
        cat => cat.name.toLowerCase() === categoryName.toLowerCase()
      )
      
      if (!category) {
        console.warn(`Category "${categoryName}" not found`)
        return { classes: [] }
      }

      // Now get classes for this category
      const response = await fetch(`${API_URL}/classes?categoryId=${category._id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch classes for category ${categoryName}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error fetching classes for category ${categoryName}:`, error)
      return { classes: [] }
    }
  },

  // Transform backend class data to frontend format
  transformClassData: (backendClass, categoryName = '') => {
    return {
      title: backendClass.title,
      tag: categoryName || backendClass.categoryId?.name || 'General',
      author: backendClass.userId?.name || 'Expert Instructor',
      date: new Date(backendClass.startTime || backendClass.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: backendClass.duration ? `${backendClass.duration}min` : '2h 30m',
      startTime: backendClass.startTime || backendClass.date,
      status: backendClass.status || 'scheduled',
      classId: backendClass._id,
      description: backendClass.description || 'Join this exciting learning opportunity.',
      learners: backendClass.attendees?.length?.toString() || backendClass.interestedCount?.toString() || '0',
      level: backendClass.level || 'Intermediate',
      image: backendClass.image || '',
      attendees: backendClass.attendees || []
    }
  }
}