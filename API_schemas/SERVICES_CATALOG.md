# Backend Services Catalog

Complete reference of all backend API services with endpoint counts, authentication requirements, and status.

## Core API Services (`src/api/`)

| # | Service | File | Base Path | Auth Required | Endpoints | Status | Documentation |
|---|---------|------|-----------|---------------|-----------|--------|---------------|
| 1 | **Task Management** | `tasks.py` | `/api/v1/tasks` | ✅ Yes | 8+ | ✅ Production | [📖 Docs](./01-tasks.md) |
| 2 | **Authentication** | `auth.py` | `/api/v1/auth` | ❌ No (by design) | 4 | ✅ Production | [📖 Docs](./02-auth.md) |
| 3 | **Focus Management** | `focus.py` | `/api/v1/focus` | ✅ Yes | 5 | ✅ Production | [📖 Docs](./03-focus.md) |
| 4 | **Energy Tracking** | `energy.py` | `/api/v1/energy` | ⚠️ Partial* | 6 | ✅ Production | [📖 Docs](./04-energy.md) |
| 5 | **Gamification** | `gamification.py` | `/api/v1/gamification` | ⚠️ Partial* | 5 | ✅ Production | [📖 Docs](./05-gamification.md) |
| 6 | **Progress Tracking** | `progress.py` | `/api/v1/progress` | ✅ Yes | 6 | ✅ Production | [📖 Docs](./06-progress.md) |
| 7 | **Rewards System** | `rewards.py` | `/api/v1/rewards` | ✅ Yes | 5 | ✅ Production | [📖 Docs](./07-rewards.md) |
| 8 | **Secretary/Org** | `secretary.py` | `/api/v1/secretary` | ✅ Yes | 4 | ✅ Production | [📖 Docs](./08-secretary.md) |
| 9 | **WebSocket** | `websocket.py` | `/ws/{client_id}` | ❌ No | 2 | ✅ Production | [📖 Docs](./09-websocket.md) |
| 10 | **Quick Capture** | `capture.py` | `/api/v1/mobile` | ❌ No | 2 | ✅ Production | [📖 Docs](./10-capture.md) |

*⚠️ Partial Auth: Mobile endpoints (`/current-level`, `/user-stats`) don't require auth for rapid prototyping. Other endpoints require authentication.*

### Legacy APIs (Deprecated)

| Service | File | Base Path | Status | Replacement |
|---------|------|-----------|--------|-------------|
| Simple Tasks | `simple_tasks.py` | `/api/simple/*` | 🚫 Deprecated | Use Task Management |
| Basic Tasks | `basic_tasks.py` | `/api/basic/*` | 🚫 Deprecated | Use Task Management |

---

## Quick Reference: Mobile-Optimized Endpoints

These endpoints are optimized for mobile devices and **do not require authentication**:

### 1. Quick Capture
```http
POST /api/v1/mobile/quick-capture
```
**Purpose**: Instant task creation from natural language
**Response Time**: <200ms
**Documentation**: [Quick Capture API](./10-capture.md)

### 2. Energy Level
```http
GET /api/v1/energy/current-level?user_id={user_id}
```
**Purpose**: Get circadian-based energy estimate (0-10 scale)
**Response Time**: <50ms
**Documentation**: [Energy Tracking API](./04-energy.md)

### 3. User Stats
```http
GET /api/v1/gamification/user-stats?user_id={user_id}
```
**Purpose**: Get engagement score, streak, insights
**Response Time**: <100ms
**Documentation**: [Gamification API](./05-gamification.md)

---

## Endpoint Count by Category

| Category | Endpoint Count | Description |
|----------|----------------|-------------|
| **Task Operations** | 8+ | CRUD, search, filter, bulk operations |
| **User Management** | 4 | Login, register, profile, logout |
| **Time Tracking** | 5 | Focus sessions, timers, analytics |
| **Energy/Wellness** | 6 | Energy tracking, circadian analysis, optimization |
| **Engagement** | 5 | Stats, achievements, leaderboards |
| **Progress** | 6 | XP calculation, streaks, level progression |
| **Rewards** | 5 | Redemption, inventory, unlocks |
| **Organization** | 4 | Task prioritization, scheduling |
| **Real-time** | 2 | WebSocket connections, broadcasts |
| **Quick Capture** | 2 | Mobile capture, stats |

**Total**: **47+ public API endpoints**

---

## Authentication Matrix

| Endpoint Pattern | Auth Required | Token Type | Exception |
|------------------|---------------|------------|-----------|
| `/api/v1/auth/*` | ❌ No | - | Auth endpoints themselves |
| `/api/v1/mobile/*` | ❌ No | - | Mobile quick actions |
| `/api/v1/energy/current-level` | ❌ No | - | Mobile energy check |
| `/api/v1/gamification/user-stats` | ❌ No | - | Mobile stats |
| `/ws/{client_id}` | ❌ No | - | WebSocket (auth via handshake) |
| **All other endpoints** | ✅ Yes | Bearer JWT | - |

### Authentication Flow

```typescript
// 1. Login to get token
const { token } = await apiClient.login({
  username: 'user@example.com',
  password: 'secure_password'
});

// 2. Store token
localStorage.setItem('auth_token', token);

// 3. Use token in requests
const tasks = await apiClient.getTasks({
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Response Time Targets

| Endpoint Type | Target | Typical | Notes |
|---------------|--------|---------|-------|
| Mobile endpoints | <200ms | ~150ms | Optimized for mobile |
| Read operations | <300ms | ~200ms | GET requests |
| Write operations | <500ms | ~300ms | POST/PUT/DELETE |
| Analytics/Reports | <1000ms | ~700ms | Complex calculations |
| WebSocket | <50ms | ~20ms | Real-time updates |

---

## Frontend Integration Status

### TypeScript Client

**File**: `frontend/src/lib/api.ts`

| Service | Client Method | Status |
|---------|---------------|--------|
| Quick Capture | `quickCapture()` | ✅ Implemented |
| Energy | `getEnergyLevel()` | ✅ Implemented |
| Gamification | `getProgressStats()` | ✅ Implemented |
| Tasks | `getTasks()`, `createTask()`, `deleteTask()` | ✅ Implemented |
| Focus | `startFocusSession()`, `endFocusSession()` | ✅ Implemented |
| WebSocket | `useWebSocket()` hook | ✅ Implemented |

### Mobile Page Integration

**File**: `frontend/src/app/mobile/page.tsx`

- ✅ Quick capture with auto/manual modes
- ✅ Energy level display (0-100%)
- ✅ XP, level, streak tracking
- ✅ Real-time updates via WebSocket (optional)
- ✅ Biological mode components (Capture, Scout, Hunter, Mender, Mapper)

---

## API Versioning Strategy

### Current Version: v1

All endpoints use `/api/v1/` prefix.

### Future Versions

Breaking changes will introduce new API versions (`/api/v2/`), maintaining v1 compatibility for 6 months minimum.

### Deprecation Policy

1. Announce deprecation 3 months in advance
2. Update documentation with migration guide
3. Add deprecation warnings to responses
4. Maintain legacy endpoints for 6 months
5. Remove deprecated endpoints in next major version

---

## Service Dependencies

```
┌─────────────────────────────────────────────────┐
│            Frontend (Next.js)                    │
│  - Mobile UI (/mobile)                          │
│  - Desktop UI (/)                                │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/WebSocket
                  ↓
┌─────────────────────────────────────────────────┐
│         API Gateway (FastAPI)                    │
│  - src/api/main.py                              │
│  - Routing, CORS, Auth Middleware               │
└─────────────────┬───────────────────────────────┘
                  │
     ┌────────────┼────────────┐
     ↓            ↓            ↓
┌─────────┐  ┌─────────┐  ┌──────────┐
│  Tasks  │  │ Energy  │  │   Auth   │
│   API   │  │   API   │  │   API    │
└────┬────┘  └────┬────┘  └────┬─────┘
     │            │             │
     └────────────┴─────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│    Database (SQLite + WAL)                      │
│  - proxy_agents_enhanced.db                     │
└─────────────────────────────────────────────────┘
```

---

## Testing Coverage

| Service | Unit Tests | Integration Tests | E2E Tests |
|---------|-----------|-------------------|-----------|
| Task Management | ✅ 95% | ✅ 90% | ✅ 80% |
| Authentication | ✅ 98% | ✅ 95% | ✅ 85% |
| Energy Tracking | ⚠️ 60% | ⚠️ 50% | ❌ 0% |
| Gamification | ⚠️ 55% | ⚠️ 45% | ❌ 0% |
| Quick Capture | ✅ 85% | ✅ 80% | ✅ 75% |

**Legend**:
- ✅ Good coverage (>80%)
- ⚠️ Needs improvement (50-80%)
- ❌ Low/No coverage (<50%)

---

## Production Readiness Checklist

### Backend Services

- ✅ All endpoints functional
- ✅ Authentication middleware in place
- ✅ Error handling standardized
- ✅ CORS configured for frontend
- ⚠️ Rate limiting (partial - mobile endpoints exempt)
- ⚠️ Logging and monitoring (basic implementation)
- ❌ Distributed tracing (not implemented)
- ❌ Database connection pooling (SQLite limitation)

### Frontend Integration

- ✅ TypeScript API client
- ✅ Mobile-optimized endpoints
- ✅ Error handling with fallbacks
- ✅ Loading states and UX
- ⚠️ WebSocket reconnection logic (implemented but needs testing)
- ❌ Offline mode (not implemented)

### Documentation

- ✅ API endpoint documentation
- ✅ Request/response schemas
- ✅ Frontend integration examples
- ⚠️ OpenAPI/Swagger spec (auto-generated but not complete)
- ❌ Postman collection (not created)

---

## Next Steps

### Immediate (Week 1)

1. ✅ **Document mobile endpoints** - Energy, Gamification, Capture (DONE)
2. ⬜ Complete Task Management API docs
3. ⬜ Complete Authentication API docs
4. ⬜ Generate OpenAPI spec from FastAPI

### Short-term (Month 1)

5. ⬜ Document all 10 core services
6. ⬜ Create Postman collection
7. ⬜ Add rate limiting to mobile endpoints
8. ⬜ Improve test coverage for Energy/Gamification

### Long-term (Quarter 1)

9. ⬜ Add distributed tracing
10. ⬜ Migrate from SQLite to PostgreSQL
11. ⬜ Implement API v2 with breaking changes
12. ⬜ Add offline mode to frontend

---

**Last Updated**: 2025-10-23
**Total Services**: 10 production + 2 deprecated
**Total Endpoints**: 47+
**Documentation Coverage**: 30% (3/10 services fully documented)
