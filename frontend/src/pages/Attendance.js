// pages/Attendance.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

export default function Attendance() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/students')]).then(([c, s]) => {
      setCourses(c.data);
      setStudents(s.data);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse || !date) return;
    setLoading(true);
    api.get(`/attendance/today/${selectedCourse}`).then((r) => {
      const map = {};
      r.data.forEach((rec) => { map[rec.studentId] = rec.status; });
      setExisting(r.data);
      // Initialize attendance with existing or 'present' default
      const courseStudents = students.filter((s) => s.enrolledCourses?.includes(selectedCourse));
      const init = {};
      courseStudents.forEach((s) => { init[s.id] = map[s.id] || 'present'; });
      setAttendance(init);
    }).finally(() => setLoading(false));
  }, [selectedCourse, date, students]);

  const toggleAll = (status) => {
    const updated = {};
    Object.keys(attendance).forEach((id) => { updated[id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
    try {
      const res = await api.post('/attendance/mark', { courseId: selectedCourse, date, records });
      setSuccess(`✅ Attendance marked! Created: ${res.data.created}, Updated: ${res.data.updated}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (e) {
      setSuccess('❌ Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const courseStudents = students.filter((s) => s.enrolledCourses?.includes(selectedCourse));
  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Mark Attendance</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Record daily attendance for each course session</p>
        </div>

        {/* Controls */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Course</label>
              <select className="input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">— Select a course —</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</label>
              <input className="input" type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>

        {selectedCourse && (
          <>
            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 600, color: 'var(--accent-green)' }}>
                ✅ Present: {presentCount}
              </div>
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 600, color: 'var(--accent-red)' }}>
                ❌ Absent: {absentCount}
              </div>
              <div style={{ background: 'rgba(74,128,255,0.1)', border: '1px solid rgba(74,128,255,0.3)', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 600, color: 'var(--accent-blue)' }}>
                📊 {courseStudents.length > 0 ? Math.round((presentCount / courseStudents.length) * 100) : 0}% Rate
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-success" style={{ fontSize: 12 }} onClick={() => toggleAll('present')}>Mark All Present</button>
                <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => toggleAll('absent')}>Mark All Absent</button>
              </div>
            </div>

            {success && (
              <div style={{ background: success.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${success.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: success.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                {success}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th>Current Overall %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map((s, i) => {
                        const pct = s.attendanceStats?.overall?.percentage || 0;
                        const status = attendance[s.id] || 'present';
                        return (
                          <tr key={s.id} style={{ background: status === 'absent' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                                  {s.name.charAt(0)}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                                {pct < 70 && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)' }}>LOW</span>}
                              </div>
                            </td>
                            <td><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent-cyan)' }}>{s.rollNo}</code></td>
                            <td>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: pct < 70 ? 'var(--accent-red)' : pct < 75 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>{pct}%</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {['present', 'absent', 'late'].map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => setAttendance((prev) => ({ ...prev, [s.id]: opt }))}
                                    style={{
                                      padding: '6px 14px', borderRadius: 8, border: '1px solid',
                                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                      fontFamily: 'Space Grotesk, sans-serif',
                                      background: status === opt
                                        ? opt === 'present' ? 'rgba(16,185,129,0.2)' : opt === 'absent' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'
                                        : 'transparent',
                                      borderColor: status === opt
                                        ? opt === 'present' ? '#10b981' : opt === 'absent' ? '#ef4444' : '#f59e0b'
                                        : 'var(--border)',
                                      color: status === opt
                                        ? opt === 'present' ? '#10b981' : opt === 'absent' ? '#ef4444' : '#f59e0b'
                                        : 'var(--text-muted)',
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    {opt === 'present' ? '✅' : opt === 'absent' ? '❌' : '⏰'} {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || courseStudents.length === 0} style={{ padding: '14px 32px', fontSize: 15 }}>
              {submitting ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</> : '💾 Submit Attendance'}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
