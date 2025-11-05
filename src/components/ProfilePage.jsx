import React, { useState, useEffect } from 'react'
import { CompactCountdownTimer } from './CountdownTimer'
import { classAPI } from '../utils/classAPI'
import { createMeeting } from '../utils/videoSdk'

const API_URL = 'http://localhost:4000'

export default function ProfilePage({ onBack, profile: passedProfile, onJoinLiveClass, onPhotoUpdate }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const isOwnProfile = !passedProfile || passedProfile.id === 'me'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    education: '',
    areasOfInterest: [],
    occupation: '',
    designation: '',
    linkedin: '',
    website: '',
    photoUrl: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [myClasses, setMyClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [classFormData, setClassFormData] = useState({
    title: '',
    description: '',
    date: ''
  })
  const [newInterest, setNewInterest] = useState('')
  const [showAllClasses, setShowAllClasses] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [startingClass, setStartingClass] = useState(null)
  const [classStartStates, setClassStartStates] = useState({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (isOwnProfile) {
      // Fetch current user's profile and classes
      fetchProfile()
      fetchMyClasses()
    } else {
      // Display passed profile data (read-only)
      setProfile(passedProfile)
      setFormData({
        name: passedProfile.name || '',
        email: passedProfile.email || '',
        phoneNo: passedProfile.phoneNo || '',
        education: passedProfile.education || '',
        areasOfInterest: passedProfile.areasOfInterest || [],
        occupation: passedProfile.occupation || '',
        designation: passedProfile.designation || '',
        linkedin: passedProfile.linkedin || '',
        website: passedProfile.website || '',
        photoUrl: passedProfile.photoUrl || ''
      })
      setLoading(false)
    }
  }, [isOwnProfile]) // Only depend on isOwnProfile, not passedProfile to prevent infinite loops

  // Handle passedProfile changes separately 
  useEffect(() => {
    if (!isOwnProfile && passedProfile) {
      setProfile(passedProfile)
      setFormData({
        name: passedProfile.name || '',
        email: passedProfile.email || '',
        phoneNo: passedProfile.phoneNo || '',
        education: passedProfile.education || '',
        areasOfInterest: passedProfile.areasOfInterest || [],
        occupation: passedProfile.occupation || '',
        designation: passedProfile.designation || '',
        linkedin: passedProfile.linkedin || '',
        website: passedProfile.website || '',
        photoUrl: passedProfile.photoUrl || ''
      })
    }
  }, [passedProfile, isOwnProfile])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to view your profile' })
        setLoading(false)
        return
      }

      console.log('Fetching profile...') // Debug log

      const response = await fetch(`${API_URL}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('Profile fetch response status:', response.status) // Debug log

      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data) // Debug log
        setProfile(data.profile)
        setFormData({
          name: data.profile.name || '',
          email: data.profile.email || '',
          phoneNo: data.profile.phoneNo || '',
          education: data.profile.education || '',
          areasOfInterest: data.profile.areasOfInterest || [],
          occupation: data.profile.occupation || '',
          designation: data.profile.designation || '',
          linkedin: data.profile.linkedin || '',
          website: data.profile.website || '',
          photoUrl: data.profile.photoUrl || ''
        })
      } else if (response.status === 404) {
        console.log('Profile not found, will create new one on save') // Debug log
        setProfile(null)
        // Check if there's user data to pre-populate
        try {
          const errorData = await response.json()
          if (errorData.userData) {
            setFormData(prev => ({
              ...prev,
              name: errorData.userData.name || '',
              email: errorData.userData.email || '',
              phoneNo: errorData.userData.phoneNo || ''
            }))
          }
        } catch (e) {
          console.log('No user data to pre-populate')
        }
      } else {
        const errorData = await response.json()
        console.log('Profile fetch error:', errorData) // Debug log
        setMessage({ type: 'error', text: errorData.error || 'Failed to load profile' })
      }
    } catch (error) {
      console.error('Network error fetching profile:', error)
      setMessage({ type: 'error', text: `Network error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const fetchMyClasses = async () => {
    try {
      setLoadingClasses(true)
      const token = localStorage.getItem('authToken')
      
      if (!token) return

      // Use new endpoint that gets both created AND registered classes
      const response = await fetch(`${API_URL}/classes/my/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const now = new Date()
        
        // Filter out past classes - only show upcoming/live classes
        const relevantClasses = (data.classes || []).filter(cls => {
          const classDate = new Date(cls.startTime || cls.date)
          // Show all upcoming classes and live classes
          return (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
        })
        
        console.log('📚 My Classes (created + registered):', relevantClasses.length)
        setMyClasses(relevantClasses)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAreasOfInterestChange = (value) => {
    const interests = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      areasOfInterest: interests
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.areasOfInterest.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        areasOfInterest: [...prev.areasOfInterest, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: prev.areasOfInterest.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest()
    }
  }

  // Sort classes by date (newest first) and filter based on showAllClasses and dateFilter
  const getFilteredClasses = () => {
    if (!myClasses || myClasses.length === 0) return []
    
    let filteredClasses = [...myClasses]

    // Filter by custom date if dateFilter is set
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      const filterDateStart = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate())
      const filterDateEnd = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate() + 1)
      
      filteredClasses = filteredClasses.filter(classItem => {
        const classDate = new Date(classItem.date || classItem.createdAt || Date.now())
        return classDate >= filterDateStart && classDate < filterDateEnd
      })
    }

    // Sort by date (newest first)
    const sortedClasses = filteredClasses.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || Date.now())
      const dateB = new Date(b.date || b.createdAt || Date.now())
      return dateB - dateA // Newest first
    })

    // If showAllClasses is false and no date filter, show only recent classes (last 4)
    if (!dateFilter && !showAllClasses) {
      return sortedClasses.slice(0, 4)
    }

    return sortedClasses
  }

  const clearDateFilter = () => {
    setDateFilter('')
    setShowDateFilter(false)
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to save your profile' })
        return
      }

      console.log('Saving profile with data:', formData) // Debug log
      console.log('Using token:', token?.substring(0, 20) + '...') // Debug log (partial token)
      console.log('API URL:', `${API_URL}/profile`) // Debug log

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status) // Debug log

      if (response.ok) {
        const data = await response.json()
        console.log('Success response:', data) // Debug log
        setProfile(data.profile || data)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setIsEditing(false)
        
        // Call onPhotoUpdate to refresh name and photo in RightPanel
        if (onPhotoUpdate) {
          onPhotoUpdate()
        }
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        let errorMessage = 'Failed to update profile'
        try {
          const errorData = await response.json()
          console.log('Error response:', errorData) // Debug log
          errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`
        } catch (parseError) {
          console.log('Could not parse error response:', parseError) // Debug log
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        setMessage({ type: 'error', text: errorMessage })
      }
    } catch (error) {
      console.error('Network error saving profile:', error)
      setMessage({ type: 'error', text: `Network error: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
      return
    }

    try {
      setUploadingPhoto(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to upload photo' })
        return
      }

      const formDataUpload = new FormData()
      formDataUpload.append('photo', file)

      const response = await fetch(`${API_URL}/profile/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({ ...prev, photoUrl: data.photoUrl }))
        setFormData(prev => ({ ...prev, photoUrl: data.photoUrl }))
        setMessage({ type: 'success', text: 'Profile photo updated successfully!' })
        
        // Call onPhotoUpdate to refresh photo in RightPanel
        if (onPhotoUpdate) {
          onPhotoUpdate()
        }
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to upload photo' })
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      setMessage({ type: 'error', text: 'Network error uploading photo' })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePhotoRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return
    }

    try {
      setUploadingPhoto(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to remove photo' })
        return
      }

      const response = await fetch(`${API_URL}/profile/remove-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setProfile(prev => ({ ...prev, photoUrl: '' }))
        setFormData(prev => ({ ...prev, photoUrl: '' }))
        setMessage({ type: 'success', text: 'Profile photo removed successfully!' })
        
        // Call onPhotoUpdate to refresh photo in RightPanel
        if (onPhotoUpdate) {
          onPhotoUpdate()
        }
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to remove photo' })
      }
    } catch (error) {
      console.error('Error removing photo:', error)
      setMessage({ type: 'error', text: 'Network error removing photo' })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleClassEdit = (classItem) => {
    setEditingClass(classItem._id)
    setClassFormData({
      title: classItem.title,
      description: classItem.description,
      date: classItem.date ? new Date(classItem.date).toISOString().split('T')[0] : ''
    })
  }

  const handleClassCancel = () => {
    setEditingClass(null)
    setClassFormData({ title: '', description: '', date: '' })
  }

  const handleClassInputChange = (field, value) => {
    setClassFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveClass = async (classId) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to save changes' })
        return
      }

      const response = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classFormData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Class updated successfully!' })
        setEditingClass(null)
        fetchMyClasses() // Refresh the classes list
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.message || 'Failed to update class' })
      }
    } catch (error) {
      console.error('Error saving class:', error)
      setMessage({ type: 'error', text: 'Failed to update class' })
    }
  }

  const deleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to delete classes' })
        return
      }

      const response = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Class deleted successfully!' })
        fetchMyClasses() // Refresh the classes list
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.message || 'Failed to delete class' })
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      setMessage({ type: 'error', text: 'Failed to delete class' })
    }
  }

  const handleStartClass = async (classItem) => {
    try {
      setStartingClass(classItem._id)
      
      // Create VideoSDK meeting room
      console.log('🎥 Creating meeting room...')
      const meetingId = await createMeeting()
      console.log('✅ Meeting created:', meetingId)
      
      // Update class with meeting ID and start it
      const token = localStorage.getItem('authToken')
      await fetch(`${API_URL}/classes/${classItem._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meetingId: meetingId })
      })
      
      const result = await classAPI.startClass(classItem._id)
      
      setMessage({ type: 'success', text: `Class "${classItem.title}" has been started successfully! 🎉` })
      
      // Update the class in the local state to reflect the new status and meeting ID
      setMyClasses(prevClasses => 
        prevClasses.map(cls => 
          cls._id === classItem._id 
            ? { ...cls, status: 'live', meetingId: meetingId }
            : cls
        )
      )

      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
    } catch (error) {
      console.error('Error starting class:', error)
      setMessage({ type: 'error', text: `Failed to start class: ${error.message}` })
      
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
    } finally {
      setStartingClass(null)
    }
  }

  const handleCanStartChange = (classId, canStart) => {
    setClassStartStates(prev => ({
      ...prev,
      [classId]: canStart
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 font-medium transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* My Profile Section */}
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                {isOwnProfile ? 'My Profile' : `${formData.name || 'User'}'s Profile`}
              </h2>
              <p className="text-white/80 text-sm">
                {isOwnProfile ? 'Manage your professional information' : 'View professional information'}
              </p>
            </div>

            {/* Personal Information */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200">Personal Information</h3>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              {/* Avatar */}
              <div className="flex items-center mb-6">
                <div className="relative w-20 h-20 bg-slate-700/50 border border-slate-600/50 rounded-full flex items-center justify-center group">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {isOwnProfile && (
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </label>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-200">{profile?.name || formData.name || 'KUMAR ASHUTOSH'}</h4>
                  <p className="text-sm text-gray-400">{profile?.email || formData.email || 'COOL.ASHUTOSH@GMAIL.COM'}</p>
                  {isOwnProfile && (
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">Hover to change photo</p>
                      {profile?.photoUrl && (
                        <button
                          onClick={handlePhotoRemove}
                          disabled={uploadingPhoto}
                          className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">NAME</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">EMAIL</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">PHONE</label>
                      <input
                        type="tel"
                        value={formData.phoneNo}
                        onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">LINKEDIN</label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://linkedin.com/in/ashutosh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">WEBSITE</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://website.com/ashutosh"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Professional Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">EDUCATION</label>
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="BE CSE INFORMATION TECHNOLOGY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">DESIGNATION</label>
                        <input
                          type="text"
                          value={formData.designation}
                          onChange={(e) => handleInputChange('designation', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="SOFTWARE ENGINEER"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">OCCUPATION</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="ASSOCIATE ENGINEER"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">AREAS OF INTEREST</label>
                    
                    {/* Current Interests Display */}
                    <div className="mb-3">
                      {formData.areasOfInterest.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.areasOfInterest.map((interest, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 border border-blue-700/50 text-blue-300 rounded-full text-sm font-medium group hover:bg-blue-800/50 transition-colors"
                            >
                              <span>{interest}</span>
                              <button
                                type="button"
                                onClick={() => removeInterest(index)}
                                className="text-purple-500 hover:text-purple-700 transition-colors"
                                title="Remove interest"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">No interests added yet</p>
                      )}
                    </div>

                    {/* Add New Interest */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Add a new interest (e.g., ReactJS, NodeJS)"
                      />
                      <button
                        type="button"
                        onClick={addInterest}
                        disabled={!newInterest.trim() || formData.areasOfInterest.includes(newInterest.trim())}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 font-medium">NAME</span>
                      <p className="text-gray-200">{profile?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">EMAIL</span>
                      <p className="text-gray-200">{profile?.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">PHONE</span>
                      <p className="text-gray-200">{profile?.phoneNo || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">LINKEDIN</span>
                      {profile?.linkedin ? (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all text-sm block flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          {profile.linkedin.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <p className="text-gray-400">Not specified</p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">WEBSITE</span>
                      {profile?.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all text-sm block">
                          {profile.website}
                        </a>
                      ) : (
                        <p className="text-gray-400">Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600/50">
                    <h4 className="text-sm font-semibold text-gray-200 mb-3">Professional Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 font-medium">EDUCATION</span>
                        <p className="text-gray-200">{profile?.education || 'BE CSE INFORMATION TECHNOLOGY'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">DESIGNATION</span>
                        <p className="text-gray-200">{profile?.designation || 'SOFTWARE ENGINEER'}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm">
                      <span className="text-gray-400 font-medium">OCCUPATION</span>
                      <p className="text-gray-200">{profile?.occupation || 'ASSOCIATE ENGINEER'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <span className="text-gray-500 font-medium text-sm">AREAS OF INTEREST</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile?.areasOfInterest && profile.areasOfInterest.length > 0 ? (
                        profile.areasOfInterest.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 shadow-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <div className="w-full py-8 text-center">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <p className="text-sm">No interests added yet</p>
                            <p className="text-xs mt-1">Click edit to add your areas of interest</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* My Classes Section - Only show for own profile */}
          {isOwnProfile && (
            <div className="space-y-6">
            {/* Classes Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">My Classes</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {dateFilter ? `Classes from ${new Date(dateFilter).toLocaleDateString()}` : 
                     showAllClasses ? 'All courses' : 'Latest 4 courses'} • Sorted by date
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {getFilteredClasses().length} of {myClasses.length} courses
                  </span>
                  
                  {/* Date Filter Button */}
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {dateFilter ? 'Clear Date' : 'Filter by Date'}
                  </button>

                  {/* See All Button */}
                  {myClasses.length > 4 && !dateFilter && (
                    <button
                      onClick={() => setShowAllClasses(!showAllClasses)}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {showAllClasses ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Show Recent
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          See All
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filter Input */}
              {showDateFilter && (
                <div className="border-t border-white/20 pt-4 mt-4">
                  <div className="flex items-center gap-3">
                    <label className="text-white/90 text-sm font-medium">Filter by date:</label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                    {dateFilter && (
                      <button
                        onClick={clearDateFilter}
                        className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Classes List */}
            <div className="space-y-4">
              {loadingClasses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : myClasses.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-200 mb-2">No courses yet</h3>
                  <p className="text-gray-400">Start learning by enrolling in your first course!</p>
                </div>
              ) : (
                getFilteredClasses().map((classItem) => (
                  <div key={classItem._id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl p-6">
                    {editingClass === classItem._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Class Title</label>
                          <input
                            type="text"
                            value={classFormData.title}
                            onChange={(e) => handleClassInputChange('title', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-gray-200 placeholder-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Enter class title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <textarea
                            value={classFormData.description}
                            onChange={(e) => handleClassInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-gray-200 placeholder-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Enter class description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                          <input
                            type="date"
                            value={classFormData.date}
                            onChange={(e) => handleClassInputChange('date', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-gray-200 placeholder-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => saveClass(classItem._id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleClassCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-200 text-lg">{classItem.title}</h3>
                              
                              {/* Created vs Registered Badge */}
                              {(() => {
                                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                const currentUserId = currentUser.sub || currentUser.id || currentUser._id;
                                const classOwnerId = classItem.userId?._id || classItem.userId;
                                
                                if (classOwnerId && currentUserId) {
                                  return classOwnerId === currentUserId ? (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                      👨‍🏫 Created by me
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                      ✅ Registered
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Status Badge */}
                              {classItem.status && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                  ${classItem.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                    classItem.status === 'completed' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                  {classItem.status === 'live' ? '🔴 LIVE' : 
                                   classItem.status === 'completed' ? 'Completed' : 
                                   'Scheduled'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{classItem.description}</p>
                            
                            {/* Date and Time Info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {new Date(classItem.startTime || classItem.date).toLocaleDateString()}
                              </span>
                              {classItem.startTime && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {new Date(classItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {classItem.duration && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {classItem.duration} minutes
                                </span>
                              )}
                            </div>

                            {/* Countdown Timer - Only show for scheduled classes with startTime */}
                            {classItem.startTime && classItem.status === 'scheduled' && (
                              <div className="mb-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                                <CompactCountdownTimer 
                                  startTime={classItem.startTime} 
                                  onCanStart={(canStart) => handleCanStartChange(classItem._id, canStart)}
                                  className="justify-start"
                                />
                              </div>
                            )}

                            {/* Start Button - Only for scheduled classes */}
                            {classItem.status === 'scheduled' && classItem.startTime && classStartStates[classItem._id] && (
                              <div className="mb-3">
                                <button
                                  onClick={() => handleStartClass(classItem)}
                                  disabled={startingClass === classItem._id}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                                           disabled:from-green-800 disabled:to-emerald-800 disabled:cursor-not-allowed
                                           text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 
                                           hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
                                >
                                  {startingClass === classItem._id ? (
                                    <>
                                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                      </svg>
                                      Starting Class...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8"/>
                                      </svg>
                                      Start Live Class
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Live Class Status */}
                            {classItem.status === 'live' && (
                              <div className="mb-3">
                                <div className="mb-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                  <div className="flex items-center gap-2 text-red-400">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">Class is currently live!</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (onJoinLiveClass) {
                                      onJoinLiveClass({
                                        classId: classItem._id,
                                        title: classItem.title,
                                        userId: classItem.userId,
                                        meetingId: classItem.meetingId,
                                        startTime: classItem.startTime,
                                        description: classItem.description,
                                        category: classItem.category
                                      });
                                    }
                                  }}
                                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
                                           text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 
                                           hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                  </svg>
                                  Join Live Class Now
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => deleteClass(classItem._id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition"
                              title="Delete class"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleClassEdit(classItem)}
                              className="p-2 text-gray-400 hover:text-blue-500 transition"
                              title="Edit class"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}