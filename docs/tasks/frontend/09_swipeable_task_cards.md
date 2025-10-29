# FE-09: Swipeable Task Cards (Hunter Mode)

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 5-6 hours
**Dependencies**: FE-01 (ChevronTaskFlow)
**Agent Type**: frontend-storybook

## 📋 Overview
Tinder-style swipeable task cards for Hunter mode with gestures (right=start, left=skip, up=details).

## 🎨 Component API
```typescript
interface SwipeableTaskCardProps {
  tasks: Task[];
  onSwipeRight: (task: Task) => void;  // Start task
  onSwipeLeft: (task: Task) => void;   // Skip task
  onSwipeUp: (task: Task) => void;     // View details
  enableHaptics?: boolean;
}

interface TaskCard {
  task_id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimated_minutes: number;
  micro_steps_preview: string[];  // First 3 steps
}
```

## 📖 Storybook Stories
1. **Single Card**: One task
2. **Card Stack**: 5 tasks to swipe through
3. **Empty State**: No tasks available
4. **With Animations**: Spring physics
5. **Mobile Optimized**: Touch gestures

## 🎨 Design
- Framer Motion for swipe physics
- Haptic feedback on swipe threshold
- Visual hint arrows (swipe directions)
- Card reveals next task underneath
- Smooth spring animations

## ✅ Acceptance Criteria
- [ ] 5 Storybook stories
- [ ] Smooth swipe gestures
- [ ] Works on mobile and desktop
- [ ] Haptic feedback (mobile)
- [ ] Keyboard navigation (←/→/↑)
