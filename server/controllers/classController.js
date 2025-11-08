const Class = require('../models/Class');
const User = require('../models/User');
const Role = require('../models/Role');
const Notification = require('../models/Notification');
const { 
  scheduleClassGoLive, 
  scheduleClassReminder, 
  scheduleClassEnd, 
  cancelClassJobs 
} = require('../lib/agendaHelpers');

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
    
    // Schedule Agenda jobs for automatic lifecycle management
    try {
      await scheduleClassGoLive(newClass);
      await scheduleClassReminder(newClass);
      await scheduleClassEnd(newClass);
    } catch (jobError) {
      console.error('⚠️  Error scheduling class jobs:', jobError);
      // Don't fail class creation if job scheduling fails
    }
    
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

// Get classes where user is registered as attendee
exports.getRegisteredClasses = async (req, res) => {
  try {
    const userId = req.user.sub; // Get from authenticated user
    
    const classes = await Class.find({ 
      attendees: userId // Find classes where user is in attendees array
    })
      .populate('userId', 'name email')
      .populate('attendees', 'name email')
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')
      .sort({ date: -1 });
    
    res.json({ classes });
  } catch (err) {
    console.error('Error fetching registered classes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all classes related to user (both created and registered)
exports.getMyClasses = async (req, res) => {
  try {
    const userId = req.user.sub; // Get from authenticated user
    
    // Find classes created by user OR where user is attendee
    const classes = await Class.find({
      $or: [
        { userId: userId }, // Classes created by user
        { attendees: userId } // Classes user is registered for
      ]
    })
      .populate('userId', 'name email')
      .populate('attendees', 'name email')
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')
      .sort({ date: -1 });
    
    res.json({ classes });
  } catch (err) {
    console.error('Error fetching my classes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a class
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, duration, image, categoryId, subCategoryId, meetingId, status, liveUrl } = req.body;
    
    // Single query with authorization check
    const classData = await Class.findOne({ _id: id, userId: req.user.sub });
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found or not authorized' });
    }
    
    // Track if we need to reschedule jobs
    const dateChanged = date && date !== classData.date;
    const startTimeChanged = startTime && startTime !== classData.startTime;
    const shouldReschedule = dateChanged || startTimeChanged;
    
    // Build update object dynamically (only update provided fields)
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (startTime !== undefined) updates.startTime = startTime;
    if (duration !== undefined) updates.duration = duration;
    if (image !== undefined) updates.image = image;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (subCategoryId !== undefined) updates.subCategoryId = subCategoryId;
    if (meetingId !== undefined) updates.meetingId = meetingId;
    if (status !== undefined) updates.status = status;
    if (liveUrl !== undefined) updates.liveUrl = liveUrl;
    
    // Perform atomic update
    Object.assign(classData, updates);
    await classData.save();
    
    // Reschedule jobs if date/time changed
    if (shouldReschedule && classData.status === 'scheduled') {
      try {
        await cancelClassJobs(id);
        await Promise.all([
          scheduleClassGoLive(classData),
          scheduleClassReminder(classData),
          scheduleClassEnd(classData)
        ]);
      } catch (jobError) {
        console.error('⚠️  Error rescheduling class jobs:', jobError);
      }
    }
    
    console.log('✅ Class updated successfully:', id);
    
    res.json({ 
      message: 'Class updated successfully', 
      class: classData 
    });
  } catch (err) {
    console.error('❌ Error updating class:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Delete a class
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Single query with authorization check and deletion
    const classData = await Class.findOneAndDelete({ 
      _id: id, 
      userId: req.user.sub 
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found or not authorized' });
    }
    
    // Perform cleanup operations asynchronously (don't wait for them)
    Promise.all([
      // Cancel scheduled jobs
      cancelClassJobs(id).catch(err => 
        console.error('⚠️  Error cancelling class jobs:', err)
      ),
      // Delete notifications related to this class (optional cleanup)
      Notification.deleteMany({ 
        message: { $regex: classData.title, $options: 'i' } 
      }).catch(err => 
        console.error('⚠️  Error deleting notifications:', err)
      )
    ]);
    
    console.log('✅ Class deleted successfully:', id);
    
    res.json({ 
      message: 'Class deleted successfully',
      deletedClass: {
        id: classData._id,
        title: classData.title
      }
    });
  } catch (err) {
    console.error('❌ Error deleting class:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
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

// Start a class (only for class owner - provides manual override)
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

// Upload class thumbnail to Cloudinary
exports.uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { uploadToCloudinary, deleteFromCloudinary, extractPublicId } = require('../utils/cloudinaryHelper');
    const { id } = req.params;
    const userId = req.user.sub;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if user is the owner of the class
    if (classData.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the class instructor can update the thumbnail' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'thumbnails');
    const thumbnailUrl = result.secure_url;

    // Delete old thumbnail from Cloudinary if exists
    if (classData.image) {
      try {
        const oldPublicId = extractPublicId(classData.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      } catch (deleteError) {
        console.error('Error deleting old thumbnail:', deleteError);
        // Continue even if deletion fails
      }
    }

    classData.image = thumbnailUrl;
    await classData.save();

    res.json({
      message: 'Class thumbnail uploaded successfully',
      thumbnailUrl,
      class: classData
    });
  } catch (err) {
    console.error('Error uploading thumbnail:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
