// pages/Notifications.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcon = (type) => type === 'alert' ? '⚠️' : type === 'motivation' ? '🌟' : '🔔';
  const typeColor = (type) => type === 'alert' ? '#ef4444' : type === 'motivation' ? '#8b5cf6' : '#4a80ff';

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN');
  };

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Notifications</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {unreadCount > 0 ? <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{unreadCount} unread</span> : 'All caught up!'} · {notifications.length} total
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>Mark All Read</button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: '● Unread', count: unreadCount },
            { key: 'alert', label: '⚠️ Alerts', count: notifications.filter((n) => n.type === 'alert').length },
            { key: 'motivation', label: '🌟 Motivation', count: notifications.filter((n) => n.type === 'motivation').length },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: '1px solid',
                borderColor: filter === f.key ? 'var(--accent-blue)' : 'var(--border)',
                background: filter === f.key ? 'rgba(74,128,255,0.15)' : 'transparent',
                color: filter === f.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <p>No notifications here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderLeft: `3px solid ${typeColor(n.type)}`,
                  opacity: n.read ? 0.65 : 1,
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ fontSize: 24, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${typeColor(n.type)}15`, borderRadius: 12, border: `1px solid ${typeColor(n.type)}30`, flexShrink: 0 }}>
                    {typeIcon(n.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</span>
                      {!n.read && <span style={{ background: 'var(--accent-red)', color: 'white', borderRadius: 10, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>NEW</span>}
                      {n.percentage !== undefined && (
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: typeColor(n.type), background: `${typeColor(n.type)}15`, padding: '2px 8px', borderRadius: 6, border: `1px solid ${typeColor(n.type)}30` }}>
                          {n.percentage}%
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{n.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕐 {formatTime(n.createdAt)}</span>
                      {!n.read && <span style={{ fontSize: 11, color: 'var(--accent-blue)', cursor: 'pointer' }}>Click to mark read</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
