# Onboarding Data Integration Plan

**Status**: 🔴 Critical - Data Collected But Not Used
**Priority**: High
**Last Updated**: November 10, 2025

---

## 🚨 Problem Statement

The onboarding system successfully collects user preferences through a 7-step flow, but **none of this data is currently used** by the application. This creates:

1. **Wasted User Time**: Users complete onboarding but see no personalization
2. **Missed Personalization Opportunities**: App behaves identically for all users
3. **Privacy Concern**: Collecting unused data is questionable
4. **Technical Debt**: Code exists with no consumers

### Current State

| Data Collected | Stored? | Used? | Impact |
|----------------|---------|-------|--------|
| Work Preference | ✅ Yes | ❌ No | None - identical task scheduling |
| ADHD Support Level | ✅ Yes | ❌ No | None - same UI for everyone |
| ADHD Challenges | ✅ Yes | ❌ No | None - no adaptive features |
| Daily Schedule | ✅ Yes | ❌ No | None - reminders ignore preferences |
| Productivity Goals | ✅ Yes | ❌ No | None - no goal tracking |

---

## 🎯 Integration Goals

Make every piece of onboarding data **actionable and visible** to the user within their first session.

### Success Criteria

- [ ] User sees personalized UI elements within 1 minute of completing onboarding
- [ ] At least 3 features adapt based on onboarding choices
- [ ] User can see how their choices affect the app (settings page shows impact)
- [ ] All collected data has at least 1 consumer

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1) - HIGH PRIORITY

**Goal**: Create infrastructure to access onboarding data across the app

#### Task 1.1: Backend - User Preferences Service

**File**: `src/services/user_preferences_service.py`

```python
"""
Service to fetch and provide user onboarding preferences to agents and features.
"""

from src.services.onboarding_service import OnboardingService
from functools import lru_cache

class UserPreferencesService:
    """Centralized service for user preferences from onboarding"""

    def __init__(self):
        self.onboarding_service = OnboardingService()

    @lru_cache(maxsize=1000)
    async def get_user_preferences(self, user_id: str) -> dict:
        """
        Get user preferences with sensible defaults.

        Returns:
            {
                'work_preference': 'flexible',
                'adhd_support_level': 5,
                'adhd_challenges': [],
                'daily_schedule': {...},
                'productivity_goals': []
            }
        """
        onboarding = await self.onboarding_service.get_onboarding(user_id)

        if not onboarding:
            return self._get_defaults()

        return {
            'work_preference': onboarding.work_preference or 'flexible',
            'adhd_support_level': onboarding.adhd_support_level or 5,
            'adhd_challenges': onboarding.adhd_challenges or [],
            'daily_schedule': onboarding.daily_schedule or self._default_schedule(),
            'productivity_goals': onboarding.productivity_goals or [],
        }

    def _get_defaults(self) -> dict:
        """Defaults for users who skipped onboarding"""
        return {
            'work_preference': 'flexible',
            'adhd_support_level': 5,
            'adhd_challenges': [],
            'daily_schedule': self._default_schedule(),
            'productivity_goals': [],
        }

    def _default_schedule(self) -> dict:
        """9-5 weekdays"""
        return {
            'time_preference': 'morning',
            'flexible_enabled': False,
            'week_grid': {
                'monday': '9-17',
                'tuesday': '9-17',
                'wednesday': '9-17',
                'thursday': '9-17',
                'friday': '9-17',
                'saturday': 'off',
                'sunday': 'off'
            }
        }

    def is_adhd_friendly_mode(self, user_id: str) -> bool:
        """Quick check if user needs ADHD adaptations"""
        prefs = await self.get_user_preferences(user_id)
        return prefs['adhd_support_level'] >= 6

    def get_work_hours(self, user_id: str, day: str) -> tuple[int, int] | None:
        """Get work hours for a specific day. Returns (start_hour, end_hour) or None"""
        prefs = await self.get_user_preferences(user_id)
        schedule = prefs['daily_schedule']['week_grid'].get(day.lower())

        if not schedule or schedule == 'off':
            return None

        if schedule == 'flexible':
            return (9, 17)  # Default

        # Parse "9-17" or "8-12,14-18"
        hours = schedule.split(',')[0]  # Take first block for simplicity
        start, end = hours.split('-')
        return (int(start), int(end))
```

**Tests**: `src/services/tests/test_user_preferences_service.py`

```python
import pytest
from src.services.user_preferences_service import UserPreferencesService

@pytest.mark.asyncio
async def test_get_user_preferences_with_data():
    """Test getting preferences for user with onboarding data"""
    service = UserPreferencesService()
    prefs = await service.get_user_preferences("user_with_data")

    assert prefs['adhd_support_level'] == 7
    assert 'time_blindness' in prefs['adhd_challenges']
    assert prefs['work_preference'] == 'remote'

@pytest.mark.asyncio
async def test_get_user_preferences_defaults():
    """Test getting preferences for user without onboarding data"""
    service = UserPreferencesService()
    prefs = await service.get_user_preferences("user_no_data")

    assert prefs['adhd_support_level'] == 5  # Default
    assert prefs['work_preference'] == 'flexible'

@pytest.mark.asyncio
async def test_get_work_hours():
    """Test parsing work hours from schedule"""
    service = UserPreferencesService()
    hours = service.get_work_hours("user_123", "monday")

    assert hours == (9, 17)
```

**Acceptance Criteria**:
- [ ] Service can fetch onboarding data
- [ ] Returns sensible defaults for users who skipped
- [ ] Caches results for performance
- [ ] Has helper methods for common checks
- [ ] All tests pass

---

#### Task 1.2: Frontend - User Preferences Hook

**File**: `mobile/src/hooks/useUserPreferences.ts`

```typescript
/**
 * Hook to access user preferences from onboarding throughout the app
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { onboardingService } from '@/src/services/onboardingService';
import type { OnboardingData } from '@/src/types/onboarding';

const DEFAULT_PREFERENCES: OnboardingData = {
  workPreference: 'flexible',
  adhdSupportLevel: 5,
  adhdChallenges: [],
  dailySchedule: null,
  productivityGoals: [],
  skipped: false,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<OnboardingData>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.user_id) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoading(false);
      return;
    }

    try {
      const data = await onboardingService.getOnboarding(user.user_id);
      setPreferences(data || DEFAULT_PREFERENCES);
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper computed properties
  const isADHDFriendlyMode = (preferences.adhdSupportLevel ?? 5) >= 6;
  const hasChallenge = (challenge: string) =>
    preferences.adhdChallenges?.includes(challenge) ?? false;

  return {
    preferences,
    isLoading,
    isADHDFriendlyMode,
    hasChallenge,
    reload: loadPreferences,
  };
}
```

**Usage Example**:
```typescript
import { useUserPreferences } from '@/src/hooks/useUserPreferences';

function MyComponent() {
  const { preferences, isADHDFriendlyMode, hasChallenge } = useUserPreferences();

  return (
    <View>
      {isADHDFriendlyMode && <Text>ADHD-friendly mode active</Text>}
      {hasChallenge('time_blindness') && <LargeTimeDisplay />}
    </View>
  );
}
```

**Acceptance Criteria**:
- [ ] Hook loads preferences on mount
- [ ] Returns defaults for users without data
- [ ] Provides helper methods
- [ ] Can reload preferences
- [ ] Works in any component

---

### Phase 2: Quick Wins (Week 2) - IMMEDIATE USER IMPACT

**Goal**: Implement 3-5 visible adaptations that users notice immediately

#### Task 2.1: ADHD-Adaptive UI Elements

**Impact**: High visibility, low complexity

##### 2.1.1: Time Display Prominence

**File**: `mobile/components/tasks/TaskCard.tsx`

```typescript
// Before: Small time display
<Text style={styles.time}>2:30 PM</Text>

// After: Large, prominent time for users with time_blindness
const { hasChallenge } = useUserPreferences();

<Text style={[
  styles.time,
  hasChallenge('time_blindness') && styles.timeEmphasis
]}>
  2:30 PM
</Text>

// styles
timeEmphasis: {
  fontSize: 24,
  fontWeight: '700',
  color: THEME.orange,
  marginBottom: 8,
}
```

##### 2.1.2: Micro-Step Granularity

**File**: `src/agents/decomposer_agent.py`

```python
from src.services.user_preferences_service import UserPreferencesService

class DecomposerAgent:
    def __init__(self):
        self.prefs_service = UserPreferencesService()

    async def decompose_task(self, task: str, user_id: str):
        prefs = await self.prefs_service.get_user_preferences(user_id)
        adhd_level = prefs['adhd_support_level']

        # More micro-steps for higher ADHD support needs
        if adhd_level >= 8:
            max_step_complexity = 1  # Very simple steps
            min_steps = 5
        elif adhd_level >= 6:
            max_step_complexity = 2  # Simple steps
            min_steps = 3
        else:
            max_step_complexity = 3  # Normal steps
            min_steps = 2

        # Use in decomposition logic
        steps = await self._generate_steps(
            task,
            max_complexity=max_step_complexity,
            min_count=min_steps
        )

        return steps
```

##### 2.1.3: Focus Session Duration

**File**: `src/agents/focus_agent.py`

```python
class FocusAgent:
    async def suggest_focus_duration(self, user_id: str) -> int:
        """Suggest focus session duration based on user preferences"""
        prefs = await self.prefs_service.get_user_preferences(user_id)

        # Shorter sessions for users with focus challenges
        if 'focus' in prefs['adhd_challenges']:
            return 15  # 15 min Pomodoro
        elif prefs['adhd_support_level'] >= 7:
            return 20  # 20 min
        else:
            return 25  # Standard Pomodoro
```

##### 2.1.4: Visual Task Completion Feedback

**File**: `mobile/components/tasks/TaskCompletionAnimation.tsx`

```typescript
function TaskCompletionAnimation() {
  const { preferences } = useUserPreferences();

  // More celebratory for users focused on task_completion goal
  const hasTaskCompletionGoal = preferences.productivityGoals?.some(
    goal => goal.type === 'task_completion'
  );

  return (
    <Animated.View>
      {hasTaskCompletionGoal ? (
        <EnhancedCelebration />  // Confetti, sound, haptics
      ) : (
        <SimpleCelebration />     // Just checkmark
      )}
    </Animated.View>
  );
}
```

**Acceptance Criteria**:
- [ ] Time displays are larger for users with time_blindness
- [ ] Task decomposition adapts to ADHD support level
- [ ] Focus session durations are personalized
- [ ] Task completion feedback aligns with goals
- [ ] Users notice the difference

---

#### Task 2.2: Smart Scheduling

**Impact**: High - affects when users see tasks

**File**: `src/services/task_scheduling_service.py`

```python
from src.services.user_preferences_service import UserPreferencesService
from datetime import datetime, time

class TaskSchedulingService:
    """Schedule tasks based on user's daily schedule and preferences"""

    def __init__(self):
        self.prefs_service = UserPreferencesService()

    async def get_optimal_time(
        self,
        user_id: str,
        task_duration_minutes: int
    ) -> datetime:
        """Get optimal time to schedule a task"""
        prefs = await self.prefs_service.get_user_preferences(user_id)
        schedule = prefs['daily_schedule']
        time_pref = schedule['time_preference']

        today = datetime.now().strftime('%A').lower()
        work_hours = self.prefs_service.get_work_hours(user_id, today)

        if not work_hours:
            return None  # User is off today

        start_hour, end_hour = work_hours

        # Map time preference to hour ranges
        if time_pref == 'morning':
            preferred_hour = start_hour
        elif time_pref == 'afternoon':
            preferred_hour = start_hour + (end_hour - start_hour) // 2
        elif time_pref == 'evening':
            preferred_hour = end_hour - 2
        else:  # flexible
            preferred_hour = start_hour + 1

        # Create datetime for today at preferred hour
        return datetime.now().replace(
            hour=preferred_hour,
            minute=0,
            second=0,
            microsecond=0
        )

    async def should_show_reminder(self, user_id: str) -> bool:
        """Check if current time is within user's active hours"""
        prefs = await self.prefs_service.get_user_preferences(user_id)
        schedule = prefs['daily_schedule']

        today = datetime.now().strftime('%A').lower()
        work_hours = self.prefs_service.get_work_hours(user_id, today)

        if not work_hours:
            return False  # Don't remind on off days

        current_hour = datetime.now().hour
        start_hour, end_hour = work_hours

        return start_hour <= current_hour < end_hour
```

**Usage**:
```python
# In task creation
scheduling = TaskSchedulingService()
optimal_time = await scheduling.get_optimal_time(user_id, task_duration=30)

# In reminder service
if await scheduling.should_show_reminder(user_id):
    send_notification(user_id, "Time to work on your task!")
```

**Acceptance Criteria**:
- [ ] Tasks are scheduled during user's active hours
- [ ] Time preference (morning/afternoon/evening) is respected
- [ ] Reminders only sent during work hours
- [ ] Off days are respected (no notifications)
- [ ] Users report better timing

---

#### Task 2.3: Personalized Dashboard

**Impact**: High - first thing user sees

**File**: `mobile/app/(tabs)/today/index.tsx`

```typescript
import { useUserPreferences } from '@/src/hooks/useUserPreferences';

export default function TodayScreen() {
  const { preferences, isADHDFriendlyMode } = useUserPreferences();

  return (
    <ScrollView>
      {/* Personalized greeting */}
      <WelcomeHeader preferences={preferences} />

      {/* Show focus timer for users with focus challenges */}
      {preferences.adhdChallenges?.includes('focus') && (
        <FocusTimerWidget />
      )}

      {/* Show time awareness widget for time_blindness */}
      {preferences.adhdChallenges?.includes('time') && (
        <LargeClockWidget />
      )}

      {/* Task list with adaptive granularity */}
      <TaskList
        adhdSupportLevel={preferences.adhdSupportLevel ?? 5}
      />

      {/* Goal progress if user has goals */}
      {preferences.productivityGoals && preferences.productivityGoals.length > 0 && (
        <GoalProgressWidget goals={preferences.productivityGoals} />
      )}
    </ScrollView>
  );
}
```

**WelcomeHeader Component**:
```typescript
function WelcomeHeader({ preferences }: { preferences: OnboardingData }) {
  const greeting = () => {
    if (preferences.workPreference === 'remote') {
      return "Welcome to your remote workspace";
    } else if (preferences.workPreference === 'hybrid') {
      return "Ready for a productive day?";
    } else if (preferences.workPreference === 'office') {
      return "Have a great day at the office";
    }
    return "Welcome back";
  };

  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>{greeting()}</Text>
    </View>
  );
}
```

**Acceptance Criteria**:
- [ ] Dashboard shows personalized greeting
- [ ] Widgets adapt to ADHD challenges
- [ ] Goal progress visible if user has goals
- [ ] Layout changes based on preferences
- [ ] User sees their choices reflected

---

### Phase 3: Advanced Features (Week 3-4) - DEEP PERSONALIZATION

#### Task 3.1: Goal-Aligned Metrics

**File**: `src/services/goal_tracking_service.py`

```python
class GoalTrackingService:
    """Track metrics aligned with user's productivity goals"""

    async def get_tracked_metrics(self, user_id: str) -> list[str]:
        """Determine which metrics to track based on user goals"""
        prefs = await self.prefs_service.get_user_preferences(user_id)
        goals = prefs['productivity_goals']

        metrics = []

        for goal in goals:
            if goal == 'reduce_overwhelm':
                metrics.extend(['tasks_in_backlog', 'avg_task_complexity'])
            elif goal == 'increase_focus':
                metrics.extend(['focus_time_daily', 'focus_session_count'])
            elif goal == 'build_habits':
                metrics.extend(['habit_streak', 'habit_completion_rate'])
            elif goal == 'time_management':
                metrics.extend(['tasks_on_time', 'estimated_vs_actual'])
            elif goal == 'work_life_balance':
                metrics.extend(['work_hours', 'evening_tasks_count'])

        return list(set(metrics))  # Remove duplicates

    async def calculate_goal_progress(self, user_id: str) -> dict:
        """Calculate progress for each user goal"""
        # Implementation here
        pass
```

**Frontend Display**:
```typescript
// mobile/app/(tabs)/you.tsx
function GoalProgressSection() {
  const { preferences } = useUserPreferences();
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    fetchGoalMetrics();
  }, [preferences.productivityGoals]);

  if (!preferences.productivityGoals || preferences.productivityGoals.length === 0) {
    return null;  // Don't show if user has no goals
  }

  return (
    <View style={styles.goalsSection}>
      <Text style={styles.sectionTitle}>Your Goals</Text>
      {preferences.productivityGoals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          metrics={metrics[goal.type]}
        />
      ))}
    </View>
  );
}
```

---

#### Task 3.2: Challenge-Specific Assistance

**File**: `src/agents/adaptive_assistant.py`

```python
class AdaptiveAssistant:
    """Provides assistance based on user's specific ADHD challenges"""

    async def get_task_assistance(self, task: dict, user_id: str) -> dict:
        """Provide adaptive assistance for a task"""
        prefs = await self.prefs_service.get_user_preferences(user_id)
        challenges = prefs['adhd_challenges']

        assistance = {
            'tips': [],
            'ui_adaptations': [],
            'reminders': []
        }

        if 'task_initiation' in challenges:
            assistance['tips'].append("Start with just 5 minutes")
            assistance['ui_adaptations'].append('show_tiny_first_step')

        if 'time_blindness' in challenges:
            assistance['reminders'].extend([
                {'type': 'time_elapsed', 'interval': 15},  # Every 15 min
                {'type': 'time_remaining', 'show': True}
            ])
            assistance['ui_adaptations'].append('large_timer')

        if 'organization' in challenges:
            assistance['tips'].append("This task belongs in: " + task.get('category'))
            assistance['ui_adaptations'].append('show_category_badge')

        if 'overwhelm' in challenges:
            # Break down further if needed
            if task.get('complexity', 0) > 3:
                assistance['tips'].append("This task can be broken into smaller steps")
                assistance['ui_adaptations'].append('suggest_decomposition')

        return assistance
```

**Frontend Integration**:
```typescript
// mobile/components/tasks/TaskDetailScreen.tsx
function TaskDetailScreen({ task }) {
  const { preferences } = useUserPreferences();
  const [assistance, setAssistance] = useState(null);

  useEffect(() => {
    fetchTaskAssistance();
  }, [task, preferences]);

  return (
    <View>
      <TaskHeader task={task} />

      {/* Show adaptive assistance */}
      {assistance?.tips && assistance.tips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Personalized Tips</Text>
          {assistance.tips.map((tip, i) => (
            <Text key={i} style={styles.tip}>{tip}</Text>
          ))}
        </View>
      )}

      {/* Large timer for time_blindness */}
      {assistance?.ui_adaptations?.includes('large_timer') && (
        <LargeTimerDisplay task={task} />
      )}

      {/* Suggest decomposition for overwhelm */}
      {assistance?.ui_adaptations?.includes('suggest_decomposition') && (
        <Button onPress={decomposeTask}>
          Break This Down Further
        </Button>
      )}
    </View>
  );
}
```

---

#### Task 3.3: Work Mode Adaptations

**File**: `src/services/work_mode_service.py`

```python
class WorkModeService:
    """Adapt app behavior based on work preference"""

    async def get_notification_strategy(self, user_id: str) -> dict:
        """Get notification strategy based on work mode"""
        prefs = await self.prefs_service.get_user_preferences(user_id)
        work_pref = prefs['work_preference']

        if work_pref == 'remote':
            return {
                'frequency': 'high',  # More reminders (no office accountability)
                'style': 'gentle',
                'focus_mode_default': True
            }
        elif work_pref == 'office':
            return {
                'frequency': 'low',  # Fewer reminders (office has structure)
                'style': 'discrete',  # Silent notifications
                'focus_mode_default': False
            }
        elif work_pref == 'hybrid':
            # Ask if they're in office today
            return {
                'frequency': 'adaptive',
                'ask_location': True,
                'adjust_based_on_location': True
            }
        else:  # flexible
            return {
                'frequency': 'medium',
                'style': 'adaptive',
                'focus_mode_default': False
            }
```

---

### Phase 4: Settings & Visibility (Week 4) - USER CONTROL

#### Task 4.1: Preferences Impact Dashboard

**File**: `mobile/app/(tabs)/you.tsx`

Add section showing how onboarding choices affect the app:

```typescript
function PreferencesImpactSection() {
  const { preferences } = useUserPreferences();

  const impacts = [
    {
      choice: 'ADHD Support Level',
      value: preferences.adhdSupportLevel,
      impact: `Tasks split into ${getStepCount(preferences.adhdSupportLevel)} micro-steps`
    },
    {
      choice: 'Work Preference',
      value: preferences.workPreference,
      impact: `${getNotificationFrequency(preferences.workPreference)} notifications`
    },
    {
      choice: 'Time Preference',
      value: preferences.dailySchedule?.timePreference,
      impact: `Tasks suggested during ${preferences.dailySchedule?.timePreference} hours`
    },
    {
      choice: 'Productivity Goals',
      value: preferences.productivityGoals?.length || 0,
      impact: `Tracking ${getMetricCount(preferences.productivityGoals)} metrics`
    }
  ];

  return (
    <View style={styles.impactSection}>
      <Text style={styles.sectionTitle}>How Your Choices Shape Your Experience</Text>
      {impacts.map((item, i) => (
        <View key={i} style={styles.impactCard}>
          <Text style={styles.choiceLabel}>{item.choice}</Text>
          <Text style={styles.choiceValue}>{item.value}</Text>
          <Text style={styles.impactText}>➜ {item.impact}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push('/(auth)/onboarding/welcome')}
      >
        <Text>Edit Preferences</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Acceptance Criteria**:
- [ ] User can see how each choice affects the app
- [ ] User can re-run onboarding to update preferences
- [ ] Changes take effect immediately
- [ ] Clear before/after comparison

---

## 📊 Measurement & Validation

### Success Metrics

Track these metrics to validate integration success:

1. **User Perception**:
   - Survey: "Does the app feel personalized to you?" (Target: 80% yes)
   - Survey: "Did your onboarding choices affect your experience?" (Target: 90% yes)

2. **Feature Usage**:
   - % of users who change focus duration (Target: 40%+)
   - % of users viewing goal progress (Target: 60%+)
   - % of users with challenge-specific widgets visible (Target: 70%+)

3. **Technical**:
   - API calls to onboarding endpoint (Should increase by 300%+)
   - Cache hit rate on preferences (Target: 90%+)
   - Latency of preference lookups (Target: <50ms)

### A/B Testing

Run these experiments:

1. **Test**: Show vs hide personalized greeting
   - Hypothesis: Personalized greeting increases engagement
   - Metric: Session duration

2. **Test**: Adaptive micro-steps vs fixed
   - Hypothesis: Adaptive steps reduce overwhelm
   - Metric: Task completion rate

3. **Test**: Goal tracking vs no tracking
   - Hypothesis: Goal visibility increases motivation
   - Metric: Daily active usage

---

## 🚀 Quick Start

### For Developers

1. **Read this document** (you're here!)
2. **Start with Phase 1, Task 1.1** (Backend preferences service)
3. **Work sequentially** through tasks
4. **Test each integration** before moving on
5. **Update this document** with actual implementation notes

### For Product/Design

1. **Review Phase 2 tasks** (Quick Wins) - these have highest user impact
2. **Prioritize based on user research** - which challenges are most common?
3. **Design mockups** showing before/after for each adaptation
4. **Plan user communication** - how do we tell users about personalization?

### For QA

1. **Create test accounts** with different onboarding combinations
2. **Verify each integration** as it's deployed
3. **Document edge cases** (What if user has all challenges? None?)
4. **Performance test** preference lookups under load

---

## ⚠️ Important Notes

### Privacy & Data Usage

- **Be transparent**: Tell users exactly how their data is used
- **Allow updates**: Let users change preferences anytime
- **Respect deletion**: If user deletes onboarding data, fall back to defaults
- **No selling**: Never share onboarding data with third parties

### Technical Considerations

- **Cache aggressively**: Preferences don't change often
- **Fail gracefully**: If preferences unavailable, use sensible defaults
- **Performance**: Preference lookups should be <50ms
- **Backwards compatibility**: Handle users who onboarded before these features

### UX Principles

- **Don't be creepy**: Adaptations should feel helpful, not intrusive
- **Show, don't tell**: User should see effects, not be told "We personalized this"
- **Make it obvious**: User should understand why they see what they see
- **Allow override**: User can always manually adjust settings

---

## 📝 Implementation Checklist

### Phase 1: Foundation
- [ ] Task 1.1: UserPreferencesService (Backend)
- [ ] Task 1.2: useUserPreferences hook (Frontend)
- [ ] Tests for both
- [ ] Documentation updated

### Phase 2: Quick Wins
- [ ] Task 2.1.1: Time display prominence
- [ ] Task 2.1.2: Micro-step granularity
- [ ] Task 2.1.3: Focus session duration
- [ ] Task 2.1.4: Task completion feedback
- [ ] Task 2.2: Smart scheduling
- [ ] Task 2.3: Personalized dashboard
- [ ] User testing completed
- [ ] Metrics baseline established

### Phase 3: Advanced Features
- [ ] Task 3.1: Goal-aligned metrics
- [ ] Task 3.2: Challenge-specific assistance
- [ ] Task 3.3: Work mode adaptations
- [ ] A/B tests launched
- [ ] Analytics dashboard created

### Phase 4: Settings & Visibility
- [ ] Task 4.1: Preferences impact dashboard
- [ ] Allow re-onboarding
- [ ] Settings page updated
- [ ] Help documentation created
- [ ] User announcement prepared

---

## 🎯 Definition of Done

The onboarding integration is complete when:

✅ Every onboarding data point has at least 1 consumer
✅ Users can see personalized elements within 1 minute of completing onboarding
✅ Settings page shows impact of choices
✅ 80%+ of users report app feels personalized
✅ All tests pass
✅ Documentation is complete
✅ Product team approves UX
✅ Analytics show increased engagement

---

**Next Steps**:
1. Review this document with team
2. Get buy-in on approach
3. Start Phase 1, Task 1.1
4. Ship Phase 2 within 2 weeks

**Questions?** Add them to this document or create issues in the tracker.

---

_Last updated: November 10, 2025_
_Owner: Engineering Team_
_Status: 🔴 Ready for Implementation_
