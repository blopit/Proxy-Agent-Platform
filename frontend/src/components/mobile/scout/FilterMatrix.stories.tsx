import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FilterMatrix, { FilterState } from './FilterMatrix';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof FilterMatrix> = {
  title: 'Mobile/Scout/FilterMatrix',
  component: FilterMatrix,
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
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: semanticColors.bg.primary }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterMatrix>;

// ============================================================================
// Wrapper for Interactive State
// ============================================================================

const FilterMatrixWrapper = (args: any) => {
  const [activeFilters, setActiveFilters] = useState<FilterState>(args.activeFilters || {});
  return <FilterMatrix {...args} activeFilters={activeFilters} onFiltersChange={setActiveFilters} />;
};

// ============================================================================
// Stories
// ============================================================================

export const CollapsedState: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {},
    defaultExpanded: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default collapsed state - tap to expand. Shows "Filters" label with no active filters.',
      },
    },
  },
};

export const CollapsedWithActiveFilters: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {
      priority: ['urgent', 'high'],
      timeframe: ['today'],
      zones: ['Work'],
    },
    defaultExpanded: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Collapsed state with 3 active filters - shows badge count in micro view.',
      },
    },
  },
};

export const ExpandedBasic: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {},
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic expanded view - shows Priority and Timeframe filters with ChevronButtons.',
      },
    },
  },
};

export const ExpandedAdvanced: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {},
    availableTags: ['urgent', 'meeting', 'email', 'creative', 'admin', 'planning'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Advanced expanded view - all filter dimensions: Priority, Timeframe, Zones, Tags, Energy, and Time Required.',
      },
    },
  },
};

export const ActiveFilters: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {
      priority: ['urgent'],
      timeframe: ['today', 'overdue'],
      energyLevel: { min: 1, max: 3 },
    },
    availableTags: ['urgent', 'meeting', 'email'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '✅ Active filters applied - Urgent priority, Today/Overdue timeframe, Low energy (1-3). Shows "Clear All" button.',
      },
    },
  },
};

export const QuickWinsFilter: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {
      estimatedHours: { min: 0, max: 0.5 },
      energyLevel: { min: 1, max: 3 },
      timeframe: ['today'],
    },
    availableTags: ['quick-win', 'email', 'admin'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story: '⚡ Quick Wins preset - filters for <30min tasks with low energy, due today. Perfect for low-energy moments.',
      },
    },
  },
};

export const DeepWorkFilter: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {
      priority: ['high'],
      estimatedHours: { min: 2, max: 4 },
      energyLevel: { min: 7, max: 10 },
      zones: ['Work'],
    },
    availableTags: ['creative', 'planning', 'writing', 'strategy'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '🎯 Deep Work preset - high priority, 2-4 hours, high energy (7-10), Work zone. For focused creative sessions.',
      },
    },
  },
};

export const ZoneBalanceFilter: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {
      zones: ['Health', 'Relationships'],
      estimatedHours: { min: 0, max: 2 },
    },
    availableTags: ['family', 'exercise', 'social', 'wellness'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story: '⚖️ Zone Balance preset - filters for Health & Relationships zones, <2 hours. Helps maintain life balance.',
      },
    },
  },
};

export const NoFiltersActive: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {},
    availableTags: ['urgent', 'meeting', 'email', 'creative', 'admin', 'planning', 'writing'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'No filters active - shows all filter options available. "Clear All" button hidden.',
      },
    },
  },
};

export const MaxFiltersApplied: Story = {
  render: FilterMatrixWrapper,
  args: {
    activeFilters: {
      priority: ['urgent', 'high'],
      timeframe: ['today', 'overdue'],
      zones: ['Work', 'Health'],
      tags: ['urgent', 'meeting'],
      energyLevel: { min: 4, max: 6 },
      estimatedHours: { min: 0.5, max: 2 },
    },
    availableTags: ['urgent', 'meeting', 'email', 'creative', 'admin', 'planning', 'writing'],
    availableZones: ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '🔥 Maximum filters - all 6 filter dimensions active. Shows "6" badge count. Tests filter combination behavior.',
      },
    },
  },
};
