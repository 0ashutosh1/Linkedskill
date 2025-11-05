# Optional: Agendash - Job Scheduler Dashboard

## 📊 What is Agendash?

Agendash is a web-based dashboard for monitoring Agenda jobs. It provides:
- Real-time job status visualization
- Job execution history
- Error tracking and debugging
- Manual job control (pause, resume, remove)
- Performance metrics

---

## 🚀 Installation

### Step 1: Install Agendash

```bash
npm install agendash
```

### Step 2: Add to Your Server

Update `index.js` to include the Agendash middleware:

```javascript
const express = require('express');
const agendash = require('agendash');

const app = express();

// ... your other middleware and routes ...

// Add Agendash dashboard (mount at /admin/jobs)
// This should be added AFTER Agenda is initialized
if (global.agenda) {
  app.use('/admin/jobs', agendash(global.agenda));
  console.log('📊 Agendash dashboard available at http://localhost:4000/admin/jobs');
}

// ... rest of your app ...
```

### Step 3: Restart Server

```bash
npm run dev
```

---

## 📍 Access Dashboard

Navigate to: `http://localhost:4000/admin/jobs`

---

## 🎛️ Dashboard Features

### Job List
- View all scheduled, running, and completed jobs
- Filter by job type, status, priority
- Search by job name or class ID

### Job Details
- View job execution history
- See error messages and retry info
- Check scheduling details

### Manual Controls
- **Pause**: Stop a job from running
- **Resume**: Re-enable a paused job
- **Remove**: Delete a job completely
- **Edit**: Modify job schedule

### Statistics
- Total jobs count
- Success/failure rates
- Average execution time
- Job performance metrics

---

## 🔒 Securing Agendash (Important!)

By default, Agendash is publicly accessible. You should secure it:

### Option A: Require Authentication

```javascript
const agendash = require('agendash');
const auth = require('./middleware/auth');

// Mount with authentication
if (global.agenda) {
  app.use('/admin/jobs', auth, agendash(global.agenda));
}
```

### Option B: IP Whitelisting

```javascript
const agendash = require('agendash');

// Middleware to check IP
const adminIpCheck = (req, res, next) => {
  const allowedIPs = ['127.0.0.1', '::1', 'localhost'];
  
  if (!allowedIPs.includes(req.ip)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

if (global.agenda) {
  app.use('/admin/jobs', adminIpCheck, agendash(global.agenda));
}
```

### Option C: Environment Variable Toggle

```javascript
// Only enable in development
if (process.env.NODE_ENV === 'development' && global.agenda) {
  app.use('/admin/jobs', agendash(global.agenda));
  console.log('📊 Agendash available in development only');
}
```

---

## 📈 Database Indexes for Dashboard

For better dashboard performance, add these MongoDB indexes:

```javascript
// In MongoDB shell
db.agendaJobs.createIndex({
  "nextRunAt": -1,
  "lastRunAt": -1,
  "lastFinishedAt": -1
}, { name: "agendash" });
```

---

## 💡 Usage Examples

### Monitor Class Jobs
1. Go to dashboard: `http://localhost:4000/admin/jobs`
2. Filter by job name: `class_go_live`
3. See all classes scheduled to go live
4. Click on a job to see details

### Manually Reschedule
1. Find the job you want to reschedule
2. Click "Edit"
3. Change the "Next Run" time
4. Save

### Debug Failed Jobs
1. Look for jobs with red indicators (failed)
2. Click on the job to see error details
3. Fix the underlying issue
4. Use "Resume" to retry

---

## 🔧 Configuration Options

You can pass options to Agendash:

```javascript
const agendashOptions = {
  title: 'Coursue Job Scheduler',
  baseUrl: '/admin/jobs',
  pollInterval: 2000,  // Refresh interval in ms
  maxLogLines: 200     // Max lines to show in logs
};

if (global.agenda) {
  app.use('/admin/jobs', agendash(global.agenda, agendashOptions));
}
```

---

## 📊 Example Dashboard Views

### Active Jobs View
```
Job Name              | Next Run       | Status    | Class
class_go_live         | 2 min ago      | ✅ Done   | Math 101
class_send_reminder   | Now            | ⏳ Running | Biology 202
class_end_session     | In 1 hour      | ⏰ Pending | Physics 303
```

### Job Stats
```
Total Jobs: 45
Success Rate: 98.5%
Failed: 1
Average Duration: 245ms
```

---

## 🐛 Troubleshooting

### Dashboard not loading?
- Verify Agenda is initialized: `global.agenda` exists
- Check if Agendash is mounted correctly
- Ensure MongoDB connection is active

### Jobs not showing?
- Verify jobs are actually created in `agendaJobs` collection
- Check job names match exactly
- Ensure MongoDB indexes are created

### Dashboard is slow?
- Add MongoDB indexes (see above)
- Reduce `pollInterval` in options
- Clean up old completed jobs

---

## 🧹 Maintenance

### Clean Up Old Jobs (Optional)

MongoDB indexes the jobs efficiently, but you can clean up old completed jobs:

```javascript
// In MongoDB shell - delete jobs older than 30 days
db.agendaJobs.deleteMany({
  "lastFinishedAt": {
    "$lt": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
});
```

Or create a scheduled cleanup job:

```javascript
agenda.define('cleanup_old_jobs', async (job) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const result = await Job.deleteMany({
    lastFinishedAt: { $lt: thirtyDaysAgo }
  });
  
  console.log(`Cleaned up ${result.deletedCount} old jobs`);
});

// Run daily
agenda.every('1 day', 'cleanup_old_jobs');
```

---

## 📚 Resources

- Agendash GitHub: https://github.com/agenda/agendash
- Agenda Documentation: https://agendajs.org
- MongoDB Performance: https://docs.mongodb.com/manual/administration/

---

## 🎯 Summary

| Feature | Availability | Benefit |
|---------|--------------|---------|
| Job monitoring | ✅ Built-in to API | Track job execution |
| Web dashboard | ✅ Optional Agendash | Visual monitoring |
| Job control | ✅ API endpoints | Reschedule/cancel |
| Statistics | ✅ API endpoint | Performance tracking |

Choose based on your needs:
- **API Only**: Lightweight, programmatic access
- **With Agendash**: Visual dashboard, easier debugging

