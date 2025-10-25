# Architecture Deep Dive
## Proxy Agent Platform Technical Architecture

**Document Version**: 1.0
**Last Updated**: October 23, 2025
**Audience**: Senior Engineers, Architects, Technical Leadership

---

## Executive Summary

This document provides a comprehensive deep dive into the Proxy Agent Platform's architecture, covering system design, data flow, component interactions, scalability patterns, and technical decisions.

**Architecture Philosophy**: ADHD-Optimized, Event-Driven, Microservices-Ready

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Data Architecture](#3-data-architecture)
4. [API Architecture](#4-api-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Temporal Knowledge Graph](#6-temporal-knowledge-graph)
7. [Agent System](#7-agent-system)
8. [Real-time Communication](#8-real-time-communication)
9. [Security Architecture](#9-security-architecture)
10. [Scalability & Performance](#10-scalability--performance)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Future Architecture Evolution](#12-future-architecture-evolution)

---

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│   │   Mobile     │    │   Desktop    │    │  API Clients │       │
│   │   Next.js    │    │   Next.js    │    │  (3rd party) │       │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│          │                     │                    │                │
│          └─────────────────────┴────────────────────┘                │
│                                 │                                     │
│                          HTTP/WebSocket                              │
│                                 │                                     │
└─────────────────────────────────┼─────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────────┐
│                         API GATEWAY LAYER                            │
├─────────────────────────────────┼─────────────────────────────────────┤
│                                 ↓                                     │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │            FastAPI Application (main.py)                  │     │
│   │  - CORS Middleware                                        │     │
│   │  - Authentication Middleware                              │     │
│   │  - Rate Limiting Middleware (future)                      │     │
│   │  - Logging & Tracing Middleware (future)                  │     │
│   └──────────────────────────┬───────────────────────────────┘     │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
┌───────────────────┼───────────────────────┼─────────────────────────┐
│                   ↓                       ↓       SERVICE LAYER     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │   Task      │  │   Energy    │  │ Gamification│  │  Focus   │ │
│  │  Service    │  │  Service    │  │   Service   │  │ Service  │ │
│  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘  └────┬─────┘ │
│        │                │                  │                │        │
│  ┌─────┴────────────────┴──────────────────┴────────────────┴─────┐ │
│  │             Shopping List Service (Temporal KG)               │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
┌───────────────────┼───────────────────────┼─────────────────────────┐
│                   ↓                       ↓       DATA LAYER        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 SQLite Database (WAL mode)                    │  │
│  │  - Users                - Energy Snapshots                    │  │
│  │  - Tasks                - Energy Profiles                     │  │
│  │  - Focus Sessions       - Shopping Items                      │  │
│  │  - Achievements         - Temporal Entities                   │  │
│  │  - Progress Stats       - Event Logs                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Architecture Patterns

| Pattern | Usage | Benefits |
|---------|-------|----------|
| **Layered Architecture** | Client → API → Service → Data | Clear separation of concerns |
| **Repository Pattern** | Data access abstraction | Testability, maintainability |
| **Service Layer** | Business logic encapsulation | Reusability, single responsibility |
| **Dependency Injection** | FastAPI dependencies | Loose coupling, testability |
| **Event-Driven** | Event log for analytics | Decoupling, auditability |
| **Bi-Temporal** | Valid time + transaction time | Historical queries, corrections |

---

## 2. Technology Stack

### Backend Stack

```python
# Core Framework
FastAPI==0.104+          # Modern async web framework
Uvicorn==0.24+           # ASGI server
Pydantic==2.5+           # Data validation
PydanticAI==latest       # AI agent framework

# Database
SQLite3==3.43+           # Embedded database (development)
# Future: PostgreSQL 13+ with TimescaleDB extension

# AI/ML
openai==1.3+             # GPT models
anthropic==0.7+          # Claude models
google-generativeai      # Gemini models

# Utilities
python-jose              # JWT tokens
passlib                  # Password hashing
python-multipart         # File uploads
python-dotenv            # Environment variables

# Development
pytest==7.4+             # Testing framework
pytest-asyncio           # Async test support
pytest-cov               # Coverage reporting
ruff==0.1+               # Fast linter/formatter
mypy==1.7+               # Static type checking
```

### Frontend Stack

```json
{
  "core": {
    "next": "14.0+",
    "react": "18.2+",
    "typescript": "5.2+"
  },
  "styling": {
    "tailwindcss": "3.3+",
    "@tailwindcss/typography": "latest",
    "framer-motion": "10+"
  },
  "utilities": {
    "date-fns": "2.30+",
    "zod": "3.22+"
  },
  "development": {
    "eslint": "8.54+",
    "prettier": "3.1+",
    "@types/react": "18.2+",
    "@types/node": "20+"
  }
}
```

### Infrastructure

```yaml
Development:
  - SQLite (file-based)
  - Node.js 18+
  - Python 3.11+
  - UV package manager

Production (Future):
  - PostgreSQL 13+ with TimescaleDB
  - Redis 6+ (caching, sessions)
  - Nginx (reverse proxy)
  - Docker + Docker Compose
  - AWS/GCP/Azure (cloud hosting)
```

---

## 3. Data Architecture

### Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CORE ENTITIES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   users                        tasks                            │
│   ├─ user_id (PK)             ├─ task_id (PK)                  │
│   ├─ username                 ├─ user_id (FK)                   │
│   ├─ email                    ├─ title                          │
│   ├─ password_hash            ├─ description                    │
│   ├─ created_at               ├─ status                         │
│   └─ last_login               ├─ priority                       │
│                                ├─ estimated_hours               │
│                                ├─ actual_hours                  │
│                                ├─ created_at                    │
│                                └─ completed_at                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   TEMPORAL KNOWLEDGE GRAPH                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   kg_temporal_entities         kg_shopping_items                │
│   ├─ entity_id (PK)           ├─ item_id (PK)                  │
│   ├─ user_id (FK)             ├─ user_id (FK)                   │
│   ├─ entity_type              ├─ item_name                      │
│   ├─ version_id               ├─ category                       │
│   ├─ valid_from               ├─ urgency                        │
│   ├─ valid_to                 ├─ status                         │
│   ├─ stored_from              ├─ added_at                       │
│   ├─ stored_to                ├─ completed_at                   │
│   ├─ is_current               ├─ expired_at                     │
│   └─ properties (JSON)        ├─ is_recurring                   │
│                                ├─ purchase_count                │
│   kg_event_log                 └─ metadata (JSON)               │
│   ├─ event_id (PK)                                              │
│   ├─ user_id (FK)            kg_recurring_patterns              │
│   ├─ event_type              ├─ pattern_id (PK)                 │
│   ├─ entity_id               ├─ user_id (FK)                    │
│   ├─ timestamp                ├─ pattern_type                   │
│   ├─ energy_level            ├─ entity_type                     │
│   ├─ day_of_week             ├─ frequency                       │
│   └─ metadata (JSON)          ├─ confidence                     │
│                                └─ next_predicted                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ENGAGEMENT & GAMIFICATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   progress_stats               achievements                      │
│   ├─ user_id (PK, FK)         ├─ achievement_id (PK)           │
│   ├─ total_xp                 ├─ user_id (FK)                   │
│   ├─ current_level            ├─ name                           │
│   ├─ current_streak           ├─ description                    │
│   ├─ tasks_completed          ├─ badge_icon                     │
│   ├─ engagement_score         ├─ unlocked_at                    │
│   └─ updated_at               └─ points                         │
│                                                                  │
│   focus_sessions              energy_snapshots                  │
│   ├─ session_id (PK)          ├─ snapshot_id (PK)              │
│   ├─ user_id (FK)             ├─ user_id (FK)                   │
│   ├─ task_id (FK)             ├─ timestamp                      │
│   ├─ started_at               ├─ energy_level                   │
│   ├─ ended_at                 ├─ energy_score                   │
│   ├─ duration_minutes         ├─ source                         │
│   ├─ interruptions            ├─ confidence                     │
│   └─ completed                └─ factors (JSON)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX idx_shopping_user_status ON kg_shopping_items(user_id, status);
CREATE INDEX idx_energy_user_time ON kg_energy_snapshots(user_id, timestamp DESC);
CREATE INDEX idx_event_user_type_time ON kg_event_log(user_id, event_type, timestamp DESC);

-- Temporal query indexes
CREATE INDEX idx_temporal_current ON kg_temporal_entities(user_id, entity_type, is_current);
CREATE INDEX idx_temporal_validity ON kg_temporal_entities(user_id, valid_from, valid_to);

-- Full-text search (future)
-- CREATE VIRTUAL TABLE tasks_fts USING fts5(title, description, content=tasks);
```

### Data Flow Patterns

#### 1. Task Creation Flow

```
User Input → Quick Capture API
    ↓
Natural Language Processing
    ↓
Task Decomposition (AI)
    ↓
Task Entity Creation
    ↓
Event Log Entry
    ↓
Response to User
```

#### 2. Shopping List Flow

```
User Input ("buy milk, eggs, bread")
    ↓
Parse Natural Language
    ↓
Extract Items → ["milk", "eggs", "bread"]
    ↓
For each item:
    ├─ Check Duplicates (24h window)
    ├─ Auto-Categorize
    ├─ Create ShoppingItem entity
    └─ Log ADD_ITEM event
    ↓
Return Items List
```

#### 3. Energy Tracking Flow

```
User Check-in (explicit)
    ↓
Store Energy Snapshot
    ↓
Update Energy Profile (averages)
    ↓
Detect Patterns (recurring crashes)
    ↓
Update Predictions
```

---

## 4. API Architecture

### REST API Design

**Base URL**: `http://localhost:8000/api/v1`

**Versioning Strategy**: URL path versioning (`/v1/`, `/v2/`)

### Endpoint Organization

```
/api/v1/
├─ /auth/              # Authentication endpoints
│  ├─ POST /login
│  ├─ POST /register
│  ├─ POST /refresh
│  └─ POST /logout
│
├─ /tasks/             # Task management
│  ├─ GET    /tasks
│  ├─ POST   /tasks
│  ├─ GET    /tasks/{task_id}
│  ├─ PUT    /tasks/{task_id}
│  ├─ DELETE /tasks/{task_id}
│  └─ PATCH  /tasks/{task_id}/complete
│
├─ /mobile/            # Mobile-optimized endpoints
│  ├─ POST /quick-capture
│  └─ GET  /stats
│
├─ /energy/            # Energy tracking
│  ├─ GET  /current-level
│  ├─ POST /log
│  ├─ GET  /patterns
│  └─ GET  /forecast
│
├─ /gamification/      # Engagement & rewards
│  ├─ GET /user-stats
│  ├─ GET /achievements
│  ├─ GET /leaderboard
│  └─ POST /claim-reward
│
├─ /focus/             # Focus sessions
│  ├─ POST /sessions/start
│  ├─ POST /sessions/{session_id}/end
│  └─ GET  /sessions/history
│
└─ /ws/                # WebSocket connections
   └─ GET /{client_id}
```

### Request/Response Patterns

#### Standard Success Response

```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "timestamp": "2025-10-23T10:30:00Z"
}
```

#### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid task status",
    "details": {
      "field": "status",
      "allowed_values": ["active", "completed", "archived"]
    }
  },
  "timestamp": "2025-10-23T10:30:00Z"
}
```

### Authentication Flow

```
1. User Login
   POST /api/v1/auth/login
   {
     "username": "user@example.com",
     "password": "secure_password"
   }

   Response:
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "token_type": "bearer",
     "expires_in": 3600
   }

2. Authenticated Request
   GET /api/v1/tasks
   Headers:
     Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

   Response:
   {
     "tasks": [...],
     "total": 42
   }

3. Token Refresh (future)
   POST /api/v1/auth/refresh
   {
     "refresh_token": "..."
   }
```

### Rate Limiting (Future)

```python
# Rate limit configuration
RATE_LIMITS = {
    "default": "1000/hour",      # General endpoints
    "mobile": "unlimited",        # Mobile endpoints (for now)
    "auth": "10/minute",         # Login attempts
    "ai": "100/hour"             # AI-powered endpoints
}

# Header example
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1635789600
```

---

## 5. Frontend Architecture

### Next.js 14 Architecture

```
frontend/
├─ src/
│  ├─ app/                      # App Router (Next.js 14)
│  │  ├─ layout.tsx             # Root layout
│  │  ├─ page.tsx               # Desktop home
│  │  ├─ mobile/
│  │  │  └─ page.tsx            # Mobile optimized
│  │  └─ api/                   # API routes (future)
│  │
│  ├─ components/
│  │  ├─ mobile/                # Mobile-specific components
│  │  │  ├─ BiologicalTabs.tsx
│  │  │  ├─ EnergyGauge.tsx
│  │  │  ├─ SwipeableTaskCard.tsx
│  │  │  └─ ...
│  │  ├─ shared/                # Shared components
│  │  │  ├─ AsyncJobTimeline.tsx
│  │  │  ├─ ProgressBar.tsx
│  │  │  └─ ...
│  │  └─ ui/                    # UI primitives
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     └─ ...
│  │
│  ├─ hooks/                    # Custom React hooks
│  │  ├─ useCaptureFlow.ts
│  │  ├─ useVoiceInput.ts
│  │  └─ useWebSocket.ts
│  │
│  ├─ lib/                      # Utilities & API clients
│  │  ├─ api.ts                 # Main API client
│  │  ├─ ai-api.ts              # AI API client
│  │  └─ utils.ts
│  │
│  ├─ types/                    # TypeScript types
│  │  ├─ capture.ts
│  │  ├─ task.ts
│  │  └─ ...
│  │
│  └─ styles/
│     └─ globals.css
│
├─ public/                      # Static assets
└─ tailwind.config.js           # Design system
```

### State Management Strategy

**Current**: Local state with React hooks (useState, useEffect)
**Future**: Consider Zustand or React Context for global state

```typescript
// Example: useCaptureFlow hook encapsulates state
export function useCaptureFlow() {
  const [stage, setStage] = useState<CaptureStage>('idle')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CaptureResult | null>(null)

  const capture = async (text: string) => {
    setStage('processing')
    setIsProcessing(true)

    try {
      const response = await apiClient.quickCapture({ text, ... })
      setResult(response)
      setStage('success')
    } catch (error) {
      setStage('error')
    } finally {
      setIsProcessing(false)
    }
  }

  return { stage, isProcessing, result, capture }
}
```

### Design System

**File**: `frontend/tailwind.config.js`

```typescript
// Design tokens
const spacing = {
  '0': '0',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '6': '24px',
  '8': '32px',
  '12': '48px',
  '16': '64px'
}

const colors = {
  // Semantic colors
  primary: '#3b82f6',      // Blue
  secondary: '#8b5cf6',    // Purple
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  error: '#ef4444',        // Red

  // Energy levels
  energyHigh: '#10b981',
  energyMedium: '#f59e0b',
  energyLow: '#ef4444',

  // Backgrounds
  bgPrimary: '#ffffff',
  bgSecondary: '#f9fafb',
  bgTertiary: '#f3f4f6'
}

const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px'
}
```

---

## 6. Temporal Knowledge Graph

### Why Temporal?

ADHD users need systems that:
- **Forgive forgotten items** (auto-expire after 30 days)
- **Learn recurring patterns** (buy milk every Monday)
- **Adapt to changes** (preferences evolve)
- **Provide historical context** (what was I working on last month?)

### Bi-Temporal Model

```sql
-- Example: Shopping item with bi-temporal tracking
CREATE TABLE kg_shopping_items (
    item_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,

    -- Validity time: when fact is TRUE in reality
    added_at TIMESTAMP NOT NULL,      -- Item was added
    completed_at TIMESTAMP,            -- Item was purchased
    expired_at TIMESTAMP,              -- Item expired (forgotten)

    -- Transaction time: when we KNEW about it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Recurrence tracking
    is_recurring BOOLEAN DEFAULT FALSE,
    purchase_count INTEGER DEFAULT 0,
    last_purchased TIMESTAMP,

    -- Status
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'expired'))
);
```

### Temporal Queries

```python
# Query 1: Get current active shopping list
def get_active_shopping_list(user_id: str) -> List[ShoppingItem]:
    """Get items that are currently valid"""
    return db.query("""
        SELECT * FROM kg_shopping_items
        WHERE user_id = ?
          AND status = 'active'
          AND added_at <= CURRENT_TIMESTAMP
          AND (expired_at IS NULL OR expired_at > CURRENT_TIMESTAMP)
        ORDER BY urgency DESC, added_at ASC
    """, user_id)

# Query 2: Time-travel - what was on the list last week?
def get_shopping_list_at_time(user_id: str, timestamp: datetime) -> List[ShoppingItem]:
    """Reconstruct shopping list as it was at a specific time"""
    return db.query("""
        SELECT * FROM kg_shopping_items
        WHERE user_id = ?
          AND added_at <= ?
          AND (completed_at IS NULL OR completed_at > ?)
          AND (expired_at IS NULL OR expired_at > ?)
    """, user_id, timestamp, timestamp, timestamp)

# Query 3: Detect recurring patterns
def detect_recurring_items(user_id: str) -> List[RecurringPattern]:
    """Find items purchased regularly"""
    return db.query("""
        SELECT
            item_name,
            COUNT(*) as purchase_count,
            AVG(JULIANDAY(completed_at) - JULIANDAY(LAG(completed_at) OVER (ORDER BY completed_at))) as avg_days_between
        FROM kg_shopping_items
        WHERE user_id = ?
          AND status = 'completed'
          AND purchase_count >= 3
        GROUP BY item_name
        HAVING avg_days_between IS NOT NULL
          AND avg_days_between < 30
    """, user_id)
```

### Event Sourcing

```python
# Every action is logged in kg_event_log
class EventType(str, Enum):
    ITEM_ADDED = "item_added"
    ITEM_COMPLETED = "item_completed"
    ITEM_EXPIRED = "item_expired"
    PATTERN_DETECTED = "pattern_detected"
    ENERGY_LOGGED = "energy_logged"

def log_event(
    user_id: str,
    event_type: EventType,
    entity_id: str,
    metadata: dict
):
    """Log all significant events for analytics and ML"""
    db.execute("""
        INSERT INTO kg_event_log (
            event_id, user_id, event_type, entity_id,
            timestamp, day_of_week, hour_of_day, metadata
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
    """,
    str(uuid4()), user_id, event_type.value, entity_id,
    datetime.now().weekday(), datetime.now().hour, json.dumps(metadata))
```

---

## 7. Agent System

### PydanticAI Framework

```python
from pydantic_ai import Agent

# Task decomposition agent
task_agent = Agent(
    'openai:gpt-4',
    system_prompt="""You are a task decomposition expert.
    Break complex tasks into actionable micro-steps."""
)

# Usage
async def decompose_task(task_description: str) -> List[MicroStep]:
    result = await task_agent.run(
        user_prompt=f"Break this task into steps: {task_description}"
    )
    return parse_micro_steps(result.data)
```

### Agent Types

| Agent | Purpose | Model | Status |
|-------|---------|-------|--------|
| **Decomposer** | Break tasks into micro-steps | GPT-4 | ✅ Active |
| **Classifier** | Categorize tasks | GPT-3.5 | ⚠️ Partial |
| **Energy Estimator** | Predict energy levels | Custom ML | 🔄 Planned |
| **Pattern Detector** | Find recurring patterns | Rule-based | 🔄 Planned |
| **Scheduler** | Optimize task timing | Heuristic | 🔄 Planned |

---

## 8. Real-time Communication

### WebSocket Architecture

```python
# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # Broadcast to all clients
            await broadcast_message({
                "type": message["type"],
                "data": message["data"],
                "timestamp": datetime.now().isoformat()
            })
    except WebSocketDisconnect:
        del active_connections[client_id]
```

### Message Types

```typescript
// Frontend WebSocket message types
type WSMessage =
  | { type: 'task_created', data: Task }
  | { type: 'task_updated', data: Task }
  | { type: 'task_completed', data: { task_id: string } }
  | { type: 'energy_updated', data: { level: number } }
  | { type: 'achievement_unlocked', data: Achievement }
```

---

## 9. Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: CORS (Cross-Origin Resource Sharing)             │
│  ├─ Allow only trusted origins                             │
│  ├─ Credentials support enabled                            │
│  └─ Preflight caching configured                           │
│                                                              │
│  Layer 2: Rate Limiting (future)                           │
│  ├─ Per-user limits                                        │
│  ├─ Per-IP limits                                          │
│  └─ DDoS protection                                        │
│                                                              │
│  Layer 3: Authentication                                   │
│  ├─ JWT Bearer tokens                                      │
│  ├─ Token expiration (1 hour)                             │
│  └─ Refresh tokens (future)                               │
│                                                              │
│  Layer 4: Authorization                                    │
│  ├─ User owns resource check                              │
│  ├─ Admin role enforcement                                │
│  └─ RBAC (future)                                         │
│                                                              │
│  Layer 5: Input Validation                                │
│  ├─ Pydantic v2 schema validation                         │
│  ├─ Type safety                                           │
│  └─ SQL injection prevention                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Scalability & Performance

### Current Capacity

| Metric | Current | Target (Year 1) | Target (Year 3) |
|--------|---------|-----------------|-----------------|
| **Users** | 1-10 | 10,000 | 100,000 |
| **Requests/sec** | <10 | 100 | 1,000 |
| **Database Size** | 2.3 MB | 5 GB | 50 GB |
| **Response Time** | <200ms | <300ms | <500ms |

### Scalability Roadmap

**Phase 1: Vertical Scaling** (0-10K users)
- Upgrade server CPU/RAM
- Optimize queries
- Add Redis caching

**Phase 2: Database Migration** (10K-100K users)
- Migrate to PostgreSQL
- Add TimescaleDB for time-series
- Implement connection pooling
- Add read replicas

**Phase 3: Horizontal Scaling** (100K+ users)
- Load balancer (Nginx)
- Multiple API servers
- Database sharding by user_id
- CDN for static assets
- Message queue (RabbitMQ/Kafka)

---

## 11. Deployment Architecture

### Development

```
Developer Machine
├─ Backend: uvicorn --reload
├─ Frontend: next dev
├─ Database: SQLite (file)
└─ No auth required
```

### Production (Future)

```
┌───────────────────────────────────────────────────────┐
│                   CLOUD PROVIDER                       │
│              (AWS/GCP/Azure/Vercel)                   │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │           Load Balancer (Nginx)               │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                      │
│     ┌───────────┴───────────┐                        │
│     │                       │                        │
│  ┌──┴────┐             ┌───┴────┐                   │
│  │ API 1 │             │ API 2  │   (Auto-scaling)  │
│  └───┬───┘             └───┬────┘                   │
│      │                     │                         │
│      └──────────┬──────────┘                        │
│                 │                                     │
│     ┌───────────┴──────────┐                        │
│     │                       │                        │
│  ┌──┴────────┐      ┌──────┴──────┐               │
│  │PostgreSQL │      │    Redis     │               │
│  │(Primary)  │      │   (Cache)    │               │
│  └───────────┘      └──────────────┘               │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │    Monitoring & Logging                      │   │
│  │  - Prometheus + Grafana                      │   │
│  │  - Sentry (errors)                           │   │
│  │  - CloudWatch/Stackdriver                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 12. Future Architecture Evolution

### Phase 2: Input Classification (Nov 2025)

```
User Input → Input Classifier
    ├─ Shopping item → Shopping Service
    ├─ Task → Task Service
    ├─ Query → Search Service
    └─ Preference → User Profile Service
```

### Phase 3: Energy Estimation (Dec 2025 - Mar 2026)

```
Data Collection → Feature Engineering → ML Model → Predictions
    ↓                    ↓                 ↓            ↓
Check-ins        25+ features         XGBoost      Smart Scheduling
Behavior         (sleep, time,        Regressor    Task Suggestions
Context          meetings, etc.)                   Burnout Prevention
```

### Phase 4: Advanced Features (Apr-Jun 2026)

- Collaborative shopping lists
- Time-travel queries
- Pattern suggestions
- Preference evolution tracking

---

## Conclusion

The Proxy Agent Platform architecture is designed for:
- **Simplicity**: Clean layers, clear responsibilities
- **Scalability**: Can grow from 10 to 100K+ users
- **Maintainability**: Well-documented, tested, typed
- **ADHD-Optimization**: Low friction, high forgiveness

**Next Evolution**: Input classification → Energy estimation → Advanced ML

---

**Document Maintained By**: Platform Architecture Team
**Last Review**: October 23, 2025
**Next Review**: January 2026
