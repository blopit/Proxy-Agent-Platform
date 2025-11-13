# 📚 Documentation Hub

**Last Updated**: November 13, 2025

> **✅ Documentation Consolidation Complete (Nov 13, 2025)**
>
> All active documentation is now in **[`agent_resources/`](../agent_resources/README.md)**.
> This directory now only contains **historical archives**.

---

## 🤖 Active Documentation (agent_resources/)

**All organized, active documentation is in [agent_resources/](../agent_resources/README.md)**

### Quick Links

| Role | Quick Start | Documentation |
|------|-------------|---------------|
| **All Roles** | [5-Min Quick Start](../agent_resources/QUICKSTART.md) | [Complete Sitemap](../agent_resources/SITEMAP.md) |
| **Backend Dev** | [Backend README](../agent_resources/backend/README.md) | [API Reference](../agent_resources/backend/api/API_REFERENCE.md) |
| **Frontend Dev** | [Frontend README](../agent_resources/frontend/README.md) | [Current State](../agent_resources/frontend/FRONTEND_CURRENT_STATE.md) |
| **Architect** | [Architecture README](../agent_resources/architecture/README.md) | [System Overview](../agent_resources/architecture/system-overview.md) |
| **QA Engineer** | [Testing README](../agent_resources/testing/README.md) | [Test Strategy](../agent_resources/testing/00_OVERVIEW.md) |
| **Project Manager** | [Project README](../agent_resources/project/README.md) | [Project Status](../agent_resources/STATUS.md) |

### Documentation Categories in agent_resources/

```
agent_resources/
├── README.md                    # Main navigation hub
├── QUICKSTART.md                # 5-minute quick start
├── SITEMAP.md                   # Complete documentation index
├── STATUS.md                    # Current project status
│
├── backend/                     # Backend development
│   ├── api/                     # API documentation
│   ├── tasks/                   # Backend task tracking
│   ├── DEPRECATION_NOTICE.md    # Deprecated APIs
│   └── INTEGRATION_GUIDE.md     # Integration guides
│
├── frontend/                    # Frontend development
│
├── architecture/                # System architecture
│   ├── design/                  # Design documents
│   ├── system-overview.md       # Complete system overview
│   ├── AI_SYSTEM_ARCHITECTURE.md
│   └── digital-task-delegation-* # Task delegation docs
│
├── testing/                     # Testing guides
│   ├── 00_OVERVIEW.md through 06_QUICK_START.md
│   └── README.md
│
├── project/                     # Project management
│
├── docs/                        # Core documentation
│   ├── getting-started/         # Onboarding guides
│   ├── references/              # Core knowledge
│   ├── guides/                  # Implementation guides
│   ├── authentication/          # Auth system
│   ├── onboarding/              # Onboarding system
│   ├── providers/               # Integration providers
│   ├── integration/             # Pipelex and other integrations
│   ├── devops/                  # DevOps and deployment
│   └── workflows/               # Development workflows
│
├── tasks/                       # Task tracking
│   ├── roadmap/                 # Current sprint & priorities
│   └── archives/                # Historical tasks
│
└── reports/                     # Time-bound reports
    └── README.md                # Report guidelines
```

---

## 📦 Historical Archives (docs/archive/)

This directory contains **historical documentation** from past development phases:

### Archive Organization

```
docs/archive/
├── 2025-11-13-*/               # Nov 13, 2025 consolidation archives
├── 2025-11-10-*/               # Nov 10, 2025 reorganization archives
├── 2025-11-09-cleanup/         # Nov 9, 2025 cleanup archives
└── [older archives...]         # Historical snapshots
```

### What's Archived

- **Completion Reports**: Historical feature completion summaries
- **Status Reports**: Past status snapshots
- **Deprecated Docs**: Documentation for removed/deprecated features
- **Old Planning**: Historical planning documents
- **Reorganization Artifacts**: Previous documentation structures

### When to Reference Archives

- Understanding past decisions
- Tracking feature evolution
- Learning from completed work
- Historical context for current features

**Note**: Archives are not updated. For current information, use [agent_resources/](../agent_resources/README.md).

---

## 🔍 Finding Documentation

### Quick Search

```bash
# Search all active documentation
rg "search term" agent_resources/ -i --heading

# Search specific category
rg "authentication" agent_resources/docs/ -i

# Search historical archives
rg "old feature" docs/archive/ -i
```

### By Topic

| Topic | Location |
|-------|----------|
| **Architecture** | [agent_resources/architecture/](../agent_resources/architecture/README.md) |
| **Backend API** | [agent_resources/backend/api/](../agent_resources/backend/api/API_REFERENCE.md) |
| **Frontend** | [agent_resources/frontend/](../agent_resources/frontend/README.md) |
| **Testing** | [agent_resources/testing/](../agent_resources/testing/README.md) |
| **Authentication** | [agent_resources/docs/authentication/](../agent_resources/docs/authentication/01_overview.md) |
| **Onboarding** | [agent_resources/docs/onboarding/](../agent_resources/docs/onboarding/00_OVERVIEW.md) |
| **DevOps** | [agent_resources/docs/devops/](../agent_resources/docs/devops/README.md) |
| **Integrations** | [agent_resources/docs/integration/](../agent_resources/docs/integration/pipelex/README.md) |
| **Workflows** | [agent_resources/docs/workflows/](../agent_resources/docs/workflows/AI_CODING_WORKFLOWS.md) |
| **Project Status** | [agent_resources/STATUS.md](../agent_resources/STATUS.md) |

---

## 📚 Documentation Principles

### Active vs. Archive

| Active (agent_resources/) | Archive (docs/archive/) |
|---------------------------|-------------------------|
| ✅ Current, maintained docs | ❌ Historical snapshots |
| ✅ Updated regularly | ❌ Not updated |
| ✅ Linked from main navigation | ❌ Reference only |
| ✅ Reflects current codebase | ❌ May be outdated |

### Finding What You Need

1. **Start with [agent_resources/README.md](../agent_resources/README.md)** - Main navigation hub
2. **Use role-specific quick starts** - Fastest onboarding (10-15 min)
3. **Check [SITEMAP.md](../agent_resources/SITEMAP.md)** - Complete index of all docs
4. **Search with rg** - Fast text search across all documentation

---

## 🎯 Quick Actions

```bash
# Navigate to active documentation
cd agent_resources/

# Quick start for your role
open agent_resources/backend/README.md    # Backend developers
open agent_resources/frontend/README.md   # Frontend developers
open agent_resources/architecture/README.md # Architects
open agent_resources/testing/README.md    # QA engineers
open agent_resources/project/README.md    # Project managers

# Search all documentation
rg "keyword" agent_resources/ -i --heading

# View project status
cat agent_resources/STATUS.md
```

---

**Navigation**: [↑ Project Root](../) | [🤖 Agent Resources](../agent_resources/README.md) | [🎯 Quick Start](../agent_resources/QUICKSTART.md)
