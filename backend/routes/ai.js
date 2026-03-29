// routes/ai.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getAttendanceStats } = require('./students');

// POST /api/ai/analyze-student - AI analysis for a student
router.post('/analyze-student', authMiddleware, async (req, res) => {
  const { studentId } = req.body;
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const stats = getAttendanceStats(studentId);
  const recentAttendance = db.attendance
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30);

  // Return data formatted for AI analysis
  res.json({
    student: { name: student.name, rollNo: student.rollNo, department: student.department },
    stats,
    recentAttendance,
    riskLevel:
      stats.overall.percentage < 70
        ? 'critical'
        : stats.overall.percentage < 75
        ? 'warning'
        : 'safe',
  });
});

// POST /api/ai/generate-report - generate attendance report data
router.post('/generate-report', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const allStudentStats = db.students.map((s) => {
    const stats = getAttendanceStats(s.id);
    return {
      id: s.id,
      name: s.name,
      rollNo: s.rollNo,
      department: s.department,
      overallPercentage: stats?.overall.percentage || 0,
      courseBreakdown: stats?.courses || [],
      riskLevel:
        (stats?.overall.percentage || 0) < 70
          ? 'critical'
          : (stats?.overall.percentage || 0) < 75
          ? 'warning'
          : 'safe',
    };
  });

  const summary = {
    totalStudents: allStudentStats.length,
    criticalCount: allStudentStats.filter((s) => s.riskLevel === 'critical').length,
    warningCount: allStudentStats.filter((s) => s.riskLevel === 'warning').length,
    safeCount: allStudentStats.filter((s) => s.riskLevel === 'safe').length,
    perfectCount: allStudentStats.filter((s) => s.overallPercentage === 100).length,
    averageAttendance: Math.round(
      allStudentStats.reduce((sum, s) => sum + s.overallPercentage, 0) / allStudentStats.length
    ),
  };

  res.json({ summary, students: allStudentStats, generatedAt: new Date().toISOString() });
});

module.exports = router;
