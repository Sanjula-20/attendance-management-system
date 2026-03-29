# 🎓 AI-Powered College Attendance Management System

A fullstack intelligent attendance management system built with React (frontend) and Node.js/Express (backend), powered by Claude AI for smart analytics.

---

## 🌟 Features

- **Role-Based Access**: Admin, Faculty, and Student portals
- **AI-Powered Analysis**: Claude AI generates personalized insights and recommendations
- **Automated Alerts**: Sends notifications when attendance drops below 70%
- **Motivational Messages**: Rewards students with 100% attendance
- **Daily Cron Job**: Automated attendance checks at 6PM on weekdays
- **Rich Dashboards**: Charts, trends, course-wise breakdown
- **Mark Attendance**: Faculty can mark present/absent/late per session
- **Real-time Notifications**: In-app notification system

---

## 🏗️ Project Structure

```
attendance-system/
├── backend/           # Node.js + Express API
│   ├── routes/        # Auth, Students, Courses, Attendance, Notifications, AI
│   ├── middleware/    # JWT authentication
│   ├── db.js          # In-memory database with seeded data
│   └── server.js      # Entry point + cron jobs
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # Sidebar, Layout, StatCard, AttendanceBadge
│   │   ├── pages/       # All page components
│   │   ├── context/     # Auth context
│   │   └── utils/       # Axios API client
│   └── public/
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
node server.js
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

Frontend runs on: http://localhost:3000

---

## 🔑 Demo Login Credentials

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@college.edu       | admin123    |
| Faculty | rajesh@college.edu      | faculty123  |
| Student | aarav@student.edu       | student123  |
| Student | diya@student.edu        | student123  |
| Student | rohan@student.edu       | student123  |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/login    | Login user         |
| POST   | /api/auth/register | Register new user  |

### Students
| Method | Endpoint                           | Description            |
|--------|------------------------------------|------------------------|
| GET    | /api/students                      | List all students      |
| GET    | /api/students/me                   | Current student profile|
| GET    | /api/students/:id                  | Student detail         |
| GET    | /api/students/:id/attendance-history | Attendance history   |
| PUT    | /api/students/:id                  | Update student         |
| DELETE | /api/students/:id                  | Delete student         |

### Attendance
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/attendance                | All records              |
| POST   | /api/attendance/mark           | Mark attendance          |
| GET    | /api/attendance/today/:courseId| Today's attendance       |
| GET    | /api/attendance/summary        | Dashboard summary        |

### Courses
| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| GET    | /api/courses       | List courses    |
| POST   | /api/courses       | Create course   |
| PUT    | /api/courses/:id   | Update course   |
| DELETE | /api/courses/:id   | Delete course   |

### Notifications
| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| GET    | /api/notifications                    | Get notifications    |
| PUT    | /api/notifications/:id/read           | Mark as read         |
| PUT    | /api/notifications/read-all           | Mark all read        |
| POST   | /api/notifications/send               | Send notification    |
| POST   | /api/notifications/broadcast-alerts   | Broadcast AI alerts  |

### AI
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| POST   | /api/ai/analyze-student     | Student analysis data   |
| POST   | /api/ai/generate-report     | Full class report data  |

---

## 🤖 AI Features

The system integrates with **Anthropic Claude AI** for:

1. **Class-wide Analysis** - Generates insights about overall attendance patterns
2. **Individual Student Reports** - Personalized recommendations per student
3. **Risk Identification** - Automatically flags at-risk students
4. **Motivation Messages** - AI-crafted encouragement for perfect attendees

To enable AI features, add your Anthropic API key:
- Backend: `ANTHROPIC_API_KEY=sk-ant-...` in `backend/.env`
- Frontend: `REACT_APP_ANTHROPIC_KEY=sk-ant-...` in `frontend/.env`

---

## 🔄 Automated Cron Jobs

The system runs automated checks:
- **Daily at 6 PM** (Mon-Fri): Scans all students, sends alerts for <70% attendance and motivational messages for 100% attendance

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with React Router v6
- Recharts (data visualization)
- Axios (HTTP client)
- Custom CSS with CSS variables

**Backend:**
- Node.js + Express
- JWT authentication (jsonwebtoken)
- bcryptjs (password hashing)
- node-cron (scheduled jobs)
- nodemailer (email ready)
- In-memory database (swap for MongoDB/PostgreSQL in production)

---

## 🔒 Security Notes

- JWT tokens expire in 24 hours
- Passwords hashed with bcrypt (10 rounds)
- Role-based access control on all endpoints
- In production: use proper database, HTTPS, and env secrets

---

## 📦 Production Deployment

1. Replace in-memory `db.js` with MongoDB or PostgreSQL
2. Set `NODE_ENV=production`
3. Use PM2 or Docker for process management
4. Set up nginx reverse proxy
5. Configure real email (SMTP) in nodemailer
6. Enable CORS for your production frontend URL only
