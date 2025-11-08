/**
 * Test script to manually create a class reminder notification
 * Run with: node server/test-notification.js <classId> <userId>
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill';

async function testNotification() {
  const classId = process.argv[2];
  const userId = process.argv[3] || '673e3d57dc77a5b8c9fb2d6b'; // Default test user

  if (!classId) {
    console.log('Usage: node server/test-notification.js <classId> [userId]');
    console.log('\nExample: node server/test-notification.js 690f16aff256576c1f52737e');
    process.exit(1);
  }

  console.log('🔍 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');

  const Class = require('./models/Class');
  const Notification = require('./models/Notification');

  // Get the class
  const classData = await Class.findById(classId).populate('userId', 'name');
  
  if (!classData) {
    console.log('❌ Class not found!');
    process.exit(1);
  }

  console.log('📚 Class Found:');
  console.log(`   Title: ${classData.title}`);
  console.log(`   Instructor: ${classData.userId?.name || 'Unknown'}`);
  console.log(`   Start Time: ${new Date(classData.startTime).toLocaleString()}`);
  console.log(`   Attendees: ${classData.attendees.length}\n`);

  if (classData.attendees.length === 0) {
    console.log('⚠️  No attendees registered for this class!');
    console.log('   Notification cannot be sent.\n');
    process.exit(0);
  }

  // Create test notification
  console.log('📨 Creating test reminder notification...\n');

  const notifications = classData.attendees.map(attendeeId => ({
    type: 'class_reminder',
    message: `⏰ Reminder: "${classData.title}" starts in 15 minutes! Get ready to join.`,
    senderId: classData.userId._id,
    receiverId: attendeeId,
    priority: 'high',
    createdAt: new Date()
  }));

  await Notification.insertMany(notifications);

  console.log(`✅ Sent ${notifications.length} reminder notification(s)!\n`);
  console.log('Recipients:');
  notifications.forEach((notif, index) => {
    console.log(`   ${index + 1}. User ID: ${notif.receiverId}`);
  });

  console.log('\n✅ Done! Check the notifications page in the app.');
  
  await mongoose.disconnect();
  process.exit(0);
}

testNotification().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
