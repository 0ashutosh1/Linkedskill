/**
 * Helper functions for scheduling class-related jobs with Agenda
 */

/**
 * Schedule a class to go live at its start time
 * @param {Object} classData - The class document
 * @returns {Promise<void>}
 */
async function scheduleClassGoLive(classData) {
  const agenda = global.agenda;
  
  if (!agenda) {
    console.warn('⚠️  Agenda not available, skipping job scheduling');
    return;
  }

  try {
    // Schedule the 'class_go_live' job at the class start time
    await agenda.schedule(classData.startTime, 'class_go_live', {
      classId: classData._id.toString()
    });

    console.log(`✅ Scheduled class_go_live job for class "${classData.title}" at ${classData.startTime}`);
  } catch (err) {
    console.error('❌ Error scheduling class_go_live job:', err);
    throw err;
  }
}

/**
 * Schedule a reminder notification 15 minutes before class starts
 * @param {Object} classData - The class document
 * @returns {Promise<void>}
 */
async function scheduleClassReminder(classData) {
  const agenda = global.agenda;
  
  if (!agenda) {
    console.warn('⚠️  Agenda not available, skipping reminder scheduling');
    return;
  }

  try {
    // Calculate reminder time (15 minutes before start)
    const reminderTime = new Date(classData.startTime.getTime() - 15 * 60 * 1000);
    
    // Don't schedule reminder if it's in the past
    if (reminderTime < new Date()) {
      console.log(`⏭️  Skipping reminder - scheduled time has passed`);
      return;
    }

    await agenda.schedule(reminderTime, 'class_send_reminder', {
      classId: classData._id.toString()
    });

    console.log(`✅ Scheduled class_send_reminder job for class "${classData.title}" at ${reminderTime}`);
  } catch (err) {
    console.error('❌ Error scheduling class_send_reminder job:', err);
    throw err;
  }
}

/**
 * Schedule a no-show check 15 minutes after class start time
 * If instructor hasn't started the class, it will be automatically cancelled
 * @param {Object} classData - The class document
 * @returns {Promise<void>}
 */
async function scheduleNoShowCheck(classData) {
  const agenda = global.agenda;
  
  if (!agenda) {
    console.warn('⚠️  Agenda not available, skipping no-show check scheduling');
    return;
  }

  try {
    // Calculate no-show check time (15 minutes after scheduled start)
    const checkTime = new Date(classData.startTime.getTime() + 15 * 60 * 1000);

    await agenda.schedule(checkTime, 'class_check_no_show', {
      classId: classData._id.toString()
    });

    console.log(`✅ Scheduled class_check_no_show job for class "${classData.title}" at ${checkTime}`);
  } catch (err) {
    console.error('❌ Error scheduling class_check_no_show job:', err);
    throw err;
  }
}

/**
 * Schedule a class session end job
 * @param {Object} classData - The class document
 * @param {number} durationMinutes - Duration of the class in minutes
 * @returns {Promise<void>}
 */
async function scheduleClassEnd(classData, durationMinutes = null) {
  const agenda = global.agenda;
  
  if (!agenda) {
    console.warn('⚠️  Agenda not available, skipping end job scheduling');
    return;
  }

  try {
    // Use provided duration or class duration or default to 60 minutes
    const duration = durationMinutes || classData.duration || 60;
    
    // Calculate end time
    const endTime = new Date(classData.startTime.getTime() + duration * 60 * 1000);

    await agenda.schedule(endTime, 'class_end_session', {
      classId: classData._id.toString()
    });

    console.log(`✅ Scheduled class_end_session job for class "${classData.title}" at ${endTime}`);
  } catch (err) {
    console.error('❌ Error scheduling class_end_session job:', err);
    throw err;
  }
}

/**
 * Cancel all scheduled jobs for a class
 * @param {string} classId - Class ID
 * @returns {Promise<void>}
 */
async function cancelClassJobs(classId) {
  const agenda = global.agenda;
  
  if (!agenda) {
    console.warn('⚠️  Agenda not available, skipping job cancellation');
    return;
  }

  try {
    const numCancelled = await agenda.cancel({
      'data.classId': classId.toString()
    });

    console.log(`✅ Cancelled ${numCancelled} jobs for class ${classId}`);
  } catch (err) {
    console.error('❌ Error cancelling class jobs:', err);
    throw err;
  }
}

module.exports = {
  scheduleClassGoLive,
  scheduleClassReminder,
  scheduleNoShowCheck,
  scheduleClassEnd,
  cancelClassJobs
};
