const mongoose = require('mongoose')
const Connection = require('./models/Connection')
const User = require('./models/User')
const Role = require('./models/Role')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill'

const seedConnections = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    // Get expert and student roles
    const expertRole = await Role.findOne({ name: 'expert' })
    const studentRole = await Role.findOne({ name: 'student' })

    if (!expertRole || !studentRole) {
      console.error('Required roles not found. Please run role seeding first.')
      return
    }

    // Get some experts and students
    const experts = await User.find({ roleId: expertRole._id }).limit(5)
    const students = await User.find({ roleId: studentRole._id }).limit(3)

    if (experts.length === 0 || students.length === 0) {
      console.log('No experts or students found. Creating sample users...')
      
      // Create sample expert users
      const sampleExperts = [
        {
          name: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          passwordHash: '$2a$10$example_hash_1', // In real app, hash properly
          roleId: expertRole._id
        },
        {
          name: 'Sarah Chen',
          email: 'sarah.chen@example.com',
          passwordHash: '$2a$10$example_hash_2',
          roleId: expertRole._id
        },
        {
          name: 'David Thompson',
          email: 'david.thompson@example.com',
          passwordHash: '$2a$10$example_hash_3',
          roleId: expertRole._id
        }
      ]

      const sampleStudents = [
        {
          name: 'John Student',
          email: 'john.student@example.com',
          passwordHash: '$2a$10$example_hash_4',
          roleId: studentRole._id
        },
        {
          name: 'Jane Learner',
          email: 'jane.learner@example.com',
          passwordHash: '$2a$10$example_hash_5',
          roleId: studentRole._id
        }
      ]

      const createdExperts = await User.insertMany(sampleExperts)
      const createdStudents = await User.insertMany(sampleStudents)
      
      console.log(`Created ${createdExperts.length} experts and ${createdStudents.length} students`)
      
      // Use the newly created users
      experts.push(...createdExperts)
      students.push(...createdStudents)
    }

    // Clear existing connections
    await Connection.deleteMany({})
    console.log('Cleared existing connections')

    // Create sample connections
    const connections = []
    
    // Each student follows multiple experts
    for (const student of students.slice(0, 2)) { // Take first 2 students
      for (const expert of experts.slice(0, 3)) { // Each follows first 3 experts
        connections.push({
          expertId: expert._id,
          followerId: student._id,
          status: 'accepted',
          connectionType: 'follower',
          connectedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          lastInteraction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
        })
      }
    }

    // Add some pending connections
    if (students.length > 2 && experts.length > 3) {
      connections.push({
        expertId: experts[3]._id,
        followerId: students[2]._id,
        status: 'pending',
        connectionType: 'follower'
      })
    }

    const createdConnections = await Connection.insertMany(connections)
    console.log(`Created ${createdConnections.length} connections`)

    // Log summary
    const stats = await Connection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    console.log('Connection stats:')
    stats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count}`)
    })

    console.log('Connection seeding completed successfully!')

  } catch (error) {
    console.error('Error seeding connections:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedConnections()
}

module.exports = seedConnections