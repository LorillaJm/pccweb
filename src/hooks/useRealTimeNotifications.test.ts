import { renderHook, act, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useRealTimeNotifications, Notification } from './useRealTimeNotifications';

// Mock socket.io-client
jest.mock('socket.io-client');
const mockIo = io as jest.MockedFunction<typeof io>;

describe('useRealTimeNotifications', () => {
  let mockSocket: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock socket
    mockSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };

    mockIo.mockReturnValue(mockSocket);

    // Mock environment variable
    process.env.NEXT_PUBLIC_SOCKET_URL = 'http://localhost:5000';
  });

  afterEach(() => {
    jest.clearAllTimers();
    delete process.env.NEXT_PUBLIC_SOCKET_URL;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should auto-connect when autoConnect is true', () => {
    renderHook(() => useRealTimeNotifications({ autoConnect: true }));

    expect(mockIo).toHaveBeenCalledWith('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      query: undefined
    });
  });

  it('should connect with userId when provided', () => {
    const userId = 'user123';
    renderHook(() => useRealTimeNotifications({ userId, autoConnect: true }));

    expect(mockIo).toHaveBeenCalledWith('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      query: { userId }
    });
  });

  it('should handle connection success', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    act(() => {
      result.current.connect();
    });

    // Simulate connection success
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    
    act(() => {
      mockSocket.connected = true;
      connectHandler();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle connection error', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    act(() => {
      result.current.connect();
    });

    // Simulate connection error
    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
    const error = new Error('Connection failed');
    
    act(() => {
      errorHandler(error);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.error).toBe('Connection failed: Connection failed');
    });
  });

  it('should handle incoming notifications', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    act(() => {
      result.current.connect();
    });

    const mockNotification: Notification = {
      id: 'notif1',
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test',
      timestamp: new Date(),
      read: false
    };

    // Simulate receiving a notification
    const notificationHandler = mockSocket.on.mock.calls.find(call => call[0] === 'notification')[1];
    
    act(() => {
      notificationHandler(mockNotification);
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        id: 'notif1',
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test',
        read: false
      });
      expect(result.current.unreadCount).toBe(1);
    });
  });

  it('should mark notification as read', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    // Add a notification first
    const mockNotification: Notification = {
      id: 'notif1',
      type: 'info',
      title: 'Test',
      message: 'Test',
      timestamp: new Date(),
      read: false
    };

    act(() => {
      result.current.connect();
    });

    const notificationHandler = mockSocket.on.mock.calls.find(call => call[0] === 'notification')[1];
    
    act(() => {
      notificationHandler(mockNotification);
    });

    // Mark as read
    act(() => {
      mockSocket.connected = true;
      result.current.markAsRead('notif1');
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('mark-notification-read', 'notif1');
      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it('should mark all notifications as read', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    // Add multiple notifications
    const notifications = [
      { id: 'notif1', type: 'info' as const, title: 'Test 1', message: 'Test 1', timestamp: new Date(), read: false },
      { id: 'notif2', type: 'info' as const, title: 'Test 2', message: 'Test 2', timestamp: new Date(), read: false }
    ];

    act(() => {
      result.current.connect();
    });

    const notificationHandler = mockSocket.on.mock.calls.find(call => call[0] === 'notification')[1];
    
    notifications.forEach(notif => {
      act(() => {
        notificationHandler(notif);
      });
    });

    // Mark all as read
    act(() => {
      mockSocket.connected = true;
      result.current.markAllAsRead();
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('mark-all-notifications-read');
      expect(result.current.notifications.every(n => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it('should remove notification', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    const mockNotification: Notification = {
      id: 'notif1',
      type: 'info',
      title: 'Test',
      message: 'Test',
      timestamp: new Date(),
      read: false
    };

    act(() => {
      result.current.connect();
    });

    const notificationHandler = mockSocket.on.mock.calls.find(call => call[0] === 'notification')[1];
    
    act(() => {
      notificationHandler(mockNotification);
    });

    // Remove notification
    act(() => {
      mockSocket.connected = true;
      result.current.removeNotification('notif1');
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('remove-notification', 'notif1');
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  it('should clear all notifications', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    const notifications = [
      { id: 'notif1', type: 'info' as const, title: 'Test 1', message: 'Test 1', timestamp: new Date(), read: false },
      { id: 'notif2', type: 'info' as const, title: 'Test 2', message: 'Test 2', timestamp: new Date(), read: false }
    ];

    act(() => {
      result.current.connect();
    });

    const notificationHandler = mockSocket.on.mock.calls.find(call => call[0] === 'notification')[1];
    
    notifications.forEach(notif => {
      act(() => {
        notificationHandler(notif);
      });
    });

    // Clear all
    act(() => {
      mockSocket.connected = true;
      result.current.clearAll();
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('clear-all-notifications');
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  it('should disconnect properly', () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    act(() => {
      result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
  });

  it('should handle disconnection and attempt reconnection', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => 
      useRealTimeNotifications({ 
        autoConnect: false, 
        reconnectAttempts: 2,
        reconnectDelay: 1000 
      })
    );

    act(() => {
      result.current.connect();
    });

    // Simulate disconnection
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    
    act(() => {
      disconnectHandler('transport close');
    });

    expect(result.current.isConnected).toBe(false);

    // Fast-forward time to trigger reconnection
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should attempt to reconnect
    expect(mockIo).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should calculate unread count correctly', async () => {
    const { result } = renderHook(() => useRealTimeNotifications({ autoConnect: false }));

    const notifications = [
      { id: 'notif1', type: 'info' as const, title: 'Test 1', message: 'Test 1', timestamp: new Date(), read: false },
      { id: 'notif2', type: 'info' as const, title: 'Test 2', message: 'Test 2', timestamp: new Date(), read: true },
      { id: 'notif3', type: 'info' as const, title: 'Test 3', message: 'Test 3', timestamp: new Date(), read: false }
    ];

    act(() => {
      result.current.connect();
    });

    const notificationHandler = mockSocket.on.mock.calls.find(call => call[0] === 'notification')[1];
    
    notifications.forEach(notif => {
      act(() => {
        notificationHandler(notif);
      });
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });
  });
});