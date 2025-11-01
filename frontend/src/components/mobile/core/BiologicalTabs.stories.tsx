import type { Meta, StoryObj } from '@storybook/nextjs';
import BiologicalTabs from './BiologicalTabs';
import React from 'react';

const meta: Meta<typeof BiologicalTabs> = {
  title: 'Mobile/Core/BiologicalTabs',
  component: BiologicalTabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Bottom navigation tabs based on 5 biological circuits for ADHD task management.
Built with ChevronStep components for consistent visual language.

**5 Biological Modes**:
1. **Add** ➕ - Always available for quick thought capture
2. **Scout** 🔍 - Forager/Primate mode (optimal: morning, high energy)
3. **Hunt** 🎯 - Predator mode (optimal: morning, energy > 70%)
4. **Recharge** 💙 - Herd/Parasympathetic mode (optimal: afternoon, low energy)
5. **Map** 🗺️ - Elder/Hippocampal replay (optimal: evening/night)

**Features**:
- ChevronStep integration with 'tab' status for inactive tabs
- Energy-aware optimal circuit detection
- Time-of-day biasing
- Pulse animations for optimal modes
- Lucide icons for all tabs`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '600px', padding: '20px', backgroundColor: 'transparent' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['add', 'scout', 'hunt', 'recharge', 'map'],
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
    showLabels: {
      control: 'boolean',
      description: 'Show labels with icons (false = icon-only for mobile)',
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
    activeTab: 'add',
    energy: 75,
    timeOfDay: 'morning',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
};

export const IconOnly: Story = {
  args: {
    activeTab: 'scout',
    energy: 75,
    timeOfDay: 'morning',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Mobile-first: Icon-only display (default behavior)',
      },
    },
  },
};

export const WithLabels: Story = {
  args: {
    activeTab: 'scout',
    energy: 75,
    timeOfDay: 'morning',
    showLabels: true,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Wider displays: Icon + label display',
      },
    },
  },
};

export const AddActive: Story = {
  args: {
    activeTab: 'add',
    energy: 65,
    timeOfDay: 'morning',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Add mode - always optimal for quick thought capture',
      },
    },
  },
};

export const ScoutActive: Story = {
  args: {
    activeTab: 'scout',
    energy: 75,
    timeOfDay: 'morning',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scout mode - optimal in morning with high energy',
      },
    },
  },
};

export const HuntActive: Story = {
  args: {
    activeTab: 'hunt',
    energy: 80,
    timeOfDay: 'morning',
    showLabels: false,
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

export const RechargeActive: Story = {
  args: {
    activeTab: 'recharge',
    energy: 30,
    timeOfDay: 'afternoon',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recharge mode - optimal in afternoon or when energy < 40%',
      },
    },
  },
};

export const MapActive: Story = {
  args: {
    activeTab: 'map',
    energy: 50,
    timeOfDay: 'evening',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Map mode - optimal in evening or night for memory consolidation',
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
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'High energy (90%) - Hunt and Scout modes are optimal',
      },
    },
  },
};

export const MediumEnergy: Story = {
  args: {
    activeTab: 'scout',
    energy: 55,
    timeOfDay: 'afternoon',
    showLabels: false,
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
    activeTab: 'recharge',
    energy: 25,
    timeOfDay: 'afternoon',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Low energy (25%) - Recharge mode is optimal for recovery',
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
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Morning - Hunt and Scout modes highlighted as optimal',
      },
    },
  },
};

export const Afternoon: Story = {
  args: {
    activeTab: 'recharge',
    energy: 45,
    timeOfDay: 'afternoon',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Afternoon - Recharge mode optimal, Scout viable with high energy',
      },
    },
  },
};

export const Evening: Story = {
  args: {
    activeTab: 'map',
    energy: 50,
    timeOfDay: 'evening',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Evening - Map mode optimal for memory consolidation',
      },
    },
  },
};

export const Night: Story = {
  args: {
    activeTab: 'map',
    energy: 35,
    timeOfDay: 'night',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Night - Map mode optimal, recharge recommended',
      },
    },
  },
};

// ============================================================================
// Interactive Examples
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [activeTab, setActiveTab] = React.useState('add');
    const [energy, setEnergy] = React.useState(75);
    const [timeOfDay, setTimeOfDay] = React.useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
    const [showLabels, setShowLabels] = React.useState(false);

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

          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#93a1a1', fontSize: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Show Labels
            </label>
          </div>

          <div>
            <p style={{ color: '#93a1a1', fontSize: '11px', marginTop: '12px' }}>
              Active: <strong style={{ color: '#268bd2' }}>{activeTab === 'add' ? 'Add' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <BiologicalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          energy={energy}
          timeOfDay={timeOfDay}
          showLabels={showLabels}
        />

        {/* Info */}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#073642', borderRadius: '8px' }}>
          <p style={{ color: '#93a1a1', fontSize: '11px', lineHeight: '1.5' }}>
            {activeTab === 'add' && 'Add mode is always available for quick thought capture'}
            {activeTab === 'scout' && 'Scout mode: Seek novelty & identify doable micro-targets'}
            {activeTab === 'hunt' && 'Hunt mode: Enter pursuit flow and harvest reward'}
            {activeTab === 'recharge' && 'Recharge mode: Recover energy & rebuild cognitive tissue'}
            {activeTab === 'map' && 'Map mode: Consolidate memory and recalibrate priorities'}
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
    showLabels: false,
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
    activeTab: 'recharge',
    energy: 35,
    timeOfDay: 'afternoon',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario: Afternoon energy slump - recharge and recovery recommended',
      },
    },
  },
};

export const EveningReflection: Story = {
  args: {
    activeTab: 'map',
    energy: 50,
    timeOfDay: 'evening',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario: Evening reflection time - ideal for mapping and memory consolidation',
      },
    },
  },
};

export const LateNightBurst: Story = {
  args: {
    activeTab: 'scout',
    energy: 65,
    timeOfDay: 'night',
    showLabels: false,
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
    activeTab: 'recharge',
    energy: 10,
    timeOfDay: 'afternoon',
    showLabels: false,
    onTabChange: (tab: string) => console.log('Tab changed to:', tab),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Very low energy (10%) - only recharge is viable',
      },
    },
  },
};

export const MaxEnergy: Story = {
  args: {
    activeTab: 'hunt',
    energy: 100,
    timeOfDay: 'morning',
    showLabels: false,
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
