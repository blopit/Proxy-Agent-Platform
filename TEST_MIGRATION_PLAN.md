# Test Migration Plan - Centralize to /tests/

**Status**: 🟡 Ready to Execute
**Created**: November 15, 2025
**Total Files to Move**: 62 tests

---

## Executive Summary

Migrate all tests from `src/` and `config/` to centralized `/tests/` directory, following traditional Python project structure and pytest best practices.

**Reason for Change**: User preference for centralized testing structure over vertical slice architecture.

---

## Phase 1: Create Directory Structure

### Commands to Execute

```bash
# Create new directory structure in tests/
mkdir -p tests/unit/agents
mkdir -p tests/unit/api
mkdir -p tests/unit/config
mkdir -p tests/unit/core
mkdir -p tests/unit/database
mkdir -p tests/unit/knowledge
mkdir -p tests/unit/mcp
mkdir -p tests/unit/memory
mkdir -p tests/unit/repositories
mkdir -p tests/unit/services/chatgpt_prompts
mkdir -p tests/unit/workflows
mkdir -p tests/integration/agents
mkdir -p tests/integration/api
mkdir -p tests/integration/database
mkdir -p tests/integration/integrations/google
mkdir -p tests/integration/services

# Create __init__.py files for proper package structure
touch tests/unit/__init__.py
touch tests/unit/agents/__init__.py
touch tests/unit/api/__init__.py
touch tests/unit/config/__init__.py
touch tests/unit/core/__init__.py
touch tests/unit/database/__init__.py
touch tests/unit/knowledge/__init__.py
touch tests/unit/mcp/__init__.py
touch tests/unit/memory/__init__.py
touch tests/unit/repositories/__init__.py
touch tests/unit/services/__init__.py
touch tests/unit/services/chatgpt_prompts/__init__.py
touch tests/unit/workflows/__init__.py
touch tests/integration/__init__.py
touch tests/integration/agents/__init__.py
touch tests/integration/api/__init__.py
touch tests/integration/database/__init__.py
touch tests/integration/integrations/__init__.py
touch tests/integration/integrations/google/__init__.py
touch tests/integration/services/__init__.py
```

---

## Phase 2: Move Test Files

### 2.1 Unit Tests - Agents (10 files)

```bash
# Move agent tests to tests/unit/agents/
mv src/agents/test_unified_basic.py tests/unit/agents/
mv src/agents/tests/test_base_agent.py tests/unit/agents/
mv src/agents/tests/test_focus_energy_agents.py tests/unit/agents/
mv src/agents/tests/test_progress_gamification_agents.py tests/unit/agents/
mv src/agents/tests/test_split_proxy_agent.py tests/unit/agents/
mv src/agents/tests/test_split_proxy_agent_ai_errors.py tests/unit/agents/
mv src/agents/tests/test_split_proxy_agent_performance.py tests/unit/agents/
mv src/agents/tests/test_split_proxy_agent_validation.py tests/unit/agents/
mv src/agents/tests/test_task_proxy_intelligent.py tests/unit/agents/
```

### 2.2 Unit Tests - API (6 files)

```bash
# Move API unit tests to tests/unit/api/
mv src/api/tests/test_auth.py tests/unit/api/
mv src/api/tests/test_auth_middleware.py tests/unit/api/
mv src/api/tests/test_pets_api.py tests/unit/api/
mv src/api/tests/test_statistics_routes.py tests/unit/api/
mv src/api/tests/test_task_endpoints.py tests/unit/api/
mv src/api/tests/test_task_splitting_api.py tests/unit/api/
```

### 2.3 Unit Tests - Core (3 files)

```bash
# Move core tests to tests/unit/core/
mv src/core/tests/test_settings.py tests/unit/core/
mv src/core/tests/test_task_models.py tests/unit/core/
mv src/core/tests/test_task_splitting_models.py tests/unit/core/
```

### 2.4 Unit Tests - Database (4 files)

```bash
# Move database unit tests to tests/unit/database/
mv src/database/tests/test_enhanced_adapter.py tests/unit/database/
mv src/database/tests/test_micro_steps_schema.py tests/unit/database/
mv src/database/tests/test_reflections_schema.py tests/unit/database/
mv src/database/tests/test_user_progress_schema.py tests/unit/database/
```

### 2.5 Unit Tests - Repositories (3 files)

```bash
# Move repository tests to tests/unit/repositories/
mv src/repositories/tests/test_enhanced_repositories.py tests/unit/repositories/
mv src/repositories/tests/test_task_repository.py tests/unit/repositories/
mv src/repositories/tests/test_user_pet_repository.py tests/unit/repositories/
```

### 2.6 Unit Tests - Services (11 files)

```bash
# Move service tests to tests/unit/services/
mv src/services/chatgpt_prompts/tests/test_import_service.py tests/unit/services/chatgpt_prompts/
mv src/services/chatgpt_prompts/tests/test_prompt_service.py tests/unit/services/chatgpt_prompts/
mv src/services/delegation/tests/test_delegation.py tests/unit/services/
mv src/services/focus_sessions/tests/test_focus_sessions.py tests/unit/services/
mv src/services/tests/test_llm_capture_service.py tests/unit/services/
mv src/services/tests/test_micro_step_service.py tests/unit/services/
mv src/services/tests/test_task_service.py tests/unit/services/
mv src/services/tests/test_task_statistics_service.py tests/unit/services/
mv src/services/task_templates/tests/test_task_templates.py tests/unit/services/
mv src/services/templates/tests/test_templates.py tests/unit/services/
mv src/services/tests/test_user_pet_service.py tests/unit/services/
```

### 2.7 Unit Tests - Other (7 files)

```bash
# Move knowledge tests
mv src/knowledge/tests/test_graph_service.py tests/unit/knowledge/

# Move MCP tests
mv src/mcp/test_mcp_basic.py tests/unit/mcp/
mv src/mcp/tests/test_mcp_client.py tests/unit/mcp/
mv src/mcp/tests/test_mcp_server.py tests/unit/mcp/

# Move memory tests
mv src/memory/test_memory_basic.py tests/unit/memory/
mv src/memory/tests/test_memory_client.py tests/unit/memory/

# Move workflows tests
mv src/workflows/tests/test_executor.py tests/unit/workflows/

# Move misc tests
mv src/tests/test_agents.py tests/unit/
mv config/test_config_basic.py tests/unit/config/
```

### 2.8 Integration Tests (15 files)

```bash
# Move integration tests - Agents
mv src/agents/tests/test_capture_integration.py tests/integration/agents/

# Move integration tests - API
mv src/api/tests/test_auth_integration.py tests/integration/api/
mv src/api/tests/test_dogfooding.py tests/integration/api/
mv src/api/tests/test_focus_energy_integration.py tests/integration/api/
mv src/api/routes/tests/test_onboarding.py tests/integration/api/
mv src/api/tests/test_progress_gamification_integration.py tests/integration/api/
mv src/api/tests/test_rewards_pet_integration.py tests/integration/api/
mv src/api/tests/test_task_endpoints_integration.py tests/integration/api/
mv src/api/tests/test_websocket_realtime.py tests/integration/api/

# Move integration tests - Database
mv src/database/tests/test_database_initialization.py tests/integration/database/
mv src/database/tests/test_epic7_migration.py tests/integration/database/
mv src/database/tests/test_relationships.py tests/integration/database/

# Move integration tests - Google
mv src/integrations/google/tests/test_auth.py tests/integration/integrations/google/
mv src/integrations/google/tests/test_calendar.py tests/integration/integrations/google/

# Move integration tests - Services
mv src/services/chatgpt_prompts/tests/test_integration.py tests/integration/services/
mv src/services/tests/test_llm_capture_real.py tests/integration/services/
```

### 2.9 E2E Tests (1 file)

```bash
# Move performance/scalability test to e2e
mv src/api/tests/test_performance_scalability.py tests/e2e/
```

---

## Phase 3: Update Import Statements

All moved test files will need import path updates. The general pattern:

### Before (Relative Imports)
```python
from ..service import TaskService
from ...database.models import Task
```

### After (Absolute Imports)
```python
from src.services.task_service import TaskService
from src.database.models import Task
```

### Files Requiring Import Updates (All 62 files)

We'll need to update imports in all moved files. This can be done with:

```bash
# For each test file, replace relative imports with absolute imports
# This will be done programmatically in Phase 3 execution
```

**Import Update Script** (to be created):
```python
# scripts/fix_test_imports.py
import re
from pathlib import Path

def fix_imports(test_file):
    """Convert relative imports to absolute imports."""
    content = test_file.read_text()

    # Replace relative imports
    content = re.sub(r'from \.\.(.*) import', r'from src.\1 import', content)
    content = re.sub(r'from \.\.\.(.*) import', r'from src.\1 import', content)
    content = re.sub(r'from \.\.\.\.(.*) import', r'from src.\1 import', content)

    test_file.write_text(content)

# Run on all test files
for test_file in Path('tests').rglob('test_*.py'):
    fix_imports(test_file)
```

---

## Phase 4: Update conftest.py Files

### Check for conftest.py in src/

```bash
# Find all conftest.py files in src/
find src/ -name "conftest.py"
```

### Action Items:
1. Review each conftest.py for fixtures
2. Consolidate shared fixtures to `/tests/conftest.py`
3. Keep module-specific fixtures in appropriate test subdirectories

---

## Phase 5: Clean Up Empty Directories

```bash
# Remove empty test directories from src/
rmdir src/agents/tests 2>/dev/null || true
rmdir src/api/tests 2>/dev/null || true
rmdir src/api/routes/tests 2>/dev/null || true
rmdir src/core/tests 2>/dev/null || true
rmdir src/database/tests 2>/dev/null || true
rmdir src/repositories/tests 2>/dev/null || true
rmdir src/services/tests 2>/dev/null || true
rmdir src/services/chatgpt_prompts/tests 2>/dev/null || true
rmdir src/services/delegation/tests 2>/dev/null || true
rmdir src/services/focus_sessions/tests 2>/dev/null || true
rmdir src/services/task_templates/tests 2>/dev/null || true
rmdir src/services/templates/tests 2>/dev/null || true
rmdir src/integrations/google/tests 2>/dev/null || true
rmdir src/knowledge/tests 2>/dev/null || true
rmdir src/mcp/tests 2>/dev/null || true
rmdir src/memory/tests 2>/dev/null || true
rmdir src/workflows/tests 2>/dev/null || true
rmdir src/tests 2>/dev/null || true
```

---

## Phase 6: Update pytest Configuration

### Update pyproject.toml

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]  # Only look in /tests/
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--strict-markers",
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=html:agent_resources/reports/coverage-html",
]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
    "e2e: marks tests as end-to-end tests",
]
```

---

## Phase 7: Update Documentation

### 7.1 Update CLAUDE.md

**Section to Update**: "🧱 Code Structure & Modularity"

**Remove**:
```markdown
Follow strict vertical slice architecture with tests living next to the code they test:

src/project/
    feature_module/
        tests/
            test_handlers.py
```

**Replace With**:
```markdown
Follow centralized testing architecture with all tests in /tests/:

tests/
    unit/
        feature_module/
            test_handlers.py
    integration/
        test_feature_integration.py
    e2e/
        test_user_workflows.py

src/
    feature_module/
        handlers.py
        validators.py
```

### 7.2 Update agent_resources/testing/00_OVERVIEW.md

**Section to Update**: Line 80-115 "Test Organization"

**Replace**:
```markdown
### Test Organization

All tests are centralized in the `/tests/` directory:

```
tests/
├── unit/                                  # Unit tests (70-80%)
│   ├── agents/
│   │   └── test_split_proxy_agent.py
│   ├── api/
│   │   └── test_task_endpoints.py
│   ├── services/
│   │   └── test_task_service.py
│   └── ...
│
├── integration/                           # Integration tests
│   ├── api/
│   │   └── test_onboarding_flow.py
│   └── database/
│       └── test_relationships.py
│
└── e2e/                                   # E2E tests
    └── test_complete_user_journey.py

src/                                       # No tests here
├── agents/
│   └── split_proxy_agent.py
├── api/
│   └── routes/
│       └── tasks.py
└── services/
    └── task_service.py
```

**Benefits**:
- ✅ Clear separation of production and test code
- ✅ Easier test discovery
- ✅ Consistent import patterns
- ✅ Standard Python project structure
- ✅ Simpler CI/CD configuration
```

### 7.3 Update agent_resources/testing/01_UNIT_TESTING.md

Update file paths in examples to reference `/tests/unit/` instead of `src/*/tests/`

### 7.4 Create Migration Notice

Add to all testing docs:

```markdown
## ⚠️ Migration Notice (November 2025)

**Breaking Change**: Tests have been migrated from vertical slice architecture
(tests next to code) to centralized structure (all tests in `/tests/`).

**Old Location**: `src/services/tests/test_task_service.py`
**New Location**: `tests/unit/services/test_task_service.py`

See [TEST_MIGRATION_REPORT.md](../../../TEST_MIGRATION_REPORT.md) for details.
```

---

## Phase 8: Verification

### 8.1 Test Discovery Check

```bash
# Verify pytest can discover all tests
uv run pytest --collect-only

# Expected output: ~62+ test files collected
```

### 8.2 Run Test Suite

```bash
# Run all tests
uv run pytest tests/ -v

# Run by category
uv run pytest tests/unit/ -v
uv run pytest tests/integration/ -v
uv run pytest tests/e2e/ -v
```

### 8.3 Coverage Check

```bash
# Verify coverage still works
uv run pytest --cov=src --cov-report=term-missing --cov-report=html:agent_resources/reports/coverage-html
```

### 8.4 CI/CD Check

```bash
# Verify GitHub Actions still work
# Check .github/workflows/ files reference correct paths
```

---

## Phase 9: Git Commit

```bash
# Stage all changes
git add tests/
git add src/
git add config/
git add pyproject.toml
git add CLAUDE.md
git add agent_resources/testing/

# Create commit
git commit -m "$(cat <<'EOF'
refactor(tests): centralize all tests to /tests/ directory

Migrate from vertical slice architecture (tests next to code) to
centralized testing structure (all tests in /tests/).

BREAKING CHANGE: Test file locations have changed

- Move 62 test files from src/ to tests/
- Update all import statements to use absolute imports
- Remove empty test directories from src/
- Update pytest configuration in pyproject.toml
- Update CLAUDE.md and testing documentation

Changes:
- Unit tests: src/*/tests/ → tests/unit/
- Integration tests: src/*/tests/ → tests/integration/
- E2E tests: src/api/tests/ → tests/e2e/
- Config tests: config/ → tests/unit/config/

Benefits:
- Clear separation of production and test code
- Easier test discovery and navigation
- Consistent with standard Python project structure
- Simplified CI/CD configuration

See TEST_MIGRATION_REPORT.md for complete details.
EOF
)"
```

---

## Rollback Plan

If migration fails, rollback with:

```bash
# Revert commit
git revert HEAD

# Or reset if not pushed
git reset --hard HEAD~1
```

---

## Estimated Time

| Phase | Time | Complexity |
|-------|------|------------|
| 1. Create directories | 5 min | Low |
| 2. Move files | 15 min | Low |
| 3. Update imports | 45 min | Medium |
| 4. Update conftest | 15 min | Medium |
| 5. Clean up | 5 min | Low |
| 6. Update pytest config | 10 min | Low |
| 7. Update docs | 30 min | Medium |
| 8. Verification | 20 min | High |
| 9. Git commit | 5 min | Low |
| **Total** | **~2.5 hours** | **Medium** |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Import paths break | 🔴 HIGH | Fix imports script, thorough testing |
| Tests fail after move | 🟡 MEDIUM | Run tests before commit, rollback plan |
| CI/CD breaks | 🟡 MEDIUM | Update workflow files, test locally |
| Lost fixtures | 🟢 LOW | Review conftest.py before deletion |
| Documentation out of sync | 🟢 LOW | Update docs in same PR |

---

## Success Criteria

- [x] All 62 test files moved to `/tests/`
- [ ] All imports updated and working
- [ ] `uv run pytest` passes with 0 failures
- [ ] Coverage report generates successfully
- [ ] No empty test directories remain in `src/`
- [ ] CLAUDE.md updated
- [ ] Testing documentation updated
- [ ] Git commit created with clear message
- [ ] CI/CD pipeline passes (if applicable)

---

## Next Steps

1. **Review this plan** - Confirm approach is correct
2. **Execute Phase 1** - Create directory structure
3. **Execute Phases 2-3** - Move files and fix imports
4. **Execute Phase 8** - Run verification
5. **Execute Phases 4-7** - Clean up and documentation
6. **Execute Phase 9** - Commit changes

---

**Ready to Execute?** Reply with "execute" to begin migration.

**Last Updated**: November 15, 2025
**Version**: 1.0
