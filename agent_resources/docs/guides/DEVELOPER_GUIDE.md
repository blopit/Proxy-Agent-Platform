# 🛠️ Developer Guide - Proxy Agent Platform

Welcome to the developer documentation for the Proxy Agent Platform. This guide covers everything you need to know to contribute to, extend, or integrate with the platform.

## 📚 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Architecture Overview](#architecture-overview)
- [Core Components](#core-components)
- [Agent Development](#agent-development)
- [Testing Guidelines](#testing-guidelines)
- [Code Style and Standards](#code-style-and-standards)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Frontend Integration](#frontend-integration)
- [Deployment and DevOps](#deployment-and-devops)
- [Contributing Guidelines](#contributing-guidelines)

## 🚀 Development Environment Setup

### Prerequisites

Ensure you have the following installed:

```bash
# Python 3.11 or higher
python --version  # Should be 3.11+

# UV package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# PostgreSQL (for production-like development)
# On macOS:
brew install postgresql@15
# On Ubuntu:
sudo apt-get install postgresql-15

# Redis (for real-time features and caching)
# On macOS:
brew install redis
# On Ubuntu:
sudo apt-get install redis-server

# Node.js 18+ (for frontend development)
node --version  # Should be 18+
```

### Project Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv sync --group dev

# Set up pre-commit hooks
uv run pre-commit install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with development settings:

```bash
# Development Environment Configuration

# Database
DATABASE_URL=postgresql://localhost:5432/proxy_agent_dev
# Alternative for simple development:
# DATABASE_URL=sqlite:///./proxy_agent_dev.db

# Redis
REDIS_URL=redis://localhost:6379

# AI Providers (at least one required)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here

# Application
DEBUG=true
LOG_LEVEL=DEBUG
SECRET_KEY=dev_secret_key_change_in_production

# Testing
TEST_DATABASE_URL=postgresql://localhost:5432/proxy_agent_test
# Alternative: TEST_DATABASE_URL=sqlite:///./proxy_agent_test.db
```

### Database Setup

```bash
# Start PostgreSQL (if not running)
brew services start postgresql@15  # macOS
sudo service postgresql start      # Ubuntu

# Create databases
createdb proxy_agent_dev
createdb proxy_agent_test

# Run migrations
uv run alembic upgrade head

# Create a test user (optional)
uv run python scripts/create_test_user.py
```

### Verification

Verify your setup:

```bash
# Run tests to ensure everything works
uv run pytest tests/ -v

# Start the development server
uv run uvicorn proxy_agent_platform.api.main:app --reload --port 8000

# In another terminal, test the CLI
uv run proxy-agent --help
```

## 🏗️ Architecture Overview

### System Architecture

The Proxy Agent Platform follows a modern, scalable architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Web Frontend  │   Mobile Apps   │    CLI Interface        │
│   (React/Next)  │   (iOS/Android) │    (Typer/Rich)        │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                             │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Router │ WebSocket Hub │ Authentication Middleware │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                   Agent Layer                               │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ Task Proxy   │ Focus Proxy  │ Energy Proxy │ Progress Proxy│
│              │              │              │               │
│ • Capture    │ • Sessions   │ • Tracking   │ • Analytics   │
│ • Schedule   │ • Blocking   │ • Prediction │ • Gamification│
│ • Execute    │ • Analytics  │ • Optimize   │ • Reporting   │
└──────────────┴──────────────┴──────────────┴───────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                  Core Services                              │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Agent Framework │ Learning Engine │ Workflow System         │
│                 │                 │                         │
│ • PydanticAI    │ • ML Models     │ • Orchestration         │
│ • Communication │ • Analytics     │ • Event Processing      │
│ • Registry      │ • Optimization  │ • State Management      │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                 │
├─────────────────┬─────────────────┬─────────────────────────┤
│   PostgreSQL    │     Redis       │    External APIs        │
│                 │                 │                         │
│ • User Data     │ • Sessions      │ • AI Providers          │
│ • Tasks         │ • Real-time     │ • Calendar APIs         │
│ • Analytics     │ • Caching       │ • Mobile Integration    │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### Key Design Principles

1. **Agent-Centric Design**: Each major feature is implemented as a specialized AI agent
2. **Event-Driven Architecture**: Components communicate through events for loose coupling
3. **Real-time First**: WebSocket connections provide instant updates across all clients
4. **API-First**: All functionality is exposed through well-designed REST and WebSocket APIs
5. **Test-Driven Development**: Comprehensive test coverage ensures reliability
6. **Horizontal Scalability**: Designed to scale across multiple servers

### Technology Stack

**Backend:**
- **Python 3.11+**: Modern Python with type hints
- **PydanticAI**: AI agent framework with type safety
- **FastAPI**: High-performance async web framework
- **SQLAlchemy 2.0**: Modern ORM with async support
- **Alembic**: Database migration management
- **Pydantic V2**: Data validation and settings
- **Redis**: Caching and real-time features

**Frontend:**
- **React/Next.js**: Modern web frontend
- **TypeScript**: Type-safe JavaScript
- **WebSocket Client**: Real-time updates
- **PWA Support**: Progressive Web App features

**Mobile:**
- **iOS Shortcuts**: Native iOS integration
- **Android Intents**: Android system integration
- **Cross-platform SDK**: Unified mobile experience

**Infrastructure:**
- **Docker**: Containerization
- **PostgreSQL**: Primary database
- **Redis**: Cache and message broker
- **nginx**: Load balancing and routing

## 🧩 Core Components

### Agent Framework

The agent framework provides the foundation for all AI agents in the system.

#### Base Agent Class

```python
# proxy_agent_platform/agents/base.py

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Any
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class BaseProxyAgent(ABC, Generic[T]):
    """
    Base class for all proxy agents in the platform.

    Provides common functionality for agent communication,
    context management, and result handling.
    """

    def __init__(self, name: str, model: str = "gpt-4"):
        self.name = name
        self.agent = Agent(model)
        self.context: dict[str, Any] = {}

    @abstractmethod
    async def process_request(self, request: T) -> Any:
        """Process a request specific to this agent type."""
        pass

    @abstractmethod
    async def get_capabilities(self) -> list[str]:
        """Return list of capabilities this agent provides."""
        pass

    async def communicate_with_agent(
        self,
        target_agent: str,
        message: dict[str, Any]
    ) -> dict[str, Any]:
        """Send a message to another agent."""
        from .registry import AgentRegistry
        return await AgentRegistry.send_message(target_agent, message)
```

#### Agent Registry

```python
# proxy_agent_platform/agents/registry.py

from typing import Dict, Type, Any
from .base import BaseProxyAgent

class AgentRegistry:
    """
    Registry for managing all proxy agents in the system.

    Handles agent discovery, communication, and lifecycle management.
    """

    _agents: Dict[str, BaseProxyAgent] = {}
    _agent_types: Dict[str, Type[BaseProxyAgent]] = {}

    @classmethod
    def register_agent(cls, name: str, agent_class: Type[BaseProxyAgent]):
        """Register an agent type."""
        cls._agent_types[name] = agent_class

    @classmethod
    async def get_agent(cls, name: str) -> BaseProxyAgent:
        """Get or create an agent instance."""
        if name not in cls._agents:
            if name not in cls._agent_types:
                raise ValueError(f"Unknown agent type: {name}")
            cls._agents[name] = cls._agent_types[name]()
        return cls._agents[name]

    @classmethod
    async def send_message(
        cls,
        target_agent: str,
        message: dict[str, Any]
    ) -> dict[str, Any]:
        """Send a message between agents."""
        agent = await cls.get_agent(target_agent)
        return await agent.handle_message(message)
```

### Task Proxy Implementation

```python
# proxy_agent_platform/agents/task_proxy.py

from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from .base import BaseProxyAgent

class TaskCaptureRequest(BaseModel):
    """Request model for task capture."""
    input: str = Field(..., description="Task description or voice input")
    input_type: str = Field(default="text", description="Type of input")
    context: Optional[dict] = Field(default=None, description="Additional context")

class TaskResponse(BaseModel):
    """Response model for task operations."""
    task_id: str
    title: str
    description: str
    priority: str
    estimated_duration: str
    category: str
    tags: List[str]
    due_date: Optional[datetime]
    agent_suggestions: dict

class TaskProxyAgent(BaseProxyAgent[TaskCaptureRequest]):
    """
    AI agent specialized in ultra-fast task capture and management.

    Capabilities:
    - 2-second task capture from natural language
    - Intelligent task categorization and prioritization
    - Smart scheduling based on user patterns
    - Context-aware task suggestions
    """

    def __init__(self):
        super().__init__("task_proxy", "gpt-4")
        self._setup_agent_tools()

    def _setup_agent_tools(self):
        """Configure the PydanticAI agent with task-specific tools."""

        @self.agent.tool
        async def categorize_task(description: str) -> str:
            """Categorize a task based on its description."""
            # Implementation for task categorization
            pass

        @self.agent.tool
        async def estimate_duration(description: str) -> str:
            """Estimate how long a task will take."""
            # Implementation for duration estimation
            pass

        @self.agent.tool
        async def suggest_schedule(task_id: str) -> dict:
            """Suggest optimal scheduling for a task."""
            # Implementation for scheduling suggestions
            pass

    async def process_request(self, request: TaskCaptureRequest) -> TaskResponse:
        """
        Process a task capture request with 2-second target response time.
        """
        start_time = datetime.now()

        # Use AI to process the natural language input
        result = await self.agent.run(
            f"Parse this task request and extract structured information: {request.input}",
            message_history=[]
        )

        # Create task in database
        task = await self._create_task(result.data, request.context)

        # Get intelligent suggestions
        suggestions = await self._get_suggestions(task)

        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        return TaskResponse(
            task_id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            estimated_duration=task.estimated_duration,
            category=task.category,
            tags=task.tags,
            due_date=task.due_date,
            agent_suggestions=suggestions
        )

    async def get_capabilities(self) -> List[str]:
        """Return capabilities of the Task Proxy Agent."""
        return [
            "ultra_fast_capture",
            "natural_language_processing",
            "intelligent_categorization",
            "duration_estimation",
            "smart_scheduling",
            "context_awareness"
        ]
```

### Learning Engine

```python
# proxy_agent_platform/learning/analytics_engine.py

from typing import List, Dict, Any
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from .pattern_analyzer import PatternAnalyzer

class AnalyticsEngine:
    """
    AI-powered analytics engine for productivity insights.

    Analyzes user behavior patterns and provides personalized
    recommendations for productivity optimization.
    """

    def __init__(self):
        self.pattern_analyzer = PatternAnalyzer()
        self.energy_predictor = RandomForestRegressor()
        self.focus_optimizer = None
        self._models_trained = False

    async def analyze_user_patterns(
        self,
        user_id: str,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """
        Analyze user patterns over a specified period.

        Returns insights about:
        - Energy patterns throughout the day
        - Most productive times
        - Focus session effectiveness
        - Task completion patterns
        """
        # Fetch user data
        user_data = await self._fetch_user_data(user_id, period_days)

        # Analyze patterns
        energy_patterns = await self.pattern_analyzer.analyze_energy(user_data)
        focus_patterns = await self.pattern_analyzer.analyze_focus(user_data)
        task_patterns = await self.pattern_analyzer.analyze_tasks(user_data)

        return {
            "energy_patterns": energy_patterns,
            "focus_patterns": focus_patterns,
            "task_patterns": task_patterns,
            "recommendations": await self._generate_recommendations(
                energy_patterns, focus_patterns, task_patterns
            )
        }

    async def predict_energy_levels(
        self,
        user_id: str,
        hours_ahead: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Predict user energy levels for the next few hours.

        Uses machine learning models trained on user's historical
        energy data and contextual factors.
        """
        if not self._models_trained:
            await self._train_models(user_id)

        predictions = []
        current_time = datetime.now()

        for hour in range(1, hours_ahead + 1):
            future_time = current_time + timedelta(hours=hour)
            features = await self._extract_features(user_id, future_time)

            predicted_energy = self.energy_predictor.predict([features])[0]
            confidence = self._calculate_confidence(features)

            predictions.append({
                "time": future_time.isoformat(),
                "predicted_level": round(predicted_energy, 1),
                "confidence": round(confidence, 2)
            })

        return predictions
```

### Workflow System

```python
# proxy_agent_platform/workflows/engine.py

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import asyncio
from .schema import WorkflowDefinition, WorkflowStep, WorkflowResult

class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

@dataclass
class WorkflowExecution:
    """Represents a running workflow execution."""
    workflow_id: str
    status: WorkflowStatus
    current_step: int
    context: Dict[str, Any]
    start_time: datetime
    end_time: Optional[datetime] = None
    error: Optional[str] = None

class WorkflowEngine:
    """
    Orchestrates complex multi-step workflows with AI agent coordination.

    Capabilities:
    - Hierarchical workflow execution
    - Agent coordination and communication
    - Error handling and recovery
    - Progress tracking and reporting
    """

    def __init__(self):
        self.executions: Dict[str, WorkflowExecution] = {}
        self.agents = {}

    async def execute_workflow(
        self,
        workflow_def: WorkflowDefinition,
        context: Optional[Dict[str, Any]] = None
    ) -> WorkflowResult:
        """
        Execute a workflow definition with the given context.
        """
        execution_id = str(uuid4())
        execution = WorkflowExecution(
            workflow_id=workflow_def.id,
            status=WorkflowStatus.RUNNING,
            current_step=0,
            context=context or {},
            start_time=datetime.now()
        )

        self.executions[execution_id] = execution

        try:
            for step_index, step in enumerate(workflow_def.steps):
                execution.current_step = step_index
                await self._execute_step(step, execution)

                # Check for pauses or cancellations
                if execution.status == WorkflowStatus.PAUSED:
                    break

            execution.status = WorkflowStatus.COMPLETED
            execution.end_time = datetime.now()

        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            execution.error = str(e)
            execution.end_time = datetime.now()
            raise

        return WorkflowResult(
            execution_id=execution_id,
            status=execution.status,
            duration_seconds=(execution.end_time - execution.start_time).total_seconds(),
            context=execution.context,
            error=execution.error
        )
```

## 🤖 Agent Development

### Creating a New Agent

To create a new proxy agent, follow these steps:

#### 1. Define Request/Response Models

```python
# proxy_agent_platform/agents/my_agent.py

from pydantic import BaseModel, Field
from typing import List, Optional

class MyAgentRequest(BaseModel):
    """Request model for MyAgent operations."""
    input_data: str = Field(..., description="Input data to process")
    options: Optional[dict] = Field(default=None, description="Processing options")

class MyAgentResponse(BaseModel):
    """Response model for MyAgent operations."""
    result: str
    confidence: float
    suggestions: List[str]
```

#### 2. Implement the Agent

```python
from .base import BaseProxyAgent

class MyProxyAgent(BaseProxyAgent[MyAgentRequest]):
    """
    Custom proxy agent for [specific functionality].

    Capabilities:
    - [List key capabilities]
    """

    def __init__(self):
        super().__init__("my_agent", "gpt-4")
        self._setup_tools()

    def _setup_tools(self):
        """Set up PydanticAI tools for this agent."""

        @self.agent.tool
        async def my_tool(input: str) -> str:
            """Tool description."""
            # Implementation
            return "result"

    async def process_request(self, request: MyAgentRequest) -> MyAgentResponse:
        """Process requests for this agent."""
        # Use self.agent.run() to process with AI
        result = await self.agent.run(
            f"Process this request: {request.input_data}"
        )

        return MyAgentResponse(
            result=result.data,
            confidence=0.95,
            suggestions=["suggestion1", "suggestion2"]
        )

    async def get_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return ["capability1", "capability2"]
```

#### 3. Register the Agent

```python
# proxy_agent_platform/agents/__init__.py

from .registry import AgentRegistry
from .my_agent import MyProxyAgent

# Register the agent
AgentRegistry.register_agent("my_agent", MyProxyAgent)
```

#### 4. Add API Endpoints

```python
# proxy_agent_platform/api/agents/my_agent.py

from fastapi import APIRouter, HTTPException, Depends
from ...agents.my_agent import MyAgentRequest, MyAgentResponse
from ...agents.registry import AgentRegistry

router = APIRouter(prefix="/my-agent", tags=["my-agent"])

@router.post("/process", response_model=MyAgentResponse)
async def process_request(request: MyAgentRequest):
    """Process a request with MyAgent."""
    try:
        agent = await AgentRegistry.get_agent("my_agent")
        return await agent.process_request(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 5. Write Tests

```python
# tests/agents/test_my_agent.py

import pytest
from proxy_agent_platform.agents.my_agent import MyProxyAgent, MyAgentRequest

@pytest.mark.asyncio
class TestMyProxyAgent:

    @pytest.fixture
    async def agent(self):
        return MyProxyAgent()

    async def test_process_request(self, agent):
        """Test basic request processing."""
        request = MyAgentRequest(input_data="test input")
        response = await agent.process_request(request)

        assert response.result is not None
        assert response.confidence > 0
        assert len(response.suggestions) > 0

    async def test_capabilities(self, agent):
        """Test agent capabilities."""
        capabilities = await agent.get_capabilities()
        assert isinstance(capabilities, list)
        assert len(capabilities) > 0
```

### Agent Communication

Agents can communicate with each other using the messaging system:

```python
# In any agent
async def collaborate_with_other_agent(self, data: dict):
    """Example of inter-agent communication."""

    # Send message to Task Proxy
    task_response = await self.communicate_with_agent(
        "task_proxy",
        {
            "action": "create_task",
            "data": {
                "title": "Follow up on analysis",
                "description": "Review results from my analysis",
                "priority": "medium"
            }
        }
    )

    # Send message to Energy Proxy
    energy_response = await self.communicate_with_agent(
        "energy_proxy",
        {
            "action": "get_current_level",
            "user_id": "user_123"
        }
    )

    return {
        "task_created": task_response,
        "energy_level": energy_response
    }
```

### Best Practices for Agent Development

#### 1. Keep Agents Focused
Each agent should have a clear, specific purpose:
- ✅ TaskProxy handles task management
- ✅ FocusProxy handles focus sessions
- ❌ Don't create a "GeneralProductivityAgent"

#### 2. Use Type Hints Everywhere
```python
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

async def process_data(
    input_data: List[str],
    options: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Always use type hints for clarity and IDE support."""
    pass
```

#### 3. Handle Errors Gracefully
```python
async def process_request(self, request: MyRequest) -> MyResponse:
    try:
        result = await self.agent.run(request.input)
        return MyResponse(result=result.data)
    except Exception as e:
        logger.error(f"Agent processing failed: {e}")
        return MyResponse(
            result="",
            error=f"Processing failed: {str(e)}"
        )
```

#### 4. Make Agents Testable
```python
# Separate logic from AI calls for easier testing
async def process_request(self, request: MyRequest) -> MyResponse:
    # Validate input
    validated_data = self._validate_input(request)

    # Process with AI
    ai_result = await self._call_ai(validated_data)

    # Post-process result
    final_result = self._post_process(ai_result)

    return MyResponse(result=final_result)

def _validate_input(self, request: MyRequest) -> dict:
    """Testable validation logic."""
    # Implementation
    pass

def _post_process(self, ai_result: str) -> str:
    """Testable post-processing logic."""
    # Implementation
    pass
```

## 🧪 Testing Guidelines

### Test Structure

Follow the project's testing conventions:

```
tests/
├── agents/                    # Agent-specific tests
│   ├── test_task_proxy.py
│   ├── test_focus_proxy.py
│   └── test_my_agent.py
├── api/                       # API endpoint tests
│   ├── test_auth.py
│   └── test_agents_api.py
├── integration/               # Integration tests
│   ├── test_agent_communication.py
│   └── test_workflow_execution.py
├── learning/                  # Learning engine tests
│   ├── test_analytics.py
│   └── test_pattern_analysis.py
├── conftest.py               # Shared test fixtures
└── utils/                    # Test utilities
    ├── test_helpers.py
    └── mock_data.py
```

### Writing Effective Tests

#### Unit Tests
```python
import pytest
from unittest.mock import Mock, patch
from proxy_agent_platform.agents.task_proxy import TaskProxyAgent, TaskCaptureRequest

@pytest.mark.asyncio
class TestTaskProxyAgent:

    @pytest.fixture
    async def agent(self):
        """Create agent instance for testing."""
        return TaskProxyAgent()

    @pytest.fixture
    def sample_request(self):
        """Sample request for testing."""
        return TaskCaptureRequest(
            input="Review quarterly reports by Friday",
            input_type="text",
            context={"location": "office"}
        )

    async def test_task_capture_success(self, agent, sample_request):
        """Test successful task capture."""
        response = await agent.process_request(sample_request)

        assert response.task_id is not None
        assert response.title == "Review quarterly reports"
        assert response.priority in ["low", "medium", "high", "urgent"]
        assert "quarterly" in response.tags

    async def test_task_capture_with_invalid_input(self, agent):
        """Test task capture with invalid input."""
        request = TaskCaptureRequest(input="", input_type="text")

        with pytest.raises(ValueError, match="Input cannot be empty"):
            await agent.process_request(request)

    @patch('proxy_agent_platform.agents.task_proxy.AI_CLIENT')
    async def test_task_capture_ai_failure(self, mock_ai, agent, sample_request):
        """Test handling of AI service failures."""
        mock_ai.run.side_effect = Exception("AI service unavailable")

        response = await agent.process_request(sample_request)
        assert response.error is not None
        assert "AI service" in response.error
```

#### Integration Tests
```python
import pytest
from httpx import AsyncClient
from proxy_agent_platform.api.main import app

@pytest.mark.asyncio
class TestAgentIntegration:

    @pytest.fixture
    async def client(self):
        """Create test client."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client

    @pytest.fixture
    async def authenticated_headers(self, client):
        """Get authentication headers."""
        # Login and get token
        response = await client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "testpass"
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    async def test_task_capture_flow(self, client, authenticated_headers):
        """Test complete task capture flow."""
        # Capture task
        response = await client.post(
            "/agents/task/capture",
            json={
                "input": "Review quarterly reports",
                "input_type": "text"
            },
            headers=authenticated_headers
        )

        assert response.status_code == 200
        task_data = response.json()
        assert task_data["task_id"] is not None

        # Verify task was created
        response = await client.get(
            f"/agents/task/tasks/{task_data['task_id']}",
            headers=authenticated_headers
        )

        assert response.status_code == 200
        assert response.json()["title"] == "Review quarterly reports"
```

#### Performance Tests
```python
import pytest
import time
from proxy_agent_platform.agents.task_proxy import TaskProxyAgent, TaskCaptureRequest

@pytest.mark.asyncio
class TestTaskProxyPerformance:

    async def test_2_second_capture_target(self):
        """Test that task capture meets 2-second target."""
        agent = TaskProxyAgent()
        request = TaskCaptureRequest(
            input="Review quarterly reports by Friday",
            input_type="text"
        )

        start_time = time.time()
        response = await agent.process_request(request)
        end_time = time.time()

        processing_time = end_time - start_time
        assert processing_time < 2.0, f"Task capture took {processing_time:.2f}s, target is <2s"
        assert response.task_id is not None
```

### Test Configuration

Configure pytest in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--strict-config",
    "--cov=proxy_agent_platform",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-report=xml",
]
asyncio_mode = "auto"
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
    "performance: marks tests as performance tests",
]
```

### Running Tests

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/agents/test_task_proxy.py

# Run with coverage
uv run pytest --cov=proxy_agent_platform --cov-report=html

# Run only unit tests
uv run pytest -m unit

# Run only fast tests
uv run pytest -m "not slow"

# Run tests with verbose output
uv run pytest -v

# Run tests in parallel (with pytest-xdist)
uv run pytest -n auto
```

## 📏 Code Style and Standards

### Code Formatting

The project uses Ruff for code formatting and linting:

```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Fix linting issues
uv run ruff check --fix .

# Type checking
uv run mypy proxy_agent_platform/
```

### Coding Standards

#### Function Documentation
```python
def calculate_energy_score(
    current_level: int,
    historical_data: List[EnergyReading],
    context_factors: Dict[str, Any]
) -> float:
    """
    Calculate a normalized energy score based on current and historical data.

    Args:
        current_level: Current energy level (1-10)
        historical_data: List of historical energy readings
        context_factors: Environmental and personal context factors

    Returns:
        Normalized energy score between 0.0 and 1.0

    Raises:
        ValueError: If current_level is not between 1 and 10

    Example:
        >>> calculate_energy_score(8, historical_data, {"sleep_hours": 8})
        0.85
    """
    if not 1 <= current_level <= 10:
        raise ValueError("Current level must be between 1 and 10")

    # Implementation here
    pass
```

#### Class Documentation
```python
class EnergyPredictor:
    """
    Machine learning model for predicting user energy levels.

    This class implements a Random Forest regressor trained on user's
    historical energy data and contextual factors to predict future
    energy levels with confidence intervals.

    Attributes:
        model: Trained scikit-learn RandomForestRegressor
        feature_columns: List of feature column names
        is_trained: Whether the model has been trained

    Example:
        >>> predictor = EnergyPredictor()
        >>> await predictor.train(user_data)
        >>> prediction = await predictor.predict(features)
    """

    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100)
        self.feature_columns = []
        self.is_trained = False
```

#### Error Handling
```python
from proxy_agent_platform.exceptions import (
    AgentError,
    TaskCaptureError,
    EnergyPredictionError
)

async def capture_task(input_data: str) -> TaskResponse:
    """Capture a task with proper error handling."""
    try:
        # Validate input
        if not input_data.strip():
            raise TaskCaptureError("Task input cannot be empty")

        # Process with AI
        result = await ai_client.process(input_data)

        # Validate result
        if not result.data:
            raise TaskCaptureError("AI processing returned empty result")

        return TaskResponse(data=result.data)

    except AIServiceError as e:
        logger.error(f"AI service error in task capture: {e}")
        raise TaskCaptureError(f"AI processing failed: {e}") from e

    except DatabaseError as e:
        logger.error(f"Database error in task capture: {e}")
        raise TaskCaptureError(f"Failed to save task: {e}") from e

    except Exception as e:
        logger.error(f"Unexpected error in task capture: {e}")
        raise TaskCaptureError(f"Task capture failed: {e}") from e
```

### Naming Conventions

- **Variables and functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods**: `_leading_underscore`
- **Type aliases**: `PascalCase`

```python
# Good examples
user_energy_level = 8
class TaskProxyAgent: pass
MAX_RETRY_ATTEMPTS = 3
def _validate_input(): pass
UserDataType = Dict[str, Any]
```

### Pre-commit Hooks

The project uses pre-commit hooks to enforce standards:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.1
    hooks:
      - id: mypy
        additional_dependencies: [types-all]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

## 🗄️ Database Management

### Database Schema

The platform uses PostgreSQL with SQLAlchemy for data persistence:

```python
# proxy_agent_platform/models/base.py

from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class BaseModel(Base):
    """Base model with common fields."""
    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### Task Model
```python
# proxy_agent_platform/models/task.py

from sqlalchemy import Column, String, Integer, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import BaseModel
import enum

class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Task(BaseModel):
    __tablename__ = "tasks"

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, index=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM, index=True)
    category = Column(String(100), index=True)
    tags = Column(JSONB)
    estimated_duration_minutes = Column(Integer)
    actual_duration_minutes = Column(Integer)
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    energy_required = Column(Integer)  # 1-10 scale
    focus_type = Column(String(50))  # "deep_work", "quick_task", "collaborative"
    context = Column(JSONB)  # Additional context and metadata
```

### Database Migrations

Use Alembic for database migrations:

```bash
# Create a new migration
uv run alembic revision --autogenerate -m "Add energy tracking fields"

# Apply migrations
uv run alembic upgrade head

# Downgrade to previous migration
uv run alembic downgrade -1

# View migration history
uv run alembic history

# View current revision
uv run alembic current
```

#### Sample Migration
```python
# alembic/versions/001_add_energy_tracking.py

"""Add energy tracking fields

Revision ID: abc123
Revises: xyz789
Create Date: 2024-10-07 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers
revision = 'abc123'
down_revision = 'xyz789'
branch_labels = None
depends_on = None

def upgrade():
    # Add energy_logs table
    op.create_table(
        'energy_logs',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('level', sa.Integer, nullable=False),
        sa.Column('context', JSONB),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Add indexes
    op.create_index('ix_energy_logs_user_id', 'energy_logs', ['user_id'])
    op.create_index('ix_energy_logs_created_at', 'energy_logs', ['created_at'])

def downgrade():
    op.drop_table('energy_logs')
```

### Database Queries

Use SQLAlchemy's async support for database operations:

```python
# proxy_agent_platform/database/repositories/task_repository.py

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from ..models.task import Task, TaskStatus

class TaskRepository:
    """Repository for task database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, task_data: dict) -> Task:
        """Create a new task."""
        task = Task(**task_data)
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get_task_by_id(self, task_id: UUID) -> Optional[Task]:
        """Get a task by ID."""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        return result.scalar_one_or_none()

    async def get_user_tasks(
        self,
        user_id: UUID,
        status: Optional[TaskStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Task]:
        """Get tasks for a user with optional filtering."""
        query = select(Task).where(Task.user_id == user_id)

        if status:
            query = query.where(Task.status == status)

        query = query.offset(offset).limit(limit).order_by(Task.created_at.desc())

        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_task(self, task_id: UUID, updates: dict) -> Optional[Task]:
        """Update a task."""
        task = await self.get_task_by_id(task_id)
        if not task:
            return None

        for key, value in updates.items():
            setattr(task, key, value)

        await self.session.commit()
        await self.session.refresh(task)
        return task
```

### Connection Management

```python
# proxy_agent_platform/database/connection.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ..config import get_settings

settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create session factory
async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db_session() -> AsyncSession:
    """Dependency for getting database sessions."""
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
```

## 🌐 API Development

### FastAPI Structure

The API is structured using FastAPI routers:

```python
# proxy_agent_platform/api/main.py

from fastapi import FastAPI, Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .routers import agents, auth, dashboard, mobile
from .middleware import AuthenticationMiddleware, LoggingMiddleware

app = FastAPI(
    title="Proxy Agent Platform API",
    description="AI-powered personal productivity platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthenticationMiddleware)
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(auth.router, prefix="/v1/auth", tags=["authentication"])
app.include_router(agents.router, prefix="/v1/agents", tags=["agents"])
app.include_router(dashboard.router, prefix="/v1/dashboard", tags=["dashboard"])
app.include_router(mobile.router, prefix="/v1/mobile", tags=["mobile"])

@app.get("/")
async def root():
    return {"message": "Proxy Agent Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}
```

### Router Implementation

```python
# proxy_agent_platform/api/routers/agents.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from ...agents.registry import AgentRegistry
from ...agents.task_proxy import TaskCaptureRequest, TaskResponse
from ...auth import get_current_user
from ...models.user import User

router = APIRouter()

@router.post("/task/capture", response_model=TaskResponse)
async def capture_task(
    request: TaskCaptureRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Capture a task using the Task Proxy Agent.

    Provides 2-second task capture from natural language input
    with intelligent categorization and scheduling suggestions.
    """
    try:
        agent = await AgentRegistry.get_agent("task_proxy")

        # Add user context to request
        request.context = request.context or {}
        request.context["user_id"] = str(current_user.id)

        # Process request
        response = await agent.process_request(request)

        # Schedule background analytics update
        background_tasks.add_task(
            update_user_analytics,
            current_user.id,
            "task_captured"
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Task capture failed: {str(e)}"
        )

@router.get("/task/tasks", response_model=List[TaskResponse])
async def get_tasks(
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Get user's tasks with optional filtering."""
    try:
        agent = await AgentRegistry.get_agent("task_proxy")
        return await agent.get_user_tasks(
            user_id=current_user.id,
            status=status,
            limit=limit,
            offset=offset
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve tasks: {str(e)}"
        )
```

### WebSocket Implementation

```python
# proxy_agent_platform/api/websocket.py

from fastapi import WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
import json
from ..auth import get_current_user_from_token

class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a new WebSocket for a user."""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a WebSocket for a user."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, message: dict):
        """Send a message to all connections for a user."""
        if user_id in self.active_connections:
            disconnected = set()

            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    disconnected.add(connection)

            # Clean up disconnected connections
            for connection in disconnected:
                self.active_connections[user_id].discard(connection)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
):
    """WebSocket endpoint for real-time updates."""
    try:
        # Authenticate user from token
        user = await get_current_user_from_token(token)
        user_id = str(user.id)

        await manager.connect(websocket, user_id)

        try:
            while True:
                # Receive messages from client
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle different message types
                if message.get("type") == "subscribe":
                    await handle_subscription(user_id, message.get("channels", []))
                elif message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))

        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)

    except Exception as e:
        await websocket.close(code=1008, reason=f"Authentication failed: {e}")

async def handle_subscription(user_id: str, channels: List[str]):
    """Handle WebSocket subscription to specific channels."""
    # Store user's channel subscriptions
    # This would typically be stored in Redis for multi-server setups
    pass
```

### API Documentation

Use FastAPI's automatic documentation features:

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

class TaskCaptureRequest(BaseModel):
    """Request model for task capture with comprehensive documentation."""

    input: str = Field(
        ...,
        description="Natural language description of the task",
        example="Review quarterly reports and prepare summary for board meeting"
    )
    input_type: str = Field(
        default="text",
        description="Type of input provided",
        enum=["text", "voice", "image"]
    )
    context: Optional[dict] = Field(
        default=None,
        description="Additional context about the task",
        example={
            "location": "office",
            "energy_level": 8,
            "urgency": "high"
        }
    )

@router.post(
    "/task/capture",
    response_model=TaskResponse,
    summary="Capture a new task",
    description="Captures a task from natural language input in under 2 seconds",
    response_description="Structured task information with AI-generated insights",
    responses={
        200: {
            "description": "Task captured successfully",
            "content": {
                "application/json": {
                    "example": {
                        "task_id": "123e4567-e89b-12d3-a456-426614174000",
                        "title": "Review quarterly reports",
                        "priority": "high",
                        "estimated_duration": "2h"
                    }
                }
            }
        },
        400: {"description": "Invalid input provided"},
        401: {"description": "Authentication required"},
        500: {"description": "Internal server error"}
    }
)
async def capture_task(request: TaskCaptureRequest):
    """Endpoint implementation."""
    pass
```

## 📱 Frontend Integration

### React Components

Example React components for integrating with the API:

```typescript
// components/TaskCapture.tsx

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { captureTask } from '../api/tasks';

interface TaskCaptureProps {
  onTaskCaptured?: (task: Task) => void;
}

export function TaskCapture({ onTaskCaptured }: TaskCaptureProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const queryClient = useQueryClient();

  const captureMutation = useMutation({
    mutationFn: captureTask,
    onSuccess: (task) => {
      setInput('');
      onTaskCaptured?.(task);
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await captureMutation.mutateAsync({
      input: input.trim(),
      input_type: 'text',
      context: {
        location: 'web_app',
        timestamp: new Date().toISOString(),
      },
    });
  };

  const startVoiceCapture = async () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  return (
    <form onSubmit={handleSubmit} className="task-capture">
      <div className="input-group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="task-input"
          disabled={captureMutation.isLoading}
        />

        <button
          type="button"
          onClick={startVoiceCapture}
          className="voice-button"
          disabled={isRecording || captureMutation.isLoading}
        >
          🎤
        </button>

        <button
          type="submit"
          className="submit-button"
          disabled={!input.trim() || captureMutation.isLoading}
        >
          {captureMutation.isLoading ? '⏳' : '✓'}
        </button>
      </div>

      {captureMutation.error && (
        <div className="error-message">
          Failed to capture task: {captureMutation.error.message}
        </div>
      )}
    </form>
  );
}
```

### WebSocket Hook

```typescript
// hooks/useWebSocket.ts

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const subscribe = (channels: string[]) => {
    sendMessage({
      type: 'subscribe',
      channels,
    });
  };

  return {
    isConnected,
    messages,
    sendMessage,
    subscribe,
  };
}
```

## 🚀 Deployment and DevOps

### Docker Configuration

```dockerfile
# Dockerfile

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy project
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uv", "run", "uvicorn", "proxy_agent_platform.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/proxy_agent
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=proxy_agent
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4

    - name: Install UV
      run: curl -LsSf https://astral.sh/uv/install.sh | sh

    - name: Install dependencies
      run: uv sync

    - name: Run linting
      run: uv run ruff check .

    - name: Run type checking
      run: uv run mypy proxy_agent_platform/

    - name: Run tests
      run: uv run pytest --cov=proxy_agent_platform --cov-report=xml
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Deploy to production
      run: |
        # Add deployment script here
        echo "Deploying to production..."
```

### Production Configuration

```python
# proxy_agent_platform/config/production.py

from .base import BaseSettings

class ProductionSettings(BaseSettings):
    """Production-specific settings."""

    debug: bool = False
    log_level: str = "INFO"

    # Database
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 40

    # Redis
    redis_url: str
    redis_max_connections: int = 50

    # Security
    secret_key: str
    cors_origins: list[str] = ["https://app.proxyagent.dev"]

    # External services
    openai_api_key: str
    anthropic_api_key: str

    # Monitoring
    sentry_dsn: str = ""
    datadog_api_key: str = ""

    class Config:
        env_file = ".env.production"
```

## 🤝 Contributing Guidelines

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `develop`
4. **Make your changes** following our coding standards
5. **Write tests** for new functionality
6. **Submit a pull request** to the `develop` branch

### Development Workflow

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/my-new-feature

# Create pull request on GitHub
```

### Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(agents): add energy prediction capabilities
fix(api): resolve task capture timeout issue
docs(readme): update installation instructions
test(agents): add unit tests for task proxy
```

### Pull Request Guidelines

1. **Fill out the PR template** completely
2. **Link related issues** using "Closes #123"
3. **Ensure all tests pass** before submitting
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Request review** from relevant team members

### Code Review Process

1. **Automated checks** must pass (CI, linting, tests)
2. **At least one approval** required from core team
3. **All conversations resolved** before merge
4. **Squash and merge** to maintain clean history

---

**Ready to contribute?** Check out our [good first issues](https://github.com/yourusername/proxy-agent-platform/labels/good%20first%20issue) or reach out to the team on [Discord](https://discord.gg/proxy-agent).

This developer guide provides everything you need to contribute effectively to the Proxy Agent Platform. For questions or clarification, please open an issue or contact the development team.
