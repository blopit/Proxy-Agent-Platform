# Backend API Documentation

Complete API reference and specifications for the Proxy Agent Platform backend.

**Last Updated**: November 13, 2025

---

## 📚 API Documentation

### Core References

- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete endpoint documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details and patterns
- **[TASK_API_SPEC_V2.md](./TASK_API_SPEC_V2.md)** - Task API specification (version 2)

### OpenAPI Specifications

- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification (YAML format)
- **[openapi.json](./openapi.json)** - OpenAPI 3.0 specification (JSON format)

---

## 🗂️ API Schemas

Detailed schema documentation organized by domain:

### [schemas/](./schemas/)

- **[04-energy.md](./schemas/04-energy.md)** - Energy system schemas (estimation, tracking)
- **[05-gamification.md](./schemas/05-gamification.md)** - Gamification schemas (rewards, pets)
- **[10-capture.md](./schemas/10-capture.md)** - Capture system schemas (task capture, parsing)
- **[SERVICES_CATALOG.md](./schemas/SERVICES_CATALOG.md)** - Complete service inventory

---

## 🚀 Quick Start

### Using the API

```bash
# Start backend server
cd backend
uv run python -m src.main

# API will be available at:
# http://localhost:8000
```

### API Documentation Tools

- **Swagger UI**: http://localhost:8000/docs (interactive API explorer)
- **ReDoc**: http://localhost:8000/redoc (alternative API documentation)
- **OpenAPI JSON**: http://localhost:8000/openapi.json (specification)

---

## 📖 API Overview

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

Most endpoints require authentication via JWT token:

```http
Authorization: Bearer <token>
```

### Common Endpoints

- **Tasks**: `/api/v1/tasks`
- **Leads**: `/api/v1/leads`
- **Sessions**: `/api/v1/sessions`
- **Auth**: `/api/v1/auth`
- **Users**: `/api/v1/users`

See [API_REFERENCE.md](./API_REFERENCE.md) for complete endpoint list.

---

## 🔄 API Patterns

### RESTful Design

- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT/PATCH**: Update resources
- **DELETE**: Delete resources

### Entity-Specific IDs

All resources use entity-specific IDs:

```http
GET /api/v1/tasks/{task_id}
GET /api/v1/leads/{lead_id}
GET /api/v1/sessions/{session_id}
```

### Response Format

```json
{
  "data": { ... },
  "message": "Success",
  "status": 200
}
```

### Error Format

```json
{
  "detail": "Error message",
  "status": 400
}
```

---

## 📝 Documentation Standards

### Endpoint Documentation

Each endpoint should document:

- HTTP method and path
- Request parameters
- Request body schema
- Response schema
- Example requests/responses
- Error codes and messages

### Schema Documentation

Each schema should document:

- Field names and types
- Required vs optional fields
- Validation rules
- Example values
- Related schemas

---

## 🔍 Finding Documentation

### By Feature

- **Task Management**: Check [TASK_API_SPEC_V2.md](./TASK_API_SPEC_V2.md)
- **Energy System**: Check [schemas/04-energy.md](./schemas/04-energy.md)
- **Gamification**: Check [schemas/05-gamification.md](./schemas/05-gamification.md)
- **Capture System**: Check [schemas/10-capture.md](./schemas/10-capture.md)

### By Service

- **All Services**: Check [schemas/SERVICES_CATALOG.md](./schemas/SERVICES_CATALOG.md)
- **Implementation**: Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🛠️ Development

### Updating API Documentation

When adding new endpoints:

1. Update OpenAPI spec (openapi.yaml)
2. Regenerate openapi.json
3. Update API_REFERENCE.md
4. Add examples and tests
5. Update schema docs if needed

### Testing API Endpoints

```bash
# Run API tests
uv run pytest tests/integration/test_api_routes.py -v

# Test specific endpoint
uv run pytest -k "test_create_task" -v
```

---

**Navigation**: [↑ Backend](../README.md) | [↑ Agent Resources](../../README.md)
