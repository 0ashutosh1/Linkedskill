import React from 'react'
import logo from '../assets/LinkedSkill.jpg'
import { getCurrentUser } from '../utils/auth'

export default function Sidebar({ onLogoClick, onFriendClick, onNavClick, onLogout }){
  const user = getCurrentUser()
  const isExpert = user?.role?.name === 'expert'
  const isStudent = user?.role?.name === 'student'

  return (
    <div className="py-3 sm:py-4 lg:py-6 h-full flex flex-col">
      {/* Logo section - Enhanced responsive design */}
      <div className="hidden lg:flex items-center gap-3 mb-6 lg:mb-8 px-4 lg:px-6">
        <img 
          src={logo} 
          alt="LinkedSkill Logo" 
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full cursor-pointer object-cover 
                     hover:scale-105 transition-transform duration-200 shadow-md" 
          onClick={() => onLogoClick && onLogoClick()} 
        />
        <div>
          <div className="text-base lg:text-lg font-semibold text-blue-600">LinkedSkill</div>
          <div className="text-xs lg:text-sm text-gray-400">Learn & Grow</div>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="flex lg:hidden items-center gap-3 mb-6 px-4">
        <img 
          src={logo} 
          alt="LinkedSkill Logo" 
          className="w-10 h-10 rounded-full cursor-pointer object-cover 
                     hover:scale-105 transition-transform duration-200 shadow-md" 
          onClick={() => onLogoClick && onLogoClick()} 
        />
        <div>
          <div className="text-lg font-semibold text-blue-600">LinkedSkill</div>
          <div className="text-sm text-gray-300">Learn & Grow</div>
        </div>
      </div>

      {/* Navigation - Enhanced mobile-friendly design */}
      <nav className="space-y-1 sm:space-y-2 px-2 sm:px-3 lg:px-4 mb-6 lg:mb-8">
        <NavItem 
          label="Dashboard" 
          onClick={() => onNavClick && onNavClick('home')} 
          svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M3 13h4V3H3v10zM3 17h4v-2H3v2zM9 17h8V9H9v8zM9 7h8V3H9v4z" /></svg>} 
        />
        <NavItem 
          label="Experts" 
          onClick={() => onNavClick && onNavClick('experts')} 
          svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M6 8a3 3 0 100-6 3 3 0 000 6zM6 10a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" /></svg>} 
        />
        {/* Show Add Class only for experts */}
        {isExpert && (
          <NavItem 
            label="Add Class" 
            onClick={() => onNavClick && onNavClick('addclass')} 
            svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>} 
          />
        )}
        {/* Show Counsellings only for students */}
        {isStudent && (
          <NavItem 
            label="Counsellings" 
            onClick={() => onNavClick && onNavClick('counsellings')} 
            svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} 
          />
        )}
      </nav>

      {/* Friends section removed - was using dummy data */}

      {/* Logout button - At the very bottom */}
      <div className="px-3 lg:px-4">
        <div className="flex items-center gap-3 text-red-400 cursor-pointer hover:text-red-300 p-2 lg:p-3 rounded-lg hover:bg-red-900/30 transition-all duration-200 hover:scale-102 active:scale-98 border border-red-800/50 hover:border-red-600/50" 
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
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-3 rounded-lg hover:bg-slate-700/50 hover:shadow-lg cursor-pointer 
                 transition-all duration-200 hover:scale-102 active:scale-98 group
                 border border-transparent hover:border-blue-500/30"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
        {svg}
      </div>
      <div className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-300 font-medium group-hover:text-white transition-colors">
        {label}
      </div>
    </div>
  )
}
