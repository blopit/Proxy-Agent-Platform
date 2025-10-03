---
name: test-auto
description: Automated testing following CLAUDE.md TDD principles
args:
  - name: target
    description: Test target (all, unit, integration, coverage, specific file/module)
    required: false
---

# Automated Testing System

## Target: $ARGUMENTS

Execute comprehensive testing following CLAUDE.md TDD principles and testing strategy.

## Testing Process

### 1. **Test Discovery**
- Identify test files and modules
- Analyze test coverage gaps
- Check test organization structure
- Validate test naming conventions

### 2. **Test Execution Strategy**
```bash
# Run all tests
uv run pytest

# Run with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/test_module.py -v

# Run specific test function
uv run pytest tests/test_module.py::test_function_name -v

# Run tests with coverage
uv run pytest --cov=. --cov-report=html --cov-report=term

# Run tests with markers
uv run pytest -m "unit" -v
uv run pytest -m "integration" -v
```

### 3. **Test Categories**

#### Unit Tests
- Test individual functions/methods in isolation
- Mock external dependencies
- Fast execution (< 1 second each)
- High coverage of business logic

#### Integration Tests
- Test component interactions
- Test database operations
- Test API endpoints
- Test external service integrations

#### End-to-End Tests
- Test complete user workflows
- Test system behavior
- Validate user stories
- Performance validation

### 4. **Test Quality Checks**
```bash
# Check test coverage
uv run pytest --cov=. --cov-report=term --cov-fail-under=80

# Run tests with warnings
uv run pytest --disable-warnings

# Run tests in parallel
uv run pytest -n auto

# Run tests with profiling
uv run pytest --profile
```

## TDD Workflow

### 1. **Red Phase** - Write Failing Test
```python
def test_user_can_update_email_when_valid():
    """Test that users can update their email with valid input."""
    # Arrange
    user = User(email="old@example.com")
    new_email = "new@example.com"
    
    # Act
    result = user.update_email(new_email)
    
    # Assert
    assert result is True
    assert user.email == new_email
```

### 2. **Green Phase** - Make Test Pass
```python
class User:
    def update_email(self, new_email: str) -> bool:
        """Update user email address."""
        if self._is_valid_email(new_email):
            self.email = new_email
            return True
        return False
```

### 3. **Refactor Phase** - Improve Code
- Optimize implementation
- Remove duplication
- Improve readability
- Maintain test coverage

## Test Organization

### Directory Structure
```
tests/
├── conftest.py              # Shared fixtures
├── unit/                    # Unit tests
│   ├── test_models.py
│   ├── test_services.py
│   └── test_utils.py
├── integration/             # Integration tests
│   ├── test_api.py
│   ├── test_database.py
│   └── test_workflows.py
└── e2e/                     # End-to-end tests
    ├── test_user_journey.py
    └── test_system.py
```

### Test Naming Conventions
- `test_` prefix for all test functions
- Descriptive names: `test_user_can_update_email_when_valid`
- Group related tests in classes: `TestUserManagement`

## Fixtures and Mocking

### Common Fixtures
```python
@pytest.fixture
def sample_user():
    """Provide a sample user for testing."""
    return User(
        id=123,
        name="Test User",
        email="test@example.com",
        created_at=datetime.now()
    )

@pytest.fixture
def mock_database():
    """Provide a mock database session."""
    with patch('app.database.get_session') as mock:
        yield mock
```

### Mocking Best Practices
- Mock external dependencies
- Use `unittest.mock` or `pytest-mock`
- Mock at the boundary of your system
- Verify mock calls when needed

## Coverage Analysis

### Coverage Commands
```bash
# Generate HTML coverage report
uv run pytest --cov=. --cov-report=html

# Generate terminal coverage report
uv run pytest --cov=. --cov-report=term

# Coverage with missing lines
uv run pytest --cov=. --cov-report=term-missing

# Fail if coverage below threshold
uv run pytest --cov=. --cov-fail-under=80
```

### Coverage Targets
- **Overall**: 80%+ coverage
- **Critical paths**: 95%+ coverage
- **Business logic**: 90%+ coverage
- **Utilities**: 85%+ coverage

## Performance Testing

### Performance Benchmarks
```python
def test_function_performance(benchmark):
    """Test function performance."""
    result = benchmark(expensive_function, arg1, arg2)
    assert result is not None

def test_api_response_time():
    """Test API response time."""
    start_time = time.time()
    response = client.get("/api/endpoint")
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 1.0  # Less than 1 second
```

## Test Automation

### Continuous Testing
```bash
# Watch for file changes and run tests
uv run pytest-watch

# Run tests on git commit
git add .
git commit -m "feat: add new feature"
# Pre-commit hook runs tests automatically
```

### Test Reporting
```bash
# Generate JUnit XML report
uv run pytest --junitxml=reports/junit.xml

# Generate JSON report
uv run pytest --json-report --json-report-file=reports/report.json
```

## Validation Checklist

### Test Quality
- [ ] All tests follow naming conventions
- [ ] Tests are isolated and independent
- [ ] Proper use of fixtures and mocking
- [ ] Edge cases covered
- [ ] Error conditions tested

### Coverage
- [ ] Overall coverage above 80%
- [ ] Critical paths well covered
- [ ] No untested code in main paths
- [ ] Coverage report generated

### Performance
- [ ] Tests run in reasonable time
- [ ] No flaky tests
- [ ] Parallel execution works
- [ ] Performance benchmarks pass

### Organization
- [ ] Tests organized by type
- [ ] Shared fixtures in conftest.py
- [ ] Clear test documentation
- [ ] Test markers used appropriately

## Troubleshooting

### Common Issues
1. **Import errors**: Check PYTHONPATH and virtual environment
2. **Fixture not found**: Verify conftest.py location
3. **Slow tests**: Profile and optimize or mark as slow
4. **Flaky tests**: Identify race conditions or timing issues

Remember: **Test your code** - No feature is complete without tests!
