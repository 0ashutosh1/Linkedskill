import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageCallbacks = new Map();
    this.typingCallbacks = new Map();
    this.connectionCallbacks = new Map();
    this.isConnecting = false;
  }

  connect(token) {
    // Add safety checks
    if (!token) {
      console.warn('No token provided for socket connection');
      return null;
    }

    if (this.socket && this.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('Connection already in progress...');
      return this.socket;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.disconnect();
    }

    this.isConnecting = true;

    try {
      this.socket = io('http://localhost:4000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.connected = true;
        this.isConnecting = false;
      });

      this.socket.on('reconnect', () => {
        console.log('Reconnected to server');
        this.connected = true;
        this.isConnecting = false;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.connected = false;
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.connected = false;
        this.isConnecting = false;
      });

      // Handle incoming messages
      this.socket.on('new_message', (message) => {
        this.messageCallbacks.forEach((callback) => {
          callback(message);
        });
      });

      // Handle message notifications
      this.socket.on('new_message_notification', (notification) => {
        this.connectionCallbacks.forEach((callback) => {
          callback('notification', notification);
        });
      });

      // Handle typing indicators
      this.socket.on('user_typing', (data) => {
        this.typingCallbacks.forEach((callback) => {
          callback('typing_start', data);
        });
      });

      this.socket.on('user_stopped_typing', (data) => {
        this.typingCallbacks.forEach((callback) => {
          callback('typing_stop', data);
        });
      });

      // Handle read receipts
      this.socket.on('messages_read', (data) => {
        this.connectionCallbacks.forEach((callback) => {
          callback('messages_read', data);
        });
      });

      // Handle errors
      this.socket.on('message_error', (error) => {
        console.error('Message error:', error);
        this.connectionCallbacks.forEach((callback) => {
          callback('error', error);
        });
      });

      return this.socket;
      
    } catch (error) {
      console.error('Error creating socket connection:', error);
      this.connected = false;
      this.isConnecting = false;
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.isConnecting = false;
    }
  }

  joinConnection(connectionId) {
    if (this.socket && this.connected) {
      console.log('Joining connection room:', connectionId);
      this.socket.emit('join_connection', { connectionId });
    }
  }

  leaveConnection(connectionId) {
    if (this.socket && this.connected) {
      console.log('Leaving connection room:', connectionId);
      this.socket.emit('leave_connection', { connectionId });
    }
  }

  sendMessage(connectionId, content) {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', {
        connectionId: connectionId,
        content: content
      });
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  markMessagesRead(connectionId) {
    if (this.socket && this.connected) {
      this.socket.emit('mark_messages_read', {
        connectionId: connectionId
      });
    }
  }

  startTyping(connectionId) {
    if (this.socket && this.connected) {
      this.socket.emit('start_typing', { connectionId });
    }
  }

  stopTyping(connectionId) {
    if (this.socket && this.connected) {
      this.socket.emit('stop_typing', { connectionId });
    }
  }

  onMessage(callback) {
    const id = Date.now().toString();
    this.messageCallbacks.set(id, callback);
    return id;
  }

  onTyping(callback) {
    const id = Date.now().toString();
    this.typingCallbacks.set(id, callback);
    return id;
  }

  onConnection(callback) {
    const id = Date.now().toString();
    this.connectionCallbacks.set(id, callback);
    return id;
  }

  offMessage(id) {
    this.messageCallbacks.delete(id);
  }

  offTyping(id) {
    this.typingCallbacks.delete(id);
  }

  offConnection(id) {
    this.connectionCallbacks.delete(id);
  }

  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;