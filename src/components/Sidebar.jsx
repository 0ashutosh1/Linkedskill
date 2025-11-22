import React from 'react'
import logo from '../assets/LinkedSkill.jpg'
import { getCurrentUser } from '../utils/auth'

export default function Sidebar({ onLogoClick, onFriendClick, onNavClick, onLogout, userRole }){
  const user = getCurrentUser()
  // Use userRole prop as priority, then fall back to getCurrentUser
  const effectiveUserRole = userRole || user?.role?.name
  const isExpert = effectiveUserRole === 'expert'
  const isStudent = effectiveUserRole === 'student'

  return (
    <div className="py-3 sm:py-4 lg:py-6 h-full flex flex-col">
      {/* Logo section - Enhanced with gradient */}
      <div className="hidden lg:flex items-center gap-3 mb-6 lg:mb-8 px-4 lg:px-6">
        <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md cursor-pointer"
          onClick={() => onLogoClick && onLogoClick()}>
          <span className="text-white font-bold text-lg lg:text-xl">LS</span>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-30 -z-10"></div>
        </div>
        <div>
          <div className="text-base lg:text-lg font-semibold text-gray-100">LinkedSkill</div>
          <div className="text-xs lg:text-sm text-gray-400">Learn & Grow</div>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="flex lg:hidden items-center gap-3 mb-6 px-4">
        <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md cursor-pointer"
          onClick={() => onLogoClick && onLogoClick()}>
          <span className="text-white font-bold text-lg">LS</span>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-30 -z-10"></div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-100">LinkedSkill</div>
          <div className="text-sm text-gray-300">Learn & Grow</div>
        </div>
      </div>

      {/* Navigation - Enhanced mobile-friendly design */}
      <nav className="space-y-1 sm:space-y-2 px-2 sm:px-3 lg:px-4 mb-6 lg:mb-8">
        <NavItem 
          label="Dashboard" 
          onClick={() => onNavClick && onNavClick('home')} 
          svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>} 
        />
        {/* Show Experts only for non-expert users (students) */}
        {!isExpert && (
          <NavItem 
            label="Experts" 
            onClick={() => onNavClick && onNavClick('experts')} 
            svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M6 8a3 3 0 100-6 3 3 0 000 6zM6 10a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" /></svg>} 
          />
        )}
        {/* Show Add Class only for experts */}
        {isExpert && (
          <NavItem 
            label="Add Class" 
            onClick={() => onNavClick && onNavClick('addclass')} 
            svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>} 
          />
        )}
        {/* Show Mentoring only for students */}
        {isStudent && (
          <NavItem 
            label="Mentoring" 
            onClick={() => onNavClick && onNavClick('mentoring')} 
            svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>} 
          />
        )}
        {/* Show Counsellings only for students */}
        {isStudent && (
          <NavItem 
            label="Counsellings" 
            onClick={() => onNavClick && onNavClick('counsellings')} 
            svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} 
          />
        )}
      </nav>

      {/* Friends section removed - was using dummy data */}

      {/* Logout button - At the very bottom */}
      <div className="px-3 lg:px-4">
        <div className="flex items-center gap-3 text-red-400 cursor-pointer hover:text-red-300 p-2 lg:p-3 rounded-lg hover:bg-red-900/20 transition-all duration-200 hover:scale-102 active:scale-98 border border-red-800/30 hover:border-red-700/50" 
             onClick={() => onLogout && onLogout()}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm lg:text-base font-medium">Logout</span>
        </div>
      </div>
    </div>
  )
}

function NavItem({label, svg, onClick}){
  return (
    <div 
      onClick={onClick} 
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-3 rounded-xl hover:bg-slate-700/50 hover:shadow-md cursor-pointer 
                 transition-all duration-200 hover:scale-102 active:scale-98 group
                 border border-transparent hover:border-slate-600/50 backdrop-blur-sm"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
        {svg}
      </div>
      <div className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-300 font-medium group-hover:text-gray-100 transition-colors">
        {label}
      </div>
    </div>
  )
}
