# Migration Guide: Moving Existing Classes to Agenda

## 📋 Overview

If you have existing classes created before implementing Agenda, you need to schedule jobs for them. This guide explains how.

---

## 🎯 Scenarios

### Scenario 1: Class is in the Future (Scheduled)
**Action**: Schedule all three jobs
- Reminder (15 min before)
- Go Live (at startTime)
- End Session (at startTime + duration)

### Scenario 2: Class is Currently Live
**Action**: Schedule only end session
- Don't schedule reminder or go-live (already happening)
- Schedule end-session for completion

### Scenario 3: Class Has Already Completed
**Action**: No action needed
- Jobs already executed or irrelevant
- Class is in 'completed' status

---

## 🔧 Option A: Manual Scheduling (One Class)

Use the `/jobs/reschedule` API to manually schedule jobs for a class:

```bash
# Create job for class to go live
POST /jobs
{
  "classId": "class_id_here",
  "jobType": "class_go_live",
  "scheduledTime": "2025-11-15T14:00:00Z"
}

# Create reminder job
POST /jobs
{
  "classId": "class_id_here",
  "jobType": "class_send_reminder",
  "scheduledTime": "2025-11-15T13:45:00Z"
}

# Create end session job
POST /jobs
{
  "classId": "class_id_here",
  "jobType": "class_end_session",
  "scheduledTime": "2025-11-15T15:00:00Z"
}
```

---

## 🔧 Option B: Bulk Migration (All Classes)

### Step 1: Create a Migration Script

Save this as `scripts/migrateClassesToAgenda.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const Class = require('./models/Class');
const { initializeAgenda } = require('./lib/scheduler');
const { defineClassJobs } = require('./jobs/classJobs');
const { 
  scheduleClassGoLive, 
  scheduleClassReminder, 
  scheduleClassEnd 
} = require('./lib/agendaHelpers');

async function migrateClasses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize Agenda
    const agenda = await initializeAgenda(process.env.MONGODB_URI);
    defineClassJobs(agenda);
    global.agenda = agenda;
    console.log('✅ Agenda initialized');

    // Get all scheduled classes
    const scheduledClasses = await Class.find({ status: 'scheduled' });
    console.log(`Found ${scheduledClasses.length} scheduled classes`);

    let successCount = 0;
    let errorCount = 0;

    for (const classData of scheduledClasses) {
      try {
        // Check if startTime is in the future
        if (new Date(classData.startTime) < new Date()) {
          console.log(`⏭️  Skipping "${classData.title}" - start time has passed`);
          continue;
        }

        // Schedule all three jobs
        await scheduleClassGoLive(classData);
        await scheduleClassReminder(classData);
        await scheduleClassEnd(classData);

        successCount++;
        console.log(`✅ Migrated: "${classData.title}"`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Error migrating "${classData.title}":`, err.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    await agenda.stop();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrateClasses();
```

### Step 2: Run the Migration

```bash
# From your server directory
node scripts/migrateClassesToAgenda.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Agenda initialized
Found 15 scheduled classes
✅ Migrated: "Math 101"
✅ Migrated: "Biology 202"
...
📊 Migration Summary:
   ✅ Successful: 15
   ❌ Failed: 0
```

---

## 🔍 Verification

### Check Migrated Jobs

```javascript
// In MongoDB shell
db.agendaJobs.find({ name: 'class_go_live' }).count()
// Should show number of scheduled classes

// View specific class jobs
db.agendaJobs.find({ 'data.classId': 'your_class_id' })
```

### API Check

```bash
# Get scheduler statistics
GET /jobs/stats

# Response:
{
  "stats": {
    "total": 45,           // 3 jobs × 15 classes
    "scheduled": 45,
    "running": 0,
    "disabled": 0,
    "failed": 0,
    "byType": {
      "class_go_live": 15,
      "class_send_reminder": 15,
      "class_end_session": 15
    }
  }
}

# Get jobs for specific class
GET /jobs/class/class_id_here

# Response:
{
  "classId": "...",
  "count": 3,
  "jobs": [
    {
      "id": "...",
      "name": "class_send_reminder",
      "nextRunAt": "2025-11-15T13:45:00.000Z",
      "status": "scheduled"
    },
    ...
  ]
}
```

---

## 🚨 Troubleshooting

### Problem: Some classes not migrated
**Solution**: 
- Check if start times are in the past
- Verify database connection
- Check for errors in console output

### Problem: Jobs not appearing in MongoDB
**Solution**:
- Ensure Agenda is running
- Check `agendaJobs` collection exists
- Verify `MONGODB_URI` is correct

### Problem: "Agenda not available"
**Solution**:
- Start server first
- Wait for Agenda to initialize (check logs)
- Make sure MongoDB is connected

---

## 📝 Before & After

### Before Migration:
- ❌ No automatic scheduling
- ❌ Manual time checks required
- ❌ No job persistence
- ❌ Risk of missed notifications

### After Migration:
- ✅ Automatic scheduling for all classes
- ✅ No manual checks needed
- ✅ Jobs stored in MongoDB
- ✅ Guaranteed notifications delivery

---

## 🎯 Next Steps

1. **Backup your MongoDB** before migration
2. **Test migration** on a subset of classes first
3. **Run full migration** during low-traffic period
4. **Verify jobs** in MongoDB/API
5. **Monitor** job execution in console logs

---

## 📞 Questions?

If you have existing classes created after the initial Agenda setup, they are automatically scheduled when created (no migration needed).

Only use this guide for classes created before Agenda implementation.

