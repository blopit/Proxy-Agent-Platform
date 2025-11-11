# Agent Resources - Documentation

This directory contains comprehensive documentation and resources for AI agents working with the Proxy Agent Platform codebase.

## Directory Structure

```
Agent_Resources/
├── docs/
│   ├── providers/           # Provider integration documentation
│   │   └── Google/          # Google-based integrations
│   │       ├── Gmail.md     # Gmail integration guide
│   │       └── README.md    # Google provider overview
│   └── README.md           # This file
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
