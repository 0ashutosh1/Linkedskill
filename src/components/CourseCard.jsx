import React, { useState, useRef, useEffect } from 'react'

export default function CourseCard({title, tag, author, date, time, onSelect, onJoin, description, learners, level}){
  const [showPopup, setShowPopup] = useState(false)
  const [saved, setSaved] = useState(false)
  const [popupPosition, setPopupPosition] = useState('right')
  const cardRef = useRef(null)

  useEffect(() => {
    if (showPopup && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const spaceOnRight = window.innerWidth - rect.right
      // If less than 400px space on right, show on left
      if (spaceOnRight < 400) {
        setPopupPosition('left')
      } else {
        setPopupPosition('right')
      }
    }
  }, [showPopup])

  // Generate professional image based on course title/tag
  const getCourseImageStyle = () => {
    const titleLower = title?.toLowerCase() || ''
    
    if (titleLower.includes('frontend') || titleLower.includes('react')) {
      return {
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        pattern: 'frontend',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14.5l-4-4 1.41-1.41L12 11.67l2.59-2.58L16 10.5l-4 4zm0-10.09l-8 8 8 8 8-8-8-8zM4.93 12L12 5.91 19.07 12 12 18.09 4.93 12z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('backend') || titleLower.includes('database') || titleLower.includes('node')) {
      return {
        gradient: 'from-green-500 via-emerald-500 to-teal-600',
        pattern: 'backend',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('fullstack') || titleLower.includes('full stack') || titleLower.includes('javascript')) {
      return {
        gradient: 'from-indigo-500 via-purple-500 to-pink-500',
        pattern: 'fullstack',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h7v12H4V6zm16 12h-7V6h7v12z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('design')) {
      return {
        gradient: 'from-pink-500 via-rose-500 to-orange-500',
        pattern: 'design',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('cloud') || titleLower.includes('aws') || titleLower.includes('devops')) {
      return {
        gradient: 'from-orange-500 via-amber-500 to-yellow-500',
        pattern: 'cloud',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('data') || titleLower.includes('machine learning') || titleLower.includes('ai')) {
      return {
        gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
        pattern: 'data',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('mobile') || titleLower.includes('ios') || titleLower.includes('android')) {
      return {
        gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
        pattern: 'mobile',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('finance') || titleLower.includes('investment') || titleLower.includes('crypto')) {
      return {
        gradient: 'from-emerald-500 via-green-600 to-lime-600',
        pattern: 'finance',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('yoga') || titleLower.includes('fitness') || titleLower.includes('sport')) {
      return {
        gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
        pattern: 'fitness',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('music') || titleLower.includes('guitar') || titleLower.includes('singing')) {
      return {
        gradient: 'from-purple-500 via-violet-600 to-indigo-600',
        pattern: 'music',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        )
      }
    } else if (titleLower.includes('marathon') || titleLower.includes('training') || titleLower.includes('hiit')) {
      return {
        gradient: 'from-red-500 via-orange-600 to-amber-600',
        pattern: 'training',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.89 19.38l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
          </svg>
        )
      }
    } else {
      return {
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        pattern: 'default',
        icon: (
          <svg className="w-16 h-16 md:w-20 md:h-20 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
        )
      }
    }
  }

  const imageStyle = getCourseImageStyle()

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
      style={{ overflow: 'visible' }}
    >
      <div className={`h-32 md:h-40 bg-gradient-to-br ${imageStyle.gradient} flex items-center justify-center cursor-pointer relative overflow-hidden group`} onClick={() => onSelect && onSelect({ title, tag, author, date, time })}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon */}
        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
          {imageStyle.icon}
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-300"></div>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">{tag}</span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => onSelect && onSelect({ title, tag, author, date, time })}>{title}</h4>
        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {author?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-gray-700 truncate">{author}</div>
              <div className="text-xs text-gray-400 truncate">{date}</div>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onJoin && onJoin({ title, tag, author, date, time }); }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0"
          >
            Join
          </button>
        </div>
      </div>

      {/* Hover Popup - Overlays at same position but bigger - Hidden on mobile */}
      {showPopup && (
        <div className="hidden md:block absolute -inset-4 bg-white rounded-xl shadow-2xl p-6 z-50 animate-fadeIn border-2 border-purple-200" style={{ minHeight: '420px' }}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                {tag}
              </span>
              <span className="text-sm text-gray-400">{time}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
              {description || "Learn the fundamentals and advanced concepts to become a professional developer. This comprehensive course covers everything you need to know."}
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
              <span className="font-semibold">By:</span>
              <span>{author}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span className="font-semibold">Learners:</span>
              <span>{learners || '4,599'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-semibold">Updated:</span>
              <span>{date}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="font-semibold">Level:</span>
              <span>{level || 'Beginner'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onJoin && onJoin({ title, tag, author, date, time }); }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Join Now
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
              className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${saved ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-600 hover:border-purple-600'}`}
              title={saved ? "Saved" : "Save"}
            >
              <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
