import React, { useState, useEffect, useCallback } from 'react'
import ProfilePage from './components/ProfilePage'
import ReferencePage from './components/ReferencePage'
import ExpertsPage from './components/ExpertsPage'
import NotificationsPage from './components/NotificationsPage'
import AddClassModal from './components/AddClassModal'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'

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
  // Debug logging
  console.log('App component rendering...');

  const [appLoading, setAppLoading] = useState(true)
  const [route, setRoute] = useState('home')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authPage, setAuthPage] = useState('login') // 'login' or 'signup'
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
        // Filter for upcoming scheduled and live classes
        const upcoming = data.classes?.filter(cls => 
          cls.status === 'scheduled' || cls.status === 'live'
        ).sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date)) || []
        
        setUpcomingClasses(upcoming)
      }
    } catch (error) {
      console.error('Error fetching upcoming classes:', error)
      setUpcomingClasses([])
    } finally {
      setClassesLoading(false)
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
        fetchConnectedExperts()
        fetchUpcomingClasses()
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
  }

  function handleSignup(data) {
    console.log('Signup successful:', data)
    setIsAuthenticated(true)
    setRoute('home')
    fetchConnectedExperts() // Fetch connections after signup
    fetchUpcomingClasses() // Fetch classes after signup
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
    console.log('Selected category:', category.name);
    setSelectedCategory(category);
    setLoadingClasses(true);
    
    try {
      const response = await fetch(`http://localhost:4000/classes?categoryId=${category._id}`);
      const data = await response.json();
      
      // Transform backend data to match frontend format
      const transformedClasses = (data.classes || []).map(cls => ({
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
        level: 'Intermediate'
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

  // Handle starting a class (for instructors)
  const handleStartClass = useCallback(async ({ classId, title, startTime }) => {
    try {
      console.log('Starting class:', { classId, title, startTime })
      const result = await classAPI.startClass(classId)
      
      // Show success notification
      alert(`Class "${title}" has been started successfully! Students will be notified.`)
      
      // You could also redirect to a live class interface here
      // setRoute('live-class')
      
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

      const { status, classId, title } = classData
      console.log('App: Attempting to join class:', classData)
      
      if (status === 'live') {
        // Join live class immediately
        console.log('Joining live class:', title)
        alert(`Joining live class: "${title}"`)
        // window.open(liveUrl, '_blank') // If you have a live URL
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

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, showing auth page:', authPage);
    if (authPage === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />
    }
    return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />
  }

  console.log('User authenticated, rendering main app with route:', route);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white">
      <AddClassModal 
        isOpen={isAddClassModalOpen} 
        onClose={() => setIsAddClassModalOpen(false)}
        onClassCreated={() => {
          fetchUpcomingClasses()
          // Also refresh category classes if a category is selected
          if (selectedCategory) {
            fetchClassesByCategory(selectedCategory)
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
            lg:overflow-y-auto lg:overflow-x-visible
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
                    <h3 className="text-base md:text-xl font-semibold text-gray-800">
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
                    <h3 className="text-base md:text-xl font-semibold text-gray-800">
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
                    <h3 className="text-base md:text-xl font-semibold text-gray-800">
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

          {/* Upcoming Classes */}
          <CarouselSection 
            title="My Upcoming Classes"
            classes={[
              {
                title: "Beginner's Guide To Becoming A Professional Frontend Developer",
                tag: "Tech",
                author: "Alex Morgan",
                date: "Oct 5, 2025",
                time: "2h 30m",
                startTime: "2025-10-25T14:30:00Z", // Tomorrow at 2:30 PM UTC
                status: "scheduled",
                classId: "demo-class-1",
                description: "Master modern frontend development with React, HTML5, CSS3, and JavaScript. Build responsive, interactive web applications from scratch.",
                learners: "8,245",
                level: "Beginner"
              },
              {
                title: "Beginner's Guide To Becoming A Professional Backend Developer",
                tag: "Tech",
                author: "Sarah Chen",
                date: "Oct 3, 2025",
                time: "3h 15m",
                description: "Learn server-side programming, databases, APIs, and cloud deployment. Build scalable backend systems and RESTful services.",
                learners: "6,892",
                level: "Beginner"
              },
              {
                title: "Investment Strategies for Beginners",
                tag: "Finance",
                author: "David Thompson",
                date: "Oct 1, 2025",
                time: "1h 45m",
                description: "Learn fundamental investment principles and build a diversified portfolio for long-term wealth.",
                learners: "3,892",
                level: "Beginner"
              }
            ]}
            onSeeAll={() => console.log('See all Upcoming classes')}
            onSelect={(c) => setCurrentCourse(c)}
            onJoin={handleJoinClass}
            onStart={handleStartClass}
          />

          {/* Tech Classes */}
          <div className="mt-8 mb-8">
            <CarouselSection 
              title="Tech Classes"
            classes={[
              {
                title: "Advanced React Patterns & Best Practices",
                tag: "Tech",
                author: "Alex Morgan",
                date: "Oct 10, 2025",
                time: "2h 30m",
                description: "Master advanced React patterns, performance optimization, and modern development practices.",
                learners: "5,234",
                level: "Advanced"
              },
              {
                title: "Full Stack JavaScript Development",
                tag: "Tech",
                author: "Sarah Chen",
                date: "Oct 12, 2025",
                time: "3h 15m",
                description: "Build complete web applications using Node.js, Express, MongoDB, and React.",
                learners: "7,892",
                level: "Intermediate"
              },
              {
                title: "Cloud Computing with AWS",
                tag: "Tech",
                author: "Michael Ross",
                date: "Oct 15, 2025",
                time: "2h 45m",
                description: "Learn to deploy and manage scalable applications on Amazon Web Services.",
                learners: "4,521",
                level: "Intermediate"
              }
            ]}
            onSeeAll={() => console.log('See all Tech classes')}
            onSelect={(c) => setCurrentCourse(c)}
            onJoin={(c) => { setCurrentCourse(c); setRoute('references'); }}
          />
          </div>

          {/* Finance Classes */}
          <CarouselSection 
            title="Finance Classes"
            classes={[
              {
                title: "Investment Strategies for Beginners",
                tag: "Finance",
                author: "David Thompson",
                date: "Oct 11, 2025",
                time: "1h 45m",
                description: "Learn fundamental investment principles and build a diversified portfolio.",
                learners: "3,892",
                level: "Beginner"
              },
              {
                title: "Cryptocurrency & Blockchain Essentials",
                tag: "Finance",
                author: "Emma Wilson",
                date: "Oct 13, 2025",
                time: "2h 15m",
                description: "Understand crypto markets, blockchain technology, and digital asset trading.",
                learners: "6,234",
                level: "Beginner"
              },
              {
                title: "Financial Analysis & Modeling",
                tag: "Finance",
                author: "James Anderson",
                date: "Oct 16, 2025",
                time: "3h 00m",
                description: "Master financial modeling, valuation techniques, and data-driven decisions.",
                learners: "2,156",
                level: "Advanced"
              }
            ]}
            onSeeAll={() => console.log('See all Finance classes')}
            onSelect={(c) => setCurrentCourse(c)}
            onJoin={(c) => { setCurrentCourse(c); setRoute('references'); }}
          />

          {/* Sports & Fitness Classes */}
          <CarouselSection 
            title="Sports & Fitness Classes"
            classes={[
              {
                title: "Yoga for Stress Relief & Flexibility",
                tag: "Sports",
                author: "Lisa Rodriguez",
                date: "Oct 9, 2025",
                time: "1h 15m",
                description: "Gentle yoga practices to reduce stress, improve flexibility, and mindfulness.",
                learners: "4,567",
                level: "Beginner"
              },
              {
                title: "HIIT Training: Maximum Results",
                tag: "Sports",
                author: "Marcus Johnson",
                date: "Oct 14, 2025",
                time: "45m",
                description: "High-intensity interval training for fat loss and cardiovascular fitness.",
                learners: "5,891",
                level: "Intermediate"
              },
              {
                title: "Marathon Training Program",
                tag: "Sports",
                author: "Nina Patel",
                date: "Oct 17, 2025",
                time: "2h 00m",
                description: "Complete 12-week marathon training plan for beginners and intermediates.",
                learners: "2,345",
                level: "Intermediate"
              }
            ]}
            onSeeAll={() => console.log('See all Sports classes')}
            onSelect={(c) => setCurrentCourse(c)}
            onJoin={(c) => { setCurrentCourse(c); setRoute('references'); }}
          />

          {/* Music Classes */}
          <CarouselSection 
            title="Music Classes"
            classes={[
              {
                title: "Guitar Fundamentals for Beginners",
                tag: "Music",
                author: "Chris Martin",
                date: "Oct 10, 2025",
                time: "1h 30m",
                description: "Learn basic chords, strumming patterns, and play your first songs.",
                learners: "7,234",
                level: "Beginner"
              },
              {
                title: "Music Production with Ableton Live",
                tag: "Music",
                author: "Sophie Taylor",
                date: "Oct 15, 2025",
                time: "2h 45m",
                description: "Create professional music tracks using Ableton Live and modern production techniques.",
                learners: "3,567",
                level: "Intermediate"
              },
              {
                title: "Singing Techniques & Vocal Training",
                tag: "Music",
                author: "Olivia Brown",
                date: "Oct 18, 2025",
                time: "1h 20m",
                description: "Improve your vocal range, tone, and singing technique with proven methods.",
                learners: "4,892",
                level: "Beginner"
              }
            ]}
            onSeeAll={() => console.log('See all Music classes')}
            onSelect={(c) => setCurrentCourse(c)}
            onJoin={(c) => { setCurrentCourse(c); setRoute('references'); }}
          />

              </>
            ) : route === 'profile' ? (
              <ProfilePage profile={selectedProfile} onBack={() => { setRoute('home'); setSelectedProfile(null); }} />
            ) : route === 'references' ? (
              <ReferencePage course={currentCourse} onBack={() => setRoute('home')} />
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
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
