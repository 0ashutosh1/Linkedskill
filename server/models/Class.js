const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true }, // Exact start time for the class
  duration: { type: Number, default: 60 }, // Duration in minutes
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: false },
  interestedCount: { type: Number, default: 0 },
  totalAttended: { type: Number, default: 0 },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  cancellationReason: { 
    type: String, 
    enum: ['instructor_no_show', 'instructor_cancelled', 'other'],
    required: false
  },
  liveUrl: { type: String, default: '' }, // URL for live class (e.g., Zoom, Meet, etc.)
  meetingId: { type: String, default: null }, // VideoSDK meeting room ID
  
  // Live class analytics
  actualStartTime: { type: Date, default: null }, // When class actually went live
  actualEndTime: { type: Date, default: null }, // When class actually ended
  actualDuration: { type: Number, default: 0 }, // Actual duration in minutes
  studentsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Students who actually joined
  totalStudentsJoined: { type: Number, default: 0 }, // Count of unique students who joined
  
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
