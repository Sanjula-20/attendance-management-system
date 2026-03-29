// pages/StudentDashboard.js
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import AttendanceBadge from '../components/AttendanceBadge';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [stuRes, notifRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/notifications'),
        ]);
        setStudentData(stuRes.data);
        setNotifications(notifRes.data.slice(0, 5));

        // Get last 30 days history
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const startDate = d.toISOString().split('T')[0];
        const histRes = await api.get(`/students/${stuRes.data.id}/attendance-history?startDate=${startDate}`);
        setHistory(histRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div></Layout>;
  if (!studentData) return <Layout><p style={{ padding: 40, color: 'var(--text-muted)' }}>Could not load your profile.</p></Layout>;

  const stats = studentData.attendanceStats;
  const overall = stats?.overall || {};
  const pct = overall.percentage || 0;
  const statusColor = pct < 70 ? '#ef4444' : pct < 75 ? '#f59e0b' : pct === 100 ? '#8b5cf6' : '#10b981';

  // Trend
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  let p = 0, t = 0;
  const trendData = sorted.map((r) => {
    t++;
    if (r.status === 'present') p++;
    return { date: r.date.slice(5), pct: Math.round((p / t) * 100) };
  });

  const unread = notifications.filter((n) => !n.read);

  return (
    <Layout>
      <div className="fade-in">
        {/* Welcome header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Status banner */}
        <div className="card" style={{ marginBottom: 20, borderColor: `${statusColor}40`, background: `linear-gradient(135deg, ${statusColor}10 0%, var(--bg-card) 60%)`, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 48 }}>
            {pct === 100 ? '🏆' : pct >= 75 ? '✅' : pct >= 70 ? '⚠️' : '🚨'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontSize: 20 }}>
                {pct === 100 ? 'Perfect Attendance Champion!' : pct >= 75 ? 'Attendance is Safe' : pct >= 70 ? 'Attendance Warning' : 'Attendance Critical'}
              </h2>
              <AttendanceBadge percentage={pct} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {pct === 100 && "🌟 You've attended every class! You're an inspiration. Keep it up!"}
              {pct >= 75 && pct < 100 && `You've attended ${overall.present} out of ${overall.total} classes. You're doing well, keep it up!`}
              {pct >= 70 && pct < 75 && `⚠️ Your attendance is close to the 70% threshold. You need to attend more classes immediately!`}
              {pct < 70 && `🚨 Your attendance has fallen below the required 70%. Please attend classes urgently to avoid academic consequences.`}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: statusColor }}>{pct}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{overall.present}/{overall.total} classes</div>
          </div>
        </div>

        {/* Notifications */}
        {unread.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {unread.map((n) => (
              <div key={n.id} style={{ marginBottom: 10, padding: '14px 18px', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12, background: n.type === 'alert' ? 'rgba(239,68,68,0.08)' : 'rgba(139,92,246,0.08)', border: `1px solid ${n.type === 'alert' ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}` }}>
                <span style={{ fontSize: 20 }}>{n.type === 'alert' ? '⚠️' : '🌟'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Present', value: overall.present || 0, color: '#10b981', icon: '✅' },
            { label: 'Absent', value: (overall.total - overall.present) || 0, color: '#ef4444', icon: '❌' },
            { label: 'Courses', value: stats?.courses?.length || 0, color: '#4a80ff', icon: '📚' },
            { label: 'Notifications', value: notifications.length, color: '#f59e0b', icon: '🔔' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        {trendData.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>📈 Attendance Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#8899bb', fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: '#8899bb', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#141e33', border: '1px solid #2a3a5c', borderRadius: 10, color: '#e8eeff' }} formatter={(v) => [`${v}%`, 'Attendance']} />
                <Line type="monotone" dataKey="pct" stroke={statusColor} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Course breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>📚 Course-wise Attendance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats?.courses?.map((c) => {
              const color = c.percentage < 70 ? '#ef4444' : c.percentage < 75 ? '#f59e0b' : c.percentage === 100 ? '#8b5cf6' : '#10b981';
              const classesNeeded = c.percentage < 70 ? Math.ceil((0.7 * c.total - c.present) / 0.3) : 0;
              return (
                <div key={c.courseId} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10, border: `1px solid ${color}20` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent-cyan)', marginRight: 8 }}>{c.courseCode}</code>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.courseName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AttendanceBadge percentage={c.percentage} />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color }}>{c.percentage}%</span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 6 }}>
                    <div className="progress-fill" style={{ width: `${c.percentage}%`, background: color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{c.present} present / {c.absent} absent / {c.total} total</span>
                    {classesNeeded > 0 && <span style={{ color: 'var(--accent-red)' }}>⚠️ Need {classesNeeded} more classes to reach 70%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
