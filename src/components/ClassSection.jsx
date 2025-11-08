import React from 'react'
import CourseCard from './CourseCard'

export default function ClassSection({ title, classes, onSeeAll, onJoin, onSelect }) {
  return (
    <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10" style={{ overflow: 'visible' }}>
      {/* Enhanced responsive header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6
                      px-3 sm:px-4 md:px-0">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 
                       font-semibold text-white truncate flex-1 mr-4">
          {title}
        </h3>
        <button 
          onClick={onSeeAll}
          className="text-xs sm:text-sm md:text-base font-semibold 
                     text-purple-400 hover:text-purple-300 active:text-purple-200
                     flex items-center gap-1 hover:gap-2 
                     transition-all duration-300 hover:scale-105 active:scale-95
                     px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg
                     hover:bg-slate-700/50 active:bg-slate-600/50
                     flex-shrink-0 touch-manipulation"
        >
          <span className="hidden xs:inline">See All</span>
          <span className="xs:hidden">All</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 
                          group-hover:translate-x-1" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Enhanced responsive grid with popup support */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
                      gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8
                      px-3 sm:px-4 md:px-0 popup-container" 
           style={{ overflow: 'visible' }}>
        {classes && classes.length > 0 ? (
          classes.map((classItem, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 100}ms`, overflow: 'visible' }}
              className="animate-fadeInUp relative"
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
          ))
        ) : (
          /* Enhanced empty state */
          <div className="col-span-full flex flex-col items-center justify-center 
                          py-8 sm:py-12 md:py-16 lg:py-20 px-4 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 
                            rounded-full p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 
                             text-purple-600 opacity-60" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">
              No Classes Available
            </h4>
            <p className="text-sm sm:text-base text-gray-300 max-w-md">
              Classes for this section will appear here once they become available.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
