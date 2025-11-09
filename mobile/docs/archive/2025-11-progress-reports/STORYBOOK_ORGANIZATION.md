# 📚 Expo Storybook Organization - Tab-Based Hierarchy

**Created**: November 2, 2025
**Structure**: Organized by 5 biological workflow modes (tabs)

---

## 🎯 Tab-Based Structure

Storybook is now organized to match the 5 main tabs in the mobile app:

### **1. Capture/** - Quick Task Entry (Plus Icon)
Brain dump mode - minimal friction task capture

**Components:**
- `QuickCaptureInput` - Single-line fast entry
- `VoiceCaptureButton` - Voice-to-text capture
- `EmailCaptureCard` - Capture from email
- `BrainDumpTextArea` - Multi-line brain dump

**Story Path**: `Capture/[ComponentName]`

---

### **2. Scout/** - Discovery & Search (Search Icon)
Explore and discover tasks

**Components:**
- `TaskSearchBar` - Search/filter tasks
- `TaskDiscoveryCard` - Swipeable task cards
- `FilterTabs` - Category/priority filters
- `TaskPreviewChevron` - Task preview with chevron UI

**Story Path**: `Scout/[ComponentName]`

---

### **3. Hunter/** - Focused Execution (Target Icon)
Single-task focus mode

**Components:**
- `FullscreenTaskView` - Immersive task display
- `TaskProgressChevron` - Progress indicator
- `FocusTimer` - Pomodoro-style timer
- `TaskCompleteButton` - Swipe-to-complete

**Story Path**: `Hunter/[ComponentName]`

---

### **4. Today/** (Gather) - Daily View (Calendar Icon)
Process inputs and organize

**Components:**
- `DailyTaskList` - Today's tasks
- `CalendarDayView` - Calendar integration
- `TaskPriorityStack` - Prioritized task stack
- `DailyGoalsCard` - Daily goal setting

**Story Path**: `Today/[ComponentName]`

---

### **5. Mapper/** - Reflection & Progress (Profile Icon)
Track progress and reflect

**Components:**
- `ProfileHeader` - User profile display
- `ProgressStats` - Statistics dashboard
- `WeeklyReflection` - Weekly review
- `AchievementGallery` - Badges and achievements
- `ProfileSwitcher` - Switch between profiles (already exists!)

**Story Path**: `Mapper/[ComponentName]`

---

### **Shared/** - Cross-Tab Components
Reusable components used across multiple tabs

**Components:**
- `ChevronElement` ✅ - Core chevron UI primitive
- `Button` - Primary/secondary buttons
- `Card` - Base card component
- `Badge` - Status badges
- `Icon` - Icon components

**Story Path**: `Shared/Core/[ComponentName]` or `Shared/UI/[ComponentName]`

---

## 📁 Directory Structure

```
mobile/src/components/
├── capture/
│   ├── QuickCaptureInput.tsx
│   ├── QuickCaptureInput.stories.tsx
│   ├── VoiceCaptureButton.tsx
│   ├── VoiceCaptureButton.stories.tsx
│   └── ...
│
├── scout/
│   ├── TaskSearchBar.tsx
│   ├── TaskSearchBar.stories.tsx
│   ├── TaskDiscoveryCard.tsx
│   ├── TaskDiscoveryCard.stories.tsx
│   └── ...
│
├── hunter/
│   ├── FullscreenTaskView.tsx
│   ├── FullscreenTaskView.stories.tsx
│   ├── TaskProgressChevron.tsx
│   ├── TaskProgressChevron.stories.tsx
│   └── ...
│
├── today/
│   ├── DailyTaskList.tsx
│   ├── DailyTaskList.stories.tsx
│   ├── CalendarDayView.tsx
│   ├── CalendarDayView.stories.tsx
│   └── ...
│
├── mapper/
│   ├── ProfileHeader.tsx
│   ├── ProfileHeader.stories.tsx
│   ├── ProgressStats.tsx
│   ├── ProgressStats.stories.tsx
│   ├── ProfileSwitcher.tsx  ✅ (already exists)
│   ├── ProfileSwitcher.stories.tsx  (to be created)
│   └── ...
│
└── shared/
    ├── ChevronElement.tsx  ✅ (moved from mobile/)
    ├── ChevronElement.stories.tsx  ✅ (updated path)
    └── ...
```

---

## 🎨 Story Naming Convention

### **Pattern**: `[Tab]/[Feature]/[ComponentName]`

**Examples:**
- `Capture/QuickEntry/QuickCaptureInput`
- `Scout/Search/TaskSearchBar`
- `Hunter/Focus/FullscreenTaskView`
- `Today/Planning/DailyTaskList`
- `Mapper/Progress/ProgressStats`
- `Shared/Core/ChevronElement` ✅

---

## 🧩 Component Categories

### **Tab-Specific Components**
Components used exclusively in one tab
- **Location**: `src/components/[tab-name]/`
- **Story Path**: `[TabName]/[ComponentName]`

### **Shared Components**
Components used across multiple tabs
- **Location**: `src/components/shared/`
- **Story Path**: `Shared/[Category]/[ComponentName]`

**Shared Categories:**
- `Shared/Core/` - Core UI primitives (ChevronElement, etc.)
- `Shared/UI/` - Common UI components (Button, Card, etc.)
- `Shared/Forms/` - Form inputs and controls
- `Shared/Layout/` - Layout components

---

## 📖 Benefits of This Organization

### **1. Mental Model Alignment**
- Storybook structure matches app navigation
- Developers can find components by tab context
- New team members understand organization quickly

### **2. Discoverability**
- Easy to browse components by workflow mode
- Clear separation of concerns
- Related components grouped together

### **3. Scalability**
- Each tab can grow independently
- Shared components don't clutter tab-specific views
- Easy to add new components to appropriate tab

### **4. Development Workflow**
- Build Capture components → Test in Capture stories
- Build Hunter components → Test in Hunter stories
- Shared components visible to all tabs

---

## 🚀 Next Steps

### **Immediate (This Session)**
- [x] Create tab-based directory structure
- [x] Move ChevronElement to Shared
- [x] Update ChevronElement story path
- [ ] Move ProfileSwitcher to Mapper
- [ ] Create ProfileSwitcher story
- [ ] Create example component for each tab

### **Short-Term (Next Week)**
- [ ] Migrate existing components to new structure
- [ ] Create tab-specific component templates
- [ ] Add Storybook documentation page
- [ ] Create component creation guide

### **Long-Term**
- [ ] Build out full component library per tab
- [ ] Add interaction tests to stories
- [ ] Create design system documentation
- [ ] Integrate with Figma designs

---

## 📝 Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComponentName } from './ComponentName';

const meta = {
  title: '[TabName]/[ComponentName]',  // e.g., 'Capture/QuickCaptureInput'
  component: ComponentName,
  argTypes: {
    // Define controls here
  },
  decorators: [
    (Story) => (
      <View style={styles.decorator}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state
 */
export const Default: Story = {
  args: {
    // Default props
  },
};

/**
 * Other variations...
 */
export const Variant: Story = {
  args: {
    // Variant props
  },
};

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
});
```

---

## 🎯 Quick Reference

| Tab | Icon | Purpose | Key Components |
|-----|------|---------|----------------|
| **Capture** | Plus | Quick entry | QuickCaptureInput, VoiceCaptureButton |
| **Scout** | Search | Discovery | TaskSearchBar, TaskDiscoveryCard |
| **Hunter** | Target | Focus | FullscreenTaskView, FocusTimer |
| **Today** | Calendar | Daily planning | DailyTaskList, CalendarDayView |
| **Mapper** | Profile | Reflection | ProfileHeader, ProgressStats, ProfileSwitcher |
| **Shared** | - | Reusable | ChevronElement, Button, Card |

---

**Last Updated**: November 2, 2025
**Status**: ✅ Structure Created, Ready for Migration
**Next**: Move existing components and create examples for each tab
