import React, { useState, useRef, useEffect, useCallback } from 'react';
import socketService from '../utils/socket';
import { getAuthToken as getToken, getCurrentUser } from '../utils/auth';

const API_URL = 'http://localhost:4000';

export default function ChatModal({ isOpen, onClose, expert, connectionId }) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageCallbackId = useRef(null);
  const typingCallbackId = useRef(null);
  const connectionCallbackId = useRef(null);

  // Initialize socket connection and load conversation when modal opens
  useEffect(() => {
    if (isOpen && connectionId) {
      initializeSocket();
      loadConversation();
    }
    
    return () => {
      if (isOpen && connectionId) {
        cleanupSocket();
      }
    };
  }, [isOpen, connectionId]); // Removed function dependencies to avoid circular dependency

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize Socket.IO connection
  const initializeSocket = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.error('❌ No token available for socket connection');
      setConnectionError(true);
      return;
    }

    console.log('🔌 Initializing socket for connection:', connectionId);

    // Connect to socket if not already connected
    if (!socketService.isConnected()) {
      console.log('🔌 Socket not connected, connecting now...');
      const socket = socketService.connect(token);
      
      // Wait for connection to be established
      if (socket) {
        socket.on('connect', () => {
          console.log('✅ Socket connected, joining room:', connectionId);
          socketService.joinConnection(connectionId);
        });
      }
    } else {
      console.log('✅ Socket already connected, joining room:', connectionId);
      socketService.joinConnection(connectionId);
    }

    // Register message callback
    messageCallbackId.current = socketService.onMessage((message) => {
      console.log('💬 Message received in component:', message);
      console.log('💬 Current connectionId:', connectionId);
      console.log('💬 Message connectionId:', message.connection);
      
      if (message.connection === connectionId) {
        console.log('✅ Message is for this connection, adding to messages');
        
        // Get current user to determine if this is their message
        const currentUser = getCurrentUser();
        const currentUserId = currentUser.id;
        
        // Add isCurrentUser flag to the message
        const messageWithUserFlag = {
          ...message,
          isCurrentUser: message.sender._id === currentUserId
        };
        
        console.log('📝 Current user ID:', currentUserId);
        console.log('📝 Message sender ID:', message.sender._id);
        console.log('📝 Is current user:', messageWithUserFlag.isCurrentUser);
        
        setMessages(prev => {
          // Remove any optimistic message with similar content (for sender)
          const filteredPrev = prev.filter(m => {
            if (m.isOptimistic && m.content === message.content && m.isCurrentUser) {
              console.log('🗑️ Removing optimistic message:', m._id);
              return false; // Remove optimistic message
            }
            return true;
          });
          
          // Check if real message already exists to avoid duplicates
          const exists = filteredPrev.some(m => m._id === message._id);
          if (exists) {
            console.log('⚠️ Message already exists, not adding:', message._id);
            return prev;
          }
          
          console.log('✅ Adding new message to list');
          return [...filteredPrev, messageWithUserFlag];
        });
        
        // Mark message as read if chat is open
        if (isOpen) {
          socketService.markMessagesRead(connectionId);
        }
      } else {
        console.log('❌ Message is not for this connection, ignoring');
      }
    });

    // Register typing callback
    typingCallbackId.current = socketService.onTyping((type, data) => {
      if (data.connectionId === connectionId) {
        if (type === 'typing_start') {
          setOtherUserTyping(true);
        } else if (type === 'typing_stop') {
          setOtherUserTyping(false);
        }
      }
    });

    // Register connection callback for read receipts
    connectionCallbackId.current = socketService.onConnection((type, data) => {
      if (type === 'messages_read' && data.connectionId === connectionId) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          read: true
        })));
      } else if (type === 'error') {
        console.error('Socket error:', data);
      }
    });

    setConnectionError(false);
  }, [connectionId]);

  // Cleanup socket listeners
  const cleanupSocket = useCallback(() => {
    if (connectionId) {
      socketService.leaveConnection(connectionId);
    }
    
    if (messageCallbackId.current) {
      socketService.offMessage(messageCallbackId.current);
      messageCallbackId.current = null;
    }
    
    if (typingCallbackId.current) {
      socketService.offTyping(typingCallbackId.current);
      typingCallbackId.current = null;
    }
    
    if (connectionCallbackId.current) {
      socketService.offConnection(connectionCallbackId.current);
      connectionCallbackId.current = null;
    }
  }, [connectionId]);

  const loadConversation = useCallback(async () => {
    if (!connectionId) return;
    
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/messages/conversation/${connectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const currentUser = getCurrentUser();
        const currentUserId = currentUser.id;
        
        const formattedMessages = data.messages.map(msg => ({
          _id: msg._id,
          content: msg.content,
          sender: {
            _id: msg.senderId._id,
            name: msg.senderId.name
          },
          receiver: {
            _id: msg.receiverId._id,
            name: msg.receiverId.name
          },
          timestamp: new Date(msg.createdAt),
          read: msg.isRead,
          connection: connectionId,
          isCurrentUser: msg.senderId._id === currentUserId
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        if (formattedMessages.length > 0) {
          socketService.markMessagesRead(connectionId);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !connectionId) {
      return;
    }

    const messageContent = messageText.trim();
    
    // Create optimistic message object for immediate UI update
    const currentUser = getCurrentUser();
    const optimisticMessage = {
      _id: 'temp_' + Date.now(), // Temporary ID
      content: messageContent,
      sender: {
        _id: currentUser.id,
        name: currentUser.name
      },
      receiver: {
        _id: expert._id,
        name: expert.name
      },
      timestamp: new Date(),
      read: false,
      connection: connectionId,
      isCurrentUser: true,
      isOptimistic: true // Flag to identify optimistic updates
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Stop typing indicator
    socketService.stopTyping(connectionId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send message via socket
    console.log('📤 Sending message:', { connectionId, content: messageContent });
    console.log('📤 Socket connected:', socketService.isConnected());
    socketService.sendMessage(connectionId, messageContent);
    
    // Clear input
    setMessageText('');
  };

  // Handle typing indicators
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);
    
    if (value.trim() && socketService.isConnected()) {
      // Start typing indicator
      socketService.startTyping(connectionId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(connectionId);
      }, 3000);
    } else if (!value.trim()) {
      // Stop typing if input is empty
      socketService.stopTyping(connectionId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  if (!isOpen || !expert) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
          <div className="relative">
            <img 
              src={expert.photoUrl || "/src/assets/placeholder.svg"} 
              alt={expert.name} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              expert.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-gray-900">{expert.name}</h3>
              {expert.isVerified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {expert.isOnline ? 'Online' : `Last seen ${expert.lastSeen || 'recently'}`}
              </p>
              {/* Socket Connection Status */}
              {connectionError ? (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Connection error
                </span>
              ) : socketService.isConnected() ? (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Connected
                </span>
              ) : (
                <span className="text-xs text-yellow-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  Connecting...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Start your conversation with {expert.name}</p>
              <p className="text-sm text-gray-400 mt-1">Share your learning goals and get personalized guidance</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.isCurrentUser ? 'order-1' : 'order-2'}`}>
                  {!message.isCurrentUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src={expert.photoUrl || "/src/assets/placeholder.svg"} 
                        alt={message.sender.name} 
                        className="w-6 h-6 rounded-full object-cover" 
                      />
                      <span className="text-xs text-gray-500">{message.sender.name}</span>
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl text-sm ${
                    message.isCurrentUser 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  } ${message.isCurrentUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                    <p>{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                    message.isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.isCurrentUser && (
                      <div className="flex items-center">
                        {message.read ? (
                          // Double tick (read receipt)
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2.5 7.5L5 10l6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 7.5L9 10l6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          // Single tick (sent)
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <img 
                  src={expert.photoUrl || "/src/assets/placeholder.svg"} 
                  alt={expert.name} 
                  className="w-6 h-6 rounded-full object-cover" 
                />
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex items-center gap-3">
            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageText}
                onChange={handleInputChange}
                placeholder={`Message ${expert.name}...`}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
              {/* Emoji Button */}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                😊
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!messageText.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                messageText.trim() 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}