import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { getAuthToken, createMeeting } from "../utils/videoSdk";
import { API_BASE_URL } from "../config";

function ParticipantView({ participantId, isHost }) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(e => console.warn("Video play failed:", e));
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch(e => console.warn("Audio play failed:", e));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${
        isHost ? 'border-4 border-blue-500' : 'border-2 border-gray-700'
      } bg-gray-900`}
      style={{ 
        width: isHost ? '100%' : '280px',
        height: isHost ? '500px' : '220px'
      }}
    >
      <div className="absolute top-2 left-2 z-10 bg-black/70 px-3 py-1 rounded-full flex items-center gap-2">
        <span className="text-white text-sm font-semibold">
          {isHost && '👑 '}{isLocal ? "You" : displayName || "Guest"}
        </span>
        <span className={webcamOn ? "text-green-400" : "text-gray-400"}>📹</span>
        <span className={micOn ? "text-green-400" : "text-red-400"}>
          {micOn ? "🎤" : "🔇"}
        </span>
      </div>

      <audio ref={micRef} autoPlay playsInline muted={isLocal} />

      {webcamOn && webcamStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-6xl mb-4">👤</div>
          <div className="text-white text-lg">{isLocal ? "You" : displayName || "Guest"}</div>
          <div className="text-gray-400 text-sm mt-2">Camera Off</div>
        </div>
      )}
    </div>
  );
}

function Controls({ onToggleChat, isHost }) {
  const meetingConfig = useMeeting();
  const { leave, toggleMic, toggleWebcam, localMicOn, localWebcamOn } = meetingConfig || {};

  const handleToggleMic = () => {
    if (toggleMic && typeof toggleMic === 'function') {
      console.log('🎤 Toggling mic, current state:', localMicOn);
      try {
        toggleMic();
      } catch (error) {
        console.error("Error toggling mic:", error);
      }
    }
  };

  const handleToggleWebcam = () => {
    if (toggleWebcam && typeof toggleWebcam === 'function') {
      console.log('📹 Toggling webcam, current state:', localWebcamOn);
      try {
        toggleWebcam();
      } catch (error) {
        console.error("Error toggling webcam:", error);
      }
    }
  };

  const handleLeave = () => {
    if (window.confirm(isHost ? "End class?" : "Leave class?")) {
      if (leave && typeof leave === 'function') {
        console.log('🚪 Leaving meeting...');
        try {
          leave();
        } catch (error) {
          console.error("Error leaving meeting:", error);
        }
      }
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 flex flex-wrap gap-3 items-center justify-center">
      <button
        onClick={handleToggleMic}
        className={`px-6 py-3 rounded-lg font-semibold ${
          localMicOn ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        } text-white`}
      >
        🎤 {localMicOn ? "Mute" : "Unmute"}
      </button>
      <button
        onClick={handleToggleWebcam}
        className={`px-6 py-3 rounded-lg font-semibold ${
          localWebcamOn ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        } text-white`}
      >
        📹 {localWebcamOn ? "Stop Video" : "Start Video"}
      </button>
      <button
        onClick={onToggleChat}
        className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
      >
        💬 Chat
      </button>
      <button
        onClick={handleLeave}
        className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white"
      >
        {isHost ? "🛑 End Class" : "🚪 Leave"}
      </button>
    </div>
  );
}

function ChatPanel({ isOpen, onClose, messages, onSendMessage, localParticipantName, localParticipantId }) {
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 flex justify-between items-center">
        <h3 className="text-lg font-bold">💬 Live Chat</h3>
        <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-5xl mb-4">💬</div>
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMyMessage = msg.senderId === localParticipantId;
            return (
              <div key={idx} className={`mb-4 p-3 rounded-lg shadow-sm ${
                isMyMessage ? "bg-blue-100 border-l-4 border-blue-500" : "bg-gray-100 border-l-4 border-gray-500"
              }`}>
                <div className={`text-sm font-bold mb-1 ${
                  isMyMessage ? "text-blue-700" : "text-gray-900"
                }`}>
                  {isMyMessage ? "You" : msg.senderName || "Guest"}
                </div>
                <div className="text-sm text-gray-800">{msg.message}</div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && inputMessage.trim() && (onSendMessage(inputMessage.trim()), setInputMessage(""))}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border-2 rounded-lg text-gray-800"
          />
          <button
            onClick={() => { if (inputMessage.trim()) { onSendMessage(inputMessage.trim()); setInputMessage(""); }}}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetingView({ classData, meetingId, onMeetingLeave, isInstructor, userName }) {
  const [joined, setJoined] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(isInstructor ? "APPROVED" : "PENDING");
  const [joinRequests, setJoinRequests] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const joinRequestSent = useRef(false);
  const hasJoined = useRef(false);
  const joinCalled = useRef(false);
  const joinTimeout = useRef(null);

  const meetingConfig = useMeeting({
    onMeetingJoined: () => {
      console.log("✅ onMeetingJoined callback fired");
      if (!hasJoined.current) {
        console.log("✅ Setting joined state to JOINED");
        hasJoined.current = true;
        setJoined("JOINED");
      }
    },
    onMeetingLeft: () => {
      console.log("👋 Left meeting, navigating back");
      hasJoined.current = false;
      onMeetingLeave();
    },
    onError: (error) => {
      console.error("❌ Meeting error:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      
      // Handle specific error cases
      if (error?.code === 4009 || error?.message?.includes("max partcipant")) {
        alert("⚠️ Maximum participant limit reached! Only 2 participants allowed in free plan.\n\nPlease wait for others to leave or upgrade your plan.");
        onMeetingLeave();
      } else if (error?.message?.includes("Insufficient") || error?.message?.includes("token")) {
        alert("Connection error! Token might be invalid. Please try again.");
        onMeetingLeave();
      } else {
        alert(`Meeting error: ${error?.message || 'Unknown error'}`);
        onMeetingLeave();
      }
    },
  });
  
  const { join, leave, participants, localParticipant } = meetingConfig || {};

  const { publish } = usePubSub("JOIN_REQUEST", {
    onMessageReceived: (data) => {
      if (isInstructor && data.message.type === "REQUEST") {
        setJoinRequests((prev) => {
          const exists = prev.find(r => r.userName === data.message.userName);
          return exists ? prev : [...prev, {
            userName: data.message.userName,
            timestamp: data.message.timestamp,
            senderId: data.senderId
          }];
        });
      }
      if (!isInstructor && data.message.userName === userName) {
        if (data.message.type === "APPROVED") setApprovalStatus("APPROVED");
        else if (data.message.type === "REJECTED") setApprovalStatus("REJECTED");
      }
    },
  });

  const { publish: publishChat } = usePubSub("CHAT", {
    onMessageReceived: (data) => {
      console.log('📨 Received chat message:', data);
      setChatMessages((prev) => [...prev, {
        senderId: data.senderId,
        senderName: data.message.senderName,
        message: data.message.message,
        timestamp: data.message.timestamp || Date.now(),
      }]);
    },
  });

  const handleApprove = useCallback((request) => {
    publish({ type: "APPROVED", userName: request.userName }, { persist: false });
    setJoinRequests((prev) => prev.filter(r => r.timestamp !== request.timestamp));
  }, [publish]);

  const handleReject = useCallback((request) => {
    publish({ type: "REJECTED", userName: request.userName }, { persist: false });
    setJoinRequests((prev) => prev.filter(r => r.timestamp !== request.timestamp));
  }, [publish]);

  useEffect(() => {
    // Only join once when the component mounts
    if (!joinCalled.current && join && typeof join === 'function') {
      console.log("🔗 Calling join() function...");
      console.log("Meeting config:", { meetingId, participants: participants?.size });
      joinCalled.current = true;
      
      try {
        join();
        console.log("✅ join() called successfully");
        
        // Set a timeout to force join if onMeetingJoined doesn't fire
        joinTimeout.current = setTimeout(() => {
          if (!hasJoined.current) {
            console.log("⚠️ onMeetingJoined didn't fire after 8 seconds - forcing joined state");
            setJoined("JOINED");
            hasJoined.current = true;
          }
        }, 8000);
      } catch (error) {
        console.error("❌ Error calling join():", error);
      }
    } else {
      console.log("⏸️ Not calling join - joinCalled:", joinCalled.current, "join exists:", !!join);
    }
    
    return () => {
      if (joinTimeout.current) {
        clearTimeout(joinTimeout.current);
      }
    };
  }, [join, meetingId, participants]);
  
  // Separate cleanup effect with stable reference
  useEffect(() => {
    return () => {
      if (hasJoined.current) {
        console.log("🧹 Component unmounting - will leave on next render");
        hasJoined.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!isInstructor && approvalStatus === "PENDING" && joined === "JOINED" && !joinRequestSent.current) {
      setTimeout(() => {
        publish({ type: "REQUEST", userName: userName, timestamp: Date.now() }, { persist: false });
        joinRequestSent.current = true;
      }, 1500);
    }
  }, [isInstructor, approvalStatus, joined, userName, publish]);

  if (!isInstructor && approvalStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg text-center">
          <div className="text-7xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Waiting for Instructor</h2>
          <p className="text-gray-600 mb-6">Your join request has been sent.</p>
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <button onClick={onMeetingLeave} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!isInstructor && approvalStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg text-center">
          <div className="text-7xl mb-6">❌</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
          <button onClick={onMeetingLeave} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 text-white p-6">
      {isInstructor && joinRequests.length > 0 && (
        <div className="fixed top-6 right-6 bg-white rounded-xl shadow-2xl p-4 max-w-sm z-50">
          <h4 className="text-lg font-bold text-gray-800 mb-3">🔔 Join Requests ({joinRequests.length})</h4>
          {joinRequests.map((request) => (
            <div key={request.timestamp} className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-gray-800 font-semibold mb-2">{request.userName}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(request)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-800/70 rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{classData.title}</h1>
        <p className="text-gray-300">{isInstructor ? "👑 Instructor" : "Student"} • {participants ? participants.size : 0} participants</p>
      </div>

      {joined === "JOINED" ? (
        <>
          <div className="mb-6">
            <Controls onToggleChat={() => setIsChatOpen(!isChatOpen)} isHost={isInstructor} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main video - Instructor's video (large) */}
            <div className="lg:col-span-2">
              {isInstructor ? (
                <ParticipantView participantId={localParticipant?.id} isHost={true} />
              ) : (
                // For students, show the first participant that is NOT them (the instructor)
                [...participants.keys()]
                  .filter(id => id !== localParticipant?.id)
                  .slice(0, 1)
                  .map(id => (
                    <ParticipantView key={id} participantId={id} isHost={true} />
                  ))
              )}
            </div>

            {/* Sidebar - Other participants */}
            <div className="grid grid-cols-1 gap-4">
              {[...participants.keys()]
                .filter(id => {
                  // Don't show the local participant in sidebar
                  if (id === localParticipant?.id) return false;
                  
                  // For instructor, show all students
                  if (isInstructor) return true;
                  
                  // For students, don't show the instructor (already shown in main video)
                  return false;
                })
                .map(id => (
                  <ParticipantView key={id} participantId={id} isHost={false} />
                ))}
            </div>
          </div>

          <ChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages}
            onSendMessage={(msg) => {
              console.log('💬 Sending chat message:', msg);
              console.log('📤 Sender:', localParticipant?.displayName || userName);
              console.log('🆔 Sender ID:', localParticipant?.id);
              
              if (publishChat && typeof publishChat === 'function') {
                publishChat({
                  senderName: localParticipant?.displayName || userName,
                  message: msg,
                  timestamp: Date.now(),
                }, { persist: true });
                console.log('✅ Message published');
              } else {
                console.error('❌ publishChat is not available');
              }
            }}
            localParticipantName={localParticipant?.displayName || userName}
            localParticipantId={localParticipant?.id}
          />
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-xl">Connecting...</p>
        </div>
      )}
    </div>
  );
}

export default function LiveClassPage({ classData, onBack }) {
  const [meetingId, setMeetingId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Get the current user ID (could be sub, _id, or id)
  const currentUserId = currentUser.sub || currentUser._id || currentUser.id;
  
  // Get the class owner ID (could be an object with _id, or just a string)
  // Also check for direct _id field as fallback
  const classOwnerId = classData.userId?._id || classData.userId || classData.user?._id || classData.user;
  
  const isInstructor = currentUserId && classOwnerId && currentUserId === classOwnerId;
  console.log('✅ Is instructor?', isInstructor, 'User:', currentUserId, 'Owner:', classOwnerId);
  console.log('📋 Full classData:', classData);
  
  const userName = currentUser.name || "Guest";

  useEffect(() => {
    // Prevent duplicate initialization
    if (mountedRef.current) return;
    mountedRef.current = true;

    const initializeMeeting = async () => {
      try {
        setLoading(true);
        console.log('🎬 Initializing meeting for class:', classData.classId);
        console.log('🔍 Type of meetingId:', typeof classData.meetingId, classData.meetingId);
        
        // Extract meetingId as string (in case it's an object)
        let existingMeetingId = null;
        if (classData.meetingId) {
          if (typeof classData.meetingId === 'string') {
            existingMeetingId = classData.meetingId;
          } else if (typeof classData.meetingId === 'object') {
            // If it's an object, try to extract the ID
            existingMeetingId = classData.meetingId.id || classData.meetingId._id || classData.meetingId.meetingId;
            console.warn('⚠️ meetingId is an object, extracted:', existingMeetingId);
          }
        }
        
        if (existingMeetingId && typeof existingMeetingId === 'string') {
          console.log('✅ Using existing meeting ID:', existingMeetingId);
          // Get token for existing meeting
          const videoSdkToken = await getAuthToken();
          setToken(videoSdkToken);
          setMeetingId(existingMeetingId);
          console.log('🔑 Got VideoSDK token for existing meeting');
        } else if (!isInstructor && (classData.status === 'live' || !existingMeetingId)) {
          // Student trying to join a live class - fetch fresh class data to get meetingId
          console.log('👨‍🎓 Student joining live class, fetching fresh data...');
          const authToken = localStorage.getItem('authToken');
          const classId = classData.classId || classData._id;
          
          const fetchResponse = await fetch(`${API_BASE_URL}/classes/${classId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          
          if (fetchResponse.ok) {
            const freshData = await fetchResponse.json();
            console.log('📡 Fresh class data:', freshData.class);
            
            // Extract meetingId from fresh data
            let freshMeetingId = null;
            if (freshData.class.meetingId) {
              if (typeof freshData.class.meetingId === 'string') {
                freshMeetingId = freshData.class.meetingId;
              } else if (typeof freshData.class.meetingId === 'object') {
                freshMeetingId = freshData.class.meetingId.id || freshData.class.meetingId._id || freshData.class.meetingId.meetingId;
              }
            }
            
            if (freshMeetingId) {
              console.log('✅ Found meetingId in fresh data:', freshMeetingId);
              const videoSdkToken = await getAuthToken();
              setToken(videoSdkToken);
              setMeetingId(freshMeetingId);
            } else {
              setError("Instructor hasn't started the meeting yet. Please wait...");
            }
          } else {
            setError("Could not fetch class details. Please try again.");
          }
        } else if (isInstructor) {
          console.log('🎥 Creating new meeting as instructor...');
          // createMeeting now returns { meetingId, token }
          const { meetingId: newMeetingId, token: newToken } = await createMeeting();
          console.log('✅ Created meeting:', newMeetingId);
          console.log('🔑 Got fresh token from createMeeting');
          
          setToken(newToken);
          setMeetingId(newMeetingId);
          
          // Save meetingId and update status to 'live'
          const authToken = localStorage.getItem('authToken');
          console.log('💾 Saving meetingId to database:', newMeetingId, 'Type:', typeof newMeetingId);
          console.log('💾 Updating class ID:', classData.classId || classData._id);
          
          // Ensure meetingId is a string
          const meetingIdToSave = typeof newMeetingId === 'string' ? newMeetingId : String(newMeetingId);
          
          const classId = classData.classId || classData._id;
          const updateResponse = await fetch(`${API_BASE_URL}/classes/${classId}`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${authToken}`, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
              meetingId: meetingIdToSave,
              status: 'live'
            })
          });
          
          if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('✅ Successfully saved meetingId to database:', result);
          } else {
            const errorText = await updateResponse.text();
            console.error('❌ Failed to save meetingId:', updateResponse.status, errorText);
          }
        } else {
          setError("Waiting for instructor to start");
        }
      } catch (err) {
        console.error('❌ Error initializing meeting:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initializeMeeting();

    // Cleanup on unmount
    return () => {
      console.log('🧹 LiveClassPage unmounting');
      mountedRef.current = false;
    };
  }, []); // Empty deps to run only once

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl">Initializing class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 max-w-lg text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={onBack} className="px-8 py-3 bg-blue-600 text-white rounded-lg">Back</button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🔑</div>
          <p className="text-xl">Getting authorization...</p>
        </div>
      </div>
    );
  }

  if (!meetingId || typeof meetingId !== 'string') {
    console.error('❌ Invalid meetingId:', meetingId, typeof meetingId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 max-w-lg text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Meeting</h2>
          <p className="text-gray-600 mb-6">Meeting ID is invalid. Please try starting the class again.</p>
          <button onClick={onBack} className="px-8 py-3 bg-blue-600 text-white rounded-lg">Back</button>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering MeetingProvider with:', { meetingId, token: token?.substring(0, 20) + '...', userName, isInstructor });

  return (
    <MeetingProvider 
      key={meetingId} 
      config={{ 
        meetingId, 
        micEnabled: true, 
        webcamEnabled: true, 
        name: userName,
        mode: "CONFERENCE",
        multiStream: false,
      }} 
      token={token}
      reinitialiseMeetingOnConfigChange={true}
      joinWithoutUserInteraction={true}
    >
      <MeetingView classData={classData} meetingId={meetingId} onMeetingLeave={onBack} isInstructor={isInstructor} userName={userName} />
    </MeetingProvider>
  );
}
