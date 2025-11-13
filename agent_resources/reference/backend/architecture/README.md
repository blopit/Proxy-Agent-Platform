# Backend Architecture Reference

Technical reference documentation for backend architecture.

**Last Updated**: November 13, 2025

---

## 📚 Architecture Documentation

Architecture reference documents provide technical details about backend system design.

---

## 🔍 Finding Architecture Docs

### System Architecture

- **[System Overview](../../../architecture/system-overview.md)** - Complete system architecture
- **[Architecture Deep Dive](../../../architecture/design/ARCHITECTURE_DEEP_DIVE.md)** - Detailed technical architecture
- **[AI System Architecture](../../../docs/architecture/AI_SYSTEM_ARCHITECTURE.md)** - AI agent architecture

### Database Architecture

- **[Naming Conventions](../../../architecture/design/NAMING_CONVENTIONS.md)** - Database standards
- **[Extended Task Metadata](../../../architecture/design/EXTENDED_TASK_METADATA.md)** - Task data models

### API Architecture

- **[API Reference](../../api/API_REFERENCE.md)** - Complete API documentation
- **[API Implementation](../../api/IMPLEMENTATION_SUMMARY.md)** - Implementation details

---

## 🎯 Architecture Patterns

### Repository Pattern

Entity-specific primary keys with auto-derivation:

```python
class LeadRepository(BaseRepository[Lead]):
    def __init__(self):
        super().__init__()  # Auto-derives "leads" and "lead_id"
```

### Service Layer

Business logic separated from API routes:

```python
class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def create_task(self, task_data: TaskCreate) -> Task:
        # Business logic here
        pass
```

### Vertical Slice Architecture

Tests live next to the code they test:

```
src/
  agents/
    base_agent.py
    tests/
      test_base_agent.py
```

---

**Navigation**: [↑ Backend Reference](../README.md) | [↑ Reference](../../README.md)
