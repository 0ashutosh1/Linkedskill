/**
 * Quick script to check all scheduled Agenda jobs
 * Run with: node server/check-agenda-jobs.js
 */

require('dotenv').config();
const { Agenda } = require('@hokify/agenda');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill';

async function checkJobs() {
  console.log('🔍 Connecting to MongoDB...');
  
  const agenda = new Agenda({
    db: {
      address: MONGODB_URI,
      collection: 'agendaJobs'
    }
  });

  await agenda.start();
  console.log('✅ Connected to Agenda\n');

  // Get all jobs
  const allJobs = await agenda.jobs({});
  
  console.log(`📊 Total Jobs: ${allJobs.length}\n`);

  if (allJobs.length === 0) {
    console.log('⚠️  No jobs found in the database!');
    console.log('This means:');
    console.log('1. Either no classes have been created yet');
    console.log('2. Or job scheduling is failing when classes are created');
    console.log('\nTry creating a new class and check the server logs for errors.');
  } else {
    // Group jobs by type
    const jobsByType = {};
    allJobs.forEach(job => {
      const name = job.attrs.name;
      if (!jobsByType[name]) {
        jobsByType[name] = [];
      }
      jobsByType[name].push(job);
    });

    // Display jobs by type
    for (const [jobType, jobs] of Object.entries(jobsByType)) {
      console.log(`\n📋 ${jobType} (${jobs.length} jobs):`);
      console.log('─'.repeat(60));
      
      jobs.forEach((job, index) => {
        const data = job.attrs.data || {};
        const nextRun = job.attrs.nextRunAt;
        const lastRun = job.attrs.lastRunAt;
        const failed = job.attrs.failReason;
        const disabled = job.attrs.disabled;
        
        console.log(`\n  ${index + 1}. Job ID: ${job.attrs._id}`);
        console.log(`     Class ID: ${data.classId || 'N/A'}`);
        console.log(`     Class Title: ${data.classTitle || 'N/A'}`);
        console.log(`     Next Run: ${nextRun ? nextRun.toLocaleString() : 'Not scheduled'}`);
        console.log(`     Last Run: ${lastRun ? lastRun.toLocaleString() : 'Never'}`);
        console.log(`     Status: ${disabled ? '🔴 Disabled' : failed ? '❌ Failed' : nextRun && nextRun > new Date() ? '⏰ Scheduled' : '✅ Completed'}`);
        
        if (failed) {
          console.log(`     ❌ Fail Reason: ${failed}`);
        }
      });
    }
  }

  await agenda.stop();
  console.log('\n\n✅ Done!');
  process.exit(0);
}

checkJobs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
