#!/bin/bash

# Script to start both frontend and backend servers on macOS/Linux

echo ""
echo "========================================"
echo "Skill-Bridge Career Navigator - Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node -v)"
echo ""

# Check for .env file
if [ ! -f "backend/.env" ]; then
    echo "ERROR: backend/.env file not found!"
    echo "Please create backend/.env with your GEMINI_API_KEY"
    echo ""
    echo "Example:"
    echo "  GEMINI_API_KEY=your_key_here"
    echo "  PORT=5000"
    echo ""
    exit 1
fi

echo "Starting application..."
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend server..."
(cd backend && npm install && npm run dev) &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
(cd frontend && npm install && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Servers starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
