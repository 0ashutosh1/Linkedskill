import React from 'react'

export default function StarRating({ rating, totalReviews, size = 'md', showCount = true }) {
  const displayRating = rating || 0
  const fullStars = Math.floor(displayRating)
  const hasHalfStar = displayRating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className="flex items-center gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-yellow-400 fill-current`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <svg
          className={`${sizeClasses[size]} text-yellow-400`}
          viewBox="0 0 24 24"
        >
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half)"
            stroke="currentColor"
            strokeWidth="1"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-600 stroke-current fill-none`}
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}

      {/* Rating Number */}
      <span className={`${textSizes[size]} font-semibold text-yellow-400 ml-1`}>
        {displayRating.toFixed(1)}
      </span>

      {/* Review Count */}
      {showCount && totalReviews !== undefined && (
        <span className={`${textSizes[size]} text-gray-400 ml-1`}>
          ({totalReviews})
        </span>
      )}
    </div>
  )
}
