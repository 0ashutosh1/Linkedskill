require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role'); // Import Role model

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/test';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find all users and check their roles
    const users = await User.find({}).populate('roleId').limit(10);
    
    console.log('\n📊 User Role Status:');
    console.log('='.repeat(50));
    
    users.forEach(user => {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Google ID: ${user.googleId || 'N/A'}`);
      console.log(`Has Role: ${user.roleId ? '✅ YES' : '❌ NO'}`);
      if (user.roleId) {
        console.log(`Role Name: ${user.roleId.name}`);
      }
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
