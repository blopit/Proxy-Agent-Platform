#!/bin/bash

# Start script for Proxy Agent Platform
# This script starts both backend and frontend services

# Change to project root
cd "$(dirname "$0")/.."

set -e

echo "🚀 Starting Proxy Agent Platform..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ UV is not installed. Please install it first:"
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Install backend dependencies if needed
echo "📦 Checking backend dependencies..."
uv sync

# Install frontend dependencies if needed
echo "📦 Installing frontend dependencies..."
cd frontend
rm -rf node_modules package-lock.json .next
npm install
cd ..

# Start backend server
echo "🔧 Starting backend server..."
uv run uvicorn src.api.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if services are running
echo "🔍 Checking services..."

# Check backend
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend running at http://localhost:8000"
else
    echo "⚠️  Backend may still be starting..."
fi

# Check frontend (Next.js doesn't have a health endpoint, so we just check if port is open)
if nc -z localhost 3000 2>/dev/null; then
    echo "✅ Frontend running at http://localhost:3000"
else
    echo "⚠️  Frontend may still be starting..."
fi

echo ""
echo "🎉 Proxy Agent Platform is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Open browser automatically
if command -v open &> /dev/null; then
    echo "🌐 Opening browser..."
    sleep 2
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening browser..."
    sleep 2
    xdg-open http://localhost:3000
else
    echo "🌐 Please open http://localhost:3000 in your browser"
fi

# Keep script running and wait for Ctrl+C
wait