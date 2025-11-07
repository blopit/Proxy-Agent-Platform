# 🤝 Contributing to Proxy Agent Platform

Thank you for considering contributing to the Proxy Agent Platform! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- UV (Python package manager)
- Git

### Initial Setup

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR-USERNAME/Proxy-Agent-Platform.git
cd Proxy-Agent-Platform
```

2. **Set Up Development Environment**
```bash
# Python backend
uv venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
uv sync

# Frontend (if contributing to web dashboard)
cd frontend
npm install
cd ..

# Mobile (if contributing to mobile app)
cd mobile
npm install
cd ..
```

3. **Read Essential Documentation**
- [CLAUDE.md](CLAUDE.md) - Development standards (REQUIRED reading)
- [START_HERE.md](START_HERE.md) - Quick start guide
- [docs/INDEX.md](docs/INDEX.md) - Documentation hub

## 💻 Development Workflow

### 1. Create a Branch

```bash
# Get latest from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### 2. Make Your Changes

Follow these principles:
- **KISS** (Keep It Simple, Stupid) - Choose simple solutions
- **YAGNI** (You Aren't Gonna Need It) - Build only what's needed now
- **TDD** (Test-Driven Development) - Write tests first
- **Single Responsibility** - One clear purpose per function/class

### 3. Follow Coding Standards

See [CLAUDE.md](CLAUDE.md) for comprehensive standards:

- **Python**:
  - PEP 8 compliant
  - Type hints required
  - Docstrings (Google style)
  - Max line length: 100 characters
  - Format with `ruff format`
  - Lint with `ruff check`

- **TypeScript/JavaScript**:
  - ESLint compliant
  - Prettier formatted
  - Type safety enforced
  - Component-based architecture

## 🧪 Testing Requirements

### Backend (Python)

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest src/path/to/test_file.py -v

# Required coverage: 80%+
```

### Frontend (Web Dashboard)

```bash
cd frontend
npm test                 # Run tests
npm run test:coverage    # With coverage
```

### Frontend (Mobile)

```bash
cd mobile
npm test
```

### Test Writing Guidelines

1. **Write tests first** (TDD approach)
2. **Test file location**: Next to the code it tests
3. **Test naming**: `test_<function>_<scenario>`
4. **Use fixtures** for setup
5. **Test edge cases** and error conditions

Example:
```python
def test_user_can_update_email_when_valid(sample_user):
    """Test that users can update their email with valid input."""
    new_email = "new@example.com"
    sample_user.update_email(new_email)
    assert sample_user.email == new_email
```

## 📚 Documentation

### Code Documentation

- **All public functions**: Add docstrings
- **Complex logic**: Add inline comments
- **Modules**: Add module-level docstrings

### Project Documentation

When adding features:
1. Update relevant docs in `docs/`
2. Update [docs/INDEX.md](docs/INDEX.md) if needed
3. Add examples to [examples/](examples/) if applicable
4. Update [CHANGELOG.md](CHANGELOG.md)

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add two-factor authentication

- Implement TOTP generation and validation
- Add QR code generation for authenticator apps
- Update user model with 2FA fields

Closes #123
```

```
fix(api): resolve task assignment bug

Task assignments were not properly validating user permissions.
Added permission check before assignment.

Fixes #456
```

### Commit Best Practices

- ✅ One logical change per commit
- ✅ Clear, descriptive messages
- ✅ Present tense ("add" not "added")
- ✅ Reference issues when applicable
- ❌ Don't include "Claude Code" or "AI generated" in messages
- ❌ Don't commit secrets or credentials

## 🔄 Pull Request Process

### Before Creating PR

1. **Ensure tests pass**
```bash
# Backend
uv run pytest
uv run ruff check src/
uv run mypy src/

# Frontend
cd frontend && npm test && npm run lint
```

2. **Update documentation**
3. **Rebase on latest main**
```bash
git fetch origin
git rebase origin/main
```

4. **Clean commit history**
```bash
# Squash if needed
git rebase -i HEAD~n
```

### Creating the PR

1. **Push your branch**
```bash
git push origin feature/your-feature-name
```

2. **Open Pull Request** on GitHub

3. **Fill out PR template** completely

4. **Add appropriate labels**
   - `feature`, `bug`, `documentation`, `enhancement`
   - `backend`, `frontend`, `mobile`
   - `needs-review`, `work-in-progress`

### PR Title Format

```
<type>(<scope>): <description>
```

Examples:
- `feat(auth): implement JWT refresh tokens`
- `fix(ui): resolve mobile layout issues`
- `docs(api): update REST endpoint documentation`

### PR Description

Include:
- **Summary**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Changes**: List of key changes
- **Testing**: How was this tested?
- **Screenshots**: For UI changes
- **Related Issues**: Link to issues

### Review Process

1. **Automated Checks**: Must pass
   - Tests
   - Linting
   - Type checking

2. **Code Review**: At least one approval required
   - Reviewers will provide feedback
   - Address feedback promptly
   - Push additional commits as needed

3. **Final Review**: Maintainer approval

4. **Merge**: Maintainers will merge when ready

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** - May already be reported
2. **Check documentation** - May be expected behavior
3. **Try latest version** - May already be fixed

### Creating a Good Issue

**Bug Reports** should include:
- Clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Python/Node version, etc.)
- Error messages/stack traces
- Screenshots (if applicable)

**Feature Requests** should include:
- Clear description
- Use case/motivation
- Proposed solution (optional)
- Alternatives considered (optional)

### Issue Labels

We use labels to organize issues:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good-first-issue` - Good for newcomers
- `help-wanted` - Community help needed
- `question` - Questions about usage

## 🎯 Development Best Practices

### Python Development

1. **Use UV for dependencies**
```bash
uv add package-name          # Add dependency
uv add --dev pytest          # Add dev dependency
```

2. **Follow CLAUDE.md standards**
   - Type hints everywhere
   - Google-style docstrings
   - Max 50 lines per function
   - Max 100 lines per class

3. **Database changes**
   - Create migrations
   - Test migrations both ways
   - Update models

### Frontend Development

1. **Component-first**
   - Build in Storybook first
   - Then integrate with app

2. **Type safety**
   - Use TypeScript strictly
   - Define interfaces

3. **Accessibility**
   - ADHD-optimized UX
   - Clear visual hierarchy
   - Proper ARIA labels

## 🤔 Questions?

- **Development questions**: Check [docs/INDEX.md](docs/INDEX.md)
- **Getting started**: Read [START_HERE.md](START_HERE.md)
- **Standards questions**: See [CLAUDE.md](CLAUDE.md)
- **Stuck?**: Open a GitHub discussion or issue

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

---

**Last Updated**: November 6, 2025

**Navigation**: [↑ README](README.md) | [📚 Docs](docs/INDEX.md) | [🎯 Start Here](START_HERE.md)
