# Architecture Agent - Quick Start

**Your Mission**: Design system architecture, define patterns, ensure technical consistency

**Last Updated**: November 10, 2025

---

## 🎯 Essential Reading (10 minutes)

1. **[System Overview](../../docs/architecture/system-overview.md)** (4 min) - Complete system architecture
2. **[ARCHITECTURE_OVERVIEW.md](../../ARCHITECTURE_OVERVIEW.md)** (3 min) - Monorepo structure
3. **[AI System Architecture](../../docs/architecture/AI_SYSTEM_ARCHITECTURE.md)** (3 min) - AI agent design

## 📚 Core Documentation

### System Architecture
- [System Overview](../../docs/architecture/system-overview.md) - Complete architecture
- [AI System Architecture](../../docs/architecture/AI_SYSTEM_ARCHITECTURE.md) - AI/agent design
- [AI System Enhancement Proposal](../../docs/architecture/AI_SYSTEM_ENHANCEMENT_PROPOSAL.md) - Proposed improvements
- [Agent Architecture Overview](../../docs/architecture/agent-architecture-overview.md) - Agent patterns

### Task Delegation System
- [Digital Task Delegation - Vision](../../docs/architecture/digital-task-delegation-vision-comprehensive.md)
- [Digital Task Delegation - Agent Design](../../docs/architecture/digital-task-delegation-agent-design.md)
- [Digital Task Delegation - Protocol](../../docs/architecture/digital-task-delegation-protocol.md)
- [Digital Task Delegation - Roadmap](../../docs/architecture/digital-task-delegation-roadmap.md)
- [Digital Task Delegation - System Design](../../docs/architecture/digital-task-delegation-system-design.md)
- [Digital Task Delegation - User Experience](../../docs/architecture/digital-task-delegation-user-experience.md)

### Design Systems & Frameworks
- [CHAMPS Framework](./design/CHAMPS_FRAMEWORK.md) - Core framework
- [Anti-Procrastination System](./design/ANTI_PROCRASTINATION_SYSTEM_DESIGN.md) - System design
- [Capture Hierarchy System](./design/CAPTURE_HIERARCHY_SYSTEM_REPORT.md) - Capture design
- [Energy Estimation Design](./design/ENERGY_ESTIMATION_DESIGN.md) - Energy tracking
- [Progress Bar System](./design/PROGRESS_BAR_SYSTEM_DESIGN.md) - Progress UX
- [Temporal Architecture](./design/TEMPORAL_ARCHITECTURE.md) - Time-based architecture
- [Temporal Knowledge Graph](./design/TEMPORAL_KG_DESIGN.md) - Knowledge graph
- [Extended Task Metadata](./design/EXTENDED_TASK_METADATA.md) - Task data model
- [Mapper Subtabs Brainstorm](./design/MAPPER_SUBTABS_BRAINSTORM.md) - Mapper design
- [Architecture Deep Dive](./design/ARCHITECTURE_DEEP_DIVE.md) - Deep technical dive

### Standards & Conventions
- [Naming Conventions](./design/NAMING_CONVENTIONS.md) - Entity-specific PKs, field naming
- [Tech Stack](../docs/references/TECH_STACK.md) - Technology choices
- [Repository Structure](../docs/references/REPOSITORY_STRUCTURE.md) - Codebase organization
- [CLAUDE.md](../../CLAUDE.md) - Development standards

### Integration Architecture
- [Pipelex Integration](../../docs/integration/pipelex/) - 15 integration docs

## 🎯 Your Responsibilities

1. **Define system architecture**: High-level design decisions
2. **Create design patterns**: Reusable architectural patterns
3. **Ensure consistency**: Maintain coherent architecture across features
4. **Review technical proposals**: Evaluate architectural impact
5. **Document patterns**: Keep architecture docs current

## 📊 Current Architecture Status

**Platform**: Monorepo with Python backend + Expo mobile app
- ✅ Backend: FastAPI, PostgreSQL, PydanticAI
- ✅ Mobile: Expo (iOS/Android/Web from one codebase)
- ✅ Communication: REST API + WebSocket
- ✅ Deployment: Backend server + mobile app bundles

**Key Patterns**:
- Repository pattern with entity-specific PKs
- Vertical slice architecture (tests next to code)
- Agent-based AI system
- ADHD-optimized UX patterns

See [System Overview](../../docs/architecture/system-overview.md) for full details.

---

**Navigation**: [↑ Agent Resources](../README.md) | [📚 Docs Index](../../docs/INDEX.md)
