# Frontend Documentation - Things to Update

**Last Reviewed**: November 10, 2025
**Priority**: High = update soon, Medium = review, Low = minor

---

## 🔴 High Priority Updates

### 1. Frontend Current State
**File**: `docs/frontend/FRONTEND_CURRENT_STATE.md`
**Issue**: CRITICAL - verify reflects latest Expo state (last updated Oct 30?)
**Action**:
- Update completion percentages
- Verify "What Changed" section is current
- Check if recent OAuth work is mentioned
- Update "What's Next" section

### 2. Mobile Implementation Status
**File**: `docs/mobile/IMPLEMENTATION_STATUS.md`
**Issue**: May have outdated screen status
**Action**:
- Review all 5 biological mode screens
- Update OAuth/onboarding screen status
- Check component completion status
- Verify API integration status

### 3. Component Status
**File**: Mobile app may have COMPONENTS_CONVERTED.md
**Issue**: Check if all Expo components are listed
**Action**:
- Verify all converted components are documented
- Mark components as complete/in-progress/pending
- Note any components removed during Expo migration

---

## 🟡 Medium Priority Updates

### 4. Storybook Documentation
**Files**: `mobile/docs/STORYBOOK_GUIDE.md`, `docs/frontend/STORYBOOK.md`
**Issue**: Check if Expo Storybook patterns are current
**Action**:
- Verify Storybook setup instructions work
- Update component organization if changed
- Add examples of new story patterns
- Check .rnstorybook configuration is documented

### 5. Mobile ADHD System Status
**File**: `docs/frontend/MOBILE_ADHD_SYSTEM_STATUS.md`
**Issue**: Check completion of ADHD features
**Action**:
- Update dopamine reward system status
- Check 2-second capture implementation
- Verify energy-aware task matching status
- Update visual progress tracking status

### 6. API Integration Documentation
**File**: `docs/mobile/API_INTEGRATION.md`
**Issue**: Verify API client patterns are current
**Action**:
- Check if mobile/src/api/ structure is documented
- Verify OAuth integration patterns
- Update request/response examples
- Check error handling patterns

---

## 🟢 Low Priority Updates

### 7. Component Patterns
**File**: `docs/frontend/COMPONENT_PATTERNS.md`
**Issue**: Verify patterns apply to React Native
**Action**:
- Check if patterns translate from React to React Native
- Add React Native-specific patterns if needed
- Update examples to use Expo components

### 8. Design System Documentation
**Files**: `docs/frontend/DESIGN_SYSTEM.md`, `VISUAL_STYLE_GUIDE.md`
**Issue**: Verify design system applies to mobile
**Action**:
- Check if Solarized Dark theme is documented
- Verify spacing and typography guidelines
- Update color palette if changed

### 9. Screen Documentation
**File**: `docs/mobile/SCREEN_BY_SCREEN_REPORT.md`
**Issue**: Check if all screens are documented
**Action**:
- Verify all tabs are documented (Capture, Scout, Today, Mapper, Hunter)
- Update auth screens (login, signup, onboarding)
- Check for new screens added recently

---

## 📋 Documentation to Extract from Archive

### From MISSION_ACCOMPLISHED.md (Oct 30, archived)
- ✅ Review for any missing info in FRONTEND_CURRENT_STATE.md
- Check what was "accomplished" vs current docs

### From MOBILE_REORGANIZATION_COMPLETE.md (archived)
- Extract lessons learned
- Check if reorganization decisions are documented

### From STORYBOOK_SETUP_SUMMARY.md (archived)
- Verify setup steps in current Storybook guide
- Check for missing configuration details

### From Recent Mobile Docs (mobile/docs/archive/)
- GMAIL_INTEGRATION_FIX_COMPLETE.md - Gmail integration patterns
- OAUTH_REFRESH_TOKEN_FIX.md - Refresh token implementation
- DEV_TOOLS_GUIDE.md - Dev tools setup

---

## ⚠️ Critical Clarifications Needed

### 1. Next.js Removal
**Verify**: All docs clearly state Next.js was removed Oct 2025
**Files to check**:
- Any doc mentioning "web frontend"
- Any doc with "Next.js"
- Component docs referencing web-specific patterns

### 2. Expo as Primary Platform
**Verify**: Docs emphasize Expo/React Native as the frontend
**Files to check**:
- ARCHITECTURE_OVERVIEW.md
- FRONTEND_CURRENT_STATE.md
- Mobile README files

---

## ✅ Recently Updated (Verified Current)

- Mobile docs cleanup completed Nov 9, 2025
- 44 progress reports archived
- OAuth documentation updated for mobile

---

## 🔍 How to Verify

```bash
# Check mobile app structure
ls -la mobile/app/(tabs)/

# Count components
find mobile/components -name "*.tsx" | wc -l

# Check Storybook stories
find mobile -name "*.stories.tsx" | wc -l

# Recent mobile changes
git log --since="2025-11-01" --oneline -- mobile/

# Search for outdated refs
rg "Next\.js|next/|getServerSideProps" docs/
```

---

**Next Review**: When FE-01 (ChevronTaskFlow) or FE-11 (Breakdown Modal) are completed
