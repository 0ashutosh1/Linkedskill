# Coursue Agenda Job Scheduler System

## 🎯 Quick Overview

Your Coursue server now includes an **automated job scheduling system** powered by **Agenda** (MongoDB-backed job queue). This system automatically manages your class lifecycle:

✅ Send reminders 15 minutes before class  
✅ Automatically set class status to "live" at start time  
✅ Automatically complete classes after their duration  
✅ Handle thousands of concurrent classes  
✅ Survive server restarts with persistence  

---

## 📁 What Was Added

### Core Files
- `lib/scheduler.js` - Agenda initialization & configuration
- `lib/agendaHelpers.js` - Helper functions for scheduling
- `jobs/classJobs.js` - Job definitions (reminder, go-live, end)

### API Integration
- `controllers/jobController.js` - Job management endpoints
- `routes/jobs.js` - Job API routes

### Utilities
- `scripts/migrateClassesToAgenda.js` - Migrate existing classes

### Documentation
- `AGENDA_SETUP.md` - Complete setup guide (you're reading it!)
- `MIGRATION_GUIDE.md` - How to migrate existing classes
- `AGENDASH_SETUP.md` - Optional web dashboard

---

## 🚀 Getting Started

### 1. Server Already Initializes Agenda

When you start your server, Agenda automatically:
```bash
npm run dev
```

Expected output:
```
✅ Connected to MongoDB
✅ Agenda connected to MongoDB successfully
✅ Agenda jobs defined and ready
✅ Agenda job scheduler is running
```

### 2. Create a Class (New Classes Auto-Scheduled)

```bash
POST /classes
{
  "title": "Math 101",
  "description": "Introduction to Calculus",
  "date": "2025-11-15",
  "startTime": "2025-11-15T14:00:00Z",
  "duration": 60,
  "categoryId": "...",
  "subCategoryId": "..."
}
```

**Automatically scheduled:**
- 📢 Reminder job at 13:45 (15 min before)
- 🔴 Go-live job at 14:00
- ✅ End-session job at 15:00

### 3. Monitor Jobs

Check job status:
```bash
GET /jobs/stats
```

Get jobs for specific class:
```bash
GET /jobs/class/{classId}
```

---

## 📊 Job Types

### 1. class_send_reminder
**When**: 15 minutes before class start  
**What**: Sends notification to all attendees  
**Status**: High priority  

### 2. class_go_live
**When**: At exact class start time  
**What**: Sets class status to "live" + sends notifications  
**Status**: High priority  

### 3. class_end_session
**When**: At startTime + duration  
**What**: Sets class status to "completed" + sends notifications  
**Status**: Normal priority  

---

## 🔧 API Endpoints

### Get Scheduler Statistics
```
GET /jobs/stats
Authorization: JWT token required

Response:
{
  "stats": {
    "total": 45,
    "scheduled": 40,
    "running": 2,
    "disabled": 0,
    "failed": 3,
    "byType": {
      "class_go_live": 15,
      "class_send_reminder": 15,
      "class_end_session": 15
    }
  }
}
```

### Get All Jobs
```
GET /jobs
Authorization: JWT token required

Response:
{
  "count": 45,
  "jobs": [
    {
      "id": "...",
      "name": "class_go_live",
      "data": { "classId": "..." },
      "nextRunAt": "2025-11-15T14:00:00Z",
      "status": "scheduled",
      "priority": "high"
    },
    ...
  ]
}
```

### Get Jobs for Specific Class
```
GET /jobs/class/{classId}
Authorization: JWT token required

Response:
{
  "classId": "...",
  "count": 3,
  "jobs": [
    { "name": "class_send_reminder", "nextRunAt": "..." },
    { "name": "class_go_live", "nextRunAt": "..." },
    { "name": "class_end_session", "nextRunAt": "..." }
  ]
}
```

### Reschedule a Job
```
PUT /jobs/{jobId}/reschedule
Authorization: JWT token required
Body: {
  "newTime": "2025-11-15T15:00:00Z"
}

Response:
{
  "message": "Job rescheduled successfully",
  "job": {
    "id": "...",
    "name": "class_go_live",
    "nextRunAt": "2025-11-15T15:00:00Z"
  }
}
```

### Cancel a Job
```
DELETE /jobs/{jobId}
Authorization: JWT token required

Response:
{
  "message": "Job cancelled successfully",
  "jobId": "..."
}
```

---

## 📋 Database Schema

### agendaJobs Collection

Automatically created by Agenda:

```javascript
{
  "_id": ObjectId,
  "name": "class_go_live",
  "data": {
    "classId": "123abc..."
  },
  "nextRunAt": ISODate("2025-11-15T14:00:00Z"),
  "lastRunAt": ISODate("2025-11-15T13:55:00Z"),
  "lastFinishedAt": ISODate("2025-11-15T14:00:05Z"),
  "lockedAt": null,
  "priority": 10,
  "disabled": false,
  "type": "normal",
  "result": { /* execution result */ }
}
```

---

## 🔄 Class Lifecycle Example

```
Timeline:
13:45 - class_send_reminder job runs
        → Notifications sent: "Class starts in 15 min!"
        
14:00 - class_go_live job runs
        → Class.status = 'live'
        → Notifications sent: "LIVE NOW!"
        
14:30 - (class running, students joining)

15:00 - class_end_session job runs
        → Class.status = 'completed'
        → Notifications sent: "Class ended, thanks!"
```

---

## 🆕 Migration for Existing Classes

If you have classes created **before** implementing Agenda, use the migration script:

### Run Migration
```bash
npm run migrate:agenda
```

### What It Does
- Finds all classes with status 'scheduled'
- Checks if start time is in the future
- Creates all three job types for each class
- Shows summary with success/error counts

### Example Output
```
🚀 Starting migration to Agenda job scheduling...
✅ Connected to MongoDB
✅ Agenda initialized
📊 Found 15 scheduled classes

[1/15] ✅ "Math 101"
[2/15] ✅ "Biology 202"
...
[15/15] ✅ "Physics 303"

============================================================
📊 MIGRATION SUMMARY
============================================================
   ✅ Successfully migrated: 15
   ⏭️  Skipped (start time passed): 0
   ❌ Failed: 0
   📝 Total processed: 15
============================================================

🎉 Migration completed successfully!
```

---

## 📊 Optional: Agendash Dashboard

Add a web UI to monitor jobs visually:

1. Install Agendash:
   ```bash
   npm install agendash
   ```

2. Update `index.js` to mount dashboard:
   ```javascript
   const agendash = require('agendash');
   
   if (global.agenda) {
     app.use('/admin/jobs', agendash(global.agenda));
   }
   ```

3. Access at: `http://localhost:4000/admin/jobs`

See `AGENDASH_SETUP.md` for details.

---

## 🔒 Security Considerations

### 1. Secure Job API
Jobs API endpoints require JWT authentication. Verify users are authorized:

```javascript
// In routes/jobs.js
router.get('/', auth, jobController.getAllJobs);
```

### 2. Optional: Admin-Only
Restrict to admin users only:

```javascript
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

router.get('/', auth, adminOnly, jobController.getAllJobs);
```

### 3. Secure Agendash (If Used)
Never expose Agendash in production without auth:

```javascript
if (process.env.NODE_ENV === 'development') {
  app.use('/admin/jobs', agendash(global.agenda));
}
```

---

## 🐛 Troubleshooting

### Q: Jobs not running?
**A**: 
- Check server is running: `npm run dev`
- Verify MongoDB connected: Check console logs
- Check startTime is in future (past times don't schedule)

### Q: "Agenda not initialized" error?
**A**:
- Wait for server startup to complete
- Check MongoDB connection string in `.env`
- Check MongoDB is running and accessible

### Q: How do I manually trigger a job?
**A**:
```javascript
const agenda = global.agenda;
await agenda.now('class_go_live', { classId: 'xxx' });
```

### Q: Can I change job schedules?
**A**: Yes, use the reschedule endpoint:
```
PUT /jobs/{jobId}/reschedule
{ "newTime": "2025-11-15T15:00:00Z" }
```

---

## 📈 Performance Tips

1. **Add MongoDB Indexes** (auto-created but good to verify):
   ```javascript
   db.agendaJobs.createIndex({
     "name": 1,
     "nextRunAt": 1,
     "priority": -1,
     "lockedAt": 1
   });
   ```

2. **Monitor Job Execution**:
   ```bash
   GET /jobs/stats
   ```

3. **Clean Old Jobs** (optional):
   ```javascript
   db.agendaJobs.deleteMany({
     "lastFinishedAt": { 
       "$lt": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
     }
   });
   ```

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `lib/scheduler.js` | Initialize and configure Agenda |
| `lib/agendaHelpers.js` | Helper functions for scheduling |
| `jobs/classJobs.js` | Job processor definitions |
| `controllers/jobController.js` | Job management API |
| `routes/jobs.js` | Job API routes |
| `scripts/migrateClassesToAgenda.js` | Migrate existing classes |
| `AGENDA_SETUP.md` | Installation and setup |
| `MIGRATION_GUIDE.md` | How to migrate existing classes |
| `AGENDASH_SETUP.md` | Optional web dashboard |

---

## 🎓 Learning Resources

- **Agenda Docs**: https://agendajs.org/
- **MongoDB Best Practices**: https://docs.mongodb.com/manual/administration/
- **Job Scheduling Concepts**: https://en.wikipedia.org/wiki/Job_scheduler

---

## 📞 Support

For issues or questions:
1. Check relevant documentation file (above)
2. View server console logs for errors
3. Query `agendaJobs` collection in MongoDB
4. Use `/jobs/stats` to diagnose

---

## ✅ Checklist

- [x] Agenda installed (`@hokify/agenda`)
- [x] Core scheduler initialized
- [x] Job definitions created
- [x] API endpoints available
- [x] Index.js updated with Agenda
- [x] ClassController simplified
- [x] Job helpers created
- [x] Migration script available
- [x] Documentation complete

---

**Version**: 1.0  
**Last Updated**: October 31, 2025  
**Status**: ✅ Production Ready

