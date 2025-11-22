const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');

/**
 * Define roadmap-related jobs for Agenda
 * @param {Agenda} agenda - Agenda instance
 */
function defineRoadmapJobs(agenda) {
  /**
   * Job: send_daily_roadmap_reminder
   * Sends daily reminders to users with active roadmaps
   * Runs every day at 9 AM
   */
  agenda.define(
    'send_daily_roadmap_reminder',
    async (job) => {
      try {
        console.log('📅 Running daily roadmap reminders...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find all active roadmaps where user hasn't completed today's tasks
        const activeRoadmaps = await Roadmap.find({ 
          status: 'active',
          notificationsEnabled: true 
        });
        
        for (const roadmap of activeRoadmaps) {
          // Calculate current week based on start date
          const weeksPassed = Math.floor((today - new Date(roadmap.startDate)) / (7 * 24 * 60 * 60 * 1000)) + 1;
          
          if (weeksPassed > roadmap.duration) {
            // Roadmap expired but not completed
            roadmap.status = 'abandoned';
            await roadmap.save();
            continue;
          }
          
          const currentWeek = roadmap.weeks.find(w => w.weekNumber === weeksPassed);
          
          if (!currentWeek) continue;
          
          const incompleteTasks = currentWeek.tasks.filter(t => !t.completed);
          
          if (incompleteTasks.length > 0) {
            // Check if last activity was not today
            const lastActivity = roadmap.lastActivityDate ? new Date(roadmap.lastActivityDate) : null;
            const isToday = lastActivity && lastActivity.toDateString() === today.toDateString();
            
            if (!isToday) {
              // Send reminder notification
              const notification = new Notification({
                type: 'roadmap_reminder',
                message: `⏰ Don't forget! You have ${incompleteTasks.length} task${incompleteTasks.length > 1 ? 's' : ''} pending this week for your ${roadmap.careerGoal} roadmap. Keep your streak alive!`,
                receiverId: roadmap.userId,
                senderId: roadmap.userId, // Self-notification
                priority: 'high'
              });
              
              await notification.save();
              roadmap.lastNotificationSent = new Date();
              await roadmap.save();
              
              console.log(`📬 Sent reminder to user ${roadmap.userId}`);
            }
          }
        }
        
        console.log('✅ Daily roadmap reminders completed');
      } catch (err) {
        console.error('❌ Error in send_daily_roadmap_reminder job:', err);
        throw err;
      }
    },
    {
      priority: 'normal',
      concurrency: 5,
      lockLifetime: 10 * 60 * 1000
    }
  );
  
  /**
   * Job: check_roadmap_deadlines
   * Checks for roadmaps approaching deadlines
   * Runs every day at 8 PM
   */
  agenda.define(
    'check_roadmap_deadlines',
    async (job) => {
      try {
        console.log('⏱️ Checking roadmap deadlines...');
        
        const today = new Date();
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        // Find roadmaps ending within 3 days
        const expiringRoadmaps = await Roadmap.find({
          status: 'active',
          endDate: { 
            $gte: today, 
            $lte: threeDaysFromNow 
          }
        });
        
        for (const roadmap of expiringRoadmaps) {
          const daysLeft = Math.ceil((new Date(roadmap.endDate) - today) / (24 * 60 * 60 * 1000));
          
          const notification = new Notification({
            type: 'roadmap_deadline',
            message: `⚠️ Your ${roadmap.careerGoal} roadmap ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}! Current progress: ${roadmap.overallProgress}%. Push yourself to finish!`,
            receiverId: roadmap.userId,
            senderId: roadmap.userId, // Self-notification
            priority: 'high'
          });
          
          await notification.save();
          console.log(`⏰ Sent deadline warning to user ${roadmap.userId}`);
        }
        
        console.log('✅ Roadmap deadline check completed');
      } catch (err) {
        console.error('❌ Error in check_roadmap_deadlines job:', err);
        throw err;
      }
    },
    {
      priority: 'normal',
      concurrency: 5,
      lockLifetime: 10 * 60 * 1000
    }
  );
}

/**
 * Schedule recurring roadmap jobs
 */
async function scheduleRoadmapJobs(agenda) {
  try {
    // Daily reminder at 9 AM
    await agenda.every('0 9 * * *', 'send_daily_roadmap_reminder');
    console.log('✅ Scheduled daily roadmap reminders (9 AM daily)');
    
    // Deadline check at 8 PM
    await agenda.every('0 20 * * *', 'check_roadmap_deadlines');
    console.log('✅ Scheduled roadmap deadline checks (8 PM daily)');
  } catch (err) {
    console.error('❌ Error scheduling roadmap jobs:', err);
  }
}

module.exports = {
  defineRoadmapJobs,
  scheduleRoadmapJobs
};
