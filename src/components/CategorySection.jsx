import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

// Icon mapping for different categories
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('frontend') || name.includes('front-end')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v6h-2v-6zm0-4h2v2h-2V7z"/>
      </svg>
    );
  } else if (name.includes('backend') || name.includes('back-end')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
      </svg>
    );
  } else if (name.includes('full stack') || name.includes('fullstack')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 19V5h7v14H4zm16 0h-7V5h7v14z"/>
      </svg>
    );
  } else if (name.includes('ui') || name.includes('ux') || name.includes('design')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    );
  } else if (name.includes('data') || name.includes('analytics')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
    );
  } else if (name.includes('mobile') || name.includes('android') || name.includes('ios')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
      </svg>
    );
  } else if (name.includes('devops') || name.includes('cloud')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    );
  } else if (name.includes('ai') || name.includes('ml') || name.includes('machine learning')) {
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm7.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM8 15h8v2H8v-2z"/>
      </svg>
    );
  }
  
  // Default icon
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v6h-2v-6zm0-4h2v2h-2V7z"/>
    </svg>
  );
};

// Color mapping for different categories
const getCategoryColor = (categoryName, index) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('frontend') || name.includes('front-end')) return 'from-purple-400 to-purple-600';
  if (name.includes('backend') || name.includes('back-end')) return 'from-blue-400 to-blue-600';
  if (name.includes('full stack') || name.includes('fullstack')) return 'from-green-400 to-green-600';
  if (name.includes('ui') || name.includes('ux') || name.includes('design')) return 'from-pink-400 to-pink-600';
  if (name.includes('data') || name.includes('analytics')) return 'from-orange-400 to-orange-600';
  if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return 'from-indigo-400 to-indigo-600';
  if (name.includes('devops') || name.includes('cloud')) return 'from-teal-400 to-teal-600';
  if (name.includes('ai') || name.includes('ml') || name.includes('machine learning')) return 'from-red-400 to-red-600';
  
  // Fallback colors based on index
  const colors = [
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-orange-400 to-orange-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-red-400 to-red-600'
  ];
  
  return colors[index % colors.length];
};

export default function CategorySection({ onCategoryClick, selectedCategory, onClearCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data.categories || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Display logic for responsive category showing
  const getDisplayCategories = () => {
    if (showAll) return categories;
    // Show fewer on mobile, more on larger screens
    const maxVisible = window.innerWidth < 640 ? 6 : window.innerWidth < 1024 ? 8 : 10;
    return categories.slice(0, maxVisible);
  };

  if (loading) {
    return (
      <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 
                          bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl 
                          p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl hover:shadow-2xl 
                          transition-shadow duration-300 mx-3 sm:mx-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-200">
            Explore Categories
          </h3>
          <div className="w-16 h-4 bg-slate-600/50 rounded animate-pulse"></div>
        </div>
        
        {/* Enhanced loading state */}
        <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 
                        scrollbar-hide -mx-1 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-fit">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                             rounded-full bg-slate-600/50 animate-pulse 
                             shadow-sm"></div>
              <div className="w-12 xs:w-14 sm:w-16 h-2.5 sm:h-3 bg-slate-600/50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 
                          bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl 
                          p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl mx-3 sm:mx-0">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-3 text-gray-200">
          Explore Categories
        </h3>
        
        {/* Enhanced error state */}
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="bg-red-900/30 border border-red-700/50 rounded-full p-3 sm:p-4 mb-4 mx-auto w-fit">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="text-sm sm:text-base text-red-400 font-medium mb-2">
              Error loading categories
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              {error}
            </p>
            <button 
              onClick={fetchCategories}
              className="mt-3 px-4 py-2 bg-red-600/80 text-white text-sm rounded-lg 
                         hover:bg-red-600 transition-colors duration-300">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 
                          bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl 
                          p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl mx-3 sm:mx-0">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-3 text-gray-200">
          Explore Categories
        </h3>
        
        {/* Enhanced empty state */}
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="bg-slate-700/50 border border-slate-600/50 rounded-full p-3 sm:p-4 mb-4 mx-auto w-fit">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-300 font-medium">
              No categories available
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Categories will appear here once they are added
            </p>
          </div>
        </div>
      </section>
    );
  }
  const displayCategories = getDisplayCategories();

  return (
    <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 
                        bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl 
                        p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl hover:shadow-2xl 
                        transition-shadow duration-300 mx-3 sm:mx-0">
      
      {/* Enhanced responsive header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 
                         font-semibold text-gray-200">
            Explore Categories
          </h3>
          {selectedCategory && (
            <span className="text-xs sm:text-sm px-2 py-1 bg-blue-900/30 border border-blue-700/50 text-blue-300 
                           rounded-full font-medium">
              {selectedCategory.name} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Clear selection button */}
          {selectedCategory && onClearCategory && (
            <button
              onClick={onClearCategory}
              className="text-xs sm:text-sm font-semibold text-red-400 
                         hover:text-red-300 active:text-red-200
                         px-2 sm:px-3 py-1 rounded-lg hover:bg-red-900/30 
                         transition-all duration-300 touch-manipulation
                         flex items-center gap-1"
              title="Clear category selection"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span className="hidden xs:inline">Clear</span>
            </button>
          )}
          
          {/* Show/Hide button for mobile */}
          {categories.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs sm:text-sm font-semibold text-blue-400 
                         hover:text-blue-300 active:text-blue-200
                         px-2 sm:px-3 py-1 rounded-lg hover:bg-blue-900/30 
                         transition-all duration-300 touch-manipulation
                         flex items-center gap-1"
            >
              <span className="hidden xs:inline">
                {showAll ? 'Show Less' : `+${categories.length - displayCategories.length} More`}
              </span>
              <span className="xs:hidden">
                {showAll ? '−' : `+${categories.length - displayCategories.length}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced responsive category grid/scroll */}
      <div className={`
        ${showAll 
          ? 'grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4 md:gap-5' 
          : 'flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide -mx-1 px-1'
        }
        ${showAll ? 'pb-0' : 'pb-2'}
      `}>
        
        {displayCategories.map((category, index) => {
          const icon = getCategoryIcon(category.name);
          const color = getCategoryColor(category.name, index);
          const isSelected = selectedCategory && selectedCategory._id === category._id;
          
          return (
            <div
              key={category._id}
              onClick={() => onCategoryClick && onCategoryClick(category)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer 
                         group min-w-fit touch-manipulation animate-fadeInUp
                         rounded-lg p-1 sm:p-2 transition-all duration-300
                         ${isSelected 
                           ? 'bg-purple-100 shadow-md ring-2 ring-purple-300' 
                           : 'hover:bg-purple-50/50'}`}
            >
              {/* Enhanced responsive category icon */}
              <div className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18
                              rounded-full bg-gradient-to-br ${color} 
                              flex items-center justify-center text-white 
                              shadow-md hover:shadow-lg hover:shadow-purple-500/25
                              transition-all duration-300 
                              group-hover:scale-110 group-hover:-translate-y-1
                              group-active:scale-95 
                              ring-2 ring-transparent group-hover:ring-white/30
                              ${isSelected ? 'scale-110 -translate-y-1 ring-white/50' : ''}`}>
                <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 
                               transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </div>
              </div>
              
              {/* Enhanced responsive category name */}
              <span className={`text-xs sm:text-sm font-medium 
                               transition-colors duration-300 
                               whitespace-nowrap text-center leading-tight
                               max-w-[4rem] xs:max-w-[5rem] sm:max-w-[6rem] 
                               truncate px-1
                               ${isSelected 
                                 ? 'text-purple-700 font-semibold' 
                                 : 'text-gray-700 group-hover:text-purple-600 group-active:text-purple-700'}`}>
                {category.name}
              </span>
              
              {/* Hover effect indicator */}
              <div className={`h-0.5 bg-purple-600 rounded-full transition-all duration-300
                              ${isSelected ? 'w-8' : 'w-0 group-hover:w-8'}`}></div>
            </div>
          );
        })}
        
        {/* Show all categories button in scroll mode */}
        {!showAll && categories.length > displayCategories.length && (
          <div 
            onClick={() => setShowAll(true)}
            className="flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer 
                       group min-w-fit touch-manipulation
                       hover:bg-purple-50/50 rounded-lg p-1 sm:p-2 
                       transition-all duration-300"
          >
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18
                            rounded-full bg-gradient-to-br from-gray-300 to-gray-500
                            hover:from-purple-400 hover:to-purple-600
                            flex items-center justify-center text-white 
                            shadow-md hover:shadow-lg hover:shadow-purple-500/25
                            transition-all duration-300 
                            group-hover:scale-110 group-hover:-translate-y-1
                            ring-2 ring-transparent group-hover:ring-white/30">
              <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 
                             group-hover:text-purple-600
                             transition-colors duration-300 
                             whitespace-nowrap text-center">
              More
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
