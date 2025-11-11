# Agent Resources

**Central documentation and task tracking for the Proxy Agent Platform**

Last Updated: November 10, 2025

---

## 📂 Directory Structure

```
Agent_Resources/
├── README.md                    # This file - overview and navigation
├── STATUS.md                    # What's complete vs. what needs work
├── docs/                        # Technical documentation
│   ├── authentication/          # Auth & user management
│   ├── onboarding/             # Onboarding system
│   └── providers/              # Integration providers (Gmail, etc.)
└── tasks/                      # Implementation plans & roadmaps
    └── ONBOARDING_INTEGRATION.md
```

---

## 🎯 Quick Navigation

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
