---
name: setup-dev
description: Set up development environment following CLAUDE.md guidelines
args:
  - name: component
    description: Component to set up (all, python, frontend, database, tools)
    required: false
---

# Development Environment Setup

## Component: $ARGUMENTS

Set up the development environment following CLAUDE.md specifications.

## Setup Process

### 1. **Python Environment Setup**
```bash
# Install UV if not present
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv

# Sync dependencies
uv sync

# Verify installation
uv run python --version
uv run pip list
```

### 2. **Development Tools Setup**
```bash
# Install development dependencies
uv add --dev pytest ruff mypy bandit pip-audit

# Install pre-commit hooks
uv add --dev pre-commit
uv run pre-commit install

# Verify tools
uv run ruff --version
uv run mypy --version
uv run pytest --version
```

### 3. **Database Setup** (if needed)
```bash
# Install database dependencies
uv add sqlalchemy alembic psycopg2-binary

# Set up database
uv run alembic init alembic
uv run alembic revision --autogenerate -m "Initial migration"
uv run alembic upgrade head
```

### 4. **Frontend Setup** (if needed)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Verify setup
npm run build
```

### 5. **Configuration Files**

Create/verify essential configuration files:

#### pyproject.toml
```toml
[tool.ruff]
line-length = 100
target-version = "py39"

[tool.ruff.lint]
select = ["E", "F", "W", "C90", "I", "N", "UP", "YTT", "S", "BLE", "FBT", "B", "A", "COM", "C4", "DTZ", "T10", "EM", "EXE", "FA", "ISC", "ICN", "G", "INP", "PIE", "T20", "PYI", "PT", "Q", "RSE", "RET", "SLF", "SLOT", "SIM", "TID", "TCH", "INT", "ARG", "PTH", "TD", "FIX", "ERA", "PD", "PGH", "PL", "TRY", "FLY", "NPY", "AIR", "PERF", "FURB", "LOG", "RUF"]

[tool.mypy]
python_version = "3.9"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

#### .gitignore
```
__pycache__/
*.py[cod]
*$py.class
.env
.venv/
venv/
.coverage
htmlcov/
.pytest_cache/
.mypy_cache/
.ruff_cache/
```

### 6. **Environment Variables**
```bash
# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# API Keys
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Development
DEBUG=true
LOG_LEVEL=INFO
EOF
```

### 7. **Verification Commands**
```bash
# Test Python setup
uv run python -c "import sys; print(f'Python {sys.version}')"

# Test linting
uv run ruff check .

# Test formatting
uv run ruff format --check .

# Test type checking
uv run mypy .

# Test security
uv run bandit -r .

# Run tests
uv run pytest

# Test coverage
uv run pytest --cov=. --cov-report=html
```

## Setup Checklist

### Python Environment
- [ ] UV installed and working
- [ ] Virtual environment created
- [ ] Dependencies synced
- [ ] Python version correct

### Development Tools
- [ ] Ruff installed and configured
- [ ] MyPy installed and configured
- [ ] Pytest installed and working
- [ ] Bandit installed for security
- [ ] Pre-commit hooks installed

### Configuration
- [ ] pyproject.toml configured
- [ ] .gitignore in place
- [ ] .env file created
- [ ] Editor settings configured

### Database (if applicable)
- [ ] Database server running
- [ ] Alembic configured
- [ ] Initial migration created
- [ ] Database schema up to date

### Frontend (if applicable)
- [ ] Node.js/npm installed
- [ ] Dependencies installed
- [ ] Build process working
- [ ] Development server starts

### Verification
- [ ] All linting passes
- [ ] Type checking passes
- [ ] Tests run successfully
- [ ] Security scan clean
- [ ] Coverage report generated

## Troubleshooting

### Common Issues

1. **UV not found**
   ```bash
   # Reload shell or add to PATH
   source ~/.bashrc
   # or
   export PATH="$HOME/.cargo/bin:$PATH"
   ```

2. **Permission errors**
   ```bash
   # Fix permissions
   chmod +x scripts/*
   ```

3. **Database connection issues**
   ```bash
   # Check database status
   pg_ctl status
   # Start database
   pg_ctl start
   ```

4. **Import errors**
   ```bash
   # Verify virtual environment
   which python
   uv run which python
   ```

## Next Steps

After setup completion:
1. Run `/review-code` to check existing code
2. Run `/implement` to start new features
3. Use `/generate-prp` for complex features
4. Follow TDD workflow for development

Remember: Always use `uv run` for Python commands to ensure virtual environment usage.
