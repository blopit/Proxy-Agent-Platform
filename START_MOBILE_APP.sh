#!/bin/bash
# Mobile App Launcher for Dogfooding
# This script starts the Expo dev server with QR code visible

cd /Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile

echo "🚀 Starting Proxy Agent Mobile App..."
echo ""
echo "📱 Scan the QR code with:"
echo "   - iOS: Camera app"
echo "   - Android: Expo Go app"
echo ""
echo "⏳ Loading..."
echo ""

npx expo start --clear
