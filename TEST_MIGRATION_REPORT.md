# Test Migration Report

## Summary

**Total Misplaced Tests:** 61 test files in `src/` + 1 in `config/` = **62 test files**

**Correct Location:** `/tests/` (root tests folder)

**Current State:**
- ✅ 11 tests correctly located in `/tests/`
- ❌ 62 tests scattered throughout the codebase

---

## Misplaced Tests by Module

### 1. Agents Tests (10 files)
**Current Location:** `src/agents/tests/` and `src/agents/`
**Should Move To:** `tests/unit/agents/` or `tests/integration/agents/`

```
src/agents/test_unified_basic.py
src/agents/tests/test_base_agent.py
src/agents/tests/test_capture_integration.py
src/agents/tests/test_focus_energy_agents.py
src/agents/tests/test_progress_gamification_agents.py
src/agents/tests/test_split_proxy_agent.py
src/agents/tests/test_split_proxy_agent_ai_errors.py
src/agents/tests/test_split_proxy_agent_performance.py
src/agents/tests/test_split_proxy_agent_validation.py
src/agents/tests/test_task_proxy_intelligent.py
```

### 2. API Tests (14 files)
**Current Location:** `src/api/tests/` and `src/api/routes/tests/`
**Should Move To:** `tests/integration/api/` or `tests/e2e/`

```
src/api/routes/tests/test_onboarding.py
src/api/tests/test_auth.py
src/api/tests/test_auth_integration.py
src/api/tests/test_auth_middleware.py
src/api/tests/test_dogfooding.py
src/api/tests/test_focus_energy_integration.py
src/api/tests/test_performance_scalability.py
src/api/tests/test_pets_api.py
src/api/tests/test_progress_gamification_integration.py
src/api/tests/test_rewards_pet_integration.py
src/api/tests/test_statistics_routes.py
src/api/tests/test_task_endpoints.py
src/api/tests/test_task_endpoints_integration.py
src/api/tests/test_task_splitting_api.py
src/api/tests/test_websocket_realtime.py
```

### 3. Core Tests (3 files)
**Current Location:** `src/core/tests/`
**Should Move To:** `tests/unit/core/`

```
src/core/tests/test_settings.py
src/core/tests/test_task_models.py
src/core/tests/test_task_splitting_models.py
```

### 4. Database Tests (7 files)
**Current Location:** `src/database/tests/`
**Should Move To:** `tests/unit/database/` or `tests/integration/database/`

```
src/database/tests/test_database_initialization.py
src/database/tests/test_enhanced_adapter.py
src/database/tests/test_epic7_migration.py
src/database/tests/test_micro_steps_schema.py
src/database/tests/test_reflections_schema.py
src/database/tests/test_relationships.py
src/database/tests/test_user_progress_schema.py
```

### 5. Repository Tests (3 files)
**Current Location:** `src/repositories/tests/`
**Should Move To:** `tests/unit/repositories/`

```
src/repositories/tests/test_enhanced_repositories.py
src/repositories/tests/test_task_repository.py
src/repositories/tests/test_user_pet_repository.py
```

### 6. Service Tests (11 files)
**Current Location:** `src/services/*/tests/`
**Should Move To:** `tests/unit/services/` or `tests/integration/services/`

```
src/services/chatgpt_prompts/tests/test_import_service.py
src/services/chatgpt_prompts/tests/test_integration.py
src/services/chatgpt_prompts/tests/test_prompt_service.py
src/services/delegation/tests/test_delegation.py
src/services/focus_sessions/tests/test_focus_sessions.py
src/services/task_templates/tests/test_task_templates.py
src/services/templates/tests/test_templates.py
src/services/tests/test_llm_capture_real.py
src/services/tests/test_llm_capture_service.py
src/services/tests/test_micro_step_service.py
src/services/tests/test_task_service.py
src/services/tests/test_task_statistics_service.py
src/services/tests/test_user_pet_service.py
```

### 7. Integration Tests (2 files)
**Current Location:** `src/integrations/google/tests/`
**Should Move To:** `tests/integration/integrations/google/`

```
src/integrations/google/tests/test_auth.py
src/integrations/google/tests/test_calendar.py
```

### 8. Knowledge Tests (1 file)
**Current Location:** `src/knowledge/tests/`
**Should Move To:** `tests/unit/knowledge/`

```
src/knowledge/tests/test_graph_service.py
```

### 9. MCP Tests (3 files)
**Current Location:** `src/mcp/tests/` and `src/mcp/`
**Should Move To:** `tests/unit/mcp/`

```
src/mcp/test_mcp_basic.py
src/mcp/tests/test_mcp_client.py
src/mcp/tests/test_mcp_server.py
```

### 10. Memory Tests (2 files)
**Current Location:** `src/memory/tests/` and `src/memory/`
**Should Move To:** `tests/unit/memory/`

```
src/memory/test_memory_basic.py
src/memory/tests/test_memory_client.py
```

### 11. Workflow Tests (1 file)
**Current Location:** `src/workflows/tests/`
**Should Move To:** `tests/unit/workflows/`

```
src/workflows/tests/test_executor.py
```

### 12. Misc Tests (2 files)
**Current Location:** `src/tests/` and `config/`
**Should Move To:** `tests/unit/`

```
src/tests/test_agents.py
config/test_config_basic.py
```

---

## Current Correct Test Structure

```
tests/
├── __init__.py
├── conftest.py
├── README.md
├── e2e/
│   ├── test_e2e_multi_task.py
│   ├── test_e2e_single_task.py
│   └── utils/
│       └── test_user_factory.py
├── integration/
│   ├── test_onboarding_flow.py
│   ├── test_onboarding_quick.py
│   └── test_task_routes.py
├── unit/
│   └── test_services/
│       └── test_task_service_v2.py
├── test_api_routes.py
├── test_cli.py
├── test_database_models.py
└── test_simple_cli_only.py
```

---

## Recommended Target Structure

```
tests/
├── __init__.py
├── conftest.py
├── README.md
├── e2e/
│   ├── test_e2e_multi_task.py
│   ├── test_e2e_single_task.py
│   ├── test_performance_scalability.py  [MOVE FROM src/api/tests/]
│   └── utils/
│       └── test_user_factory.py
├── integration/
│   ├── agents/
│   │   └── test_capture_integration.py  [MOVE FROM src/agents/tests/]
│   ├── api/
│   │   ├── test_auth_integration.py  [MOVE FROM src/api/tests/]
│   │   ├── test_dogfooding.py  [MOVE FROM src/api/tests/]
│   │   ├── test_focus_energy_integration.py  [MOVE FROM src/api/tests/]
│   │   ├── test_onboarding.py  [MOVE FROM src/api/routes/tests/]
│   │   ├── test_progress_gamification_integration.py  [MOVE FROM src/api/tests/]
│   │   ├── test_rewards_pet_integration.py  [MOVE FROM src/api/tests/]
│   │   ├── test_task_endpoints_integration.py  [MOVE FROM src/api/tests/]
│   │   └── test_websocket_realtime.py  [MOVE FROM src/api/tests/]
│   ├── database/
│   │   ├── test_database_initialization.py  [MOVE FROM src/database/tests/]
│   │   ├── test_epic7_migration.py  [MOVE FROM src/database/tests/]
│   │   └── test_relationships.py  [MOVE FROM src/database/tests/]
│   ├── integrations/
│   │   └── google/
│   │       ├── test_auth.py  [MOVE FROM src/integrations/google/tests/]
│   │       └── test_calendar.py  [MOVE FROM src/integrations/google/tests/]
│   ├── services/
│   │   ├── test_integration.py  [MOVE FROM src/services/chatgpt_prompts/tests/]
│   │   └── test_llm_capture_real.py  [MOVE FROM src/services/tests/]
│   ├── test_onboarding_flow.py
│   ├── test_onboarding_quick.py
│   └── test_task_routes.py
├── unit/
│   ├── agents/
│   │   ├── test_base_agent.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_focus_energy_agents.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_progress_gamification_agents.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_split_proxy_agent.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_split_proxy_agent_ai_errors.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_split_proxy_agent_performance.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_split_proxy_agent_validation.py  [MOVE FROM src/agents/tests/]
│   │   ├── test_task_proxy_intelligent.py  [MOVE FROM src/agents/tests/]
│   │   └── test_unified_basic.py  [MOVE FROM src/agents/]
│   ├── api/
│   │   ├── test_auth.py  [MOVE FROM src/api/tests/]
│   │   ├── test_auth_middleware.py  [MOVE FROM src/api/tests/]
│   │   ├── test_pets_api.py  [MOVE FROM src/api/tests/]
│   │   ├── test_statistics_routes.py  [MOVE FROM src/api/tests/]
│   │   ├── test_task_endpoints.py  [MOVE FROM src/api/tests/]
│   │   └── test_task_splitting_api.py  [MOVE FROM src/api/tests/]
│   ├── config/
│   │   └── test_config_basic.py  [MOVE FROM config/]
│   ├── core/
│   │   ├── test_settings.py  [MOVE FROM src/core/tests/]
│   │   ├── test_task_models.py  [MOVE FROM src/core/tests/]
│   │   └── test_task_splitting_models.py  [MOVE FROM src/core/tests/]
│   ├── database/
│   │   ├── test_enhanced_adapter.py  [MOVE FROM src/database/tests/]
│   │   ├── test_micro_steps_schema.py  [MOVE FROM src/database/tests/]
│   │   ├── test_reflections_schema.py  [MOVE FROM src/database/tests/]
│   │   └── test_user_progress_schema.py  [MOVE FROM src/database/tests/]
│   ├── knowledge/
│   │   └── test_graph_service.py  [MOVE FROM src/knowledge/tests/]
│   ├── mcp/
│   │   ├── test_mcp_basic.py  [MOVE FROM src/mcp/]
│   │   ├── test_mcp_client.py  [MOVE FROM src/mcp/tests/]
│   │   └── test_mcp_server.py  [MOVE FROM src/mcp/tests/]
│   ├── memory/
│   │   ├── test_memory_basic.py  [MOVE FROM src/memory/]
│   │   └── test_memory_client.py  [MOVE FROM src/memory/tests/]
│   ├── repositories/
│   │   ├── test_enhanced_repositories.py  [MOVE FROM src/repositories/tests/]
│   │   ├── test_task_repository.py  [MOVE FROM src/repositories/tests/]
│   │   └── test_user_pet_repository.py  [MOVE FROM src/repositories/tests/]
│   ├── services/
│   │   ├── chatgpt_prompts/
│   │   │   ├── test_import_service.py  [MOVE FROM src/services/chatgpt_prompts/tests/]
│   │   │   └── test_prompt_service.py  [MOVE FROM src/services/chatgpt_prompts/tests/]
│   │   ├── test_delegation.py  [MOVE FROM src/services/delegation/tests/]
│   │   ├── test_focus_sessions.py  [MOVE FROM src/services/focus_sessions/tests/]
│   │   ├── test_llm_capture_service.py  [MOVE FROM src/services/tests/]
│   │   ├── test_micro_step_service.py  [MOVE FROM src/services/tests/]
│   │   ├── test_task_service.py  [MOVE FROM src/services/tests/]
│   │   ├── test_task_service_v2.py
│   │   ├── test_task_statistics_service.py  [MOVE FROM src/services/tests/]
│   │   ├── test_task_templates.py  [MOVE FROM src/services/task_templates/tests/]
│   │   ├── test_templates.py  [MOVE FROM src/services/templates/tests/]
│   │   └── test_user_pet_service.py  [MOVE FROM src/services/tests/]
│   ├── workflows/
│   │   └── test_executor.py  [MOVE FROM src/workflows/tests/]
│   └── test_agents.py  [MOVE FROM src/tests/]
├── test_api_routes.py
├── test_cli.py
├── test_database_models.py
└── test_simple_cli_only.py
```

---

## Migration Action Items

1. **Create new directory structure** in `tests/` to match source organization
2. **Move all test files** from `src/` to `tests/` maintaining logical grouping
3. **Update import statements** in moved test files (change relative imports)
4. **Update pytest discovery paths** if needed in `pytest.ini` or `pyproject.toml`
5. **Delete empty `tests/` directories** from `src/` modules
6. **Update conftest.py** files if any exist in `src/` subdirectories
7. **Run full test suite** to verify all tests still pass after migration

---

## Benefits of Centralized Test Structure

1. **Easier Test Discovery** - All tests in one location
2. **Clearer Separation** - Production code (`src/`) vs test code (`tests/`)
3. **Simplified Import Paths** - Consistent import patterns across tests
4. **Better Test Organization** - Unit/Integration/E2E categories
5. **Follows Python Best Practices** - Standard pytest project layout
6. **Easier CI/CD Configuration** - Single test directory to target

---

## Notes

- This violates the vertical slice architecture mentioned in CLAUDE.md
- The user preference is for centralized tests in root `/tests/` folder
- Migration should preserve test categorization (unit/integration/e2e)
- Existing tests in `/tests/` are already correctly structured
