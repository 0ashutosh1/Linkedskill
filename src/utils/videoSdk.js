// VideoSDK Configuration and API utilities
import { API_BASE_URL } from '../config';

// Cache for the auth token
let cachedToken = null;
let tokenExpiry = null;

// Get or fetch VideoSDK token from server
export const getAuthToken = async () => {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/videosdk/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.token;
    tokenExpiry = Date.now() + (8 * 24 * 60 * 60 * 1000); // Cache for 8 days
    
    return cachedToken;
  } catch (error) {
    console.error('Error fetching VideoSDK token:', error);
    throw error;
  }
};

// Note: Use getAuthToken() to fetch a fresh token before creating/joining meetings

// API call to create a meeting room via our backend
export const createMeeting = async () => {
  try {
    console.log("📡 Creating meeting via backend API...");
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/videosdk/create-meeting`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("📥 API Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.meetingId) {
      throw new Error("No meetingId received from API");
    }

    // Update cached token if provided
    if (data.token) {
      cachedToken = data.token;
      tokenExpiry = Date.now() + (8 * 24 * 60 * 60 * 1000);
      console.log("🔑 Cached fresh VideoSDK token");
    }

    console.log("✅ Meeting room created:", data.meetingId);
    // Return both meetingId and token
    return {
      meetingId: data.meetingId,
      token: data.token || cachedToken
    };
  } catch (error) {
    console.error("Failed to create meeting:", error);
    throw error;
  }
};

// API call to validate a meeting exists
export const validateMeeting = async (meetingId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/videosdk/validate/${meetingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success && data.valid;
  } catch (error) {
    console.warn("Meeting validation failed:", error);
    return true; // Assume valid if validation endpoint fails
  }
};
