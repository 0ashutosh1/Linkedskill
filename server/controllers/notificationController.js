const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { type, message, receiverId, priority } = req.body;
    
    if (!type || !message || !receiverId) {
      return res.status(400).json({ error: 'Type, message, and receiverId are required' });
    }

    const notification = new Notification({
      type,
      message,
      senderId: req.user.sub, // From authenticated user
      receiverId,
      priority: priority || 'normal',
      is_read: false
    });

    await notification.save();
    res.status(201).json({ 
      message: 'Notification created successfully', 
      notification 
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all notifications for the authenticated user
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    const notifications = await Notification.find({ receiverId: userId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get unread notifications for the authenticated user
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    const notifications = await Notification.find({ 
      receiverId: userId,
      is_read: false 
    })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      notifications,
      count: notifications.length 
    });
  } catch (err) {
    console.error('Error fetching unread notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user is authorized to view this notification
    if (notification.receiverId._id.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Not authorized to view this notification' });
    }
    
    res.json({ notification });
  } catch (err) {
    console.error('Error fetching notification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user is the receiver
    if (notification.receiverId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Not authorized to update this notification' });
    }
    
    notification.is_read = true;
    await notification.save();
    
    res.json({ 
      message: 'Notification marked as read', 
      notification 
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read for the authenticated user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;
    const result = await Notification.updateMany(
      { receiverId: userId, is_read: false },
      { is_read: true }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user is the receiver or sender
    if (notification.receiverId.toString() !== req.user.sub && 
        notification.senderId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Not authorized to delete this notification' });
    }
    
    await Notification.findByIdAndDelete(id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete all read notifications for the authenticated user
exports.deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    const result = await Notification.deleteMany({ 
      receiverId: userId, 
      is_read: true 
    });
    
    res.json({ 
      message: 'Read notifications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting read notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get notifications by type
exports.getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.sub;
    
    const notifications = await Notification.find({ 
      receiverId: userId,
      type 
    })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications by type:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get notifications by priority
exports.getNotificationsByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const userId = req.user.sub;
    
    const notifications = await Notification.find({ 
      receiverId: userId,
      priority 
    })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications by priority:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get connection-related notifications
exports.getConnectionNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const notifications = await Notification.find({ 
      receiverId: userId,
      type: { $in: ['connection_request', 'connection_accepted', 'connection_rejected'] }
    })
      .populate('senderId', 'name email photoUrl')
      .populate('connectionId')
      .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching connection notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle notification action (for connection requests)
exports.handleNotificationAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user.sub;
    
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user is authorized
    if (notification.receiverId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Check if it's a connection request notification
    if (notification.type !== 'connection_request') {
      return res.status(400).json({ error: 'This notification does not support actions' });
    }
    
    // Mark notification as read
    notification.is_read = true;
    await notification.save();
    
    // Return the connectionId for frontend to handle the actual accept/reject
    res.json({ 
      message: 'Notification action processed',
      connectionId: notification.connectionId,
      action: action
    });
    
  } catch (err) {
    console.error('Error handling notification action:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
