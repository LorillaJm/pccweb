
// Example usage of useRealTimeNotifications hook
import React from 'react';
import { useRealTimeNotifications } from './hooks/useRealTimeNotifications';

const NotificationComponent = ({ userId }) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    error,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useRealTimeNotifications({
    userId,
    autoConnect: true,
    reconnectAttempts: 5
  });

  if (isConnecting) return <div>Connecting to notifications...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isConnected) return <div>Not connected</div>;

  return (
    <div>
      <h3>Notifications ({unreadCount} unread)</h3>
      <button onClick={markAllAsRead}>Mark All Read</button>
      <button onClick={clearAll}>Clear All</button>
      
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`notification ${notification.read ? 'read' : 'unread'}`}
          onClick={() => markAsRead(notification.id)}
        >
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <small>{notification.timestamp.toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;
