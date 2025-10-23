# Agent Architecture Migration Roadmap

## Current State Visualization

```
CURRENT AGENT ECOSYSTEM (Mixed Patterns)

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  MODERN (1 agent)                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ UnifiedAgent (340 lines)                              │   │
│  │ ├─ YAML Config ✓                                      │   │
│  │ ├─ Pydantic AI ✓                                      │   │
│  │ ├─ MCP Servers ✓                                      │   │
│  │ ├─ Memory Layer ✓                                     │   │
│  │ └─ KG Integration ✗ (missing)                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  LEGACY ADVANCED (5 agents, ~3500 lines total)               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ AdvancedFocusAgent (732)                              │   │
│  │ AdvancedEnergyAgent (930)                             │   │
│  │ AdvancedProgressAgent (570)                           │   │
│  │ AdvancedGamificationAgent (751)                       │   │
│  │ IntelligentTaskAgent (1378)                           │   │
│  │ ├─ Env Var Config ✗                                  │   │
│  │ ├─ Pydantic AI ✗                                      │   │
│  │ ├─ Monolithic ✗ (>500 lines)                          │   │
│  │ └─ KG Integration ✗                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  LEGACY SIMPLE (2 agents, 110 lines total)                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ TaskAgent (61)                                        │   │
│  │ FocusAgent (49)                                       │   │
│  │ ├─ Hardcoded Responses ✗                             │   │
│  │ ├─ No AI ✗                                            │   │
│  │ └─ No Config ✗                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TRANSITIONAL (3 agents, ~1000 lines total)                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ CaptureAgent (348)                                    │   │
│  │ ├─ KG Integration ✓ (ONLY ONE!)                      │   │
│  │ ├─ Orchestrator Pattern ✓                             │   │
│  │ └─ Config Support (partial)                           │   │
│  │                                                        │   │
│  │ DecomposerAgent (410)                                 │   │
│  │ ClassifierAgent (308)                                 │   │
│  │ └─ No KG Integration ✗                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STANDALONE (2 agents, ~744 lines total)                      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ SplitProxyAgent (346)                                 │   │
│  │ ConversationalTaskAgent (398)                         │   │
│  │ └─ Not properly integrated ✗                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  INFRASTRUCTURE (2 classes, 360 lines total)                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ AgentRegistry (52) - Hardcoded                        │   │
│  │ IntegrationRegistry (308) - Pattern matching          │   │
│  │ BaseProxyAgent (100) - Foundation                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TOTAL: ~7000 lines of agent code across 16 implementations  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target State Visualization

```
UNIFIED AGENT ARCHITECTURE (Post-Migration)

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  SINGLE UNIFIED AGENT PATTERN (UnifiedAgent + Configs)         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ UnifiedAgent                                              │ │
│  │ ├─ Config System (ConfigLoader)                           │ │
│  │ ├─ Pydantic AI Backend                                    │ │
│  │ ├─ MCP Server Integration                                │ │
│  │ ├─ Memory Layer (Vector DB)                              │ │
│  │ ├─ Knowledge Graph Integration ✓                         │ │
│  │ └─ Tool Registry (Capabilities)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  AGENT CONFIGURATIONS (10+ YAML files)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ config/agents/                                            │ │
│  │ ├─ task.yaml                          (Pydantic AI)      │ │
│  │ ├─ focus.yaml                         (Pydantic AI)      │ │
│  │ ├─ energy.yaml                        (Pydantic AI)      │ │
│  │ ├─ progress.yaml                      (Pydantic AI)      │ │
│  │ ├─ gamification.yaml                  (Pydantic AI)      │ │
│  │ ├─ capture.yaml                       (Pydantic AI + KG) │ │
│  │ ├─ decomposer.yaml                    (Pydantic AI + KG) │ │
│  │ ├─ classifier.yaml                    (Pydantic AI + KG) │ │
│  │ ├─ split.yaml                         (Pydantic AI)      │ │
│  │ └─ conversational.yaml                (Pydantic AI)      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  SUPPORTING SERVICES                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AgentFactory (Dynamic Creation)                            │ │
│  │ AgentRegistry (Config-driven Discovery)                    │ │
│  │ GraphService (Knowledge Graph)                             │ │
│  │ IntegrationRegistry (Automation Patterns)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  TOTAL: ~2000 lines of code (70% reduction!)                   │
│  PATTERN: Single unified, config-driven architecture           │
│  KG INTEGRATION: All agents KG-aware                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Migration Path by Agent

### Phase 1: Immediate (Week 1) - No Breaking Changes

#### A. Create Configs for All Agents
Each Advanced*/Standalone agent needs a YAML config:

```
task_proxy_intelligent.py (1378 lines)
    ↓
config/agents/intelligent_task.yaml
├─ Model: claude-3-5-sonnet-20241022
├─ Tools: prioritization, estimation, context
├─ Capabilities: task_prioritization, duration_estimation, context_awareness
└─ Behavior: temperature 0.7, max_tokens 2000

focus_proxy_advanced.py (732 lines)
    ↓
config/agents/advanced_focus.yaml
├─ Tools: pomodoro_timer, distraction_tracker
├─ Capabilities: adaptive_pomodoro, distraction_tracking, focus_quality
└─ Behavior: temperature 0.6 (focused)

[Similar for energy, progress, gamification, split, conversational]
```

#### B. Update Configuration Schema
Add optional fields to support legacy agents:

```python
# In agent_config_schema.py
class RepositoryConfig(BaseModel):
    """Optional: Repository dependencies for advanced agents"""
    task_repo: bool = False
    project_repo: bool = False
    focus_session_repo: bool = False

class AgentConfig(BaseModel):
    ...
    legacy_repositories: Optional[RepositoryConfig] = None
```

### Phase 2: Transition (Week 2-3) - Create Adapters

#### Adapter Pattern
```python
# src/agents/adapters/intelligent_task_adapter.py
from src.agents.unified_agent import UnifiedAgent
from src.agents.task_proxy_intelligent import IntelligentTaskAgent

class IntelligentTaskAdapter(UnifiedAgent):
    """Adapter that wraps UnifiedAgent to provide IntelligentTaskAgent interface"""
    
    def __init__(self, db):
        super().__init__(await UnifiedAgent.create("intelligent_task"))
        self.db = db
```

**Benefits**:
- Existing code continues to work
- Gradual migration path
- No breaking changes during transition

### Phase 3: Code Consolidation (Week 3-4)

#### Files to Refactor

1. **task_proxy_intelligent.py (1378 → 0 lines)**
   ```
   Before: Monolithic agent with AI logic embedded
   After:  Configuration in YAML + UnifiedAgent
   
   Decompose into:
   - intelligent_task.yaml (config)
   - Features preserved in config + system prompt
   ```

2. **energy_proxy_advanced.py (930 → 0 lines)**
   - Move features to energy.yaml
   - Energy-specific tools as MCP servers or memory

3. **focus_proxy_advanced.py (732 → 0 lines)**
   - Move to focus.yaml with advanced tools

4. **gamification_proxy_advanced.py (751 → 0 lines)**
   - Move to gamification.yaml

5. **progress_proxy_advanced.py (570 → 0 lines)**
   - Move to progress.yaml

#### Features Preserved (Not Lost)
```
IntelligentTaskAgent features:
├─ Task prioritization (moved to system prompt)
├─ Duration estimation (moved to system prompt)
├─ AI provider selection (moved to config)
├─ Repository dependencies (moved to config)
└─ Context-aware processing (preserved in UnifiedAgent)

→ All preserved via:
  - System prompt templating
  - Tool definitions in MCP
  - Configuration system
  - Memory layer (for context)
```

### Phase 4: Knowledge Graph Integration (Week 4)

#### Add KG to All Agent Configs
```yaml
# config/agents/task.yaml
knowledge_graph:
  enabled: true
  inject_in_prompt: true
  max_entities: 10
  entity_types:
    - "person"      # For delegation/assignment
    - "project"     # For task organization
    - "location"    # For context awareness
    - "device"      # For IoT automation

system_prompt:
  template: |
    ...existing prompt...
    
    **Known Entities in Your Knowledge Graph:**
    {kg_context}
    
    Use these entities to make smarter decisions about task delegation
    and prioritization.
```

#### KG Integration Points
```
UnifiedAgent.run():
├─ Check config.knowledge_graph.enabled
├─ Call GraphService.get_context_for_query()
├─ Inject into system_prompt as {kg_context}
└─ Pass to Pydantic AI with full context

DecomposerAgent → Enhanced with KG:
├─ Identify entities mentioned in task
├─ Look up known relationships
├─ Suggest delegatable actors

ClassifierAgent → Enhanced with KG:
├─ Check known contacts for potential delegation
├─ Reference known integrations in KG
└─ Better automation suggestions
```

---

## Success Metrics

### Code Quality
- [ ] Reduce agent code from 7000 to 2000 lines (70% reduction)
- [ ] All agents follow CLAUDE.md guidelines
- [ ] No files >500 lines
- [ ] 100% Pydantic validation

### Architecture
- [ ] Single UnifiedAgent pattern used for all agents
- [ ] 10+ YAML configuration files
- [ ] Dynamic agent discovery from configs
- [ ] Config versioning enforced

### Knowledge Graph
- [ ] All agents KG-aware
- [ ] Entity context injected into prompts
- [ ] Better task understanding and delegation
- [ ] Entity extraction from tasks

### Testing
- [ ] Config loading tests
- [ ] Agent creation tests
- [ ] KG integration tests
- [ ] >80% code coverage

### Performance
- [ ] Config loading <100ms
- [ ] Agent creation <500ms
- [ ] KG context retrieval <200ms
- [ ] Memory footprint <50MB per agent

---

## File Organization (Target)

```
src/agents/
├── __init__.py
├── base.py                          (Keep: 100 lines)
├── unified_agent.py                 (Keep: 340 lines)
├── agent_factory.py                 (New: 150 lines)
├── agent_registry.py                (Refactor: 100 lines)
│
├── integrations/
│   ├── __init__.py
│   ├── integration_registry.py      (Keep: 308 lines)
│   └── automation_registry.py       (New: for tool discovery)
│
├── adapters/                         (Temporary, for migration)
│   ├── __init__.py
│   ├── intelligent_task_adapter.py
│   ├── advanced_focus_adapter.py
│   └── ... (one per legacy agent)
│
└── tests/
    ├── test_agent_factory.py
    ├── test_unified_agent.py
    ├── test_kg_integration.py
    └── ... (per agent/component)

config/agents/
├── task.yaml                        (Existing)
├── focus.yaml                       (Existing)
├── energy.yaml                      (Existing)
├── progress.yaml                    (Existing)
├── gamification.yaml                (Existing)
├── capture.yaml                     (New: from CaptureAgent)
├── decomposer.yaml                  (New: from DecomposerAgent)
├── classifier.yaml                  (New: from ClassifierAgent)
├── split.yaml                       (New: from SplitProxyAgent)
└── conversational.yaml              (New: from ConversationalTaskAgent)

[Deprecated - to be removed in Phase 4]
src/agents/task_agent.py            (DEPRECATE)
src/agents/focus_agent.py           (DEPRECATE)
src/agents/task_proxy_intelligent.py (DEPRECATE)
src/agents/energy_proxy_advanced.py  (DEPRECATE)
src/agents/focus_proxy_advanced.py   (DEPRECATE)
src/agents/progress_proxy_advanced.py (DEPRECATE)
src/agents/gamification_proxy_advanced.py (DEPRECATE)
src/agents/split_proxy_agent.py     (CONSOLIDATE → split.yaml)
src/agents/conversational_task_agent.py (CONSOLIDATE → conversational.yaml)
```

---

## Rollback Plan

If migration encounters blockers, revert to:

1. Keep all legacy agents as-is
2. Add UnifiedAgent as optional new pattern
3. Both patterns coexist indefinitely
4. Gradually migrate at slower pace
5. Use adapter pattern to reduce duplication

**Fallback**: UnifiedAgent as opt-in feature, not required migration

---

## Migration Checklist

### Phase 1: Configuration
- [ ] Create 7 missing YAML configs (intelligent_task, advanced_focus, etc.)
- [ ] Update ConfigLoader to handle all agent types
- [ ] Validate all configs load without errors
- [ ] Document config schema

### Phase 2: Adapters
- [ ] Create adapter classes for each legacy agent
- [ ] Ensure adapters pass existing tests
- [ ] Update registry to use adapters
- [ ] No breaking changes to API

### Phase 3: Consolidation
- [ ] Move feature logic from code → configs/prompts
- [ ] Verify all features preserved
- [ ] Remove legacy agent implementations
- [ ] Update documentation

### Phase 4: KG Integration
- [ ] Add KG config options
- [ ] Integrate into UnifiedAgent
- [ ] Update all agent configs
- [ ] Add tests for KG context

### Phase 5: Cleanup
- [ ] Remove adapter layer (no longer needed)
- [ ] Clean up test files
- [ ] Final documentation
- [ ] Performance benchmarks

---

