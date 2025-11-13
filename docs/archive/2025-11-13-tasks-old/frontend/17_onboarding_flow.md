# FE-17: Onboarding Flow

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 5-6 hours | **Dependencies**: BE-02 (Pets), BE-04 (Gamification)

## 📋 Overview
Multi-step onboarding wizard introducing biological modes, choosing first pet, and creating first task.

## API
```typescript
interface OnboardingFlowProps {
  onComplete: (userData: OnboardingData) => void;
  skipToStep?: number;  // For testing
}

interface OnboardingData {
  username: string;
  selectedPet: string;
  firstTask: Task;
  preferences: UserPreferences;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType;
  canSkip: boolean;
}
```

## Stories
1. **Full Flow**: All 5 steps
2. **Step 1**: Welcome + ADHD context
3. **Step 2**: Choose your creature
4. **Step 3**: Create first task
5. **Step 4**: Biological modes tour

## Design
- Progress indicator (chevron-shaped!)
- Skip button (moves to dashboard)
- Animated transitions
- Mobile-optimized
- Celebration on completion

## Flow
```
Step 1: Welcome → "Built for ADHD brains"
Step 2: Choose creature → Select species + name
Step 3: Create first task → "Try breaking it down!"
Step 4: Modes tour → Swipe through 5 modes
Step 5: Ready! → Confetti + "Let's go!"
```

## ✅ Criteria
- [ ] 5 Storybook stories (one per step)
- [ ] Progress tracking
- [ ] Skip functionality
- [ ] Celebration screen
