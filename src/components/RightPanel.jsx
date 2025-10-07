import React from 'react'

export default function RightPanel({ onProfileClick, onReferencesClick }){
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white lg:bg-transparent rounded-2xl p-4 lg:p-0 shadow-sm lg:shadow-none">
        <h3 className="text-sm font-semibold mb-3">Your Profile</h3>

        <div className="flex flex-col items-center">
          <div className="relative mb-3 cursor-pointer" onClick={onProfileClick} role="button" aria-label="Open profile">
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
              <img src="/src/assets/placeholder.svg" alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white" />
            </div>
            <svg className="absolute -top-2 -left-2" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="54" stroke="#E9D5FF" strokeWidth="12" />
              <path d="M16 60a44 44 0 0 0 88 0" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="text-center">
            <div className="font-semibold text-sm md:text-base">Good Morning Alex</div>
            <div className="text-xs text-gray-400 mt-1">Continue Your Journey And Achieve Your Target</div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mt-4">
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">🔔</button>
            <button onClick={onReferencesClick} className="w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">✉️</button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">👤</button>
          </div>

          <div className="mt-4 md:mt-6 w-full">
            <div className="h-20 md:h-24 flex items-end gap-1.5 md:gap-2 px-2 justify-center">
              <div className="w-5 md:w-6 bg-purple-300 rounded-t-md h-6 md:h-8" />
              <div className="w-5 md:w-6 bg-purple-400 rounded-t-md h-10 md:h-12" />
              <div className="w-5 md:w-6 bg-purple-500 rounded-t-md h-14 md:h-16" />
              <div className="w-5 md:w-6 bg-purple-500 rounded-t-md h-16 md:h-20" />
              <div className="w-5 md:w-6 bg-purple-300 rounded-t-md h-12 md:h-14" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6">
        <h4 className="text-sm font-semibold mb-3">Your Mentor</h4>
        <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/src/assets/placeholder.svg" alt="mentor" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Kilam Rosvelt</div>
                <div className="text-xs text-gray-400 truncate">Software Developer</div>
              </div>
            </div>
            <button className="text-xs md:text-sm bg-purple-600 text-white px-2 md:px-3 py-1 rounded-full hover:bg-purple-700 transition-colors flex-shrink-0 ml-2">Follow</button>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/src/assets/placeholder.svg" alt="mentor" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Teodor Maskevich</div>
                <div className="text-xs text-gray-400 truncate">Product Owner</div>
              </div>
            </div>
            <button className="text-xs md:text-sm bg-purple-600 text-white px-2 md:px-3 py-1 rounded-full hover:bg-purple-700 transition-colors flex-shrink-0 ml-2">Follow</button>
          </div>
        </div>
      </div>
    </div>
  )
}
