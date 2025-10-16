import React, { useState, useRef, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

export default function ChatModal({ isOpen, onClose, expert, connectionId }) {
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load conversation when modal opens
  useEffect(() => {
    if (isOpen && connectionId) {
      loadConversation()
    }
  }, [isOpen, connectionId])

  // Poll for new messages every 3 seconds when chat is open
  useEffect(() => {
    let interval
    if (isOpen && connectionId) {
      interval = setInterval(() => {
        loadConversation()
      }, 3000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isOpen, connectionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const loadConversation = async () => {
    if (!connectionId) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/messages/conversation/${connectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const formattedMessages = data.messages.map(msg => ({
          id: msg._id,
          text: msg.content,
          sender: msg.senderId._id === getCurrentUserId() ? 'user' : 'expert',
          timestamp: new Date(msg.createdAt),
          status: msg.readStatus?.isSentByMe ? (msg.readStatus?.isRead ? 'read' : 'sent') : 'sent',
          senderName: msg.senderId.name,
          senderPhoto: msg.senderId.photoUrl,
          isRead: msg.readStatus?.isRead,
          readAt: msg.readStatus?.readAt
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.id
  }

  // Mark messages as read when they're displayed
  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      const unreadMessages = messages
        .filter(msg => msg.sender === 'expert' && !msg.isRead)
        .map(msg => msg.id)
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages)
      }
    }
  }, [messages, isOpen])

  const markMessagesAsRead = async (messageIds) => {
    try {
      const token = localStorage.getItem('authToken')
      await fetch(`${API_URL}/messages/read-messages`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageIds })
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !expert) return

    const messageContent = messageText.trim()
    setMessageText('')

    // Add message optimistically to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageContent,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: expert.id,
          content: messageContent
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Replace temp message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                id: data.data._id,
                text: data.data.content,
                sender: 'user',
                timestamp: new Date(data.data.createdAt),
                status: 'sent', // Will be updated to 'read' when recipient sees it
                isRead: false
              }
            : msg
        ))
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        console.error('Failed to send message')
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      console.error('Error sending message:', error)
    }
  }

  if (!isOpen || !expert) return null

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
            <p className="text-sm text-gray-500">
              {expert.isOnline ? 'Online' : `Last seen ${expert.lastSeen || 'recently'}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Video Call Button */}
            <button className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Start your conversation with {expert.name}</p>
              <p className="text-sm text-gray-400 mt-1">Share your learning goals and get personalized guidance</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                  {message.sender !== 'user' && (
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src={expert.photoUrl || "/src/assets/placeholder.svg"} 
                        alt={expert.name} 
                        className="w-6 h-6 rounded-full object-cover" 
                      />
                      <span className="text-xs text-gray-500">{expert.name}</span>
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl text-sm ${
                    message.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  } ${message.sender === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                    <p>{message.text}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.sender === 'user' && (
                      <div className="flex items-center">
                        {message.status === 'sending' ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : message.status === 'read' ? (
                          // Double tick (read receipt) - Custom double checkmark
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
          {isTyping && (
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
            {/* Attachment Button */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${expert.name}...`}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
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
  )
}