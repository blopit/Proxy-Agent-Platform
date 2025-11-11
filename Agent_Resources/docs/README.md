# Agent Resources - Documentation & Specialization

This directory provides specialized views of documentation organized by AI agent role/specialty.

**Last Updated**: November 10, 2025

---

## 🤖 Agent Specializations

Choose your agent specialty to see focused, relevant documentation:

### [Backend Agent](../backend/README.md)
**Focus**: Python/FastAPI backend, database, APIs
- API endpoints and services
- Database schema and migrations
- Backend architecture and patterns
- ~30 relevant documents

### [Frontend Agent](../frontend/README.md)
**Focus**: Expo/React Native mobile app (iOS/Android/Web)
- Mobile components and screens
- Storybook development
- Design system and UX patterns
- ~40 relevant documents

### [Architecture Agent](../architecture/README.md)
**Focus**: System design, patterns, technical strategy
- System architecture
- Design patterns and frameworks
- Integration architecture
- ~30 relevant documents

### [Testing Agent](../testing/README.md)
**Focus**: Testing, QA, validation
- TDD and testing strategies
- Test coverage and quality
- Testing workflows
- ~15 relevant documents

### [Project Agent](../project/README.md)
**Focus**: Task management, roadmaps, coordination
- Current status and priorities
- Epic and task tracking
- Roadmaps and planning
- ~50 relevant documents

---

## 📁 Directory Structure

```
Agent_Resources/
├── backend/              # Backend agent resources
│   ├── README.md         # Backend quick start
│   ├── THINGS_TO_UPDATE.md
│   └── docs/             # Symlinks to relevant docs
├── frontend/             # Frontend agent resources
│   ├── README.md         # Frontend quick start
│   ├── THINGS_TO_UPDATE.md
│   └── docs/             # Symlinks to relevant docs
├── architecture/         # Architecture agent resources
│   ├── README.md         # Architecture quick start
│   ├── THINGS_TO_UPDATE.md
│   └── docs/             # Symlinks to relevant docs
├── testing/              # Testing agent resources
│   ├── README.md         # Testing quick start
│   ├── THINGS_TO_UPDATE.md
│   └── docs/             # Symlinks to relevant docs
├── project/              # Project agent resources
│   ├── README.md         # Project quick start
│   ├── THINGS_TO_UPDATE.md
│   └── docs/             # Symlinks to relevant docs
└── docs/                 # Provider-specific docs
    ├── authentication/   # Auth system docs
    ├── onboarding/       # Onboarding system docs
    └── providers/        # Provider integrations
```

---

## Provider Integrations

### Google Providers

Comprehensive documentation for Google-based integrations:

- **[Gmail](./providers/Google/Gmail.md)** - Email integration for task capture
- **Google Calendar** (planned) - Calendar event sync
- **Google Drive** (planned) - File access and organization

[View Google Providers →](./providers/Google/README.md)

---

## Documentation Categories

### Backend Architecture
- Database schema and migrations
- API endpoints and routes
- Service layer implementation
- OAuth provider system

### Mobile App
- React Native components
- OAuth flows and deep linking
- Integration API client
- Context and state management

### Testing & Deployment
- Testing procedures and checklists
- Verification scripts
- Troubleshooting guides
- Configuration setup

---

## Quick Start for Agents

When working on the Proxy Agent Platform:

1. **Check provider documentation** first - All integration-specific details are documented per provider
2. **Review architecture diagrams** - Understand the full system flow
3. **Follow testing guides** - Complete procedures with expected outputs
4. **Use troubleshooting sections** - Common issues and solutions are documented

---

## Contributing Documentation

When adding new documentation:

1. **Organize by provider** for integration docs:
   ```
   docs/providers/{ProviderName}/{Feature}.md
   ```

2. **Include these sections** in integration docs:
   - Overview
   - Architecture
   - Configuration
   - Implementation
   - Testing
   - Troubleshooting
   - API Reference

3. **Update README files** at each level to maintain navigation

---

## Related Resources

### Project Documentation
- [Main README](../../README.md) - Project overview
- [Architecture Overview](../../ARCHITECTURE_OVERVIEW.md) - System architecture
- [Development Guides](../../docs/guides/) - Setup and development
- [CLAUDE.md](../../CLAUDE.md) - Development guidelines for AI agents

### Testing & Verification
- [Verification Scripts](../../scripts/) - Configuration verification tools
- [Testing Guides](../../mobile/docs/) - Mobile app testing procedures

---

**Purpose**: This directory provides comprehensive documentation specifically organized for AI agents to efficiently understand, maintain, and extend the Proxy Agent Platform codebase.

**Maintained**: These docs are kept current with code changes and serve as the single source of truth for provider integrations.

**Last Updated**: November 10, 2025
