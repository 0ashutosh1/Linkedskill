const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const router = express.Router();

// Environment variables for LiveKit (these should be set in your .env file)
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_SECRET_KEY = process.env.LIVEKIT_SECRET_KEY || 'secret';

// Generate access token for LiveKit
router.post('/token', async (req, res) => {
  try {
    const { roomName, participantName, isInstructor } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ 
        error: 'Room name and participant name are required' 
      });
    }

    // Create access token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_SECRET_KEY, {
      identity: participantName,
      name: participantName,
    });

    // Set permissions based on role
    if (isInstructor) {
      // Instructors can publish video, audio, and screen share
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
        // Additional instructor permissions
        roomAdmin: true,
        roomCreate: true,
      });
    } else {
      // Students can subscribe and potentially publish (based on instructor permission)
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: false, // Can be enabled by instructor during class
        canPublishData: true, // For chat messages
        canUpdateOwnMetadata: true,
      });
    }

    const token = at.toJwt();

    res.json({
      token,
      serverUrl: process.env.LIVEKIT_WS_URL || 'ws://localhost:7880',
      roomName,
      participantName,
      isInstructor
    });

  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({ 
      error: 'Failed to generate access token',
      details: error.message 
    });
  }
});

// Get room information
router.get('/room/:roomName', async (req, res) => {
  try {
    const { roomName } = req.params;
    
    // In a real implementation, you would use the LiveKit API to get room info
    // For now, return a mock response
    res.json({
      roomName,
      numParticipants: 0,
      maxParticipants: 50,
      creationTime: new Date().toISOString(),
      emptyTimeout: 300, // 5 minutes
      status: 'active'
    });

  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({ 
      error: 'Failed to get room information',
      details: error.message 
    });
  }
});

// End/close a room (instructor only)
router.delete('/room/:roomName', async (req, res) => {
  try {
    const { roomName } = req.params;
    
    // In a real implementation, you would use the LiveKit API to end the room
    // For now, return a success response
    res.json({
      message: `Room ${roomName} has been ended`,
      roomName
    });

  } catch (error) {
    console.error('Error ending room:', error);
    res.status(500).json({ 
      error: 'Failed to end room',
      details: error.message 
    });
  }
});

module.exports = router;