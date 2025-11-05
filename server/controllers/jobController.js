/**
 * Job Management Controller
 * Provides APIs for managing Agenda jobs (view, reschedule, cancel)
 */

/**
 * Get all scheduled jobs
 * Admin only endpoint
 */
exports.getAllJobs = async (req, res) => {
  try {
    const agenda = global.agenda;
    
    if (!agenda) {
      return res.status(503).json({ error: 'Job scheduler not available' });
    }

    // Get all jobs from the database
    const jobs = await agenda.jobs({});
    
    // Format jobs for API response
    const formattedJobs = jobs.map(job => ({
      id: job._id,
      name: job.attrs.name,
      data: job.attrs.data,
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      lastFinishedAt: job.attrs.lastFinishedAt,
      status: job.attrs.lockedAt ? 'running' : job.attrs.disabled ? 'disabled' : 'scheduled',
      priority: job.attrs.priority,
      failReason: job.attrs.failReason || null
    }));

    res.json({ 
      count: formattedJobs.length,
      jobs: formattedJobs 
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get jobs for a specific class
 */
exports.getClassJobs = async (req, res) => {
  try {
    const { classId } = req.params;
    const agenda = global.agenda;
    
    if (!agenda) {
      return res.status(503).json({ error: 'Job scheduler not available' });
    }

    // Find all jobs for this class
    const jobs = await agenda.jobs({ 'data.classId': classId });
    
    const formattedJobs = jobs.map(job => ({
      id: job._id,
      name: job.attrs.name,
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      status: job.attrs.lockedAt ? 'running' : job.attrs.disabled ? 'disabled' : 'scheduled',
      failReason: job.attrs.failReason || null
    }));

    res.json({ 
      classId,
      count: formattedJobs.length,
      jobs: formattedJobs 
    });
  } catch (err) {
    console.error('Error fetching class jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Reschedule a specific job
 */
exports.rescheduleJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { newTime } = req.body;
    const agenda = global.agenda;
    
    if (!agenda) {
      return res.status(503).json({ error: 'Job scheduler not available' });
    }

    if (!newTime) {
      return res.status(400).json({ error: 'newTime is required' });
    }

    // Get the job
    const jobs = await agenda.jobs({ _id: jobId });
    
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobs[0];
    
    // Reschedule the job
    job.schedule(new Date(newTime));
    await job.save();

    res.json({ 
      message: 'Job rescheduled successfully',
      job: {
        id: job._id,
        name: job.attrs.name,
        nextRunAt: job.attrs.nextRunAt
      }
    });
  } catch (err) {
    console.error('Error rescheduling job:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Cancel a specific job
 */
exports.cancelJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const agenda = global.agenda;
    
    if (!agenda) {
      return res.status(503).json({ error: 'Job scheduler not available' });
    }

    // Remove the job
    const jobs = await agenda.jobs({ _id: jobId });
    
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await jobs[0].remove();

    res.json({ 
      message: 'Job cancelled successfully',
      jobId
    });
  } catch (err) {
    console.error('Error cancelling job:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get job scheduler statistics
 */
exports.getSchedulerStats = async (req, res) => {
  try {
    const agenda = global.agenda;
    
    if (!agenda) {
      return res.status(503).json({ error: 'Job scheduler not available' });
    }

    // Get all jobs
    const allJobs = await agenda.jobs({});
    
    // Count jobs by status
    const stats = {
      total: allJobs.length,
      scheduled: allJobs.filter(j => !j.attrs.lockedAt && !j.attrs.disabled).length,
      running: allJobs.filter(j => j.attrs.lockedAt).length,
      disabled: allJobs.filter(j => j.attrs.disabled).length,
      failed: allJobs.filter(j => j.attrs.failReason).length,
      byType: {}
    };

    // Count by job type
    allJobs.forEach(job => {
      const name = job.attrs.name;
      stats.byType[name] = (stats.byType[name] || 0) + 1;
    });

    res.json({ stats });
  } catch (err) {
    console.error('Error fetching scheduler stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
