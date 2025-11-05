const Class = require('../models/Class');
const Notification = require('../models/Notification');

/**
 * Define all class-related jobs for Agenda
 * @param {Agenda} agenda - Agenda instance
 */
function defineClassJobs(agenda) {
  /**
   * Job: class_go_live
   * Automatically sets a class status to 'live' at its scheduled start time
   * Sends notifications to all attendees
   */
  agenda.define(
    'class_go_live',
    async (job) => {
      const { classId } = job.attrs.data;

      try {
        const classData = await Class.findById(classId);

        if (!classData) {
          throw new Error(`Class not found: ${classId}`);
        }

        // Only process if still in 'scheduled' status
        if (classData.status !== 'scheduled') {
          console.log(`⏭️  Skipping job - Class ${classId} is already ${classData.status}`);
          return;
        }

        // Update class status to 'live'
        classData.status = 'live';
        await classData.save();
        console.log(`🔴 LIVE NOW: Class "${classData.title}" (${classId}) is now live`);

        // Send notifications to all attendees
        try {
          if (classData.attendees && classData.attendees.length > 0) {
            const notifications = classData.attendees.map((attendeeId) => ({
              type: 'class_started',
              message: `🔴 LIVE NOW: "${classData.title}" has started! Join now.`,
              senderId: classData.userId,
              receiverId: attendeeId,
              priority: 'high',
              createdAt: new Date()
            }));

            await Notification.insertMany(notifications);
            console.log(`📢 Sent notifications to ${notifications.length} attendees`);
          }
        } catch (notificationError) {
          console.error('⚠️  Error sending start notifications:', notificationError);
          // Don't fail the job if notifications fail
        }
      } catch (err) {
        console.error(`❌ Error in class_go_live job for ${classId}:`, err);
        throw err; // Re-throw to allow Agenda to retry
      }
    },
    {
      priority: 'high',
      concurrency: 10,
      lockLifetime: 5 * 60 * 1000, // 5 minutes (should be quick)
      shouldSaveResult: true
    }
  );

  /**
   * Job: class_end_session
   * Automatically ends a class session after expected duration
   * Can be used for automated class closing (optional)
   */
  agenda.define(
    'class_end_session',
    async (job) => {
      const { classId } = job.attrs.data;

      try {
        const classData = await Class.findById(classId);

        if (!classData) {
          throw new Error(`Class not found: ${classId}`);
        }

        // Only process if status is 'live'
        if (classData.status !== 'live') {
          console.log(`⏭️  Skipping job - Class ${classId} is not live (status: ${classData.status})`);
          return;
        }

        // Update class status to 'completed'
        classData.status = 'completed';
        await classData.save();
        console.log(`✅ Class "${classData.title}" (${classId}) session ended`);

        // Optional: Send notifications to attendees
        try {
          if (classData.attendees && classData.attendees.length > 0) {
            const notifications = classData.attendees.map((attendeeId) => ({
              type: 'class_ended',
              message: `✅ Class "${classData.title}" has ended. Thank you for attending!`,
              senderId: classData.userId,
              receiverId: attendeeId,
              priority: 'normal',
              createdAt: new Date()
            }));

            await Notification.insertMany(notifications);
            console.log(`📢 Sent end notifications to ${notifications.length} attendees`);
          }
        } catch (notificationError) {
          console.error('⚠️  Error sending end notifications:', notificationError);
        }
      } catch (err) {
        console.error(`❌ Error in class_end_session job for ${classId}:`, err);
        throw err;
      }
    },
    {
      priority: 'normal',
      concurrency: 10,
      lockLifetime: 5 * 60 * 1000,
      shouldSaveResult: true
    }
  );

  /**
   * Job: class_send_reminder
   * Sends reminder notifications 15 minutes before class starts
   */
  agenda.define(
    'class_send_reminder',
    async (job) => {
      const { classId } = job.attrs.data;

      try {
        const classData = await Class.findById(classId);

        if (!classData) {
          throw new Error(`Class not found: ${classId}`);
        }

        // Only process if still scheduled
        if (classData.status !== 'scheduled') {
          console.log(`⏭️  Skipping reminder - Class ${classId} is no longer scheduled`);
          return;
        }

        console.log(`⏰ Sending class reminder for "${classData.title}" (${classId})`);

        // Send reminders to all attendees
        if (classData.attendees && classData.attendees.length > 0) {
          const notifications = classData.attendees.map((attendeeId) => ({
            type: 'class_reminder',
            message: `⏰ Reminder: "${classData.title}" starts in 15 minutes!`,
            senderId: classData.userId,
            receiverId: attendeeId,
            priority: 'high',
            createdAt: new Date()
          }));

          await Notification.insertMany(notifications);
          console.log(`📢 Sent reminders to ${notifications.length} attendees`);
        }
      } catch (err) {
        console.error(`❌ Error in class_send_reminder job for ${classId}:`, err);
        throw err;
      }
    },
    {
      priority: 'high',
      concurrency: 10,
      lockLifetime: 2 * 60 * 1000,
      shouldSaveResult: true
    }
  );
}

module.exports = {
  defineClassJobs
};
