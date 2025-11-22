const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tasks: [{
    taskId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedHours: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  }],
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerGoal: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in weeks
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Progress tracking
  weeks: [weekSchema],
  currentWeek: { type: Number, default: 1 },
  overallProgress: { type: Number, default: 0 }, // percentage
  
  // Points and gamification
  totalPoints: { type: Number, default: 0 },
  pointsThisWeek: { type: Number, default: 0 },
  streak: { type: Number, default: 0 }, // consecutive days of completion
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: null },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'completed', 'paused', 'abandoned'], 
    default: 'active' 
  },
  
  // AI generation metadata
  generatedBy: { type: String, default: 'AI' },
  generatedAt: { type: Date, default: Date.now },
  
  // Notifications
  notificationsEnabled: { type: Boolean, default: true },
  lastNotificationSent: { type: Date, default: null }
}, { timestamps: true });

// Calculate overall progress
roadmapSchema.methods.calculateProgress = function() {
  if (this.weeks.length === 0) return 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  this.weeks.forEach(week => {
    totalTasks += week.tasks.length;
    completedTasks += week.tasks.filter(task => task.completed).length;
  });
  
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

// Update streak
roadmapSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastActivityDate) {
    this.streak = 1;
    this.lastActivityDate = today;
  } else {
    const lastActivity = new Date(this.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.streak += 1;
      if (this.streak > this.longestStreak) {
        this.longestStreak = this.streak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.streak = 1;
    }
    // If daysDiff === 0, same day, don't change streak
    
    this.lastActivityDate = today;
  }
};

module.exports = mongoose.model('Roadmap', roadmapSchema);
