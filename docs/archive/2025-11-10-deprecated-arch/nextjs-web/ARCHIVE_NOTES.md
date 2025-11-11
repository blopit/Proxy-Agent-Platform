# Deprecated Next.js Web Frontend - Archive Notes

**Archived**: November 10, 2025
**Deprecated**: October 2025
**Status**: REMOVED - No longer part of codebase

## What's Here

Documentation for the removed Next.js web frontend (deprecated Oct 2025):

- FRONTEND_ENTRY_POINT.md - Old web app entry point
- FRONTEND_ARCHITECTURE.md - Next.js architecture (removed)
- DONT_RECREATE.md - Warning about removed components
- CHEVRON_DEBUG_GUIDE.md - Chevron component debugging (web)
- CHEVRON_TESTING_GUIDE.md - Chevron component testing (web)
- COMPONENT_DESIGN_REVIEW.md - Component review (web)
- COMPONENT_USAGE_REPORT.md - Component usage (web)
- AGENT_STORYBOOK_ENTRY_POINT.md - Old web Storybook
- DESIGN_SYSTEM_MIGRATION_PLAN.md - Old migration plan
- DESIGN_SYSTEM_STATUS.md - Old design system status
- PROGRESS_BAR_IMPROVEMENTS.md - Old improvements
- REORGANIZATION_BUGFIX.md - Old bugfix
- VOICE_INPUT_IMPLEMENTATION.md - Old implementation

## Why Archived

**Migration to Expo (October 2025)**:
- Next.js web frontend was completely removed
- Platform migrated to mobile-first Expo/React Native
- All components converted to Expo equivalents
- Web support now provided through Expo Web (not Next.js)

## ⚠️ IMPORTANT

**DO NOT USE THIS DOCUMENTATION** for current development:
- These docs describe REMOVED code
- Next.js frontend no longer exists in codebase
- Web app is now Expo Web (in /mobile directory)

## Current Replacement Documentation

**Use these instead**:
- **Primary**: docs/frontend/FRONTEND_CURRENT_STATE.md - Explains Expo migration
- **Mobile**: docs/mobile/ - Current Expo/React Native docs
- **Components**: mobile/README.md - Current component structure
- **Storybook**: mobile/docs/STORYBOOK_GUIDE.md - Expo Storybook
- **Architecture**: ARCHITECTURE_OVERVIEW.md - Monorepo structure

## Valuable Information (Extract if Needed)

Some patterns may still be relevant for Expo:
- **Component patterns**: General React patterns may apply to React Native
- **Chevron UX concepts**: The UX ideas (not implementation) may be valuable
- **Design system principles**: High-level design principles transcend framework

## ❌ DO NOT

- Recreate Next.js components
- Follow Next.js architecture patterns
- Reference these docs for new features
- Use web-specific component implementations

---

**Status**: Historical record only. Platform is now Expo-based mobile-first.
