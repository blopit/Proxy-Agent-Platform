# API Documentation - Proxy Agent Platform

Complete API reference for all backend services with request/response schemas, authentication, and frontend integration examples.

## 📋 Table of Contents

### Core API Services (`src/api/`)

1. **[Task Management](./01-tasks.md)** - Task CRUD operations, filtering, search
2. **[Authentication](./02-auth.md)** - User authentication and authorization
3. **[Focus Management](./03-focus.md)** - Focus sessions and time tracking
4. **[Energy Tracking](./04-energy.md)** - Energy level monitoring and optimization
5. **[Gamification](./05-gamification.md)** - User engagement, achievements, rewards
6. **[Progress Tracking](./06-progress.md)** - XP calculation, streaks, level progression
7. **[Rewards System](./07-rewards.md)** - Reward redemption and inventory
8. **[Secretary/Organization](./08-secretary.md)** - Task organization and prioritization
9. **[WebSocket Real-time](./09-websocket.md)** - Real-time updates and notifications
10. **[Quick Capture](./10-capture.md)** - Mobile quick capture endpoint

### Legacy APIs (Deprecated)

- **[Simple Tasks](./legacy-simple-tasks.md)** - `/api/simple/*` (use Task Management instead)
- **[Basic Tasks](./legacy-basic-tasks.md)** - `/api/basic/*` (use Task Management instead)

## 🚀 Quick Start

### Base URL

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### Authentication

Most endpoints require authentication via Bearer token:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Exception**: Mobile endpoints (`/api/v1/mobile/*`, `/api/v1/gamification/user-stats`, `/api/v1/energy/current-level`) do NOT require authentication for rapid prototyping.

### Common Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

## 📊 Service Status

| Service | Status | Version | Endpoints |
|---------|--------|---------|-----------|
| Task Management | ✅ Production | v1 | 8+ |
| Authentication | ✅ Production | v1 | 4 |
| Focus Management | ✅ Production | v1 | 5 |
| Energy Tracking | ✅ Production | v1 | 6 |
| Gamification | ✅ Production | v1 | 5 |
| Progress Tracking | ✅ Production | v1 | 6 |
| Rewards System | ✅ Production | v1 | 5 |
| Secretary | ✅ Production | v1 | 4 |
| WebSocket | ✅ Production | v1 | 2 |
| Quick Capture | ✅ Production | v1 | 2 |

## 🔗 Frontend Integration

### TypeScript API Client

See [frontend/src/lib/api.ts](../frontend/src/lib/api.ts) for the complete TypeScript client.

```typescript
import { apiClient } from '@/lib/api';

// Quick capture example
const response = await apiClient.quickCapture({
  text: 'Buy groceries tomorrow',
  user_id: 'mobile-user',
  auto_mode: true
});

// Get user stats
const stats = await apiClient.getProgressStats('mobile-user');
console.log(`Level ${stats.engagement_score}, Streak: ${stats.active_days_streak}`);

// Get energy level
const energy = await apiClient.getEnergyLevel('mobile-user');
console.log(`Energy: ${energy.energy_level}/10`);
```

## 📝 API Design Principles

### RESTful Conventions

- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Update resources (full replacement)
- `PATCH` - Partial update
- `DELETE` - Remove resources

### URL Structure

```
/api/v{version}/{service}/{resource}/{identifier}
/api/v1/tasks/123
/api/v1/gamification/user-stats?user_id=xxx
```

### Query Parameters

- `user_id` - User identifier (required for most endpoints)
- `limit` - Pagination limit (default: 50)
- `offset` - Pagination offset (default: 0)
- `status` - Filter by status
- `priority` - Filter by priority
- `tags` - Filter by tags (comma-separated)

## 🔧 Development

### Running Backend

```bash
cd /path/to/Proxy-Agent-Platform
uv run uvicorn src.api.main:app --reload --port 8000
```

### Running Frontend

```bash
cd frontend
npm run dev
```

### Testing Endpoints

```bash
# Test gamification stats
curl "http://localhost:8000/api/v1/gamification/user-stats?user_id=mobile-user"

# Test energy level
curl "http://localhost:8000/api/v1/energy/current-level?user_id=mobile-user"

# Test quick capture
curl -X POST "http://localhost:8000/api/v1/mobile/quick-capture" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test task", "user_id": "mobile-user", "auto_mode": true}'
```

## 📚 Additional Resources

- **[OpenAPI Spec](./openapi.json)** - Auto-generated from FastAPI
- **[Postman Collection](./postman_collection.json)** - Import into Postman
- **[Integration Tests](../tests/api/)** - Backend API test suite
- **[Frontend Examples](./examples/)** - Real-world usage examples

## 🐛 Troubleshooting

### Common Issues

**404 Errors**
- Verify base URL matches backend server
- Check endpoint path matches documentation
- Ensure backend server is running

**CORS Errors**
- Backend must have CORS enabled for frontend domain
- Check `src/api/main.py` CORS configuration

**Authentication Failures**
- Verify token is valid and not expired
- Check Authorization header format: `Bearer {token}`
- Some mobile endpoints don't require auth

## 📞 Support

- **Documentation Issues**: Open issue at [GitHub](https://github.com/your-org/proxy-agent-platform)
- **API Changes**: See [CHANGELOG.md](../CHANGELOG.md)
- **Breaking Changes**: Marked with ⚠️ in service docs

---

Last Updated: 2025-10-23
Version: 1.0.0
