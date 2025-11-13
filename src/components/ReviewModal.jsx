import React, { useState, useEffect } from 'react'

export default function ReviewModal({ isOpen, onClose, classData, existingReview, onSubmit }) {
  const [ratings, setRatings] = useState({
    overallRating: 0,
    contentQuality: 0,
    teachingStyle: 0,
    engagement: 0
  })
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [hoveredRating, setHoveredRating] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Load existing review data when modal opens
  useEffect(() => {
    if (isOpen && existingReview) {
      setRatings({
        overallRating: existingReview.overallRating || 0,
        contentQuality: existingReview.contentQuality || 0,
        teachingStyle: existingReview.teachingStyle || 0,
        engagement: existingReview.engagement || 0
      });
      setComment(existingReview.comment || '');
      setWouldRecommend(existingReview.wouldRecommend !== undefined ? existingReview.wouldRecommend : true);
    } else if (isOpen && !existingReview) {
      // Reset for new review
      setRatings({
        overallRating: 0,
        contentQuality: 0,
        teachingStyle: 0,
        engagement: 0
      });
      setComment('');
      setWouldRecommend(true);
    }
  }, [isOpen, existingReview]);

  if (!isOpen) return null

  const handleRatingClick = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  const handleRatingHover = (category, value) => {
    setHoveredRating(prev => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (ratings.overallRating === 0) {
      alert('Please provide an overall rating')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        classId: classData.classId || classData._id,
        ...ratings,
        comment,
        wouldRecommend
      })
      // Reset form
      setRatings({ overallRating: 0, contentQuality: 0, teachingStyle: 0, engagement: 0 })
      setComment('')
      setWouldRecommend(true)
      onClose()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ category, label, value }) => {
    const displayValue = hoveredRating[category] || value
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label} {category === 'overallRating' && <span className="text-red-400">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(category, star)}
              onMouseEnter={() => handleRatingHover(category, star)}
              onMouseLeave={() => handleRatingHover(category, 0)}
              className="transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= displayValue
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600 stroke-current fill-none'
                }`}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-400">
            {displayValue > 0 ? `${displayValue}/5` : 'Not rated'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {existingReview ? 'Edit Your Review' : 'Rate Your Experience'}
              </h2>
              <p className="text-blue-100 text-sm">
                {classData?.title || 'Class Review'}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                Instructor: {classData?.userId?.name || classData?.instructor || 'Expert'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <StarRating
            category="overallRating"
            label="Overall Rating"
            value={ratings.overallRating}
          />

          {/* Detailed Ratings */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Ratings (Optional)</h3>
            
            <StarRating
              category="contentQuality"
              label="Content Quality"
              value={ratings.contentQuality}
            />
            
            <StarRating
              category="teachingStyle"
              label="Teaching Style"
              value={ratings.teachingStyle}
            />
            
            <StarRating
              category="engagement"
              label="Engagement & Interaction"
              value={ratings.engagement}
            />
          </div>

          {/* Written Review */}
          <div className="border-t border-slate-700 pt-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Share Your Experience (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              maxLength="1000"
              placeholder="Tell us what you liked or what could be improved..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Recommendation */}
          <div className="border-t border-slate-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                I would recommend this class to others
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || ratings.overallRating === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:shadow-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {existingReview ? 'Updating...' : 'Submitting...'}
                </span>
              ) : (
                existingReview ? 'Update Review' : 'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
