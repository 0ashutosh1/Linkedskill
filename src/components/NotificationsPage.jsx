import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

export default function NotificationsPage({ onBack }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'info', 'warning', etc.

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken')
      console.log('Auth token:', token ? 'Found' : 'Not found')
      
      if (!token) {
        setError('Please login to view notifications')
        setLoading(false)
        return
      }

      console.log('Fetching notifications from:', `${API_URL}/notifications`)
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Notifications data:', data)
        setNotifications(data.notifications || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        setError(`Failed to fetch notifications: ${errorData.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Error loading notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(notifications.map(notif =>
          notif._id === notificationId ? { ...notif, is_read: true } : notif
        ))
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/notifications/read/all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, is_read: true })))
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(notifications.filter(notif => notif._id !== notificationId))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const handleConnectionRequest = async (notificationId, connectionId, action) => {
    try {
      const token = localStorage.getItem('authToken')
      
      // First, handle the connection request
      const endpoint = action === 'accept' ? 'accept' : 'reject'
      const response = await fetch(`${API_URL}/connections/${endpoint}/${connectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: action === 'reject' ? JSON.stringify({ reason: 'No specific reason provided' }) : undefined
      })

      if (response.ok) {
        // Mark the notification as read
        await markAsRead(notificationId)
        
        // Update the notification to show it's been handled
        setNotifications(notifications.map(notif =>
          notif._id === notificationId 
            ? { ...notif, is_read: true, actionType: 'handled' } 
            : notif
        ))

        // Show success message
        alert(`Connection request ${action}ed successfully!`)
      } else {
        const errorData = await response.json()
        alert(`Error ${action}ing connection: ${errorData.error}`)
      }
    } catch (err) {
      console.error(`Error ${action}ing connection request:`, err)
      alert(`Error ${action}ing connection request`)
    }
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(notif => !notif.is_read)
    } else if (filter === 'read') {
      filtered = filtered.filter(notif => notif.is_read)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === typeFilter)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return '📋'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'reminder':
        return '⏰'
      case 'update':
        return '🔔'
      case 'announcement':
        return '📢'
      case 'message':
        return '💬'
      case 'connection_request':
        return '🤝'
      case 'connection_accepted':
        return '✅'
      case 'connection_rejected':
        return '❌'
      default:
        return '📝'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reminder':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'update':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'announcement':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'message':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'connection_request':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'connection_accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'connection_rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'normal':
        return 'bg-blue-500'
      case 'low':
        return 'bg-gray-400'
      default:
        return 'bg-blue-500'
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(notif => !notif.is_read).length

  if (loading) {
    return (
      <div className="animate-fadeIn flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fadeIn flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
        <div className="flex flex-wrap gap-4">
          {/* Read Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {['all', 'unread', 'read'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 text-sm font-medium transition ${
                    filter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
              <option value="reminder">Reminder</option>
              <option value="update">Update</option>
              <option value="announcement">Announcement</option>
              <option value="message">Message</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-5-5V9.5a6 6 0 10-12 0V12l-5 5h5a3 3 0 006 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications found</h3>
          <p className="text-gray-500">
            {filter === 'unread' ? 'All notifications have been read' : 'No notifications match your current filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 ${
                !notification.is_read ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Notification Icon & Type */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                        <span className="text-xs text-gray-500 capitalize">{notification.priority}</span>
                        {!notification.is_read && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed mb-2">{notification.message}</p>
                      
                      {/* Connection Request Action Buttons */}
                      {notification.type === 'connection_request' && notification.actionType !== 'handled' && !notification.is_read && (
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => handleConnectionRequest(notification._id, notification.connectionId, 'accept')}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleConnectionRequest(notification._id, notification.connectionId, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {notification.senderId?.name && (
                          <span>From: {notification.senderId.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}