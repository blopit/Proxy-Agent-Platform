#!/bin/bash

echo "==================================="
echo "Task Capture System Test Suite"
echo "==================================="
echo ""

API_URL="http://localhost:8000/api/v1/mobile/quick-capture"

# Test 1: Basic task capture
echo "Test 1: Basic task capture"
echo "-----------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Write unit tests", "user_id": "test-user", "voice_input": false, "auto_mode": true, "ask_for_clarity": false}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Task ID: {data[\"task\"][\"task_id\"]}'); print(f'✅ Title: {data[\"task\"][\"title\"]}'); print(f'✅ Status: {data[\"task\"][\"status\"]}'); print(f'✅ Processing: {data[\"processing_time_ms\"]}ms')"
echo ""

# Test 2: Task with date extraction
echo "Test 2: Task with date extraction (tomorrow)"
echo "-----------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Call mom tomorrow", "user_id": "test-user", "voice_input": false, "auto_mode": true, "ask_for_clarity": false}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Task ID: {data[\"task\"][\"task_id\"]}'); print(f'✅ Title: {data[\"task\"][\"title\"]}'); print(f'✅ Due Date: {data[\"task\"][\"due_date\"]}'); print(f'✅ Category: {data[\"analysis\"][\"category\"]}')"
echo ""

# Test 3: Task with priority keywords
echo "Test 3: Task with priority detection"
echo "-----------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "URGENT: Fix production bug", "user_id": "test-user", "voice_input": false, "auto_mode": true, "ask_for_clarity": false}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Task ID: {data[\"task\"][\"task_id\"]}'); print(f'✅ Title: {data[\"task\"][\"title\"]}'); print(f'✅ Priority: {data[\"task\"][\"priority\"]}'); print(f'✅ Category: {data[\"analysis\"][\"category\"]}')"
echo ""

# Test 4: Email task
echo "Test 4: Email task"
echo "-----------------------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Email John about project deadline", "user_id": "test-user", "voice_input": false, "auto_mode": true, "ask_for_clarity": false}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Task ID: {data[\"task\"][\"task_id\"]}'); print(f'✅ Title: {data[\"task\"][\"title\"]}'); print(f'✅ Should Delegate: {data[\"analysis\"][\"should_delegate\"]}')"
echo ""

# Test 5: Verify tasks are in database
echo "Test 5: Verify tasks saved to database"
echo "-----------------------------------"
curl -s "http://localhost:8000/api/v1/tasks?user_id=test-user&limit=5" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Total tasks in DB: {data[\"total\"]}'); print(f'✅ Tasks returned: {len(data[\"tasks\"])}'); [print(f'  - {t[\"title\"]}') for t in data['tasks'][:5]]"
echo ""

echo "==================================="
echo "All tests completed!"
echo "==================================="
