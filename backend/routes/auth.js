// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  const { password: _, ...userWithoutPassword } = user;

  // If student, attach student record
  let studentInfo = null;
  if (user.role === 'student') {
    studentInfo = db.students.find((s) => s.userId === user.id);
  }

  res.json({ token, user: userWithoutPassword, student: studentInfo });
});

// POST /api/auth/register (admin only in real app, open for demo)
router.post('/register', (req, res) => {
  const { name, email, password, role, rollNo, department, semester } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' });

  if (db.users.find((u) => u.email === email))
    return res.status(400).json({ error: 'Email already exists' });

  const { v4: uuidv4 } = require('uuid');
  const userId = uuidv4();
  const hashedPw = bcrypt.hashSync(password, 10);

  const newUser = {
    id: userId,
    name,
    email,
    password: hashedPw,
    role: role || 'student',
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  if (role === 'student' || !role) {
    const studentId = uuidv4();
    const courses = db.courses.map((c) => c.id);
    db.students.push({
      id: studentId,
      userId,
      name,
      email,
      rollNo: rollNo || `STU${Date.now()}`,
      department: department || 'Computer Science',
      semester: semester || 1,
      phone: '',
      enrolledCourses: courses,
      createdAt: new Date().toISOString(),
    });
  }

  const token = jwt.sign({ id: userId, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ token, user: userWithoutPassword });
});

module.exports = router;
