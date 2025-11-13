# 🔌 Proxy Agent Platform API Documentation

Welcome to the comprehensive API documentation for the Proxy Agent Platform. This guide covers all available endpoints, authentication, request/response formats, and integration examples.

## 📚 Documentation Resources

### 🎯 Quick Links
- **[API Reference](./API_REFERENCE.md)** - Complete endpoint documentation (86 endpoints, all modules)
- **[OpenAPI JSON](./openapi.json)** - Machine-readable OpenAPI 3.1 specification
- **[OpenAPI YAML](./openapi.yaml)** - Human-readable OpenAPI specification
- **[TypeScript Types](../../frontend/src/types/api-schemas.ts)** - Auto-generated type definitions

### 🚀 Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs` (FastAPI auto-generated)
- **ReDoc**: `http://localhost:8000/redoc` (Alternative UI)
- **OpenAPI JSON**: `http://localhost:8000/openapi.json` (Live spec)

---

## 📊 API Statistics

- **Total Endpoints:** 86
- **Total Schemas:** 76
- **OpenAPI Version:** 3.1.0
- **API Version:** 0.1.0

### Endpoints by Module
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Simple Tasks | 20 | Simplified task operations |
| Secretary | 10 | Intelligent organization |
| Energy | 6 | Energy level tracking |
| Progress | 6 | XP and analytics |
| Gamification | 6 | Achievements and leaderboards |
| Focus | 5 | Focus sessions & Pomodoro |
| Tasks | 5 | Comprehensive task management |
| Auth | 5 | Authentication |
| Capture | 4 | Brain dump capture |
| Rewards | 4 | Dopamine reward system |
| Basic Tasks | 6 | Basic task operations |
| Health | 9 | System health & monitoring |

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Core Agents API](#core-agents-api)
- [Gamification API](#gamification-api)
- [Mobile Integration API](#mobile-integration-api)
- [Dashboard API](#dashboard-api)
- [Learning Engine API](#learning-engine-api)
- [WebSocket API](#websocket-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [SDK and Examples](#sdk-and-examples)

## 🔐 Authentication

The Proxy Agent Platform uses JWT-based authentication with refresh tokens for secure API access.

### Base URL
```
Production: https://api.proxyagent.dev/v1
Development: http://localhost:8000/v1
```

### Authentication Flow

#### 1. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 2. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Using Access Token
Include the access token in the Authorization header for all API requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Core Agents API

### Task Proxy Agent

#### Create Task (2-Second Capture)
```http
POST /agents/task/capture
Content-Type: application/json
Authorization: Bearer {token}

{
  "input": "Review quarterly reports and prepare summary",
  "input_type": "text",  // "text" | "voice" | "image"
  "context": {
    "location": "office",
    "energy_level": 7,
    "focus_mode": "deep_work"
  }
}
```

**Response:**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Review quarterly reports and prepare summary",
  "description": "Review Q4 financial reports and create executive summary",
  "priority": "high",
  "estimated_duration": "2h",
  "category": "work",
  "tags": ["quarterly", "reports", "analysis"],
  "due_date": "2024-12-31T17:00:00Z",
  "agent_suggestions": {
    "best_time": "09:00-11:00",
    "focus_type": "deep_work",
    "energy_required": 8
  },
  "capture_time_ms": 1250
}
```

#### Get Tasks
```http
GET /agents/task/tasks?status=pending&limit=20&offset=0
Authorization: Bearer {token}
```

#### Update Task
```http
PUT /agents/task/tasks/{task_id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "completed",
  "actual_duration": "1h 45m",
  "completion_notes": "Completed ahead of schedule"
}
```

### Focus Proxy Agent

#### Start Focus Session
```http
POST /agents/focus/sessions
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "pomodoro",  // "pomodoro" | "deep_work" | "flow_state"
  "duration_minutes": 25,
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "distraction_blocking": true,
  "ambient_sound": "forest"
}
```

**Response:**
```json
{
  "session_id": "987fcdeb-51a2-43d7-b456-426614174000",
  "status": "active",
  "start_time": "2024-10-07T10:00:00Z",
  "end_time": "2024-10-07T10:25:00Z",
  "type": "pomodoro",
  "focus_score": null,
  "interruptions": 0,
  "websocket_url": "wss://api.proxyagent.dev/ws/focus/987fcdeb-51a2-43d7-b456-426614174000"
}
```

#### Get Focus Analytics
```http
GET /agents/focus/analytics?period=week
Authorization: Bearer {token}
```

### Energy Proxy Agent

#### Log Energy Level
```http
POST /agents/energy/log
Content-Type: application/json
Authorization: Bearer {token}

{
  "level": 8,
  "context": {
    "time_of_day": "morning",
    "activity": "deep_work",
    "location": "home_office",
    "mood": "focused"
  },
  "factors": {
    "sleep_hours": 8,
    "caffeine": true,
    "exercise": false
  }
}
```

#### Get Energy Prediction
```http
GET /agents/energy/predict?hours_ahead=4
Authorization: Bearer {token}
```

**Response:**
```json
{
  "current_level": 8,
  "predictions": [
    {
      "time": "2024-10-07T11:00:00Z",
      "predicted_level": 7.5,
      "confidence": 0.85
    },
    {
      "time": "2024-10-07T12:00:00Z",
      "predicted_level": 6.8,
      "confidence": 0.78
    }
  ],
  "recommendations": [
    {
      "time": "2024-10-07T11:30:00Z",
      "action": "take_break",
      "reason": "Predicted energy dip"
    }
  ]
}
```

### Progress Proxy Agent

#### Get Progress Summary
```http
GET /agents/progress/summary?period=week
Authorization: Bearer {token}
```

**Response:**
```json
{
  "period": "week",
  "tasks_completed": 24,
  "focus_hours": 18.5,
  "energy_average": 7.2,
  "streak_days": 5,
  "achievements_unlocked": 3,
  "xp_gained": 850,
  "productivity_score": 8.4,
  "trends": {
    "task_completion": "+12%",
    "focus_quality": "+8%",
    "energy_consistency": "+15%"
  }
}
```

## 🎮 Gamification API

### XP System

#### Get XP Status
```http
GET /gamification/xp/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_xp": 2450,
  "level": 12,
  "xp_to_next_level": 150,
  "daily_xp": 85,
  "weekly_xp": 340,
  "xp_multiplier": 1.2,
  "recent_gains": [
    {
      "amount": 25,
      "source": "task_completion",
      "timestamp": "2024-10-07T10:30:00Z",
      "description": "Completed quarterly report review"
    }
  ]
}
```

### Achievements

#### Get Achievements
```http
GET /gamification/achievements?status=unlocked
Authorization: Bearer {token}
```

#### Get Available Achievements
```http
GET /gamification/achievements/available
Authorization: Bearer {token}
```

### Streaks

#### Get Current Streaks
```http
GET /gamification/streaks
Authorization: Bearer {token}
```

**Response:**
```json
{
  "streaks": [
    {
      "type": "daily_tasks",
      "current_count": 5,
      "best_count": 12,
      "status": "active",
      "last_activity": "2024-10-07T09:00:00Z"
    },
    {
      "type": "focus_sessions",
      "current_count": 3,
      "best_count": 8,
      "status": "active",
      "last_activity": "2024-10-07T10:25:00Z"
    }
  ]
}
```

## 📱 Mobile Integration API

### Voice Processing

#### Process Voice Input
```http
POST /mobile/voice/process
Content-Type: multipart/form-data
Authorization: Bearer {token}

audio_file: [audio file]
format: "wav"
language: "en-US"
```

### Shortcuts Integration

#### iOS Shortcuts
```http
GET /mobile/shortcuts/ios
Authorization: Bearer {token}
```

#### Android Tasker
```http
GET /mobile/shortcuts/android
Authorization: Bearer {token}
```

### Offline Sync

#### Upload Offline Data
```http
POST /mobile/sync/upload
Content-Type: application/json
Authorization: Bearer {token}

{
  "device_id": "device-123",
  "sync_token": "last-sync-token",
  "data": [
    {
      "type": "task",
      "action": "create",
      "timestamp": "2024-10-07T08:30:00Z",
      "data": {
        "title": "Call client about project"
      }
    }
  ]
}
```

## 📊 Dashboard API

### Real-time Metrics

#### Get Dashboard Data
```http
GET /dashboard/metrics?period=today
Authorization: Bearer {token}
```

**Response:**
```json
{
  "overview": {
    "tasks_completed": 8,
    "focus_hours": 4.5,
    "energy_average": 7.2,
    "productivity_score": 8.1
  },
  "charts": {
    "energy_levels": [
      {"time": "09:00", "level": 8},
      {"time": "10:00", "level": 7.5},
      {"time": "11:00", "level": 7}
    ],
    "focus_sessions": [
      {"session": "Morning Deep Work", "duration": 120, "score": 9},
      {"session": "Afternoon Review", "duration": 45, "score": 7}
    ]
  },
  "recommendations": [
    {
      "type": "energy_optimization",
      "message": "Consider taking a break around 2 PM",
      "priority": "medium"
    }
  ]
}
```

### WebSocket Connections

#### Connect to Real-time Updates
```javascript
const ws = new WebSocket('wss://api.proxyagent.dev/ws/dashboard?token=your_jwt_token');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## 🧠 Learning Engine API

### Pattern Analysis

#### Get User Patterns
```http
GET /learning/patterns?type=productivity&period=month
Authorization: Bearer {token}
```

### Recommendations

#### Get Personalized Recommendations
```http
GET /learning/recommendations
Authorization: Bearer {token}
```

**Response:**
```json
{
  "recommendations": [
    {
      "type": "scheduling",
      "title": "Optimize morning routine",
      "description": "Your energy peaks at 9 AM. Schedule important tasks then.",
      "confidence": 0.89,
      "potential_impact": "high",
      "actions": [
        "Move daily planning to 8:30 AM",
        "Schedule deep work from 9-11 AM"
      ]
    }
  ]
}
```

### Habit Tracking

#### Log Habit
```http
POST /learning/habits/log
Content-Type: application/json
Authorization: Bearer {token}

{
  "habit_id": "morning_meditation",
  "completed": true,
  "quality_score": 8,
  "notes": "Felt very focused after 20-minute session"
}
```

## 🔌 WebSocket API

### Connection Management

#### Establish Connection
```javascript
const token = 'your_jwt_token';
const ws = new WebSocket(`wss://api.proxyagent.dev/ws?token=${token}`);
```

#### Subscribe to Events
```javascript
ws.send(JSON.stringify({
  action: 'subscribe',
  channels: ['tasks', 'focus', 'energy', 'achievements']
}));
```

### Real-time Events

#### Task Updates
```json
{
  "channel": "tasks",
  "event": "task_completed",
  "data": {
    "task_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Review quarterly reports",
    "xp_gained": 25
  }
}
```

#### Focus Session Updates
```json
{
  "channel": "focus",
  "event": "session_started",
  "data": {
    "session_id": "987fcdeb-51a2-43d7-b456-426614174000",
    "type": "pomodoro",
    "duration": 25
  }
}
```

#### Achievement Unlocked
```json
{
  "channel": "achievements",
  "event": "achievement_unlocked",
  "data": {
    "achievement_id": "focus_master",
    "title": "Focus Master",
    "description": "Complete 10 focus sessions in a week",
    "xp_reward": 100
  }
}
```

## ❌ Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_123456789"
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## 🚦 Rate Limiting

### Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| Task Operations | 100 requests | 1 minute |
| Focus Sessions | 50 requests | 1 minute |
| Dashboard | 200 requests | 1 minute |
| WebSocket | 5 connections | per user |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1633024800
```

## 📦 SDK and Examples

### JavaScript/TypeScript SDK

#### Installation
```bash
npm install @proxy-agent/sdk
```

#### Usage
```typescript
import { ProxyAgentClient } from '@proxy-agent/sdk';

const client = new ProxyAgentClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.proxyagent.dev/v1'
});

// Capture a task
const task = await client.tasks.capture({
  input: "Review quarterly reports",
  inputType: "text"
});

// Start focus session
const session = await client.focus.startSession({
  type: "pomodoro",
  duration: 25
});
```

### Python SDK

#### Installation
```bash
pip install proxy-agent-sdk
```

#### Usage
```python
from proxy_agent_sdk import ProxyAgentClient

client = ProxyAgentClient(
    api_key="your_api_key",
    base_url="https://api.proxyagent.dev/v1"
)

# Capture a task
task = client.tasks.capture(
    input="Review quarterly reports",
    input_type="text"
)

# Get energy prediction
prediction = client.energy.predict(hours_ahead=4)
```

### cURL Examples

#### Capture Task
```bash
curl -X POST "https://api.proxyagent.dev/v1/agents/task/capture" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Review quarterly reports",
    "input_type": "text"
  }'
```

#### Start Focus Session
```bash
curl -X POST "https://api.proxyagent.dev/v1/agents/focus/sessions" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pomodoro",
    "duration_minutes": 25
  }'
```

## 🔗 Additional Resources

### Documentation Files
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API reference with examples
- **[openapi.json](./openapi.json)** - OpenAPI 3.1 specification (JSON)
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.1 specification (YAML)

### TypeScript Integration
- **[api-schemas.ts](../../frontend/src/types/api-schemas.ts)** - Auto-generated TypeScript types
- Import into your frontend: `import type { paths, components } from '@/types/api-schemas'`

### Tools & Testing
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Postman**: Import `http://localhost:8000/openapi.json`
- **Insomnia**: Import `http://localhost:8000/openapi.json`

### Frontend Integration Guide
See **[API_PATTERNS.md](../../frontend/API_PATTERNS.md)** for frontend integration patterns and best practices.

---

**Last Updated:** October 24, 2025

**Need help?** Open an issue on [GitHub](https://github.com/your-repo/issues) or check the [API Reference](./API_REFERENCE.md) for detailed examples.
