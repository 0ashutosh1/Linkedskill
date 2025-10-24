import React, { useState, useRef, useEffect, useCallback } from 'react';
// import socketService from '../utils/socket';  // TEMPORARILY DISABLED
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
  const messageCallbackId = useRef(null);
  const typingCallbackId = useRef(null);
  const connectionCallbackId = useRef(null);

  // Initialize Socket.IO connection - DISABLED FOR NOW
  const initializeSocket = useCallback(() => {
    console.log('Socket initialization disabled - using polling instead');
    // TODO: Re-enable when Socket.IO issues are resolved
  }, [connectionId]);

  // Cleanup socket listeners - DISABLED FOR NOW
  const cleanupSocket = useCallback(() => {
    console.log('Socket cleanup disabled');
    // TODO: Re-enable when Socket.IO issues are resolved
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
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  // Main effect for modal lifecycle
  useEffect(() => {
    if (isOpen && connectionId) {
      loadConversation();
      // initializeSocket(); // DISABLED
    }
    
    return () => {
      if (isOpen && connectionId) {
        // cleanupSocket(); // DISABLED
      }
    };
  }, [isOpen, connectionId, loadConversation]);

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

  const handleSendMessage = async () => {
    if (!messageText.trim() || !connectionId) return;

    const newMessage = {
      content: messageText.trim(),
      timestamp: new Date(),
      isCurrentUser: true,
      isOptimistic: true,
      _id: `temp-${Date.now()}`
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.content,
          connectionId: connectionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg._id === newMessage._id ? {
            ...data.message,
            isCurrentUser: true,
            timestamp: new Date(data.message.createdAt)
          } : msg
        ));

        // TODO: Re-enable Socket.IO emission when fixed
        // socketService.sendMessage(connectionId, newMessage.content);
      } else {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(msg => msg._id !== newMessage._id));
        console.error('Failed to send message');
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== newMessage._id));
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-semibold text-sm">
                {expert?.name?.charAt(0) || 'E'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{expert?.name || 'Expert'}</h3>
              <p className="text-sm text-gray-500">{expert?.role || 'Professional'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {connectionError && (
            <div className="text-center text-red-500 text-sm">
              Connection error. Using polling mode instead of real-time.
            </div>
          )}
          
          {loading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Start your conversation with {expert?.name}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isCurrentUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  } ${message.isOptimistic ? 'opacity-70' : ''}`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-500">
                {expert?.name} is typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}