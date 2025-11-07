import React, { useState, useEffect, useCallback } from 'react'
import ProfilePage from './components/ProfilePage'
import ReferencePage from './components/ReferencePage'
import ExpertsPage from './components/ExpertsPage'
import NotificationsPage from './components/NotificationsPage'
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

  // Fetch upcoming classes for right panel
  const fetchUpcomingClasses = useCallback(async () => {
    setClassesLoading(true)
    try {
      const response = await fetch('http://localhost:4000/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Filter for truly upcoming classes (future dates only)
        const now = new Date()
        const upcoming = data.classes?.filter(cls => {
          const classDate = new Date(cls.startTime || cls.date)
          return (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
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

      console.log('🔍 Fetching user profile...')
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

  // Fetch classes by category - Dynamic approach
  const fetchClassesByCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      // First get all categories
      const categoriesResponse = await fetch('http://localhost:4000/categories')
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories')
      }
      const categoriesData = await categoriesResponse.json()
      
      const now = new Date()
      
      // Then fetch classes for each category in parallel
      const categoryPromises = categoriesData.categories.map(async (category) => {
        const classesData = await classAPI.getClassesByCategory(category.name)
        
        // Filter out past classes - only show upcoming/live classes
        const upcomingClasses = classesData.classes?.filter(cls => {
          const classDate = new Date(cls.startTime || cls.date)
          return (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
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
      console.log('Categories with classes (upcoming only):', categoriesWithClassesData.map(c => `${c.name} (${c.classes.length} classes)`))
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
      console.log('Authentication check:', authenticated);
      setIsAuthenticated(authenticated)
      
      // Fetch connected experts and classes if authenticated
      if (authenticated) {
        // Check if onboarding was completed
        const onboardingComplete = localStorage.getItem('onboardingComplete')
        console.log('Initial load - onboarding complete:', onboardingComplete)
        
        if (!onboardingComplete) {
          // User is authenticated but hasn't completed onboarding
          console.log('User needs to complete onboarding')
          setShowOnboarding(true)
        } else {
          // User has completed onboarding, go to home
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



  function handleLogin(data) {
    console.log('Login successful:', data)
    setIsAuthenticated(true)
    setRoute('home')
    fetchConnectedExperts() // Fetch connections after login
    fetchUpcomingClasses() // Fetch classes after login
    fetchClassesByCategories() // Fetch category classes after login
    fetchUserProfile() // Fetch profile photo after login
  }

  function handleSignup(data) {
    console.log('✅ Signup successful:', data)
    console.log('🔍 Checking onboarding status...')
    
    // IMPORTANT: Clear any existing onboarding flag for new signups
    localStorage.removeItem('onboardingComplete')
    
    // Check if onboarding is needed (should always be needed for new signups)
    const onboardingComplete = localStorage.getItem('onboardingComplete')
    console.log('📋 Onboarding complete status:', onboardingComplete)
    
    if (!onboardingComplete) {
      console.log('🎯 NEW USER - Showing onboarding page...')
      // Set authentication first, then show onboarding
      setIsAuthenticated(true)
      // Use setTimeout to ensure state updates properly
      setTimeout(() => {
        setShowOnboarding(true)
        console.log('✨ showOnboarding state set to TRUE')
      }, 0)
    } else {
      console.log('⚠️ Onboarding already complete - going to home...')
      setIsAuthenticated(true)
      setRoute('home')
      fetchConnectedExperts()
      fetchUpcomingClasses()
      fetchClassesByCategories()
      fetchUserProfile()
    }
  }

  function handleOnboardingComplete() {
    console.log('Onboarding complete')
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
      
      // Filter out past classes - only show upcoming/live classes
      const upcomingClassesOnly = (data.classes || []).filter(cls => {
        const classDate = new Date(cls.startTime || cls.date);
        return (cls.status === 'scheduled' || cls.status === 'live') && classDate > now;
      });
      
      // Transform backend data to match frontend format
      const transformedClasses = upcomingClassesOnly.map(cls => ({
        title: cls.title,
        tag: category.name,
        author: cls.userId?.name || 'Expert Instructor',
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
      const result = await classAPI.startClass(classId)
      
      // Fetch the updated class data to get the full class object
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:4000/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Class started, navigating to live class:', data.class)
        
        // Make sure userId is set - use current user's ID as owner
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const currentUserId = currentUser.sub || currentUser._id || currentUser.id
        
        // Navigate to live class page
        setCurrentCourse({
          ...data.class,
          classId: data.class._id,
          title: data.class.title,
          userId: data.class.userId || currentUserId
        })
        setRoute('live-class')
      } else {
        // Show success notification if we can't fetch updated data
        alert(`Class "${title}" has been started successfully! Students will be notified.`)
      }
      
      return result
    } catch (error) {
      console.error('Error starting class:', error)
      alert(`Failed to start class: ${error.message}`)
      throw error
    }
  }, [])

  // Handle joining a class (for students)
  const handleJoinClass = useCallback(async (classData) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('Please login to register for classes')
        return
      }

      let { status, classId, title, meetingId } = classData
      console.log('App: Attempting to join class:', classData)
      
      // Fetch fresh class data to check if it has been started (has meetingId)
      if (classId && !meetingId) {
        try {
          const checkResponse = await fetch(`http://localhost:4000/classes/${classId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (checkResponse.ok) {
            const freshClassData = await checkResponse.json()
            console.log('📡 Fetched fresh class data:', freshClassData)
            
            // Update with fresh data
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
      
      // If class has a meetingId or status is 'live', join the live class
      if (status === 'live' || meetingId) {
        // Class is currently live - navigate to live class page
        console.log('🎥 Joining live class:', classData)
        setCurrentCourse(classData)
        setRoute('live-class')
        return
      } else if (status === 'scheduled' && classId) {
        // Check if user is already registered for this class
        const checkResponse = await fetch('http://localhost:4000/classes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (checkResponse.ok) {
          const data = await checkResponse.json()
          const targetClass = data.classes?.find(cls => cls._id === classId)
          
          if (!targetClass) {
            alert('Class not found')
            return
          }

          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          const isRegistered = targetClass.attendees?.some(
            attendee => attendee._id === currentUser.sub || attendee === currentUser.sub
          )

          // Determine the action and endpoint
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
      } else {
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
    console.log('🎨 Rendering OnboardingPage... (isAuthenticated:', isAuthenticated, 'showOnboarding:', showOnboarding, ')')
    return <OnboardingPage onComplete={handleOnboardingComplete} />
  }

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    console.log('🔐 User not authenticated, showing auth page:', authPage);
    if (authPage === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />
    }
    return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />
  }

  console.log('🏠 User authenticated, rendering main app with route:', route, '(showOnboarding:', showOnboarding, ')');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white">
      <AddClassModal 
        isOpen={isAddClassModalOpen} 
        onClose={() => setIsAddClassModalOpen(false)}
        onClassCreated={() => {
          fetchUpcomingClasses()
          fetchClassesByCategories() // Refresh all category classes
          // Also refresh category classes if a category is selected
          if (selectedCategory) {
            handleCategoryClick(selectedCategory)
          }
        }}
      />
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={handleCloseChatModal}
        expert={selectedChatExpert}
        connectionId={selectedChatExpert?.connectionId}
      />
      
      {/* Mobile Header - Enhanced responsive design */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm shadow-lg z-40 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src={logo} 
            alt="LinkedSkill Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover cursor-pointer" 
            onClick={() => { setRoute('home'); setSelectedProfile(null); setIsMobileMenuOpen(false); }} 
          />
          <div className="text-base sm:text-lg font-semibold text-blue-600">LinkedSkill</div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      {/* Main Layout Container - Full width layout */}
      <div className="h-screen bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Sidebar - Fixed position, no scroll except mobile */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-auto lg:col-span-2 
            bg-slate-800/70 backdrop-blur-sm border-r lg:border-r-gray-700
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-14 sm:pt-16 lg:pt-0 lg:h-full flex flex-col
            shadow-2xl lg:shadow-none
          `}>
            <div className="flex-1 px-3 sm:px-4 lg:px-0 py-6 overflow-y-auto lg:overflow-y-auto">
              <Sidebar 
                onLogoClick={() => { setRoute('home'); setSelectedProfile(null); setIsMobileMenuOpen(false); }} 
                onFriendClick={(p) => { setSelectedProfile(p); setRoute('profile'); setIsMobileMenuOpen(false); }} 
                onNavClick={(r) => { if (r === 'addclass') setIsAddClassModalOpen(true); else setRoute(r); setIsMobileMenuOpen(false); }} 
                onLogout={handleLogout} 
              />
            </div>
          </aside>

          {/* Overlay for mobile menu - Improved interaction */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              onTouchStart={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content Area - Scrollable center content */}
          <main className={`
            ${route === 'home' ? 'lg:col-span-8' : 'lg:col-span-10'} 
            pt-14 sm:pt-16 lg:pt-0 
            px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 
            py-4 sm:py-6 lg:py-8 xl:py-10
            lg:overflow-y-auto lg:overflow-x-hidden
            min-h-screen lg:min-h-0 lg:h-full
          `}>
            {/* Enhanced responsive header */}
            {route !== 'experts' && (
              <header className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 w-full sm:w-auto">
                  <img 
                    src={logo} 
                    alt="LinkedSkill Logo" 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover cursor-pointer hidden lg:block" 
                    onClick={() => { setRoute('home'); setSelectedProfile(null); }} 
                  />
                  <div className="relative w-full sm:max-w-md lg:max-w-lg">
                    <input 
                      placeholder="Search your course here..." 
                      className="w-full border border-slate-600/50 rounded-full pl-4 pr-10 py-2 sm:py-2.5 text-sm sm:text-base 
                                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                bg-slate-700/50 text-gray-200 placeholder-gray-400 shadow-lg hover:shadow-xl transition-shadow" 
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </header>
            )}

            {route === 'home' ? (
              <>
                {/* Enhanced responsive hero section */}
                <section className="mb-4 sm:mb-6 lg:mb-8">
                  <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white rounded-xl sm:rounded-2xl 
                                  p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8
                                  shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex-1 text-center lg:text-left">
                      <div className="text-xs sm:text-sm uppercase tracking-wider opacity-90 mb-2">Online Course</div>
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-3 sm:mb-4">
                        Sharpen Your Skills With Professional Online Courses
                      </h2>
                      <button className="bg-slate-800 border border-slate-600/50 text-blue-400 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold 
                                       text-sm sm:text-base hover:bg-slate-700 transform hover:scale-105 transition-all duration-200
                                       shadow-lg hover:shadow-xl">
                        Join Now
                      </button>
                    </div>
                    <div className="w-full max-w-[200px] h-20 sm:h-24 lg:w-48 lg:h-28 bg-slate-800/30 rounded-lg sm:rounded-xl flex-shrink-0
                                    backdrop-blur-sm border border-slate-600/50" />
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
                  console.log('🎥 Joining live class:', classData);
                  setCurrentCourse(classData);
                  setRoute('live-class');
                }}
                onPhotoUpdate={fetchUserProfile}
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
            ) : route === 'notifications' ? (
              <NotificationsPage onBack={() => setRoute('home')} />
            ) : null }
          </main>

          {/* Fixed responsive right panel */}
          {route === 'home' && (
            <aside className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-slate-700/50 bg-slate-800/30
                             px-3 sm:px-4 lg:px-4 py-3 sm:py-4 lg:py-4
                             order-first lg:order-last
                             lg:h-full lg:flex lg:flex-col">
              <div className="lg:flex-1 lg:h-full overflow-visible">
                <RightPanel 
                  onProfileClick={() => { setSelectedProfile({ id: 'me', name: 'Alex Morgan', role: 'Software Developer' }); setRoute('profile'); }} 
                  onReferencesClick={() => setRoute('references')}
                  onNotificationsClick={() => setRoute('notifications')}
                  connectedExperts={connectedExperts}
                  onExpertChatClick={handleExpertChatClick}
                  onExpertProfileClick={handleExpertProfileClick}
                  onStudentChatClick={handleStudentChatClick}
                  onStudentProfileClick={handleStudentProfileClick}
                  connectionsLoading={connectionsLoading}
                  upcomingClasses={upcomingClasses}
                  onClassUpdate={fetchUpcomingClasses}
                  userPhotoUrl={userPhotoUrl}
                  userName={userName}
                  onPhotoUpdate={fetchUserProfile}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
