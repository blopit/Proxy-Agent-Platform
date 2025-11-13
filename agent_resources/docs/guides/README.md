# Implementation Guides

**Location**: `agent_resources/docs/guides/`
**Last Updated**: November 10, 2025

---

## Overview

Step-by-step guides for implementing features, workflows, and processes in the Proxy Agent Platform.

---

## Contents

### Development Workflows

#### [AGENT_DEVELOPMENT_ENTRY_POINT.md](./AGENT_DEVELOPMENT_ENTRY_POINT.md)
**Last Updated**: Varies | **Importance**: High

Entry point for AI agent development:
- Agent system architecture
- How to create new agents
- Agent communication patterns
- Testing agent behavior
- Best practices for agent development

**Who needs this**: Backend developers working on agent system

---

#### [HUMAN_AGENT_WORKFLOW.md](./HUMAN_AGENT_WORKFLOW.md)
**Last Updated**: Varies | **Importance**: Medium

Workflow for human-agent collaboration:
- How humans interact with agents
- Delegation patterns
- Feedback loops
- Error handling
- Best practices

**Who needs this**: Product designers, backend developers

---

### System Workflows

#### [BEAST_LOOP_SYSTEM.md](./BEAST_LOOP_SYSTEM.md)
**Last Updated**: Varies | **Importance**: High

BEAST Loop (Behavior-Evaluation-Action-State-Transition) system documentation:
- Loop architecture
- State management
- Event handling
- Integration points
- Implementation examples

**Who needs this**: Backend developers, architects

---

### Feature Implementation

#### [TASK_CARD_BREAKDOWN.md](./TASK_CARD_BREAKDOWN.md)
**Last Updated**: Varies | **Importance**: High

Guide for task breakdown and card system:
- Task decomposition strategies
- Card UI components
- Interaction patterns
- Data models
- Implementation guide

**Who needs this**: Frontend developers, UX designers

---

#### [FOCUS_MODE_GUIDE.md](./FOCUS_MODE_GUIDE.md)
**Last Updated**: Nov 1, 2025 | **Importance**: Medium

Focus mode feature guide:
- Feature overview
- Implementation details
- UI/UX patterns
- Timer management
- Integration with other features

**Who needs this**: Frontend developers

---

## Guide Categories

### By Role

**Backend Developers**:
- [AGENT_DEVELOPMENT_ENTRY_POINT.md](./AGENT_DEVELOPMENT_ENTRY_POINT.md) - Agent system
- [BEAST_LOOP_SYSTEM.md](./BEAST_LOOP_SYSTEM.md) - Core workflow
- [HUMAN_AGENT_WORKFLOW.md](./HUMAN_AGENT_WORKFLOW.md) - Human-agent interaction

**Frontend Developers**:
- [TASK_CARD_BREAKDOWN.md](./TASK_CARD_BREAKDOWN.md) - Task UI components
- [FOCUS_MODE_GUIDE.md](./FOCUS_MODE_GUIDE.md) - Focus mode feature
- [HUMAN_AGENT_WORKFLOW.md](./HUMAN_AGENT_WORKFLOW.md) - UI interactions

**Product/Design**:
- [TASK_CARD_BREAKDOWN.md](./TASK_CARD_BREAKDOWN.md) - Task UX patterns
- [FOCUS_MODE_GUIDE.md](./FOCUS_MODE_GUIDE.md) - Focus mode UX
- [HUMAN_AGENT_WORKFLOW.md](./HUMAN_AGENT_WORKFLOW.md) - Interaction design

---

## Related Documentation

### Architecture
- [System Architecture](../../architecture/README.md)
- [Design Documents](../../architecture/design/)

### Backend
- [Backend Documentation](../../backend/README.md)
- [API Reference](../../backend/api/README.md)

### Frontend
- [Frontend Documentation](../../frontend/README.md)
- [Component Library](../../frontend/docs/)

### Getting Started
- [Backend Developer Start](../getting-started/BACKEND_DEVELOPER_START.md)
- [Frontend Developer Start](../getting-started/FRONTEND_DEVELOPER_START.md)

---

## Archived Guides

The following guides have been archived as outdated or completed:
- **OAuth Integration Guides** - Moved to `docs/archive/2025-11-10-guides-archived/`
  - Superseded by comprehensive auth documentation
- **Dogfooding Guides** - Historical development process documentation
- **Migration Plans** - Completed migrations (e.g., Expo migration)

See: [docs/archive/2025-11-10-guides-archived/](../../../docs/archive/2025-11-10-guides-archived/)

---

## Contributing

### Adding New Guides

When creating a new implementation guide:

1. **Choose a clear title**: Use format `FEATURE_NAME_GUIDE.md`
2. **Include sections**:
   - Overview
   - Prerequisites
   - Implementation Steps
   - Code Examples
   - Testing
   - Troubleshooting
3. **Update this README** with:
   - Guide description
   - Target audience
   - Last updated date
4. **Link related docs**: Reference architecture, API, or design docs

---

## Maintenance

### When to Update

- Feature implementation changes
- New workflows added
- Best practices evolved
- User feedback identifies gaps

### Review Schedule

- Quarterly review of all guides
- Update after major feature releases
- Archive guides for deprecated features

---

**Navigation**: [↑ Agent Resources](../../README.md) | [↑ Documentation](../README.md)
