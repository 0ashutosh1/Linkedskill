import React, { useState, useEffect } from 'react'
import CourseCard from './CourseCard'
import { classAPI } from '../utils/classAPI'

export default function AllClassesPage({ categoryName, allClasses, onBack, onJoin, onSelect, onStart }) {
  const [classes, setClasses] = useState(allClasses || [])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Fetch all classes for the category if not provided
  useEffect(() => {
    if (!allClasses && categoryName) {
      fetchCategoryClasses()
    }
  }, [categoryName, allClasses])

  const fetchCategoryClasses = async () => {
    setLoading(true)
    try {
      const result = await classAPI.getClassesByCategory(categoryName)
      setClasses(result)
    } catch (error) {
      console.error('Error fetching category classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort classes
  const filteredClasses = classes
    .filter(classItem => {
      const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || classItem.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'students':
          return (b.learners || 0) - (a.learners || 0)
        case 'recent':
        default:
          return new Date(b.date || 0) - new Date(a.date || 0)
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-64 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <h1 className="text-2xl font-bold">
                {categoryName ? `${categoryName} Classes` : 'All Classes'}
              </h1>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {filteredClasses.length} classes
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search classes by title or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                           text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white 
                         focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white 
                         focus:outline-none focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="title">Title A-Z</option>
                <option value="author">Instructor A-Z</option>
                <option value="students">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.map((classItem, index) => (
              <div key={index} className="transform hover:scale-105 transition-transform duration-200">
                <CourseCard
                  title={classItem.title}
                  tag={classItem.tag}
                  author={classItem.author}
                  userId={classItem.userId}
                  date={classItem.date}
                  time={classItem.time}
                  startTime={classItem.startTime}
                  status={classItem.status}
                  classId={classItem.classId}
                  description={classItem.description}
                  learners={classItem.learners}
                  level={classItem.level}
                  image={classItem.image}
                  attendees={classItem.attendees}
                  onSelect={onSelect}
                  onJoin={onJoin}
                  onStart={onStart}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-slate-800 rounded-full p-8 inline-block mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Classes Found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters to find more classes.'
                : 'No classes are available in this category yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}