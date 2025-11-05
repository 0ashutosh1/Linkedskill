import React, { useState } from 'react'
import { CompactCountdownTimer } from './CountdownTimer'
import { getCurrentUser } from '../utils/auth'

export default function CourseCard({title, tag, author, date, time, startTime, status, classId, onSelect, onJoin, onStart, description, learners, level, image, attendees}){
  const [saved, setSaved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [canStart, setCanStart] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  
  const currentUser = getCurrentUser()
  const isInstructor = currentUser && currentUser.role?.name === 'expert'
  const isOwner = currentUser && author === currentUser.name
  
  // Format the start time to display
  const formatClassTime = () => {
    if (!startTime) return ''
    const classDate = new Date(startTime)
    return classDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  const classTime = formatClassTime()
  
  // Check if current user is registered for this class
  useState(() => {
    if (currentUser && attendees) {
      const currentUserId = currentUser.sub || currentUser.id || currentUser._id
      const isUserRegistered = attendees.some(attendee => {
        const attendeeId = typeof attendee === 'string' ? attendee : (attendee._id || attendee.id)
        return attendeeId === currentUserId
      })
      setIsRegistered(isUserRegistered)
    }
  }, [attendees, currentUser])

  // Generate professional image based on course title/tag
  const getCourseImageStyle = () => {
    const titleLower = title?.toLowerCase() || ''
    
    if (titleLower.includes('frontend') || titleLower.includes('react') || titleLower.includes('javascript') || titleLower.includes('html') || titleLower.includes('css')) {
      return {
        gradient: 'from-orange-500 via-red-500 to-pink-500',
        pattern: 'frontend',
        icon: '⚛️'
      }
    } else if (titleLower.includes('backend') || titleLower.includes('server') || titleLower.includes('node') || titleLower.includes('api')) {
      return {
        gradient: 'from-green-500 via-teal-500 to-cyan-500',
        pattern: 'backend',
        icon: '🚀'
      }
    } else if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
      return {
        gradient: 'from-purple-500 via-indigo-500 to-blue-500',
        pattern: 'design',
        icon: '🎨'
      }
    } else if (titleLower.includes('data') || titleLower.includes('science') || titleLower.includes('analytics')) {
      return {
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        pattern: 'data',
        icon: '📊'
      }
    } else if (titleLower.includes('finance') || titleLower.includes('investment') || titleLower.includes('business')) {
      return {
        gradient: 'from-emerald-500 via-green-500 to-teal-500',
        pattern: 'finance',
        icon: '💰'
      }
    } else {
      return {
        gradient: 'from-slate-500 via-gray-500 to-zinc-500',
        pattern: 'general',
        icon: '📚'
      }
    }
  }

  const imageStyle = getCourseImageStyle()

  const handleCardClick = () => {
    // For live classes or when explicitly selecting a course, navigate to live class page
    if (status === 'live' || onSelect) {
      onSelect && onSelect({ title, tag, author, date, time, status, classId, description, learners })
    } else {
      // For other cases, show the modal
      setShowModal(true)
    }
  }

  const handleCloseModal = (e) => {
    e.stopPropagation()
    setShowModal(false)
  }

  const handleStartClass = async (e) => {
    e.stopPropagation()
    if (!canStart || isStarting || !onStart) return
    
    setIsStarting(true)
    try {
      await onStart({ classId, title, startTime })
    } catch (error) {
      console.error('Error starting class:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleCanStartChange = (canStartNow) => {
    setCanStart(canStartNow)
  }
  
  const handleRegisterToggle = async (e) => {
    e.stopPropagation()
    
    const token = localStorage.getItem('authToken')
    if (!token) {
      alert('Please login to register for classes')
      return
    }
    
    setIsRegistering(true)
    try {
      const method = isRegistered ? 'DELETE' : 'POST'
      const response = await fetch(`http://localhost:4000/classes/${classId}/attend`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setIsRegistered(!isRegistered)
        const actionText = isRegistered ? 'unregistered from' : 'registered for'
        alert(`Successfully ${actionText} "${title}"!`)
        // Optionally refresh the page or update the learners count
        if (onJoin) {
          // Trigger parent refresh if needed
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update registration')
      }
    } catch (error) {
      console.error('Error toggling registration:', error)
      alert('Failed to update registration. Please try again.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <>
      {/* Main Course Card - Clean Design */}
      <div 
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300
                   group cursor-pointer overflow-hidden border border-gray-200
                   hover:scale-[1.02] relative h-64"
        onClick={handleCardClick}
      >
        {/* Course Image/Header */}
        <div className={`h-32 ${image ? '' : `bg-gradient-to-br ${imageStyle.gradient}`}
                         relative overflow-hidden flex items-center justify-center`}>
          
          {/* Show uploaded image if available */}
          {image ? (
            <>
              <img 
                src={image} 
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </>
          ) : (
            /* Course Icon/Emoji for gradient background */
            <div className="text-4xl opacity-90 group-hover:scale-110 transition-transform duration-300">
              {imageStyle.icon}
            </div>
          )}
          
          {/* Duration Badge */}
          <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-white text-xs font-medium">{time}</span>
          </div>
          
          {/* Status Badge - if live */}
          {status === 'live' && (
            <div className="absolute top-3 left-3 bg-red-500 rounded-full px-2 py-1">
              <span className="text-white text-xs font-bold">● LIVE</span>
            </div>
          )}
        </div>

          {/* Content Section */}
        <div className="p-4 flex flex-col h-32">
          {/* Course Title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title || 'Course Title'}
          </h3>
          
          {/* Author and Time */}
          <div className="text-xs text-gray-600 mb-auto space-y-1">
            <p>By: {author || 'Expert Instructor'}</p>
            {classTime && (
              <p className="text-gray-500">
                🕒 {classTime} • {date}
              </p>
            )}
          </div>

          {/* Hover Details - Hidden by default, shown on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 
                          absolute inset-0 bg-white/95 backdrop-blur-sm p-4 
                          flex flex-col justify-between border border-gray-200 rounded-lg">
            
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${imageStyle.gradient}`}>
                  {tag}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">
                {title}
              </h3>
              
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                {description || 'Learn essential skills in this comprehensive course designed for all levels.'}
              </p>
            </div>

            {/* Stats and Details */}
            <div className="space-y-2">
              <div className="flex items-center text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{learners || '0'} students</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>By: {author}</p>
                <p>📅 {date}</p>
                {classTime && <p>🕒 {classTime}</p>}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isInstructor && isOwner && status === 'scheduled' && startTime ? (
                  <button 
                    onClick={handleStartClass}
                    disabled={!canStart || isStarting}
                    className={`w-full py-2 px-3 rounded text-xs font-semibold transition-all duration-200
                               ${canStart && !isStarting
                                 ? 'bg-green-600 hover:bg-green-700 text-white'
                                 : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                               }`}
                  >
                    {isStarting ? 'Starting...' : 'Start Class'}
                  </button>
                ) : status === 'live' ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onJoin && onJoin({ title, tag, author, date, time, status, classId }); 
                    }}
                    className="w-full py-2 px-3 rounded text-xs font-semibold transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
                  >
                    🔴 Join Live
                  </button>
                ) : (
                  <button 
                    onClick={handleRegisterToggle}
                    disabled={isRegistering}
                    className={`w-full py-2 px-3 rounded text-xs font-semibold transition-all duration-200
                               ${isRegistered 
                                 ? 'bg-green-600 hover:bg-green-700 text-white'
                                 : 'bg-blue-600 hover:bg-blue-700 text-white'
                               } ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isRegistering ? 'Processing...' : isRegistered ? '✅ Registered' : '📝 Register'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className={`h-80 ${image ? '' : `bg-gradient-to-br ${imageStyle.gradient}`} relative flex items-center justify-center`}>
              {/* Close button */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 
                           text-white rounded-full flex items-center justify-center
                           transition-all duration-200 hover:scale-110 text-xl font-bold z-20"
              >
                ×
              </button>
              
              {image ? (
                <>
                  <img 
                    src={image} 
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent"></div>
                </>
              ) : (
                <>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '40px 40px'
                    }}></div>
                  </div>
                  
                  {/* Large Icon */}
                  <div className="relative z-10 text-white/90">
                    <div className="w-40 h-40">
                      {imageStyle.icon}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Content */}
            <div className="p-8 overflow-y-auto h-full">
              {/* Title and Meta */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${imageStyle.gradient} text-white`}>
                    {tag}
                  </span>
                  <span className="text-sm text-gray-600">{time}</span>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {title}
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                  {description || `Master modern frontend development with React, HTML5, CSS3, and responsive, interactive web applications from scratch.`}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <span>📅 {date}</span>
                  {classTime && <span>🕒 {classTime}</span>}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Instructor */}
                <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-6 border border-blue-800/30">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-200">Instructor</div>
                    <div className="text-xl font-bold text-blue-400">{author}</div>
                    <div className="text-sm text-gray-400">Expert Instructor</div>
                  </div>
                </div>

                {/* Learners */}
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-6 border border-green-800/30">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-200">Students</div>
                    <div className="text-xl font-bold text-green-400">{learners || '8,245'}</div>
                    <div className="text-sm text-gray-400">Enrolled</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                {/* Save Button */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-700/50 to-gray-700/50 rounded-xl border border-gray-600">
                  <div>
                    <div className="text-lg font-semibold text-gray-200">Save this course</div>
                    <div className="text-sm text-gray-400">Add to your learning list</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 font-semibold
                               transition-all duration-300 hover:scale-105
                               ${saved 
                                 ? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700' 
                                 : 'border-gray-500 text-gray-300 hover:bg-gray-700 hover:border-gray-400'}`}
                  >
                    <svg className="w-5 h-5" 
                         fill={saved ? "currentColor" : "none"} 
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    {saved ? "Saved" : "Save Course"}
                  </button>
                </div>

                {/* Start Learning Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onJoin && onJoin({ title, tag, author, date, time }); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                             text-white text-xl font-bold py-6 px-8 rounded-xl 
                             hover:shadow-xl hover:shadow-blue-500/30
                             transition-all duration-300 hover:scale-[1.02]
                             flex items-center justify-center gap-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8 4h8m-8 4h8"/>
                  </svg>
                  Start Learning Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}