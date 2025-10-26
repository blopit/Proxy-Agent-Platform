import type { Meta, StoryObj } from '@storybook/nextjs';
import CaptureMode from './CaptureMode';
import React from 'react';

const meta: Meta<typeof CaptureMode> = {
  title: 'Components/Mobile/Modes/CaptureMode',
  component: CaptureMode,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**Capture Mode** - Quick thought capture interface for ADHD brains

**Key Features**:
- **Zero friction** - Start typing immediately
- **Recent history** - See what you've captured recently
- **Smart suggestions** - Rotating examples to overcome blank-page syndrome
- **Ticker animations** - Keeps interface dynamic and engaging

**Design Philosophy**:
- No menus, no navigation - just capture
- Natural language input (no forms)
- Voice input ready (Web Speech API)
- 2-second capture target`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100%', backgroundColor: '#002b36' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CaptureMode>;

// ============================================================================
// Sample Data
// ============================================================================

const DEFAULT_SUGGESTION_LABELS = [
  'Try these...',
  'Quick examples',
  'Need ideas?',
  'Start with...',
  'Common tasks',
];

const DEFAULT_SUGGESTION_EXAMPLES = [
  'Email Sara about the meeting agenda',
  'Turn off the AC when I leave for the day',
  'Set up smart light automation for bedroom',
  'Research best task management apps',
  'Draft blog post about productivity',
  'Schedule dentist appointment for next week',
  'Order groceries for the weekend',
  'Fix the leaky faucet in bathroom',
  'Call mom on her birthday',
  'Update resume with recent projects',
  'Book flight tickets for vacation',
  'Pay electric bill before Friday',
];

// ============================================================================
// Default States
// ============================================================================

export const Default: Story = {
  args: {
    suggestionsVisible: true,
    suggestionExamples: DEFAULT_SUGGESTION_EXAMPLES,
    suggestionLabels: DEFAULT_SUGGESTION_LABELS,
    onTaskCaptured: () => console.log('Task captured!'),
    onExampleClick: (text: string) => console.log('Example clicked:', text),
  },
};

export const WithSuggestions: Story = {
  args: {
    suggestionsVisible: true,
    suggestionExamples: DEFAULT_SUGGESTION_EXAMPLES,
    suggestionLabels: DEFAULT_SUGGESTION_LABELS,
    onTaskCaptured: () => console.log('Task captured!'),
    onExampleClick: (text: string) => console.log('Example clicked:', text),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state with rotating suggestion tickers to help overcome blank-page syndrome',
      },
    },
  },
};

export const WithoutSuggestions: Story = {
  args: {
    suggestionsVisible: false,
    onTaskCaptured: () => console.log('Task captured!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Clean state without suggestions - for advanced users who know what to capture',
      },
    },
  },
};

// ============================================================================
// Recent Captures
// ============================================================================

export const WithRecentCaptures: Story = {
  render: function WithRecentStory(args) {
    React.useEffect(() => {
      // Simulate recent captures in localStorage
      const recentCaptures = [
        'Email Sara about quarterly review',
        'Set up automation for AC',
        'Research best ADHD apps',
      ];
      localStorage.setItem('recentCaptures', JSON.stringify(recentCaptures));

      return () => {
        localStorage.removeItem('recentCaptures');
      };
    }, []);

    return <CaptureMode {...args} />;
  },
  args: {
    suggestionsVisible: true,
    suggestionExamples: DEFAULT_SUGGESTION_EXAMPLES,
    suggestionLabels: DEFAULT_SUGGESTION_LABELS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows recent captures from localStorage at the top',
      },
    },
  },
};

export const ManyRecentCaptures: Story = {
  render: function ManyRecentStory(args) {
    React.useEffect(() => {
      // Simulate many recent captures
      const recentCaptures = [
        'Email Sara about quarterly review',
        'Set up automation for AC when leaving',
        'Research best ADHD task management apps',
        'Schedule dentist appointment',
        'Pay electric bill before Friday',
        'Update resume with recent projects',
        'Book flight tickets for summer vacation',
        'Fix the leaky kitchen faucet',
      ];
      localStorage.setItem('recentCaptures', JSON.stringify(recentCaptures));

      return () => {
        localStorage.removeItem('recentCaptures');
      };
    }, []);

    return <CaptureMode {...args} />;
  },
  args: {
    suggestionsVisible: true,
    suggestionExamples: DEFAULT_SUGGESTION_EXAMPLES,
    suggestionLabels: DEFAULT_SUGGESTION_LABELS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Many recent captures - scrollable list',
      },
    },
  },
};

// ============================================================================
// Different Suggestion Sets
// ============================================================================

export const WorkTasks: Story = {
  args: {
    suggestionsVisible: true,
    suggestionExamples: [
      'Email team about project update',
      'Schedule 1-on-1 with manager',
      'Review pull requests',
      'Update project documentation',
      'Prepare slides for client meeting',
      'Follow up with stakeholders',
    ],
    suggestionLabels: ['Work tasks', 'Professional', 'Office stuff', 'Team work'],
    onExampleClick: (text: string) => console.log('Work task:', text),
  },
  parameters: {
    docs: {
      description: {
        story: 'Work-focused suggestions',
      },
    },
  },
};

export const HomeTasks: Story = {
  args: {
    suggestionsVisible: true,
    suggestionExamples: [
      'Fix leaky faucet in bathroom',
      'Water the plants',
      'Vacuum living room',
      'Take out recycling',
      'Order groceries online',
      'Schedule HVAC maintenance',
    ],
    suggestionLabels: ['Home tasks', 'Chores', 'House stuff', 'Around the house'],
    onExampleClick: (text: string) => console.log('Home task:', text),
  },
  parameters: {
    docs: {
      description: {
        story: 'Home/chore-focused suggestions',
      },
    },
  },
};

export const DigitalTasks: Story = {
  args: {
    suggestionsVisible: true,
    suggestionExamples: [
      'Set up email automation rule',
      'Create Zapier workflow for invoices',
      'Schedule social media posts',
      'Backup important files to cloud',
      'Update website contact form',
      'Configure smart home automation',
    ],
    suggestionLabels: ['Digital tasks', 'Automation', 'Tech stuff', 'Can delegate'],
    onExampleClick: (text: string) => console.log('Digital task:', text),
  },
  parameters: {
    docs: {
      description: {
        story: 'Digital/automation-focused suggestions (can be delegated to agents)',
      },
    },
  },
};

// ============================================================================
// Interactive Examples
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [suggestionsVisible, setSuggestionsVisible] = React.useState(true);
    const [captureLog, setCaptureLog] = React.useState<string[]>([]);

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Controls */}
        <div style={{ padding: '12px', backgroundColor: '#073642', borderBottom: '1px solid #586e75' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fdf6e3', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={suggestionsVisible}
              onChange={(e) => setSuggestionsVisible(e.target.checked)}
            />
            Show Suggestions
          </label>

          {captureLog.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ color: '#93a1a1', fontSize: '10px', marginBottom: '4px' }}>
                Last captured:
              </p>
              <p style={{ color: '#268bd2', fontSize: '11px' }}>
                {captureLog[captureLog.length - 1]}
              </p>
            </div>
          )}
        </div>

        {/* Capture Mode */}
        <div style={{ flex: 1 }}>
          <CaptureMode
            suggestionsVisible={suggestionsVisible}
            suggestionExamples={DEFAULT_SUGGESTION_EXAMPLES}
            suggestionLabels={DEFAULT_SUGGESTION_LABELS}
            onTaskCaptured={() => {
              console.log('Task captured!');
              setCaptureLog([...captureLog, 'Task captured at ' + new Date().toLocaleTimeString()]);
            }}
            onExampleClick={(text) => {
              console.log('Example clicked:', text);
              setCaptureLog([...captureLog, text]);
            }}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - toggle suggestions and track captures',
      },
    },
  },
};

// ============================================================================
// Empty State
// ============================================================================

export const Empty: Story = {
  render: function EmptyStory(args) {
    React.useEffect(() => {
      // Clear localStorage
      localStorage.removeItem('recentCaptures');
    }, []);

    return <CaptureMode {...args} />;
  },
  args: {
    suggestionsVisible: true,
    suggestionExamples: DEFAULT_SUGGESTION_EXAMPLES,
    suggestionLabels: DEFAULT_SUGGESTION_LABELS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state - no recent captures, only suggestions visible',
      },
    },
  },
};

// ============================================================================
// Real-World Scenarios
// ============================================================================

export const FirstTimeUser: Story = {
  render: function FirstTimeStory(args) {
    React.useEffect(() => {
      localStorage.removeItem('recentCaptures');
    }, []);

    return <CaptureMode {...args} />;
  },
  args: {
    suggestionsVisible: true,
    suggestionExamples: [
      'Try: Email Sara about the meeting',
      'Try: Turn off AC when I leave',
      'Try: Schedule dentist appointment',
    ],
    suggestionLabels: [
      'Welcome! Try capturing a thought...',
      'Just type naturally...',
      'No forms, no fields, just write!',
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'First-time user experience with welcoming suggestions',
      },
    },
  },
};

export const PowerUser: Story = {
  render: function PowerUserStory(args) {
    React.useEffect(() => {
      const recentCaptures = [
        'Email Sara re: Q4 OKRs and alignment meeting',
        'IFTTT: AC off when phone leaves home geofence',
        'Research Notion vs Obsidian for PKM system',
        'Book dentist - preference for morning slots',
        'Pay electric bill (autopay setup pending)',
        'Update LinkedIn with new role and projects',
        'Flight tickets: SF→NYC June 15-20',
      ];
      localStorage.setItem('recentCaptures', JSON.stringify(recentCaptures));

      return () => {
        localStorage.removeItem('recentCaptures');
      };
    }, []);

    return <CaptureMode {...args} />;
  },
  args: {
    suggestionsVisible: false, // Power users don't need suggestions
  },
  parameters: {
    docs: {
      description: {
        story: 'Power user - many recent captures, no suggestions needed',
      },
    },
  },
};

// ============================================================================
// Accessibility
// ============================================================================

export const HighContrast: Story = {
  args: {
    suggestionsVisible: true,
    suggestionExamples: DEFAULT_SUGGESTION_EXAMPLES,
    suggestionLabels: DEFAULT_SUGGESTION_LABELS,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: '100vh',
          width: '100%',
          backgroundColor: '#000',
          filter: 'contrast(1.2)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'High contrast mode for better visibility',
      },
    },
  },
};
