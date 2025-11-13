import React, { useState, useEffect } from 'react'
import { getCurrentUser } from '../utils/auth'

const API_URL = 'http://localhost:4000'

export default function ConnectedStudents({ 
  loading: externalLoading, 
  onStudentChatClick, 
  onStudentProfileClick,
  upcomingClasses = [],
  onClassUpdate,
  onConnectionRemoved,
  onViewClassReviews
}) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registeredClasses, setRegisteredClasses] = useState(new Set())
  const [registeringClass, setRegisteringClass] = useState(null)
  const [activeTab, setActiveTab] = useState('students') // 'students' or 'classes'
  const [removingConnection, setRemovingConnection] = useState(null)

  const currentUser = getCurrentUser()
  const isStudent = currentUser?.role?.name === 'student'
  const isExpert = currentUser?.role?.name === 'expert'

  useEffect(() => {
    fetchConnectedStudents()
    if (isStudent) {
      fetchUserRegistrations()
    }
  }, [isStudent])

  const fetchConnectedStudents = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please login to view connected students')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/connections/my-followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data.followers || [])
      } else {
        setError('Failed to fetch connected students')
      }
    } catch (err) {
      console.error('Error fetching connected students:', err)
      setError('Error loading connected students')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRegistrations = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // Get user's registered classes
      const response = await fetch(`${API_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const userRegistered = new Set()
        
        data.classes?.forEach(cls => {
          if (cls.attendees?.some(attendee => attendee._id === currentUser?.sub || attendee === currentUser?.sub)) {
            userRegistered.add(cls._id)
          }
        })
        
        setRegisteredClasses(userRegistered)
      }
    } catch (err) {
      console.error('Error fetching user registrations:', err)
    }
  }

  const handleClassRegistration = async (classId, isRegistered) => {
    try {
      setRegisteringClass(classId)
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('Please login to register for classes')
        return
      }

      const endpoint = isRegistered ? 
        `${API_URL}/classes/${classId}/attend` : 
        `${API_URL}/classes/${classId}/attend`
      
      const method = isRegistered ? 'DELETE' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update local state
        const newRegistered = new Set(registeredClasses)
        if (isRegistered) {
          newRegistered.delete(classId)
        } else {
          newRegistered.add(classId)
        }
        setRegisteredClasses(newRegistered)

        // Callback to parent to update class data
        if (onClassUpdate) {
          onClassUpdate()
        }

        // Show success message
        const action = isRegistered ? 'unregistered from' : 'registered for'
        // You can add a toast notification here if you have one
      } else {
        const errorData = await response.json()
        alert(errorData.error || `Failed to ${isRegistered ? 'unregister from' : 'register for'} class`)
      }
    } catch (err) {
      console.error('Error with class registration:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setRegisteringClass(null)
    }
  }

  const handleRemoveConnection = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from your connections?`)) {
      return
    }

    try {
      setRemovingConnection(studentId)
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('Please login to remove connections')
        return
      }

      const response = await fetch(`${API_URL}/connections/unfollow/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Immediately refresh the students list
        await fetchConnectedStudents()
        
        // Also notify parent component if needed
        if (onConnectionRemoved) {
          onConnectionRemoved()
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to remove connection')
      }
    } catch (err) {
      console.error('Error removing connection:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setRemovingConnection(null)
    }
  }

  if (loading || externalLoading) {
    return (
      <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
        <h4 className="text-sm font-semibold mb-2 text-white flex-shrink-0">Connected Students</h4>
        <div className="space-y-1.5 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-600 rounded mb-1"></div>
                <div className="h-2 bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
        <h4 className="text-sm font-semibold mb-2 text-white flex-shrink-0">Connected Students</h4>
        <div className="text-center py-4 flex-1 flex flex-col justify-center">
          <div className="text-red-400 mb-2">
            <svg className="mx-auto h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
        <h4 className="text-sm font-semibold mb-2 text-white flex-shrink-0">Connected Students</h4>
        <div className="text-center py-4 flex-1 flex flex-col justify-center">
          <div className="text-gray-300 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p className="text-white text-sm font-medium mb-1">No connected students yet</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            Students will appear here once they connect with you
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center bg-slate-700/30 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs px-2 py-1 rounded-md bg-blue-500 text-white"
          >
            {isExpert ? 'Students' : 'Connected'}
          </button>
        </div>
        
        {/* Counter Badge */}
        <span className="text-xs text-white bg-slate-700/50 border border-slate-600/50 px-2 py-0.5 rounded-full">
          {students.length}
        </span>
      </div>
      
      <div className="space-y-1.5 flex-1 overflow-visible">
        {/* Students Tab Content */}
        {activeTab === 'students' && (
          <>
            {students.slice(0, 3).map((student) => (
              <div
                key={student.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30 
                           transition-all duration-200 cursor-pointer hover:shadow-sm border border-transparent 
                           hover:border-slate-600/50"
              >
                {/* Student Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={student.photoUrl || "/src/assets/placeholder.svg"}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-slate-600 
                               group-hover:border-purple-400 transition-colors duration-200"
                  />
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 
                                 rounded-full border-2 border-slate-800 shadow-sm"></div>
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-white group-hover:text-purple-300 
                                 transition-colors duration-200 leading-tight">
                    {student.name.split(' ')[0]}
                  </h5>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 
                               transition-opacity duration-200 flex-shrink-0 ml-1">
                  {onStudentChatClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStudentChatClick(student)
                      }}
                      className="w-5 h-5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 
                                 text-blue-400 flex items-center justify-center transition-colors duration-200 
                                 hover:scale-105 active:scale-95 border border-blue-500/30"
                      title="Chat with student"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </button>
                  )}
                  
                  {onStudentProfileClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStudentProfileClick(student)
                      }}
                      className="w-5 h-5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 
                                 text-purple-400 flex items-center justify-center transition-colors duration-200 
                                 hover:scale-105 active:scale-95 border border-purple-500/30"
                      title="View student profile"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </button>
                  )}

                  {/* Remove Connection Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveConnection(student.id, student.name)
                    }}
                    disabled={removingConnection === student.id}
                    className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/30 
                               text-red-400 flex items-center justify-center transition-colors duration-200 
                               hover:scale-105 active:scale-95 border border-red-500/30 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove connection"
                  >
                    {removingConnection === student.id ? (
                      <svg className="w-2.5 h-2.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Classes Tab Content */}
        {activeTab === 'classes' && (
          <>
            {upcomingClasses.slice(0, 4).map((classItem) => {
              const isRegistered = registeredClasses.has(classItem._id)
              const isOwner = classItem.userId === currentUser?.sub || classItem.userId?._id === currentUser?.sub
              // Allow registration for students on any scheduled class (including own for testing)
              const canRegister = isStudent && classItem.status === 'scheduled'
              const isLoading = registeringClass === classItem._id

              return (
                <div
                  key={classItem._id}
                  className="group p-2 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 
                             transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50"
                  onClick={(e) => {
                    // Prevent any parent click handlers
                    e.stopPropagation()
                  }}
                >
                  {/* Class Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-white leading-tight truncate">
                        {classItem.title}
                      </h5>
                      <p className="text-xs text-gray-400 truncate">
                        by {classItem.userId?.name || classItem.instructor || 'Expert'}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    {classItem.status && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2
                        ${classItem.status === 'live' ? 'bg-red-500/20 text-red-400' : 
                          classItem.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-blue-500/20 text-blue-400'}`}>
                        {classItem.status === 'live' ? '🔴' : 
                         classItem.status === 'completed' ? '✓' : '📅'}
                      </span>
                    )}
                  </div>

                  {/* Class Info */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {classItem.startTime ? 
                          new Date(classItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                          new Date(classItem.date).toLocaleDateString()
                        }
                      </span>
                    </div>
                    
                    {/* Registration Count */}
                    <span className="flex items-center gap-1 text-green-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                      {classItem.interestedCount || classItem.attendees?.length || 0}
                    </span>
                  </div>

                  {/* Action Button */}
                  {canRegister && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleClassRegistration(classItem._id, isRegistered)
                      }}
                      disabled={isLoading}
                      className={`w-full text-xs py-1.5 px-2 rounded-md font-medium transition-all duration-200 
                                  flex items-center justify-center gap-1.5 ${
                        isRegistered
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          {isRegistered ? 'Leaving...' : 'Joining...'}
                        </>
                      ) : (
                        <>
                          {isRegistered ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                              Leave Class
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                              </svg>
                              Join Class
                            </>
                          )}
                        </>
                      )}
                    </button>
                  )}

                  {/* Show registration status for non-actionable items */}
                  {!canRegister && (
                    <>
                      {isRegistered && classItem.status !== 'completed' && (
                        <div className="text-xs text-green-400 text-center py-1 bg-green-500/10 rounded border border-green-500/20">
                          ✓ Registered
                        </div>
                      )}

                      {/* View Reviews Button for Completed Classes */}
                      {classItem.status === 'completed' && onViewClassReviews && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onViewClassReviews({
                              id: classItem.userId?._id || classItem.userId,
                              name: classItem.userId?.name || classItem.instructor || 'Expert',
                              classId: classItem._id,
                              className: classItem.title
                            })
                          }}
                          className="w-full text-xs py-1.5 px-2 rounded-md font-medium transition-all duration-200 
                                     flex items-center justify-center gap-1.5 bg-yellow-500/20 text-yellow-400 
                                     border border-yellow-500/30 hover:bg-yellow-500/30 hover:scale-105 active:scale-95"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          View Reviews
                        </button>
                      )}

                      {isOwner && (
                        <div className="text-xs text-blue-400 text-center py-1 bg-blue-500/10 rounded border border-blue-500/20">
                          👨‍🏫 Your Class
                        </div>
                      )}

                      {!isStudent && (
                        <div className="text-xs text-gray-400 text-center py-1 bg-gray-500/10 rounded border border-gray-500/20">
                          Expert View
                        </div>
                      )}

                      {classItem.status !== 'scheduled' && (
                        <div className="text-xs text-gray-400 text-center py-1 bg-gray-500/10 rounded border border-gray-500/20">
                          {classItem.status === 'live' ? 'Live Now' : 'Class Ended'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}

            {/* Empty state for classes */}
            {upcomingClasses.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"/>
                </svg>
                <p className="text-sm font-medium mb-1">No upcoming classes</p>
                <p className="text-xs text-gray-500">Classes will appear here when available</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Show more button - conditional based on active tab */}
      {activeTab === 'students' && students.length > 3 && (
        <div className="mt-3 text-center flex-shrink-0">
          <button className="text-xs text-purple-400 hover:text-purple-300 font-medium 
                           hover:underline transition-colors duration-200 bg-slate-700/30 hover:bg-slate-700/50 
                           px-3 py-1 rounded-full border border-slate-600/50 hover:border-purple-400/50">
            +{students.length - 3} more students
          </button>
        </div>
      )}
      
      {activeTab === 'classes' && upcomingClasses.length > 4 && (
        <div className="mt-3 text-center flex-shrink-0">
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium 
                           hover:underline transition-colors duration-200 bg-slate-700/30 hover:bg-slate-700/50 
                           px-3 py-1 rounded-full border border-slate-600/50 hover:border-blue-400/50">
            +{upcomingClasses.length - 4} more classes
          </button>
        </div>
      )}
    </div>
  )
}