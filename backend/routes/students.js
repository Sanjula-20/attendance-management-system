// routes/students.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Helper: compute attendance percentage per course
function getAttendanceStats(studentId) {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return null;

  const stats = student.enrolledCourses.map((courseId) => {
    const course = db.courses.find((c) => c.id === courseId);
    const records = db.attendance.filter(
      (a) => a.studentId === studentId && a.courseId === courseId
    );
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      courseId,
      courseName: course?.name,
      courseCode: course?.code,
      total,
      present,
      absent: total - present,
      percentage,
      status: percentage >= 75 ? 'safe' : percentage >= 70 ? 'warning' : 'critical',
    };
  });

  const overallTotal = stats.reduce((s, c) => s + c.total, 0);
  const overallPresent = stats.reduce((s, c) => s + c.present, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  return { courses: stats, overall: { total: overallTotal, present: overallPresent, percentage: overallPercentage } };
}

// GET /api/students - list all students (admin/faculty)
router.get('/', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const students = db.students.map((s) => {
    const stats = getAttendanceStats(s.id);
    return { ...s, attendanceStats: stats };
  });
  res.json(students);
});

// GET /api/students/me - current student profile
router.get('/me', authMiddleware, (req, res) => {
  const student = db.students.find((s) => s.userId === req.user.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const stats = getAttendanceStats(student.id);
  res.json({ ...student, attendanceStats: stats });
});

// GET /api/students/:id
router.get('/:id', authMiddleware, (req, res) => {
  const student = db.students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const stats = getAttendanceStats(student.id);
  res.json({ ...student, attendanceStats: stats });
});

// GET /api/students/:id/attendance-history
router.get('/:id/attendance-history', authMiddleware, (req, res) => {
  const { courseId, startDate, endDate } = req.query;
  let records = db.attendance.filter((a) => a.studentId === req.params.id);
  if (courseId) records = records.filter((a) => a.courseId === courseId);
  if (startDate) records = records.filter((a) => a.date >= startDate);
  if (endDate) records = records.filter((a) => a.date <= endDate);
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(records);
});

// PUT /api/students/:id - update student info
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.students[idx] = { ...db.students[idx], ...req.body, id: req.params.id };
  res.json(db.students[idx]);
});

// DELETE /api/students/:id
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.students.splice(idx, 1);
  res.json({ message: 'Student deleted' });
});

module.exports = router;
module.exports.getAttendanceStats = getAttendanceStats;
