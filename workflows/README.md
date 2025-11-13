# AI Workflow Configurations

TOML configuration files for AI-assisted development workflows.

**Last Updated**: November 13, 2025

---

## 📁 Directory Structure

```
workflows/
├── README.md              # This file
├── dev/                   # Development workflow configs
│   ├── backend-api-feature.toml    # Backend API feature workflow
│   ├── bug-fix.toml                # Bug fix workflow
│   └── frontend-component.toml     # Frontend component workflow
└── personal/              # Personal workflow configs
    └── daily-planning.toml         # Daily planning workflow
```

---

## 🎯 Purpose

This directory contains **TOML configuration files** for AI coding workflows. These configs define structured workflows for common development tasks.

**Note**: This directory contains **configuration files**.
The `docs/workflows/` directory contains **documentation** about workflows.

---

## 🔧 Using Workflow Configs

### Example: Backend API Feature

```toml
# workflows/dev/backend-api-feature.toml
[workflow]
name = "Backend API Feature"
description = "Structured workflow for building backend API features"

[steps.design]
prompt = "Design API endpoint structure and data models"
dependencies = []

[steps.implement]
prompt = "Implement FastAPI endpoint with Pydantic models"
dependencies = ["design"]

[steps.test]
prompt = "Write comprehensive tests for the endpoint"
dependencies = ["implement"]
```

### Running a Workflow

```bash
# Use with AI coding assistant
# (exact commands depend on your AI workflow tool)
```

---

## 📚 Available Workflows

### Development Workflows (`dev/`)

| Workflow | Purpose | Estimated Time |
|----------|---------|----------------|
| `backend-api-feature.toml` | Build new backend API endpoint | 2-4 hours |
| `bug-fix.toml` | Systematic bug investigation and fix | 1-2 hours |
| `frontend-component.toml` | Create new React Native component | 2-3 hours |

### Personal Workflows (`personal/`)

| Workflow | Purpose | Estimated Time |
|----------|---------|----------------|
| `daily-planning.toml` | Daily task planning and prioritization | 15-30 minutes |

---

## 📖 Workflow Documentation

For **documentation about workflows**, see:

- **[AI Coding Workflows](../docs/workflows/AI_CODING_WORKFLOWS.md)** - How to use AI effectively
- **[Human Testing Process](../docs/workflows/HUMAN_TESTING_PROCESS.md)** - Manual testing procedures

---

## ➕ Adding New Workflows

1. Create a new `.toml` file in appropriate directory (`dev/` or `personal/`)
2. Follow the structure of existing workflows
3. Test the workflow with your AI coding assistant
4. Document any special considerations

### Template

```toml
[workflow]
name = "Your Workflow Name"
description = "Brief description of what this workflow does"
estimated_time = "X hours"

[steps.step1]
prompt = "First step instructions"
dependencies = []

[steps.step2]
prompt = "Second step instructions"
dependencies = ["step1"]
```

---

## 🤝 Contributing

When adding or modifying workflows:

1. **Test thoroughly** with AI assistant
2. **Document edge cases** in comments
3. **Keep prompts clear** and specific
4. **Update this README** if adding new categories

---

**Navigation**: [↑ Project Root](../) | [Workflow Documentation](../docs/workflows/) | [CLAUDE.md](../CLAUDE.md)
