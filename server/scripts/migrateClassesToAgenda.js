/**
 * Migration Script: Schedule Agenda jobs for existing classes
 * 
 * Usage: node scripts/migrateClassesToAgenda.js
 * 
 * This script finds all classes with 'scheduled' status and creates
 * Agenda jobs for them if the start time is in the future.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Class = require('../models/Class');
const { initializeAgenda } = require('../lib/scheduler');
const { defineClassJobs } = require('../jobs/classJobs');
const { 
  scheduleClassGoLive, 
  scheduleClassReminder, 
  scheduleClassEnd 
} = require('../lib/agendaHelpers');

async function migrateClasses() {
  let agenda;
  
  try {
    console.log('🚀 Starting migration to Agenda job scheduling...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Initialize Agenda
    agenda = await initializeAgenda(mongoUri);
    defineClassJobs(agenda);
    global.agenda = agenda;
    console.log('✅ Agenda initialized\n');

    // Get all scheduled classes
    const scheduledClasses = await Class.find({ status: 'scheduled' });
    console.log(`📊 Found ${scheduledClasses.length} scheduled classes\n`);

    if (scheduledClasses.length === 0) {
      console.log('ℹ️  No classes to migrate');
      await cleanup(agenda);
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each class
    for (let i = 0; i < scheduledClasses.length; i++) {
      const classData = scheduledClasses[i];
      const progress = `[${i + 1}/${scheduledClasses.length}]`;

      try {
        // Check if startTime is in the future
        const startTime = new Date(classData.startTime);
        const now = new Date();

        if (startTime < now) {
          console.log(`${progress} ⏭️  Skipping "${classData.title}" - start time in past`);
          skipCount++;
          continue;
        }

        // Schedule all three jobs
        await scheduleClassGoLive(classData);
        await scheduleClassReminder(classData);
        await scheduleClassEnd(classData);

        successCount++;
        console.log(`${progress} ✅ "${classData.title}" (${classData._id})`);
      } catch (err) {
        errorCount++;
        console.error(`${progress} ❌ Error: "${classData.title}" - ${err.message}`);
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 MIGRATION SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Skipped (start time passed): ${skipCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total processed: ${successCount + skipCount + errorCount}`);
    console.log(`${'='.repeat(60)}\n`);

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log(`⚠️  Migration completed with ${errorCount} error(s)`);
    }

    await cleanup(agenda);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    if (agenda) {
      try {
        await agenda.stop();
      } catch (stopErr) {
        console.error('Error stopping Agenda:', stopErr);
      }
    }
    process.exit(1);
  }
}

async function cleanup(agenda) {
  try {
    if (agenda) {
      await agenda.stop();
      console.log('✅ Agenda stopped');
    }
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

// Run migration
migrateClasses().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
