const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Class reference
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  
  // Expert being reviewed
  expertId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Student who submitted the review
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Ratings (1-5 scale)
  overallRating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  
  contentQuality: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  
  teachingStyle: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  
  engagement: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  
  // Written review
  comment: { 
    type: String, 
    trim: true,
    maxLength: 1000
  },
  
  // Helpful/Would recommend
  wouldRecommend: { 
    type: Boolean, 
    default: true 
  },
  
  // Verification that student attended
  verified: { 
    type: Boolean, 
    default: false 
  }
  
}, { timestamps: true });

// Compound index to prevent duplicate reviews
reviewSchema.index({ classId: 1, studentId: 1 }, { unique: true });

// Index for fetching expert reviews
reviewSchema.index({ expertId: 1, createdAt: -1 });

// Virtual for average of all ratings
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = [this.contentQuality, this.teachingStyle, this.engagement].filter(r => r);
  if (ratings.length === 0) return this.overallRating;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

module.exports = mongoose.model('Review', reviewSchema);
