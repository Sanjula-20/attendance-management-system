// db.js - In-memory database (replace with MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = {
  users: [],
  students: [],
  courses: [],
  attendance: [],
  notifications: [],
};

// Seed initial data
function seedData() {
  // Admin user
  const adminId = uuidv4();
  db.users.push({
    id: adminId,
    name: 'Admin User',
    email: 'admin@college.edu',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
  });

  // Faculty users
  const faculty1Id = uuidv4();
  db.users.push({
    id: faculty1Id,
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh@college.edu',
    password: bcrypt.hashSync('faculty123', 10),
    role: 'faculty',
    department: 'Computer Science',
    createdAt: new Date().toISOString(),
  });

  const faculty2Id = uuidv4();
  db.users.push({
    id: faculty2Id,
    name: 'Prof. Meena Sharma',
    email: 'meena@college.edu',
    password: bcrypt.hashSync('faculty123', 10),
    role: 'faculty',
    department: 'Mathematics',
    createdAt: new Date().toISOString(),
  });

  // Courses
  const courses = [
    { id: uuidv4(), code: 'CS101', name: 'Data Structures', department: 'Computer Science', facultyId: faculty1Id, totalClasses: 40 },
    { id: uuidv4(), code: 'CS201', name: 'Operating Systems', department: 'Computer Science', facultyId: faculty1Id, totalClasses: 38 },
    { id: uuidv4(), code: 'MA101', name: 'Calculus', department: 'Mathematics', facultyId: faculty2Id, totalClasses: 42 },
    { id: uuidv4(), code: 'CS301', name: 'Database Management', department: 'Computer Science', facultyId: faculty1Id, totalClasses: 35 },
    { id: uuidv4(), code: 'MA201', name: 'Linear Algebra', department: 'Mathematics', facultyId: faculty2Id, totalClasses: 36 },
  ];
  db.courses.push(...courses);

  // Students
  const studentData = [
    { name: 'Aarav Patel', email: 'aarav@student.edu', rollNo: 'CS2021001' },
    { name: 'Diya Sharma', email: 'diya@student.edu', rollNo: 'CS2021002' },
    { name: 'Rohan Verma', email: 'rohan@student.edu', rollNo: 'CS2021003' },
    { name: 'Priya Nair', email: 'priya@student.edu', rollNo: 'CS2021004' },
    { name: 'Kabir Singh', email: 'kabir@student.edu', rollNo: 'CS2021005' },
    { name: 'Ananya Reddy', email: 'ananya@student.edu', rollNo: 'CS2021006' },
    { name: 'Vikram Joshi', email: 'vikram@student.edu', rollNo: 'CS2021007' },
    { name: 'Sana Khan', email: 'sana@student.edu', rollNo: 'CS2021008' },
    { name: 'Arjun Mehta', email: 'arjun@student.edu', rollNo: 'CS2021009' },
    { name: 'Neha Gupta', email: 'neha@student.edu', rollNo: 'CS2021010' },
  ];

  studentData.forEach((s) => {
    const studentId = uuidv4();
    const userId = uuidv4();
    db.users.push({
      id: userId,
      name: s.name,
      email: s.email,
      password: bcrypt.hashSync('student123', 10),
      role: 'student',
      studentId,
      createdAt: new Date().toISOString(),
    });
    db.students.push({
      id: studentId,
      userId,
      name: s.name,
      email: s.email,
      rollNo: s.rollNo,
      department: 'Computer Science',
      semester: 5,
      phone: `+91 98765 ${Math.floor(10000 + Math.random() * 90000)}`,
      enrolledCourses: courses.map((c) => c.id),
      createdAt: new Date().toISOString(),
    });
  });

  // Generate attendance records
  const today = new Date();
  db.students.forEach((student, sIndex) => {
    courses.forEach((course) => {
      const totalClasses = course.totalClasses;
      // Vary attendance: some students below 70%, some at 100%
      let attendedClasses;
      if (sIndex < 2) attendedClasses = totalClasses; // 100%
      else if (sIndex < 4) attendedClasses = Math.floor(totalClasses * 0.65); // ~65% (below threshold)
      else if (sIndex === 4) attendedClasses = Math.floor(totalClasses * 0.55); // ~55% critical
      else attendedClasses = Math.floor(totalClasses * (0.70 + Math.random() * 0.25)); // 70-95%

      // Create attendance records
      for (let i = 0; i < totalClasses; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (totalClasses - i));
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const present = i < attendedClasses;
        db.attendance.push({
          id: uuidv4(),
          studentId: student.id,
          courseId: course.id,
          date: date.toISOString().split('T')[0],
          status: present ? 'present' : 'absent',
          markedBy: course.facultyId,
          createdAt: date.toISOString(),
        });
      }
    });
  });

  // Sample notifications
  db.notifications.push(
    {
      id: uuidv4(),
      type: 'alert',
      title: 'Low Attendance Warning',
      message: 'Your attendance in Data Structures has dropped below 70%. Please attend classes regularly.',
      studentId: db.students[2].id,
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      type: 'motivation',
      title: '🎉 Perfect Attendance!',
      message: "Incredible dedication! You've maintained 100% attendance this week. Keep shining!",
      studentId: db.students[0].id,
      read: false,
      createdAt: new Date().toISOString(),
    }
  );

  console.log('✅ Database seeded successfully');
  console.log(`   Users: ${db.users.length} | Students: ${db.students.length} | Courses: ${db.courses.length} | Attendance records: ${db.attendance.length}`);
}

seedData();

module.exports = db;
