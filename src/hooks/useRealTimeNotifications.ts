'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore
import io from 'socket.io-client';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
  metadata?: Record<string, any>;
}

interface UseRealTimeNotificationsOptions {
  userId?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseRealTimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

export const useRealTimeNotifications = (
  options: UseRealTimeNotificationsOptions = {}
): UseRealTimeNotificationsReturn => {
  const {
    userId,
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<any>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        query: userId ? { userId } : undefined
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectCountRef.current = 0;

        // Join user-specific room if userId is provided
        if (userId) {
          socket.emit('join-user-room', userId);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from notification server:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect') {
          setError('Server disconnected');
        } else if (reconnectCountRef.current < reconnectAttempts) {
          attemptReconnect();
        }
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setIsConnected(false);
        setIsConnecting(false);
        setError(`Connection failed: ${err.message}`);
        
        if (reconnectCountRef.current < reconnectAttempts) {
          attemptReconnect();
        }
      });

      // Listen for new notifications
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => [
          {
            ...notification,
            timestamp: new Date(notification.timestamp)
          },
          ...prev
        ]);
      });

      // Listen for notification updates
      socket.on('notification-updated', (updatedNotification: Notification) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === updatedNotification.id 
              ? { ...updatedNotification, timestamp: new Date(updatedNotification.timestamp) }
              : notif
          )
        );
      });

      // Listen for notification removal
      socket.on('notification-removed', (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      });

      // Listen for bulk operations
      socket.on('notifications-cleared', () => {
        setNotifications([]);
      });

      socket.on('notifications-marked-read', (notificationIds: string[]) => {
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, read: true }
              : notif
          )
        );
      });

    } catch (err) {
      console.error('Failed to create socket connection:', err);
      setError('Failed to initialize connection');
      setIsConnecting(false);
    }
  }, [userId, reconnectAttempts]);

  const attemptReconnect = useCallback(() => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      setError('Max reconnection attempts reached');
      return;
    }

    reconnectCountRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current - 1); // Exponential backoff

    console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts}) in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    reconnectCountRef.current = 0;
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-notification-read', notificationId);
    }
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-all-notifications-read');
    }
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('remove-notification', notificationId);
    }
    
    // Optimistic update
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('clear-all-notifications');
    }
    
    // Optimistic update
    setNotifications([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
};

export default useRealTimeNotifications;