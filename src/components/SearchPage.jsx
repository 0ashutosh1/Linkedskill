import React, { useState, useEffect } from 'react'
import CourseCard from './CourseCard'

export default function SearchPage({ 
  searchTerm, 
  onClearSearch, 
  onBack,
  onJoin,
  onSelect,
  onStart 
}) {
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (searchTerm.trim()) {
      fetchSearchResults()
    }
  }, [searchTerm])

  const fetchSearchResults = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:4000/classes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const allClasses = data.classes || data
        
        const search = searchTerm.toLowerCase().trim()
        const now = new Date()
        
        // Filter classes: only upcoming/live AND match search term
        const filtered = allClasses.filter(cls => {
          // First check if class is upcoming or live
          const classDate = new Date(cls.startTime || cls.date)
          const isUpcoming = (cls.status === 'scheduled' || cls.status === 'live') && classDate > now
          
          if (!isUpcoming) return false
          
          // Then check if it matches search term
          const titleMatch = cls.title?.toLowerCase().includes(search)
          const descMatch = cls.description?.toLowerCase().includes(search)
          const categoryMatch = cls.categoryId?.name?.toLowerCase().includes(search)
          const subCategoryMatch = cls.subCategoryId?.name?.toLowerCase().includes(search)
          const expertMatch = cls.userId?.name?.toLowerCase().includes(search)
          
          return titleMatch || descMatch || categoryMatch || subCategoryMatch || expertMatch
        })
        
        setSearchResults(filtered)
        
        // Extract unique categories from results
        const uniqueCategories = [...new Set(filtered.map(cls => cls.categoryId?.name).filter(Boolean))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                Search Results
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Searching for: <span className="text-blue-400 font-semibold">"{searchTerm}"</span>
              </p>
            </div>

            <button
              onClick={onClearSearch}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-800/50 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">No Classes Found</h2>
            <p className="text-gray-400 mb-6">
              No classes match your search for "<span className="font-semibold text-blue-400">{searchTerm}</span>"
            </p>
            <button
              onClick={onClearSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-lg">
                  Found <span className="font-bold text-blue-400">{searchResults.length}</span> {searchResults.length === 1 ? 'class' : 'classes'}
                </p>
                {categories.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-sm text-gray-400">Categories:</span>
                    {categories.map((cat, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((cls) => (
                <CourseCard
                  key={cls._id}
                  title={cls.title}
                  tag={cls.categoryId?.name || cls.category || 'General'}
                  author={cls.userId?.name || 'Expert Instructor'}
                  userId={cls.userId}
                  date={new Date(cls.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  time={`${cls.duration || 60} min`}
                  startTime={cls.startTime}
                  status={cls.status}
                  classId={cls._id}
                  description={cls.description}
                  learners={cls.totalAttended || cls.interestedCount || 0}
                  level={cls.level}
                  image={cls.image}
                  attendees={cls.attendees}
                  onJoin={onJoin}
                  onSelect={onSelect}
                  onStart={onStart}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
