const { Agenda } = require('@hokify/agenda');
const os = require('os');

let agenda = null;

/**
 * Initialize and configure Agenda for job scheduling
 * @param {string} mongoConnectionString - MongoDB connection URI
 * @returns {Promise<Agenda>} - Initialized Agenda instance
 */
async function initializeAgenda(mongoConnectionString) {
  if (agenda) {
    console.log('✅ Agenda already initialized');
    return agenda;
  }

  try {
    agenda = new Agenda({
      db: {
        address: mongoConnectionString,
        collection: 'agendaJobs'
      },
      name: `job-processor-${os.hostname()}-${process.pid}`,
      processEvery: '5 seconds',        // Check for jobs every 5 seconds
      maxConcurrency: 20,               // Max 20 concurrent jobs overall
      defaultConcurrency: 10,           // Max 10 concurrent 'class_go_live' jobs
      defaultLockLifetime: 10 * 60 * 1000, // 10 min lock (job timeout safety)
      ensureIndex: true                 // Auto-create MongoDB indexes
    });

    // Handle Agenda ready event
    agenda.on('ready', () => {
      console.log('✅ Agenda connected to MongoDB successfully');
    });

    // Handle errors
    agenda.on('error', (err) => {
      console.error('❌ Agenda error:', err);
    });

    // Listen for job completion events
    agenda.on('complete', (job) => {
      console.log(`✅ Job completed: ${job.attrs.name}`);
    });

    // Listen for job failures
    agenda.on('fail', (err, job) => {
      console.error(`❌ Job failed - ${job.attrs.name}:`, err.message);
    });

    await agenda.start();
    console.log('✅ Agenda scheduler started');

    return agenda;
  } catch (err) {
    console.error('❌ Error initializing Agenda:', err);
    throw err;
  }
}

/**
 * Get the current Agenda instance
 * @returns {Agenda} - Current Agenda instance or null if not initialized
 */
function getAgenda() {
  if (!agenda) {
    throw new Error('Agenda not initialized. Call initializeAgenda first.');
  }
  return agenda;
}

/**
 * Gracefully stop the Agenda scheduler
 * @returns {Promise<void>}
 */
async function stopAgenda() {
  if (agenda) {
    try {
      await agenda.stop();
      console.log('✅ Agenda scheduler stopped gracefully');
    } catch (err) {
      console.error('❌ Error stopping Agenda:', err);
    }
  }
}

module.exports = {
  initializeAgenda,
  getAgenda,
  stopAgenda
};
