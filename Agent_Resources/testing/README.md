# Testing Agent - Quick Start

**Your Mission**: Ensure code quality through comprehensive testing and validation

**Last Updated**: November 10, 2025

---

## 🎯 Essential Reading (10 minutes)

1. **[Backend TDD Guide](../../docs/backend/BACKEND_TDD_GUIDE.md)** (5 min) - Test-driven development
2. **[CLAUDE.md](../../CLAUDE.md)** (3 min) - Testing standards (80%+ coverage)
3. **[Testing Strategy](../../docs/testing/)** (2 min) - Overall strategy

## 🚀 Quick Test Commands

### Backend Tests
```bash
# Run all backend tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest src/path/to/test_file.py -v

# Run with verbose output
uv run pytest -vv --tb=long
```

### Frontend Tests
```bash
cd mobile
npm test                 # Run all tests
npm run test:coverage    # With coverage
```

## 📚 Core Documentation

### Testing Guides
- [Backend TDD Guide](../../docs/backend/BACKEND_TDD_GUIDE.md) - Test-driven development
- [Human Testing Process](../../docs/workflows/HUMAN_TESTING_PROCESS.md) - Manual testing

### Current Status
- [TDD Status](../../docs/status/TDD_STATUS.md) - TDD implementation status
- [Test Suite Improvements](../../docs/status/TEST_SUITE_IMPROVEMENTS.md) - Improvements
- [Testing Workflow Integration](../../docs/status/TESTING_WORKFLOW_INTEGRATION.md) - Integration

### Testing Documentation
- [Testing Strategy](../../docs/testing/) - Overall testing approach
- [Test Results](../../docs/testing/TEST_RESULTS.md) - Latest results

## 🎯 Testing Standards (from CLAUDE.md)

- **80%+ coverage** required for backend
- **Write tests first** (TDD approach)
- **Tests next to code** (vertical slice)
- **Descriptive test names**: `test_<function>_<scenario>`
- **Use fixtures** for setup
- **Test edge cases** and error conditions

## 📊 Current Test Status

**Backend**: 887 tests collected, 0 errors
- ✅ Core services well-tested
- ✅ API endpoints covered
- 🟡 Integration tests partial
- ❌ E2E tests minimal

**Frontend**: Component tests in progress
- ✅ Storybook for visual testing
- 🟡 Unit tests partial
- ❌ Integration tests pending

See [TDD Status](../../docs/status/TDD_STATUS.md) for details.

---

**Navigation**: [↑ Agent Resources](../README.md) | [📚 Docs Index](../../docs/INDEX.md)
