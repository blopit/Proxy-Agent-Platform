# E2E Testing Quick Reference

**Location**: `tests/e2e/`
**Status**: ✅ WORKING
**Last Updated**: 2025-11-15

## Quick Start

```bash
# Run all E2E tests with reports
E2E_GENERATE_REPORTS=true uv run pytest tests/e2e/ -v

# Run only working tests
uv run pytest tests/e2e/test_e2e_minimal.py -v

# View reports
ls -lt tests/e2e/reports/
cat tests/e2e/reports/minimal_e2e_flow_*.md
```

## Available Tests

| Test | Status | Description | Runtime |
|------|--------|-------------|---------|
| `test_e2e_minimal.py` | ✅ PASSING | Signup + Onboarding (4/4 sections) | ~0.4s |
| `test_e2e_single_task.py` | ✅ PASSING | Single task flow (8/8 sections) | ~0.5s |
| `test_e2e_multi_task.py` | ✅ PASSING | Multi-task + splitting (10/10 sections) | ~0.4s |

**🎉 100% PASS RATE - ALL TESTS PASSING!**

## Environment Variables

```bash
E2E_GENERATE_REPORTS=true       # Generate reports (default: true)
E2E_USE_REAL_LLMS=false         # Use real LLM calls (default: true)
E2E_USE_REAL_PROVIDERS=false    # Use real OAuth (default: false)
E2E_CLEANUP_USERS=false         # Delete test users (default: false)
```

## Pytest Markers

```bash
# Run only E2E tests
pytest -m "e2e" tests/

# Skip slow tests
pytest -m "e2e and not slow" tests/

# Only tests requiring LLMs
pytest -m "requires_llm" tests/
```

## Test Workflow

1. **Create unique test user** (UUID + timestamp)
2. **Execute test steps** (signup, onboarding, etc.)
3. **Record results** in sections
4. **Generate human review report**
5. **Print summary** to terminal

## Generated Reports

Reports saved to: `tests/e2e/reports/`

Example:
```markdown
# E2E Test Report: Minimal E2E Flow
**Status**: ✅ PASSED
**Duration**: 0.36s

## Test User
- User ID: da834ada-aa31-4b66-b4b9-aca3e8c71e73

## Test Execution
### 1. User Registration ✅
### 2. Onboarding ✅
### 3. Profile Verification ✅

## Human Verification Checklist
- [ ] User created successfully
- [ ] API calls returned expected codes
```

## Backend Issues Found & Fixed

E2E tests discovered and helped fix these backend bugs:

1. ✅ **FIXED**: Missing `execute_read()` method in `EnhancedDatabaseAdapter`
2. ✅ **FIXED**: Integration endpoints failing with 500 errors (schema issues)
3. ✅ **FIXED**: Project creation endpoint URL mismatch
4. ✅ **FIXED**: Task completion HTTP method (PATCH → PUT)
5. ✅ **FIXED**: Task status value (done → completed)
6. ✅ **FIXED**: Integration tables schema mismatches
7. ✅ **FIXED**: Timezone comparison error in `task_models.py` (23 instances)

**Total**: 7 bugs fixed - 100% resolution rate

**See**: [BUG_FIXES_2025-11-15.md](./BUG_FIXES_2025-11-15.md) for complete details.

## Next Steps

1. Run: `E2E_GENERATE_REPORTS=true uv run pytest tests/e2e/test_e2e_minimal.py -v`
2. Review: `cat tests/e2e/reports/minimal_e2e_flow_*.md`
3. Fix backend issues
4. Re-run all tests

## Documentation

- **Full Guide**: [07_E2E_IMPLEMENTATION.md](./07_E2E_IMPLEMENTATION.md)
- **Test Plan**: `tests/e2e/E2E_TEST_PLAN.md`
- **Usage Guide**: `tests/e2e/README.md`

---

**TL;DR**: Run `E2E_GENERATE_REPORTS=true uv run pytest tests/e2e/test_e2e_minimal.py -v` to see it work!
