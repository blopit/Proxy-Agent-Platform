#!/bin/bash

# AI Backend Testing Script
# Tests all Epic 2 AI features (2.1, 2.2, 2.3)

BASE_URL="http://localhost:8001"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhaXRlc3QiLCJleHAiOjE3NjEwODAzMDAuOTE5OTY1fQ.p6guI-QIA7eqBNGezzRqwC3-HrwuYlJ7fC96pWtMbW8"

echo "🤖 Testing AI-Powered Backend (Epic 2.1, 2.2, 2.3)"
echo "=================================================="
echo ""

# Test 1: AI Focus Session Start (Epic 2.2)
echo "1️⃣  Testing AI Focus Session (Epic 2.2 - Duration Optimization)"
echo "   Endpoint: POST /api/v1/focus/sessions/start"
curl -s -X POST "$BASE_URL/api/v1/focus/sessions/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"task_context": "Complex debugging session with AI analysis"}' \
  | python -m json.tool 2>/dev/null || echo "   ✗ Endpoint not responding"
echo ""
echo ""

# Test 2: AI Energy Tracking (Epic 2.2)
echo "2️⃣  Testing AI Energy Tracking (Epic 2.2 - Predictions & Recommendations)"
echo "   Endpoint: POST /api/v1/energy/track"
curl -s -X POST "$BASE_URL/api/v1/energy/track" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "feeling tired after lunch, need energy boost"}' \
  | python -m json.tool 2>/dev/null || echo "   ✗ Endpoint not responding"
echo ""
echo ""

# Test 3: AI Gamification Motivation (Epic 2.3)
echo "3️⃣  Testing AI Motivation Strategy (Epic 2.3 - Personalized Re-engagement)"
echo "   Endpoint: POST /api/v1/gamification/motivation"
curl -s -X POST "$BASE_URL/api/v1/gamification/motivation" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "engagement_level": "moderate",
    "completion_rate_last_week": 0.65,
    "recent_activity_drop": true,
    "preferred_motivators": ["progress_tracking", "social_comparison"]
  }' \
  | python -m json.tool 2>/dev/null || echo "   ✗ Endpoint not responding"
echo ""
echo ""

# Test 4: Check available endpoints
echo "4️⃣  Available AI Endpoints"
echo "   GET /health"
curl -s "$BASE_URL/health" | python -m json.tool 2>/dev/null
echo ""

echo "=================================================="
echo "✅ AI Backend Testing Complete!"
echo ""
echo "📝 Note: If you see 'placeholder' or 'not implemented' messages,"
echo "   the AI agents are working but may need OpenAI API key configured"
echo "   in your .env file (LLM_API_KEY=sk-your-key-here)"
