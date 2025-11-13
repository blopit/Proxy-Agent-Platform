# Agent Resources

**Central documentation and task tracking for the Proxy Agent Platform**

Last Updated: November 13, 2025

---

## 🚀 Quick Start

- **[5-Minute Quick Start](QUICKSTART.md)** - Get up and running fast
- **[Complete Sitemap](SITEMAP.md)** - Full directory index with all 92 docs
- **[Project Status](STATUS.md)** - Current state and priorities
- **[Current Sprint](tasks/roadmap/current_sprint.md)** - Active tasks

---

## 📂 Directory Structure

```
agent_resources/
├── README.md                       # This file - main navigation hub
├── STATUS.md                       # Current project status & priorities
├── QUICKSTART.md                   # 5-minute quick start guide
├── SITEMAP.md                      # Complete documentation index
│
├── backend/                        # Backend development resources
│   ├── README.md                   # Backend quick start
│   ├── api/                        # API documentation (flattened)
│   └── THINGS_TO_UPDATE.md
│
├── frontend/                       # Frontend development resources
│   ├── README.md                   # Frontend quick start
│   └── THINGS_TO_UPDATE.md
│
├── architecture/                   # Architecture & design resources
│   ├── README.md                   # Architecture overview
│   ├── design/                     # Design documents (flattened)
│   └── THINGS_TO_UPDATE.md
│
├── testing/                        # Testing resources (consolidated)
│   ├── README.md                   # Testing guide index
│   ├── 00_OVERVIEW.md through 06_QUICK_START.md
│   └── THINGS_TO_UPDATE.md
│
├── docs/                          # Core documentation
│   ├── getting-started/            # Onboarding guides
│   ├── references/                 # Core project knowledge
│   ├── guides/                     # Implementation guides
│   ├── authentication/             # Auth system docs
│   ├── onboarding/                # Onboarding system
│   └── providers/                 # Integration providers
│
├── tasks/                         # Task tracking & roadmaps
│   ├── roadmap/                   # Current sprint & priorities
│   └── archives/                  # Historical tasks
│
├── project/                       # Project management
│   └── docs/
│
└── reports/                       # Analysis & reports
    └── README.md
```

---

## 🎯 Quick Navigation

###🗺️ **By Role**

| Role | Quick Start | Key Resources |
|------|-------------|---------------|
| **Backend Dev** | [backend/README.md](backend/README.md) | [API Reference](backend/api/API_REFERENCE.md), [Testing](testing/01_UNIT_TESTING.md) |
| **Frontend Dev** | [frontend/README.md](frontend/README.md) | [Components](docs/guides/TASK_CARD_BREAKDOWN.md), [Auth](docs/authentication/04_frontend_authentication.md) |
| **Architect** | [architecture/README.md](architecture/README.md) | [Design Docs](architecture/design/), [Vision](docs/references/PROJECT_VISION_SYNTHESIS.md) |
| **QA Engineer** | [testing/README.md](testing/README.md) | [Strategy](testing/00_OVERVIEW.md), [Quick Start](testing/06_QUICK_START.md) |
| **Project Manager** | [STATUS.md](STATUS.md) | [Sprint](tasks/roadmap/current_sprint.md), [Next Tasks](tasks/roadmap/next_5_tasks.md) |

---

## 📊 Documentation Flow

```
New Developer → QUICKSTART.md (5 min)
                    ↓
            Choose Your Role
            /     |    \     \
     Backend  Frontend  Architect  QA
        ↓        ↓         ↓        ↓
   backend/  frontend/  architecture/ testing/
   README    README     README       README
        ↓        ↓         ↓          ↓
   API docs  Components  Design    Test guides

All paths lead to:
→ SITEMAP.md (find anything)
→ STATUS.md (current state)
→ tasks/ (work to do)
```

---

## 🔗 Documentation Pathways

### Learning Path (New to Project)
1. Start: [QUICKSTART.md](QUICKSTART.md) - 5-minute overview
2. Vision: [PROJECT_VISION_SYNTHESIS.md](docs/references/PROJECT_VISION_SYNTHESIS.md) - Why we build this
3. Structure: [REPOSITORY_STRUCTURE.md](docs/references/REPOSITORY_STRUCTURE.md) - Code organization
4. Choose role above and dive in

### Implementation Path (Ready to Code)
1. Status: [STATUS.md](STATUS.md) - What's done/what's needed
2. Sprint: [current_sprint.md](tasks/roadmap/current_sprint.md) - This week's work
3. Next: [next_5_tasks.md](tasks/roadmap/next_5_tasks.md) - Upcoming tasks
4. Code: Follow your role's README above

### Research Path (Understanding the System)
1. Index: [SITEMAP.md](SITEMAP.md) - All 92 docs cataloged
2. Search: `./scripts/search-docs.sh "keyword"` - Find what you need
3. Architecture: [architecture/README.md](architecture/README.md) - System design
4. Deep dive into specific area

### 📖 Documentation

#### Authentication System
- [Overview](docs/authentication/01_overview.md) - Authentication architecture
- [Database Schema](docs/authentication/02_database_schema.md) - User tables and relationships
- [Backend Auth](docs/authentication/03_backend_authentication.md) - FastAPI implementation
- [Frontend Auth](docs/authentication/04_frontend_authentication.md) - React Native implementation
- [OAuth Integration](docs/authentication/05_oauth_integration.md) - Google, Apple, GitHub OAuth
- [Onboarding Flow](docs/authentication/06_onboarding_flow.md) - User onboarding
- [API Reference](docs/authentication/07_api_reference.md) - Authentication endpoints

#### Onboarding System
- [Overview](docs/onboarding/00_OVERVIEW.md) - Architecture and purpose
- [Frontend](docs/onboarding/01_FRONTEND.md) - React Native screens and state
- [Backend](docs/onboarding/02_BACKEND.md) - FastAPI endpoints and service
- [Data Models](docs/onboarding/03_DATA_MODELS.md) - Types, schemas, database
- [Quick Start](docs/onboarding/04_QUICK_START.md) - Setup and testing guide

#### Integration Providers
- [Google Provider](docs/providers/Google/README.md) - Google integration overview
- [Gmail Integration](docs/providers/Google/Gmail.md) - Gmail OAuth and API

---

## 🚀 Tasks & Implementation Plans

### Current Tasks

1. **[ONBOARDING_INTEGRATION.md](tasks/ONBOARDING_INTEGRATION.md)** - 🔴 **CRITICAL**
   - **Problem**: Onboarding data is collected but not used
   - **Impact**: Users see no personalization
   - **Priority**: HIGH
   - **Status**: Ready for implementation
   - **Phase 1**: Foundation (UserPreferencesService)
   - **Phase 2**: Quick Wins (Adaptive UI, Smart Scheduling)
   - **Phase 3**: Advanced Features (Goal tracking, Challenge assistance)
   - **Phase 4**: Settings & Visibility

---

## 📊 Project Status

For detailed status of what's complete vs. what needs work, see **[STATUS.md](STATUS.md)**.

### High-Level Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication Backend | ✅ Complete | JWT, OAuth, refresh tokens |
| Authentication Frontend | ✅ Complete | Login, signup, OAuth flows |
| Onboarding Backend | ✅ Complete | API, service, database |
| Onboarding Frontend | ✅ Complete | 7-step flow, state management |
| **Onboarding Integration** | 🔴 **Not Started** | Data collected but not used |
| Gmail Integration | ✅ Complete | OAuth and message fetching |

---

## 🎯 Next Steps

### Immediate Priorities (This Week)

1. **Review [ONBOARDING_INTEGRATION.md](tasks/ONBOARDING_INTEGRATION.md)**
   - Understand the problem and proposed solution
   - Get team buy-in on approach

2. **Implement Phase 1: Foundation**
   - Backend: `UserPreferencesService`
   - Frontend: `useUserPreferences` hook
   - Tests for both

3. **Ship Phase 2: Quick Wins**
   - Adaptive UI elements
   - Smart scheduling
   - Personalized dashboard
   - **Goal**: Users see personalization within 1 minute of completing onboarding

### Medium-Term (Next 2 Weeks)

1. **Implement Phase 3: Advanced Features**
   - Goal-aligned metrics
   - Challenge-specific assistance
   - Work mode adaptations

2. **Add Phase 4: Settings & Visibility**
   - Preferences impact dashboard
   - Allow re-onboarding
   - Help documentation

3. **Measure Success**
   - User surveys on personalization
   - Analytics on feature usage
   - A/B testing results

---

## 🔍 How to Use This Directory

### For Developers

1. **Starting a new feature?**
   - Check `docs/` for relevant technical documentation
   - Check `tasks/` for implementation plans
   - Update `STATUS.md` when complete

2. **Need to understand a system?**
   - Start with the `README.md` in each `docs/` subdirectory
   - Follow the numbered guides (01, 02, 03, etc.)
   - Use Quick Start guides for hands-on setup

3. **Found a gap or issue?**
   - Document it in `STATUS.md` under "Known Issues"
   - Create a task document in `tasks/` if it requires implementation
   - Update this README with navigation links

### For Product/Design

1. **Understanding what's built?**
   - Read `STATUS.md` for high-level overview
   - Check Overview documents (`00_OVERVIEW.md`, `01_overview.md`)
   - Review implementation plans in `tasks/`

2. **Planning new features?**
   - Create a task document in `tasks/` outlining the plan
   - Link to relevant technical docs
   - Define success metrics and acceptance criteria

### For QA

1. **What to test?**
   - Check `STATUS.md` for recently completed features
   - Use Quick Start guides for setup
   - Reference API documentation for endpoints

2. **Creating test plans?**
   - Review Data Models docs for edge cases
   - Check task documents for acceptance criteria
   - Use implementation plans to understand expected behavior

---

## 📝 Documentation Standards

All documentation in this directory follows these standards:

- **Markdown format** (`.md` files)
- **Clear structure** with headers and navigation
- **Code examples** where applicable
- **Up-to-date status** indicators (✅ ❌ 🔴 🟡 🟢)
- **Last updated** dates
- **Owner** or responsible team noted

### When to Update

- **After implementing a feature**: Update `STATUS.md` and relevant docs
- **When finding issues**: Document in `STATUS.md` under "Known Issues"
- **Before starting work**: Review and update task documents
- **After major changes**: Update architecture/overview docs

---

## 🤝 Contributing

### Adding New Documentation

1. Create files in appropriate `docs/` subdirectory
2. Follow numbering convention (01, 02, 03...)
3. Update the README in that subdirectory
4. Add navigation links to this file

### Creating Task Documents

1. Add to `tasks/` directory
2. Use `FEATURE_NAME_TASK.md` naming
3. Include:
   - Problem statement
   - Proposed solution
   - Implementation phases
   - Acceptance criteria
   - Code examples
4. Link from this README

---

## 📚 Additional Resources

### External Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Native Docs](https://reactnavigation.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Pydantic V2](https://docs.pydantic.dev/)

### Project Documentation (Root)
- `/docs/` - General project documentation
- `/mobile/docs/` - Mobile app-specific docs
- `/src/agents/README.md` - Agent system overview
- `/CLAUDE.md` - Development guidelines

---

## 🐛 Known Issues & Gaps

See **[STATUS.md](STATUS.md)** for detailed list of:
- Incomplete features
- Technical debt
- Performance concerns
- Security considerations
- User experience gaps

---

## 💡 Questions?

- **Technical questions**: Check relevant docs/ subdirectory
- **Implementation questions**: Review tasks/ documents
- **Status questions**: See STATUS.md
- **Setup questions**: Use Quick Start guides

---

**Maintained by**: Engineering Team
**Last Major Update**: November 10, 2025
**Status**: 🟢 Active Development
