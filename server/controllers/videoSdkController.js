const jwt = require('jsonwebtoken');

// VideoSDK Configuration
const VIDEOSDK_API_KEY = process.env.VIDEOSDK_API_KEY || "eec7bebf-b828-4543-9408-59b3ae3ddbfb";
const VIDEOSDK_SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY || "b0e2b8b04c9dd5e73c8f5fb24d5bf86fa9e96b7ef89cd08e04cd2a89cbe7e9d1";

// Use the working token from the original setup
const WORKING_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJlZWM3YmViZi1iODI4LTQ1NDMtOTQwOC01OWIzYWUzZGRiZmIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sInJvbGVzIjpbInJ0YyJdLCJpYXQiOjE3NjE3MjI1ODEsImV4cCI6MTkxOTUxMDU4MX0._QKxeYcpEXh1aKKOHKd2DYJ3gQAVcdTFQu7Vh6r7HNE";

// Generate VideoSDK token
exports.generateToken = async (req, res) => {
  try {
    // Return the working token
    res.json({
      success: true,
      token: WORKING_TOKEN
    });
  } catch (error) {
    console.error('Error generating VideoSDK token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate token',
      error: error.message
    });
  }
};

// Create a meeting room via VideoSDK API
exports.createMeeting = async (req, res) => {
  try {
    console.log('� Using working token to create meeting');
    
    // Use the working token that was successful before
    const response = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'authorization': WORKING_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    console.log('📡 VideoSDK API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ VideoSDK API Error:', errorText);
      throw new Error(`VideoSDK API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Meeting created successfully:', data.roomId);

    res.json({
      success: true,
      meetingId: data.roomId,
      token: WORKING_TOKEN  // Return the same working token for the client
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting',
      error: error.message
    });
  }
};

// Validate a meeting exists
exports.validateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    // Validate meeting using the working token
    const response = await fetch(`https://api.videosdk.live/v2/rooms/validate/${meetingId}`, {
      method: 'GET',
      headers: {
        'authorization': WORKING_TOKEN,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return res.json({ success: false, valid: false });
    }

    const data = await response.json();

    res.json({
      success: true,
      valid: data.roomId === meetingId,
      token: WORKING_TOKEN
    });
  } catch (error) {
    console.error('Error validating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate meeting',
      error: error.message
    });
  }
};
