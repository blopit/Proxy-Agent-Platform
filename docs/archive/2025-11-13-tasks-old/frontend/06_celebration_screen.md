# FE-06: CelebrationScreen Component (Week 8)

**Status**: 🟢 AVAILABLE
**Priority**: MEDIUM
**Dependencies**: FE-01 ChevronTaskFlow
**Estimated Time**: 4 hours
**Approach**: Storybook-first

---

## 📋 Overview

Full-screen celebration after task completion. Shows XP breakdown, confetti animation, badge unlocks, and pet reaction.

---

## 🎨 Component API

```typescript
interface CelebrationScreenProps {
  xpEarned: number;
  xpBreakdown: { stepId: string; xp: number; description: string }[];
  badgesUnlocked?: Badge[];
  petReaction?: 'happy' | 'excited' | 'proud';
  nextTask?: Task;
  onDismiss: () => void;
  onNextTask?: () => void;
}

interface Badge {
  badge_type: string;
  name: string;
  icon: string;
}
```

---

## 🎭 Storybook Stories

```typescript
export const BasicCelebration: Story = {
  args: {
    xpEarned: 75,
    xpBreakdown: [
      { stepId: 's1', xp: 20, description: 'Research' },
      { stepId: 's2', xp: 25, description: 'Draft' },
      { stepId: 's3', xp: 20, description: 'Revise' },
      { stepId: 's4', xp: 10, description: 'Submit' },
    ],
    onDismiss: () => console.log('Dismissed'),
  },
};

export const WithBadgeUnlock: Story = {
  args: {
    ...BasicCelebration.args,
    badgesUnlocked: [
      { badge_type: '10-tasks', name: 'Getting Started', icon: '📊' },
    ],
  },
};

export const WithPetReaction: Story = {
  args: {
    ...BasicCelebration.args,
    petReaction: 'excited',
  },
};

export const WithNextTaskSuggestion: Story = {
  args: {
    ...BasicCelebration.args,
    nextTask: { task_id: '456', title: 'Email Inbox Zero' },
    onNextTask: () => console.log('Next task'),
  },
};
```

---

## 🎊 Animations

- **Confetti**: Use `react-confetti` or Lottie animation
- **XP Counter**: Animated count-up effect (0 → final XP)
- **Badge Reveal**: Scale-in animation with pulse
- **Pet Reaction**: Bounce/jump animation
- **Auto-dismiss**: Fade out after 3 seconds (or user tap)

---

## 🏗️ Layout

```
CelebrationScreen (full-screen overlay)
├─ Confetti Background
├─ Center Card
│  ├─ "🎉 Task Complete!"
│  ├─ XP Earned (large, animated)
│  ├─ XP Breakdown (collapsible)
│  ├─ Badge Unlock (if any)
│  └─ Pet Reaction (if available)
├─ Bottom Actions
│  ├─ "Next Task" button (if available)
│  └─ "Dismiss" button
└─ Auto-dismiss timer (3s)
```

---

## ✅ Acceptance Criteria

- [ ] Full-screen overlay
- [ ] Confetti animation
- [ ] Animated XP counter
- [ ] XP breakdown collapsible
- [ ] Badge unlock notification
- [ ] Pet reaction animation
- [ ] Auto-dismiss after 3s
- [ ] Manual dismiss button
- [ ] "Next Task" suggestion
- [ ] 4+ Storybook stories

---

**Integration**: Called after ChevronTaskFlow `onComplete`
