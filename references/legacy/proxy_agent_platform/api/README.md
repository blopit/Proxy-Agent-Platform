# API Layer

This directory contains the API layer components that provide web-based interfaces and real-time communication for the Proxy Agent Platform.

## Overview

The API layer bridges the frontend applications with the backend proxy agents, providing RESTful endpoints, WebSocket connections, and specialized interfaces for different platform features.

## Structure

```
api/
├── dashboard.py           # Main dashboard API endpoints
├── energy_visualizer.py   # Energy tracking visualization API
├── focus_timer.py         # Focus session and timer API
├── gamification.py        # Gamification system API
└── websocket_manager.py   # WebSocket connection management
```

## Components

### Dashboard API (dashboard.py)
- **Purpose**: Main dashboard data aggregation and display
- **Features**: Overview metrics, recent activity, quick actions
- **Endpoints**: Summary data, widget configurations, personalized insights

### Energy Visualizer API (energy_visualizer.py)
- **Purpose**: Energy tracking and visualization endpoints
- **Features**: Energy level charts, pattern analysis, optimization suggestions
- **Endpoints**: Energy data retrieval, trend analysis, recommendations

### Focus Timer API (focus_timer.py)
- **Purpose**: Focus session management and timer controls
- **Features**: Pomodoro timers, focus sessions, distraction tracking
- **Endpoints**: Timer controls, session history, focus analytics

### Gamification API (gamification.py)
- **Purpose**: Gamification system integration
- **Features**: XP tracking, achievements, leaderboards, progress rewards
- **Endpoints**: Score updates, achievement unlocks, progress visualization

### WebSocket Manager (websocket_manager.py)
- **Purpose**: Real-time communication infrastructure
- **Features**: Live updates, push notifications, real-time synchronization
- **Capabilities**: Connection management, message broadcasting, event handling

## API Design Patterns

### RESTful Endpoints
```python
# Standard CRUD operations
GET    /api/v1/tasks          # List tasks
POST   /api/v1/tasks          # Create task
GET    /api/v1/tasks/{id}     # Get specific task
PUT    /api/v1/tasks/{id}     # Update task
DELETE /api/v1/tasks/{id}     # Delete task
```

### WebSocket Events
```python
# Real-time event types
{
    "type": "task_created",
    "data": {"task_id": 123, "title": "New task"}
}

{
    "type": "focus_session_started", 
    "data": {"session_id": 456, "duration": 1500}
}
```

### Response Formats
```python
# Standard API response structure
{
    "success": true,
    "data": {...},
    "message": "Operation completed",
    "timestamp": "2024-01-01T12:00:00Z"
}
```

## Integration Points

### Frontend Integration
- Next.js frontend consumes REST APIs
- Real-time updates via WebSocket connections
- Mobile-optimized endpoints for responsive design

### Agent Integration
- Direct communication with proxy agents
- Agent state synchronization
- Event-driven agent notifications

### Database Integration
- Efficient data retrieval and caching
- Optimized queries for dashboard performance
- Real-time data consistency

## Development Guidelines

### Error Handling
- Consistent error response formats
- Proper HTTP status codes
- Detailed error messages for debugging

### Performance
- Response caching where appropriate
- Efficient database queries
- Pagination for large datasets

### Security
- Input validation and sanitization
- Rate limiting for API endpoints
- Secure WebSocket connections

## Testing

### API Testing
- Unit tests for individual endpoints
- Integration tests for complete workflows
- WebSocket connection testing

### Performance Testing
- Load testing for high-traffic scenarios
- Response time optimization
- Memory usage monitoring

## Dependencies

- **FastAPI**: Web framework
- **WebSockets**: Real-time communication
- **Pydantic**: Data validation and serialization
- **SQLAlchemy**: Database integration
