# Agent Architecture - Quick Reference Guide

## The Problem

You have **16 different agent implementations** across your codebase, mixed patterns (legacy, modern, transitional), and **Knowledge Graph integrated in only 1 agent** when it should be in all of them.

## The Solution

**Consolidate everything into 1 UnifiedAgent pattern with YAML configs + Knowledge Graph integration.**

---

## Current Inventory

### By Pattern
- **Modern (1)**: UnifiedAgent ✓
- **Legacy Advanced (5)**: IntelligentTaskAgent, AdvancedFocusAgent, AdvancedEnergyAgent, AdvancedProgressAgent, AdvancedGamificationAgent
- **Legacy Simple (2)**: TaskAgent, FocusAgent (basic, no AI)
- **Transitional (3)**: CaptureAgent (KG-integrated!), DecomposerAgent, ClassifierAgent
- **Standalone (2)**: SplitProxyAgent, ConversationalTaskAgent
- **Infrastructure (2)**: AgentRegistry, IntegrationRegistry
- **Foundation (1)**: BaseProxyAgent

### By File Size (Top 5 Violators)
1. task_proxy_intelligent.py: **1378 lines** (MUST split)
2. energy_proxy_advanced.py: **930 lines** (MUST split)
3. gamification_proxy_advanced.py: **751 lines** (MUST split)
4. focus_proxy_advanced.py: **732 lines** (MUST split)
5. progress_proxy_advanced.py: **570 lines** (MUST split)

### By KG Integration
- **Uses KG (1)**: CaptureAgent
- **Missing KG (15)**: Everyone else

---

## Key Facts

### Configuration
- 6 YAML configs exist (task, focus, energy, progress, gamification, task_quick_capture)
- 16 agent implementations exist
- Only UnifiedAgent uses configs
- Advanced* agents use env vars
- Basic agents are hardcoded

### Knowledge Graph
- GraphService exists and works well
- Only CaptureAgent uses it
- Perfect candidate for injection into all agents
- Already integrated properly in one place (prove it works!)

### Pydantic AI
- Only UnifiedAgent uses it
- Already proven to work
- All other agents reinvent the wheel

---

## The Target

```
FROM (Current):                    TO (Target):
16 agent files                     1 UnifiedAgent + configs
7000+ lines of code                2000 lines
6 YAML configs                     10+ YAML configs
1 KG integration                   15 KG integrations
Hardcoded logic                    Config-driven behavior
Mixed patterns                     Single pattern
```

---

## Top 3 Priority Actions

### 1. UnifiedAgent is the Pattern (KEEP IT)
- Already modern
- Already uses Pydantic AI
- Already uses YAML configs
- Already has MCP integration
- Already has memory support
- Just needs KG integration

**Action**: Make all agents work like UnifiedAgent

### 2. Knowledge Graph Should Be Everywhere (EXPAND IT)
- Works in CaptureAgent (proven!)
- Easy to inject into other agents
- Makes decisions better by understanding context
- Low risk (graceful degradation if fails)

**Action**: Add KG config + injection to all agents

### 3. Stop Creating Duplicates (CONSOLIDATE)
- Don't need TaskAgent + IntelligentTaskAgent
- Don't need FocusAgent + AdvancedFocusAgent
- Use one pattern with different configs

**Action**: Migrate all to UnifiedAgent via config

---

## Migration Timeline

### Week 1: Configuration (No Code Changes)
1. Create 7 missing YAML configs
2. Map features → config fields
3. Validate ConfigLoader works with all

### Week 2: Adapters (Transition Period)
1. Create adapters for legacy agents
2. Adapters wrap UnifiedAgent
3. Old code still works
4. No breaking changes

### Week 3: Consolidation (Code Cleanup)
1. Move logic from code → configs
2. Delete old agent files
3. Update registry
4. Run existing tests

### Week 4: Knowledge Graph (New Features)
1. Add KG config to all agents
2. Integrate into UnifiedAgent
3. Test with real data
4. Document usage

---

## File Changes Summary

### CREATE (New files)
- intelligent_task.yaml
- advanced_focus.yaml
- advanced_energy.yaml
- advanced_progress.yaml
- advanced_gamification.yaml
- capture.yaml
- decomposer.yaml
- classifier.yaml
- split.yaml
- conversational.yaml
- agent_factory.py
- (Adapters during transition)

### MODIFY
- agent_config_schema.py (add KG config)
- unified_agent.py (add KG injection)
- agent_registry.py (make dynamic)
- ConfigLoader (already good!)

### DELETE (After migration)
- task_agent.py (61 lines)
- focus_agent.py (49 lines)
- task_proxy_intelligent.py (1378 lines) 🎯
- energy_proxy_advanced.py (930 lines) 🎯
- focus_proxy_advanced.py (732 lines) 🎯
- progress_proxy_advanced.py (570 lines) 🎯
- gamification_proxy_advanced.py (751 lines) 🎯
- split_proxy_agent.py (consolidate to config)
- conversational_task_agent.py (consolidate to config)

**Total Savings**: ~5000 lines deleted, ~70% reduction

### KEEP (Good as-is)
- base.py (foundation)
- unified_agent.py (modern pattern)
- integration_registry.py (pattern matching)
- graph_service.py (KG implementation)

---

## Key Decisions Made

### 1. UnifiedAgent is the single pattern
✓ Reduces code duplication
✓ Easier to test
✓ Consistent tool discovery
✓ Built-in memory support
✓ Already proven to work

### 2. YAML configs capture behavior
✓ Temperature, max_tokens, model choice
✓ System prompt templates (with variables)
✓ Tool/capability definitions
✓ Memory settings
✓ Knowledge Graph settings

### 3. Knowledge Graph gets universal access
✓ Current: Hardcoded in CaptureAgent
✓ Future: Config-driven, available to all agents
✓ Method: Inject entity context into system prompts
✓ Benefit: Smarter decisions with entity awareness

### 4. Adapters handle transition
✓ Old code continues to work
✓ Gradual migration possible
✓ No breaking changes
✓ Removed after transition complete

---

## Success Looks Like

### Code
- All agents under 500 lines (most <100)
- Single pattern: UnifiedAgent
- Configuration-driven behavior
- 100% Pydantic validation

### Architecture  
- Config → Agent Factory → UnifiedAgent
- Knowledge Graph context injected into all prompts
- Dynamic discovery from YAML files
- Version tracking in configs

### Testing
- Config loading tests
- Agent factory tests
- KG integration tests
- 80%+ coverage

### Performance
- Config load: <100ms
- Agent creation: <500ms
- KG context: <200ms per agent

---

## Common Questions

### Q: What about special features in IntelligentTaskAgent?
A: Moved to system prompt template in intelligent_task.yaml. Same capabilities, simpler code.

### Q: Will existing code break?
A: Not during Phase 1-2. Adapters maintain compatibility. Phase 3 is breaking change (intentional).

### Q: What if Knowledge Graph slows things down?
A: It's optional (config flag). Graceful degradation if KG fails. Should speed things up (better decisions).

### Q: Do we lose features?
A: No features lost, just moved:
- AI logic → system prompts
- Repository config → dependency injection
- Tool definitions → MCP servers
- Context handling → Memory layer

### Q: How do we handle agent-specific tools?
A: Via MCP servers defined in config:
```yaml
mcp_servers:
  - name: "task_tools"
    command: "npx"
    args: ["@my-org/task-tools"]
```

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Features lost in refactor | High | Document all features in checklists before migrating |
| Existing tests break | High | Phase 2 adapters maintain compatibility |
| KG performance | Medium | Optional, monitored, with fallbacks |
| Config errors | Low | Schema validation via Pydantic |
| Rollback needed | Medium | Adapters allow rollback to legacy |

---

## Next Steps

1. **Review** this audit (you're doing that now)
2. **Decide** on timeline (recommend 4 weeks)
3. **Create** Phase 1 configs (7 missing YAML files)
4. **Test** ConfigLoader with all agents
5. **Build** adapters for Phase 2
6. **Execute** migration phases

---

## Resources

- Full audit: `AGENT_ARCHITECTURE_AUDIT.md`
- Detailed roadmap: `AGENT_MIGRATION_ROADMAP.md`
- This quick ref: `AGENT_ARCHITECTURE_QUICK_REFERENCE.md`

