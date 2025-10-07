import React from 'react'

export default function Sidebar({ onLogoClick, onFriendClick, onNavClick, onLogout }){
  return (
    <div className="py-2 lg:py-6">
      <div className="hidden lg:flex items-center gap-3 mb-6 px-4">
        <img src="/src/assets/logo.svg" alt="logo" className="w-12 h-12 cursor-pointer" onClick={() => onLogoClick && onLogoClick()} />
        <div>
          <div className="text-lg font-semibold text-purple-600">LinkedSkill</div>
          <div className="text-sm text-gray-400">Learn & Grow</div>
        </div>
      </div>

      <nav className="space-y-1">
        <NavItem label="Dashboard" onClick={() => onNavClick && onNavClick('home')} svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M3 13h4V3H3v10zM3 17h4v-2H3v2zM9 17h8V9H9v8zM9 7h8V3H9v4z" /></svg>} />
        <NavItem label="Experts" onClick={() => onNavClick && onNavClick('experts')} svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M6 8a3 3 0 100-6 3 3 0 000 6zM6 10a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" /></svg>} />
        <NavItem label="Add Class" onClick={() => onNavClick && onNavClick('addclass')} svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>} />
        <NavItem label="Counsellings" onClick={() => onNavClick && onNavClick('counsellings')} svg={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} />
      </nav>

      <div className="mt-6 px-4">
        <h4 className="text-xs text-gray-400 uppercase mb-3">Friends</h4>
          <ul className="space-y-3">
          <li className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => onFriendClick && onFriendClick({ id: 'andrew', name: 'Andrew Meter', role: 'Software Developer' })}>
            <img src="/src/assets/placeholder.svg" alt="friend" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="text-sm text-gray-800">Andrew Meter</div>
              <div className="text-xs text-gray-400">Software Developer</div>
            </div>
          </li>
          <li className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => onFriendClick && onFriendClick({ id: 'jeff', name: 'Jeff Linkoln', role: 'Product Owner' })}>
            <img src="/src/assets/placeholder.svg" alt="friend" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="text-sm text-gray-800">Jeff Linkoln</div>
              <div className="text-xs text-gray-400">Product Owner</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="mt-6 border-t pt-4 text-sm px-4">
        <div className="flex items-center gap-3 text-gray-600 hover:text-gray-800 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046a1 1 0 00-2.6 0l-.245.734a1 1 0 01-.949.69l-.778.017a1 1 0 00-.65.22L3.4 4.5a1 1 0 000 1.414l.548.548a1 1 0 00.22.65l-.017.778a1 1 0 01-.69.949l-.734.245a1 1 0 000 2.6l.734.245a1 1 0 01.69.949l.017.778a1 1 0 00.22.65l.548.548a1 1 0 001.414 0l.548-.548a1 1 0 00.65-.22l.778.017a1 1 0 01.949.69l.245.734a1 1 0 002.6 0l.245-.734a1 1 0 01.949-.69l.778-.017a1 1 0 00.65-.22l.548-.548a1 1 0 000-1.414l-.548-.548a1 1 0 00-.22-.65l.017-.778a1 1 0 01.69-.949l.734-.245a1 1 0 000-2.6l-.734-.245a1 1 0 01-.69-.949l-.017-.778a1 1 0 00-.22-.65L16.6 2.54a1 1 0 00-1.414 0l-.548.548a1 1 0 00-.65.22l-.778-.017a1 1 0 01-.949-.69L11.3 1.046z"/></svg>
          <span>Settings</span>
        </div>

        <div className="flex items-center gap-3 mt-3 text-red-500 cursor-pointer hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" onClick={() => onLogout && onLogout()}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}

function NavItem({label, svg, onClick}){
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="w-6 h-6 flex items-center justify-center">{svg}</div>
      <div className="text-sm md:text-base text-gray-700">{label}</div>
    </div>
  )
}
