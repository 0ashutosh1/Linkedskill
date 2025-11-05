import React, { useState, useRef, useEffect } from 'react'
import CourseCard from './CourseCard'

export default function LearningPathsSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [visibleCards, setVisibleCards] = useState(4)
  const [maxOffset, setMaxOffset] = useState(0)
  const containerRef = useRef(null)

  // Sample learning paths data - LinkedIn Learning style
  const learningPaths = [
    {
      title: "Career Essentials in Generative AI by Microsoft and LinkedIn",
      tag: "Learning Path",
      author: "Microsoft & LinkedIn",
      date: "Jun 20, 2023",
      time: "6h 3m",
      description: "Generative AI is reshaping industries by transforming how work gets done. This learning path puts you at the forefront of this creative revolution, covering content...",
      learners: "48,547",
      level: "Beginner",
      pathDuration: "6h 3m left"
    },
    {
      title: "Master Microsoft Excel",
      tag: "Learning Path", 
      author: "LinkedIn Learning",
      date: "Sep 1, 2017",
      time: "13h",
      description: "Employers around the world cite Microsoft Excel as one of the most sought-after skills for any new hire. This learning path helps you become an Excel power user...",
      learners: "125,890",
      level: "Intermediate",
      pathDuration: "13h 48m left"
    },
    {
      title: "Become a Data Analyst",
      tag: "Learning Path",
      author: "LinkedIn Learning", 
      date: "Mar 15, 2022",
      time: "49h",
      description: "Discover the skills needed to thrive in a business analyst role. Explore foundational business analysis concepts and understand key processes...",
      learners: "89,234",
      level: "Beginner",
      pathDuration: "49h 15m left"
    },
    {
      title: "Getting Started as a Product Manager",
      tag: "Learning Path",
      author: "LinkedIn Learning",
      date: "Aug 12, 2021", 
      time: "11h",
      description: "Product management is one of the fastest-growing career paths in tech. This learning path covers the fundamentals of product strategy...",
      learners: "67,123",
      level: "Beginner",
      pathDuration: "11h 25m left"
    },
    {
      title: "Career Essentials in Business Analysis by Microsoft and LinkedIn",
      tag: "Learning Path",
      author: "Microsoft & LinkedIn",
      date: "Aug 1, 2022",
      time: "11h 53m",
      description: "Discover the skills needed to thrive in a business analyst role. Explore foundational business analysis concepts and understand key processes...",
      learners: "156,789",
      level: "Intermediate", 
      pathDuration: "11h 53m left"
    },
    {
      title: "Advance Your Skills in Graphic Design",
      tag: "Learning Path",
      author: "LinkedIn Learning",
      date: "May 10, 2023",
      time: "14h",
      description: "Take your graphic design skills to the next level with advanced techniques in typography, layout, color theory, and digital design tools...",
      learners: "42,156",
      level: "Advanced",
      pathDuration: "14h 22m left"
    }
  ]

  // Calculate visible cards based on screen size
  useEffect(() => {
    const calculateVisibleCards = () => {
      const width = window.innerWidth
      if (width >= 1536) setVisibleCards(4.5) // 2xl - show partial card
      else if (width >= 1280) setVisibleCards(3.5) // xl
      else if (width >= 1024) setVisibleCards(2.5) // lg  
      else if (width >= 768) setVisibleCards(2) // md
      else setVisibleCards(1.2) // sm and below
    }

    calculateVisibleCards()
    window.addEventListener('resize', calculateVisibleCards)
    return () => window.removeEventListener('resize', calculateVisibleCards)
  }, [])

  // Calculate max offset
  useEffect(() => {
    if (learningPaths && learningPaths.length > 0) {
      setMaxOffset(Math.max(0, learningPaths.length - Math.floor(visibleCards)))
    }
  }, [learningPaths, visibleCards])

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
    if (actualIndex < 0 || actualIndex >= Math.ceil(visibleCards)) return 'translateX(0)'
    
    if (index === hoveredIndex) {
      // Hovered card: scale up and move slightly up
      return 'translateX(0) translateY(-12px) scale(1.03)'
    } else if (actualIndex < hoveredActualIndex) {
      // Cards to the left: shift left
      return 'translateX(-24px) scale(0.98)'
    } else if (actualIndex > hoveredActualIndex) {
      // Cards to the right: shift right  
      return 'translateX(24px) scale(0.98)'
    }
    
    return 'translateX(0)'
  }

  const getCardZIndex = (index) => {
    if (hoveredIndex === null) return 10
    return index === hoveredIndex ? 50 : 5
  }

  const getCardOpacity = (index) => {
    if (hoveredIndex === null) return 1
    return index === hoveredIndex ? 1 : 0.75
  }

  return (
    <section className="mb-8 md:mb-12 relative">
      {/* Header with LinkedIn Learning style */}
      <div className="flex items-center justify-between mb-6 px-3 sm:px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Learning Paths
        </h2>
        
        {/* Navigation and Show All */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation arrows */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-2.5 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95
                         ${canScrollLeft 
                           ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 hover:shadow-md' 
                           : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
              title="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-2.5 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95
                         ${canScrollRight 
                           ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 hover:shadow-md' 
                           : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
              title="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          {/* Show All button - LinkedIn style */}
          <button 
            className="text-sm md:text-base font-semibold text-blue-600 hover:text-blue-700 active:text-blue-800
                       flex items-center gap-1 hover:gap-2 transition-all duration-300 hover:scale-105 active:scale-95
                       px-3 py-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100
                       flex-shrink-0 touch-manipulation border border-transparent hover:border-blue-200"
          >
            <span>Show All</span>
            <svg className="w-4 h-4 transition-transform duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel container */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden px-3 sm:px-4 md:px-0"
        style={{ 
          height: hoveredIndex !== null ? '480px' : '380px',
          transition: 'height 0.4s ease-in-out'
        }}
      >
        {/* Cards container */}
        <div 
          className="flex transition-transform duration-500 ease-out gap-4 md:gap-6"
          style={{ 
            transform: `translateX(-${currentOffset * (100 / visibleCards)}%)`,
            width: `${(learningPaths.length / visibleCards) * 100}%`
          }}
        >
          {learningPaths.map((path, index) => (
            <div
              key={index}
              className="relative transition-all duration-500 ease-out"
              style={{ 
                width: `${100 / learningPaths.length}%`,
                flexShrink: 0,
                transform: getCardTransform(index),
                zIndex: getCardZIndex(index),
                opacity: getCardOpacity(index),
                filter: hoveredIndex !== null && index !== hoveredIndex ? 'brightness(0.85) blur(0.5px)' : 'brightness(1) blur(0px)'
              }}
              onMouseEnter={() => handleCardHover(index)}
              onMouseLeave={handleCardLeave}
            >
              <CourseCard 
                title={path.title}
                tag={path.tag}
                author={path.author}
                date={path.date}
                time={path.time}
                description={path.description}
                learners={path.learners}
                level={path.level}
                image={path.image}
                attendees={path.attendees}
                onSelect={(course) => console.log('Selected learning path:', course)}
                onJoin={(course) => console.log('Joined learning path:', course)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicators */}
      <div className="flex justify-center mt-6 md:hidden">
        <div className="flex gap-1.5">
          {Array.from({ length: Math.ceil(learningPaths.length / Math.floor(visibleCards)) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentOffset(Math.min(index * Math.floor(visibleCards), maxOffset))}
              className={`h-2 rounded-full transition-all duration-300
                         ${Math.floor(currentOffset / Math.floor(visibleCards)) === index 
                           ? 'bg-blue-600 w-8' 
                           : 'bg-gray-300 hover:bg-blue-400 w-2'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}