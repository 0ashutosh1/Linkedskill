const Class = require('../models/Class');
const User = require('../models/User');
const Role = require('../models/Role');
const Notification = require('../models/Notification');

// Create a new class
exports.createClass = async (req, res) => {
  try {
    const { title, description, date, startTime, duration, image, categoryId, subCategoryId, liveUrl } = req.body;
    console.log('Create class request:', { title, description, date, startTime, duration, categoryId, subCategoryId, userId: req.user.sub });
    
    if (!title || !description || !date || !startTime) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Title, description, date, and start time are required' });
    }

    const newClass = new Class({
      title,
      description,
      date,
      startTime,
      duration: duration || 60,
      userId: req.user.sub, // From authenticated user
      image: image || '',
      categoryId,
      subCategoryId,
      interestedCount: 0,
      totalAttended: 0,
      attendees: [],
      status: 'scheduled',
      liveUrl: liveUrl || ''
    });

    await newClass.save();
    
    // Send notifications to all student users
    try {
      // Find the student role
      const studentRole = await Role.findOne({ name: 'student' });
      if (studentRole) {
        // Find all users with student role
        const studentUsers = await User.find({ roleId: studentRole._id });
        
        // Create notifications for each student
        const notifications = studentUsers.map(student => ({
          type: 'announcement',
          message: `🎓 New class available: "${title}" - Join this exciting learning opportunity!`,
          senderId: req.user.sub, // Expert who created the class
          receiverId: student._id,
          priority: 'normal'
        }));
        
        // Bulk insert notifications
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the class creation if notifications fail
    }
    
    res.status(201).json({ 
      message: 'Class created successfully', 
      class: newClass 
    });
  } catch (err) {
    console.error('❌ Error creating class:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get all classes (with optional category filter)
exports.getAllClasses = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.query;
    
    // Build filter object
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (subCategoryId) filter.subCategoryId = subCategoryId;
    
    const classes = await Class.find(filter)
      .populate('userId', 'name email')
      .populate('attendees', 'name email')
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')
      .sort({ date: -1 });
    
    res.json({ classes });
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single class by ID
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findById(id)
      .populate('userId', 'name email')
      .populate('attendees', 'name email')
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description');
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ class: classData });
  } catch (err) {
    console.error('Error fetching class:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get classes by user ID (classes created by a specific user)
exports.getClassesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const classes = await Class.find({ userId })
      .populate('userId', 'name email')
      .populate('attendees', 'name email')
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')
      .sort({ date: -1 });
    
    res.json({ classes });
  } catch (err) {
    console.error('Error fetching user classes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a class
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, image, categoryId, subCategoryId } = req.body;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if the user is the owner of the class
    if (classData.userId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Not authorized to update this class' });
    }
    
    // Update fields
    if (title) classData.title = title;
    if (description) classData.description = description;
    if (date) classData.date = date;
    if (image !== undefined) classData.image = image;
    if (categoryId !== undefined) classData.categoryId = categoryId;
    if (subCategoryId !== undefined) classData.subCategoryId = subCategoryId;
    
    await classData.save();
    res.json({ 
      message: 'Class updated successfully', 
      class: classData 
    });
  } catch (err) {
    console.error('Error updating class:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a class
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if the user is the owner of the class
    if (classData.userId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Not authorized to delete this class' });
    }
    
    await Class.findByIdAndDelete(id);
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add attendee to a class
exports.addAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if user is already an attendee
    if (classData.attendees.includes(userId)) {
      return res.status(400).json({ error: 'User is already registered for this class' });
    }
    
    classData.attendees.push(userId);
    classData.interestedCount += 1;
    
    await classData.save();
    res.json({ 
      message: 'Successfully registered for class', 
      class: classData 
    });
  } catch (err) {
    console.error('Error adding attendee:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove attendee from a class
exports.removeAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if user is an attendee
    const attendeeIndex = classData.attendees.indexOf(userId);
    if (attendeeIndex === -1) {
      return res.status(400).json({ error: 'User is not registered for this class' });
    }
    
    classData.attendees.splice(attendeeIndex, 1);
    classData.interestedCount = Math.max(0, classData.interestedCount - 1);
    
    await classData.save();
    res.json({ 
      message: 'Successfully unregistered from class', 
      class: classData 
    });
  } catch (err) {
    console.error('Error removing attendee:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark attendance (increment totalAttended)
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if user is the owner or an attendee
    if (classData.userId.toString() !== userId && !classData.attendees.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    classData.totalAttended += 1;
    
    await classData.save();
    res.json({ 
      message: 'Attendance marked successfully', 
      class: classData 
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Start a class (only for class owner)
exports.startClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { liveUrl } = req.body;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if user is the owner of the class
    if (classData.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the class instructor can start the class' });
    }
    
    // Check if class is scheduled
    if (classData.status !== 'scheduled') {
      return res.status(400).json({ error: 'Class cannot be started. Current status: ' + classData.status });
    }
    
    // Check if current time is within 10 minutes before start time
    const now = new Date();
    const startTime = new Date(classData.startTime);
    const tenMinutesBefore = new Date(startTime.getTime() - 10 * 60 * 1000);
    
    if (now < tenMinutesBefore) {
      const timeUntilStart = Math.ceil((tenMinutesBefore - now) / (1000 * 60));
      return res.status(400).json({ 
        error: `Class can only be started ${timeUntilStart} minutes before the scheduled time` 
      });
    }
    
    // Update class status to live
    classData.status = 'live';
    if (liveUrl) {
      classData.liveUrl = liveUrl;
    }
    
    await classData.save();
    
    // Send notifications to all attendees
    try {
      const notifications = classData.attendees.map(attendeeId => ({
        type: 'class_started',
        message: `🔴 LIVE NOW: "${classData.title}" has started! Join now.`,
        senderId: userId,
        receiverId: attendeeId,
        priority: 'high'
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      console.error('Error sending start notifications:', notificationError);
    }
    
    res.json({ 
      message: 'Class started successfully', 
      class: classData 
    });
  } catch (err) {
    console.error('Error starting class:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// End a class (only for class owner)
exports.endClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if user is the owner of the class
    if (classData.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the class instructor can end the class' });
    }
    
    // Check if class is live
    if (classData.status !== 'live') {
      return res.status(400).json({ error: 'Class is not currently live' });
    }
    
    // Update class status to completed
    classData.status = 'completed';
    
    await classData.save();
    
    res.json({ 
      message: 'Class ended successfully', 
      class: classData 
    });
  } catch (err) {
    console.error('Error ending class:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
