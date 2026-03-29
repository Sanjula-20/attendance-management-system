#!/bin/bash
# start.sh - Quick start script for development

echo "🎓 AI-Powered College Attendance Management System"
echo "=================================================="

# Start backend
echo ""
echo "🚀 Starting backend on port 5000..."
cd backend
npm install --silent
node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo ""
echo "🎨 Starting frontend on port 3000..."
cd ../frontend
npm install --silent
npm start &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=================================================="
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend:  http://localhost:5000"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:   admin@college.edu / admin123"
echo "   Faculty: rajesh@college.edu / faculty123"
echo "   Student: aarav@student.edu / student123"
echo ""
echo "Press Ctrl+C to stop all services"

wait $BACKEND_PID $FRONTEND_PID
