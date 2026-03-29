// pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDS = [
  { label: 'Admin', email: 'admin@college.edu', password: 'admin123', color: '#8b5cf6' },
  { label: 'Faculty', email: 'rajesh@college.edu', password: 'faculty123', color: '#4a80ff' },
  { label: 'Student', email: 'aarav@student.edu', password: 'student123', color: '#10b981' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'student' ? '/student' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.container}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>🎓</div>
            <h1 style={styles.logoText}>AttendanceAI</h1>
            <p style={styles.logoSub}>Smart Campus Management</p>
          </div>

          <div style={styles.featureList}>
            {[
              { icon: '🤖', text: 'AI-powered attendance analysis' },
              { icon: '⚠️', text: 'Automated alerts below 70%' },
              { icon: '🌟', text: 'Motivation for perfect attendance' },
              { icon: '📊', text: 'Real-time analytics dashboard' },
            ].map((f, i) => (
              <div key={i} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={styles.statsRow}>
            {[{ val: '10+', label: 'Students' }, { val: '5', label: 'Courses' }, { val: '70%', label: 'Threshold' }].map((s) => (
              <div key={s.label} style={styles.statBox}>
                <div style={styles.statVal}>{s.val}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - form */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSub}>Sign in to your account</p>

            {/* Demo buttons */}
            <div style={styles.demoRow}>
              <p style={styles.demoLabel}>Quick access:</p>
              <div style={styles.demoBtns}>
                {DEMO_CREDS.map((c) => (
                  <button key={c.label} onClick={() => fillDemo(c)} style={{ ...styles.demoBtn, borderColor: c.color, color: c.color }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@college.edu"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px' }}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In →'}
              </button>
            </form>

            <div style={styles.hint}>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Demo: admin123 / faculty123 / student123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px' },
  bgGlow1: { position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vh', background: 'radial-gradient(circle, rgba(74,128,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  bgGlow2: { position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vh', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  container: { display: 'flex', maxWidth: 900, width: '100%', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', background: 'var(--bg-secondary)' },
  leftPanel: { flex: 1, padding: '48px 40px', background: 'linear-gradient(160deg, #0f1a35 0%, #0a1020 100%)', display: 'flex', flexDirection: 'column', gap: 32 },
  logoArea: { display: 'flex', flexDirection: 'column', gap: 8 },
  logoIcon: { fontSize: 48 },
  logoText: { fontSize: 28, fontFamily: 'Sora, sans-serif', fontWeight: 800, background: 'linear-gradient(135deg, #4a80ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoSub: { color: 'var(--text-secondary)', fontSize: 14 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 16 },
  feature: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74,128,255,0.1)', borderRadius: 10, border: '1px solid var(--border)' },
  featureText: { color: 'var(--text-secondary)', fontSize: 14 },
  statsRow: { display: 'flex', gap: 16 },
  statBox: { flex: 1, background: 'rgba(74,128,255,0.08)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' },
  statVal: { fontSize: 24, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'Sora, sans-serif' },
  statLabel: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 },
  rightPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  formCard: { width: '100%', maxWidth: 360 },
  formTitle: { fontSize: 28, fontFamily: 'Sora, sans-serif', fontWeight: 800, marginBottom: 6 },
  formSub: { color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 },
  demoRow: { background: 'rgba(74,128,255,0.06)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 },
  demoLabel: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 },
  demoBtns: { display: 'flex', gap: 8 },
  demoBtn: { flex: 1, padding: '7px 0', background: 'transparent', border: '1px solid', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 },
  hint: { textAlign: 'center', marginTop: 20 },
};
