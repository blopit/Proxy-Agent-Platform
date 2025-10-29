# Task Delegation System (BE-00)

The Task Delegation System enables intelligent task assignment to both human users and AI agents, supporting the 4D delegation framework (DO, DO_WITH_ME, DELEGATE, DELETE).

## Features

- ✅ **Task Assignment**: Delegate tasks to humans or agents
- ✅ **Assignment Lifecycle**: Track pending → in_progress → completed states
- ✅ **Agent Management**: Register agents with capabilities and skills
- ✅ **Query Interface**: Filter assignments by status, agent type, availability
- ✅ **4D Delegation Modes**: Support for DO, DO_WITH_ME, DELEGATE, DELETE
- ✅ **95% Test Coverage**: Comprehensive test suite with TDD methodology

## Architecture

```
src/services/delegation/
├── models.py         # Pydantic models (request/response validation)
├── repository.py     # Database operations (SQLite)
├── routes.py         # FastAPI endpoints
├── README.md         # This file
└── tests/
    ├── conftest.py   # Test fixtures
    └── test_delegation.py  # 14 TDD tests
```

## Database Schema

### task_assignments
Tracks task delegation assignments.

| Column | Type | Description |
|--------|------|-------------|
| assignment_id | TEXT (PK) | Unique assignment identifier |
| task_id | TEXT (FK) | Reference to tasks table |
| assignee_id | TEXT | ID of human or agent |
| assignee_type | TEXT | 'human' or 'agent' |
| status | TEXT | 'pending', 'in_progress', 'completed' |
| assigned_at | TIMESTAMP | When task was assigned |
| accepted_at | TIMESTAMP | When assignment was accepted |
| completed_at | TIMESTAMP | When assignment was completed |
| estimated_hours | REAL | Estimated completion time |
| actual_hours | REAL | Actual completion time |

### agent_capabilities
Tracks available agents and their capabilities.

| Column | Type | Description |
|--------|------|-------------|
| capability_id | TEXT (PK) | Unique capability identifier |
| agent_id | TEXT | Unique agent identifier |
| agent_name | TEXT | Human-readable agent name |
| agent_type | TEXT | 'backend', 'frontend', 'general' |
| skills | TEXT (JSON) | List of agent skills |
| max_concurrent_tasks | INTEGER | Max concurrent assignments |
| current_task_count | INTEGER | Current active assignments |
| is_available | BOOLEAN | Agent availability status |
| created_at | TIMESTAMP | Agent registration time |
| updated_at | TIMESTAMP | Last update time |

## API Reference

All endpoints are prefixed with `/api/v1/delegation`.

### 1. Delegate a Task

Assign a task to a human or agent.

**Endpoint:** `POST /delegate`

**Request Body:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "assignee_id": "backend-agent-1",
  "assignee_type": "agent",
  "estimated_hours": 6.0
}
```

**Response:** `201 Created`
```json
{
  "assignment_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "assignee_id": "backend-agent-1",
  "assignee_type": "agent",
  "status": "pending",
  "assigned_at": "2025-01-29T10:30:00Z",
  "accepted_at": null,
  "completed_at": null,
  "estimated_hours": 6.0,
  "actual_hours": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "assignee_id": "backend-agent-1",
    "assignee_type": "agent",
    "estimated_hours": 6.0
  }'
```

---

### 2. Get Agent Assignments

Retrieve all assignments for a specific agent.

**Endpoint:** `GET /assignments/agent/{agent_id}`

**Query Parameters:**
- `status` (optional): Filter by status ('pending', 'in_progress', 'completed')

**Response:** `200 OK`
```json
[
  {
    "assignment_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "assignee_id": "backend-agent-1",
    "assignee_type": "agent",
    "status": "pending",
    "assigned_at": "2025-01-29T10:30:00Z",
    "accepted_at": null,
    "completed_at": null,
    "estimated_hours": 6.0,
    "actual_hours": null
  }
]
```

**cURL Examples:**
```bash
# Get all assignments
curl http://localhost:8000/api/v1/delegation/assignments/agent/backend-agent-1

# Get only pending assignments
curl http://localhost:8000/api/v1/delegation/assignments/agent/backend-agent-1?status=pending

# Get only completed assignments
curl http://localhost:8000/api/v1/delegation/assignments/agent/backend-agent-1?status=completed
```

---

### 3. Accept an Assignment

Accept a pending assignment (moves to 'in_progress').

**Endpoint:** `POST /assignments/{assignment_id}/accept`

**Response:** `200 OK`
```json
{
  "assignment_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "assignee_id": "backend-agent-1",
  "assignee_type": "agent",
  "status": "in_progress",
  "assigned_at": "2025-01-29T10:30:00Z",
  "accepted_at": "2025-01-29T10:35:00Z",
  "completed_at": null,
  "estimated_hours": 6.0,
  "actual_hours": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/delegation/assignments/7c9e6679-7425-40de-944b-e07fc1f90ae7/accept
```

**Error Cases:**
- `404 Not Found`: Assignment doesn't exist
- `400 Bad Request`: Assignment already accepted/completed

---

### 4. Complete an Assignment

Complete an in-progress assignment.

**Endpoint:** `POST /assignments/{assignment_id}/complete`

**Request Body:**
```json
{
  "actual_hours": 5.5
}
```

**Response:** `200 OK`
```json
{
  "assignment_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "assignee_id": "backend-agent-1",
  "assignee_type": "agent",
  "status": "completed",
  "assigned_at": "2025-01-29T10:30:00Z",
  "accepted_at": "2025-01-29T10:35:00Z",
  "completed_at": "2025-01-29T16:05:00Z",
  "estimated_hours": 6.0,
  "actual_hours": 5.5
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/delegation/assignments/7c9e6679-7425-40de-944b-e07fc1f90ae7/complete \
  -H "Content-Type: application/json" \
  -d '{"actual_hours": 5.5}'
```

**Error Cases:**
- `404 Not Found`: Assignment doesn't exist
- `400 Bad Request`: Assignment not yet accepted

---

### 5. Register an Agent

Register a new agent with capabilities.

**Endpoint:** `POST /agents`

**Request Body:**
```json
{
  "agent_id": "backend-agent-1",
  "agent_name": "Backend TDD Agent",
  "agent_type": "backend",
  "skills": ["python", "fastapi", "tdd", "sqlalchemy"],
  "max_concurrent_tasks": 2
}
```

**Response:** `201 Created`
```json
{
  "capability_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "agent_id": "backend-agent-1",
  "agent_name": "Backend TDD Agent",
  "agent_type": "backend",
  "skills": ["python", "fastapi", "tdd", "sqlalchemy"],
  "max_concurrent_tasks": 2,
  "current_task_count": 0,
  "is_available": true,
  "created_at": "2025-01-29T10:00:00Z",
  "updated_at": "2025-01-29T10:00:00Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "backend-agent-1",
    "agent_name": "Backend TDD Agent",
    "agent_type": "backend",
    "skills": ["python", "fastapi", "tdd", "sqlalchemy"],
    "max_concurrent_tasks": 2
  }'
```

---

### 6. Query Available Agents

Get list of agents with optional filtering.

**Endpoint:** `GET /agents`

**Query Parameters:**
- `agent_type` (optional): Filter by type ('backend', 'frontend', 'general')
- `available_only` (optional): Filter to only available agents (true/false)

**Response:** `200 OK`
```json
[
  {
    "capability_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "agent_id": "backend-agent-1",
    "agent_name": "Backend TDD Agent",
    "agent_type": "backend",
    "skills": ["python", "fastapi", "tdd", "sqlalchemy"],
    "max_concurrent_tasks": 2,
    "current_task_count": 0,
    "is_available": true,
    "created_at": "2025-01-29T10:00:00Z",
    "updated_at": "2025-01-29T10:00:00Z"
  }
]
```

**cURL Examples:**
```bash
# Get all agents
curl http://localhost:8000/api/v1/delegation/agents

# Get only backend agents
curl http://localhost:8000/api/v1/delegation/agents?agent_type=backend

# Get only available agents
curl http://localhost:8000/api/v1/delegation/agents?available_only=true

# Get available backend agents
curl http://localhost:8000/api/v1/delegation/agents?agent_type=backend&available_only=true
```

---

## Usage Workflows

### Workflow 1: Delegate Task to Agent

```bash
# 1. Register an agent
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "backend-agent-1",
    "agent_name": "Backend TDD Agent",
    "agent_type": "backend",
    "skills": ["python", "fastapi", "tdd"],
    "max_concurrent_tasks": 2
  }'

# 2. Delegate a task
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "assignee_id": "backend-agent-1",
    "assignee_type": "agent",
    "estimated_hours": 6.0
  }'

# 3. Agent accepts the assignment
curl -X POST http://localhost:8000/api/v1/delegation/assignments/{assignment_id}/accept

# 4. Agent completes the assignment
curl -X POST http://localhost:8000/api/v1/delegation/assignments/{assignment_id}/complete \
  -H "Content-Type: application/json" \
  -d '{"actual_hours": 5.5}'
```

### Workflow 2: Check Agent Workload

```bash
# Get all pending assignments for an agent
curl http://localhost:8000/api/v1/delegation/assignments/agent/backend-agent-1?status=pending

# Get all in-progress assignments
curl http://localhost:8000/api/v1/delegation/assignments/agent/backend-agent-1?status=in_progress

# Check agent availability
curl http://localhost:8000/api/v1/delegation/agents?agent_type=backend&available_only=true
```

---

## Testing

### Run Tests
```bash
# Run all delegation tests
uv run pytest src/services/delegation/tests/test_delegation.py -v

# Run with coverage
uv run pytest src/services/delegation/tests/test_delegation.py --cov=src/services/delegation --cov-report=term-missing
```

### Test Coverage
- **Total:** 95%
- **models.py:** 98%
- **repository.py:** 97%
- **routes.py:** 88%
- **14 tests** covering all critical paths

---

## Development

### Adding New Features

1. **Write tests first** (TDD approach)
   ```bash
   # Add test to tests/test_delegation.py
   def test_new_feature(self, test_client):
       # Test implementation
   ```

2. **Implement in repository layer**
   ```python
   # Add method to repository.py
   def new_feature(self, ...):
       # Database operations
   ```

3. **Add API endpoint**
   ```python
   # Add route to routes.py
   @router.post("/new-endpoint")
   def new_endpoint(...):
       # Endpoint logic
   ```

4. **Run tests**
   ```bash
   uv run pytest src/services/delegation/tests/test_delegation.py -v
   ```

### Migration to Supabase/PostgreSQL

The system uses `EnhancedDatabaseAdapter` for abstraction. To migrate:

1. Create `SupabaseDatabaseAdapter` implementing same interface
2. Update dependency injection in `src/api/dependencies.py`
3. No changes needed to repository or routes (abstraction handles it)

---

## 4D Delegation Modes

The system supports the 4D delegation framework:

1. **DO**: Task must be done by you (no delegation)
2. **DO_WITH_ME**: Collaborative task (pair with agent/human)
3. **DELEGATE**: Fully delegate to agent/human
4. **DELETE**: Task should be eliminated

Tasks are stored with `delegation_mode` field for future automation.

---

## Related Documentation

- [Database Schema](../../database/enhanced_adapter.py) - Complete database structure
- [Seed Script](../../database/seeds/seed_development_tasks.py) - Load 36 development tasks
- [API Main](../../api/main.py) - FastAPI application setup

---

## Support

For issues or questions:
- Check test cases: `src/services/delegation/tests/test_delegation.py`
- Review repository methods: `src/services/delegation/repository.py`
- Examine API routes: `src/services/delegation/routes.py`
