// pages/Students.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AttendanceBadge from '../components/AttendanceBadge';
import api from '../utils/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/students').then((r) => { setStudents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const pct = s.attendanceStats?.overall?.percentage || 0;
    const matchFilter =
      filter === 'all' ? true :
      filter === 'critical' ? pct < 70 :
      filter === 'warning' ? pct >= 70 && pct < 75 :
      filter === 'safe' ? pct >= 75 && pct < 100 :
      filter === 'perfect' ? pct === 100 : true;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: students.length,
    critical: students.filter((s) => (s.attendanceStats?.overall?.percentage || 0) < 70).length,
    warning: students.filter((s) => { const p = s.attendanceStats?.overall?.percentage || 0; return p >= 70 && p < 75; }).length,
    safe: students.filter((s) => { const p = s.attendanceStats?.overall?.percentage || 0; return p >= 75 && p < 100; }).length,
    perfect: students.filter((s) => (s.attendanceStats?.overall?.percentage || 0) === 100).length,
  };

  const FILTERS = [
    { key: 'all', label: 'All', color: '#4a80ff' },
    { key: 'critical', label: '🚨 Critical', color: '#ef4444' },
    { key: 'warning', label: '⚠️ Warning', color: '#f59e0b' },
    { key: 'safe', label: '✅ Safe', color: '#10b981' },
    { key: 'perfect', label: '⭐ Perfect', color: '#8b5cf6' },
  ];

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Students</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor and manage student attendance records</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f.key ? f.color : 'var(--border)'}`,
                background: filter === f.key ? `${f.color}20` : 'transparent',
                color: filter === f.key ? f.color : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input className="input" placeholder="🔍  Search by name, roll number or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 440 }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Semester</th>
                    <th>Overall Attendance</th>
                    <th>Classes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No students found</td></tr>
                  ) : filtered.map((s, i) => {
                    const stats = s.attendanceStats?.overall || {};
                    const pct = stats.percentage || 0;
                    const barColor = pct < 70 ? '#ef4444' : pct < 75 ? '#f59e0b' : pct === 100 ? '#8b5cf6' : '#10b981';
                    return (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12, width: 40 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${barColor}80, ${barColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, border: `2px solid ${barColor}50` }}>
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent-cyan)', background: 'rgba(0,212,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>{s.rollNo}</code></td>
                        <td style={{ color: 'var(--text-secondary)' }}>Sem {s.semester}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="progress-bar" style={{ width: 80 }}>
                              <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: barColor, fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{stats.present}/{stats.total}</td>
                        <td><AttendanceBadge percentage={pct} /></td>
                        <td>
                          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate(`/students/${s.id}`)}>
                            View →
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
      </div>
    </Layout>
  );
}
