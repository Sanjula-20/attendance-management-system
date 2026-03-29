// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Attendance from './pages/Attendance';
import Courses from './pages/Courses';
import Notifications from './pages/Notifications';
import AIReports from './pages/AIReports';
import StudentDashboard from './pages/StudentDashboard';
import './index.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'student' ? '/student' : '/dashboard'} />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/dashboard'} /> : <Login />} />

      {/* Admin & Faculty routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'faculty']}><Dashboard /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute roles={['admin', 'faculty']}><Students /></ProtectedRoute>} />
      <Route path="/students/:id" element={<ProtectedRoute roles={['admin', 'faculty']}><StudentDetail /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute roles={['admin', 'faculty']}><Attendance /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute roles={['admin', 'faculty']}><Courses /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute roles={['admin', 'faculty']}><Notifications /></ProtectedRoute>} />
      <Route path="/ai-reports" element={<ProtectedRoute roles={['admin', 'faculty']}><AIReports /></ProtectedRoute>} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute roles={['student']}><Notifications /></ProtectedRoute>} />

      {/* Redirect root */}
      <Route path="/" element={<Navigate to={user ? (user.role === 'student' ? '/student' : '/dashboard') : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
