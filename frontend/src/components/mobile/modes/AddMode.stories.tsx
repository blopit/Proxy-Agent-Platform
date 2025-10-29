import type { Meta, StoryObj } from '@storybook/react';
import AddMode, { CaptureItem, CaptureType } from './AddMode';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof AddMode> = {
  title: 'Mobile/Modes/AddMode',
  component: AddMode,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'solarized-dark',
      values: [
        {
          name: 'solarized-dark',
          value: semanticColors.bg.primary,
        },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onCapture: { action: 'captured' },
    onCancel: { action: 'cancelled' },
    initialType: {
      control: 'select',
      options: ['task', 'habit', 'event', 'goal', 'shopping', 'data'],
      description: 'Initial capture type selection',
    },
    suggestionsVisible: {
      control: 'boolean',
      description: 'Whether to show the suggestions panel',
    },
    suggestions: {
      control: 'object',
      description: 'Custom suggestions to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddMode>;

// ============================================================================
// Mock Data
// ============================================================================

const taskSuggestions = [
  'Review pull request for authentication module',
  'Schedule dentist appointment for next week',
  'Update project documentation',
];

const habitSuggestions = [
  'Exercise for 30 minutes every morning',
  'Read 10 pages before bed',
  'Meditate for 5 minutes',
];

const eventSuggestions = [
  'Team standup meeting at 10am tomorrow',
  'Birthday party on Saturday',
  'Conference call with client at 2pm',
];

const goalSuggestions = [
  'Launch new product by end of quarter',
  'Learn Spanish to conversational level',
  'Run a 5K marathon',
];

const shoppingSuggestions = [
  'Milk, eggs, bread, coffee',
  'New running shoes',
  'Birthday gift for mom',
];

const dataSuggestions = [
  'Interesting article: How to improve focus',
  'Quote: "The only way to do great work is to love what you do"',
  'Random idea: What if we combined X with Y?',
];

// ============================================================================
// Stories - Capture Types
// ============================================================================

export const DefaultTask: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured task:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default AddMode with Task capture type. Shows text input, multi-modal buttons, and connection panel with history and suggestions.',
      },
    },
  },
};

export const HabitCapture: Story = {
  args: {
    initialType: 'habit',
    suggestionsVisible: true,
    suggestions: habitSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured habit:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode configured for habit tracking with habit-specific suggestions.',
      },
    },
  },
};

export const EventCapture: Story = {
  args: {
    initialType: 'event',
    suggestionsVisible: true,
    suggestions: eventSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured event:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode configured for event capture with calendar-style suggestions.',
      },
    },
  },
};

export const GoalCapture: Story = {
  args: {
    initialType: 'goal',
    suggestionsVisible: true,
    suggestions: goalSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured goal:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode configured for goal setting with aspirational examples.',
      },
    },
  },
};

export const ShoppingCapture: Story = {
  args: {
    initialType: 'shopping',
    suggestionsVisible: true,
    suggestions: shoppingSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured shopping item:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode configured for shopping list items.',
      },
    },
  },
};

export const DataCapture: Story = {
  args: {
    initialType: 'data',
    suggestionsVisible: true,
    suggestions: dataSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured data:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode configured for general data/note capture.',
      },
    },
  },
};

// ============================================================================
// Stories - Configuration Variants
// ============================================================================

export const NoSuggestions: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: false,
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode with suggestions panel hidden for minimal distraction.',
      },
    },
  },
};

export const CustomSuggestions: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: [
      'Custom suggestion 1: Fix the bug in production',
      'Custom suggestion 2: Deploy the hotfix',
      'Custom suggestion 3: Write incident report',
    ],
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'AddMode with custom suggestions provided by parent component for context-aware recommendations.',
      },
    },
  },
};

export const MinimalMode: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: false,
    suggestions: [],
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal AddMode configuration - just the input, no suggestions or history.',
      },
    },
  },
};

// ============================================================================
// Stories - ADHD-Optimized Features
// ============================================================================

export const ADHDOptimized: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: `**ADHD-Optimized Features Demonstrated:**

- **Low-friction entry**: Text input auto-focused on mount, ready to type immediately
- **Multiple input modes**: Text, Voice, Camera, Image - choose based on executive function capacity
- **Progressive disclosure**: Start with simple text, reveal complexity as needed
- **External memory**: History tab shows recent captures to reduce working memory load
- **Chunking**: Clear type categories (Task, Habit, Event, etc.) reduce decision paralysis
- **Visual feedback**: Color-coded types, clear active states
- **Keyboard shortcuts**: Cmd/Ctrl+Enter to capture without reaching for mouse

**Try it:**
1. Type text and press Cmd/Ctrl+Enter to capture
2. Click Voice button to try speech-to-text
3. Click Camera to capture images with descriptions
4. Switch between capture types to see color-coded feedback
5. Check History tab to see external memory in action
`,
      },
    },
  },
};

export const MultiModalWorkflow: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: `**Multi-Modal Input Workflow:**

**Text Input** (Default):
- Fastest for those comfortable typing
- Auto-focused on mount
- Keyboard shortcut: Cmd/Ctrl+Enter to capture

**Voice Input**:
- Click microphone button
- Browser will request permission (Chrome/Edge only)
- Speak naturally - transcript appears in real-time
- Stop recording when done - text auto-fills

**Camera Input**:
- Click camera button
- Browser requests camera permission
- Live preview appears
- Take picture → Add description → Save

**Image Upload**:
- Click image button
- Choose from device gallery
- Add description → Save

**Executive Function Benefit**: Each mode reduces different barriers to task initiation.
`,
      },
    },
  },
};

// ============================================================================
// Stories - Interactive Playground
// ============================================================================

export const Playground: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => {
      console.log('Captured item:', item);
      alert(`Captured ${item.type}: ${item.content}`);
    },
    onCancel: () => {
      console.log('Cancelled');
      alert('Capture cancelled');
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Interactive Playground**: Experiment with all AddMode features.

**Controls Available:**
- Change initial capture type
- Toggle suggestions visibility
- Provide custom suggestions
- Test capture/cancel callbacks

**Features to Test:**
1. **Type Switching**: Click different capture types (Task, Habit, Event, Goal, Shopping, Data)
2. **Text Input**: Type and press Cmd/Ctrl+Enter or click Add button
3. **Voice Input**: Click microphone (Chrome/Edge only, requires permission)
4. **Camera**: Click camera button (requires permission)
5. **Image Upload**: Click image button to choose from device
6. **History**: Capture multiple items, see them in History tab
7. **Suggestions**: Click suggestions to auto-fill input
8. **Connection Panel**: Switch between History and Suggestions tabs

**ADHD Testing Notes:**
- Try switching types mid-input - input persists (working memory support)
- Capture items and check History - external memory reduces cognitive load
- Try voice when typing feels hard - cognitive flexibility support
- Use suggestions when initiating feels difficult - initiation support
`,
      },
    },
  },
};

// ============================================================================
// Stories - Mobile Responsive
// ============================================================================

export const MobileView: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'AddMode in mobile viewport - optimized for touch interactions and one-handed use.',
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'AddMode in tablet viewport - balanced layout with more visible history items.',
      },
    },
  },
};

// ============================================================================
// Stories - Use Cases
// ============================================================================

export const QuickTaskCapture: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: [
      'Call client back about proposal',
      'Fix production bug in user auth',
      'Review PR #234 before standup',
    ],
    onCapture: (item: CaptureItem) => console.log('Captured quick task:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use case: Quickly capturing tasks during a busy workday with context-aware suggestions.',
      },
    },
  },
};

export const ShoppingList: Story = {
  args: {
    initialType: 'shopping',
    suggestionsVisible: true,
    suggestions: [
      'Milk, eggs, bread',
      'Fresh vegetables for the week',
      'Snacks for kids',
    ],
    onCapture: (item: CaptureItem) => console.log('Added to shopping list:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use case: Building a shopping list with voice input (speak items while in store).',
      },
    },
  },
};

export const MeetingNotes: Story = {
  args: {
    initialType: 'data',
    suggestionsVisible: true,
    suggestions: [
      'Action item from meeting',
      'Key decision made',
      'Follow-up required',
    ],
    onCapture: (item: CaptureItem) => console.log('Captured note:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use case: Capturing meeting notes and action items with multi-modal input (type notes, snap photo of whiteboard).',
      },
    },
  },
};

export const HabitTracking: Story = {
  args: {
    initialType: 'habit',
    suggestionsVisible: true,
    suggestions: [
      'Morning meditation - 5 minutes',
      'Drink 8 glasses of water',
      'No phone after 9pm',
    ],
    onCapture: (item: CaptureItem) => console.log('Habit added:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use case: Setting up daily habits with clear, specific examples.',
      },
    },
  },
};

// ============================================================================
// Stories - Edge Cases
// ============================================================================

export const EmptyState: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: [],
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: No custom suggestions provided - shows type-specific default examples.',
      },
    },
  },
};

export const LongSuggestions: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: [
      'This is a very long suggestion that demonstrates how the component handles text overflow and wrapping in the suggestions panel. It should wrap properly without breaking the layout.',
      'Another long suggestion with lots of details: Review the entire authentication system including OAuth integration, JWT token management, refresh token rotation, and session handling.',
      'Complete the quarterly planning document including team goals, individual OKRs, resource allocation, budget planning, and stakeholder communication strategy.',
    ],
    onCapture: (item: CaptureItem) => console.log('Captured:', item),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Very long suggestions to test text wrapping and layout handling.',
      },
    },
  },
};

export const AllTypesWorkflow: Story = {
  args: {
    initialType: 'task',
    suggestionsVisible: true,
    suggestions: taskSuggestions,
    onCapture: (item: CaptureItem) => {
      console.log('Captured:', item);
      // In real app: would add to appropriate list based on type
    },
  },
  parameters: {
    docs: {
      description: {
        story: `**Workflow: Switching Between All Capture Types**

Test the type switcher by capturing different items:

1. **Task**: "Review code for PR #123" (work item)
2. **Habit**: "Exercise 30 min daily" (recurring behavior)
3. **Event**: "Team lunch Friday 12pm" (calendar item)
4. **Goal**: "Launch v2.0 by Q2" (long-term objective)
5. **Shopping**: "Groceries for the week" (purchase list)
6. **Data**: "Great quote from the meeting" (note/reference)

Notice how each type has:
- Distinct icon and color
- Contextual placeholder text
- Type-specific suggestions
- Appropriate border color for visual feedback
`,
      },
    },
  },
};
