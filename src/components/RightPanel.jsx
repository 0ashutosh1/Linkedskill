import React from 'react'
import { getCurrentUser } from '../utils/auth'
import ConnectedExperts from './ConnectedExperts'
import ConnectedStudents from './ConnectedStudents'

export default function RightPanel({ 
  onProfileClick, 
  onReferencesClick, 
  onNotificationsClick, 
  connectedExperts, 
  onExpertChatClick, 
  onExpertProfileClick, 
  connectionsLoading, 
  onStudentChatClick, 
  onStudentProfileClick,
  upcomingClasses = [],
  onClassUpdate
}){
  const user = getCurrentUser()
  const fullName = user?.name || 'User'
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
      <div className="bg-slate-800/50 lg:bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl lg:shadow-none flex-shrink-0">
        <h3 className="text-sm font-semibold mb-2 text-gray-200 lg:text-gray-100">Your Profile</h3>

        <div className="flex flex-col items-center">
          {/* Profile avatar with enhanced responsive design */}
          <div className="relative mb-2 cursor-pointer group" 
               onClick={onProfileClick} 
               role="button" 
               aria-label="Open profile"
               tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && onProfileClick()}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center 
                           group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/20">
              <img 
                src="/src/assets/placeholder.svg" 
                alt="avatar" 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-500 shadow-md" 
              />
            </div>
            {/* Animated progress ring */}
            <svg className="absolute -top-1 -left-1 w-18 h-18 sm:w-22 sm:h-22 group-hover:rotate-12 transition-transform duration-500" 
                 viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="54" stroke="#475569" strokeWidth="8" className="opacity-50" />
              <path d="M16 60a44 44 0 0 0 88 0" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" 
                    className="group-hover:stroke-cyan-400 transition-colors duration-300" />
            </svg>
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

          {/* Action buttons with enhanced responsive design */}
          <div className="flex items-center justify-center">
            <button 
              onClick={onNotificationsClick}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-600/50 bg-slate-700/30
                         flex items-center justify-center text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 
                         hover:border-blue-400/50 transition-all duration-300 hover:scale-110 active:scale-95 
                         shadow-sm hover:shadow-lg hover:shadow-blue-500/20"
              title="View notifications"
              aria-label="View notifications"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15 17h5l-3.5-3.5a8.38 8.38 0 01-1.5-5V8a6 6 0 10-12 0v.5c0 2-.5 4-1.5 5L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Experts/Students Section - Enhanced container */}
      <div className="bg-slate-800/50 lg:bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl lg:rounded-none shadow-xl lg:shadow-none flex-1 min-h-0">
        {isExpert ? (
          <ConnectedStudents 
            loading={connectionsLoading}
            onStudentChatClick={onStudentChatClick}
            onStudentProfileClick={onStudentProfileClick}
            upcomingClasses={upcomingClasses}
            onClassUpdate={onClassUpdate}
          />
        ) : (
          <ConnectedExperts 
            connectedExperts={connectedExperts}
            onChatClick={onExpertChatClick}
            onProfileClick={onExpertProfileClick}
            loading={connectionsLoading}
          />
        )}
      </div>
    </div>
  )
}
