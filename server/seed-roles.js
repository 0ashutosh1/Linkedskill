require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/Role');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coursue-dev';

const roles = [
  {
    name: 'student',
    displayName: 'Student',
    description: 'User who enrolls in and attends classes'
  },
  {
    name: 'expert',
    displayName: 'Expert',
    description: 'User who creates and teaches classes'
  }
];

async function seedRoles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing roles
    console.log('\nClearing existing roles...');
    await Role.deleteMany({});
    console.log('✓ Cleared existing roles');

    console.log('\nSeeding roles...');
    
    for (const roleData of roles) {
      const role = new Role(roleData);
      await role.save();
      console.log(`✓ Created role: ${roleData.displayName} (${roleData.name}) - ID: ${role._id}`);
    }

    console.log('\n✅ Roles seeded successfully!');
    console.log(`   Total roles: ${roles.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    process.exit(1);
  }
}

seedRoles();
