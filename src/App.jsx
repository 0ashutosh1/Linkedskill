import React, { useState } from 'react'
import ProfilePage from './components/ProfilePage'
import ReferencePage from './components/ReferencePage'
import ExpertsPage from './components/ExpertsPage'
import AddClassModal from './components/AddClassModal'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'

import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import CourseCard from './components/CourseCard'
import CategorySection from './components/CategorySection'
import ClassSection from './components/ClassSection'

export default function App() {
  const [mentors, setMentors] = useState([
    { id: 1, name: 'Alex Morgan', date: '25/02/2023', type: 'Frontend', title: 'Understanding Concept Of React' },
    { id: 2, name: 'Nikolas Helmet', date: '18/03/2023', type: 'Backend', title: 'Concept Of The Data Base' },
  ])

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', date: '', type: '', title: '' })
  const [route, setRoute] = useState('home')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authPage, setAuthPage] = useState('login') // 'login' or 'signup'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function handleEdit(m) {
    setEditingId(m.id)
    setForm({ name: m.name, date: m.date, type: m.type, title: m.title })
  }

  function handleCancel() {
    setEditingId(null)
    setForm({ name: '', date: '', type: '', title: '' })
  }

  function handleSave(id) {
    setMentors(mentors.map((m) => (m.id === id ? { ...m, ...form } : m)))
    handleCancel()
  }

  function handleLogin(data) {
    console.log('Login successful:', data)
    setIsAuthenticated(true)
  }

  function handleSignup(data) {
    console.log('Signup successful:', data)
    setIsAuthenticated(true)
  }

  function handleLogout() {
    setIsAuthenticated(false)
    setRoute('home')
  }

  // Show login/signup pages if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />
    }
    return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <AddClassModal isOpen={isAddClassModalOpen} onClose={() => setIsAddClassModalOpen(false)} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/src/assets/logo.svg" alt="logo" className="w-8 h-8" onClick={() => { setRoute('home'); setSelectedProfile(null); }} />
          <div className="text-lg font-semibold text-purple-600">LinkedSkill</div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      <div className="lg:w-full lg:bg-white lg:rounded-2xl lg:shadow-lg overflow-visible grid grid-cols-1 lg:grid-cols-12 pt-16 lg:pt-0">
        {/* Sidebar - Desktop & Mobile Drawer */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-auto lg:col-span-2 bg-white border-r
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-16 lg:pt-6 px-4 pb-6 overflow-y-auto
        `}>
          <Sidebar 
            onLogoClick={() => { setRoute('home'); setSelectedProfile(null); setIsMobileMenuOpen(false); }} 
            onFriendClick={(p) => { setSelectedProfile(p); setRoute('profile'); setIsMobileMenuOpen(false); }} 
            onNavClick={(r) => { if (r === 'addclass') setIsAddClassModalOpen(true); else setRoute(r); setIsMobileMenuOpen(false); }} 
            onLogout={handleLogout} 
          />
        </aside>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className={`${route === 'home' ? 'lg:col-span-8' : 'lg:col-span-10'} p-4 md:p-6 lg:p-10 overflow-visible`}>
          {route !== 'experts' && (
            <header className="mb-4 md:mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                <img src="/src/assets/logo.svg" alt="logo" className="w-8 h-8 md:w-10 md:h-10 cursor-pointer hidden lg:block" onClick={() => { setRoute('home'); setSelectedProfile(null); }} />
                <div className="relative w-full max-w-md">
                  <input placeholder="Search your course here..." className="w-full border rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">🔍</button>
                </div>
              </div>
            </header>
          )}

          {route === 'home' ? (
          <>
          <section className="mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-purple-400 to-pink-300 text-white rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-xs md:text-sm uppercase tracking-wider">Online Course</div>
                <h2 className="text-lg md:text-2xl font-semibold mt-1">Sharpen Your Skills With Professional Online Courses</h2>
                <button className="mt-3 md:mt-4 bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm">Join Now</button>
              </div>
              <div className="w-32 h-20 md:w-48 md:h-28 bg-white/20 rounded-lg flex-shrink-0" />
            </div>
          </section>

          <CategorySection onCategoryClick={(cat) => console.log('Selected category:', cat.name)} />

          {/* Upcoming Classes */}
          <ClassSection 
            title="My Upcoming Classes"
            classes={[
              {
                title: "Beginner's Guide To Becoming A Professional Frontend Developer",
                tag: "Tech",
                author: "Alex Morgan",
                date: "Oct 5, 2025",
                time: "2h 30m",
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
            onJoin={(c) => { setCurrentCourse(c); setRoute('references'); }}
          />

          {/* Tech Classes */}
          <ClassSection 
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

          {/* Finance Classes */}
          <ClassSection 
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
          <ClassSection 
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
          <ClassSection 
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

          <section>
            <h3 className="text-base md:text-lg font-semibold mb-3">Your Mentor</h3>
            <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-left text-xs text-gray-400">
                  <tr>
                    <th className="pb-2">Instructor Name & Date</th>
                    <th className="pb-2">Course Type</th>
                    <th className="pb-2">Course Title</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((m) => (
                    <tr className="border-t" key={m.id}>
                      <td className="py-3">
                        {editingId === m.id ? (
                          <div>
                            <input className="w-full border rounded px-2 py-1 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <input className="w-full border rounded px-2 py-1 text-xs mt-1 text-gray-500" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                          </div>
                        ) : (
                          <>
                            <div>{m.name}</div>
                            <div className="text-xs text-gray-400">{m.date}</div>
                          </>
                        )}
                      </td>

                      <td className="py-3">
                        {editingId === m.id ? (
                          <select className="border rounded px-2 py-1 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <option>Frontend</option>
                            <option>Backend</option>
                            <option>Design</option>
                          </select>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full ${m.type === 'Frontend' ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'}`}>{m.type}</span>
                        )}
                      </td>

                      <td className="py-3">
                        {editingId === m.id ? (
                          <input className="w-full border rounded px-2 py-1 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        ) : (
                          m.title
                        )}
                      </td>

                      <td className="py-3 text-right">
                        {editingId === m.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleSave(m.id)}>Save</button>
                            <button className="text-sm bg-gray-200 px-3 py-1 rounded" onClick={handleCancel}>Cancel</button>
                          </div>
                        ) : (
                          <button className="text-sm text-indigo-600" onClick={() => handleEdit(m)} title="Edit">✏️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </>
          ) : route === 'profile' ? (
            <ProfilePage profile={selectedProfile} onBack={() => { setRoute('home'); setSelectedProfile(null); }} />
          ) : route === 'references' ? (
            <ReferencePage course={currentCourse} onBack={() => setRoute('home')} />
          ) : route === 'experts' ? (
            <ExpertsPage onBack={() => setRoute('home')} />
          ) : null }
        </main>

        {route === 'home' && (
          <aside className="lg:col-span-2 bg-white border-t lg:border-t-0 lg:border-l px-4 py-6">
            <RightPanel onProfileClick={() => { setSelectedProfile({ id: 'me', name: 'Alex Morgan', role: 'Software Developer' }); setRoute('profile'); }} onReferencesClick={() => setRoute('references')} />
          </aside>
        )}
      </div>
    </div>
  )
}
