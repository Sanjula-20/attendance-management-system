// components/StatCard.js
import React from 'react';

export default function StatCard({ icon, label, value, sub, color = '#4a80ff', trend }) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${color}18 0%, transparent 70%)`, borderRadius: '0 20px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 32, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6 }}>{sub}</p>}
          {trend !== undefined && (
            <p style={{ fontSize: 12, marginTop: 6, color: trend >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        <div style={{ fontSize: 32, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, borderRadius: 14, border: `1px solid ${color}30` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
