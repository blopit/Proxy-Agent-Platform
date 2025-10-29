# FE-11: Task Breakdown Modal

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 4 hours | **Dependencies**: BE-05 (Task Splitting)

## 📋 Overview
Modal to review and edit AI-generated task breakdowns before confirming.

## API
```typescript
interface TaskBreakdownModalProps {
  task: Task;
  suggestedSteps: MicroStepSuggestion[];
  onConfirm: (steps: MicroStepSuggestion[]) => void;
  onRegenerate: () => void;
  onClose: () => void;
}
```

## Stories
1. **Default**: 5 suggested steps
2. **Editable**: User can modify steps
3. **Regenerate**: Loading state while AI re-splits
4. **Energy Aware**: Shows energy level context

## ✅ Criteria
- [ ] 4 Storybook stories
- [ ] Inline step editing
- [ ] Drag-to-reorder steps
- [ ] Regenerate button calls API
