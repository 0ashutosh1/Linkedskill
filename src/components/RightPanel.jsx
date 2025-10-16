import React from 'react'
import { getCurrentUser } from '../utils/auth'
import ConnectedExperts from './ConnectedExperts'
import ConnectedStudents from './ConnectedStudents'

export default function RightPanel({ onProfileClick, onReferencesClick, onNotificationsClick, connectedExperts, onExpertChatClick, onExpertProfileClick, connectionsLoading, onStudentChatClick, onStudentProfileClick }){
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Enhanced responsive profile section */}
      <div className="bg-white lg:bg-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-0 shadow-sm lg:shadow-none">
        <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 lg:mb-6 text-gray-800 lg:text-gray-900">Your Profile</h3>

        <div className="flex flex-col items-center">
          {/* Profile avatar with enhanced responsive design */}
          <div className="relative mb-4 sm:mb-6 cursor-pointer group" 
               onClick={onProfileClick} 
               role="button" 
               aria-label="Open profile"
               tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && onProfileClick()}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gray-100 flex items-center justify-center 
                           group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <img 
                src="/src/assets/placeholder.svg" 
                alt="avatar" 
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover border-3 sm:border-4 border-white shadow-md" 
              />
            </div>
            {/* Animated progress ring */}
            <svg className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-26 h-26 sm:w-32 sm:h-32 lg:w-36 lg:h-36 group-hover:rotate-12 transition-transform duration-500" 
                 viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="54" stroke="#E9D5FF" strokeWidth="8" className="opacity-50" />
              <path d="M16 60a44 44 0 0 0 88 0" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" 
                    className="group-hover:stroke-purple-600 transition-colors duration-300" />
            </svg>
          </div>

          {/* Greeting and message */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-sm sm:text-base lg:text-lg text-gray-800">
              {getGreeting()} <span className="font-bold text-purple-600">{firstName}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 max-w-xs">
              Continue Your Journey And Achieve Your Target
            </div>
          </div>

          {/* Action buttons with enhanced responsive design */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <button 
              onClick={onNotificationsClick}
              className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-2 border-gray-200 
                         flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 
                         hover:border-purple-200 transition-all duration-300 hover:scale-110 active:scale-95 
                         shadow-sm hover:shadow-md"
              title="View notifications"
              aria-label="View notifications"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15 17h5l-3.5-3.5a8.38 8.38 0 01-1.5-5V8a6 6 0 10-12 0v.5c0 2-.5 4-1.5 5L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
            
            <button 
              onClick={onReferencesClick} 
              className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-2 border-gray-200 
                         flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 
                         hover:border-blue-200 transition-all duration-300 hover:scale-110 active:scale-95 
                         shadow-sm hover:shadow-md"
              title="View references"
              aria-label="View references"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </button>
            
            <button 
              className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-2 border-gray-200 
                         flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 
                         hover:border-green-200 transition-all duration-300 hover:scale-110 active:scale-95 
                         shadow-sm hover:shadow-md"
              title="User settings"
              aria-label="User settings"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Experts/Students Section - Enhanced container */}
      <div className="bg-white lg:bg-transparent rounded-xl sm:rounded-2xl lg:rounded-none shadow-sm lg:shadow-none">
        {isExpert ? (
          <ConnectedStudents 
            loading={connectionsLoading}
            onStudentChatClick={onStudentChatClick}
            onStudentProfileClick={onStudentProfileClick}
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
