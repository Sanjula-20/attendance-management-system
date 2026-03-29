// pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import AttendanceBadge from '../components/AttendanceBadge';
import api from '../utils/api';

const COLORS = { critical: '#ef4444', warning: '#f59e0b', safe: '#10b981', perfect: '#8b5cf6' };

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, stuRes] = await Promise.all([
          api.get('/attendance/summary'),
          api.get('/students'),
        ]);
        setSummary(sumRes.data);
        setStudents(stuRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBroadcast = async () => {
    setBroadcastLoading(true);
    try {
      const res = await api.post('/notifications/broadcast-alerts');
      setBroadcastMsg(`✅ ${res.data.message}`);
      setTimeout(() => setBroadcastMsg(''), 4000);
    } catch {
      setBroadcastMsg('❌ Broadcast failed');
    } finally {
      setBroadcastLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    </Layout>
  );

  const pieData = [
    { name: 'Critical (<70%)', value: summary?.below70 || 0, color: COLORS.critical },
    { name: 'Warning (70-75%)', value: summary?.below75 || 0, color: COLORS.warning },
    { name: 'Safe (75%+)', value: summary?.safe || 0, color: COLORS.safe },
  ];

  // Bar chart: top 8 students by attendance
  const barData = students
    .slice(0, 8)
    .map((s) => ({
      name: s.name.split(' ')[0],
      attendance: s.attendanceStats?.overall?.percentage || 0,
    }));

  const atRiskStudents = students
    .filter((s) => (s.attendanceStats?.overall?.percentage || 0) < 70)
    .sort((a, b) => (a.attendanceStats?.overall?.percentage || 0) - (b.attendanceStats?.overall?.percentage || 0));

  return (
    <Layout>
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>AI-powered attendance overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {broadcastMsg && <span style={{ fontSize: 13, color: broadcastMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>{broadcastMsg}</span>}
            <button className="btn btn-secondary" onClick={handleBroadcast} disabled={broadcastLoading}>
              {broadcastLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '📢'} Broadcast Alerts
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/attendance')}>
              ✅ Mark Attendance
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard icon="👥" label="Total Students" value={summary?.totalStudents || 0} sub="Enrolled this semester" color="#4a80ff" />
          <StatCard icon="📚" label="Total Courses" value={summary?.totalCourses || 0} sub="Active courses" color="#00d4ff" />
          <StatCard icon="🚨" label="Below 70%" value={summary?.below70 || 0} sub="Need immediate attention" color="#ef4444" />
          <StatCard icon="⭐" label="Perfect Attendance" value={summary?.perfect || 0} sub="100% attendance heroes" color="#8b5cf6" />
          <StatCard icon="📢" label="Alerts Sent" value={summary?.alertsSent || 0} sub="Total AI notifications" color="#f59e0b" />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Bar chart */}
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Student Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#8899bb', fontSize: 12 }} />
                <YAxis tick={{ fill: '#8899bb', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#141e33', border: '1px solid #2a3a5c', borderRadius: 10, color: '#e8eeff' }}
                  formatter={(v) => [`${v}%`, 'Attendance']}
                />
                <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.attendance < 70 ? '#ef4444' : entry.attendance === 100 ? '#8b5cf6' : '#4a80ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Attendance Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141e33', border: '1px solid #2a3a5c', borderRadius: 10, color: '#e8eeff' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8899bb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* At-Risk Students */}
        {atRiskStudents.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16 }}>🚨 At-Risk Students (Below 70%)</h3>
              <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/students')}>View All</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Dept</th>
                    <th>Attendance</th>
                    <th>Classes Missed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map((s) => {
                    const stats = s.attendanceStats?.overall || {};
                    return (
                      <tr key={s.id}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>{s.name}</strong></td>
                        <td><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent-cyan)' }}>{s.rollNo}</code></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{s.department}</td>
                        <td>
                          <AttendanceBadge percentage={stats.percentage || 0} />
                          <div className="progress-bar" style={{ marginTop: 6, width: 80 }}>
                            <div className="progress-fill" style={{ width: `${stats.percentage || 0}%`, background: 'var(--accent-red)' }} />
                          </div>
                        </td>
                        <td style={{ color: 'var(--accent-red)' }}>{stats.total - stats.present} classes</td>
                        <td>
                          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate(`/students/${s.id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Perfect attendance */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>🌟 Perfect Attendance Champions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {students
              .filter((s) => s.attendanceStats?.overall?.percentage === 100)
              .map((s) => (
                <div key={s.id} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #4a80ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-purple)' }}>⭐ Perfect Attendance</div>
                  </div>
                </div>
              ))}
            {students.filter((s) => s.attendanceStats?.overall?.percentage === 100).length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No students with perfect attendance yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
