import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unread, setUnread] = useState([]);
  const [read, setRead] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const mapBackend = (item) => {
    // item: { id, data: { title, message, timestamp }, read_at }
    return {
      id: item.id,
      title: item.data?.title || '',
      message: item.data?.message || '',
      timestamp: item.data?.timestamp || null,
      read_at: item.read_at || null,
      raw: item,
    };
  };

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUnread([]);
      setRead([]);
      setUnreadCount(0);
      return;
    }

    const res = await getNotifications(token);
    if (res.ok) {
      const payload = res.data.data || res.data;
      const unreadList = (payload.unread || []).map(mapBackend);
      const readList = (payload.read || []).map(mapBackend);
      setUnread(unreadList);
      setRead(readList);
      setUnreadCount(unreadList.length);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        fetchNotifications();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('auth_token');
    const res = await markNotificationRead(token, id);
    if (res.ok) {
      setUnread((prev) => prev.filter((n) => n.id !== id));
      setRead((prev) => {
        const moved = unread.find((n) => n.id === id);
        if (moved) {
          const withReadAt = { ...moved, read_at: new Date().toISOString() };
          return [withReadAt, ...prev].slice(0, 20);
        }
        return prev;
      });
      setUnreadCount((c) => Math.max(0, c - 1));
    } else {
      // fallback: re-fetch
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('auth_token');
    const res = await markAllNotificationsRead(token);
    if (res.ok) {
      const moved = unread.map((n) => ({ ...n, read_at: new Date().toISOString() }));
      setRead((prev) => [...moved, ...prev].slice(0, 20));
      setUnread([]);
      setUnreadCount(0);
    } else {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{ unread, read, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
