import React, { useState } from 'react'

const API_URL = 'http://localhost:4000'

export default function ConnectedExperts({ connectedExperts, onChatClick, onProfileClick, onReviewsClick, loading = false, onConnectionRemoved }) {
  const [showAll, setShowAll] = useState(false)
  const [removingConnection, setRemovingConnection] = useState(null)
  
  // Show only first 3 experts by default
  const displayedExperts = showAll ? connectedExperts : connectedExperts.slice(0, 3)

  const handleRemoveConnection = async (expertId, expertName) => {
    if (!confirm(`Are you sure you want to remove ${expertName} from your connections?`)) {
      return
    }

    try {
      setRemovingConnection(expertId)
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('Please login to remove connections')
        return
      }

      const response = await fetch(`${API_URL}/connections/unfollow/${expertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Notify parent component to refresh the connections list immediately
        if (onConnectionRemoved) {
          await onConnectionRemoved()
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to remove connection')
      }
    } catch (err) {
      console.error('Error removing connection:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setRemovingConnection(null)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
        <h4 className="text-sm font-semibold mb-2 text-white flex-shrink-0">Connected Experts</h4>
        <div className="space-y-1.5 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-600 rounded mb-1"></div>
                <div className="h-2 bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!connectedExperts || connectedExperts.length === 0) {
    return (
      <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
        <h4 className="text-sm font-semibold mb-2 text-white flex-shrink-0">Connected Experts</h4>
        <div className="text-center py-4 flex-1 flex flex-col justify-center">
          <div className="text-gray-300 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p className="text-white text-sm font-medium mb-1">No connected experts yet</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            Connect with experts to start learning
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 py-3 h-full flex flex-col min-h-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center bg-slate-700/30 rounded-lg p-0.5">
          <button className="text-xs px-2 py-1 rounded-md bg-blue-500 text-white">
            Experts
          </button>
        </div>
        
        {/* Counter Badge */}
        <span className="text-xs text-white bg-slate-700/50 border border-slate-600/50 px-2 py-0.5 rounded-full">
          {connectedExperts.length}
        </span>
      </div>

      <div className="space-y-1.5 flex-1 overflow-visible">
        {displayedExperts.map((expert) => (
          <div
            key={expert.id}
            className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30 
                       transition-all duration-200 cursor-pointer hover:shadow-sm border border-transparent 
                       hover:border-slate-600/50"
          >
            {/* Expert Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={expert.photoUrl || "/src/assets/placeholder.svg"}
                alt={expert.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-600 
                           group-hover:border-purple-400 transition-colors duration-200"
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 
                             rounded-full border-2 border-slate-800 shadow-sm"></div>
            </div>

            {/* Expert Info */}
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-white group-hover:text-purple-300 
                             transition-colors duration-200 leading-tight">
                {expert.name.split(' ')[0]}
              </h5>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 
                           transition-opacity duration-200 flex-shrink-0 ml-1">
              {onChatClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onChatClick(expert)
                  }}
                  className="w-5 h-5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 
                             text-blue-400 flex items-center justify-center transition-colors duration-200 
                             hover:scale-105 active:scale-95 border border-blue-500/30"
                  title="Chat with expert"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </button>
              )}
              
              {onProfileClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onProfileClick(expert)
                  }}
                  className="w-5 h-5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 
                             text-purple-400 flex items-center justify-center transition-colors duration-200 
                             hover:scale-105 active:scale-95 border border-purple-500/30"
                  title="View expert profile"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </button>
              )}

              {/* Remove Connection Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveConnection(expert.id, expert.name)
                }}
                disabled={removingConnection === expert.id}
                className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/30 
                           text-red-400 flex items-center justify-center transition-colors duration-200 
                           hover:scale-105 active:scale-95 border border-red-500/30 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove connection"
              >
                {removingConnection === expert.id ? (
                  <svg className="w-2.5 h-2.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {connectedExperts.length > 3 && (
        <div className="mt-3 text-center flex-shrink-0">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium 
                     hover:underline transition-colors duration-200 bg-slate-700/30 hover:bg-slate-700/50 
                     px-3 py-1 rounded-full border border-slate-600/50 hover:border-purple-400/50">
            {showAll ? `Show Less (${connectedExperts.length - 3} less)` : `+${connectedExperts.length - 3} more experts`}
          </button>
        </div>
      )}
    </div>
  )
}