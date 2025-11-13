import React from 'react'
import { getCurrentUser } from '../utils/auth'
import ConnectedExperts from './ConnectedExperts'
import ConnectedStudents from './ConnectedStudents'

export default function RightPanel({ 
  onProfileClick, 
  onReferencesClick,
  connectedExperts, 
  onExpertChatClick, 
  onExpertProfileClick,
  onExpertReviewsClick,
  connectionsLoading, 
  onStudentChatClick, 
  onStudentProfileClick,
  upcomingClasses = [],
  onClassUpdate,
  userPhotoUrl = '',
  userName = '',
  onPhotoUpdate,
  onConnectionRemoved,
  onViewClassReviews
}){
  const user = getCurrentUser()
  // Use userName prop if available, otherwise fall back to token name
  const fullName = userName || user?.name || 'User'
  const isExpert = user?.role?.name === 'expert'
  // Extract first name only and convert to uppercase
  const firstName = fullName.split(' ')[0].toUpperCase()
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-2 sm:space-y-3 h-full flex flex-col">
      {/* Enhanced responsive profile section */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg lg:shadow-md flex-shrink-0">
        <h3 className="text-sm font-semibold mb-2 text-gray-200 lg:text-gray-100">Your Profile</h3>

        <div className="flex flex-col items-center">
          {/* Profile avatar with enhanced responsive design */}
          <div className="relative mb-2 cursor-pointer group" 
               onClick={onProfileClick} 
               role="button" 
               aria-label="Open profile"
               tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && onProfileClick()}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-2 border-indigo-500/30 flex items-center justify-center 
                           group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/20 overflow-hidden">
              {userPhotoUrl ? (
                <img 
                  src={userPhotoUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-2 border-slate-500 shadow-md" 
                />
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Greeting and message */}
          <div className="text-center mb-2">
            <div className="text-sm text-gray-200">
              {getGreeting()} <span className="font-bold text-blue-400">{firstName}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Continue Your Journey And Achieve Your Target
            </div>
          </div>
        </div>
      </div>

      {/* Connected Experts/Students Section - Enhanced container */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-violet-500/20 rounded-xl sm:rounded-2xl lg:rounded-none shadow-2xl shadow-purple-500/10 lg:shadow-none flex-1 min-h-0">
        {isExpert ? (
          <ConnectedStudents 
            loading={connectionsLoading}
            onStudentChatClick={onStudentChatClick}
            onStudentProfileClick={onStudentProfileClick}
            upcomingClasses={upcomingClasses}
            onClassUpdate={onClassUpdate}
            onConnectionRemoved={onConnectionRemoved}
            onViewClassReviews={onViewClassReviews}
          />
        ) : (
          <ConnectedExperts 
            connectedExperts={connectedExperts}
            onChatClick={onExpertChatClick}
            onProfileClick={onExpertProfileClick}
            onReviewsClick={onExpertReviewsClick}
            loading={connectionsLoading}
            onConnectionRemoved={onConnectionRemoved}
          />
        )}
      </div>
    </div>
  )
}
