import React, { useState, useEffect, useRef } from 'react'
import CourseCard from './CourseCard'

export default function CarouselSection({ title, classes, onSeeAll, onJoin, onSelect, onStart, seeAllText = "Show All", loading = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [visibleCards, setVisibleCards] = useState(4)
  const [maxOffset, setMaxOffset] = useState(0)
  const containerRef = useRef(null)
  const cardRefs = useRef([])

  // Calculate visible cards based on screen size
  useEffect(() => {
    const calculateVisibleCards = () => {
      const width = window.innerWidth
      if (width >= 1536) setVisibleCards(5) // 2xl
      else if (width >= 1280) setVisibleCards(4) // xl
      else if (width >= 1024) setVisibleCards(3) // lg
      else if (width >= 768) setVisibleCards(2) // md
      else setVisibleCards(1) // sm and below
    }

    calculateVisibleCards()
    window.addEventListener('resize', calculateVisibleCards)
    return () => window.removeEventListener('resize', calculateVisibleCards)
  }, [])

  // Calculate max offset
  useEffect(() => {
    if (classes && classes.length > 0) {
      setMaxOffset(Math.max(0, classes.length - visibleCards))
    }
  }, [classes, visibleCards])

  const canScrollLeft = currentOffset > 0
  const canScrollRight = currentOffset < maxOffset

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentOffset(prev => Math.max(0, prev - 1))
    }
  }

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentOffset(prev => Math.min(maxOffset, prev + 1))
    }
  }

  const handleCardHover = (index) => {
    setHoveredIndex(index)
  }

  const handleCardLeave = () => {
    setHoveredIndex(null)
  }

  const getCardTransform = (index) => {
    if (hoveredIndex === null) return 'translateX(0)'
    
    const actualIndex = index - currentOffset
    const hoveredActualIndex = hoveredIndex - currentOffset
    
    // Only apply transforms to visible cards
    if (actualIndex < 0 || actualIndex >= visibleCards) return 'translateX(0)'
    
    // Check if hovering on the last visible card (rightmost)
    const isHoveringLastCard = hoveredActualIndex === visibleCards - 1
    
    if (index === hoveredIndex) {
      // Hovered card: scale up and move slightly up
      if (isHoveringLastCard) {
        // If it's the last card, also shift it left to make room for hover details
        return 'translateX(-80px) translateY(-8px) scale(1.05)'
      }
      return 'translateX(0) translateY(-8px) scale(1.05)'
    } else if (isHoveringLastCard) {
      // When hovering the last card, shift all other cards left to make room
      return 'translateX(-80px)'
    } else if (actualIndex < hoveredActualIndex) {
      // Cards to the left: shift left
      return 'translateX(-20px)'
    } else if (actualIndex > hoveredActualIndex) {
      // Cards to the right: shift right
      return 'translateX(20px)'
    }
    
    return 'translateX(0)'
  }

  const getCardZIndex = (index) => {
    if (hoveredIndex === null) return 10
    return index === hoveredIndex ? 50 : 10
  }

  // Show loading state
  if (loading) {
    return (
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-3 sm:px-4 md:px-0">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-white">
            {title}
          </h3>
        </div>
        <div className="relative overflow-hidden px-3 sm:px-4 md:px-0" style={{ height: '320px' }}>
          <div className="flex gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0" style={{ width: '280px' }}>
                <div className="bg-slate-700/50 rounded-xl p-4 animate-pulse">
                  <div className="h-32 bg-slate-600/50 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-600/50 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600/50 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-slate-600/50 rounded mb-4 w-1/2"></div>
                  <div className="h-8 bg-slate-600/50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!classes || classes.length === 0) {
    return (
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-3 sm:px-4 md:px-0">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-white">
            {title}
          </h3>
        </div>
        <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20 px-4 text-center">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-blue-600 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">
            No Classes Available
          </h4>
          <p className="text-sm sm:text-base text-gray-300 max-w-md">
            Classes for this section will appear here once they become available.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 relative">
      {/* Header with Navigation Controls */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-3 sm:px-4 md:px-0 relative z-10">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-white truncate flex-1 mr-4">
          {title}
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Navigation Controls */}
          {classes.length > visibleCards && (
            <div className="flex items-center gap-2">
              {/* Left Arrow */}
              <button 
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2
                           ${canScrollLeft 
                             ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 hover:scale-105 shadow-lg' 
                             : 'bg-slate-700 text-gray-400 border-slate-600 cursor-not-allowed'}`}
                title="Previous classes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              {/* Right Arrow */}
              <button 
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2
                           ${canScrollRight 
                             ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 hover:scale-105 shadow-lg' 
                             : 'bg-slate-700 text-gray-400 border-slate-600 cursor-not-allowed'}`}
                title="Next classes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2 ml-2">
                {Array.from({ length: Math.max(1, classes.length - visibleCards + 1) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentOffset(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 border
                               ${currentOffset === index 
                                 ? 'bg-blue-500 border-blue-400 shadow-md' 
                                 : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'}`}
                    title={`Slide to position ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* See All Classes Button */}
          {classes.length > 0 && (
            <button
              onClick={() => onSeeAll && onSeeAll(title, classes)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg
                         transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg
                         border border-blue-500/30"
              title={`View all ${classes.length} classes in ${title}`}
            >
              <span>{seeAllText}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Carousel Content */}
      <div 
        ref={containerRef}
        className="relative overflow-visible px-3 sm:px-4 md:px-0"
        style={{ 
          height: hoveredIndex !== null ? '420px' : '340px',
          transition: 'height 0.3s ease-in-out',
          zIndex: 1
        }}
      >
        <div 
          className="flex transition-transform duration-500 ease-out gap-4 md:gap-6"
          style={{ 
            transform: `translateX(-${(currentOffset * 100) / visibleCards}%)`,
            overflow: 'visible'
          }}
        >
          {classes.map((classItem, index) => (
            <div
              key={classItem.classId || `carousel-class-${index}`}
              ref={el => cardRefs.current[index] = el}
              className="relative transition-all duration-300 ease-in-out"
              style={{ 
                width: `${100 / visibleCards}%`,
                flexShrink: 0,
                transform: getCardTransform(index),
                zIndex: getCardZIndex(index),
                filter: hoveredIndex !== null && index !== hoveredIndex ? 'brightness(0.7)' : 'brightness(1)',
                overflow: 'visible'
              }}
              onMouseEnter={() => handleCardHover(index)}
              onMouseLeave={handleCardLeave}
            >
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
      </div>
    </section>
  )
}