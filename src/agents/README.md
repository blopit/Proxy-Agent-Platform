# Source Agents

This directory contains the source implementations of various agent types and agent-related functionality for the Proxy Agent Platform.

## Overview

The src/agents directory provides concrete implementations of different agent types, including conversational agents, specialized proxy agents, and unified agent systems.

## Structure

```
agents/
├── __init__.py                    # Agents module initialization
├── adapter.py                     # Agent adapter patterns
├── base.py                       # Base agent implementations
├── conversational_task_agent.py  # Conversational task management
├── energy_proxy_advanced.py      # Advanced energy management
├── focus_agent.py                # Focus and attention management
├── focus_proxy_advanced.py       # Advanced focus optimization
├── gamification_proxy_advanced.py # Advanced gamification features
├── progress_proxy_advanced.py    # Advanced progress tracking
├── registry.py                   # Agent registry and discovery
├── task_agent.py                 # Core task management agent
├── task_proxy_intelligent.py     # Intelligent task processing
├── unified_agent.py              # Unified multi-capability agent
└── tests/                        # Agent-specific tests
```

## Agent Types

### Base Agents
- **Base Agent (base.py)**: Foundation classes and interfaces for all agents
- **Agent Adapter (adapter.py)**: Adapter patterns for agent integration
- **Agent Registry (registry.py)**: Agent discovery and management system

### Task Management Agents
- **Task Agent (task_agent.py)**: Core task management functionality
- **Conversational Task Agent**: Natural language task interaction
- **Intelligent Task Proxy**: Advanced task processing with AI

### Specialized Agents
- **Focus Agent (focus_agent.py)**: Attention and focus management
- **Energy Proxy Advanced**: Sophisticated energy tracking and optimization
- **Progress Proxy Advanced**: Comprehensive progress monitoring
- **Gamification Proxy Advanced**: Enhanced gamification features

### Unified Systems
- **Unified Agent (unified_agent.py)**: Multi-capability agent system
- **Agent Orchestration**: Coordination between multiple agents

## Agent Architecture

### Base Agent Interface
```python
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class BaseAgent(ABC):
    """Base interface for all agents"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.agent_id = self.generate_agent_id()
    
    @abstractmethod
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming requests"""
        pass
    
    @abstractmethod
    async def initialize(self) -> None:
        """Initialize agent resources"""
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        """Cleanup agent resources"""
        pass
```

### Agent Communication
```python
class AgentCommunication:
    """Handle inter-agent communication"""
    
    async def send_message(self, target_agent: str, message: Dict[str, Any]):
        """Send message to another agent"""
        pass
    
    async def broadcast_message(self, message: Dict[str, Any]):
        """Broadcast message to all agents"""
        pass
    
    async def subscribe_to_events(self, event_types: List[str]):
        """Subscribe to specific event types"""
        pass
```

## Agent Implementations

### Task Agent
```python
class TaskAgent(BaseAgent):
    """Core task management agent"""
    
    async def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task"""
        # Validate task data
        validated_data = self.validate_task_data(task_data)
        
        # Process with AI if needed
        enhanced_data = await self.enhance_task_data(validated_data)
        
        # Create task in database
        task = await self.task_repository.create(enhanced_data)
        
        return {"success": True, "task": task}
    
    async def update_task(self, task_id: str, updates: Dict[str, Any]):
        """Update existing task"""
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            return {"success": False, "error": "Task not found"}
        
        updated_task = await self.task_repository.update(task_id, updates)
        return {"success": True, "task": updated_task}
```

### Conversational Task Agent
```python
class ConversationalTaskAgent(TaskAgent):
    """Natural language task interaction"""
    
    async def process_natural_language(self, user_input: str) -> Dict[str, Any]:
        """Process natural language task requests"""
        # Parse intent from natural language
        intent = await self.nlp_processor.parse_intent(user_input)
        
        # Extract task information
        task_data = await self.extract_task_data(user_input, intent)
        
        # Route to appropriate action
        if intent.action == "create_task":
            return await self.create_task(task_data)
        elif intent.action == "update_task":
            return await self.update_task(task_data["id"], task_data)
        else:
            return {"success": False, "error": "Unknown intent"}
```

### Focus Agent
```python
class FocusAgent(BaseAgent):
    """Focus and attention management"""
    
    async def start_focus_session(self, duration: int, task_id: Optional[str] = None):
        """Start a focus session"""
        session = await self.create_focus_session(duration, task_id)
        
        # Set up environment
        await self.prepare_focus_environment()
        
        # Start monitoring
        await self.start_distraction_monitoring()
        
        return {"success": True, "session": session}
    
    async def handle_interruption(self, interruption_data: Dict[str, Any]):
        """Handle focus interruptions"""
        # Analyze interruption
        analysis = await self.analyze_interruption(interruption_data)
        
        # Decide on response
        if analysis.severity == "low":
            await self.defer_interruption(interruption_data)
        elif analysis.severity == "high":
            await self.pause_focus_session()
        
        return {"handled": True, "action": analysis.recommended_action}
```

## Agent Registry

### Agent Discovery
```python
class AgentRegistry:
    """Manage agent discovery and lifecycle"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_capabilities: Dict[str, List[str]] = {}
    
    async def register_agent(self, agent: BaseAgent):
        """Register a new agent"""
        self.agents[agent.agent_id] = agent
        self.agent_capabilities[agent.agent_id] = agent.get_capabilities()
        
        await agent.initialize()
    
    async def find_agent_by_capability(self, capability: str) -> List[BaseAgent]:
        """Find agents with specific capability"""
        matching_agents = []
        for agent_id, capabilities in self.agent_capabilities.items():
            if capability in capabilities:
                matching_agents.append(self.agents[agent_id])
        return matching_agents
    
    async def route_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Route request to appropriate agent"""
        required_capability = request.get("capability")
        agents = await self.find_agent_by_capability(required_capability)
        
        if not agents:
            return {"success": False, "error": "No capable agent found"}
        
        # Use first available agent (could implement load balancing)
        agent = agents[0]
        return await agent.process_request(request)
```

## Agent Testing

### Unit Testing
```python
class TestTaskAgent:
    @pytest.fixture
    def task_agent(self):
        config = {"database_url": "sqlite:///:memory:"}
        return TaskAgent(config)
    
    async def test_create_task(self, task_agent):
        """Test task creation"""
        task_data = {
            "title": "Test task",
            "description": "Test description",
            "priority": "medium"
        }
        
        result = await task_agent.create_task(task_data)
        
        assert result["success"] is True
        assert result["task"]["title"] == "Test task"
```

### Integration Testing
```python
class TestAgentIntegration:
    async def test_agent_communication(self):
        """Test communication between agents"""
        task_agent = TaskAgent(test_config)
        focus_agent = FocusAgent(test_config)
        
        # Create task
        task_result = await task_agent.create_task(test_task_data)
        
        # Start focus session for task
        focus_result = await focus_agent.start_focus_session(
            duration=1500,
            task_id=task_result["task"]["id"]
        )
        
        assert focus_result["success"] is True
        assert focus_result["session"]["task_id"] == task_result["task"]["id"]
```

## Agent Configuration

### Configuration Schema
```yaml
agents:
  task_agent:
    enabled: true
    max_concurrent_requests: 10
    nlp_processing: true
    auto_categorization: true
  
  focus_agent:
    enabled: true
    default_session_duration: 1500  # 25 minutes
    distraction_monitoring: true
    environment_optimization: true
  
  unified_agent:
    enabled: true
    sub_agents: ["task", "focus", "energy", "progress"]
    coordination_strategy: "intelligent"
```

### Runtime Configuration
```python
# Dynamic agent configuration
agent_config = {
    "task_agent": {
        "processing_timeout": 30,
        "batch_size": 100,
        "cache_enabled": True
    }
}

# Update agent configuration at runtime
await agent_registry.update_agent_config("task_agent", agent_config)
```

## Performance Optimization

### Caching Strategies
- Cache frequently accessed data
- Implement intelligent cache invalidation
- Use distributed caching for multi-instance deployments

### Resource Management
- Connection pooling for database access
- Memory management for large datasets
- Graceful degradation under load

### Monitoring
- Track agent performance metrics
- Monitor resource usage
- Alert on performance degradation

## Dependencies

- **PydanticAI**: Core agent framework
- **AsyncIO**: Asynchronous programming
- **SQLAlchemy**: Database integration
- **Pydantic**: Data validation
- **Logging**: Comprehensive logging
