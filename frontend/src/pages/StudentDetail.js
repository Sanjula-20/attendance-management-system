// pages/StudentDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Layout from '../components/Layout';
import AttendanceBadge from '../components/AttendanceBadge';
import api from '../utils/api';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [stuRes, histRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/students/${id}/attendance-history?startDate=${getDateNDaysAgo(30)}`),
        ]);
        setStudent(stuRes.data);
        setHistory(histRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  function getDateNDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  const sendNotification = async (type) => {
    setSendingNotif(true);
    const stats = student?.attendanceStats?.overall;
    const msg = type === 'alert'
      ? `Your attendance is at ${stats?.percentage}%. Please attend classes to avoid academic consequences.`
      : `Excellent work! Keep maintaining your 100% attendance. You're an inspiration to all!`;
    try {
      await api.post('/notifications/send', {
        studentId: id,
        type,
        title: type === 'alert' ? '⚠️ Attendance Alert' : '🌟 Keep It Up!',
        message: msg,
      });
      setNotifMsg(`✅ Notification sent!`);
      setTimeout(() => setNotifMsg(''), 3000);
    } catch { setNotifMsg('❌ Failed to send'); }
    finally { setSendingNotif(false); }
  };

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div></Layout>;
  if (!student) return <Layout><div style={{ padding: 40, color: 'var(--text-muted)' }}>Student not found</div></Layout>;

  const stats = student.attendanceStats;
  const overall = stats?.overall || {};
  const pct = overall.percentage || 0;
  const statusColor = pct < 70 ? '#ef4444' : pct < 75 ? '#f59e0b' : pct === 100 ? '#8b5cf6' : '#10b981';

  // Radar data
  const radarData = stats?.courses?.map((c) => ({ subject: c.courseCode, value: c.percentage, fullMark: 100 })) || [];

  // Trend line: last 30 days cumulative
  const trendData = [];
  let presentCount = 0, totalCount = 0;
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach((r) => {
    totalCount++;
    if (r.status === 'present') presentCount++;
    trendData.push({ date: r.date.slice(5), pct: Math.round((presentCount / totalCount) * 100) });
  });

  return (
    <Layout>
      <div className="fade-in">
        {/* Back */}
        <button className="btn btn-secondary" style={{ marginBottom: 24, fontSize: 13 }} onClick={() => navigate(-1)}>← Back</button>

        {/* Header card */}
        <div className="card" style={{ marginBottom: 20, background: `linear-gradient(135deg, ${statusColor}12 0%, var(--bg-card) 60%)`, borderColor: `${statusColor}30`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: `${statusColor}10` }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${statusColor}, ${statusColor}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, border: `3px solid ${statusColor}50` }}>
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: 24, marginBottom: 4 }}>{student.name}</h2>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--accent-cyan)', background: 'rgba(0,212,255,0.08)', padding: '2px 10px', borderRadius: 6 }}>{student.rollNo}</code>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{student.department} · Sem {student.semester}</span>
                  <AttendanceBadge percentage={pct} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>{student.email} · {student.phone}</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
              {notifMsg && <span style={{ fontSize: 12, color: notifMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)' }}>{notifMsg}</span>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => sendNotification('alert')} disabled={sendingNotif}>
                  ⚠️ Send Alert
                </button>
                <button className="btn btn-success" style={{ fontSize: 12 }} onClick={() => sendNotification('motivation')} disabled={sendingNotif}>
                  🌟 Motivate
                </button>
              </div>
            </div>
          </div>

          {/* Overall stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Overall %', value: `${pct}%`, color: statusColor },
              { label: 'Present', value: overall.present || 0, color: 'var(--accent-green)' },
              { label: 'Absent', value: (overall.total - overall.present) || 0, color: 'var(--accent-red)' },
              { label: 'Total Classes', value: overall.total || 0, color: 'var(--accent-blue)' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Radar */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Course-wise Attendance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8899bb', fontSize: 11 }} />
                <Radar name="Attendance" dataKey="value" stroke="#4a80ff" fill="#4a80ff" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Attendance Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#8899bb', fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: '#8899bb', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#141e33', border: '1px solid #2a3a5c', borderRadius: 10, color: '#e8eeff' }} formatter={(v) => [`${v}%`, 'Attendance']} />
                <Line type="monotone" dataKey="pct" stroke={statusColor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course breakdown */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Course Breakdown</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {stats?.courses?.map((c) => {
              const color = c.percentage < 70 ? '#ef4444' : c.percentage < 75 ? '#f59e0b' : c.percentage === 100 ? '#8b5cf6' : '#10b981';
              return (
                <div key={c.courseId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: `1px solid ${color}20` }}>
                  <div style={{ width: 44, textAlign: 'center' }}>
                    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent-cyan)' }}>{c.courseCode}</code>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.courseName}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${c.percentage}%`, background: color }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    <div style={{ fontWeight: 700, color: color, fontFamily: 'JetBrains Mono, monospace' }}>{c.percentage}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.present}/{c.total} classes</div>
                  </div>
                  <AttendanceBadge percentage={c.percentage} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
