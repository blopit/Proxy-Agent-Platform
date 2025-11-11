# Frontend Agent - Quick Start

**Your Mission**: Develop and maintain the Expo/React Native mobile app (iOS, Android, Web)

**Last Updated**: November 10, 2025

---

## 🎯 Essential Reading (10 minutes)

**Read these FIRST** before any mobile development:

1. **[FRONTEND_CURRENT_STATE.md](../../docs/frontend/FRONTEND_CURRENT_STATE.md)** (5 min) - CRITICAL: Explains Expo migration from Next.js
2. **[Mobile README](../../mobile/README.md)** (3 min) - Mobile app overview
3. **[ARCHITECTURE_OVERVIEW.md](../../ARCHITECTURE_OVERVIEW.md)** (2 min) - Why `/mobile` is the frontend

## ⚠️ CRITICAL: Platform Changed in October 2025

**DO NOT** reference old Next.js web frontend docs - they're archived!

**Current Platform**:
- ✅ Expo/React Native (universal: iOS, Android, Web)
- ✅ Expo Router for navigation
- ✅ React Native Storybook
- ✅ TypeScript throughout
- ❌ Next.js (REMOVED October 2025)

## 🚀 Quick Start Commands

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run web      # Web browser
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator

# View Storybook
npm run storybook

# Run tests
npm test
```

## 📋 Common Tasks

### Task 1: Add a New Screen
**Read**: [Mobile Architecture](../../docs/mobile/IMPLEMENTATION_STATUS.md)
**Do**:
1. Create screen file in `mobile/app/(tabs)/`
2. Add to Expo Router navigation
3. Create components in `mobile/components/`
4. Build in Storybook first
5. Integrate with backend API

### Task 2: Create a New Component
**Read**: [Storybook Guide](../../mobile/docs/STORYBOOK_GUIDE.md)
**Do**:
1. Create component file in `mobile/components/`
2. Write Storybook stories in `.stories.tsx`
3. Build variations in Storybook
4. Add tests
5. Document in README

### Task 3: Integrate with Backend API
**Read**: [API Integration](../../docs/mobile/API_INTEGRATION.md)
**Do**:
1. Check API docs: `docs/backend/API_COMPLETE_REFERENCE.md`
2. Add endpoint to `mobile/src/api/`
3. Update TypeScript types
4. Add to service layer `mobile/src/services/`
5. Update components to use service

## 📚 Full Documentation

### Current State & Architecture
- **[FRONTEND_CURRENT_STATE.md](../../docs/frontend/FRONTEND_CURRENT_STATE.md)** - CRITICAL: Current platform status
- [Mobile Architecture](../../docs/mobile/IMPLEMENTATION_STATUS.md) - Implementation status
- [Data Flow](../../docs/mobile/DATA_FLOW.md) - How data moves through app
- [Screen by Screen Report](../../docs/mobile/SCREEN_BY_SCREEN_REPORT.md) - All screens

### Component Development
- [Component Patterns](../../docs/frontend/COMPONENT_PATTERNS.md) - React patterns
- [Mobile Component Organization](../../docs/frontend/MOBILE_COMPONENT_ORGANIZATION.md) - File structure
- [Interaction Patterns](../../docs/frontend/INTERACTION_PATTERNS.md) - UX patterns
- [Component Status](../../mobile/COMPONENTS_CONVERTED.md) - What's converted

### Design System
- [Design System](../../docs/frontend/DESIGN_SYSTEM.md) - Design principles
- [Design Principles](../../docs/frontend/DESIGN_PRINCIPLES.md) - Core principles
- [Visual Style Guide](../../docs/frontend/VISUAL_STYLE_GUIDE.md) - Visual design
- [Designer Guide](../../docs/frontend/DESIGNER_GUIDE.md) - For designers

### Storybook
- [Storybook Guide](../../mobile/docs/STORYBOOK_GUIDE.md) - Complete Storybook guide
- [Storybook](../../docs/frontend/STORYBOOK.md) - Storybook overview
- [Storybook Glossary](../../docs/frontend/STORYBOOK_GLOSSARY.md) - Terms and concepts

### API & Backend Integration
- [API Integration](../../docs/mobile/API_INTEGRATION.md) - How to integrate APIs
- [API Patterns](../../docs/frontend/API_PATTERNS.md) - API usage patterns
- [Mobile Responsive Patterns](../../docs/frontend/MOBILE_RESPONSIVE_PATTERNS.md) - Responsive design

### Development Guides
- [Developer Guide](../../docs/frontend/DEVELOPER_GUIDE.md) - General dev guide
- [New Developer Onboarding](../../docs/frontend/NEW_DEVELOPER_ONBOARDING.md) - Onboarding
- [Frontend Patterns](../../docs/frontend/FRONTEND_PATTERNS.md) - Code patterns
- [Frontend Pitfalls](../../docs/frontend/FRONTEND_PITFALLS.md) - Common mistakes
- [Quick Reference](../../docs/frontend/QUICK_REFERENCE.md) - Quick lookup

### Migration & Status
- [Expo Migration Plan](../../docs/guides/EXPO_MIGRATION_PLAN.md) - Migration guide
- [Mobile First Migration Template](../../docs/frontend/MOBILE_FIRST_MIGRATION_TEMPLATE.md) - Template
- [UI Improvement Plan](../../docs/mobile/UI_IMPROVEMENT_PLAN.md) - Improvements

### Task Specifications
- [Frontend Task Specs](../../docs/tasks/frontend/) - 20 specific tasks
  - FE-01: ChevronTaskFlow
  - FE-02: Mini Chevron Nav
  - FE-03: Mapper Restructure
  - ... and 17 more

## 📝 Quick Reference

### Key Directories
```
mobile/
├── app/                  # Expo Router screens (file-based routing)
│   ├── (tabs)/           # Tab navigation (5 biological modes)
│   │   ├── capture.tsx   # Capture mode
│   │   ├── scout.tsx     # Scout mode
│   │   ├── today.tsx     # Today mode
│   │   ├── mapper.tsx    # Mapper mode
│   │   └── hunter.tsx    # Hunter mode
│   ├── (auth)/           # Auth screens
│   └── _layout.tsx       # Root layout
├── components/           # React Native components
│   ├── core/             # Core UI components
│   ├── auth/             # Auth components
│   └── screens/          # Screen-specific components
├── src/
│   ├── api/              # API client
│   ├── services/         # Business logic services
│   ├── contexts/         # React contexts
│   └── types/            # TypeScript types
└── .rnstorybook/         # React Native Storybook config
```

### Key Files
- `mobile/app/_layout.tsx` - Root layout and navigation
- `mobile/app.json` - Expo configuration
- `mobile/package.json` - Dependencies
- `mobile/babel.config.js` - Babel configuration
- `mobile/README.md` - Mobile app documentation

### 5 Biological Workflow Modes
1. **Capture** - Brain dump everything (2-second capture)
2. **Scout** - Discover what's next
3. **Today** - View and manage today's tasks
4. **Mapper** - Reflect on progress
5. **Hunter** - Execute single task (full-screen focus)

## 🔍 When You're Stuck

1. **Check FRONTEND_CURRENT_STATE.md** - Explains current architecture
2. **Search mobile docs**: `rg "keyword" mobile/docs mobile/README.md`
3. **Look at existing components**: `mobile/components/`
4. **Build in Storybook first**: `npm run storybook`
5. **Check API docs**: `docs/backend/API_COMPLETE_REFERENCE.md`

## ⚠️ Important Notes

- **Platform is Expo/React Native** (NOT Next.js - that was removed Oct 2025)
- **Universal app**: Same code runs on iOS, Android, and Web
- **Storybook-first development**: Build components in isolation first
- **ADHD-optimized UX**: 2-second capture, dopamine rewards, minimal friction
- **Solarized Dark theme**: Consistent spacing and visual hierarchy

## 📊 Current Frontend Status

**Completion**: Mobile Phase 1 complete (~65%)
- ✅ 5 biological workflow modes
- ✅ Expo Router navigation
- ✅ Component Storybook
- ✅ OAuth authentication flows
- ✅ Universal deployment (iOS/Android/Web)
- 🟡 Backend integration (partial)
- ❌ Full real-time sync (pending)

**Active Development**:
- ChevronTaskFlow component (FE-01)
- Task breakdown modal (FE-11)
- Performance optimization (FE-20)

See [Mobile ADHD System Status](../../docs/frontend/MOBILE_ADHD_SYSTEM_STATUS.md) for details.

---

**Navigation**: [↑ Agent Resources](../README.md) | [📚 Docs Index](../../docs/INDEX.md) | [🎯 Project Root](../../README.md)
