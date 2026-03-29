// components/Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = {
  admin: [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '👥', label: 'Students', path: '/students' },
    { icon: '📚', label: 'Courses', path: '/courses' },
    { icon: '✅', label: 'Attendance', path: '/attendance' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '🤖', label: 'AI Reports', path: '/ai-reports' },
  ],
  faculty: [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '👥', label: 'Students', path: '/students' },
    { icon: '✅', label: 'Mark Attendance', path: '/attendance' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '🤖', label: 'AI Reports', path: '/ai-reports' },
  ],
  student: [
    { icon: '🏠', label: 'My Dashboard', path: '/student' },
    { icon: '📈', label: 'My Attendance', path: '/student/attendance' },
    { icon: '🔔', label: 'Notifications', path: '/student/notifications' },
  ],
};

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleNav = (path) => navigate(path);

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 70 : 240 }}>
      {/* Header */}
      <div style={styles.header}>
        {!collapsed && (
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🎓</span>
            <span style={styles.brandName}>AttendanceAI</span>
          </div>
        )}
        <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role?.toUpperCase()}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
              title={collapsed ? item.label : ''}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <button onClick={logout} style={styles.logoutBtn} title={collapsed ? 'Logout' : ''}>
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0, top: 0,
    zIndex: 100,
    transition: 'width 0.3s ease',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    minHeight: 70,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandIcon: { fontSize: 24 },
  brandName: { fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg, #4a80ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  collapseBtn: { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userCard: { padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  userInfo: { overflow: 'hidden' },
  userName: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 10, color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.1em', marginTop: 2 },
  nav: { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 10,
    background: 'transparent', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer',
    fontSize: 14, fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500, width: '100%', textAlign: 'left',
    transition: 'all 0.2s', position: 'relative',
  },
  navItemActive: { background: 'rgba(74,128,255,0.15)', color: 'var(--accent-blue)', fontWeight: 600 },
  navIcon: { fontSize: 18, flexShrink: 0 },
  navLabel: { whiteSpace: 'nowrap' },
  badge: { marginLeft: 'auto', background: 'var(--accent-red)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 },
  footer: { padding: '16px 10px', borderTop: '1px solid var(--border)' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', width: '100%', transition: 'all 0.2s' },
};
