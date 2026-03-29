// components/Layout.js
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(240);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.filter((n) => !n.read).length);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar unreadCount={unreadCount} onWidthChange={setSidebarWidth} />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px', minHeight: '100vh', transition: 'margin-left 0.3s' }}>
        {children}
      </main>
    </div>
  );
}
