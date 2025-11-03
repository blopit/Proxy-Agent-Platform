#!/bin/bash
# Change to project root
cd "$(dirname "$0")/../.."

# Test the capture endpoint with micro-step breakdown
echo "🧪 Testing Capture with Micro-Steps Breakdown"
echo "=============================================="
echo ""

# Test 1: Simple task that should decompose
echo "Test 1: Email task"
echo "-------------------"
curl -X POST http://localhost:8000/api/v1/mobile/quick-capture \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Email John about the project deadline by Friday",
    "user_id": "test-user",
    "voice_input": false,
    "auto_mode": true,
    "ask_for_clarity": false
  }' | python3 -m json.tool

echo ""
echo ""

# Test 2: Complex task with multiple steps
echo "Test 2: Complex task"
echo "--------------------"
curl -X POST http://localhost:8000/api/v1/mobile/quick-capture \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Research competitors, write a summary report, and schedule a team meeting to discuss findings",
    "user_id": "test-user",
    "voice_input": false,
    "auto_mode": true,
    "ask_for_clarity": false
  }' | python3 -m json.tool

echo ""
echo ""

# Test 3: Simple human-only task
echo "Test 3: Simple human task"
echo "-------------------------"
curl -X POST http://localhost:8000/api/v1/mobile/quick-capture \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Clean my desk",
    "user_id": "test-user",
    "voice_input": false,
    "auto_mode": true,
    "ask_for_clarity": false
  }' | python3 -m json.tool

echo ""
echo "✅ Tests complete!"
