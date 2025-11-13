# FE-07: FocusTimer Component (Week 9)

**Status**: 🟢 AVAILABLE
**Priority**: MEDIUM
**Dependencies**: FE-01 ChevronTaskFlow, BE-03 Focus Sessions Service
**Estimated Time**: 4 hours
**Approach**: Storybook-first

---

## 📋 Overview

Pomodoro timer integrated into ChevronTaskFlow. Countdown timer, pause/resume, break reminders, session tracking.

---

## 🎨 Component API

```typescript
interface FocusTimerProps {
  stepId: string;
  durationMinutes?: number;  // Default 25 (Pomodoro)
  onComplete: () => void;
  onSkip: () => void;
}

type FocusState = 'idle' | 'running' | 'paused' | 'break' | 'completed';
```

---

## 🎭 Storybook Stories

```typescript
export const Idle: Story = {
  // Timer not started, shows "Start Focus" button
};

export const Running: Story = {
  // Countdown from 25:00
};

export const Paused: Story = {
  // Paused at 18:43 remaining
};

export const BreakTime: Story = {
  // 5-minute break countdown
};

export const CustomDuration: Story = {
  args: { durationMinutes: 45 },  // 45-min session
};
```

---

## 🏗️ Implementation

### Timer Logic

```typescript
const [state, setState] = useState<FocusState>('idle');
const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);

useEffect(() => {
  if (state !== 'running') return;

  const interval = setInterval(() => {
    setSecondsRemaining(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        setState('completed');
        onComplete();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [state]);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### UI Layout

```
FocusTimer
├─ Large Time Display (MM:SS)
├─ Progress Ring (circular progress bar)
├─ Controls
│  ├─ Start/Pause button
│  └─ Skip button
└─ Session Counter (e.g., "Session 2/4")
```

---

## 📡 Backend Integration

```typescript
// Start session
POST /api/v1/focus-sessions/
{ user_id, step_id, duration_minutes: 25 }
// Returns: { session_id }

// Complete session
PUT /api/v1/focus-sessions/{session_id}
{ ended_at, completed: true, interruptions: 0 }
```

---

## 🔔 Notifications

- **On complete**: Play gentle chime sound
- **Haptic feedback**: Vibrate on start/pause/complete
- **Break reminder**: "Take a 5-minute break" modal after 25 min

---

## ✅ Acceptance Criteria

- [ ] Countdown timer (MM:SS format)
- [ ] Start/Pause/Resume controls
- [ ] Skip button
- [ ] Circular progress ring
- [ ] Sound notification on complete
- [ ] Haptic feedback (Web Vibration API)
- [ ] Break reminder after 4 sessions
- [ ] Session tracking to backend
- [ ] 5+ Storybook stories
- [ ] Integrates into ChevronTaskFlow

---

**Integration**: Add to ChevronTaskFlow as optional feature (enableFocusTimer prop)
