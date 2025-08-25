"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  connectedUsers: ConnectedUser[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  url?: string;
  timestamp: Date;
  isRead: boolean;
}

interface ConnectedUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConnectedUsers([]);
      }
      return;
    }

    // Get access token
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Create socket connection
    // Remove /api/v1 from the URL for WebSocket connection
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
    const newSocket = io(baseUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setConnectedUsers([]);
      console.log('Disconnected from WebSocket server');
    });

    newSocket.on('connected', (data) => {
      console.log('WebSocket connection established:', data);
      setConnectedUsers(data.connectedUsers || []);
    });

    // User presence events
    newSocket.on('user:online', (data) => {
      setConnectedUsers(prev => {
        const filtered = prev.filter(u => u.id !== data.userId);
        return [...filtered, data];
      });
    });

    newSocket.on('user:offline', (data) => {
      setConnectedUsers(prev => prev.filter(u => u.id !== data.userId));
    });

    // Job-related events
    newSocket.on('job:updated', (data) => {
      addNotification({
        id: `job-updated-${Date.now()}`,
        title: 'Job Updated',
        message: `Job #${data.jobId} has been updated`,
        type: 'info',
        icon: 'briefcase',
        url: `/jobs/${data.jobId}`,
        timestamp: new Date(),
        isRead: false,
      });
    });

    newSocket.on('job:status-changed', (data) => {
      const statusColors = {
        COMPLETED: 'success',
        IN_PROGRESS: 'info',
        CANCELLED: 'error',
        ASSIGNED: 'info',
      } as const;

      addNotification({
        id: `job-status-${data.jobId}-${Date.now()}`,
        title: 'Job Status Changed',
        message: `Job #${data.jobId} is now ${data.status.replace('_', ' ').toLowerCase()}`,
        type: statusColors[data.status as keyof typeof statusColors] || 'info',
        icon: 'briefcase',
        url: `/jobs/${data.jobId}`,
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // Crew-related events
    newSocket.on('crew:location-updated', (data) => {
      addNotification({
        id: `crew-location-${data.crewId}-${Date.now()}`,
        title: 'Crew Location Updated',
        message: `Crew location has been updated`,
        type: 'info',
        icon: 'map-pin',
        url: `/crews/${data.crewId}`,
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    newSocket.on('crew:time-tracking', (data) => {
      const action = data.action === 'clock-in' ? 'clocked in' : 'clocked out';
      addNotification({
        id: `crew-time-${data.crewId}-${Date.now()}`,
        title: 'Time Tracking Update',
        message: `Crew ${action}`,
        type: 'info',
        icon: 'clock',
        url: `/crews/${data.crewId}`,
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // Customer-related events
    newSocket.on('customer:created', (data) => {
      addNotification({
        id: `customer-created-${Date.now()}`,
        title: 'New Customer',
        message: `${data.customer.name || 'New customer'} has been added`,
        type: 'success',
        icon: 'user-plus',
        url: '/customers',
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // Sales-related events
    newSocket.on('sales:estimate-created', (data) => {
      addNotification({
        id: `estimate-created-${data.estimate.id}-${Date.now()}`,
        title: 'New Sales Estimate',
        message: `${data.estimate.createdBy} created $${data.estimate.amount?.toFixed(0)} estimate`,
        type: 'info',
        icon: 'dollar-sign',
        url: '/sales',
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    newSocket.on('sales:estimate-status-changed', (data) => {
      const isAccepted = data.status === 'ACCEPTED';
      addNotification({
        id: `estimate-status-${data.estimateId}-${Date.now()}`,
        title: isAccepted ? 'Estimate Accepted! 🎉' : 'Estimate Status Changed',
        message: `Estimate has been ${data.status.toLowerCase()}`,
        type: isAccepted ? 'success' : 'info',
        icon: isAccepted ? 'check-circle' : 'file-text',
        url: '/sales',
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // Inventory events
    newSocket.on('inventory:low-stock-alert', (data) => {
      addNotification({
        id: `low-stock-${data.item.id}-${Date.now()}`,
        title: 'Low Stock Alert',
        message: `${data.item.name} is running low (${data.item.currentStock} left)`,
        type: 'warning',
        icon: 'package',
        url: '/inventory',
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // System notifications
    newSocket.on('system:notification', (data) => {
      addNotification({
        id: `system-${Date.now()}`,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        icon: data.icon,
        url: data.url,
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // User-specific notifications
    newSocket.on('user:notification', (data) => {
      addNotification({
        id: `user-${Date.now()}`,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        icon: data.icon,
        url: data.url,
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // Role-specific notifications
    newSocket.on('role:notification', (data) => {
      addNotification({
        id: `role-${Date.now()}`,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        icon: data.icon,
        url: data.url,
        timestamp: new Date(data.timestamp),
        isRead: false,
      });
    });

    // Connection error handling
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectedUsers([]);
    };
  }, [isAuthenticated, user, addNotification]);

  // Ping-pong for connection health
  useEffect(() => {
    if (!socket || !isConnected) return;

    const pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 30000); // Ping every 30 seconds

    socket.on('pong', () => {
      // Connection is healthy
      console.log('WebSocket ping-pong successful');
    });

    return () => {
      clearInterval(pingInterval);
      socket.off('pong');
    };
  }, [socket, isConnected]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    notifications,
    connectedUsers,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}