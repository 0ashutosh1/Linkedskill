import { AccessToken } from 'livekit-server-sdk'

// LiveKit configuration
const LIVEKIT_API_KEY = process.env.REACT_APP_LIVEKIT_API_KEY || 'devkey'
const LIVEKIT_SECRET_KEY = process.env.REACT_APP_LIVEKIT_SECRET_KEY || 'secret'
const LIVEKIT_WS_URL = process.env.REACT_APP_LIVEKIT_WS_URL || 'ws://localhost:7880'

export const generateToken = async (roomName, participantName, isInstructor = false) => {
  try {
    // For development, we'll create a simple token
    // In production, this should be done on your backend server
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_SECRET_KEY, {
      identity: participantName,
      name: participantName,
    })

    // Grant permissions based on role
    if (isInstructor) {
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: true,
        roomCreate: true,
      })
    } else {
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: false, // Students can't publish by default
        canSubscribe: true,
        canPublishData: true, // For chat
      })
    }

    return at.toJwt()
  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    throw error
  }
}

export const getLiveKitConfig = () => ({
  serverUrl: LIVEKIT_WS_URL,
  apiKey: LIVEKIT_API_KEY,
  secretKey: LIVEKIT_SECRET_KEY,
})

// Mock token generation for development
export const generateMockToken = (roomName, participantName, isInstructor = false) => {
  // In development without a LiveKit server, return a mock token
  return Promise.resolve(`mock-token-${participantName}-${roomName}-${isInstructor ? 'instructor' : 'student'}`)
}