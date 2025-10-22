#!/bin/bash

# Start ngrok for remote access to development environment
# This script creates tunnels for both frontend and backend

echo "🚀 Starting ngrok tunnels for Proxy Agent Platform"
echo "=================================================="
echo ""

# Kill any existing ngrok processes
pkill -f ngrok 2>/dev/null
sleep 2

# Start backend tunnel (port 8001)
echo "📡 Starting backend tunnel on port 8001..."
ngrok http 8001 --log=stdout > ngrok-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ngrok-backend.pid
sleep 4

# Get backend URL
BACKEND_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data['tunnels'] else 'Not ready')")

echo "✅ Backend ngrok tunnel:"
echo "   Local:  http://localhost:8001"
echo "   Public: $BACKEND_URL"
echo "   PID:    $BACKEND_PID"
echo ""

# Update frontend .env.local with backend URL
echo "📝 Updating frontend/.env.local with ngrok backend URL..."
cd frontend
if [ ! -f .env.local ]; then
    cp .env.example .env.local 2>/dev/null || touch .env.local
fi

# Update or add NEXT_PUBLIC_API_URL
if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
    sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL|" .env.local
else
    echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" >> .env.local
fi

echo "✅ Updated frontend/.env.local"
echo ""
cd ..

# Wait a moment for Next.js to reload
sleep 3

echo "=================================================="
echo "🎉 Ngrok setup complete!"
echo ""
echo "📱 Access your mobile app from anywhere:"
echo "   Frontend (local):  http://localhost:3000/mobile"
echo "   Backend (remote):  $BACKEND_URL"
echo ""
echo "💡 The frontend will connect to the remote backend automatically"
echo "💡 Hot reloading is active - changes will reflect in real-time!"
echo ""
echo "📊 Monitor ngrok traffic:"
echo "   http://127.0.0.1:4040"
echo ""
echo "🛑 To stop ngrok:"
echo "   pkill -f ngrok"
echo ""
echo "⚠️  Note: Free ngrok accounts allow 1 tunnel. The frontend stays local."
echo "   For full remote access, consider ngrok paid plan for 2+ tunnels."
echo "=================================================="
