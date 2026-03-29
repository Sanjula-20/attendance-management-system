// pages/AIReports.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

export default function AIReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [students, setStudents] = useState([]);
  const [studentAnalysis, setStudentAnalysis] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    api.get('/students').then((r) => setStudents(r.data));
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-report');
      setReport(res.data);
    } catch {} finally { setLoading(false); }
  };

  const generateAIInsights = async () => {
    if (!report) return;
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an AI assistant for a college attendance management system. Analyze this attendance data and provide actionable insights in 3-4 paragraphs. Be specific and helpful for faculty/admin.

Attendance Summary:
- Total Students: ${report.summary.totalStudents}
- Average Attendance: ${report.summary.averageAttendance}%
- Critical (below 70%): ${report.summary.criticalCount} students
- Warning (70-75%): ${report.summary.warningCount} students
- Safe (75%+): ${report.summary.safeCount} students
- Perfect (100%): ${report.summary.perfectCount} students

Top at-risk students:
${report.students.filter(s => s.riskLevel === 'critical').slice(0, 5).map(s => `- ${s.name} (${s.rollNo}): ${s.overallPercentage}%`).join('\n')}

Provide: 1) Current situation assessment, 2) Intervention recommendations, 3) Recognition for top performers, 4) Preventive strategies.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('') || 'Analysis unavailable.';
      setAiAnalysis(text);
    } catch { setAiAnalysis('AI analysis requires Anthropic API key configuration. Please set REACT_APP_ANTHROPIC_KEY in environment.'); }
    finally { setAiLoading(false); }
  };

  const analyzeStudent = async () => {
    if (!selectedStudent) return;
    setStudentLoading(true);
    setStudentAnalysis('');
    try {
      const dataRes = await api.post('/ai/analyze-student', { studentId: selectedStudent });
      const studentData = dataRes.data;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Analyze this student's attendance and provide personalized recommendations in 2-3 paragraphs.

Student: ${studentData.student.name} (${studentData.student.rollNo})
Department: ${studentData.student.department}
Overall Attendance: ${studentData.stats.overall.percentage}%
Risk Level: ${studentData.riskLevel}

Course-wise breakdown:
${studentData.stats.courses.map(c => `- ${c.courseName}: ${c.percentage}% (${c.present}/${c.total})`).join('\n')}

Provide personalized, empathetic advice covering: current standing, specific courses needing attention, and motivational guidance.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('') || 'Analysis unavailable.';
      setStudentAnalysis(text);
    } catch { setStudentAnalysis('AI analysis requires Anthropic API key configuration.'); }
    finally { setStudentLoading(false); }
  };

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>🤖 AI Reports & Analysis</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Powered by Claude AI · Intelligent attendance insights</p>
        </div>

        {/* Summary cards */}
        {report && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Avg Attendance', value: `${report.summary.averageAttendance}%`, color: '#4a80ff' },
              { label: 'Critical', value: report.summary.criticalCount, color: '#ef4444' },
              { label: 'Warning', value: report.summary.warningCount, color: '#f59e0b' },
              { label: 'Safe', value: report.summary.safeCount, color: '#10b981' },
              { label: 'Perfect', value: report.summary.perfectCount, color: '#8b5cf6' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '16px', textAlign: 'center', borderTop: `2px solid ${s.color}` }}>
                <div style={{ fontSize: 26, fontFamily: 'Sora, sans-serif', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Class-wide AI analysis */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Class-wide AI Analysis</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI-generated insights for the entire class</p>
            </div>
            <button className="btn btn-primary" onClick={generateAIInsights} disabled={aiLoading || !report}>
              {aiLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</> : '🤖 Generate Insights'}
            </button>
          </div>
          {aiAnalysis ? (
            <div style={{ background: 'rgba(74,128,255,0.06)', border: '1px solid rgba(74,128,255,0.2)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600 }}>
                🤖 Claude AI Analysis
              </div>
              {aiAnalysis.split('\n\n').map((para, i) => (
                <p key={i} style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{para}</p>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <p>Click "Generate Insights" to get AI-powered analysis of class attendance patterns.</p>
              <p style={{ fontSize: 12, marginTop: 8, color: 'var(--text-muted)' }}>Requires Anthropic API key in environment variables.</p>
            </div>
          )}
        </div>

        {/* Individual student analysis */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Individual Student AI Report</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Get personalized insights for a specific student</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <select className="input" style={{ flex: 1, minWidth: 200 }} value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">— Select a student —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.rollNo}</option>)}
            </select>
            <button className="btn btn-primary" onClick={analyzeStudent} disabled={studentLoading || !selectedStudent}>
              {studentLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</> : '🔍 Analyze'}
            </button>
          </div>
          {studentAnalysis && (
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, color: 'var(--accent-purple)', fontWeight: 600, marginBottom: 12 }}>🤖 Personalized Analysis</div>
              {studentAnalysis.split('\n\n').map((para, i) => (
                <p key={i} style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{para}</p>
              ))}
            </div>
          )}
        </div>

        {/* At-risk table */}
        {report && report.students.filter(s => s.riskLevel === 'critical').length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>🚨 Critical Students Requiring Intervention</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Attendance</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {report.students.filter(s => s.riskLevel === 'critical').map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent-cyan)' }}>{s.rollNo}</code></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{ width: `${s.overallPercentage}%`, background: 'var(--accent-red)' }} />
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--accent-red)', fontWeight: 700 }}>{s.overallPercentage}%</span>
                        </div>
                      </td>
                      <td><span className="badge badge-critical">🚨 Critical</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
