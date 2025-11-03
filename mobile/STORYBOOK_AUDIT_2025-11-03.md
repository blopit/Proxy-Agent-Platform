# 📊 Storybook Audit - November 3, 2025

**Purpose**: Clarify Storybook setup and identify what needs cleanup

---

## 🎯 Executive Summary

**FINDING**: There is **ONLY ONE** Storybook in this project - React Native Expo Storybook in `mobile/`.

**NO ACTION NEEDED**: There is no React web Storybook to archive or delete.

**NEXT STEPS**: Migrate 9 existing story files from old structure to new tab-based organization.

---

## 📁 What We Found

### ✅ React Native Expo Storybook (mobile/)

**Location**: `mobile/.rnstorybook/`

**Configuration Files**:
- `mobile/.rnstorybook/index.ts` - Entry point
- `mobile/.rnstorybook/main.ts` - Storybook config
- `mobile/.rnstorybook/preview.tsx` - Global decorators
- `mobile/.rnstorybook/storybook.requires.ts` - Auto-generated story loader

**Package.json Script**:
```json
"storybook-generate": "sb-rn-get-stories"
```

**Dependencies**:
```json
"@storybook/addon-ondevice-actions": "^10.0.0",
"@storybook/addon-ondevice-controls": "^10.0.0",
"@storybook/react-native": "^10.0.0",
"storybook": "^10.0.2"
```

**Status**: ✅ **Active and working** - React Native on-device Storybook

---

### ❌ React Web Storybook (frontend/)

**Location**: Does NOT exist

**Findings**:
- ❌ No `.storybook/` directory in `frontend/`
- ❌ No `*.stories.*` files in `frontend/src/`
- ❌ No storybook scripts in `frontend/package.json`
- ❌ No active Storybook configuration

**Storybook packages in node_modules**:
- These are just dependency artifacts (pulled in by some other package)
- NOT actively used or configured
- Template files only (Header, Page, Button examples)

**Status**: ❌ **Does NOT exist** - No web Storybook to remove

---

## 📊 Story Files Inventory

### New Tab-Based Structure (mobile/src/components/) ✅

**Migrated (2 files)**:
1. `src/components/shared/ChevronElement.stories.tsx` ✅
   - Path: `Shared/Core/ChevronElement`
   - 8 story variations
   - **Status**: Properly organized

2. `src/components/mapper/ProfileSwitcher.stories.tsx` ✅
   - Path: `Mapper/ProfileSwitcher`
   - 6 story variations
   - **Status**: Properly organized

---

### Old Structure (mobile/components/) - NEEDS MIGRATION

**9 story files to migrate**:

#### 1. UI Components (2 files)
- `mobile/components/ui/Button.stories.tsx`
  - Title: `UI/Button`
  - **Destination**: `src/components/shared/Button.stories.tsx`
  - **New Path**: `Shared/UI/Button`

- `mobile/components/ui/Badge.stories.tsx`
  - Title: `UI/Badge`
  - **Destination**: `src/components/shared/Badge.stories.tsx`
  - **New Path**: `Shared/UI/Badge`

#### 2. Core Components (4 files)
- `mobile/components/core/BiologicalTabs.stories.tsx`
  - Title: `Core/BiologicalTabs`
  - **Destination**: `src/components/shared/BiologicalTabs.stories.tsx`
  - **New Path**: `Shared/Core/BiologicalTabs` (used in main navigation)

- `mobile/components/core/EnergyGauge.stories.tsx`
  - Title: `Core/EnergyGauge`
  - **Destination**: `src/components/today/EnergyGauge.stories.tsx` OR `shared/`
  - **New Path**: `Today/EnergyGauge` (if Today tab specific) or `Shared/Core/EnergyGauge`

- `mobile/components/core/SimpleTabs.stories.tsx`
  - Title: `Core/SimpleTabs`
  - **Destination**: `src/components/shared/SimpleTabs.stories.tsx`
  - **New Path**: `Shared/Core/SimpleTabs`

- `mobile/components/core/ChevronButton.stories.tsx`
  - Title: `Core/ChevronButton`
  - **Destination**: `src/components/shared/ChevronButton.stories.tsx`
  - **New Path**: `Shared/Core/ChevronButton`

#### 3. Card Components (2 files)
- `mobile/components/cards/SuggestionCard.stories.tsx`
  - **Destination**: Depends on context - likely `scout/` or `capture/`
  - **New Path**: TBD based on usage

- `mobile/components/cards/TaskCardBig.stories.tsx`
  - Title: `Cards/TaskCardBig`
  - **Destination**: `src/components/scout/TaskCardBig.stories.tsx` (browsing tasks)
  - **New Path**: `Scout/TaskCardBig`

#### 4. Connection Components (1 file)
- `mobile/components/connections/ConnectionElement.stories.tsx`
  - **Destination**: `src/components/mapper/ConnectionElement.stories.tsx` (profile/settings)
  - **New Path**: `Mapper/ConnectionElement`

---

### Template Files - TO DELETE

**3 default Storybook examples** (not real components):
- `mobile/.rnstorybook/stories/Button.stories.tsx`
- `mobile/.rnstorybook/stories/Page.stories.tsx`
- `mobile/.rnstorybook/stories/Header.stories.tsx`

**Action**: Delete these - they're just Storybook templates

---

## 🎯 Migration Plan

### Phase 1: Move Component Files

For each of the 9 story files:
1. Move the `.tsx` component file to new location
2. Move the `.stories.tsx` file to new location
3. Update story `title:` to match new tab-based path

### Phase 2: Update Story Paths

**Pattern**:
```typescript
// OLD
const meta = {
  title: 'UI/Button',
  component: Button,
}

// NEW
const meta = {
  title: 'Shared/UI/Button',
  component: Button,
}
```

### Phase 3: Clean Up

1. Delete old `mobile/components/` directory
2. Delete template files in `mobile/.rnstorybook/stories/`
3. Verify Storybook loads all stories correctly

---

## 📋 Detailed Migration Mapping

| Old Location | Old Title | New Location | New Title | Tab Assignment |
|--------------|-----------|--------------|-----------|----------------|
| `components/ui/Button.tsx` | `UI/Button` | `src/components/shared/Button.tsx` | `Shared/UI/Button` | Cross-tab |
| `components/ui/Badge.tsx` | `UI/Badge` | `src/components/shared/Badge.tsx` | `Shared/UI/Badge` | Cross-tab |
| `components/core/BiologicalTabs.tsx` | `Core/BiologicalTabs` | `src/components/shared/BiologicalTabs.tsx` | `Shared/Core/BiologicalTabs` | Main nav |
| `components/core/EnergyGauge.tsx` | `Core/EnergyGauge` | `src/components/today/EnergyGauge.tsx` | `Today/EnergyGauge` | Today tab |
| `components/core/SimpleTabs.tsx` | `Core/SimpleTabs` | `src/components/shared/SimpleTabs.tsx` | `Shared/Core/SimpleTabs` | Cross-tab |
| `components/core/ChevronButton.tsx` | `Core/ChevronButton` | `src/components/shared/ChevronButton.tsx` | `Shared/Core/ChevronButton` | Cross-tab |
| `components/cards/SuggestionCard.tsx` | `Cards/SuggestionCard` | `src/components/capture/SuggestionCard.tsx` | `Capture/SuggestionCard` | Capture tab |
| `components/cards/TaskCardBig.tsx` | `Cards/TaskCardBig` | `src/components/scout/TaskCardBig.tsx` | `Scout/TaskCardBig` | Scout tab |
| `components/connections/ConnectionElement.tsx` | `Connections/ConnectionElement` | `src/components/mapper/ConnectionElement.tsx` | `Mapper/ConnectionElement` | Mapper tab |

---

## ✅ Verification Checklist

After migration, verify:

- [ ] All 14 story files render in Storybook
- [ ] Story paths follow tab-based hierarchy
- [ ] No broken imports
- [ ] Old `mobile/components/` directory is deleted
- [ ] Template files in `.rnstorybook/stories/` are deleted
- [ ] Storybook starts without errors: `cd mobile && npm run storybook`
- [ ] All stories appear in correct sections:
  - Capture/
  - Scout/
  - Hunter/
  - Today/
  - Mapper/
  - Shared/Core/
  - Shared/UI/

---

## 🎉 Conclusion

**Original Concern**: "We have multiple storybooks (React web + React Native)"

**Reality**: We only have React Native Expo Storybook. No web Storybook exists.

**Actual Task**: Migrate 9 existing story files from old flat structure to new tab-based organization.

**Status**: Ready to execute migration

**Next Session**: Run migration script or manually migrate the 9 story files

---

**Date**: November 3, 2025
**Audit Completed By**: Claude Code
**Status**: ✅ Audit Complete - No archiving needed
