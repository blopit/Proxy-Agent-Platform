import type { Meta, StoryObj } from '@storybook/nextjs';
import BiologicalTabs from './BiologicalTabs';
import React from 'react';

const meta: Meta<typeof BiologicalTabs> = {
  title: 'Components/Mobile/BiologicalTabs',
  component: BiologicalTabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Bottom navigation tabs based on 5 biological circuits for ADHD task management.

**5 Biological Modes**:
1. **Capture** 📷 - Always available for quick thought capture
2. **Search** 🔍 - Forager/Primate mode (optimal: morning, high energy)
3. **Hunt** 🎯 - Predator mode (optimal: morning, energy > 70%)
4. **Rest** 💙 - Herd/Parasympathetic mode (optimal: afternoon, low energy)
5. **Plan** 🗺️ - Elder/Hippocampal replay (optimal: evening/night)

**Features**:
- Energy-aware optimal circuit detection
- Time-of-day biasing
- Pulse animations for optimal modes
- 5% mutation state (rare achievements)`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px', backgroundColor: '#002b36' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['capture', 'search', 'hunt', 'rest', 'plan'],
      description: 'Currently active biological circuit',
    },
    energy: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'Current energy level (0-100)',
    },
    timeOfDay: {
      control: 'select',
      options: ['morning', 'afternoon', 'evening', 'night'],
      description: 'Current time of day for optimal circuit detection',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BiologicalTabs>;

// ============================================================================
// Default States
// ============================================================================

export const Default: Story = {
  args: {
    activeTab: 'capture',
    energy: 75,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
};

export const CaptureActive: Story = {
  args: {
    activeTab: 'capture',
    energy: 65,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Capture mode - always optimal for quick thought capture',
      },
    },
  },
};

export const SearchActive: Story = {
  args: {
    activeTab: 'search',
    energy: 75,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Search mode - optimal in morning with high energy',
      },
    },
  },
};

export const HuntActive: Story = {
  args: {
    activeTab: 'hunt',
    energy: 80,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Hunt mode - optimal in morning or when energy > 70%',
      },
    },
  },
};

export const RestActive: Story = {
  args: {
    activeTab: 'rest',
    energy: 30,
    timeOfDay: 'afternoon',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Rest mode - optimal in afternoon or when energy < 40%',
      },
    },
  },
};

export const PlanActive: Story = {
  args: {
    activeTab: 'plan',
    energy: 50,
    timeOfDay: 'evening',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Plan mode - optimal in evening or night for memory consolidation',
      },
    },
  },
};

// ============================================================================
// Energy Levels
// ============================================================================

export const HighEnergy: Story = {
  args: {
    activeTab: 'hunt',
    energy: 90,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'High energy (90%) - Hunt and Search modes are optimal',
      },
    },
  },
};

export const MediumEnergy: Story = {
  args: {
    activeTab: 'search',
    energy: 55,
    timeOfDay: 'afternoon',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium energy (55%) - balanced state, multiple modes viable',
      },
    },
  },
};

export const LowEnergy: Story = {
  args: {
    activeTab: 'rest',
    energy: 25,
    timeOfDay: 'afternoon',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Low energy (25%) - Rest mode is optimal for recovery',
      },
    },
  },
};

// ============================================================================
// Time of Day
// ============================================================================

export const Morning: Story = {
  args: {
    activeTab: 'hunt',
    energy: 80,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Morning - Hunt and Search modes highlighted as optimal',
      },
    },
  },
};

export const Afternoon: Story = {
  args: {
    activeTab: 'rest',
    energy: 45,
    timeOfDay: 'afternoon',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Afternoon - Rest mode optimal, Search viable with high energy',
      },
    },
  },
};

export const Evening: Story = {
  args: {
    activeTab: 'plan',
    energy: 50,
    timeOfDay: 'evening',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Evening - Plan mode optimal for memory consolidation',
      },
    },
  },
};

export const Night: Story = {
  args: {
    activeTab: 'plan',
    energy: 35,
    timeOfDay: 'night',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Night - Plan mode optimal, rest recommended',
      },
    },
  },
};

// ============================================================================
// Interactive Examples
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [activeTab, setActiveTab] = React.useState('capture');
    const [energy, setEnergy] = React.useState(75);
    const [timeOfDay, setTimeOfDay] = React.useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

    return (
      <div style={{ width: '100%' }}>
        {/* Controls */}
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#073642', borderRadius: '8px' }}>
          <h3 style={{ color: '#fdf6e3', fontSize: '14px', marginBottom: '12px' }}>Controls</h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#93a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
              Energy: {energy}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#93a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
              Time of Day
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#002b36',
                color: '#fdf6e3',
                border: '1px solid #586e75',
                borderRadius: '4px',
              }}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div>
            <p style={{ color: '#93a1a1', fontSize: '11px', marginTop: '12px' }}>
              Active: <strong style={{ color: '#268bd2' }}>{activeTab}</strong>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <BiologicalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          energy={energy}
          timeOfDay={timeOfDay}
        />

        {/* Info */}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#073642', borderRadius: '8px' }}>
          <p style={{ color: '#93a1a1', fontSize: '11px', lineHeight: '1.5' }}>
            {activeTab === 'capture' && 'Capture mode is always available for quick thought dumping'}
            {activeTab === 'search' && 'Search mode: Seek novelty & identify doable micro-targets'}
            {activeTab === 'hunt' && 'Hunt mode: Enter pursuit flow and harvest reward'}
            {activeTab === 'rest' && 'Rest mode: Recover energy & rebuild cognitive tissue'}
            {activeTab === 'plan' && 'Plan mode: Consolidate memory and recalibrate priorities'}
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - adjust energy and time of day to see optimal circuit detection',
      },
    },
  },
};

// ============================================================================
// Real-World Scenarios
// ============================================================================

export const MorningHighEnergy: Story = {
  args: {
    activeTab: 'hunt',
    energy: 85,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario: Fresh morning with high energy - perfect for hunting tasks',
      },
    },
  },
};

export const AfternoonSlump: Story = {
  args: {
    activeTab: 'rest',
    energy: 35,
    timeOfDay: 'afternoon',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario: Afternoon energy slump - rest and recovery recommended',
      },
    },
  },
};

export const EveningReflection: Story = {
  args: {
    activeTab: 'plan',
    energy: 50,
    timeOfDay: 'evening',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario: Evening reflection time - ideal for planning and memory consolidation',
      },
    },
  },
};

export const LateNightBurst: Story = {
  args: {
    activeTab: 'search',
    energy: 65,
    timeOfDay: 'night',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario: Late night energy burst (not optimal, but happens)',
      },
    },
  },
};

// ============================================================================
// Edge Cases
// ============================================================================

export const VeryLowEnergy: Story = {
  args: {
    activeTab: 'rest',
    energy: 10,
    timeOfDay: 'afternoon',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Very low energy (10%) - only rest is viable',
      },
    },
  },
};

export const MaxEnergy: Story = {
  args: {
    activeTab: 'hunt',
    energy: 100,
    timeOfDay: 'morning',
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Maximum energy (100%) - all action modes optimal',
      },
    },
  },
};
