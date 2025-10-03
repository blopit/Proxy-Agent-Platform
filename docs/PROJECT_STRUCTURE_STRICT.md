# 🏗️ Strict Project Structure

## 📁 **Clean, Organized Architecture**

```
Proxy-Agent-Platform/
├── src/                           # All source code
│   ├── __init__.py
│   ├── core/
│   │   └── models.py              # Simple data models
│   ├── database/
│   │   └── adapter.py             # SQLite adapter (easy PostgreSQL upgrade)
│   ├── agents/
│   │   ├── base.py                # Base agent class
│   │   ├── task_agent.py          # Task capture & management
│   │   ├── focus_agent.py         # Focus sessions
│   │   └── registry.py            # Agent coordination
│   ├── api/
│   │   └── main.py                # FastAPI application
│   └── tests/
│       └── test_agents.py         # Comprehensive tests
├── tasks/                         # Epic and task management
├── docs/                          # Documentation
├── test_2second_simple.py         # Performance testing
└── pyproject.toml                 # Dependencies
```

## 🎯 **Design Principles**

### **1. Strict Separation of Concerns**
- **`src/core/`**: Pure data models, no business logic
- **`src/database/`**: Database abstraction only
- **`src/agents/`**: Agent logic and behavior
- **`src/api/`**: HTTP endpoints and routing
- **`src/tests/`**: All testing code

### **2. Database Adapter Pattern**
- **SQLite for development**: Fast, simple, no setup
- **Easy PostgreSQL upgrade**: Change one line in adapter
- **No vendor lock-in**: Abstract database operations

### **3. Simple Agent Architecture**
- **Base class**: Common functionality
- **Specific agents**: Task, Focus, Energy, Progress
- **Registry pattern**: Central coordination
- **Message storage**: Conversation persistence

## 🚀 **Quick Start**

### **Run the Platform**
```bash
# Start the API server
python -m src.api.main

# Test 2-second capture
python test_2second_simple.py

# Run tests
uv run pytest src/tests/ -v
```

### **Add New Agent**
```python
# src/agents/energy_agent.py
from src.agents.base import BaseProxyAgent

class EnergyAgent(BaseProxyAgent):
    def __init__(self, db):
        super().__init__("energy", db)

    async def _handle_request(self, request, history):
        return "Energy tracked!", 15

# src/agents/registry.py - add to agents dict
"energy": EnergyAgent(self.db)
```

### **Upgrade to PostgreSQL**
```python
# src/database/adapter.py - replace SQLite methods with asyncpg
class DatabaseAdapter:
    def __init__(self, connection_string: str):
        self.pool = asyncpg.create_pool(connection_string)
    # ... implement async PostgreSQL methods
```

## 🔧 **Benefits of This Structure**

### **Development Speed**
- **No database setup**: SQLite works out of the box
- **Simple testing**: In-memory or temp file databases
- **Fast iteration**: No migration complexity

### **Production Ready**
- **Easy upgrade path**: Adapter pattern abstracts database
- **Scalable architecture**: Clear boundaries and interfaces
- **Testing coverage**: Comprehensive test suite

### **Maintainability**
- **Clear boundaries**: Each module has single responsibility
- **Simple imports**: Logical dependency tree
- **Documentation**: Self-documenting structure

## 📊 **Performance Targets**

### **2-Second Task Capture**
- **SQLite performance**: < 50ms for simple queries
- **Agent processing**: < 100ms for task capture
- **API overhead**: < 50ms for FastAPI
- **Total target**: < 500ms (well under 2 seconds)

### **Scalability Path**
1. **Start**: SQLite + single process
2. **Scale**: PostgreSQL + connection pooling
3. **Expand**: Multiple instances + load balancer
4. **Advanced**: Redis caching + microservices

---

**The structure is designed for rapid development with a clear path to production scale.**