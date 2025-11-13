const Review = require('../models/Review');
const Class = require('../models/Class');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Submit a review for a class/expert
 */
exports.createReview = async (req, res) => {
  try {
    const { classId, overallRating, contentQuality, teachingStyle, engagement, comment, wouldRecommend } = req.body;
    const studentId = req.user.sub;

    // Validate required fields
    if (!classId || !overallRating) {
      return res.status(400).json({ error: 'Class ID and overall rating are required' });
    }

    // Check if class exists and is completed
    const classData = await Class.findById(classId).populate('userId', '_id');
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed classes' });
    }

    // Verify student attended the class
    const attended = classData.studentsJoined?.some(
      id => id.toString() === studentId.toString()
    );

    if (!attended) {
      return res.status(403).json({ error: 'Only students who attended can submit reviews' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ classId, studentId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this class' });
    }

    // Create review
    const review = new Review({
      classId,
      expertId: classData.userId._id,
      studentId,
      overallRating,
      contentQuality: contentQuality || overallRating,
      teachingStyle: teachingStyle || overallRating,
      engagement: engagement || overallRating,
      comment: comment || '',
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      verified: attended
    });

    await review.save();

    // Update expert's average rating
    await updateExpertRating(classData.userId._id);

    res.status(201).json({ 
      message: 'Review submitted successfully', 
      review 
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

/**
 * Get reviews for an expert
 */
exports.getExpertReviews = async (req, res) => {
  try {
    const { expertId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const reviews = await Review.find({ expertId })
      .populate('studentId', 'name photoUrl')
      .populate('classId', 'title date')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReviews = await Review.countDocuments({ expertId });

    // Calculate statistics
    let statistics = {
      averageRating: 0,
      averageContentRating: 0,
      averageTeachingRating: 0,
      averageEngagementRating: 0,
      totalReviews: 0,
      recommendCount: 0,
      recommendationRate: 0
    };

    if (totalReviews > 0) {
      const stats = await Review.aggregate([
        { $match: { expertId: new mongoose.Types.ObjectId(expertId) } },
        {
          $group: {
            _id: null,
            averageOverall: { $avg: '$overallRating' },
            averageContent: { $avg: '$contentQuality' },
            averageTeaching: { $avg: '$teachingStyle' },
            averageEngagement: { $avg: '$engagement' },
            totalReviews: { $sum: 1 },
            recommendCount: { 
              $sum: { $cond: ['$wouldRecommend', 1, 0] } 
            }
          }
        }
      ]);

      if (stats.length > 0) {
        statistics = {
          averageRating: parseFloat(stats[0].averageOverall?.toFixed(2)) || 0,
          averageContentRating: parseFloat(stats[0].averageContent?.toFixed(2)) || 0,
          averageTeachingRating: parseFloat(stats[0].averageTeaching?.toFixed(2)) || 0,
          averageEngagementRating: parseFloat(stats[0].averageEngagement?.toFixed(2)) || 0,
          totalReviews: stats[0].totalReviews || 0,
          recommendCount: stats[0].recommendCount || 0,
          recommendationRate: stats[0].totalReviews > 0 
            ? parseFloat(((stats[0].recommendCount / stats[0].totalReviews) * 100).toFixed(1))
            : 0
        };
      }
    }

    res.json({ 
      reviews, 
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalReviews,
        hasMore: (parseInt(page) * parseInt(limit)) < totalReviews
      },
      statistics
    });
  } catch (err) {
    console.error('Error fetching expert reviews:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

/**
 * Get reviews for a specific class
 */
exports.getClassReviews = async (req, res) => {
  try {
    const { classId } = req.params;

    const reviews = await Review.find({ classId })
      .populate('studentId', 'name photoUrl')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    // Calculate detailed class statistics
    let statistics = {
      averageRating: 0,
      averageContentRating: 0,
      averageTeachingRating: 0,
      averageEngagementRating: 0,
      totalReviews: 0,
      recommendCount: 0,
      recommendationRate: 0
    };

    if (totalReviews > 0) {
      const stats = await Review.aggregate([
        { $match: { classId: new mongoose.Types.ObjectId(classId) } },
        {
          $group: {
            _id: null,
            averageOverall: { $avg: '$overallRating' },
            averageContent: { $avg: '$contentQuality' },
            averageTeaching: { $avg: '$teachingStyle' },
            averageEngagement: { $avg: '$engagement' },
            totalReviews: { $sum: 1 },
            recommendCount: { 
              $sum: { $cond: ['$wouldRecommend', 1, 0] } 
            }
          }
        }
      ]);

      if (stats.length > 0) {
        statistics = {
          averageRating: parseFloat(stats[0].averageOverall?.toFixed(2)) || 0,
          averageContentRating: parseFloat(stats[0].averageContent?.toFixed(2)) || 0,
          averageTeachingRating: parseFloat(stats[0].averageTeaching?.toFixed(2)) || 0,
          averageEngagementRating: parseFloat(stats[0].averageEngagement?.toFixed(2)) || 0,
          totalReviews: stats[0].totalReviews || 0,
          recommendCount: stats[0].recommendCount || 0,
          recommendationRate: stats[0].totalReviews > 0 
            ? parseFloat(((stats[0].recommendCount / stats[0].totalReviews) * 100).toFixed(1))
            : 0
        };
      }
    }

    res.json({ 
      reviews, 
      statistics
    });
  } catch (err) {
    console.error('Error fetching class reviews:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

/**
 * Check if student can review a class
 */
exports.canReviewClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.sub;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if completed
    if (classData.status !== 'completed') {
      return res.json({ canReview: false, reason: 'Class not completed yet' });
    }

    // Check if attended
    const attended = classData.studentsJoined?.some(
      id => id.toString() === studentId.toString()
    );

    if (!attended) {
      return res.json({ canReview: false, reason: 'You did not attend this class' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ classId, studentId });
    if (existingReview) {
      return res.json({ canReview: false, reason: 'You have already reviewed this class', review: existingReview });
    }

    res.json({ canReview: true });
  } catch (err) {
    console.error('Error checking review eligibility:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update expert's average rating (helper function)
 */
async function updateExpertRating(expertId) {
  try {
    console.log('🔄 Updating rating for expert:', expertId);
    
    const stats = await Review.aggregate([
      { $match: { expertId: new mongoose.Types.ObjectId(expertId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Rating stats:', stats);

    if (stats.length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        expertId, 
        {
          averageRating: parseFloat(stats[0].averageRating.toFixed(2)),
          totalReviews: stats[0].totalReviews
        },
        { new: true }
      );
      console.log('✅ Updated user rating:', {
        id: updatedUser._id,
        averageRating: updatedUser.averageRating,
        totalReviews: updatedUser.totalReviews
      });
    } else {
      console.log('⚠️ No reviews found for expert');
    }
  } catch (err) {
    console.error('❌ Error updating expert rating:', err);
  }
}

/**
 * Update an existing review
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.sub;
    const { overallRating, contentQuality, teachingStyle, engagement, comment, wouldRecommend } = req.body;

    const review = await Review.findOne({ _id: reviewId, studentId });
    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    // Update fields
    if (overallRating) review.overallRating = overallRating;
    if (contentQuality) review.contentQuality = contentQuality;
    if (teachingStyle) review.teachingStyle = teachingStyle;
    if (engagement) review.engagement = engagement;
    if (comment !== undefined) review.comment = comment;
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;

    await review.save();

    // Update expert's average rating
    await updateExpertRating(review.expertId);

    res.json({ message: 'Review updated successfully', review });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.sub;

    const review = await Review.findOneAndDelete({ _id: reviewId, studentId });
    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    // Update expert's average rating
    await updateExpertRating(review.expertId);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
