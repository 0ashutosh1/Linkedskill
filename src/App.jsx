import React, { useState, useEffect, useCallback, useRef } from 'react'
import ProfilePage from './components/ProfilePage'
import ReferencePage from './components/ReferencePage'
import ExpertsPage from './components/ExpertsPage'
import ExpertReviewsPage from './components/ExpertReviewsPage'
import NotificationsPage from './components/NotificationsPage'
import FloatingNotification from './components/FloatingNotification'
import AddClassModal from './components/AddClassModal'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import OnboardingPage from './components/OnboardingPage'
import AllClassesPage from './components/AllClassesPage'
import LiveClassPage from './components/LiveClassPage'
import LandingPage from './components/LandingPage'

import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import CourseCard from './components/CourseCard'
import CategorySection from './components/CategorySection'
import ClassSection from './components/ClassSection'
import CarouselSection from './components/CarouselSection'
import ChatModal from './components/ChatModal'  // RESTORED WITH NO-OP SOCKET
import { isAuthenticated as checkAuth, logout as doLogout } from './utils/auth'
import { getMyConnections } from './utils/connections'
import { classAPI } from './utils/classAPI'
import logo from './assets/LinkedSkill.jpg'

export default function App() {
  const [appLoading, setAppLoading] = useState(true)
  const [route, setRoute] = useState('landing')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authPage, setAuthPage] = useState('login') // 'login' or 'signup'
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryClasses, setCategoryClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  // Connected Experts and Chat states
  const [connectedExperts, setConnectedExperts] = useState([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)

  const [selectedChatExpert, setSelectedChatExpert] = useState(null)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState({}) // Messages grouped by expert ID

  // Upcoming Classes state (for right panel)
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(false)
  
  // User profile photo and name state
  const [userPhotoUrl, setUserPhotoUrl] = useState('')
  const [userName, setUserName] = useState('')
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)
  const [userRole, setUserRole] = useState(null) // Track user role for sidebar updates
  const [sidebarKey, setSidebarKey] = useState(0) // Force sidebar re-render
  
  // Expert reviews state
  const [selectedExpertForReviews, setSelectedExpertForReviews] = useState(null)

  // Notification states
  const [unreadCount, setUnreadCount] = useState(0)
  const [floatingNotifications, setFloatingNotifications] = useState([])
  const [notificationCheckInterval, setNotificationCheckInterval] = useState(null)
  const shownNotificationsRef = useRef(new Set()) // Track which notifications have been shown

  // Dynamic category-based classes state
  const [categoriesWithClasses, setCategoriesWithClasses] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  
  // All Classes page state
  const [allClassesData, setAllClassesData] = useState(null)
  const [allClassesCategory, setAllClassesCategory] = useState(null)

  // Fetch connected experts
  const fetchConnectedExperts = useCallback(async () => {
    setConnectionsLoading(true)
    try {
      const connections = await getMyConnections()
      setConnectedExperts(connections)
    } catch (error) {
      console.error('Error fetching connected experts:', error)
      setConnectedExperts([])
    } finally {
      setConnectionsLoading(false)
    }
  }, [])

  // Fetch upcoming classes for right panel with personalization
  const fetchUpcomingClasses = useCallback(async () => {
    setClassesLoading(true)
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentUserId = currentUser.sub || currentUser._id || currentUser.id
      const now = new Date()
      
      // First try to get personalized classes
      try {
        const personalizedData = await classAPI.getPersonalizedClasses()
        
        if (personalizedData.personalized && personalizedData.classes.length > 0) {
          // Filter for truly upcoming classes (future dates only)
          // Exclude classes created by the current expert
          const upcoming = personalizedData.classes.filter(cls => {
            const classDate = new Date(cls.startTime || cls.date)
            const isUpcoming = (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
            
            // Check if current user is the class creator
            const isCreator = cls.userId?._id?.toString() === currentUserId?.toString() || 
                             cls.userId?.toString() === currentUserId?.toString()
            
            // Show only if it's upcoming AND user is not the creator
            return isUpcoming && !isCreator
          }).sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date))
          
          setUpcomingClasses(upcoming)
          setClassesLoading(false)
          return
        }
      } catch (personalizedError) {
        console.warn('Could not fetch personalized upcoming classes, falling back to all classes')
      }
      
      // Fallback: Fetch all classes
      const response = await fetch('http://localhost:4000/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Filter for truly upcoming classes (future dates only)
        // Exclude classes created by the current expert
        const upcoming = data.classes?.filter(cls => {
          const classDate = new Date(cls.startTime || cls.date)
          const isUpcoming = (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
          
          // Check if current user is the class creator
          const isCreator = cls.userId?._id?.toString() === currentUserId?.toString() || 
                           cls.userId?.toString() === currentUserId?.toString()
          
          // Show only if it's upcoming AND user is not the creator
          return isUpcoming && !isCreator
        }).sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date)) || []
        
        setUpcomingClasses(upcoming)
      }
    } catch (error) {
      console.error('Error fetching upcoming classes:', error)
      setUpcomingClasses([])
    } finally {
      setClassesLoading(false)
    }
  }, [])
  
  // Fetch user profile photo and name
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('http://localhost:4000/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUserPhotoUrl(data.profile?.photoUrl || '')
        // Update the user name from profile if available (profile.userId is populated with user data)
        if (data.profile?.userId?.name) {
          setUserName(data.profile.userId.name)
        } else if (data.profile?.name) {
          setUserName(data.profile.name)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [])

  // Fetch classes by category - Dynamic approach with personalization
  const fetchClassesByCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentUserId = currentUser.sub || currentUser._id || currentUser.id
      const now = new Date()
      
      // First try to get personalized classes based on user interests
      try {
        const personalizedData = await classAPI.getPersonalizedClasses()
        
        if (personalizedData.personalized && personalizedData.classes.length > 0) {
          // User has interests and we found matching classes
          console.log(`📌 Showing ${personalizedData.classes.length} personalized classes based on interests:`, personalizedData.interests)
          
          // Group personalized classes by category
          const classesGroupedByCategory = personalizedData.classes.reduce((acc, cls) => {
            const categoryName = cls.categoryId?.name || 'General'
            if (!acc[categoryName]) {
              acc[categoryName] = []
            }
            acc[categoryName].push(cls)
            return acc
          }, {})
          
          // Filter out past classes and classes created by current expert
          const categoriesWithClassesData = Object.entries(classesGroupedByCategory).map(([categoryName, classes]) => {
            const filteredClasses = classes.filter(cls => {
              const classDate = new Date(cls.startTime || cls.date)
              const isUpcoming = (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
              
              // Check if current user is the class creator
              const isCreator = cls.userId?._id?.toString() === currentUserId?.toString() || 
                               cls.userId?.toString() === currentUserId?.toString()
              
              // Show only if it's upcoming AND user is not the creator
              return isUpcoming && !isCreator
            }).map(cls => classAPI.transformClassData(cls, categoryName))
            
            return {
              name: categoryName,
              classes: filteredClasses
            }
          }).filter(category => category.classes.length > 0)
          
          setCategoriesWithClasses(categoriesWithClassesData)
          setCategoriesLoading(false)
          return
        }
      } catch (personalizedError) {
        console.warn('Could not fetch personalized classes, falling back to all categories:', personalizedError)
      }
      
      // Fallback: Fetch all categories and their classes
      // First get all categories
      const categoriesResponse = await fetch('http://localhost:4000/categories')
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories')
      }
      const categoriesData = await categoriesResponse.json()
      
      // Then fetch classes for each category in parallel
      const categoryPromises = categoriesData.categories.map(async (category) => {
        const classesData = await classAPI.getClassesByCategory(category.name)
        
        // Filter out past classes and classes created by current expert - only show upcoming/live classes
        const upcomingClasses = classesData.classes?.filter(cls => {
          const classDate = new Date(cls.startTime || cls.date)
          const isUpcoming = (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
          
          // Check if current user is the class creator
          const isCreator = cls.userId?._id?.toString() === currentUserId?.toString() || 
                           cls.userId?.toString() === currentUserId?.toString()
          
          // Show only if it's upcoming AND user is not the creator
          return isUpcoming && !isCreator
        }) || []
        
        return {
          name: category.name,
          classes: upcomingClasses.map(cls => classAPI.transformClassData(cls, category.name))
        }
      })
      
      const categoryResults = await Promise.all(categoryPromises)
      
      // Filter out categories with no classes
      const categoriesWithClassesData = categoryResults.filter(category => category.classes.length > 0)
      
      setCategoriesWithClasses(categoriesWithClassesData)
    } catch (error) {
      console.error('Error fetching classes by categories:', error)
      setCategoriesWithClasses([])
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  // Check if user is already authenticated on mount
  useEffect(() => {
    try {
      const authenticated = checkAuth()
      setIsAuthenticated(authenticated)
      
      // Fetch connected experts and classes if authenticated
      if (authenticated) {
        // Load user role
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.role) {
          setUserRole(user.role.name)
        }
        
        // Check if onboarding was completed
        const onboardingComplete = localStorage.getItem('onboardingComplete')
        
        // Only show onboarding if explicitly marked as incomplete (for new signups)
        // If the flag doesn't exist, assume existing user who's already onboarded
        if (onboardingComplete === 'false') {
          // User is authenticated but hasn't completed onboarding (new signup)
          setShowOnboarding(true)
        } else {
          // User has completed onboarding OR is an existing user, go to home
          setRoute('home')
          fetchConnectedExperts()
          fetchUpcomingClasses()
          fetchClassesByCategories()
          fetchUserProfile()
        }
      }
      
      // App is ready to render
      setAppLoading(false)
    } catch (error) {
      console.error('Error in authentication useEffect:', error)
      setAppLoading(false) // Still set loading to false to prevent infinite loading
    }
  }, []) // Remove fetchConnectedExperts from dependencies to prevent infinite loop

  function handleLogin(userData) {
    // Update user role immediately after login
    // LoginPage passes data.user, so check both userData directly and userData.role
    if (userData) {
      const roleToSet = userData.role?.name || userData.roleName
      if (roleToSet) {
        setUserRole(roleToSet)
        setSidebarKey(prev => prev + 1) // Force sidebar re-render
      } else {
        // Try to get from localStorage if not in userData
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.role) {
          setUserRole(user.role.name)
          setSidebarKey(prev => prev + 1) // Force sidebar re-render
        }
      }
    }
    
    setIsAuthenticated(true)
    setRoute('home')
    fetchConnectedExperts() // Fetch connections after login
    fetchUpcomingClasses() // Fetch classes after login
    fetchClassesByCategories() // Fetch category classes after login
    fetchUserProfile() // Fetch profile photo after login
  }

  function handleSignup(data) {
    // IMPORTANT: Update user role immediately after signup
    // data contains { token, user }, so check data.user.role
    const user = data.user || data
    
    if (user && user.role) {
      const roleName = user.role.name
      setUserRole(roleName)
      setSidebarKey(prev => prev + 1) // Force sidebar re-render
      
      // Also force update localStorage to be sure
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      // Fallback to localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.role) {
        setUserRole(storedUser.role.name)
        setSidebarKey(prev => prev + 1) // Force sidebar re-render
      }
    }
    
    // IMPORTANT: Set onboarding flag to false for new signups
    localStorage.setItem('onboardingComplete', 'false')
    
    // New signups always need onboarding
    // Set authentication first, then show onboarding
    setIsAuthenticated(true)
    // Use setTimeout to ensure state updates properly
    setTimeout(() => {
      setShowOnboarding(true)
    }, 0)
  }

  function handleOnboardingComplete() {
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true')
    
    // Update user role after onboarding
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role) {
      setUserRole(user.role.name)
      setSidebarKey(prev => prev + 1) // Force sidebar re-render
    }
    
    setShowOnboarding(false)
    setRoute('home')
    fetchConnectedExperts() // Fetch connections after onboarding
    fetchUpcomingClasses() // Fetch classes after onboarding
    fetchClassesByCategories() // Fetch category classes after onboarding
    fetchUserProfile() // Fetch profile photo after onboarding
  }

  function handleLogout() {
    doLogout() // This will clear localStorage and redirect
  }

  // Expert Chat Functions
  function handleExpertChatClick(expert) {
    setSelectedChatExpert({
      ...expert,
      connectionId: expert.connectionId // This should come from the connected experts data
    })
    setIsChatModalOpen(true)
  }

  function handleExpertProfileClick(expert) {
    setSelectedProfile(expert)
    setRoute('profile')
  }

  // Handle viewing expert reviews
  function handleViewExpertReviews(expert) {
    setSelectedExpertForReviews({
      id: expert.id || expert._id,
      name: expert.name,
      classId: expert.classId || null,
      className: expert.className || null
    })
    setRoute('expert-reviews')
  }

  // Notification Functions
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('http://localhost:4000/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const unread = data.notifications?.filter(n => !n.is_read).length || 0
        setUnreadCount(unread)
        
        // Check for priority notifications (including messages)
        const priorityNotifs = data.notifications?.filter(n => 
          !n.is_read && 
          (n.type === 'connection_request' || n.type === 'class_starting' || n.type === 'class_reminder' || n.type === 'message')
        )

        // Show floating notifications for new priority items
        if (priorityNotifs && priorityNotifs.length > 0) {
          priorityNotifs.forEach(notif => {
            // Check if we haven't shown this notification yet
            if (!shownNotificationsRef.current.has(notif._id)) {
              shownNotificationsRef.current.add(notif._id)
              showFloatingNotification(notif)
            }
          })
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }, [floatingNotifications])

  const showFloatingNotification = (notification) => {
    const floatingNotif = {
      ...notification,
      id: notification._id || Date.now(),
      priority: notification.type === 'connection_request' || notification.type === 'class_starting' ? 'high' : 'normal'
    }
    
    setFloatingNotifications(prev => [...prev, floatingNotif])
  }

  const handleCloseFloatingNotification = (notificationId) => {
    setFloatingNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleNotificationAction = async (action, notification) => {
    try {
      const token = localStorage.getItem('authToken')
      
      // Handle notification actions
      if (action === 'accept' && notification.type === 'connection_request') {
        // Accept connection request
        const acceptResponse = await fetch(`http://localhost:4000/connections/accept/${notification.connectionId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (acceptResponse.ok) {
          console.log('Connection accepted successfully')
          
          // Mark notification as read
          await fetch(`http://localhost:4000/notifications/${notification._id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          // Refresh connected experts and notifications
          fetchConnectedExperts()
          fetchUnreadCount()
        } else {
          console.error('Failed to accept connection')
        }
      } else if (action === 'reject' && notification.type === 'connection_request') {
        // Reject connection request
        const rejectResponse = await fetch(`http://localhost:4000/connections/reject/${notification.connectionId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (rejectResponse.ok) {
          console.log('Connection rejected successfully')
          
          // Mark notification as read
          await fetch(`http://localhost:4000/notifications/${notification._id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          // Refresh notifications
          fetchUnreadCount()
        } else {
          console.error('Failed to reject connection')
        }
      } else if (action === 'join' && notification.type === 'class_starting') {
        // Navigate to live class
        setRoute('live-class')
        
        // Mark notification as read
        await fetch(`http://localhost:4000/notifications/${notification._id}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // You might need to set currentCourse here
      } else if (action === 'view' && notification.type === 'message') {
        // Open chat with the message sender
        try {
          // Find the sender in connected experts
          const sender = connectedExperts.find(expert => expert.id === notification.senderId?._id || expert.id === notification.senderId)
          
          if (sender) {
            handleExpertChatClick(sender)
          } else {
            // If not found in connected experts, fetch the connection
            const response = await fetch('http://localhost:4000/connections/my-connections', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (response.ok) {
              const data = await response.json()
              const connection = data.connections?.find(c => c.id === notification.senderId?._id || c.id === notification.senderId)
              
              if (connection) {
                handleExpertChatClick(connection)
              }
            }
          }
          
          // Mark notification as read
          await fetch(`http://localhost:4000/notifications/${notification._id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          fetchUnreadCount()
        } catch (error) {
          console.error('Error opening message:', error)
        }
      }
    } catch (err) {
      console.error('Error handling notification action:', err)
    }
    
    // Close the floating notification
    handleCloseFloatingNotification(notification.id)
  }

  // Refetch connections and classes when returning to home/dashboard
  useEffect(() => {
    if (isAuthenticated && route === 'home') {
      fetchConnectedExperts()
      fetchUpcomingClasses()
      fetchClassesByCategories()
      fetchUnreadCount() // Fetch notifications when on home
    }
  }, [isAuthenticated, route, fetchConnectedExperts, fetchUpcomingClasses, fetchClassesByCategories, fetchUnreadCount])

  // Poll for notifications every 30 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount() // Initial fetch
      
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000) // Check every 30 seconds
      
      setNotificationCheckInterval(interval)
      
      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [isAuthenticated, fetchUnreadCount])

  // Student Chat Functions (for experts)
  function handleStudentChatClick(student) {
    setSelectedChatExpert({
      ...student,
      connectionId: student.connectionId // This should come from the connected students data
    })
    setIsChatModalOpen(true)
  }

  function handleStudentProfileClick(student) {
    setSelectedProfile(student)
    setRoute('profile')
  }

  function handleSendMessage(message, expertId) {
    setChatMessages(prev => ({
      ...prev,
      [expertId]: [...(prev[expertId] || []), message]
    }))
  }

  function handleCloseChatModal() {
    setIsChatModalOpen(false)
    setSelectedChatExpert(null)
  }

  // Fetch classes by category
  const handleCategoryClick = useCallback(async (category) => {
    setSelectedCategory(category);
    setLoadingClasses(true);
    
    try {
      const response = await fetch(`http://localhost:4000/classes?categoryId=${category._id}`);
      const data = await response.json();
      
      const now = new Date();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentUserId = currentUser.sub || currentUser._id || currentUser.id
      
      // Filter out past classes and classes created by current expert - only show upcoming/live classes
      const upcomingClassesOnly = (data.classes || []).filter(cls => {
        const classDate = new Date(cls.startTime || cls.date);
        const isUpcoming = (cls.status === 'scheduled' || cls.status === 'live') && classDate > now;
        
        // Check if current user is the class creator
        const isCreator = cls.userId?._id?.toString() === currentUserId?.toString() || 
                         cls.userId?.toString() === currentUserId?.toString()
        
        // Show only if it's upcoming AND user is not the creator
        return isUpcoming && !isCreator;
      });
      
      // Transform backend data to match frontend format
      const transformedClasses = upcomingClassesOnly.map(cls => ({
        title: cls.title,
        tag: category.name,
        author: cls.userId?.name || 'Expert Instructor',
        userId: cls.userId, // Include userId for ownership check
        date: new Date(cls.startTime || cls.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: cls.duration ? `${cls.duration}min` : '2h 30m',
        startTime: cls.startTime,
        status: cls.status || 'scheduled',
        classId: cls._id, // This is crucial for join functionality
        description: cls.description,
        learners: cls.interestedCount?.toString() || '0',
        level: 'Intermediate',
        image: cls.image || '',
        attendees: cls.attendees || []
      }));
      
      setCategoryClasses(transformedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setCategoryClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [])

  // Clear category selection
  const handleClearCategory = useCallback(() => {
    setSelectedCategory(null);
    setCategoryClasses([]);
  }, [])

  // Handle "See All" for upcoming classes
  const handleSeeAllUpcoming = useCallback(() => {
    setShowAllUpcoming(!showAllUpcoming);
  }, [showAllUpcoming])

  // Handle "See All" for category classes
  const handleSeeAllCategory = useCallback((categoryName, allClasses = null) => {
    setAllClassesCategory(categoryName)
    setAllClassesData(allClasses)
    setRoute('all-classes')
  }, [])

  // Handle back from All Classes page
  const handleBackFromAllClasses = useCallback(() => {
    setAllClassesData(null)
    setAllClassesCategory(null)
    setRoute('home')
  }, [])

  // Handle starting a class (for instructors)
  const handleStartClass = useCallback(async ({ classId, title, startTime }) => {
    try {
      // Create meeting first
      const meetingData = await createMeeting()
      
      // Update class with meetingId
      const token = localStorage.getItem('authToken')
      await fetch(`http://localhost:4000/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meetingId: meetingData.meetingId })
      })
      
      // Start the class
      const result = await classAPI.startClass(classId)
      
      // Fetch the updated class data
      const response = await fetch(`http://localhost:4000/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Auto-join expert to live class immediately
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const currentUserId = currentUser.sub || currentUser._id || currentUser.id
        
        setCurrentCourse({
          ...data.class,
          classId: data.class._id,
          title: data.class.title,
          userId: data.class.userId || currentUserId,
          meetingId: data.class.meetingId,
          isHost: true // Mark as host for auto-join
        })
        
        // Navigate to live class page (expert auto-joins)
        setRoute('live-class')
      } else {
        alert(`Class "${title}" has been started successfully!`)
      }
      
      return result
    } catch (error) {
      console.error('Error starting class:', error)
      alert(`Failed to start class: ${error.message}`)
      throw error
    }
  }, [])

  // Handle joining a class (for students and expert rejoin)
  const handleJoinClass = useCallback(async (classData) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('Please login to join classes')
        return
      }

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentUserId = currentUser.sub || currentUser._id || currentUser.id
      let { status, classId, title, meetingId, userId } = classData
      
      // Check if current user is the class owner (expert)
      const isOwner = userId?.toString() === currentUserId?.toString() || 
                      userId?._id?.toString() === currentUserId?.toString()
      
      // Fetch fresh class data to check current status
      if (classId) {
        try {
          const checkResponse = await fetch(`http://localhost:4000/classes/${classId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (checkResponse.ok) {
            const freshClassData = await checkResponse.json()
            if (freshClassData.class) {
              meetingId = freshClassData.class.meetingId
              status = freshClassData.class.status
              classData = freshClassData.class
            }
          }
        } catch (error) {
          console.warn('Could not fetch fresh class data:', error)
        }
      }
      
      // If class is live and has meetingId, allow join/rejoin
      if (status === 'live' && meetingId) {
        // For students (non-owners), check if they are registered
        if (!isOwner) {
          const isRegistered = classData.attendees?.some(
            attendee => attendee._id?.toString() === currentUserId?.toString() || 
                       attendee?.toString() === currentUserId?.toString()
          )
          
          if (!isRegistered) {
            alert('You must register for this class before joining. Please register first.')
            return
          }
          
          // Track student join
          try {
            await fetch(`http://localhost:4000/classes/${classId}/track-join`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          } catch (trackError) {
            console.warn('Could not track join:', trackError)
          }
        }
        
        // Navigate to live class page (works for both expert and registered students)
        setCurrentCourse({
          ...classData,
          classId: classData._id || classId,
          isHost: isOwner
        })
        setRoute('live-class')
        return
      } 
      
      // Handle registration for students (works for both scheduled and live classes)
      if ((status === 'scheduled' || status === 'live') && classId && !isOwner) {
        const checkResponse = await fetch('http://localhost:4000/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (checkResponse.ok) {
          const data = await checkResponse.json()
          const targetClass = data.classes?.find(cls => cls._id === classId)
          
          if (!targetClass) {
            alert('Class not found')
            return
          }

          const isRegistered = targetClass.attendees?.some(
            attendee => attendee._id === currentUserId || attendee === currentUserId
          )

          const action = isRegistered ? 'leave' : 'join'
          const method = isRegistered ? 'DELETE' : 'POST'
          
          const response = await fetch(`http://localhost:4000/classes/${classId}/attend`, {
            method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const actionText = isRegistered ? 'left' : 'joined'
            alert(`Successfully ${actionText} the class "${title}"!`)
            
            // If class is live and user just registered, ask if they want to join now
            if (status === 'live' && !isRegistered && meetingId) {
              const joinNow = confirm('You are now registered! Would you like to join the live class now?')
              if (joinNow) {
                // Track student join
                try {
                  await fetch(`http://localhost:4000/classes/${classId}/track-join`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  })
                } catch (trackError) {
                  console.warn('Could not track join:', trackError)
                }
                
                // Navigate to live class
                setCurrentCourse({
                  ...classData,
                  classId: classData._id || classId,
                  isHost: false
                })
                setRoute('live-class')
                return
              }
            }
            
            // Refresh the classes
            if (selectedCategory) {
              handleCategoryClick(selectedCategory)
            }
            fetchUpcomingClasses()
          } else {
            const errorData = await response.json()
            alert(errorData.error || `Failed to ${action} class`)
          }
        }
      } else if (!classId) {
        // Fallback for classes without classId
        alert('Class registration not available for this class')
      }
    } catch (error) {
      console.error('Error joining class:', error)
      alert(`Failed to join class: ${error.message}`)
    }
  }, [selectedCategory, handleCategoryClick, fetchUpcomingClasses])

  // Show loading screen while app initializes
  if (appLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#f5f5f5',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '18px', color: '#333' }}>Loading LinkedSkill...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e0e0e0', 
          borderTop: '4px solid #1976d2', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Show landing page first if not authenticated and no auth page selected
  if (!isAuthenticated && route === 'landing') {
    return <LandingPage 
      onGetStarted={() => {
        setAuthPage('signup')
        setRoute('auth')
      }} 
      onLogin={() => {
        setAuthPage('login')
        setRoute('auth')
      }} 
    />
  }

  // Show onboarding if user just signed up and hasn't completed onboarding
  if (isAuthenticated && showOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />
  }

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />
    }
    return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Animated gradient mesh background - matching landing page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Glassmorphic grid overlay */}
      <div className="fixed inset-0 z-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="relative z-10">
      <AddClassModal 
        isOpen={isAddClassModalOpen} 
        onClose={() => setIsAddClassModalOpen(false)}
        onClassCreated={() => {
          // Add a small delay to ensure backend has finished processing
          setTimeout(() => {
            fetchUpcomingClasses()
            fetchClassesByCategories() // Refresh all category classes
            // Also refresh category classes if a category is selected
            if (selectedCategory) {
              handleCategoryClick(selectedCategory)
            }
          }, 500) // 500ms delay
        }}
      />
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={handleCloseChatModal}
        expert={selectedChatExpert}
        connectionId={selectedChatExpert?.connectionId}
      />
      
      {/* Mobile Header - Enhanced fully responsive design with landing page colors */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-40 
                      px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3.5 
                      flex items-center justify-between border-b border-purple-500/20">
        <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
          <div className="relative w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 
                          bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 
                          rounded-lg xs:rounded-xl shadow-lg shadow-purple-500/50 
                          flex items-center justify-center">
            <span className="text-white font-bold text-xs xs:text-sm sm:text-base cursor-pointer"
              onClick={() => { setRoute('home'); setSelectedProfile(null); setIsMobileMenuOpen(false); }}>
              LS
            </span>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg xs:rounded-xl blur-md opacity-50 -z-10"></div>
          </div>
          <div className="text-sm xs:text-base sm:text-lg font-semibold 
                          bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 
                          bg-clip-text text-transparent truncate max-w-[120px] xs:max-w-none">
            LinkedSkill
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 
                     flex items-center justify-center rounded-lg 
                     bg-violet-500/10 hover:bg-violet-500/20 
                     border border-violet-500/30 transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      {/* Main Layout Container - Fully responsive layout */}
      <div className="h-screen bg-slate-900/30 backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Sidebar - Fully responsive fixed position with glassmorphism */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 
            w-64 xs:w-72 sm:w-80 md:w-84 lg:w-auto lg:col-span-2 
            bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-12 xs:pt-13 sm:pt-14 md:pt-16 lg:pt-0 
            lg:h-full flex flex-col
            shadow-2xl lg:shadow-none
          `}>
            <div className="flex-1 px-2 xs:px-3 sm:px-4 lg:px-0 py-4 xs:py-5 sm:py-6 
                            overflow-y-auto">
              <Sidebar 
                key={sidebarKey}
                userRole={userRole}
                onLogoClick={() => { setRoute('home'); setSelectedProfile(null); setIsMobileMenuOpen(false); }} 
                onFriendClick={(p) => { setSelectedProfile(p); setRoute('profile'); setIsMobileMenuOpen(false); }} 
                onNavClick={(r) => { if (r === 'addclass') setIsAddClassModalOpen(true); else setRoute(r); setIsMobileMenuOpen(false); }} 
                onLogout={handleLogout} 
              />
            </div>
          </aside>

          {/* Overlay for mobile menu - Enhanced with smooth transition */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden 
                         animate-fadeIn"
              onClick={() => setIsMobileMenuOpen(false)}
              onTouchStart={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content Area - Fully responsive scrollable center content */}
          <main className={`
            ${route === 'home' ? 'lg:col-span-8' : 'lg:col-span-10'} 
            pt-12 xs:pt-13 sm:pt-14 md:pt-16 lg:pt-0 
            px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 
            py-3 xs:py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8 2xl:py-10
            lg:overflow-y-auto lg:overflow-x-hidden
            min-h-screen lg:min-h-0 lg:h-full
          `}>
            {/* Enhanced fully responsive header with gradient */}
            {route !== 'experts' && (
              <header className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8 
                                 flex flex-col sm:flex-row items-start sm:items-center 
                                 gap-2 xs:gap-3 sm:gap-4">
                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 
                                flex-1 w-full sm:w-auto">
                  <div className="relative w-7 h-7 xs:w-8 xs:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 
                                  bg-gradient-to-br from-indigo-600 to-purple-600 
                                  rounded-lg xs:rounded-xl shadow-md cursor-pointer hidden lg:flex
                                  items-center justify-center"
                    onClick={() => { setRoute('home'); setSelectedProfile(null); }}>
                    <span className="text-white font-bold text-base xs:text-lg md:text-xl">LS</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg xs:rounded-xl blur-sm opacity-30 -z-10"></div>
                  </div>
                  <div className="relative w-full sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                    <input 
                      placeholder="Search courses..." 
                      className="w-full border border-slate-600/50 rounded-full 
                                pl-3 xs:pl-4 pr-9 xs:pr-10 
                                py-1.5 xs:py-2 sm:py-2.5 
                                text-xs xs:text-sm sm:text-base 
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                                bg-slate-800/80 backdrop-blur-sm text-gray-200 placeholder-gray-500 
                                shadow-sm hover:shadow-md transition-shadow" 
                    />
                    <button className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 
                                       text-gray-400 hover:text-gray-300 transition-colors">
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Notification Bell Button */}
                  <button
                    onClick={() => setRoute('notifications')}
                    className="relative p-2 xs:p-2.5 sm:p-3 
                               bg-slate-800/80 hover:bg-slate-700/80 
                               rounded-full border border-slate-600/50
                               text-gray-400 hover:text-yellow-400
                               transition-all duration-200 
                               shadow-sm hover:shadow-md
                               active:scale-95"
                  >
                    <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    
                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 
                                     bg-red-500 text-white 
                                     text-[10px] xs:text-xs font-bold 
                                     rounded-full w-4 h-4 xs:w-5 xs:h-5 
                                     flex items-center justify-center
                                     animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </header>
            )}

            {route === 'home' ? (
              <>
                {/* Enhanced fully responsive hero section with gradient */}
                <section className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8">
                  <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white 
                                  rounded-lg xs:rounded-xl sm:rounded-2xl 
                                  p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 
                                  flex flex-col lg:flex-row items-center justify-between 
                                  gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8
                                  shadow-lg hover:shadow-xl transition-shadow duration-300 
                                  relative overflow-hidden border border-indigo-500/20">
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-slate-800/20 to-slate-900/20 blur-xl -z-10"></div>
                    
                    <div className="flex-1 text-center lg:text-left relative z-10 w-full">
                      <div className="text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider opacity-90 
                                     mb-1 xs:mb-1.5 sm:mb-2">
                        Online Course
                      </div>
                      <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 
                                     font-bold leading-tight 
                                     mb-2 xs:mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-4">
                        Sharpen Your Skills With Professional Online Courses
                      </h2>
                      <button className="bg-white/15 backdrop-blur-sm border border-white/25 text-white 
                                       px-3 xs:px-4 sm:px-5 md:px-6 
                                       py-1.5 xs:py-2 sm:py-2.5 
                                       rounded-full font-medium 
                                       text-xs xs:text-sm sm:text-base 
                                       hover:bg-white/25 transform hover:scale-105 transition-all duration-200
                                       shadow-md hover:shadow-lg">
                        Join Now
                      </button>
                    </div>
                    <div className="w-full max-w-[150px] h-16 
                                    xs:max-w-[180px] xs:h-20 
                                    sm:max-w-[200px] sm:h-24 
                                    lg:w-44 lg:h-26 
                                    xl:w-48 xl:h-28 
                                    bg-white/8 backdrop-blur-sm 
                                    rounded-md xs:rounded-lg sm:rounded-xl 
                                    flex-shrink-0 border border-white/15" />
                  </div>
                </section>

          <CategorySection onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} onClearCategory={handleClearCategory} />

          {/* Show filtered classes if a category is selected */}
          {selectedCategory && (
            <>
              {loadingClasses ? (
                <section className="mb-6 md:mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <button 
                      onClick={handleClearCategory}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 
                                 font-medium text-sm hover:bg-purple-50 px-3 py-1.5 rounded-lg 
                                 transition-all duration-300"
                      title="Back to all categories"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                      Back
                    </button>
                    <h3 className="text-base md:text-xl font-semibold text-white">
                      {selectedCategory.name} Classes
                    </h3>
                  </div>
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                  </div>
                </section>
              ) : categoryClasses.length > 0 ? (
                <section className="mb-6 md:mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <button 
                      onClick={handleClearCategory}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 
                                 font-medium text-sm hover:bg-purple-50 px-3 py-1.5 rounded-lg 
                                 transition-all duration-300"
                      title="Back to all categories"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                      Back
                    </button>
                    <h3 className="text-base md:text-xl font-semibold text-white">
                      {selectedCategory.name} Classes ({categoryClasses.length})
                    </h3>
                  </div>
                  <CarouselSection 
                    title=""
                    classes={categoryClasses}
                    onSeeAll={() => console.log('See all')}
                    onJoin={handleJoinClass}
                    onSelect={(cls) => console.log('Select:', cls)}
                  />
                </section>
              ) : (
                <section className="mb-6 md:mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <button 
                      onClick={handleClearCategory}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 
                                 font-medium text-sm hover:bg-purple-50 px-3 py-1.5 rounded-lg 
                                 transition-all duration-300"
                      title="Back to all categories"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                      Back
                    </button>
                    <h3 className="text-base md:text-xl font-semibold text-white">
                      {selectedCategory.name} Classes
                    </h3>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center text-gray-400">
                    No classes available in this category yet.
                  </div>
                </section>
              )}
            </>
          )}

          {/* Upcoming Classes - Dynamic Data */}
          <CarouselSection 
            title="My Upcoming Classes"
            classes={(showAllUpcoming ? upcomingClasses : upcomingClasses.slice(0, 4)).map(cls => ({
              title: cls.title,
              tag: cls.categoryId?.name || 'General',
              author: cls.userId?.name || 'Expert Instructor',
              userId: cls.userId, // Include userId for ownership check
              date: new Date(cls.startTime || cls.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              time: cls.duration ? `${cls.duration}min` : '2h 30m',
              startTime: cls.startTime || cls.date,
              status: cls.status || 'scheduled',
              classId: cls._id,
              description: cls.description || 'Join this upcoming class session.',
              learners: cls.attendees?.length?.toString() || '0',
              level: cls.level || 'Intermediate',
              image: cls.image || '',
              attendees: cls.attendees || []
            }))}
            onSeeAll={upcomingClasses.length > 4 ? handleSeeAllUpcoming : undefined}
            seeAllText={showAllUpcoming ? "Show Less" : "Show All"}
              onSelect={(c) => { setCurrentCourse(c); setRoute('live-class'); }}
              onJoin={handleJoinClass}
              onStart={handleStartClass}
          />

          {/* Dynamic Category Classes - Only show categories that have classes */}
          {categoriesLoading ? (
            // Show loading skeletons for categories while loading
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mt-8 mb-8">
                  <CarouselSection 
                    title="Loading Classes..."
                    classes={[]}
                    loading={true}
                    onSeeAll={() => {}}
                    onSelect={() => {}}
                    onJoin={() => {}}
                    onStart={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Render categories with classes dynamically
            categoriesWithClasses.map((category, index) => {
              const isExpanded = expandedCategories.has(category.name)
              const displayClasses = isExpanded ? category.classes : category.classes.slice(0, 4)
              const hasMoreClasses = category.classes.length > 4
              
              return (
                <div key={category.name} className="mt-8 mb-8">
                  <CarouselSection 
                    title={`${category.name} Classes`}
                    classes={displayClasses}
                    loading={false}
                    onSeeAll={hasMoreClasses ? () => handleSeeAllCategory(category.name, category.classes) : undefined}
                    seeAllText="See All"
                    onSelect={(c) => { setCurrentCourse(c); setRoute('live-class'); }}
                    onJoin={handleJoinClass}
                    onStart={handleStartClass}
                  />
                </div>
              )
            })
          )}

          {/* Show message if no categories have classes */}
          {!categoriesLoading && categoriesWithClasses.length === 0 && (
            <div className="mt-8 mb-8 text-center py-12">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-8 mx-auto w-24 h-24 mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                No Classes Available Yet
              </h4>
              <p className="text-gray-300 max-w-md mx-auto">
                Classes will appear here once experts create them. Be the first to create a class using the "Add Class" button!
              </p>
            </div>
          )}

              </>
            ) : route === 'profile' ? (
              <ProfilePage 
                profile={selectedProfile} 
                onBack={() => { setRoute('home'); setSelectedProfile(null); }}
                onJoinLiveClass={(classData) => {
                  setCurrentCourse(classData);
                  setRoute('live-class');
                }}
                onPhotoUpdate={fetchUserProfile}
                onViewClassReviews={handleViewExpertReviews}
              />
            ) : route === 'references' ? (
              <ReferencePage course={currentCourse} onBack={() => setRoute('home')} />
            ) : route === 'live-class' ? (
              <LiveClassPage classData={currentCourse} onBack={() => setRoute('home')} />
            ) : route === 'all-classes' ? (
              <AllClassesPage 
                categoryName={allClassesCategory}
                allClasses={allClassesData}
                onBack={handleBackFromAllClasses}
                onJoin={handleJoinClass}
                onSelect={(c) => { setCurrentCourse(c); setRoute('live-class'); }}
                onStart={handleStartClass}
              />
            ) : route === 'experts' ? (
              <ExpertsPage onBack={() => setRoute('home')} />
            ) : route === 'expert-reviews' && selectedExpertForReviews ? (
              <ExpertReviewsPage 
                expertId={selectedExpertForReviews.id}
                expertName={selectedExpertForReviews.name}
                classId={selectedExpertForReviews.classId}
                className={selectedExpertForReviews.className}
                onBack={() => {
                  setSelectedExpertForReviews(null);
                  setRoute('home');
                }}
              />
            ) : route === 'notifications' ? (
              <NotificationsPage onBack={() => setRoute('home')} />
            ) : null }
          </main>

          {/* Fixed fully responsive right panel with glassmorphism */}
          {route === 'home' && (
            <aside className="lg:col-span-2 
                             border-t lg:border-t-0 lg:border-l border-slate-700/50 
                             bg-slate-900/60 backdrop-blur-xl
                             px-2 xs:px-3 sm:px-4 lg:px-3 xl:px-4 
                             py-2 xs:py-3 sm:py-4 lg:py-4
                             order-first lg:order-last
                             lg:h-full lg:flex lg:flex-col shadow-lg">
              <div className="lg:flex-1 lg:h-full overflow-visible">
                <RightPanel 
                  onProfileClick={() => { setSelectedProfile({ id: 'me', name: 'Alex Morgan', role: 'Software Developer' }); setRoute('profile'); }} 
                  onReferencesClick={() => setRoute('references')}
                  connectedExperts={connectedExperts}
                  onExpertChatClick={handleExpertChatClick}
                  onExpertProfileClick={handleExpertProfileClick}
                  onExpertReviewsClick={handleViewExpertReviews}
                  onStudentChatClick={handleStudentChatClick}
                  onStudentProfileClick={handleStudentProfileClick}
                  connectionsLoading={connectionsLoading}
                  upcomingClasses={upcomingClasses}
                  onClassUpdate={fetchUpcomingClasses}
                  userPhotoUrl={userPhotoUrl}
                  userName={userName}
                  onPhotoUpdate={fetchUserProfile}
                  onConnectionRemoved={fetchConnectedExperts}
                  onViewClassReviews={handleViewExpertReviews}
                />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Floating Notifications */}
      {floatingNotifications.map((notification) => (
        <FloatingNotification
          key={notification.id}
          notification={notification}
          onClose={() => handleCloseFloatingNotification(notification.id)}
          onAction={handleNotificationAction}
        />
      ))}
      </div>
    </div>
  )
}
