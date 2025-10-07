import React from 'react'

const categories = [
  {
    id: 1,
    name: 'Frontend',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v6h-2v-6zm0-4h2v2h-2V7z"/>
      </svg>
    ),
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 2,
    name: 'Backend',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
      </svg>
    ),
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 3,
    name: 'Full Stack',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 19V5h7v14H4zm16 0h-7V5h7v14z"/>
      </svg>
    ),
    color: 'from-green-400 to-green-600'
  },
  {
    id: 4,
    name: 'UI/UX',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    color: 'from-pink-400 to-pink-600'
  },
  {
    id: 5,
    name: 'Data Science',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
    ),
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 6,
    name: 'Mobile Dev',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
      </svg>
    ),
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 7,
    name: 'DevOps',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
    color: 'from-teal-400 to-teal-600'
  },
  {
    id: 8,
    name: 'AI/ML',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm7.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM8 15h8v2H8v-2z"/>
      </svg>
    ),
    color: 'from-red-400 to-red-600'
  }
]

export default function CategorySection({ onCategoryClick }) {
  return (
    <section className="mb-4 md:mb-6 bg-white rounded-xl p-3 md:p-4 shadow-sm">
      <h3 className="text-sm md:text-base font-semibold mb-3 text-gray-800">Explore Categories</h3>
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategoryClick && onCategoryClick(category)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group min-w-fit"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:-translate-y-1`}>
              <div className="w-5 h-5 md:w-6 md:h-6">{category.icon}</div>
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-purple-600 transition-colors whitespace-nowrap">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
