# 🎨 New Storybook Stories - Quick Guide

**Just Added**: 23 new stories based on frontend to-do lists from `agent_resources/`

---

## 🚀 Quick Start

```bash
cd mobile
npm run storybook
```

Then navigate to `/storybook` in your Expo app!

---

## 📱 What's New (4 Components, 23 Stories)

### 1. 🔪 TaskBreakdownModal (5 stories)
**Location**: Modals → TaskBreakdownModal
**What it does**: AI splits tasks into 2-5 minute micro-steps

```
Try these stories:
✓ Default          - Break 30min task into micro-steps
✓ Interactive      - See full user flow with API simulation
✓ ADHD Mode       - High-granularity breakdown
```

**Epic 7 Sprint** - Day 1-2 feature!

---

### 2. 📋 TemplateCard (6 stories)
**Location**: Templates → TemplateCard
**What it does**: Browse & apply task templates

```
Try these stories:
✓ ADHDTemplate     - Deep Work Session (15m, 892⭐)
✓ AllCategories    - See all 4 template types
✓ CompactView      - Grid layout version
```

**Categories**: Work 💼 | Personal ⭐ | ADHD ⏰ | Custom 👥

---

### 3. 🗺️ MapperView (5 stories)
**Location**: Mapper → MapperView
**What it does**: 2-tab Mapper redesign (MAP + PLAN)

```
Try these stories:
✓ Default          - MAP tab (weekly progress heatmap)
✓ PlanTab          - PLAN tab (next 3 days)
✓ Interactive      - Switch between tabs
```

**MAP Tab**: Retrospective (wins, streaks, energy)
**PLAN Tab**: Forward-looking (upcoming, goals)

---

### 4. ✅ TaskRow (7 stories)
**Location**: Tasks → TaskRow
**What it does**: Task list item with "Slice" button

```
Try these stories:
✓ Default          - Task with slice button
✓ InteractiveList  - Full task list demo
✓ ADHDMode         - Auto-split tasks >5min
```

**Features**:
- ✂️ Quick slice button (tasks >5min)
- 🎨 Priority colors (Red/Orange/Blue)
- ✓ Checkbox toggle
- 🏷️ Tags & metadata

---

## 🎨 Theme Testing

Click the **paintbrush icon** in Storybook to try all 6 themes:

```
🌙 Solarized Dark   - Warm, ADHD-optimized (default)
☀️ Solarized Light  - Light mode variant
❄️ Nord             - Cool, calming blues
🦇 Dracula          - Vibrant, high-energy
🌸 Catppuccin       - Soft, warm pastels
⚡ High Contrast    - Maximum accessibility
```

All new stories work with all themes!

---

## 📊 Story Breakdown

| Component | Stories | Interactive | Based On |
|-----------|---------|-------------|----------|
| TaskBreakdownModal | 5 | ✓ | Epic 7 (Day 1-2) |
| TemplateCard | 6 | ✓ | FE-04 spec |
| MapperView | 5 | ✓ | FE-03 spec |
| TaskRow | 7 | ✓ | Epic 7 (Day 3) |

**Total**: 23 new stories
**All interactive**: Yes!
**Theme support**: All 6 themes

---

## 🎯 Sprint Alignment

These stories support **current and next sprint**:

### Current Sprint (Epic 7)
✅ Day 1-2: TaskBreakdownModal (Split tasks API)
✅ Day 3: TaskRow with Slice button
✅ Day 4-5: ADHD Mode (shown in stories)

### Next Sprint (Week 2-3)
✅ FE-03: Mapper Restructure (MapperView)
✅ FE-04: Template Library (TemplateCard)

---

## 💡 Cool Features Demonstrated

### ADHD-Optimized UX
- **2-5 min micro-steps** - Perfect for ADHD focus
- **Quick slice button** - One tap to break down
- **Energy patterns** - Know your best work times
- **Template shortcuts** - Instant task creation
- **Auto-splitting** - ADHD mode magic

### Interactive Demos
- **State management** - Real React hooks
- **API simulation** - 2-second delays
- **Full user flows** - End-to-end experiences
- **Multiple variants** - All states shown

### Theme Integration
- **6 themes** - All supported
- **Live switching** - Change theme, see updates
- **Color-coded** - Semantic color usage
- **Accessibility** - High contrast mode

---

## 🔍 Story Explorer

### By Priority

**High Priority** (Epic 7):
- TaskBreakdownModal → Default, Interactive
- TaskRow → Default, InteractiveList

**Medium Priority** (Next sprint):
- MapperView → Interactive
- TemplateCard → AllCategories

**Exploration**:
- All "Interactive" stories
- All "AllCategories/AllVariants" stories

### By User Journey

**Task Creation**:
1. TemplateCard → WorkTemplate (browse templates)
2. TaskBreakdownModal → Interactive (split task)
3. TaskRow → Default (see in list)

**ADHD Workflow**:
1. TemplateCard → ADHDTemplate (ADHD-optimized)
2. TaskBreakdownModal → ADHDMode (micro-splitting)
3. TaskRow → ADHDMode (auto-slice)

**Reflection & Planning**:
1. MapperView → Default (see weekly wins)
2. MapperView → PlanTab (plan ahead)
3. MapperView → Interactive (full experience)

---

## 📋 Next Steps

### For Developers
- [ ] Review stories for UI patterns
- [ ] Use as reference for implementation
- [ ] Test all 6 themes
- [ ] Build actual components based on stories

### For Designers
- [ ] Review visual design
- [ ] Test theme compatibility
- [ ] Iterate on UX patterns
- [ ] Suggest improvements

### For QA
- [ ] Test interactive stories
- [ ] Verify all states shown
- [ ] Check theme switching
- [ ] Document edge cases

---

## 🎯 Files Created

```
mobile/components/
├── modals/
│   └── TaskBreakdownModal.stories.tsx    (5 stories)
├── templates/
│   └── TemplateCard.stories.tsx          (6 stories)
├── mapper/
│   └── MapperView.stories.tsx            (5 stories)
└── tasks/
    └── TaskRow.stories.tsx               (7 stories)

mobile/.rnstorybook/
└── index.web.tsx                         (updated)
```

---

## 💬 Quick Commands

```bash
# Start Storybook
npm run storybook

# Regenerate stories (if needed)
npm run storybook-generate

# Clear cache and restart
npx expo start --clear
```

---

## 🎉 Summary

**Created**: 23 new Storybook stories
**Components**: 4 high-priority frontend components
**Themes**: All 6 themes supported
**Interactive**: All stories have interactive demos
**Sprint-aligned**: Current + next sprint features

**Try it now**: `npm run storybook` 🚀

---

**See full details**: [FRONTEND_STORYBOOK_STORIES_SUMMARY.md](./FRONTEND_STORYBOOK_STORIES_SUMMARY.md)
