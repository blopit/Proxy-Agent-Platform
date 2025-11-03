#!/bin/bash
# Change to project root
cd "$(dirname "$0")/../.."
echo "Testing Capture with Micro-Steps"
echo "================================="
curl -X POST http://localhost:8000/api/v1/mobile/quick-capture \
  -H "Content-Type: application/json" \
  -d '{"text": "Email John about the project deadline", "user_id": "test", "voice_input": false, "auto_mode": true, "ask_for_clarity": false}'
