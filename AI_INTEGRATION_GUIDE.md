# 🤖 AI Integration Guide

Complete guide to using the AI-powered backend features (Epic 2: Complete)

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Epic 2.1: Task Intelligence](#epic-21-task-intelligence)
4. [Epic 2.2: Focus & Energy Management](#epic-22-focus--energy-management)
5. [Epic 2.3: Progress & Gamification](#epic-23-progress--gamification)
6. [Mobile Integration](#mobile-integration)
7. [Testing](#testing)

---

## Overview

All AI agents use **real OpenAI GPT-4** integration with graceful fallback to heuristics.

### What's Implemented

- ✅ **9 AI-powered features** across 4 agents
- ✅ **89/89 agent tests** passing (100%)
- ✅ **Real GPT-4 integration** (not mocks!)
- ✅ **Graceful degradation** (works without AI key)
- ✅ **Production-ready APIs** (FastAPI + Pydantic)

### Architecture

```
Mobile App (React/Next.js)
    ↓
API Endpoints (/api/v1/*)
    ↓
AI Agents (src/agents/)
    ↓
OpenAI GPT-4 ← → Heuristic Fallback
```

---

## Setup

### 1. Configure Environment Variables

```bash
# .env file
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-actual-openai-key-here
LLM_MODEL=gpt-4  # or gpt-3.5-turbo for lower cost
```

**Note:** The system works WITHOUT an API key (uses heuristics), but AI features require a valid key.

### 2. Start Backend Server

```bash
# Activate virtual environment
source .venv/bin/activate

# Start FastAPI server
uvicorn src.api.main:app --reload --port 8001
```

Server will be available at: `http://localhost:8001`

### 3. API Documentation

Visit: `http://localhost:8001/docs` for interactive Swagger UI

---

## Epic 2.1: Task Intelligence

**AI Features:**
- Task prioritization (urgency analysis)
- Task breakdown (subtask generation)
- Duration estimation (hours + confidence)

### API Endpoint

```bash
POST /api/v1/tasks
```

### Example Request

```bash
curl -X POST http://localhost:8001/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Refactor authentication system",
    "description": "Improve security and add 2FA",
    "priority": "high"
  }'
```

### Example Response

```json
{
  "task_id": "uuid-here",
  "title": "Refactor authentication system",
  "ai_analysis": {
    "urgency_score": 0.85,
    "subtasks": [
      "Audit current auth implementation",
      "Research 2FA libraries",
      "Implement TOTP generation",
      "Add QR code generation",
      "Write integration tests",
      "Update documentation"
    ],
    "estimated_duration": {
      "hours": 8.5,
      "confidence": 0.75
    }
  }
}
```

### TypeScript Client

```typescript
import { createIntelligentTask } from '@/lib/ai-api';

const result = await createIntelligentTask({
  title: 'Refactor authentication',
  description: 'Improve security and add 2FA',
  priority: 'high'
});

console.log('AI subtasks:', result.data.ai_analysis.subtasks);
console.log('Estimated hours:', result.data.ai_analysis.estimated_duration.hours);
```

---

## Epic 2.2: Focus & Energy Management

### AI Features

#### Focus Agent (2 AI features)
1. **Session Duration Optimization** - AI recommends optimal focus time
2. **Distraction Detection** - AI analyzes activity patterns

#### Energy Agent (2 AI features)
1. **Energy Prediction** - AI predicts energy levels
2. **Personalized Recommendations** - AI generates energy optimization tips

### API Endpoints

```bash
# Focus - Get AI duration recommendation
GET /api/v1/focus/recommend-duration?task_context=debugging

# Focus - Start AI-optimized session
POST /api/v1/focus/sessions/start
Body: {"task_context": "Complex debugging", "duration_minutes": 45}

# Energy - Track with AI predictions
POST /api/v1/energy/track
Body: {"query": "feeling tired after lunch"}

# Energy - Get AI optimization
GET /api/v1/energy/optimize
```

### Example: AI Focus Duration

```bash
curl -X GET "http://localhost:8001/api/v1/focus/recommend-duration?task_context=complex%20debugging" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "recommended_duration": 45,
  "confidence": 0.82,
  "reasoning": "Complex debugging requires sustained concentration. Based on cognitive load analysis, 45 minutes is optimal before a break.",
  "alternative_durations": [30, 60]
}
```

### Example: AI Energy Tracking

```bash
curl -X POST http://localhost:8001/api/v1/energy/track \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "feeling tired after lunch"}'
```

**Response:**
```json
{
  "energy_level": 5.2,
  "trend": "declining",
  "predicted_next_hour": 4.8,
  "confidence": 0.75,
  "immediate_recommendations": [
    "Take a 5-minute walk outside",
    "Drink 16oz of water",
    "Avoid heavy carbohydrates for next meal"
  ]
}
```

### TypeScript Client

```typescript
import { getAIDurationRecommendation, trackEnergy } from '@/lib/ai-api';

// Get AI focus duration
const duration = await getAIDurationRecommendation('complex debugging session');
console.log(`AI recommends: ${duration.data.recommended_duration} min`);
console.log(`Reasoning: ${duration.data.reasoning}`);

// Track energy with AI
const energy = await trackEnergy('feeling tired');
console.log(`Energy: ${energy.data.energy_level}/10 (${energy.data.trend})`);
console.log('AI tips:', energy.data.immediate_recommendations);
```

---

## Epic 2.3: Progress & Gamification

### AI Features

1. **Motivation Strategy Generation** - AI creates personalized re-engagement plans
2. **Celebration Messaging** - AI generates enthusiastic achievement messages

### API Endpoints

```bash
# Get AI motivation strategy
POST /api/v1/gamification/motivation
Body: {
  "user_context": {
    "engagement_level": "moderate",
    "completion_rate_last_week": 0.65,
    "recent_activity_drop": true
  }
}

# Check achievements (includes AI celebration messages)
POST /api/v1/gamification/achievements
Body: {
  "tasks_completed_today": 10,
  "total_xp": 5000
}
```

### Example: AI Motivation Strategy

```bash
curl -X POST http://localhost:8001/api/v1/gamification/motivation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_context": {
      "engagement_level": "moderate",
      "completion_rate_last_week": 0.65,
      "recent_activity_drop": true,
      "preferred_motivators": ["progress_tracking", "social_comparison"]
    }
  }'
```

**Response:**
```json
{
  "motivation_type": "re_engagement",
  "primary_strategy": "achievable_goals",
  "recommendations": [
    "Set smaller, more achievable daily goals (3-5 tasks)",
    "Join a productivity challenge with peers",
    "Enable milestone celebration notifications",
    "Track progress visually with charts"
  ],
  "gamification_adjustments": {
    "reduce_daily_target": true,
    "increase_achievement_frequency": true,
    "enable_social_encouragement": true
  },
  "expected_improvement": 0.25,
  "timeline": "1-2 weeks"
}
```

### Example: AI Achievement Celebrations

When achievements are unlocked, AI generates personalized celebration messages:

```json
{
  "triggered_achievements": [
    {
      "achievement_id": "productivity_master",
      "name": "Productivity Master",
      "xp_reward": 100,
      "badge_tier": "gold",
      "celebration_message": "🎉 Incredible! You've crushed 10 tasks in a single day like an absolute champion! Your productivity is off the charts! +100 XP 💪✨"
    }
  ]
}
```

### TypeScript Client

```typescript
import { getMotivationStrategy, checkAchievements } from '@/lib/ai-api';

// Get AI motivation strategy
const strategy = await getMotivationStrategy({
  engagement_level: 'moderate',
  completion_rate_last_week: 0.65,
  recent_activity_drop: true
});

console.log('Strategy:', strategy.data.primary_strategy);
console.log('Tips:', strategy.data.recommendations);

// Check for achievements with AI celebrations
const achievements = await checkAchievements({
  tasks_completed_today: 10,
  total_xp: 5000
});

achievements.data.triggered_achievements.forEach(achievement => {
  console.log(achievement.celebration_message); // AI-generated!
});
```

---

## Mobile Integration

### Quick Start

1. **Import the API client:**

```typescript
import aiApi from '@/lib/ai-api';
```

2. **Use AI features:**

```typescript
// Complete AI-powered workflow
const session = await aiApi.startAIPoweredWorkSession('Debug authentication bug');

console.log('AI Duration:', session.durationRecommendation);
console.log('Energy Level:', session.energy);
console.log('Session:', session.session);
```

### Example Component

See: `frontend/src/components/mobile/AIFocusButton.tsx`

```typescript
import AIFocusButton from '@/components/mobile/AIFocusButton';

export default function MobilePage() {
  return (
    <div>
      <AIFocusButton />
    </div>
  );
}
```

### Environment Configuration

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## Testing

### 1. Test with Shell Script

```bash
./test_ai_endpoints.sh
```

### 2. Test with curl

```bash
# Get auth token first
TOKEN=$(curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Test AI endpoints
curl -X GET "http://localhost:8001/api/v1/focus/recommend-duration?task_context=debugging" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test with Python

```python
from src.agents.task_proxy_intelligent import AdvancedTaskAgent
from src.core.task_models import Task
import asyncio

async def test():
    agent = AdvancedTaskAgent(db=None)
    task = Task(title="Refactor auth", description="Add 2FA")

    # Test AI features
    urgency = await agent._analyze_task_urgency(task)
    breakdown = await agent._ai_break_down_task(task)
    duration = await agent._ai_estimate_duration(task)

    print(f"Urgency: {urgency}")
    print(f"Subtasks: {breakdown}")
    print(f"Duration: {duration}")

asyncio.run(test())
```

### 4. Run Unit Tests

```bash
source .venv/bin/activate
pytest src/agents/tests/ -v
```

**Expected:** 89/89 tests passing ✅

---

## API Rate Limits & Costs

### OpenAI Usage

- **Focus Duration:** ~150 tokens/request (~$0.002/request)
- **Energy Prediction:** ~150 tokens/request (~$0.002/request)
- **Motivation Strategy:** ~400 tokens/request (~$0.006/request)
- **Celebration Message:** ~100 tokens/request (~$0.001/request)

**Total cost estimate:** ~$0.01 per complete AI-powered work session

### Fallback Behavior

Without OpenAI API key:
- All endpoints still work
- Uses heuristic algorithms instead
- Zero cost, slightly less personalized

---

## Troubleshooting

### Issue: "API key not configured"

**Solution:**
```bash
# Check .env file
grep LLM_API_KEY .env

# If empty or placeholder, add real key:
echo "LLM_API_KEY=sk-your-real-key" >> .env

# Restart server
uvicorn src.api.main:app --reload
```

### Issue: "Module not found: ai-api"

**Solution:**
```bash
# Ensure file exists
ls frontend/src/lib/ai-api.ts

# Update Next.js import alias in tsconfig.json
```

### Issue: "CORS error"

**Solution:**
Server already configured for CORS. If still having issues, check:
```python
# src/api/main.py - should have:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Next Steps

1. **Add your OpenAI API key** to `.env`
2. **Start the backend** with `uvicorn`
3. **Import AI client** in your mobile app
4. **Use AI features** via the TypeScript API

All AI features are production-ready and tested! 🎉

---

## Resources

- **Backend Tests:** `src/agents/tests/`
- **API Client:** `frontend/src/lib/ai-api.ts`
- **Example Component:** `frontend/src/components/mobile/AIFocusButton.tsx`
- **API Docs:** http://localhost:8001/docs
- **Test Script:** `./test_ai_endpoints.sh`

**Questions?** Check `AGENT_ENTRY_POINT.md` for full Epic 2 implementation details.
