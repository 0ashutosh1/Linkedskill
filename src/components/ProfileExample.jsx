// Example: Protected Profile Component
// This shows how to use the auth utilities in your components

import React, { useEffect, useState } from 'react'
import { getCurrentUser, logout, fetchUserProfile, requireAuth } from '../utils/auth'

export default function ProfileExample() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated, redirect if not
    if (!requireAuth()) {
      return
    }

    // Get user from localStorage (fast)
    const cachedUser = getCurrentUser()
    setUser(cachedUser)

    // Optionally fetch fresh user data from API
    const loadUserProfile = async () => {
      try {
        const freshUser = await fetchUserProfile()
        setUser(freshUser)
      } catch (error) {
        console.error('Failed to load user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!user) {
    return <div className="p-8 text-center">User not found</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
            <p className="text-lg">{user.name || 'Not provided'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <p className="text-lg">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">User ID</label>
            <p className="text-sm text-gray-500">{user.id}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
