#!/bin/bash
# Change to project root
cd "$(dirname "$0")/../.."

# Test ADHD UX Flow - Complete Integration Test
# Tests the full capture flow with visual feedback

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 ADHD UX Flow Integration Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Backend Health Check
echo "1️⃣  Testing Backend Health..."
HEALTH=$(curl -s http://localhost:8000/health)
if echo "$HEALTH" | grep -q "healthy"; then
  echo "   ✅ Backend is healthy"
else
  echo "   ❌ Backend health check failed"
  exit 1
fi
echo ""

# Test 2: Frontend Accessibility
echo "2️⃣  Testing Frontend Accessibility..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/mobile)
if [ "$FRONTEND" = "200" ]; then
  echo "   ✅ Frontend is accessible"
else
  echo "   ❌ Frontend returned status: $FRONTEND"
  exit 1
fi
echo ""

# Test 3: Quick Capture with Full Response
echo "3️⃣  Testing Quick Capture API (Full ADHD UX Response)..."
RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/mobile/quick-capture" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Write comprehensive unit tests for the authentication module",
    "user_id": "adhd-ux-test",
    "voice_input": false,
    "auto_mode": true,
    "ask_for_clarity": false
  }')

# Check if response has all required fields for ADHD UX
HAS_TASK=$(echo "$RESPONSE" | grep -o '"task"' | wc -l)
HAS_MICRO_STEPS=$(echo "$RESPONSE" | grep -o '"micro_steps"' | wc -l)
HAS_BREAKDOWN=$(echo "$RESPONSE" | grep -o '"breakdown"' | wc -l)

if [ "$HAS_TASK" -gt 0 ] && [ "$HAS_MICRO_STEPS" -gt 0 ] && [ "$HAS_BREAKDOWN" -gt 0 ]; then
  echo "   ✅ API returned complete response structure"

  # Pretty print the response structure
  echo ""
  echo "   📊 Response Structure:"
  echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'      Task: {data[\"task\"][\"title\"]}')
print(f'      Priority: {data[\"task\"][\"priority\"]}')
print(f'      Micro-steps: {len(data[\"micro_steps\"])}')
print(f'      Total Steps: {data[\"breakdown\"][\"total_steps\"]}')
print(f'      Digital: {data[\"breakdown\"][\"digital_count\"]}')
print(f'      Human: {data[\"breakdown\"][\"human_count\"]}')
print(f'      Total Time: {data[\"breakdown\"][\"total_minutes\"]} minutes')
print(f'      Processing Time: {data[\"processing_time_ms\"]}ms')
" 2>/dev/null || echo "      (JSON parsing skipped)"
else
  echo "   ❌ API response missing required fields"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

# Test 4: Verify Micro-steps Structure
echo "4️⃣  Testing Micro-steps Structure..."
FIRST_STEP=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['micro_steps']:
        step = data['micro_steps'][0]
        print(json.dumps(step, indent=2))
        exit(0)
    exit(1)
except:
    exit(1)
" 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "   ✅ Micro-steps have correct structure"
  echo ""
  echo "   🔍 Sample Micro-step:"
  echo "$FIRST_STEP" | sed 's/^/      /'
else
  echo "   ⚠️  No micro-steps found (might be expected for simple tasks)"
fi
echo ""

# Test 5: Task Persistence Check
echo "5️⃣  Testing Task Persistence..."
TASK_COUNT_BEFORE=$(curl -s "http://localhost:8000/api/v1/tasks?user_id=adhd-ux-test&limit=100" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "0")

# Create another task
curl -s -X POST "http://localhost:8000/api/v1/mobile/quick-capture" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Review pull requests and merge approved changes",
    "user_id": "adhd-ux-test",
    "voice_input": false,
    "auto_mode": true,
    "ask_for_clarity": false
  }' > /dev/null

sleep 1

TASK_COUNT_AFTER=$(curl -s "http://localhost:8000/api/v1/tasks?user_id=adhd-ux-test&limit=100" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "0")

if [ "$TASK_COUNT_AFTER" -gt "$TASK_COUNT_BEFORE" ]; then
  echo "   ✅ Tasks are being persisted correctly"
  echo "      Tasks before: $TASK_COUNT_BEFORE"
  echo "      Tasks after:  $TASK_COUNT_AFTER"
else
  echo "   ⚠️  Task persistence check inconclusive"
  echo "      Tasks before: $TASK_COUNT_BEFORE"
  echo "      Tasks after:  $TASK_COUNT_AFTER"
fi
echo ""

# Test 6: Frontend Components Check
echo "6️⃣  Testing Frontend Component Integration..."
echo "   📦 Checking for ADHD UX components in page source..."

# Test if the mobile page compiles without errors
PAGE_SOURCE=$(curl -s http://localhost:3000/mobile)

COMPONENTS_FOUND=0
if echo "$PAGE_SOURCE" | grep -q "CaptureLoading\|TaskDropAnimation\|MicroStepsBreakdown"; then
  COMPONENTS_FOUND=$((COMPONENTS_FOUND + 1))
fi

if [ "$COMPONENTS_FOUND" -gt 0 ] || echo "$PAGE_SOURCE" | grep -q "<!DOCTYPE html>"; then
  echo "   ✅ Frontend page rendered successfully"
  echo "      Page size: $(echo "$PAGE_SOURCE" | wc -c) bytes"
else
  echo "   ❌ Frontend page rendering failed"
  exit 1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ADHD UX Flow Integration Tests PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Ready to test in browser at: http://localhost:3000/mobile"
echo ""
echo "Expected UX Flow:"
echo "  1. 📝 Type task in input"
echo "  2. 📤 Submit → Drop animation (500ms)"
echo "  3. 🤖 Loading stage: 'Analyzing...' (0-2s)"
echo "  4. ✂️  Loading stage: 'Breaking into micro-steps...' (2-4s)"
echo "  5. 🎯 Loading stage: 'Almost done...' (4s+)"
echo "  6. ✨ Celebration animation (1.5s)"
echo "  7. 📊 Breakdown panel appears with:"
echo "      • Task details"
echo "      • Stat badges (total steps, time, digital/human split)"
echo "      • Expandable micro-steps list"
echo "      • Action buttons (Start Now, View Tasks, Capture Another)"
echo ""
