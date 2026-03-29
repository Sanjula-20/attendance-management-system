// components/AttendanceBadge.js
import React from 'react';

export default function AttendanceBadge({ percentage }) {
  if (percentage === 100) return <span className="badge badge-perfect">⭐ 100%</span>;
  if (percentage >= 75) return <span className="badge badge-safe">✅ {percentage}%</span>;
  if (percentage >= 70) return <span className="badge badge-warning">⚠️ {percentage}%</span>;
  return <span className="badge badge-critical">🚨 {percentage}%</span>;
}
