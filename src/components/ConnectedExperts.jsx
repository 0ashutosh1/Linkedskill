import React, { useState } from 'react'

export default function ConnectedExperts({ connectedExperts, onChatClick, onProfileClick, loading = false }) {
  const [showAll, setShowAll] = useState(false)
  
  // Show only first 3 experts by default
  const displayedExperts = showAll ? connectedExperts : connectedExperts.slice(0, 3)
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-800/50 lg:bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-0 shadow-xl lg:shadow-none">
        <h3 className="text-sm font-semibold mb-3 text-white">Connected Experts</h3>
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-xs text-gray-300">Loading connections...</p>
        </div>
      </div>
    )
  }

  if (!connectedExperts || connectedExperts.length === 0) {
    return (
      <div className="bg-slate-800/50 lg:bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-0 shadow-xl lg:shadow-none">
        <h3 className="text-sm font-semibold mb-3 text-white">Connected Experts</h3>
        <div className="text-center py-6">
          <div className="text-gray-300 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-300">No connected experts yet</p>
          <p className="text-xs text-gray-400 mt-1">Connect with experts to start learning</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 lg:bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-0 shadow-xl lg:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Connected Experts</h3>
        <span className="text-xs text-white bg-slate-700/50 border border-slate-600/50 px-2 py-1 rounded-full">
          {connectedExperts.length}
        </span>
      </div>

      <div className="space-y-3">
        {displayedExperts.map((expert) => (
          <div
            key={expert.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/30 transition-colors group"
          >
            {/* Expert Avatar */}
            <div 
              className="relative cursor-pointer"
              onClick={() => onProfileClick && onProfileClick(expert)}
            >
              <div className="w-10 h-10 rounded-full bg-slate-600/50 border border-slate-500/50 flex items-center justify-center overflow-hidden">
                <img 
                  src={expert.photoUrl || "/src/assets/placeholder.svg"} 
                  alt={expert.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              {/* Online status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
                expert.isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`} />
            </div>

            {/* Expert Info */}
            <div 
              className="flex-1 overflow-hidden cursor-pointer"
              onClick={() => onProfileClick && onProfileClick(expert)}
            >
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-medium text-white break-words">
                  {expert.name}
                </h4>
                {expert.isVerified && (
                  <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-300 break-words">{expert.expertise}</p>
              {expert.lastMessage && (
                <p className="text-xs text-gray-400 break-words mt-0.5">
                  {expert.lastMessage}
                </p>
              )}
            </div>

            {/* Chat Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChatClick && onChatClick(expert)
              }}
              className="w-8 h-8 rounded-full bg-blue-900/30 hover:bg-blue-800/50 border border-blue-700/50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              title="Start chat"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        ))}

        {/* Show More/Less Button */}
        {connectedExperts.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs text-blue-400 hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-900/30 transition-colors"
          >
            {showAll ? (
              <>Show Less ({connectedExperts.length - 3} less)</>
            ) : (
              <>Show All ({connectedExperts.length - 3} more)</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}