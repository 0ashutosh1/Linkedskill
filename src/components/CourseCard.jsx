import React, { useState } from 'react'
import { CompactCountdownTimer } from './CountdownTimer'
import { getCurrentUser } from '../utils/auth'

export default function CourseCard({title, tag, author, date, time, startTime, status, classId, onSelect, onJoin, onStart, description, learners, level}){
  const [saved, setSaved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [canStart, setCanStart] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  
  const currentUser = getCurrentUser()
  const isInstructor = currentUser && currentUser.role?.name === 'expert'
  const isOwner = currentUser && author === currentUser.name

  // Generate professional image based on course title/tag
  const getCourseImageStyle = () => {
    const titleLower = title?.toLowerCase() || ''
    
    if (titleLower.includes('frontend') || titleLower.includes('react')) {
      return {
        gradient: 'from-blue-600 via-blue-500 to-cyan-500',
        pattern: 'frontend',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14.5l-4-4 1.41-1.41L12 11.67l2.59-2.58L16 10.5l-4 4zm0-10.09l-8 8 8 8 8-8-8-8zM4.93 12L12 5.91 19.07 12 12 18.09 4.93 12z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('backend') || titleLower.includes('server')) {
      return {
        gradient: 'from-cyan-600 via-teal-500 to-blue-600',
        pattern: 'backend',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('design') || titleLower.includes('ui')) {
      return {
        gradient: 'from-blue-500 via-indigo-500 to-blue-600',
        pattern: 'design',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h7v12H4V6zm16 12h-7V6h7v12z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('finance') || titleLower.includes('investment') || titleLower.includes('business')) {
      return {
        gradient: 'from-teal-600 via-cyan-500 to-blue-500',
        pattern: 'finance',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      }
    } else {
      return {
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        pattern: 'general',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )
      }
    }
  }

  const imageStyle = getCourseImageStyle()

  const handleCardClick = () => {
    setShowModal(true)
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

  return (
    <>
      {/* Main Course Card */}
      <div 
        className={`bg-slate-800/60 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl 
                    shadow-lg hover:shadow-xl hover:shadow-blue-500/20
                    transition-all duration-200
                    relative border border-gray-700 hover:border-blue-500/50
                    group cursor-pointer touch-manipulation w-full h-full
                    hover:scale-[1.02]`}
        onClick={handleCardClick}
      >
        {/* Hero section */}
        <div className={`h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44
                         bg-gradient-to-br ${imageStyle.gradient} 
                         flex items-center justify-center cursor-pointer 
                         relative overflow-hidden group
                         rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl`}>
          
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px sm:32px sm:32px'
            }}></div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                          opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          
          <div className="relative z-10 transform group-hover:scale-105
                          transition-all duration-300 drop-shadow-lg">
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
                            text-white/90 group-hover:text-white transition-colors duration-300">
              {imageStyle.icon}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                          bg-white/10 rounded-bl-full 
                          transform translate-x-8 -translate-y-8 sm:translate-x-10 sm:-translate-y-10 md:translate-x-12 md:-translate-y-12
                          group-hover:translate-x-7 group-hover:-translate-y-7 sm:group-hover:translate-x-9 sm:group-hover:-translate-y-9
                          transition-transform duration-300"></div>
          
          <div className="absolute inset-0 rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl
                          ring-2 ring-white/20 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-300"></div>
        </div>

        {/* Content section */}
        <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-full 
                               text-xs xs:text-sm font-medium text-white 
                               bg-gradient-to-r ${imageStyle.gradient}`}>
                {tag}
              </span>
              {/* Status indicator */}
              {status && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    status === 'completed' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                  {status === 'live' ? '🔴 LIVE' : 
                   status === 'completed' ? 'Completed' : 
                   'Scheduled'}
                </span>
              )}
            </div>
            <span className="text-xs xs:text-sm text-gray-500 font-medium">{time}</span>
          </div>

          {/* Countdown Timer - Only show for scheduled classes with startTime */}
          {startTime && status === 'scheduled' && (
            <div className="mb-2 sm:mb-3">
              <CompactCountdownTimer 
                startTime={startTime} 
                onCanStart={handleCanStartChange}
                className="justify-start"
              />
            </div>
          )}

          <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-white 
                         mb-2 xs:mb-3 sm:mb-4 line-clamp-2 leading-tight group-hover:text-blue-300 
                         transition-colors duration-300">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1 xs:gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 bg-blue-900/50 rounded-full 
                                flex items-center justify-center flex-shrink-0">
                  <span className="text-xs xs:text-sm font-bold text-blue-300">
                    {author?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs xs:text-sm font-medium text-gray-200 truncate">
                    {author}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {date}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Button based on user role and class status */}
            <div className="flex gap-1 flex-shrink-0">
              {/* Start Button - Only for class owner/instructor */}
              {isInstructor && isOwner && status === 'scheduled' && startTime && (
                <button 
                  onClick={handleStartClass}
                  disabled={!canStart || isStarting}
                  className={`text-xs sm:text-sm font-semibold px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 
                             rounded-full transition-all duration-300 hover:scale-105 active:scale-95
                             flex items-center gap-1 touch-manipulation
                             ${canStart && !isStarting
                               ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-lg hover:shadow-green-500/30 ring-2 ring-transparent hover:ring-green-300/50'
                               : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                             }`}
                  title={canStart ? 'Start Class' : 'Available 10 minutes before class time'}
                >
                  {isStarting ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      <span className="hidden xs:inline">Starting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8"/>
                      </svg>
                      <span className="hidden xs:inline">Start</span>
                    </>
                  )}
                </button>
              )}

              {/* Join Button - For students or live classes */}
              {(status === 'live' || (!isOwner && status === 'scheduled')) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onJoin && onJoin({ title, tag, author, date, time, status, classId }); }}
                  className={`text-xs sm:text-sm font-semibold px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 
                             rounded-full transition-all duration-300 hover:scale-105 active:scale-95
                             flex-shrink-0 touch-manipulation
                             ${status === 'live' 
                               ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white hover:shadow-lg hover:shadow-red-500/30 ring-2 ring-transparent hover:ring-red-300/50 animate-pulse'
                               : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:shadow-lg hover:shadow-blue-500/30 ring-2 ring-transparent hover:ring-blue-300/50'
                             }`}
                >
                  <span className="hidden xs:inline">
                    {status === 'live' ? 'Join Live' : 'Join'}
                  </span>
                  <span className="xs:hidden">
                    {status === 'live' ? '🔴' : '+'}
                  </span>
                </button>
              )}

              {/* Completed status - No action button */}
              {status === 'completed' && (
                <div className="text-xs text-gray-400 px-2.5 py-1 rounded-full bg-gray-600/20">
                  Ended
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className={`h-80 bg-gradient-to-br ${imageStyle.gradient} relative flex items-center justify-center`}>
              {/* Close button */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 
                           text-white rounded-full flex items-center justify-center
                           transition-all duration-200 hover:scale-110 text-xl font-bold"
              >
                ×
              </button>
              
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
                
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <span>Published: {date}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                {/* Level */}
                <div className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 rounded-xl p-6 border border-orange-800/30">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-200">Level</div>
                    <div className="text-xl font-bold text-orange-400">{level || 'Beginner'}</div>
                    <div className="text-sm text-gray-400">Difficulty</div>
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