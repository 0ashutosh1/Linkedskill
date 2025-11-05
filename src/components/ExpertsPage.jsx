import React, { useState, useEffect } from 'react'
import { followExpert, unfollowExpert, getConnectionStatus } from '../utils/connections'

const API_URL = 'http://localhost:4000'

export default function ExpertsPage({ onBack }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionStatuses, setConnectionStatuses] = useState({}) // Will store { expertId: { isConnected: boolean, status: 'pending'|'accepted'|'rejected'|null, connectionExists: boolean } }
  const [connectingExperts, setConnectingExperts] = useState(new Set())

  useEffect(() => {
    fetchExperts()
  }, [])

  // Function to refresh connection statuses (can be called when user returns from notifications)
  const refreshConnectionStatuses = async () => {
    if (experts.length > 0) {
      const expertIds = experts.map(expert => expert.userId._id)
      await fetchConnectionStatusesBatch(expertIds)
    }
  }

  const fetchExperts = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please login to view experts')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/profile/experts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const expertProfiles = data.profiles || []
        setExperts(expertProfiles)
        
        // Batch connection status check for all experts at once
        if (expertProfiles.length > 0) {
          const expertIds = expertProfiles.map(expert => expert.userId._id)
          await fetchConnectionStatusesBatch(expertIds)
        }
      } else {
        setError('Failed to fetch expert profiles')
      }
    } catch (err) {
      console.error('Error fetching experts:', err)
      setError('Error loading expert profiles')
    } finally {
      setLoading(false)
    }
  }

  // Batch fetch connection statuses to reduce API calls
  const fetchConnectionStatusesBatch = async (expertIds) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // Make a single API call to get all connection statuses
      const response = await fetch(`${API_URL}/connections/status/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expertIds })
      })

      if (response.ok) {
        const statusData = await response.json()
        setConnectionStatuses(statusData.statuses || {})
      } else {
        // Fallback to individual calls if batch endpoint not available
        const statuses = {}
        for (const expertId of expertIds) {
          try {
            const statusData = await getConnectionStatus(expertId)
            statuses[expertId] = {
              isConnected: statusData.isConnected,
              status: statusData.status,
              connectionExists: statusData.connectionExists
            }
          } catch (err) {
            console.error(`Error checking status for expert ${expertId}:`, err)
            statuses[expertId] = {
              isConnected: false,
              status: null,
              connectionExists: false
            }
          }
        }
        setConnectionStatuses(statuses)
      }
    } catch (err) {
      console.error('Error fetching connection statuses:', err)
    }
  }

  // Helper function to get button text and state based on connection status
  const getConnectionButtonInfo = (expertId) => {
    const status = connectionStatuses[expertId] || {}
    
    if (status.isConnected) {
      return {
        text: '✓ Connected',
        isConnected: true,
        canDisconnect: true
      }
    } else if (status.status === 'pending') {
      return {
        text: '⏳ Request Sent',
        isConnected: false,
        canDisconnect: false
      }
    } else if (status.status === 'rejected') {
      return {
        text: '❌ Rejected',
        isConnected: false,
        canDisconnect: false
      }
    } else {
      return {
        text: 'Connect',
        isConnected: false,
        canDisconnect: false
      }
    }
  }

  const handleFollowToggle = async (expertId) => {
    console.log('handleFollowToggle called with expertId:', expertId)
    
    // Prevent duplicate calls - check if already processing this expert
    if (connectingExperts.has(expertId)) {
      console.log('Already processing connection for expert:', expertId)
      return
    }
    
    setConnectingExperts(prev => new Set([...prev, expertId]))
    
    try {
      const currentStatus = connectionStatuses[expertId] || {}
      console.log('Current connection status:', currentStatus)
      
      if (currentStatus.isConnected) {
        console.log('Unfollowing expert...')
        await unfollowExpert(expertId)
        setConnectionStatuses(prev => ({ 
          ...prev, 
          [expertId]: { isConnected: false, status: null, connectionExists: false } 
        }))
      } else {
        console.log('Following expert...')
        const result = await followExpert(expertId)
        console.log('Follow result:', result)
        
        // After sending request, update status to pending
        setConnectionStatuses(prev => ({ 
          ...prev, 
          [expertId]: { 
            isConnected: false, 
            status: 'pending', 
            connectionExists: true 
          } 
        }))
      }
    } catch (error) {
      console.error('Error toggling connection:', error)
      console.error('Error details:', error.message, error.stack)
      setError(error.message)
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError('')
      }, 5000)
    } finally {
      setConnectingExperts(prev => {
        const newSet = new Set(prev)
        newSet.delete(expertId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-fadeIn flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading expert profiles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (experts.length === 0) {
    return (
      <div className="animate-fadeIn min-h-screen flex flex-col">
        {/* Enhanced responsive header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 animate-slideDown px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4 leading-tight">
            Meet Your Expert Instructors
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn from industry leaders who are passionate about sharing their knowledge and expertise
          </p>
        </div>
        
        {/* Enhanced empty state */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto">
            <div className="text-gray-300 mb-6 sm:mb-8">
              <svg className="mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">No Expert Instructors Found</h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
              Expert profiles will appear here once instructors create their profiles.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn min-h-screen">
      {/* Enhanced responsive header */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12 animate-slideDown px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4 leading-tight">
          Meet Your Expert Instructors
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Learn from {experts.length} industry {experts.length === 1 ? 'leader' : 'leaders'} who are passionate about sharing their knowledge and expertise
        </p>
      </div>

      {/* Enhanced responsive grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 
                      gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 
                      px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 
                      max-w-8xl mx-auto">
        {experts.map((expert, index) => (
          <div
            key={expert._id}
            onClick={() => setSelectedMember(expert)}
            style={{ animationDelay: `${index * 100}ms` }}
            className="group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl 
                       shadow-md hover:shadow-2xl hover:shadow-purple-500/20 
                       transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 
                       animate-fadeInUp bg-white border border-gray-100 hover:border-purple-200"
          >
            {/* Enhanced responsive card */}
            <div className="aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 
                           flex items-center justify-center relative overflow-hidden">
              <img 
                src={expert.photoUrl || "/src/assets/placeholder.svg"} 
                alt={expert.name || 'Expert'} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 
                           group-hover:scale-110" 
              />
              
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/95 via-purple-400/60 to-transparent 
                             opacity-90 group-hover:from-purple-700/95 group-hover:via-purple-500/70 
                             transition-all duration-500" />
              
              {/* Enhanced action buttons */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1 sm:gap-2 
                             opacity-0 group-hover:opacity-100 transition-all duration-300 transform 
                             translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFollowToggle(expert.userId._id)
                  }}
                  disabled={connectingExperts.has(expert.userId._id) || !getConnectionButtonInfo(expert.userId._id).canDisconnect && getConnectionButtonInfo(expert.userId._id).text !== 'Connect'}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold 
                             transition-all duration-300 backdrop-blur-sm border border-white/20 
                             hover:scale-105 active:scale-95 ${
                    getConnectionButtonInfo(expert.userId._id).isConnected
                      ? 'bg-green-500/30 text-green-100 hover:bg-green-500/40'
                      : getConnectionButtonInfo(expert.userId._id).text === '⏳ Request Sent'
                      ? 'bg-orange-500/30 text-orange-100 cursor-not-allowed'
                      : getConnectionButtonInfo(expert.userId._id).text === '❌ Rejected'
                      ? 'bg-red-500/30 text-red-100 cursor-not-allowed'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  } ${connectingExperts.has(expert.userId._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {connectingExperts.has(expert.userId._id) 
                    ? '...' 
                    : getConnectionButtonInfo(expert.userId._id).text
                  }
                </button>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 
                               text-xs sm:text-sm text-white font-semibold border border-white/20">
                  View Profile
                </div>
              </div>
              
              {/* Enhanced content section */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5 
                             transform translate-y-0 group-hover:translate-y-[-4px] sm:group-hover:translate-y-[-8px] 
                             transition-all duration-500">
                <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 leading-tight">
                  {expert.name || 'Expert'}
                </h3>
                <p className="text-pink-200 text-xs sm:text-sm font-semibold mb-1 leading-tight">
                  {expert.designation || 'Expert Instructor'}
                </p>
                {expert.areasOfInterest && expert.areasOfInterest.length > 0 && (
                  <p className="text-pink-100 text-xs opacity-90 leading-tight">
                    {expert.areasOfInterest.slice(0, 2).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced responsive modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 
                     p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeIn"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl 
                       max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl w-full 
                       p-4 sm:p-6 md:p-8 lg:p-10 relative shadow-2xl animate-scaleIn 
                       overflow-y-auto max-h-[95vh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced close button */}
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 
                         w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 
                         bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center 
                         text-gray-600 text-lg sm:text-xl md:text-2xl 
                         transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95
                         shadow-sm hover:shadow-md"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Enhanced modal content layout */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
              {/* Responsive avatar section */}
              <div className="w-full sm:w-64 md:w-72 lg:w-64 xl:w-80 flex-shrink-0 mx-auto lg:mx-0">
                <div className="relative">
                  <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden 
                                  border-2 sm:border-4 border-purple-200 shadow-lg 
                                  ring-2 ring-gray-100 hover:ring-indigo-200 
                                  transition-all duration-300">
                    <img 
                      src={selectedMember.photoUrl || "/src/assets/placeholder.svg"} 
                      alt={selectedMember.name || 'Expert'} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  {/* Enhanced rating badge */}
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 
                                  bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                                  p-2 sm:p-3 md:p-4 rounded-full shadow-lg 
                                  ring-2 ring-white transform hover:scale-110 transition-transform">
                    <span className="text-xs sm:text-sm font-bold">★ 5.0</span>
                  </div>
                </div>
              </div>

              {/* Enhanced content section */}
              <div className="flex-1 text-center lg:text-left">
                {/* Enhanced badge */}
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                               px-3 sm:px-4 py-1 sm:py-1.5 rounded-full 
                               text-xs sm:text-sm font-semibold mb-3 sm:mb-4
                               shadow-lg hover:shadow-xl transition-shadow">
                  Expert Instructor
                </div>
                
                {/* Responsive heading */}
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white 
                               mb-2 leading-tight">
                  {selectedMember.name || 'Expert'}
                </h2>
                
                {/* Responsive designation */}
                <p className="text-purple-600 font-semibold text-sm sm:text-base md:text-lg 
                              mb-3 sm:mb-4">
                  {selectedMember.designation || 'Expert Instructor'}
                </p>
                
                {/* Enhanced responsive contact information */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-4 
                               text-xs sm:text-sm text-gray-600 justify-center lg:justify-start">
                  {selectedMember.email && (
                    <span className="flex items-center gap-1 sm:gap-2 
                                   bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                                   hover:bg-purple-50 hover:text-purple-600 transition-colors">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{selectedMember.email}</span>
                    </span>
                  )}
                  {selectedMember.education && (
                    <span className="flex items-center gap-1 sm:gap-2 
                                   bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                                   hover:bg-purple-50 hover:text-purple-600 transition-colors">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span className="truncate">{selectedMember.education}</span>
                    </span>
                  )}
                </div>

                {/* Enhanced areas of interest */}
                {selectedMember.areasOfInterest && selectedMember.areasOfInterest.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3 
                                   text-center lg:text-left">
                      Areas of Expertise
                    </h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center lg:justify-start">
                      {selectedMember.areasOfInterest.map((interest, idx) => (
                        <span key={idx} 
                              className="px-2 sm:px-3 py-1 sm:py-1.5 
                                         bg-purple-100 hover:bg-purple-200 text-purple-700 
                                         rounded-full text-xs sm:text-sm font-medium
                                         transform hover:scale-105 transition-all duration-200
                                         shadow-sm hover:shadow-md">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced professional info */}
                <div className="mb-4 sm:mb-6 text-center lg:text-left">
                  {selectedMember.occupation && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold text-purple-600">Occupation:</span>{' '}
                        {selectedMember.occupation}
                      </p>
                    </div>
                  )}
                  {!selectedMember.occupation && !selectedMember.education && (
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-purple-600 italic">
                        Professional details will be displayed when the instructor completes their profile.
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced responsive action buttons */}
                <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => handleFollowToggle(selectedMember.userId._id)}
                    disabled={connectingExperts.has(selectedMember.userId._id) || !getConnectionButtonInfo(selectedMember.userId._id).canDisconnect && getConnectionButtonInfo(selectedMember.userId._id).text !== 'Connect'}
                    className={`flex-1 sm:flex-none px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 
                               rounded-full font-semibold transition-all duration-300 
                               text-sm sm:text-base hover:scale-105 active:scale-95
                               shadow-lg hover:shadow-xl
                               ${getConnectionButtonInfo(selectedMember.userId._id).isConnected
                                 ? 'bg-green-600 hover:bg-green-700 text-white'
                                 : getConnectionButtonInfo(selectedMember.userId._id).text === '⏳ Request Sent'
                                 ? 'bg-orange-500 text-white cursor-not-allowed'
                                 : getConnectionButtonInfo(selectedMember.userId._id).text === '❌ Rejected'
                                 ? 'bg-red-500 text-white cursor-not-allowed'
                                 : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                               } ${connectingExperts.has(selectedMember.userId._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {connectingExperts.has(selectedMember.userId._id) 
                      ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </span>
                      )
                      : getConnectionButtonInfo(selectedMember.userId._id).text
                    }
                  </button>
                  
                  <button className="flex-1 sm:flex-none border-2 border-purple-600 text-purple-600 
                                   px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 
                                   rounded-full font-semibold hover:bg-purple-50 hover:border-purple-700
                                   transition-all duration-300 text-sm sm:text-base
                                   hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                    View Courses
                  </button>
                  {selectedMember.email && (
                    <a 
                      href={`mailto:${selectedMember.email}`}
                      className="border-2 border-purple-600 text-purple-600 px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300 text-sm md:text-base text-center"
                    >
                      Contact Instructor
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a 
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-blue-600 text-blue-600 px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 text-sm md:text-base text-center"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
