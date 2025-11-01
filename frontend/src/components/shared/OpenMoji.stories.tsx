import type { Meta, StoryObj } from '@storybook/nextjs';
import OpenMoji from './OpenMoji';
import React from 'react';

const meta: Meta<typeof OpenMoji> = {
  title: 'Shared/OpenMoji',
  component: OpenMoji,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Consistent emoji rendering using OpenMoji SVG library.

**Features**:
- Renders emojis as crisp SVG graphics (not OS-dependent fonts)
- Two variants: black (line art) and color
- 3D effects: engraved (carved in) and embossed (raised out)
- Consistent appearance across all platforms and browsers
- CDN delivery for efficient loading
- Graceful fallback to native emoji on error
- Customizable size

**Variants**:
- **black** - Line art / outlined style (default)
- **color** - Full color version

**3D Effects**:
- **engraved** - Debossed / carved in appearance (dark above, light below)
- **embossed** - Raised / popping out appearance (light above, dark below)

**Use Cases**:
- Icon replacement for consistent cross-platform appearance
- Category indicators
- Status icons
- Achievement badges
- Mood/emotion indicators
- Decorative elements`,
      },
    },
  },
  argTypes: {
    emoji: {
      control: 'text',
      description: 'Emoji character to display',
    },
    size: {
      control: { type: 'range', min: 12, max: 128, step: 4 },
      description: 'Size in pixels',
    },
    variant: {
      control: 'radio',
      options: ['black', 'color'],
      description: 'Visual variant',
    },
    engraved: {
      control: 'boolean',
      description: 'Apply engraved/debossed 3D effect',
    },
    embossed: {
      control: 'boolean',
      description: 'Apply embossed/raised 3D effect',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OpenMoji>;

// ============================================================================
// Basic Variants
// ============================================================================

export const BlackVariant: Story = {
  args: {
    emoji: '📝',
    size: 32,
    variant: 'black',
  },
};

export const ColorVariant: Story = {
  args: {
    emoji: '📝',
    size: 32,
    variant: 'color',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Size16: Story = {
  args: {
    emoji: '✅',
    size: 16,
  },
};

export const Size24: Story = {
  args: {
    emoji: '✅',
    size: 24,
  },
};

export const Size32: Story = {
  args: {
    emoji: '✅',
    size: 32,
  },
};

export const Size48: Story = {
  args: {
    emoji: '✅',
    size: 48,
  },
};

export const Size64: Story = {
  args: {
    emoji: '✅',
    size: 64,
  },
};

// ============================================================================
// 3D Effects
// ============================================================================

export const Engraved: Story = {
  args: {
    emoji: '⭐',
    size: 48,
    variant: 'black',
    engraved: true,
  },
};

export const Embossed: Story = {
  args: {
    emoji: '⭐',
    size: 48,
    variant: 'black',
    embossed: true,
  },
};

// ============================================================================
// Common Emojis Collection
// ============================================================================

export const CommonBlackEmojis: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
      <OpenMoji emoji="✅" size={32} variant="black" />
      <OpenMoji emoji="❌" size={32} variant="black" />
      <OpenMoji emoji="⚠️" size={32} variant="black" />
      <OpenMoji emoji="ℹ️" size={32} variant="black" />
      <OpenMoji emoji="🔔" size={32} variant="black" />
      <OpenMoji emoji="📝" size={32} variant="black" />
      <OpenMoji emoji="📅" size={32} variant="black" />
      <OpenMoji emoji="⏰" size={32} variant="black" />
      <OpenMoji emoji="🎯" size={32} variant="black" />
      <OpenMoji emoji="🚀" size={32} variant="black" />
      <OpenMoji emoji="⭐" size={32} variant="black" />
      <OpenMoji emoji="🔥" size={32} variant="black" />
    </div>
  ),
};

export const CommonColorEmojis: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
      <OpenMoji emoji="✅" size={32} variant="color" />
      <OpenMoji emoji="❌" size={32} variant="color" />
      <OpenMoji emoji="⚠️" size={32} variant="color" />
      <OpenMoji emoji="ℹ️" size={32} variant="color" />
      <OpenMoji emoji="🔔" size={32} variant="color" />
      <OpenMoji emoji="📝" size={32} variant="color" />
      <OpenMoji emoji="📅" size={32} variant="color" />
      <OpenMoji emoji="⏰" size={32} variant="color" />
      <OpenMoji emoji="🎯" size={32} variant="color" />
      <OpenMoji emoji="🚀" size={32} variant="color" />
      <OpenMoji emoji="⭐" size={32} variant="color" />
      <OpenMoji emoji="🔥" size={32} variant="color" />
    </div>
  ),
};

// ============================================================================
// Size Comparison
// ============================================================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🎯" size={16} />
        <span style={{ fontSize: '12px', opacity: 0.7 }}>16px</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🎯" size={24} />
        <span style={{ fontSize: '12px', opacity: 0.7 }}>24px</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🎯" size={32} />
        <span style={{ fontSize: '12px', opacity: 0.7 }}>32px</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🎯" size={48} />
        <span style={{ fontSize: '12px', opacity: 0.7 }}>48px</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🎯" size={64} />
        <span style={{ fontSize: '12px', opacity: 0.7 }}>64px</span>
      </div>
    </div>
  ),
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const StatusIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="✅" size={20} variant="color" />
        <span style={{ fontSize: '14px' }}>Task completed successfully</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="⏳" size={20} variant="color" />
        <span style={{ fontSize: '14px' }}>Task in progress</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="⚠️" size={20} variant="color" />
        <span style={{ fontSize: '14px' }}>Needs attention</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="❌" size={20} variant="color" />
        <span style={{ fontSize: '14px' }}>Task failed</span>
      </div>
    </div>
  ),
};

export const CategoryIcons: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <OpenMoji emoji="💼" size={32} variant="color" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Work</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <OpenMoji emoji="🏠" size={32} variant="color" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Personal</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <OpenMoji emoji="💪" size={32} variant="color" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Health</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <OpenMoji emoji="📚" size={32} variant="color" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Learning</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <OpenMoji emoji="🎨" size={32} variant="color" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Creative</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <OpenMoji emoji="⚙️" size={32} variant="color" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Settings</span>
      </div>
    </div>
  ),
};

export const AchievementBadges: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '500px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(133, 153, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OpenMoji emoji="🏆" size={40} variant="color" />
        </div>
        <span style={{ fontSize: '12px', textAlign: 'center' }}>Champion</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(38, 139, 210, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OpenMoji emoji="🔥" size={40} variant="color" />
        </div>
        <span style={{ fontSize: '12px', textAlign: 'center' }}>On Fire</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(42, 161, 152, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OpenMoji emoji="⭐" size={40} variant="color" />
        </div>
        <span style={{ fontSize: '12px', textAlign: 'center' }}>All Star</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(108, 113, 196, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OpenMoji emoji="🚀" size={40} variant="color" />
        </div>
        <span style={{ fontSize: '12px', textAlign: 'center' }}>Rocket</span>
      </div>
    </div>
  ),
};

export const MoodIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="😊" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Happy</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="😐" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Neutral</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="😔" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Sad</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="😤" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Frustrated</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🤔" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Thinking</span>
      </div>
    </div>
  ),
};

export const PriorityLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid #dc322f', borderRadius: '8px' }}>
        <OpenMoji emoji="🔴" size={24} variant="color" />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Critical</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Highest priority</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid #cb4b16', borderRadius: '8px' }}>
        <OpenMoji emoji="🟠" size={24} variant="color" />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>High</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Important task</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid #b58900', borderRadius: '8px' }}>
        <OpenMoji emoji="🟡" size={24} variant="color" />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Medium</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Standard priority</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid #268bd2', borderRadius: '8px' }}>
        <OpenMoji emoji="🔵" size={24} variant="color" />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Low</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Can wait</div>
        </div>
      </div>
    </div>
  ),
};

export const TimeOfDay: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🌅" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Morning</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="☀️" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Afternoon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🌆" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Evening</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <OpenMoji emoji="🌙" size={48} variant="color" />
        <span style={{ fontSize: '12px' }}>Night</span>
      </div>
    </div>
  ),
};

// ============================================================================
// 3D Effects Comparison
// ============================================================================

export const EffectsComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="⭐" size={64} variant="black" />
        <span style={{ fontSize: '12px' }}>Normal</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="⭐" size={64} variant="black" engraved />
        <span style={{ fontSize: '12px' }}>Engraved</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <OpenMoji emoji="⭐" size={64} variant="black" embossed />
        <span style={{ fontSize: '12px' }}>Embossed</span>
      </div>
    </div>
  ),
};
