// routes/notifications.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/notifications - get notifications for current user
router.get('/', authMiddleware, (req, res) => {
  let notifications;
  if (req.user.role === 'student') {
    const student = db.students.find((s) => s.userId === req.user.id);
    if (!student) return res.json([]);
    notifications = db.notifications.filter((n) => n.studentId === student.id);
  } else {
    notifications = db.notifications;
  }
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifications);
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, (req, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  res.json(notif);
});

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, (req, res) => {
  const student = db.students.find((s) => s.userId === req.user.id);
  db.notifications.forEach((n) => {
    if (!student || n.studentId === student.id) n.read = true;
  });
  res.json({ message: 'All notifications marked as read' });
});

// POST /api/notifications/send - manually send notification (admin)
router.post('/send', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const { studentId, type, title, message } = req.body;
  if (!studentId || !type || !title || !message)
    return res.status(400).json({ error: 'studentId, type, title, message required' });

  const notif = {
    id: uuidv4(),
    type,
    title,
    message,
    studentId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notif);
  res.status(201).json(notif);
});

// POST /api/notifications/broadcast-alerts - trigger AI analysis and send alerts
router.post('/broadcast-alerts', authMiddleware, requireRole('admin', 'faculty'), (req, res) => {
  const { getAttendanceStats } = require('./students');
  let sent = 0;

  db.students.forEach((student) => {
    const stats = getAttendanceStats(student.id);
    if (!stats) return;

    // Alert for below 70%
    if (stats.overall.percentage < 70) {
      const existing = db.notifications.find(
        (n) =>
          n.studentId === student.id &&
          n.type === 'alert' &&
          new Date(n.createdAt) > new Date(Date.now() - 86400000)
      );
      if (!existing) {
        db.notifications.push({
          id: uuidv4(),
          type: 'alert',
          title: '⚠️ Critical Attendance Alert',
          message: `Your overall attendance is ${stats.overall.percentage}%, which is critically below the required 70%. Immediate action is required to avoid academic consequences.`,
          studentId: student.id,
          percentage: stats.overall.percentage,
          read: false,
          createdAt: new Date().toISOString(),
        });
        sent++;
      }
    }

    // Motivation for 100%
    if (stats.overall.percentage === 100) {
      const existing = db.notifications.find(
        (n) =>
          n.studentId === student.id &&
          n.type === 'motivation' &&
          new Date(n.createdAt) > new Date(Date.now() - 86400000)
      );
      if (!existing) {
        db.notifications.push({
          id: uuidv4(),
          type: 'motivation',
          title: '🌟 Perfect Attendance Champion!',
          message: `Amazing dedication! You've achieved 100% attendance. Your commitment to learning is truly inspiring. Keep up the exceptional work!`,
          studentId: student.id,
          percentage: 100,
          read: false,
          createdAt: new Date().toISOString(),
        });
        sent++;
      }
    }
  });

  res.json({ message: `Broadcast complete. ${sent} notifications sent.`, sent });
});

module.exports = router;
