---
name: implement
description: Automated implementation system following CLAUDE.md guidelines
args:
  - name: feature_description
    description: Description of the feature to implement
    required: true
---

# Automated Implementation System

## Feature: $ARGUMENTS

Implement the requested feature following the comprehensive CLAUDE.md guidelines and project patterns.

## Implementation Process

### 1. **Context Analysis**
- Read and understand CLAUDE.md guidelines thoroughly
- Analyze existing codebase patterns and conventions
- Identify similar implementations to follow
- Review project structure and architecture

### 2. **Planning Phase**
- Break down the feature into implementable components
- Follow vertical slice architecture principles
- Plan file structure following 500-line limit
- Design functions under 50 lines each
- Plan test strategy (TDD approach)

### 3. **Implementation Guidelines**
- **File Limits**: Never exceed 500 lines per file
- **Function Limits**: Keep functions under 50 lines
- **Class Limits**: Keep classes under 100 lines
- **Line Length**: Maximum 100 characters
- **Architecture**: Follow vertical slice pattern
- **Testing**: Write tests alongside code

### 4. **Code Generation**
- Use UV for package management (never edit pyproject.toml directly)
- Follow PEP8 with project-specific choices
- Use double quotes for strings
- Include type hints for all functions
- Use Google-style docstrings
- Follow naming conventions (snake_case, PascalCase, etc.)

### 5. **Quality Assurance**
- Run `uv run ruff format .` for formatting
- Run `uv run ruff check .` for linting
- Run `uv run pytest` for testing
- Run `uv run mypy .` for type checking
- Ensure 80%+ test coverage

### 6. **Database Standards** (if applicable)
- Use entity-specific primary keys ({entity}_id)
- Follow field naming conventions
- Mirror database fields exactly in models
- Use BaseRepository pattern

### 7. **Validation Gates**
```bash
# Format and lint
uv run ruff format .
uv run ruff check --fix .

# Type checking
uv run mypy .

# Run tests
uv run pytest --cov=. --cov-report=html

# Check for security issues
uv run bandit -r .
```

## Implementation Steps

1. **Analyze Requirements**
   - Understand the feature scope
   - Identify integration points
   - Plan database changes if needed

2. **Create Implementation Plan**
   - List files to create/modify
   - Define interfaces and contracts
   - Plan test scenarios

3. **Implement Core Logic**
   - Start with data models
   - Implement business logic
   - Add API endpoints if needed
   - Follow TDD principles

4. **Add Tests**
   - Unit tests for all functions
   - Integration tests for workflows
   - Edge case testing
   - Mock external dependencies

5. **Documentation**
   - Add docstrings to all public functions
   - Update README if needed
   - Add inline comments for complex logic

6. **Validation**
   - Run all validation gates
   - Fix any issues found
   - Ensure all tests pass

## Success Criteria

- [ ] All code follows CLAUDE.md guidelines
- [ ] Files under 500 lines, functions under 50 lines
- [ ] All validation gates pass
- [ ] Test coverage above 80%
- [ ] Proper documentation included
- [ ] No security vulnerabilities
- [ ] Follows project patterns and conventions

## Error Handling

If any validation fails:
1. Analyze the error message
2. Fix the issue following CLAUDE.md guidelines
3. Re-run validation
4. Repeat until all checks pass

Remember: **NEVER ASSUME OR GUESS** - When in doubt, ask for clarification.
