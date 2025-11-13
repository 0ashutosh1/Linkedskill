require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { initializeAgenda, stopAgenda } = require('./lib/scheduler');
const { defineClassJobs } = require('./jobs/classJobs');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/class');
const notificationRoutes = require('./routes/notification');
const profileRoutes = require('./routes/profile');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subCategory');
const roleRoutes = require('./routes/role');
const connectionRoutes = require('./routes/connection');
const messageRoutes = require('./routes/message');
const expertsRoutes = require('./routes/experts');
const videosdkRoutes = require('./routes/videosdk');
const jobsRoutes = require('./routes/jobs');
const reviewRoutes = require('./routes/review');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/classes', classRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profile', profileRoutes);
app.use('/categories', categoryRoutes);
app.use('/subcategories', subCategoryRoutes);
app.use('/roles', roleRoutes);
app.use('/connections', connectionRoutes);
app.use('/messages', messageRoutes);
app.use('/experts', expertsRoutes);
app.use('/videosdk', videosdkRoutes);
app.use('/jobs', jobsRoutes);
app.use('/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Auth API running' });
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill';

const mongoose = require('mongoose');

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // JWT uses 'sub' field for user ID (standard JWT practice)
    const userId = decoded.sub || decoded.userId;
    socket.userId = userId;
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Apply authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle joining connection rooms
  socket.on('join_connection', (connectionId) => {
    socket.join(`connection_${connectionId}`);
    console.log(`User ${socket.userId} joined connection ${connectionId}`);
  });
  
  // Handle leaving connection rooms
  socket.on('leave_connection', (connectionId) => {
    socket.leave(`connection_${connectionId}`);
    console.log(`User ${socket.userId} left connection ${connectionId}`);
  });
  
  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`connection_${data.connectionId}`).emit('user_typing', {
      userId: socket.userId,
      connectionId: data.connectionId
    });
  });
  
  socket.on('typing_stop', (data) => {
    socket.to(`connection_${data.connectionId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      connectionId: data.connectionId
    });
  });
  
  // Handle real-time message sending
  socket.on('send_message', async (data) => {
    try {
      const { connectionId, content } = data;
      console.log('📨 Received send_message event:', { connectionId, content, userId: socket.userId });
      
      // Import Message model
      const Message = require('./models/Message');
      const Connection = require('./models/Connection');
      
      // Verify connection exists and user is part of it
      const connection = await Connection.findById(connectionId);
      if (!connection) {
        socket.emit('message_error', { error: 'Connection not found' });
        return;
      }
      
      // Check if connection has valid expertId and followerId fields
      if (!connection.expertId || !connection.followerId) {
        socket.emit('message_error', { error: 'Invalid connection data' });
        return;
      }
      
      if (connection.followerId.toString() !== socket.userId && connection.expertId.toString() !== socket.userId) {
        socket.emit('message_error', { error: 'Unauthorized' });
        return;
      }
      
      // Create and save message
      const message = new Message({
        senderId: socket.userId,
        receiverId: connection.followerId.toString() === socket.userId ? connection.expertId : connection.followerId,
        connectionId: connectionId,
        content: content.trim()
      });
      
      await message.save();
      await message.populate(['senderId', 'receiverId']);
      
      // Emit message to connection room
      const messageData = {
        _id: message._id,
        sender: {
          _id: message.senderId._id,
          name: message.senderId.name
        },
        receiver: {
          _id: message.receiverId._id,
          name: message.receiverId.name
        },
        content: message.content,
        timestamp: message.createdAt,
        read: message.isRead,
        connection: connectionId
      };
      
      console.log('📤 Emitting new_message to room:', `connection_${connectionId}`);
      console.log('📤 Message data:', messageData);
      io.to(`connection_${connectionId}`).emit('new_message', messageData);
      
      // Send notification to receiver if they're not in the chat
      const receiverId = message.receiverId._id || message.receiverId;
      const senderId = message.senderId._id || message.senderId;
      
      const receiverSocketId = [...io.sockets.sockets.values()]
        .find(s => s.userId === receiverId.toString())?.id;
        
      if (receiverSocketId) {
        io.to(`user_${receiverId}`).emit('new_message_notification', {
          connectionId,
          senderName: message.senderId.name || 'Unknown',
          content: message.content,
          timestamp: message.createdAt
        });
      }
      
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle message read status updates
  socket.on('mark_messages_read', async (data) => {
    try {
      const { connectionId } = data;
      const Message = require('./models/Message');
      
      await Message.updateMany(
        { 
          connectionId: connectionId, 
          receiverId: socket.userId, 
          isRead: false 
        },
        { isRead: true, readAt: new Date() }
      );
      
      // Notify other users in the connection that messages were read
      socket.to(`connection_${connectionId}`).emit('messages_read', {
        connectionId,
        readBy: socket.userId
      });
      
    } catch (error) {
      console.error('Socket read status error:', error);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    // Initialize Agenda after successful MongoDB connection
    try {
      const agenda = await initializeAgenda(MONGODB_URI);
      defineClassJobs(agenda);
      console.log('✅ Agenda jobs defined and ready');
      
      // Make agenda available globally for controllers
      global.agenda = agenda;
    } catch (err) {
      console.error('⚠️  Warning: Failed to initialize Agenda, continuing without job scheduler:', err.message);
    }

    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log('Socket.IO enabled for real-time chat');
      console.log('Agenda job scheduler is running');
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1);
  });

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  try {
    await stopAgenda();
  } catch (err) {
    console.error('Error stopping Agenda:', err);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, io };
