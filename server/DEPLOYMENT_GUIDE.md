# 🚀 Deployment Guide - Agenda Implementation

**Date**: October 31, 2025  
**Version**: 1.0  
**Status**: Ready for Production

---

## 📋 Pre-Deployment Checklist

- [ ] Development server runs without errors
- [ ] All syntax validated
- [ ] MongoDB connection verified
- [ ] Package.json updated with new dependency
- [ ] All new files in version control
- [ ] Documentation reviewed
- [ ] Team briefed on changes

---

## 🔄 Deployment Steps

### Step 1: Backup Database ⚠️
**Critical**: Always backup before deploying

```bash
# Backup MongoDB
mongodump --uri="your_connection_string" --out ./backup_$(date +%Y%m%d)

# Verify backup
ls -lah backup_20251031/
```

### Step 2: Pull Latest Code
```bash
git pull origin master
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install `@hokify/agenda` and any other new dependencies.

### Step 4: Verify Environment Variables
```bash
# Check .env file has:
MONGODB_URI=... ✓
JWT_SECRET=... ✓
PORT=4000 ✓
NODE_ENV=production ✓  # Important!
```

### Step 5: Restart Application

#### Option A: Manual Restart
```bash
# Stop current process
kill <pid>

# Or if using PM2:
pm2 restart index.js

# Start application
npm start
```

#### Option B: PM2 Ecosystem File (Recommended)
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'coursue-server',
    script: './index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Then restart:
```bash
pm2 start ecosystem.config.js
pm2 logs  # Monitor logs
```

### Step 6: Verify Deployment

#### Check Server Started
```bash
curl http://localhost:4000/
# Should return: { ok: true, message: 'Auth API running' }
```

#### Check Logs for Agenda
```bash
# Should see these messages:
tail -f logs/out.log | grep -i "agenda\|mongodb"

# Expected:
# ✅ Agenda connected to MongoDB successfully
# ✅ Agenda jobs defined and ready
# ✅ Agenda job scheduler is running
```

#### Test Endpoints
```bash
# Get scheduler stats
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:4000/jobs/stats

# Should return stats object
```

### Step 7: Migrate Existing Classes (If Any)

If you have classes created before Agenda implementation:

```bash
npm run migrate:agenda

# Expected output:
# 🚀 Starting migration to Agenda job scheduling...
# ✅ Connected to MongoDB
# ✅ Agenda initialized
# 📊 Found X scheduled classes
# ...
# 🎉 Migration completed successfully!
```

### Step 8: Monitor First 24 Hours

```bash
# Watch logs continuously
pm2 logs index.js

# Check for:
# ✅ Jobs executing on schedule
# ✅ Notifications being sent
# ✅ No error messages
# ✅ Status updates working

# Monitor with PM2
pm2 monit
```

---

## 🔍 Post-Deployment Verification

### 1. Database Verification
```javascript
// Check agendaJobs collection exists
db.agendaJobs.count()
// Should return: number > 0

// View recent jobs
db.agendaJobs.find().sort({ createdAt: -1 }).limit(5)
```

### 2. API Verification
```bash
# Stats endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/jobs/stats

# Should return healthy stats

# All jobs
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/jobs | jq '.count'
```

### 3. Job Execution Verification
Create a test class with startTime 2 minutes in future:
```bash
POST /classes
{
  "title": "Deployment Test",
  "startTime": "2025-10-31T15:30:00Z",  # 2 min from now
  "duration": 30
}
```

Monitor logs for job execution:
```bash
# Should see:
# ✅ Scheduled class_send_reminder job
# ✅ Scheduled class_go_live job
# ✅ Scheduled class_end_session job

# At scheduled time:
# 🔴 LIVE NOW: Class "Deployment Test" is now live
# 📢 Sent notifications to X attendees
```

---

## 🔄 Rollback Procedure (If Issues)

If you need to rollback:

### Step 1: Stop Application
```bash
pm2 stop index.js
# or kill the process
```

### Step 2: Revert Code
```bash
git revert HEAD
# or git checkout <previous_commit>
npm install
```

### Step 3: Restore Backup (If DB Changed)
```bash
# Only if you modified database structure
mongorestore --uri="your_connection_string" ./backup_20251031/
```

### Step 4: Restart
```bash
npm start
```

### Step 5: Verify
```bash
curl http://localhost:4000/
```

---

## 📊 Production Configuration

### Environment Variables
```bash
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@host/db
JWT_SECRET=your-secret-key
```

### PM2 Configuration
```bash
# Max memory
pm2 start index.js --max-memory-restart 500M

# Auto-restart on crashes
pm2 set pm2-logrotate-dateformat YYYY-MM-DD_HH-mm-ss

# Log rotation
pm2 install pm2-logrotate
```

### MongoDB Configuration
```javascript
// Ensure index for optimal performance
db.agendaJobs.createIndex({
  "name": 1,
  "nextRunAt": 1,
  "priority": -1,
  "lockedAt": 1,
  "disabled": 1
}, { name: "findAndLockNextJobIndex" });
```

---

## 🎛️ Monitoring Setup

### Real-time Logs
```bash
# With PM2
pm2 logs index.js -n 50

# With tail
tail -f /var/log/coursue/app.log
```

### Health Check Endpoint
Add to your monitoring system:
```bash
curl http://localhost:4000/  # Every 5 minutes
```

### Job Monitoring
```bash
# Check stats periodically
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/jobs/stats

# Alert on failed > 3
# Alert on total > expected
```

### Database Monitoring
```bash
# Monitor agendaJobs collection size
db.agendaJobs.stats().size

# Monitor query performance
db.agendaJobs.find().explain("executionStats")
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Agenda not initialized"
**Solution**: 
- Wait 5 seconds after startup
- Check MongoDB connected: `db.adminCommand({ ping: 1 })`
- Check logs: `pm2 logs`

### Issue: Jobs not running
**Solution**:
- Verify startTime is in future
- Check MongoDB connection
- Verify processEvery setting (default 5s)
- Check for failed jobs: `GET /jobs/stats`

### Issue: High memory usage
**Solution**:
- Reduce `maxConcurrency` in scheduler.js
- Clean up old completed jobs
- Increase `processEvery` interval
- Monitor with: `pm2 monit`

### Issue: Slow API responses
**Solution**:
- Check MongoDB indexes created
- Run: `db.agendaJobs.createIndex(...)`
- Monitor MongoDB performance
- Consider query optimization

---

## 📈 Performance Tuning

### Increase Concurrency (If System Has Resources)
File: `lib/scheduler.js`
```javascript
maxConcurrency: 50,           // From 20
defaultConcurrency: 20,        // From 10
```

### Decrease Check Frequency (If High DB Load)
```javascript
processEvery: '10 seconds',    // From '5 seconds'
```

### Adjust Lock Timeout (For Long-Running Jobs)
```javascript
defaultLockLifetime: 20 * 60 * 1000,  // From 10 minutes
```

---

## 🔒 Security Checklist

- [ ] JWT authentication enabled on `/jobs/*` endpoints
- [ ] Environment variables secured (not in git)
- [ ] Database credentials in .env only
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured (optional)
- [ ] CORS configured properly
- [ ] Agendash dashboard secured (if used)

---

## 📞 Support During Deployment

### Deployment Team
- Have access to: MongoDB admin, server SSH, GitHub
- Keep logs open for real-time monitoring
- Have rollback plan ready

### Communication
- Notify team before deployment
- Provide status updates during deploy
- Confirm all systems working post-deploy

---

## 📋 Deployment Verification Checklist

```
✅ Code deployed
✅ Dependencies installed
✅ Server started successfully
✅ Logs show Agenda initialized
✅ API endpoints responding
✅ Database connection verified
✅ Jobs being created
✅ Jobs executing on schedule
✅ Notifications being sent
✅ Statistics endpoint working
✅ No error messages in logs
✅ Database indexes verified
✅ Performance monitoring active
✅ Backup completed
```

---

## 🎯 Success Criteria

Deployment is successful when:

1. **Server Health**
   - ✅ `GET /` returns 200
   - ✅ No errors in logs
   - ✅ Processes running normally

2. **Agenda Health**
   - ✅ `✅ Agenda connected to MongoDB successfully` in logs
   - ✅ `✅ Agenda jobs defined and ready` in logs
   - ✅ `✅ Agenda job scheduler is running` in logs

3. **Database Health**
   - ✅ `agendaJobs` collection has documents
   - ✅ Indexes created successfully
   - ✅ No connection errors

4. **Job Execution**
   - ✅ New classes schedule jobs automatically
   - ✅ Jobs execute at scheduled times
   - ✅ Notifications sent successfully
   - ✅ Class status updates correctly

5. **API Health**
   - ✅ `/jobs/stats` returns correct data
   - ✅ `/jobs` lists all jobs
   - ✅ `/jobs/class/{id}` lists class jobs
   - ✅ Authentication working

---

## 📞 Deployment Support

**Questions during deployment?**

1. Check `QUICK_REFERENCE.md` for common issues
2. Check `AGENDA_SETUP.md` for troubleshooting
3. Check logs: `pm2 logs index.js`
4. Query database: `db.agendaJobs.find().pretty()`

---

## ✅ Final Checklist

Before calling deployment complete:

- [ ] Server running without errors
- [ ] All endpoints responding
- [ ] Logs clean and informative
- [ ] Jobs creating successfully
- [ ] Jobs executing at scheduled times
- [ ] Database backed up
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation updated

---

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Verified By**: ________________  
**Status**: ✅ SUCCESSFUL  

---

**After Deployment**: Monitor the first 24 hours closely for any issues!

For questions or issues, refer to documentation files:
- Quick Reference: `QUICK_REFERENCE.md`
- Main Guide: `README_AGENDA.md`
- Troubleshooting: `AGENDA_SETUP.md`

