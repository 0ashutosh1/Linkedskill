import React, { useState, useEffect } from 'react';

export default function FloatingNotification({ notification, onClose, onAction }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after 8 seconds for non-urgent, 15 seconds for urgent
    const autoCloseDelay = notification.priority === 'high' ? 15000 : 8000;
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [notification]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'connection_request':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'class_starting':
      case 'class_reminder':
        return (
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'connection_accepted':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'review_reminder':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = () => {
    if (notification.priority === 'high') return 'border-red-500 shadow-red-500/20';
    if (notification.type === 'class_starting' || notification.type === 'class_reminder') return 'border-green-500 shadow-green-500/20';
    if (notification.type === 'connection_request') return 'border-blue-500 shadow-blue-500/20';
    if (notification.type === 'message') return 'border-indigo-500 shadow-indigo-500/20';
    return 'border-purple-500 shadow-purple-500/20';
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`bg-white rounded-lg shadow-2xl border-l-4 ${getPriorityColor()} p-4`}>
        <div className="flex items-start gap-3">
          {getNotificationIcon()}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {notification.title}
            </p>
            <p className="text-xs text-gray-600 line-clamp-2">
              {notification.message}
            </p>
            
            {/* Action buttons for priority notifications */}
            {(notification.type === 'connection_request' || notification.type === 'class_starting' || notification.type === 'message') && (
              <div className="flex gap-2 mt-3">
                {notification.type === 'connection_request' && (
                  <>
                    <button
                      onClick={() => onAction?.('accept', notification)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onAction?.('reject', notification)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-medium py-1.5 px-3 rounded transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {notification.type === 'class_starting' && (
                  <button
                    onClick={() => onAction?.('join', notification)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
                  >
                    Join Class
                  </button>
                )}
                {notification.type === 'message' && (
                  <button
                    onClick={() => onAction?.('view', notification)}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
                  >
                    View Message
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
