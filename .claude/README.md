# Claude Code Tools Configuration

This directory contains the Claude Code configuration and commands for the Proxy Agent Platform, enabling automated implementation following the comprehensive CLAUDE.md guidelines.

## 🚀 Enabled Tools & Commands

### Core Implementation Commands

#### `/implement <feature_description>`
Automated implementation system that:
- Follows CLAUDE.md guidelines automatically
- Enforces file/function/class size limits
- Implements TDD workflow
- Generates tests alongside code
- Validates code quality automatically

#### `/generate-prp <feature_file>`
Generate comprehensive Product Requirements Prompts:
- Researches codebase patterns
- Includes external documentation
- Creates implementation blueprints
- Defines validation gates
- Ensures one-pass implementation success

#### `/execute-prp <prp_file>`
Execute PRPs to implement features:
- Loads comprehensive context
- Creates detailed implementation plans
- Executes with validation loops
- Ensures all requirements met

### Quality Assurance Commands

#### `/review-code [file_path]`
Automated code review system:
- Checks CLAUDE.md compliance
- Validates architecture principles
- Analyzes test coverage
- Generates improvement recommendations
- Provides compliance scoring

#### `/test-auto [target]`
Comprehensive testing automation:
- Executes TDD workflow
- Runs unit/integration/e2e tests
- Generates coverage reports
- Performance benchmarking
- Continuous testing support

#### `/setup-dev [component]`
Development environment setup:
- Configures UV package management
- Sets up development tools
- Creates configuration files
- Validates environment
- Troubleshooting support

### Existing Commands

#### `/execute-parallel`
Execute multiple tasks in parallel

#### `/prep-parallel`
Prepare parallel execution plans

#### `/fix-github-issue`
Fix GitHub issues automatically

#### `/primer`
Project primer and context

## 🛠️ Permissions Enabled

### Development Tools
- **UV Package Management**: `uv:*`, `uv run:*`, `uv add:*`, `uv sync:*`
- **Code Quality**: `ruff:*`, `mypy:*`, `pytest:*`
- **Git Operations**: `git:*`, `git status`, `git add:*`, `git commit:*`
- **Python Execution**: `python:*`, `python -m pytest:*`

### System Tools
- **File Operations**: `ls:*`, `cat:*`, `mv:*`, `mkdir:*`, `cp:*`, `rm:*`
- **Search Tools**: `grep:*`, `rg:*`, `find:*`
- **Text Processing**: `awk:*`, `sed:*`, `sort:*`, `uniq:*`
- **Archive Tools**: `tar:*`, `zip:*`, `unzip:*`

### Web & API Access
- **Documentation**: `docs.anthropic.com`, `docs.pydantic.dev`, `fastapi.tiangolo.com`
- **Development Resources**: `github.com`, `stackoverflow.com`, `pypi.org`
- **General Web**: `WebFetch(domain:*)`

### Package Managers
- **Python**: `pip:*`, `pip install:*`, `pip list`
- **Node.js**: `npm:*`, `yarn:*`, `pnpm:*`, `node:*`
- **GitHub**: `gh:*`, `gh issue:*`, `gh pr:*`

## 📋 Usage Examples

### Implement a New Feature
```bash
/implement "Create a user authentication system with JWT tokens"
```

### Generate Implementation Plan
```bash
/generate-prp feature-specs/auth-system.md
```

### Execute Implementation Plan
```bash
/execute-prp PRPs/auth-system.md
```

### Review Code Quality
```bash
/review-code agent/auth/
```

### Run Automated Tests
```bash
/test-auto unit
/test-auto coverage
```

### Set Up Development Environment
```bash
/setup-dev all
```

## 🎯 Automated Implementation Workflow

1. **Feature Request** → `/generate-prp` → Creates comprehensive PRP
2. **Implementation** → `/execute-prp` → Implements with validation
3. **Quality Check** → `/review-code` → Validates compliance
4. **Testing** → `/test-auto` → Ensures quality
5. **Integration** → Git workflow with automated checks

## 🔧 Configuration Files

### `.claude/settings.local.json`
Comprehensive permissions for development tools and operations

### `.claude/commands/*.md`
Individual command definitions with detailed workflows

### Integration with CLAUDE.md
All commands automatically follow the project's comprehensive development guidelines:
- File size limits (500 lines)
- Function size limits (50 lines)
- Class size limits (100 lines)
- UV package management
- TDD workflow
- Code quality standards
- Documentation requirements

## 🚀 Benefits

1. **Automated Compliance**: All code automatically follows CLAUDE.md guidelines
2. **Quality Assurance**: Built-in validation and testing
3. **Consistency**: Enforced patterns and conventions
4. **Efficiency**: Reduced manual work and errors
5. **Documentation**: Automatic generation and validation
6. **Testing**: TDD workflow with comprehensive coverage

## 📚 Next Steps

1. Use `/setup-dev` to ensure environment is properly configured
2. Try `/implement` with a simple feature to test the workflow
3. Use `/review-code` to check existing code compliance
4. Explore `/generate-prp` for complex feature planning

The system is now ready for automated implementation following your comprehensive CLAUDE.md guidelines!
