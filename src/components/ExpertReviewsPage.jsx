import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import StarRating from './StarRating';

export default function ExpertReviewsPage({ expertId, expertName, classId, className, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [expertId, classId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      let url;
      if (classId) {
        // Fetch class-specific reviews
        url = `${API_BASE_URL}/reviews/class/${classId}`;
      } else {
        // Fetch all expert reviews with pagination
        url = `${API_BASE_URL}/reviews/expert/${expertId}?page=${page}&limit=10`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (classId) {
          // For class-specific reviews, no pagination
          setReviews(data.reviews);
          setStats(data.statistics);
          setHasMore(false);
        } else {
          // For expert reviews, handle pagination
          setReviews(prev => page === 1 ? data.reviews : [...prev, ...data.reviews]);
          setStats(data.statistics);
          setHasMore(data.pagination.hasMore);
        }
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProgressBarColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-blue-500';
    if (rating >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {classId ? `Reviews for "${className}"` : `Reviews for ${expertName}`}
            </h1>
            {classId && (
              <p className="text-sm text-gray-600 mt-1">Class by {expertName}</p>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Overall Rating */}
              <div className="text-center md:text-left">
                <div className="text-6xl font-bold text-gray-800 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={stats.averageRating} size="lg" />
                <p className="text-gray-600 mt-2">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
                <p className="text-green-600 font-semibold mt-2">
                  {Math.round(stats.recommendationRate)}% would recommend
                </p>
              </div>

              {/* Right: Detailed Ratings */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">Detailed Ratings</h3>
                
                {/* Content Quality */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Content Quality</span>
                    <span className="font-semibold">{stats.averageContentRating.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(stats.averageContentRating)}`}
                      style={{ width: `${(stats.averageContentRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Teaching Style */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Teaching Style</span>
                    <span className="font-semibold">{stats.averageTeachingRating.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(stats.averageTeachingRating)}`}
                      style={{ width: `${(stats.averageTeachingRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Engagement */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Engagement & Interaction</span>
                    <span className="font-semibold">{stats.averageEngagementRating.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(stats.averageEngagementRating)}`}
                      style={{ width: `${(stats.averageEngagementRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Student Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-gray-600">No reviews yet</p>
              <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div 
                key={review._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {review.studentId?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.studentId?.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  {review.wouldRecommend && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Recommends
                    </span>
                  )}
                </div>

                {/* Class Name */}
                <div className="mb-3 text-sm text-gray-600">
                  Class: <span className="font-semibold text-gray-800">{review.classId?.title || 'Unknown'}</span>
                </div>

                {/* Overall Rating */}
                <div className="mb-3">
                  <StarRating 
                    rating={review.overallRating} 
                    size="md" 
                    showCount={false}
                  />
                </div>

                {/* Detailed Ratings */}
                {(review.contentQuality || review.teachingStyle || review.engagement) && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    {review.contentQuality && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Content</p>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{review.contentQuality}</span>
                        </div>
                      </div>
                    )}
                    {review.teachingStyle && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Teaching</p>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{review.teachingStyle}</span>
                        </div>
                      </div>
                    )}
                    {review.engagement && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Engagement</p>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{review.engagement}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {/* Verified Badge */}
                {review.verified && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Review
                  </div>
                )}
              </div>
            ))
          )}

          {/* Load More Button - Only for expert reviews, not class-specific */}
          {!classId && hasMore && reviews.length > 0 && (
            <div className="text-center pt-6">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
