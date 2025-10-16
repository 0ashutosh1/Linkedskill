import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

export default function ConnectedStudents({ loading: externalLoading, onStudentChatClick, onStudentProfileClick }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConnectedStudents()
  }, [])

  const fetchConnectedStudents = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please login to view connected students')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/connections/my-followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data.followers || [])
      } else {
        setError('Failed to fetch connected students')
      }
    } catch (err) {
      console.error('Error fetching connected students:', err)
      setError('Error loading connected students')
    } finally {
      setLoading(false)
    }
  }

  if (loading || externalLoading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-gray-800">Connected Students</h4>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 sm:p-3 animate-pulse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-gray-800">Connected Students</h4>
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-gray-800">Connected Students</h4>
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-300 mb-3 sm:mb-4">
            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm sm:text-base font-medium mb-2">No connected students yet</p>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
            Students will appear here once they connect with you and you accept their requests
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-800">Connected Students</h4>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {students.length}
        </span>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {students.slice(0, 5).map((student) => (
          <div
            key={student.id}
            className="group flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 
                       transition-all duration-200 cursor-pointer hover:shadow-sm border border-transparent 
                       hover:border-gray-100"
          >
            {/* Student Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={student.photoUrl || "/src/assets/placeholder.svg"}
                alt={student.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-100 
                           group-hover:border-purple-200 transition-colors duration-200"
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 
                             rounded-full border-2 border-white shadow-sm"></div>
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-600 
                             transition-colors duration-200 leading-tight">
                {student.name}
              </h5>
              <p className="text-xs text-gray-500 truncate leading-tight">
                {student.designation || 'Student'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 
                           transition-opacity duration-200">
              {onStudentChatClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStudentChatClick(student)
                  }}
                  className="w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 
                             text-blue-600 flex items-center justify-center transition-colors duration-200 
                             hover:scale-105 active:scale-95"
                  title="Chat with student"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </button>
              )}
              
              {onStudentProfileClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStudentProfileClick(student)
                  }}
                  className="w-7 h-7 rounded-full bg-purple-100 hover:bg-purple-200 
                             text-purple-600 flex items-center justify-center transition-colors duration-200 
                             hover:scale-105 active:scale-95"
                  title="View student profile"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more button if there are many students */}
      {students.length > 5 && (
        <div className="mt-3 sm:mt-4 text-center">
          <button className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium 
                           hover:underline transition-colors duration-200 bg-purple-50 hover:bg-purple-100 
                           px-3 py-1.5 rounded-full transition-all duration-200">
            View all students ({students.length})
          </button>
        </div>
      )}
    </div>
  )
}