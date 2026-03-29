// routes/courses.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/courses
router.get('/', authMiddleware, (req, res) => {
  const courses = db.courses.map((c) => {
    const faculty = db.users.find((u) => u.id === c.facultyId);
    const enrolled = db.students.filter((s) => s.enrolledCourses.includes(c.id)).length;
    return { ...c, facultyName: faculty?.name, enrolledCount: enrolled };
  });
  res.json(courses);
});

// GET /api/courses/:id
router.get('/:id', authMiddleware, (req, res) => {
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const faculty = db.users.find((u) => u.id === course.facultyId);
  const students = db.students.filter((s) => s.enrolledCourses.includes(course.id));
  res.json({ ...course, facultyName: faculty?.name, students });
});

// POST /api/courses (admin only)
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { code, name, department, facultyId, totalClasses } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Code and name required' });
  const course = {
    id: uuidv4(),
    code,
    name,
    department: department || 'General',
    facultyId,
    totalClasses: totalClasses || 40,
    createdAt: new Date().toISOString(),
  };
  db.courses.push(course);
  res.status(201).json(course);
});

// PUT /api/courses/:id
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const idx = db.courses.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  db.courses[idx] = { ...db.courses[idx], ...req.body, id: req.params.id };
  res.json(db.courses[idx]);
});

// DELETE /api/courses/:id
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const idx = db.courses.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  db.courses.splice(idx, 1);
  res.json({ message: 'Course deleted' });
});

module.exports = router;
