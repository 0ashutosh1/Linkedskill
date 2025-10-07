import React from 'react'
import CourseCard from './CourseCard'

export default function ClassSection({ title, classes, onSeeAll, onJoin, onSelect }) {
  return (
    <section className="mb-6 md:mb-8" style={{ overflow: 'visible' }}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-xl font-semibold text-gray-800">{title}</h3>
        <button 
          onClick={onSeeAll}
          className="text-xs md:text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:gap-2 transition-all duration-300"
        >
          See All
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" style={{ overflow: 'visible' }}>
        {classes.map((classItem, index) => (
          <CourseCard 
            key={index}
            title={classItem.title}
            tag={classItem.tag}
            author={classItem.author}
            date={classItem.date}
            time={classItem.time}
            description={classItem.description}
            learners={classItem.learners}
            level={classItem.level}
            onSelect={onSelect}
            onJoin={onJoin}
          />
        ))}
      </div>
    </section>
  )
}
