import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';

export default function ClassReviewsSummary({ expertId, classId, classData, onViewAll }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchReviewStats();
      checkReviewEligibility();
    }
  }, [expertId, classId]);

  const checkReviewEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/reviews/can-review/${classId}`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCanReview(data.canReview);
        setExistingReview(data.review || null);
      }
    } catch (err) {
      console.error('Error checking review eligibility:', err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      // Fetch class-specific reviews
      const response = await fetch(
        `${API_BASE_URL}/reviews/class/${classId}`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Calculate detailed statistics from reviews
        const reviews = data.reviews || [];
        const totalReviews = reviews.length;
        
        if (totalReviews > 0) {
          const avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews;
          const avgContent = reviews.reduce((sum, r) => sum + r.contentQuality, 0) / totalReviews;
          const avgTeaching = reviews.reduce((sum, r) => sum + r.teachingStyle, 0) / totalReviews;
          const avgEngagement = reviews.reduce((sum, r) => sum + r.engagement, 0) / totalReviews;
          const recommendCount = reviews.filter(r => r.wouldRecommend).length;
          
          setStats({
            averageRating: parseFloat(avgOverall.toFixed(2)),
            averageContentRating: parseFloat(avgContent.toFixed(2)),
            averageTeachingRating: parseFloat(avgTeaching.toFixed(2)),
            averageEngagementRating: parseFloat(avgEngagement.toFixed(2)),
            totalReviews,
            recommendationRate: parseFloat(((recommendCount / totalReviews) * 100).toFixed(1))
          });
        } else {
          setStats({ 
            averageRating: 0, 
            averageContentRating: 0,
            averageTeachingRating: 0,
            averageEngagementRating: 0,
            totalReviews: 0,
            recommendationRate: 0
          });
        }
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching review stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 animate-pulse">
        <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-slate-600 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !stats || stats.totalReviews === 0) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 text-center">
        <div className="text-gray-400 text-sm mb-2">
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          No reviews yet
        </div>
        <p className="text-xs text-gray-500">Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-700/40 to-slate-600/40 rounded-lg p-4 border border-slate-500/40">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          Student Reviews
        </h5>
        <span className="text-xs text-gray-400 bg-slate-800/50 px-2 py-1 rounded-full">
          {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl font-bold text-yellow-400">
          {stats.averageRating.toFixed(1)}
        </div>
        <div className="flex-1">
          <StarRating rating={stats.averageRating} size="sm" showCount={false} />
          <p className="text-xs text-green-400 mt-1">
            {Math.round(stats.recommendationRate)}% would recommend
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center bg-slate-800/50 rounded p-2">
          <div className="text-sm font-semibold text-blue-400">
            {stats.averageContentRating.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">Content</div>
        </div>
        <div className="text-center bg-slate-800/50 rounded p-2">
          <div className="text-sm font-semibold text-purple-400">
            {stats.averageTeachingRating.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">Teaching</div>
        </div>
        <div className="text-center bg-slate-800/50 rounded p-2">
          <div className="text-sm font-semibold text-pink-400">
            {stats.averageEngagementRating.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">Engagement</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Write/Edit Review Button - Only for students who attended */}
        {!checkingEligibility && (canReview || existingReview) && (
          <button
            onClick={() => setShowReviewModal(true)}
            className={`w-full ${
              existingReview 
                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border-blue-500/30' 
                : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 text-green-400 border-green-500/30'
            } px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 
                     hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {existingReview ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              )}
            </svg>
            <span>{existingReview ? 'Edit My Review' : 'Write a Review'}</span>
          </button>
        )}

        {/* View All Button */}
        {onViewAll && stats.totalReviews > 0 && (
          <button
            onClick={onViewAll}
            className="w-full bg-gradient-to-r from-yellow-600/20 to-amber-600/20 hover:from-yellow-600/30 hover:to-amber-600/30
                     text-yellow-400 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 
                     hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-yellow-500/30"
          >
            <span>View All Reviews</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          // Refresh stats after submitting/editing
          fetchReviewStats();
          checkReviewEligibility();
        }}
        classData={classData || { classId, _id: classId, title: 'Class' }}
        existingReview={existingReview}
        onSubmit={async (reviewData) => {
          try {
            const authToken = localStorage.getItem('authToken');
            const method = existingReview ? 'PUT' : 'POST';
            const url = existingReview 
              ? `${API_BASE_URL}/reviews/${existingReview._id}`
              : `${API_BASE_URL}/reviews`;

            const response = await fetch(url, {
              method,
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(reviewData)
            });

            if (response.ok) {
              const data = await response.json();
              console.log('✅ Review submitted successfully:', data);
              alert(existingReview ? 'Review updated successfully!' : 'Thank you for your feedback!');
              setShowReviewModal(false);
              // Refresh data
              fetchReviewStats();
              checkReviewEligibility();
            } else {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to submit review');
            }
          } catch (err) {
            console.error('Error submitting review:', err);
            throw err;
          }
        }}
      />
    </div>
  );
}
