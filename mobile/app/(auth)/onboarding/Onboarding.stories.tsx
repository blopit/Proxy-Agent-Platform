/**
 * Onboarding Stories - Complete onboarding flow screens
 * Shows all 6 onboarding steps with working interactions
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import React, { useState } from 'react';
import { OnboardingProvider } from '@/src/contexts/OnboardingContext';
import { AuthProvider } from '@/src/contexts/AuthContext';

// Import the actual screen components
// Note: expo-router is mocked globally in .rnstorybook/preview.tsx
const WelcomeScreen = require('./welcome').default;
const WorkPreferencesScreen = require('./work-preferences').default;
const ADHDSupportScreen = require('./adhd-support').default;
const DailyScheduleScreen = require('./daily-schedule').default;
const ProductivityGoalsScreen = require('./goals').default;
const OnboardingCompleteScreen = require('./complete').default;

const meta = {
  title: 'Onboarding/Screens',
  component: WelcomeScreen,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#002b36' }}>
        <AuthProvider>
          <OnboardingProvider>
            <Story />
          </OnboardingProvider>
        </AuthProvider>
      </View>
    ),
  ],
} satisfies Meta<typeof WelcomeScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

// ============================================================================
// STEP 1: Welcome Screen
// ============================================================================

export const Step1_Welcome: Story = {
  render: () => <WelcomeScreen />,
  parameters: {
    notes: `
# Welcome Screen - Step 1 of 6

**First onboarding screen that introduces the app and sets expectations**

**Key Features:**
- ✨ Sparkles icon introduction
- 📋 Four key benefits with emojis:
  - 🎯 Tailored to your work style
  - 🧠 ADHD-optimized features
  - ⚡ Smart task management
  - 📊 Visual productivity tracking
- ℹ️ Info box: "Takes about 2-3 minutes"
- 🎯 Progress indicator: Step 1 of 6

**Actions:**
- **Get Started** - Proceed to Step 2 (Work Preferences)
- **Skip for now** - Skip onboarding and go to main app

**Design Notes:**
- Large yellow Sparkles icon for warmth
- Clean benefit list with visual icons
- Clear time expectation (2-3 minutes)
- Non-threatening skip option
    `,
  },
};

// ============================================================================
// STEP 2: Work Preferences Screen
// ============================================================================

export const Step2_WorkPreferences: Story = {
  render: () => <WorkPreferencesScreen />,
  parameters: {
    notes: `
# Work Preferences - Step 2 of 6

**Collects user's work setup preference**

**Work Setup Options:**
1. 🏠 **Remote** - Work from home or anywhere (Blue)
2. 🔄 **Hybrid** - Mix of remote and office (Cyan)
3. 🏢 **Office** - Work from office location (Violet)
4. 🌴 **Flexible** - Varies week to week (Green)

**Key Features:**
- Large visual cards with icons and descriptions
- Color-coded options (each has distinct theme color)
- Selected card shows:
  - Colored border matching option theme
  - Checkmark badge in top right
  - Slightly different background
- Continue button disabled until selection made

**Actions:**
- **Back** - Return to Welcome screen
- **Continue** - Proceed to Step 3 (ADHD Support) [disabled until selection]
- **Skip for now** - Skip onboarding

**Design Pattern:**
- Single-select card interface
- Visual feedback on selection
- Clear labeling with helpful descriptions
    `,
  },
};

// ============================================================================
// STEP 3: ADHD Support Screen
// ============================================================================

export const Step3_ADHDSupport: Story = {
  render: () => <ADHDSupportScreen />,
  parameters: {
    notes: `
# ADHD Support - Step 3 of 6

**Collects desired level of assistance and specific challenges**

**Support Levels (1-10 scale):**
1. 🌱 **Light Touch (3)** - Minimal guidance
   - Basic task lists
   - Simple reminders
   - Clean interface

2. ⚖️ **Balanced Support (5)** - Default selection
   - Smart suggestions
   - Focus timers
   - Progress tracking

3. 🎯 **Extra Help (7)** - More structure
   - Detailed guidance
   - Frequent check-ins
   - Task breakdown

4. 🚀 **Maximum Support (10)** - Full assistance
   - Step-by-step guidance
   - Proactive reminders
   - Full task automation

**Common Challenges (Optional Multi-Select):**
- 🏁 Getting started on tasks
- 🎯 Staying focused
- ⏰ Time awareness
- 📋 Keeping things organized
- ⚡ Beating procrastination
- 🌊 Managing overwhelm

**Key Features:**
- Pre-selected to "Balanced Support (5)" by default
- Large tappable cards for support levels
- Selected level shows cyan border + checkmark
- Chip-based multi-select for challenges
- Optional challenges section (can skip)

**Actions:**
- **Back** - Return to Work Preferences
- **Continue** - Proceed to Step 4 (Daily Schedule)
- **Skip for now** - Skip onboarding

**Design Notes:**
- Non-judgmental language
- Visual hierarchy for support levels
- Flexible challenge selection
    `,
  },
};

// ============================================================================
// STEP 4: Daily Schedule Screen
// ============================================================================

export const Step4_DailySchedule: Story = {
  render: () => <DailyScheduleScreen />,
  parameters: {
    notes: `
# Daily Schedule - Step 4 of 6

**Collects user's work schedule and availability preferences**

**Time Preferences:**
- 🌅 Early Morning
- ☀️ Morning (default)
- 🌤️ Afternoon
- 🌆 Evening
- 🌙 Night
- 🔄 Flexible

**Weekly Availability:**
- M T W T F S S day selector
- Tap to toggle each day
- Selected days show cyan color
- Default: Monday-Friday selected

**Flexible Schedule Toggle:**
- Switch for "My schedule varies"
- Description: "Enable if your schedule changes frequently"
- Cyan when enabled

**Key Features:**
- 📅 Calendar icon header
- Emoji-based time preference chips
- Grid layout for days of week
- iOS-style toggle switch
- Info box explaining usage

**Actions:**
- **Back** - Return to ADHD Support
- **Continue** - Proceed to Step 5 (Productivity Goals)
- **Skip for now** - Skip onboarding

**Design Pattern:**
- Chip-based time selection
- Visual day selector grid
- Toggle for flexibility
- Clear info about how data is used
    `,
  },
};

// ============================================================================
// STEP 5: Productivity Goals Screen
// ============================================================================

export const Step5_ProductivityGoals_Empty: Story = {
  render: () => <ProductivityGoalsScreen />,
  parameters: {
    notes: `
# Productivity Goals - Step 5 of 6 (Empty State)

**Collects user's productivity goals**

**Quick Add Feature:**
- Tap any suggested goal chip to instantly add it to your goals
- Added goals show a checkmark and become disabled
- No modal needed for suggested goals!

**Suggested Goals (tap to add):**
- ✅ Complete 3 tasks daily
- 🎯 Complete 2 Pomodoros (25 min) daily
- 🚀 Finish MVP by end of month
- 🌱 Morning planning ritual every day
- ⚖️ Stop work by 6pm, no weekends
- 🎨 Write 500 words daily
- 📚 Study for 30 min daily

**Custom Goals:**
- Click "Add Custom Goal" button to open modal for custom entries
- Enter your own goal text and select category

**Other Features:**
- Remove goals with X button in "Your Goals" section
- Continue button enabled after adding at least 1 goal
- Back and Skip buttons available

**Actions:**
- **Back** - Return to Daily Schedule
- **Continue** - Proceed to Step 6 (Complete) [disabled until 1+ goal]
- **Skip for now** - Skip onboarding
    `,
  },
};

export const Step5_ProductivityGoals_WithGoals: Story = {
  render: () => <ProductivityGoalsScreen />,
  parameters: {
    notes: `
# Productivity Goals - Step 5 of 6 (Full Testing)

**Quick Testing Flow:**
1. Tap 2-3 suggested goal chips (they'll instantly appear in "Your Goals")
2. Notice chips show checkmark and become disabled after adding
3. Try removing a goal with the X button
4. Add it back by tapping the suggested chip again
5. Click "Add Custom Goal" to test the custom entry modal

**UX Improvements:**
- ✅ One-tap goal selection (no modal for suggested goals)
- ✅ Visual feedback (checkmark + opacity on added goals)
- ✅ Duplicate prevention (can't add same goal twice)
- ✅ Clear separation between "Suggested" and "Your Goals"
- ✅ Continue button enables after adding 1+ goal

**Test Scenarios:**
- Add all 7 suggested goals
- Remove goals and re-add them
- Add custom goal via modal
- Mix suggested + custom goals
- Skip onboarding entirely

**Note:** Goals persist to AsyncStorage across refreshes.
    `,
  },
};

// ============================================================================
// STEP 6: Onboarding Complete Screen
// ============================================================================

export const Step6_Complete: Story = {
  render: () => <OnboardingCompleteScreen />,
  parameters: {
    notes: `
# Onboarding Complete - Step 6 of 6 (Final)

**Celebration screen and transition to main app**

**Animations:**
- ✅ Animated green checkmark (spring animation + fade)
- 📱 All content fades in smoothly
- 🎉 Success celebration feel

**Features Preview:**
1. 🧠 **Brain Dump Mode**
   - Quickly capture thoughts without organization anxiety

2. 🎯 **Focus Sessions**
   - Timed work sessions optimized for your energy

3. 🗺️ **Task Landscape**
   - Visual overview of your entire task world

4. 🤖 **AI Task Breakdown**
   - Automatic decomposition of overwhelming tasks

**Personalization Note:**
- Info box explaining customization based on their profile
- Reminder that settings can be adjusted anytime

**Actions:**
- **🚀 Launch Proxy Agent** - Complete onboarding and enter main app
  - Green button with rocket icon
  - Shadow effect for prominence
  - Replaces navigation to /(tabs)

**Design Notes:**
- Large green checkmark (120px) for success
- Animated entrance for celebration feel
- Feature previews to build excitement
- No back/skip buttons (final step)

**Technical:**
- Calls completeOnboarding() to save all data
- Marks step 6 as complete
- Navigates to main app (tabs)
    `,
  },
};

// ============================================================================
// COMPLETE INTERACTIVE FLOW - All 6 Steps
// ============================================================================

export const CompleteFlow_Interactive: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState<number>(1);

    const screens = [
      WelcomeScreen,
      WorkPreferencesScreen,
      ADHDSupportScreen,
      DailyScheduleScreen,
      ProductivityGoalsScreen,
      OnboardingCompleteScreen,
    ];

    const CurrentScreen = screens[currentStep - 1];

    return <CurrentScreen />;
  },
  parameters: {
    notes: `
# Complete Onboarding Flow - Interactive (6 Steps)

**This is the FULL onboarding experience from start to finish**

Navigate through all 6 screens using the Continue/Back buttons:

**The Journey:**

1️⃣ **Welcome Screen**
   - Introduction to Proxy Agent
   - Benefits overview
   - Time expectation (2-3 minutes)
   ↓
2️⃣ **Work Preferences**
   - Select: Remote / Hybrid / Office / Flexible
   ↓
3️⃣ **ADHD Support Level**
   - Choose support level (1-10)
   - Select common challenges (optional)
   ↓
4️⃣ **Daily Schedule**
   - Preferred time of day
   - Available days (M-S)
   - Flexible schedule toggle
   ↓
5️⃣ **Productivity Goals**
   - Tap suggested goals to add
   - Create custom goals
   - Minimum 1 goal required
   ↓
6️⃣ **Onboarding Complete**
   - Celebration animation
   - Feature previews
   - Launch main app

**Testing Instructions:**
1. Start from Welcome screen
2. Click "Get Started" and proceed through each step
3. Try different selections on each screen
4. Use Back button to review/change answers
5. Observe progress indicator (Step X of 6)
6. Complete all 6 steps to see final celebration

**Features to Test:**
- ✅ Progress persistence (data saved to AsyncStorage)
- ✅ Back/forward navigation
- ✅ Skip functionality (available on every screen)
- ✅ Continue button states (enabled/disabled)
- ✅ Visual feedback on selections
- ✅ Final celebration animation

**Note:** Navigation shows alerts in Storybook (router is mocked).
The full flow works in the actual app with real routing!
    `,
  },
};
