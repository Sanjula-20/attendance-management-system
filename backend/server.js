// server.js - AI-Powered College Attendance Management System
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: '🎓 AI-Powered College Attendance Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      courses: '/api/courses',
      attendance: '/api/attendance',
      notifications: '/api/notifications',
      ai: '/api/ai',
    },
    demoCredentials: {
      admin: { email: 'admin@college.edu', password: 'admin123' },
      faculty: { email: 'rajesh@college.edu', password: 'faculty123' },
      student: { email: 'aarav@student.edu', password: 'student123' },
    },
  });
});

// Cron job: Daily attendance alert check at 6 PM
cron.schedule('0 18 * * 1-5', async () => {
  console.log('🤖 Running daily attendance alert check...');
  const db = require('./db');
  const { getAttendanceStats } = require('./routes/students');
  const { v4: uuidv4 } = require('uuid');

  let alertCount = 0;
  let motivCount = 0;

  db.students.forEach((student) => {
    const stats = getAttendanceStats(student.id);
    if (!stats) return;

    if (stats.overall.percentage < 70) {
      db.notifications.push({
        id: uuidv4(),
        type: 'alert',
        title: '📢 Daily Attendance Reminder',
        message: `Your attendance is ${stats.overall.percentage}%. You need to attend more classes to meet the 70% requirement.`,
        studentId: student.id,
        percentage: stats.overall.percentage,
        read: false,
        createdAt: new Date().toISOString(),
      });
      alertCount++;
    }

    if (stats.overall.percentage === 100) {
      db.notifications.push({
        id: uuidv4(),
        type: 'motivation',
        title: '🌟 Daily Motivation',
        message: "You're absolutely crushing it with 100% attendance! Your dedication to education is remarkable. Keep going!",
        studentId: student.id,
        percentage: 100,
        read: false,
        createdAt: new Date().toISOString(),
      });
      motivCount++;
    }
  });

  console.log(`✅ Daily check complete: ${alertCount} alerts, ${motivCount} motivations sent`);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`\n🔑 Demo Login Credentials:`);
  console.log(`   Admin:   admin@college.edu / admin123`);
  console.log(`   Faculty: rajesh@college.edu / faculty123`);
  console.log(`   Student: aarav@student.edu / student123`);
});
