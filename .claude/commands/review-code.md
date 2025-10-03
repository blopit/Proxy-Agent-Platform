---
name: review-code
description: Automated code review following CLAUDE.md standards
args:
  - name: file_path
    description: Path to file or directory to review (optional, reviews all if not specified)
    required: false
---

# Automated Code Review

## Target: $ARGUMENTS

Perform comprehensive code review following CLAUDE.md guidelines and project standards.

## Review Process

### 1. **Structure Analysis**
- Check file length (max 500 lines)
- Check function length (max 50 lines)
- Check class length (max 100 lines)
- Verify line length (max 100 characters)
- Validate vertical slice architecture

### 2. **Code Quality Checks**
- Run automated linting: `uv run ruff check .`
- Run formatting check: `uv run ruff format --check .`
- Run type checking: `uv run mypy .`
- Check for security issues: `uv run bandit -r .`

### 3. **Style Compliance**
- PEP8 compliance with project modifications
- Double quotes for strings
- Trailing commas in multi-line structures
- Type hints for all function signatures
- Google-style docstrings

### 4. **Architecture Review**
- Single Responsibility Principle adherence
- Dependency Inversion compliance
- Open/Closed Principle validation
- Fail Fast implementation

### 5. **Testing Review**
- Test coverage analysis: `uv run pytest --cov=. --cov-report=term`
- Test quality assessment
- TDD pattern compliance
- Fixture usage validation

### 6. **Documentation Review**
- Module docstrings present
- Public function docstrings complete
- Complex logic commented with `# Reason:` prefix
- API documentation standards

### 7. **Database Standards** (if applicable)
- Entity-specific primary keys
- Field naming conventions
- Model-database alignment
- Repository pattern usage

## Review Checklist

### Code Structure
- [ ] Files under 500 lines
- [ ] Functions under 50 lines
- [ ] Classes under 100 lines
- [ ] Line length under 100 characters
- [ ] Proper module organization

### Code Quality
- [ ] Ruff linting passes
- [ ] Type checking passes
- [ ] No security vulnerabilities
- [ ] Proper error handling
- [ ] No code duplication

### Style & Conventions
- [ ] PEP8 compliance
- [ ] Consistent naming conventions
- [ ] Proper docstrings
- [ ] Type hints present
- [ ] Import organization

### Architecture
- [ ] Single responsibility
- [ ] Dependency inversion
- [ ] Proper abstraction levels
- [ ] Clean interfaces

### Testing
- [ ] 80%+ test coverage
- [ ] Unit tests present
- [ ] Integration tests where needed
- [ ] Edge cases covered
- [ ] Proper mocking

### Documentation
- [ ] Module docstrings
- [ ] Function docstrings
- [ ] Complex logic commented
- [ ] README updated if needed

## Automated Checks

```bash
# Run all quality checks
echo "=== Formatting Check ==="
uv run ruff format --check .

echo "=== Linting Check ==="
uv run ruff check .

echo "=== Type Checking ==="
uv run mypy .

echo "=== Security Check ==="
uv run bandit -r . --format json

echo "=== Test Coverage ==="
uv run pytest --cov=. --cov-report=term --cov-report=html

echo "=== Dependency Check ==="
uv run pip-audit
```

## Review Report

Generate a comprehensive report including:
1. **Issues Found**: List all violations with file/line references
2. **Suggestions**: Improvement recommendations
3. **Compliance Score**: Percentage of guidelines followed
4. **Priority Actions**: Critical issues to fix first
5. **Best Practices**: Positive patterns identified

## Fix Recommendations

For each issue found:
1. **Explain the problem** with reference to CLAUDE.md
2. **Provide specific fix** with code examples
3. **Explain the reasoning** behind the guideline
4. **Show before/after** if helpful

Remember: The goal is to maintain high code quality while following established project patterns and conventions.
