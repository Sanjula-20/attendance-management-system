// routes/attendance.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/attendance - all records (admin/faculty)
router.get('/', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const { courseId, studentId, date, startDate, endDate } = req.query;
  let records = [...db.attendance];
  if (courseId) records = records.filter((a) => a.courseId === courseId);
  if (studentId) records = records.filter((a) => a.studentId === studentId);
  if (date) records = records.filter((a) => a.date === date);
  if (startDate) records = records.filter((a) => a.date >= startDate);
  if (endDate) records = records.filter((a) => a.date <= endDate);
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(records);
});

// POST /api/attendance/mark - mark attendance for a class session
router.post('/mark', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const { courseId, date, records } = req.body;
  // records: [{ studentId, status }]
  if (!courseId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'courseId, date and records array required' });
  }

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const created = [];
  const updated = [];

  records.forEach(({ studentId, status }) => {
    if (!['present', 'absent', 'late'].includes(status)) return;
    const existing = db.attendance.find(
      (a) => a.courseId === courseId && a.studentId === studentId && a.date === date
    );
    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date().toISOString();
      updated.push(existing);
    } else {
      const record = {
        id: uuidv4(),
        studentId,
        courseId,
        date,
        status,
        markedBy: req.user.id,
        createdAt: new Date().toISOString(),
      };
      db.attendance.push(record);
      created.push(record);
    }
  });

  // Check attendance thresholds and auto-generate notifications
  const { getAttendanceStats } = require('./students');
  const studentIds = [...new Set(records.map((r) => r.studentId))];
  studentIds.forEach((studentId) => {
    const stats = getAttendanceStats(studentId);
    if (!stats) return;
    const courseStats = stats.courses.find((c) => c.courseId === courseId);
    if (!courseStats) return;

    if (courseStats.percentage < 70) {
      // Check if notification already sent recently
      const recentNotif = db.notifications.find(
        (n) =>
          n.studentId === studentId &&
          n.type === 'alert' &&
          n.courseId === courseId &&
          new Date(n.createdAt) > new Date(Date.now() - 86400000 * 3)
      );
      if (!recentNotif) {
        db.notifications.push({
          id: uuidv4(),
          type: 'alert',
          title: '⚠️ Low Attendance Warning',
          message: `Your attendance in ${courseStats.courseName} is ${courseStats.percentage}%, which is below the required 70%. Please attend classes regularly to avoid academic penalties.`,
          studentId,
          courseId,
          percentage: courseStats.percentage,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 100% attendance motivation
    if (stats.overall.percentage === 100) {
      const recentMotiv = db.notifications.find(
        (n) =>
          n.studentId === studentId &&
          n.type === 'motivation' &&
          new Date(n.createdAt) > new Date(Date.now() - 86400000)
      );
      if (!recentMotiv) {
        const motivMessages = [
          "🌟 Outstanding! Your perfect attendance shows incredible dedication. Keep up the amazing work!",
          "🏆 100% attendance champion! Your commitment to learning sets you apart. You're an inspiration!",
          "✨ Perfect attendance maintained! Your consistency and discipline are truly commendable. Stay awesome!",
          "🎯 Phenomenal effort! Maintaining perfect attendance shows your passion for education. Keep shining!",
        ];
        db.notifications.push({
          id: uuidv4(),
          type: 'motivation',
          title: '🎉 Perfect Attendance Star!',
          message: motivMessages[Math.floor(Math.random() * motivMessages.length)],
          studentId,
          percentage: 100,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  res.json({ message: 'Attendance marked successfully', created: created.length, updated: updated.length });
});

// GET /api/attendance/today/:courseId - today's attendance for a course
router.get('/today/:courseId', authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const records = db.attendance.filter(
    (a) => a.courseId === req.params.courseId && a.date === today
  );
  res.json(records);
});

// GET /api/attendance/summary - dashboard summary
router.get('/summary', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const { getAttendanceStats } = require('./students');
  const allStats = db.students.map((s) => {
    const stats = getAttendanceStats(s.id);
    return { student: s, stats };
  });

  const below70 = allStats.filter((s) => s.stats?.overall.percentage < 70).length;
  const below75 = allStats.filter((s) => s.stats?.overall.percentage >= 70 && s.stats?.overall.percentage < 75).length;
  const perfect = allStats.filter((s) => s.stats?.overall.percentage === 100).length;
  const safe = allStats.filter((s) => s.stats?.overall.percentage >= 75).length;

  const today = new Date().toISOString().split('T')[0];
  const todayTotal = db.attendance.filter((a) => a.date === today).length;
  const todayPresent = db.attendance.filter((a) => a.date === today && a.status === 'present').length;

  res.json({
    totalStudents: db.students.length,
    totalCourses: db.courses.length,
    below70,
    below75,
    perfect,
    safe,
    todayAttendance: { total: todayTotal, present: todayPresent },
    alertsSent: db.notifications.filter((n) => n.type === 'alert').length,
    motivationsSent: db.notifications.filter((n) => n.type === 'motivation').length,
  });
});

module.exports = router;
