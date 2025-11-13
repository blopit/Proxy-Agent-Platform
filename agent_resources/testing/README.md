# Testing Documentation

Comprehensive testing guides for the Proxy Agent Platform.

## Documentation Structure

### [00_OVERVIEW.md](./00_OVERVIEW.md) - Testing Philosophy & Strategy
Start here to understand our testing approach.

**Contents**:
- Test-Driven Development (TDD) principles
- Testing pyramid (Unit → Integration → E2E)
- Test organization (vertical slice architecture)
- Coverage goals and metrics
- Testing stack and tools
- CI/CD integration

**When to read**: Before writing any tests, when setting up testing infrastructure

### [01_UNIT_TESTING.md](./01_UNIT_TESTING.md) - Unit Testing Guide
Learn to write fast, isolated unit tests.

**Contents**:
- AAA pattern (Arrange-Act-Assert)
- Pytest fixtures and parametrization
- Mocking external dependencies
- Testing async code
- Testing Pydantic models
- Testing FastAPI routes with TestClient

**When to read**: Writing tests for individual functions, classes, or methods

### [02_INTEGRATION_TESTING.md](./02_INTEGRATION_TESTING.md) - Integration Testing Guide
Test component interactions and API workflows.

**Contents**:
- Setting up integration tests (requires backend running)
- Testing API endpoints (POST, GET, PUT, DELETE)
- Testing complete CRUD flows
- Testing error cases and validation
- Testing data persistence
- Authentication flow testing

**When to read**: Testing API endpoints, database operations, multi-component workflows

### [03_FRONTEND_TESTING.md](./03_FRONTEND_TESTING.md) - React Native Testing
Test React Native components, hooks, and mobile app logic.

**Contents**:
- Jest and React Native Testing Library setup
- Component testing patterns
- Context and custom hook testing
- API mocking with MSW
- Navigation testing
- AsyncStorage testing

**When to read**: Testing mobile app components, screens, and user interactions

### [04_E2E_TESTING.md](./04_E2E_TESTING.md) - End-to-End Testing
Test complete user journeys (planned, not yet implemented).

**Contents**:
- E2E testing overview and strategy
- Recommended tools (Detox, Maestro)
- Example test scenarios
- Setup and configuration
- CI/CD integration

**When to read**: Planning E2E testing infrastructure, testing critical user flows

### [05_TEST_DATA.md](./05_TEST_DATA.md) - Test Data Management
Manage fixtures, factories, and test data effectively.

**Contents**:
- Pytest fixtures (basic, scoped, parametrized)
- Factory pattern for test data
- Using Faker for random data
- Database test data and transactions
- Cleanup patterns
- Best practices for test isolation

**When to read**: Creating reusable test data, managing test databases, cleanup strategies

### [06_QUICK_START.md](./06_QUICK_START.md) - Quick Reference
Fast reference for common testing tasks.

**Contents**:
- 5-minute quick start
- Running different test types
- Common pytest commands
- Writing your first test
- TDD workflow
- Troubleshooting guide
- Cheat sheet

**When to read**: Daily testing tasks, looking up commands, troubleshooting issues

## Quick Navigation

### By Test Type
- **Unit Tests**: [01_UNIT_TESTING.md](./01_UNIT_TESTING.md)
- **Integration Tests**: [02_INTEGRATION_TESTING.md](./02_INTEGRATION_TESTING.md)
- **Frontend Tests**: [03_FRONTEND_TESTING.md](./03_FRONTEND_TESTING.md)
- **E2E Tests**: [04_E2E_TESTING.md](./04_E2E_TESTING.md)

### By Task
- **Getting Started**: [06_QUICK_START.md](./06_QUICK_START.md)
- **Understanding Philosophy**: [00_OVERVIEW.md](./00_OVERVIEW.md)
- **Managing Test Data**: [05_TEST_DATA.md](./05_TEST_DATA.md)

### By Technology
- **Python/FastAPI**: [01_UNIT_TESTING.md](./01_UNIT_TESTING.md), [02_INTEGRATION_TESTING.md](./02_INTEGRATION_TESTING.md)
- **React Native/Expo**: [03_FRONTEND_TESTING.md](./03_FRONTEND_TESTING.md)
- **Full Stack**: [04_E2E_TESTING.md](./04_E2E_TESTING.md)

## Common Commands

```bash
# Run all tests
uv run pytest -v

# Run unit tests only
uv run pytest src/ -v

# Run integration tests (requires backend running)
uv run uvicorn src.main:app --reload &
uv run pytest tests/integration/ -v

# Run with coverage
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# Frontend tests
cd mobile && npm test
```

## Related Documentation

### Project Documentation
- **CLAUDE.md**: Project coding standards and TDD philosophy
- **tests/README.md**: Test organization and structure
- **tests/integration/README.md**: Integration test specifics

### Onboarding Documentation
- **Agent_Resources/docs/onboarding/**: Onboarding system documentation (similar structure)

## Contributing

When adding new test documentation:

1. Follow the existing structure (numbered files)
2. Use practical examples from actual codebase
3. Include both ✅ DO and ❌ DON'T examples
4. Add quick reference commands
5. Link to related documentation
6. Update this README with new file

## Testing Philosophy

We follow **Test-Driven Development (TDD)** as outlined in CLAUDE.md:

```
1. Write the test first
2. Watch it fail
3. Write minimal code to pass
4. Refactor
5. Repeat
```

**Coverage Goals**:
- Overall: 80%+
- Critical paths: 95%+
- Service layer: 85%+

**Test Pyramid**:
- Unit tests: 70-80% (fast, isolated)
- Integration tests: 15-25% (component interactions)
- E2E tests: 5-10% (complete workflows)

## Support & Resources

### Internal
- Ask team members familiar with testing patterns
- Review existing tests for examples
- Check test results in `Agent_Resources/reports/`

### External
- Pytest: https://docs.pytest.org/
- FastAPI Testing: https://fastapi.tiangolo.com/tutorial/testing/
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- CLAUDE.md: Project testing guidelines

---

**Last Updated**: November 2025
**Version**: 1.0

**Quick Links**:
- [📖 Start Here](./00_OVERVIEW.md)
- [🚀 Quick Start](./06_QUICK_START.md)
- [🔧 Unit Tests](./01_UNIT_TESTING.md)
- [🔗 Integration Tests](./02_INTEGRATION_TESTING.md)
