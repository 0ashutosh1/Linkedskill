const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function checkNotifications() {
  try {
    // Get all notifications
    const allNotifications = await Notification.find({});
    console.log('\n📬 Total notifications in database:', allNotifications.length);
    
    if (allNotifications.length > 0) {
      console.log('\n📋 All notifications:');
      for (const notif of allNotifications) {
        console.log(`\n- ID: ${notif._id}`);
        console.log(`  Type: ${notif.type}`);
        console.log(`  Message: ${notif.message}`);
        console.log(`  SenderId: ${notif.senderId}`);
        console.log(`  ReceiverId: ${notif.receiverId}`);
        console.log(`  Read: ${notif.is_read}`);
        console.log(`  Created: ${notif.createdAt}`);
      }
    }

    // Get all users
    const users = await User.find({}).select('_id name email');
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`- ${user._id} | ${user.name} | ${user.email}`);
    });

    // Check notifications per user
    console.log('\n📊 Notifications per user:');
    for (const user of users) {
      const userNotifications = await Notification.find({ receiverId: user._id });
      console.log(`${user.name}: ${userNotifications.length} notifications`);
    }

  } catch (error) {
    console.error('Error checking notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkNotifications();
