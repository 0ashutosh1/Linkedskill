import React, { useState, useEffect, useRef } from 'react'
import CourseCard from './CourseCard'

export default function CarouselSection({ title, classes, onSeeAll, onJoin, onSelect, onStart }) {
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
    
    if (index === hoveredIndex) {
      // Hovered card: scale up and move slightly up
      return 'translateX(0) translateY(-8px) scale(1.05)'
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

  if (!classes || classes.length === 0) {
    return (
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-3 sm:px-4 md:px-0">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800">
            {title}
          </h3>
        </div>
        <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20 px-4 text-center">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-blue-600 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">
            No Classes Available
          </h4>
          <p className="text-sm sm:text-base text-gray-600 max-w-md">
            Classes for this section will appear here once they become available.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 relative">
      {/* Header with Show All button */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-3 sm:px-4 md:px-0">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800 truncate flex-1 mr-4">
          {title}
        </h3>
        
        {/* Show All button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Show All button */}
          <button 
            onClick={onSeeAll}
            className="text-xs sm:text-sm md:text-base font-semibold text-blue-600 hover:text-blue-700 active:text-blue-800
                       flex items-center gap-1 hover:gap-2 transition-all duration-300 hover:scale-105 active:scale-95
                       px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100
                       flex-shrink-0 touch-manipulation"
          >
            <span className="hidden xs:inline">Show All</span>
            <span className="xs:hidden">All</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel container */}
      <div 
        ref={containerRef}
        className="relative overflow-visible px-3 sm:px-4 md:px-0"
        style={{ 
          height: hoveredIndex !== null ? '380px' : '320px',
          transition: 'height 0.3s ease-in-out',
          zIndex: 1
        }}
      >
        {/* Cards container */}
        <div 
          className="flex transition-transform duration-500 ease-out gap-4 md:gap-6"
          style={{ 
            transform: `translateX(-${currentOffset * (100 / visibleCards)}%)`,
            width: `${(classes.length / visibleCards) * 100}%`,
            overflow: 'visible'
          }}
        >
          {classes.map((classItem, index) => (
            <div
              key={index}
              ref={el => cardRefs.current[index] = el}
              className="relative transition-all duration-300 ease-in-out"
              style={{ 
                width: `${100 / classes.length}%`,
                flexShrink: 0,
                transform: getCardTransform(index),
                zIndex: getCardZIndex(index),
                filter: hoveredIndex !== null && index !== hoveredIndex ? 'brightness(0.7)' : 'brightness(1)'
              }}
              onMouseEnter={() => handleCardHover(index)}
              onMouseLeave={handleCardLeave}
            >
              <CourseCard 
                title={classItem.title}
                tag={classItem.tag}
                author={classItem.author}
                date={classItem.date}
                time={classItem.time}
                startTime={classItem.startTime}
                status={classItem.status}
                classId={classItem.classId}
                description={classItem.description}
                learners={classItem.learners}
                level={classItem.level}
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