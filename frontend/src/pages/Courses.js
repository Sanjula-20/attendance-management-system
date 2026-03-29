// pages/Courses.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', department: '', totalClasses: 40 });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/courses').then((r) => { setCourses(r.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/courses', form);
      setCourses((prev) => [...prev, res.data]);
      setForm({ code: '', name: '', department: '', totalClasses: 40 });
      setShowForm(false);
      setMsg('✅ Course created successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed to create course'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const depts = [...new Set(courses.map((c) => c.department))];

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Courses</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{courses.length} active courses across {depts.length} departments</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm((p) => !p)}>
            {showForm ? '✕ Cancel' : '+ Add Course'}
          </button>
        </div>

        {msg && <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 14, background: msg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: msg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)' }}>{msg}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(74,128,255,0.3)' }}>
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>New Course</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Course Code *</label>
                  <input className="input" placeholder="e.g. CS101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Course Name *</label>
                  <input className="input" placeholder="e.g. Data Structures" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Department</label>
                  <input className="input" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Classes</label>
                  <input className="input" type="number" min={1} value={form.totalClasses} onChange={(e) => setForm({ ...form, totalClasses: Number(e.target.value) })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Course'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {courses.map((c, i) => {
              const colors = ['#4a80ff', '#00d4ff', '#8b5cf6', '#10b981', '#f59e0b'];
              const color = colors[i % colors.length];
              return (
                <div key={c.id} className="card" style={{ borderTop: `3px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `${color}10`, borderRadius: '50%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color, background: `${color}15`, padding: '3px 10px', borderRadius: 6, border: `1px solid ${color}30` }}>{c.code}</code>
                    </div>
                    <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                  <h3 style={{ fontSize: 17, marginBottom: 8 }}>{c.name}</h3>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🏛 {c.department || 'General'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👤 {c.facultyName || 'TBD'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👥 {c.enrolledCount || 0} students</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📅 {c.totalClasses} classes</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
