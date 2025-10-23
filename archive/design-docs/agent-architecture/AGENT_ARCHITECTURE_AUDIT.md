# Agent Architecture Audit Report

## Executive Summary

The codebase has a **mixed architecture** with both legacy and modern patterns coexisting. There are 16 agent implementations with varying levels of sophistication. The system is transitioning toward a **Unified Agent pattern** with **Pydantic AI integration** but has significant legacy code that needs modernization.

---

## 1. AGENT TYPES & PATTERNS

### A. Current Agent Implementations (16 Total)

#### **Legacy Simple Agents (Basic BaseProxyAgent)**
1. **TaskAgent** (task_agent.py - 61 lines)
   - Pattern: BaseProxyAgent subclass
   - Features: Simple task capture with keyword matching
   - Modern?: No - rule-based, no AI integration
   - Config?: No YAML config

2. **FocusAgent** (focus_agent.py - 49 lines)
   - Pattern: BaseProxyAgent subclass
   - Features: Basic Pomodoro tracking
   - Modern?: No - hardcoded responses
   - Config?: No YAML config

#### **Modern Config-Driven Agents (Unified Pattern)**
3. **UnifiedAgent** (unified_agent.py - 340 lines) ✓ RECOMMENDED PATTERN
   - Pattern: Config-driven with Pydantic AI
   - Features:
     - YAML configuration support
     - Pydantic AI integration
     - Dynamic MCP server loading
     - Memory layer (vector embeddings)
     - System prompt templating
   - Modern?: YES - fully Pydantic AI based
   - Config?: Yes - task.yaml, focus.yaml, energy.yaml, etc.
   - **Status**: This is our target architecture

#### **Advanced Proxy Agents (Legacy with AI)**
4. **IntelligentTaskAgent** (task_proxy_intelligent.py - 1378 lines)
   - Pattern: BaseProxyAgent with embedded AI
   - Features:
     - OpenAI/Anthropic clients embedded
     - Task prioritization
     - Duration estimation
     - Context-aware processing
   - Modern?: Partially - uses AI but not Pydantic AI
   - Config?: No YAML, uses env vars
   - **Issue**: Large monolithic file, hardcoded AI logic

5. **AdvancedFocusAgent** (focus_proxy_advanced.py - 732 lines)
   - Pattern: BaseProxyAgent with embedded AI
   - Features: Adaptive Pomodoro, distraction tracking
   - Modern?: Partially - similar to IntelligentTaskAgent
   - Config?: No YAML config

6. **AdvancedEnergyAgent** (energy_proxy_advanced.py - 930 lines)
   - Pattern: BaseProxyAgent with embedded AI
   - Features: Energy level tracking, circadian analysis
   - Modern?: Partially
   - Config?: No YAML config

7. **AdvancedProgressAgent** (progress_proxy_advanced.py - 570 lines)
   - Pattern: BaseProxyAgent with embedded AI
   - Modern?: Partially
   - Config?: No YAML config

8. **AdvancedGamificationAgent** (gamification_proxy_advanced.py - 751 lines)
   - Pattern: BaseProxyAgent with embedded AI
   - Modern?: Partially
   - Config?: No YAML config

#### **Capture Mode Agents (Epic-7 Pattern)**
9. **CaptureAgent** (capture_agent.py - 348 lines) ✓ MODERN & KG-INTEGRATED
   - Pattern: Orchestrator pattern
   - Features:
     - Knowledge Graph integration (YES)
     - Decomposition pipeline
     - Classification pipeline
     - Multi-mode support (AUTO, MANUAL, CLARIFY)
   - Modern?: YES - uses Knowledge Graph
   - Config?: Partially - some YAML support
   - **KG Integration**: Active (get_context_for_query)

10. **DecomposerAgent** (decomposer_agent.py - 410 lines)
    - Pattern: BaseProxyAgent
    - Features: Recursive task decomposition
    - Modern?: Partially - has AI but not Pydantic AI
    - Config?: No
    - **KG Integration**: None

11. **ClassifierAgent** (classifier_agent.py - 308 lines)
    - Pattern: BaseProxyAgent
    - Features: DIGITAL vs HUMAN classification
    - Uses: IntegrationRegistry for automation detection
    - Modern?: Partially
    - Config?: No
    - **KG Integration**: None

12. **SplitProxyAgent** (split_proxy_agent.py - 346 lines)
    - Pattern: Standalone (not BaseProxyAgent)
    - Features: Task splitting, ADHD-optimized
    - Modern?: Partially - has fallback patterns
    - Config?: No YAML config
    - **KG Integration**: None

#### **Conversational Agents**
13. **ConversationalTaskAgent** (conversational_task_agent.py - 398 lines)
    - Pattern: Standalone (not BaseProxyAgent)
    - Features: Multi-turn task clarification
    - Modern?: Partially - state machine based
    - Config?: No
    - **KG Integration**: None

#### **Infrastructure Classes**
14. **AgentRegistry** (registry.py - 52 lines)
    - Purpose: Central agent discovery
    - **Status**: Simple dict-based, needs modernization

15. **IntegrationRegistry** (integration_registry.py - 308 lines)
    - Purpose: Maps task descriptions to automation capabilities
    - **Status**: Pattern-matching based, not AI-powered

#### **Base Classes**
16. **BaseProxyAgent** (base.py - 100 lines)
    - Purpose: Foundation for all proxy agents
    - Features:
      - Message storage
      - Conversation history
      - Request/response handling
    - **Status**: Solid foundation, but lacks config support

---

## 2. MODERN vs LEGACY PATTERNS

### Modern Pattern (2-3 agents)
```
UnifiedAgent:
├── YAML Configuration (AgentConfig)
├── Pydantic AI Integration
├── MCP Server Support
├── Memory Layer (Vector DB)
└── Dynamic System Prompt Templating
```

### Legacy Pattern (9-10 agents)
```
Advanced*Agent (e.g., AdvancedFocusAgent):
├── Embedded AI clients (openai.AsyncOpenAI directly)
├── Environment variable configuration (no validation)
├── Hardcoded repository dependencies
├── Large monolithic files (700+ lines)
└── No Pydantic validation
```

### Transitional Pattern (3-4 agents)
```
CaptureAgent:
├── Knowledge Graph integration
├── Orchestrator pattern (delegates to sub-agents)
├── Some AI integration
└── Partial config support
```

---

## 3. CONFIGURATION MANAGEMENT

### Current State

#### Configuration Files (6 YAML configs)
Location: `/config/agents/`

1. **task.yaml** (v1.0.0)
   - Model: claude-3-5-sonnet-20241022
   - MCP Servers: filesystem
   - Memory: enabled
   - Capabilities: task_creation, prioritization, breakdown

2. **focus.yaml** (v1.0.0)
   - Model: claude-3-5-sonnet-20241022
   - Tools: pomodoro_timer, distraction_tracker
   - Memory: enabled
   - Temperature: 0.6 (lower = focused)

3. **energy.yaml** (v1.0.0)
   - Model: claude-3-5-sonnet-20241022
   - Temperature: 0.5

4. **progress.yaml** (v1.0.0)
   - Model: claude-3-5-sonnet-20241022

5. **gamification.yaml** (v1.0.0)
   - Model: claude-3-5-sonnet-20241022

6. **task_quick_capture.yaml** (newer)
   - Quick capture specific config

#### Configuration Schema (agent_config_schema.py)
- **Well-designed Pydantic models**:
  - `AgentConfig`: Root configuration
  - `SystemPromptConfig`: Prompt templates with variables
  - `MemoryConfig`: Vector store settings
  - `MCPServerConfig`: MCP server definitions
  - `BehaviorConfig`: Temperature, max_tokens, etc.
  - `ModelProvider`: Enum (anthropic, openai, gemini, ollama)
  - `AgentType`: Enum (task, focus, energy, progress, gamification, unified)

#### Configuration Loader (config_loader.py)
- ✓ `ConfigLoader` class with singleton pattern
- ✓ YAML parsing with validation
- ✓ LRU caching for performance
- ✓ Configuration saving support
- ✓ File validation utilities

### Issues
1. **Inconsistent Coverage**: Only 6 YAML configs, but 16 agent implementations
2. **Advanced*Agent classes**: Still using env vars, not YAML
3. **No version management**: Config versioning not enforced
4. **No config inheritance**: Each config is independent

---

## 4. KNOWLEDGE GRAPH INTEGRATION

### Current Integration

#### Where KG is Used
1. **CaptureAgent** (PRIMARY)
   ```python
   kg_context = self.graph_service.get_context_for_query(
       input_text, user_id, max_entities=self.settings.kg_max_entities
   )
   ```
   - Method: `GraphService.get_context_for_query()`
   - Status: Fully integrated
   - Fallback: Graceful degradation if KG fails

#### GraphService Features
- Entity CRUD operations (people, devices, locations, projects)
- Relationship management
- Context retrieval for queries
- Entity extraction from text
- Formatting for LLM prompts

### Where KG Should Be Integrated (Missing)

#### High Priority (Would Add Value)
1. **UnifiedAgent**
   - Current: No KG integration
   - Should: Retrieve entity context before generating system prompt
   - Benefit: Entity-aware task understanding

2. **IntelligentTaskAgent**
   - Current: No KG integration
   - Should: Use KG to understand task dependencies
   - Benefit: Better prioritization with known relationships

3. **DecomposerAgent**
   - Current: No KG integration
   - Should: Reference entities in micro-steps
   - Benefit: Smarter decomposition based on known actors

4. **ClassifierAgent**
   - Current: Uses hardcoded IntegrationRegistry
   - Should: Could use KG to identify delegatable tasks to known contacts
   - Benefit: Better delegation mode suggestions

#### Medium Priority
5. **AdvancedFocusAgent**: Retrieve focus-related entities
6. **AdvancedEnergyAgent**: Track user-specific energy patterns with context
7. **ConversationalTaskAgent**: Reference known entities during clarification

### KG Architecture Review
- **Strength**: Clean entity/relationship model
- **Strength**: Proper isolation in separate service
- **Issue**: Not integrated into modern Unified pattern
- **Issue**: Not used in legacy Advanced* agents
- **Opportunity**: Could be central to improved decision-making

---

## 5. AGENT REGISTRY & DISCOVERY

### Current Registry Implementation

#### AgentRegistry (registry.py - 52 lines)
```python
class AgentRegistry:
    def __init__(self, db: DatabaseAdapter = None):
        self.agents: dict[str, BaseProxyAgent] = {
            "task": TaskAgent(self.db),
            "focus": FocusAgent(self.db),
            "capture": CaptureAgent(self.db),
            "decomposer": DecomposerAgent(self.db),
            "classifier": ClassifierAgent(self.db),
        }
```

#### Issues
1. **Hardcoded agent instantiation**: Not dynamic
2. **No config-driven registration**: Manual mapping
3. **Type checking**: Missing runtime validation
4. **Discovery**: No list_agents() for client-side capabilities

#### What's Missing
- Agent capabilities listing
- Runtime agent initialization from configs
- Agent health checks
- Agent versioning

---

## 6. PYDANTIC AI USAGE

### Current Usage

#### Fully Implemented (1 agent)
- **UnifiedAgent**: Uses Pydantic AI as core framework
  - Creates `Agent` instances from config
  - Uses `model_name` with provider prefix (e.g., "anthropic:claude-3-5-sonnet-20241022")
  - Passes system prompts dynamically
  - Supports model_settings (temperature, max_tokens)

#### Partial Usage (0 agents)
- No agents partially implement Pydantic AI

#### Not Using Pydantic AI (15 agents)
- Advanced* agents: Use raw OpenAI/Anthropic clients
- Basic agents: No AI at all
- Capture mode: Sub-agents don't use Pydantic AI

### Configuration Pattern in UnifiedAgent
```python
model_name = f"anthropic:{config.model_name}"
pydantic_agent = Agent(
    model_name,
    tools=mcp_tools,
)
result = await pydantic_agent.run(
    user_message,
    model_settings={
        "temperature": config.behavior.temperature,
        "max_tokens": config.behavior.max_tokens,
    },
    system_prompt=system_prompt,
)
```

---

## 7. BEST PRACTICES ALIGNMENT WITH CLAUDE.md

### ALIGNED (Following CLAUDE.md)
1. ✓ Pydantic models for validation (AgentConfig, etc.)
2. ✓ Type hints throughout
3. ✓ Configuration externalization (YAML)
4. ✓ Dependency injection (BaseProxyAgent constructor)
5. ✓ Error handling with logging
6. ✓ Modular architecture (separate agents per concern)

### NOT ALIGNED (Should Fix)
1. ✗ Config-driven pattern not universal (only UnifiedAgent)
2. ✗ AI clients hardcoded in Advanced* agents (not config-driven)
3. ✗ File sizes exceed 500 lines limit:
   - task_proxy_intelligent.py: 1378 lines
   - energy_proxy_advanced.py: 930 lines
   - gamification_proxy_advanced.py: 751 lines
   - focus_proxy_advanced.py: 732 lines
4. ✗ Missing Pydantic AI integration in most agents
5. ✗ No dependency injection for repositories in some classes
6. ✗ Large methods (some methods >50 lines)
7. ✗ No clear single responsibility in Advanced* agents

---

## 8. ISSUES & INCONSISTENCIES

### Critical Issues

#### 1. **Dual Agent Systems**
- **Problem**: Have both simple agents (TaskAgent, FocusAgent) AND advanced versions (IntelligentTaskAgent, AdvancedFocusAgent)
- **Impact**: Code duplication, confusion about which to use
- **Example**:
  - TaskAgent (61 lines, simple)
  - IntelligentTaskAgent (1378 lines, complex)

#### 2. **Inconsistent Configuration**
- **Problem**: 
  - UnifiedAgent uses YAML configs
  - Advanced* agents use environment variables
  - Basic agents hardcoded
- **Impact**: No unified configuration management
- **Example**:
  ```python
  # UnifiedAgent: uses YAML
  config = load_agent_config("task")
  
  # IntelligentTaskAgent: uses env vars
  self.ai_provider = os.getenv("LLM_PROVIDER", "openai")
  ```

#### 3. **Missing Agent Implementations for Configs**
- **Problem**: Have YAML configs for agents that don't exist
  - task_quick_capture.yaml → no agent class
- **Impact**: Configuration debt, unclear intent

#### 4. **Knowledge Graph Integration Asymmetry**
- **Problem**: Only CaptureAgent uses KG, but 15 other agents could benefit
- **Impact**: Other agents make decisions without entity context

#### 5. **Monolithic Advanced Agents**
- **Problem**: IntelligentTaskAgent (1378 lines), AdvancedEnergyAgent (930 lines)
- **Impact**: Hard to test, violate CLAUDE.md guidelines
- **Files violating CLAUDE.md 500-line limit**:
  - task_proxy_intelligent.py: 1378 lines
  - tests/test_task_proxy_intelligent.py: 968 lines
  - energy_proxy_advanced.py: 930 lines
  - gamification_proxy_advanced.py: 751 lines
  - focus_proxy_advanced.py: 732 lines

#### 6. **No Standard Tool Pattern**
- **Problem**: Each agent reinvents tool/capability definition
- **Impact**: No way to query agent capabilities at runtime

### High-Priority Issues

#### 7. **Registry is Hardcoded**
- **Problem**: AgentRegistry manually lists agents
- **Impact**: Adding agents requires code change, not config

#### 8. **Inconsistent Error Handling**
- Some agents catch exceptions, some don't
- Some use try/except, some don't validate inputs

#### 9. **No Agent Versioning**
- Agents have no version info in registry
- Config version field exists but unused

#### 10. **Memory Integration Inconsistent**
- UnifiedAgent: Integrates memory
- Advanced* agents: No memory integration
- Basic agents: No memory

---

## 9. RECOMMENDATIONS

### Phase 1: Immediate Actions (Week 1)

#### 1.1 Unify Configuration
**Action**: Migrate all Advanced* agents to YAML config-driven pattern
```yaml
# config/agents/intelligent_task.yaml
name: "Intelligent Task Agent"
type: "task"
model_provider: "anthropic"
model_name: "claude-3-5-sonnet-20241022"
behavior:
  temperature: 0.7
  max_tokens: 2000
capabilities:
  - "task_prioritization"
  - "duration_estimation"
```

**Impact**: 
- ✓ Consistent configuration
- ✓ Enable dynamic agent loading
- ✓ Follow CLAUDE.md guidelines

#### 1.2 Create YAML configs for missing agents
**Missing configs**:
- intelligent_task.yaml
- advanced_focus.yaml
- advanced_energy.yaml
- advanced_progress.yaml
- advanced_gamification.yaml
- split_proxy.yaml
- conversational_task.yaml

#### 1.3 Consolidate Duplicate Agents
**Action**: Decide one pattern per agent type
- Option A: Keep UnifiedAgent only, deprecate Basic* agents
- Option B: Keep Basic* for simple cases, migrate Advanced* to config
- **Recommendation**: Option A - move all to UnifiedAgent via config

### Phase 2: Architecture Modernization (Week 2-3)

#### 2.1 Migrate Advanced Agents to Pydantic AI
**Target**: Refactor Advanced* agents to use UnifiedAgent pattern
```python
# Instead of:
agent = IntelligentTaskAgent(db)

# Do:
agent = await UnifiedAgent.create("task")  # with enhanced config
```

**Benefits**:
- ✓ Reduce code by 70%
- ✓ Single maintenance point
- ✓ Consistent tool discovery
- ✓ Built-in memory support

#### 2.2 Split Monolithic Files
**Files to split**:
- task_proxy_intelligent.py (1378 lines) → break into:
  - task_agent_prioritization.py
  - task_agent_estimation.py
  - task_agent_context.py
- Similar for energy_proxy_advanced.py, gamification_proxy_advanced.py, etc.

#### 2.3 Implement Agent Factory
**Create**: `src/agents/agent_factory.py`
```python
class AgentFactory:
    @staticmethod
    async def create(agent_type: str, **overrides) -> UnifiedAgent:
        """Create agent from config with runtime overrides"""
        return await UnifiedAgent.create(agent_type, **overrides)
    
    @staticmethod
    def list_available() -> dict[str, AgentCapabilities]:
        """List all available agents with capabilities"""
        ...
```

**Replaces**: AgentRegistry with dynamic, config-driven approach

### Phase 3: Knowledge Graph Integration (Week 3)

#### 3.1 Integrate KG into UnifiedAgent
**Add to system prompt template**:
```yaml
system_prompt:
  template: |
    # Existing prompt...
    
    **Known Entities:**
    {kg_context}
  inject_kg: true
```

**Implementation**:
```python
# In UnifiedAgent.run()
if self.config.system_prompt.inject_kg:
    kg_context = self.graph_service.get_context_for_query(...)
    system_prompt = f"{system_prompt}\n{kg_context}"
```

#### 3.2 Extend KG-aware capabilities
**Enhance**:
- DecomposerAgent: Use KG to identify delegatable actors
- ClassifierAgent: Reference known integrations
- Task priority: Consider relationships in KG

#### 3.3 Add KG to initialization
```python
# In agent configs
knowledge_graph:
  enabled: true
  inject_in_prompt: true
  max_context_size: 1000
  entity_types: ["person", "project", "location"]
```

### Phase 4: Registry & Discovery (Week 4)

#### 4.1 Dynamic Agent Discovery
**Implement**:
```python
class AgentRegistry:
    def __init__(self, config_dir: Path = None):
        self.loader = ConfigLoader(config_dir)
        self.configs = self.loader.load_all_configs()
    
    async def create_agent(self, agent_type: str) -> UnifiedAgent:
        """Dynamically create agent from config"""
        return await UnifiedAgent.create(agent_type)
    
    def get_capabilities(self, agent_type: str) -> list[str]:
        """Get agent capabilities from config"""
        config = self.configs.get(agent_type)
        return config.capabilities if config else []
    
    def list_agents(self) -> dict[str, str]:
        """List all available agents with descriptions"""
        return {
            name: config.description 
            for name, config in self.configs.items()
        }
```

#### 4.2 Agent Health Checks
```python
class AgentRegistry:
    async def health_check(self, agent_type: str) -> dict:
        """Check if agent and its dependencies are healthy"""
        try:
            agent = await self.create_agent(agent_type)
            config = self.configs[agent_type]
            return {
                "status": "healthy",
                "agent": agent_type,
                "version": config.version,
                "capabilities": config.capabilities,
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
```

### Phase 5: Testing & Validation (Ongoing)

#### 5.1 Test Coverage
- ✓ Config loading and validation
- ✓ Agent creation from configs
- ✓ KG integration in all agents
- ✓ MCP server initialization
- ✓ Memory persistence

#### 5.2 Performance Benchmarks
- Config loading time
- Agent initialization time
- Memory footprint

---

## 10. MIGRATION PRIORITY MATRIX

### High Impact, Low Effort
1. ✓ Create YAML configs for existing agents
2. ✓ Migrate Advanced* agents to config-driven pattern
3. ✓ Update AgentRegistry to be dynamic

### High Impact, High Effort
4. ✓ Refactor monolithic files
5. ✓ Integrate Pydantic AI universally
6. ✓ Add KG to all agents

### Low Impact, Low Effort
7. ✓ Add agent health checks
8. ✓ Document agent capabilities

---

## 11. SUMMARY TABLE

| Agent | Pattern | Modern? | Config | KG | Pydantic AI | Lines | Priority |
|-------|---------|---------|--------|----|----|-------|----------|
| TaskAgent | Legacy Simple | No | No | No | No | 61 | Deprecate |
| FocusAgent | Legacy Simple | No | No | No | No | 49 | Deprecate |
| UnifiedAgent | Modern | YES | YAML | No* | YES | 340 | Keep |
| IntelligentTaskAgent | Legacy Advanced | Partial | No | No | No | 1378 | Migrate |
| AdvancedFocusAgent | Legacy Advanced | Partial | No | No | No | 732 | Migrate |
| AdvancedEnergyAgent | Legacy Advanced | Partial | No | No | No | 930 | Migrate |
| AdvancedProgressAgent | Legacy Advanced | Partial | No | No | No | 570 | Migrate |
| AdvancedGamificationAgent | Legacy Advanced | Partial | No | No | No | 751 | Migrate |
| CaptureAgent | Transitional | Partial | Partial | YES | No | 348 | Enhance |
| DecomposerAgent | Transitional | Partial | No | No | No | 410 | Migrate |
| ClassifierAgent | Transitional | Partial | No | No | No | 308 | Migrate |
| SplitProxyAgent | Standalone | Partial | No | No | No | 346 | Migrate |
| ConversationalTaskAgent | Standalone | Partial | No | No | No | 398 | Migrate |
| BaseProxyAgent | Foundation | Partial | No | No | No | 100 | Enhance |
| AgentRegistry | Infrastructure | No | No | No | No | 52 | Refactor |
| IntegrationRegistry | Infrastructure | No | No | No | No | 308 | Keep |

*UnifiedAgent could integrate KG but currently doesn't

---

## 12. FINAL RECOMMENDATIONS

### Top 3 Actions

1. **Consolidate to UnifiedAgent Pattern**
   - Create YAML config for each agent type
   - Migrate all Advanced* agents to use UnifiedAgent
   - Deprecate duplicate simple agents
   - **Benefit**: 70% code reduction, easier maintenance

2. **Integrate Knowledge Graph Universally**
   - Add KG context to UnifiedAgent system prompts
   - Enable KG-aware decision making in all agents
   - **Benefit**: Smarter task understanding and delegation

3. **Refactor Monolithic Files**
   - Break files >500 lines into focused modules
   - Follow CLAUDE.md guidelines strictly
   - **Benefit**: Better testability, maintainability

### Expected Outcomes
- **Code**: From 16+ agent implementations → 1 UnifiedAgent + configs
- **Configs**: From 6 YAML files → 10+ well-organized configs
- **Lines**: From ~7000 lines of agent code → ~2000 lines
- **KG Usage**: From 1 agent with KG → All agents KG-aware
- **Patterns**: From mixed patterns → Single unified pattern

---

