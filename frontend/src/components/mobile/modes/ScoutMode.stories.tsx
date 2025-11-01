import type { Meta, StoryObj } from '@storybook/nextjs';
import ScoutMode from './ScoutMode';
import TaskInspector from '../scout/TaskInspector';
import SmartRecommendations from '../scout/SmartRecommendations';
import FilterMatrix from '../scout/FilterMatrix';
import DecisionHelper from '../scout/DecisionHelper';
import WorkspaceOverview from '../scout/WorkspaceOverview';
import ZoneBalanceWidget from '../scout/ZoneBalanceWidget';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof ScoutMode> = {
  title: 'Mobile/Modes/ScoutMode',
  component: ScoutMode,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**Scout Mode** - Discover & Organize tasks with category-based browsing

**Features**:
- **6 Smart Categories**: Main Focus, Urgent Today, Quick Wins, This Week, Can Delegate, Someday/Maybe
- **15% Mystery Task Bonus**: Unpredictable dopamine rewards
- **Netflix-style Scrolling**: Horizontal category rows
- **Dual Sub-modes**: Discover (browse) and Organize (inbox processing)
- **Filters**: All, Digital, Human, Urgent
- **Scout Enhancement Components**: Task Inspector, Smart Recommendations, Filter Matrix, Decision Helper, Workspace Overview, Zone Balance

**ADHD Optimizations**:
- Category-based organization reduces overwhelm
- Mystery tasks create dopamine uncertainty
- Quick Wins category for low-energy wins
- Visual categorization for pattern recognition

**Sub-Components** (see stories below):
- TaskInspector - Detailed task view with context
- SmartRecommendations - AI-powered task suggestions
- FilterMatrix - Advanced task filtering
- DecisionHelper - Compare tasks side-by-side
- WorkspaceOverview - Zone and energy overview
- ZoneBalanceWidget - Life balance tracking`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100%', backgroundColor: semanticColors.bg.primary }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScoutMode>;

// ============================================================================
// Full Scout Mode Stories
// ============================================================================

export const Default: Story = {
  args: {
    onTaskTap: (task) => console.log('Task tapped:', task),
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default Scout Mode with all categories and Netflix-style scrolling',
      },
    },
  },
};

export const DiscoverMode: Story = {
  args: {
    onTaskTap: (task) => console.log('Task tapped:', task),
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Discover mode - browse tasks by category with Netflix-style scrolling',
      },
    },
  },
};

export const WithMysteryTask: Story = {
  args: {
    onTaskTap: (task) => console.log('Mystery task tapped:', task),
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: '15% chance to show mystery task - unpredictable dopamine reward for ADHD users',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    onTaskTap: (task) => console.log('Task tapped:', task),
    refreshTrigger: Date.now(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching tasks from API',
      },
    },
  },
};

// ============================================================================
// Scout Enhancement Components - Task Inspector
// ============================================================================

export const TaskInspectorView: StoryObj<typeof TaskInspector> = {
  render: () => (
    <TaskInspector
      task={{
        task_id: '1',
        title: 'Review project proposal',
        description: 'Review the Q4 marketing proposal and provide feedback on budget allocation and timeline.',
        status: 'pending',
        priority: 'high',
        estimated_hours: 1.5,
        tags: ['review', 'marketing', 'urgent'],
        is_digital: true,
        created_at: '2025-10-20T10:00:00Z',
        due_date: '2025-10-28T17:00:00Z',
        zone: 'Work',
      }}
      relatedFiles={[
        {
          id: 'f1',
          name: 'Q4_Marketing_Proposal.pdf',
          type: 'pdf' as const,
          url: 'https://example.com/proposal.pdf',
          lastModified: '2 hours ago',
        },
        {
          id: 'f2',
          name: 'Budget_Analysis.xlsx',
          type: 'doc' as const,
          lastModified: '1 day ago',
        },
      ]}
      relatedContacts={[
        {
          id: 'c1',
          name: 'Sarah Chen',
          role: 'assigned_by',
          avatar: '👩',
        },
        {
          id: 'c2',
          name: 'Mike Rodriguez',
          role: 'can_help',
          avatar: '👨',
        },
      ]}
      dependencies={[
        {
          task_id: 'd1',
          title: 'Gather Q3 performance data',
          status: 'completed',
        },
      ]}
      suggestedTime="2:00 PM today"
      onHunt={(task) => console.log('Hunt:', task)}
      onClose={() => console.log('Close')}
      onPin={() => console.log('Pin')}
      onDefer={() => console.log('Defer')}
      onEdit={() => console.log('Edit')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `**Task Inspector** - Deep dive into task details with context, files, contacts, and dependencies.

Shows:
- Task metadata (priority, estimated time, due date, tags)
- Related files (PDFs, docs, links)
- Related contacts (assigned by, can help, stakeholders)
- Dependencies (blocking/blocked tasks)
- AI-suggested optimal time
- Quick actions (Hunt, Pin, Defer, Edit)`,
      },
    },
  },
};

// ============================================================================
// Scout Enhancement Components - Smart Recommendations
// ============================================================================

export const SmartRecommendationsPanel: StoryObj<typeof SmartRecommendations> = {
  render: () => (
    <SmartRecommendations
      recommendations={[
        {
          task: {
            task_id: '1',
            title: 'Reply to client email about project status',
            description: 'Quick status update',
            status: 'pending',
            priority: 'high',
            estimated_hours: 0.08,
            tags: ['email', 'communication'],
            zone: 'Work',
          },
          reason: 'Your energy matches this task perfectly, and it only takes 5 minutes',
          badges: ['quick-win', 'high-impact'],
          confidence: 92,
        },
        {
          task: {
            task_id: '2',
            title: 'Review marketing proposal for Q4',
            description: 'Detailed review needed',
            status: 'pending',
            priority: 'high',
            estimated_hours: 1.5,
            tags: ['review', 'marketing'],
            zone: 'Work',
          },
          reason: 'Due today at 5pm - high priority and blocking team progress',
          badges: ['urgent', 'high-impact'],
          confidence: 88,
        },
        {
          task: {
            task_id: '3',
            title: 'Call mom for birthday',
            description: 'Wish happy birthday',
            status: 'pending',
            priority: 'high',
            estimated_hours: 0.5,
            tags: ['personal', 'family'],
            zone: 'Relationships',
          },
          reason: "You haven't worked on Relationships zone in 6 days - maintain life balance",
          badges: ['zone-neglected', 'quick-win'],
          confidence: 75,
        },
      ]}
      onHunt={(task) => console.log('Hunt:', task.title)}
      onViewTask={(task) => console.log('View:', task.title)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `**Smart Recommendations** - AI-powered task suggestions based on context, energy, time, and patterns.

Features:
- Top 3 recommended tasks ranked by confidence score
- Contextual reasoning for each recommendation
- Badge indicators (quick-win, urgent, high-impact, zone-neglected)
- Confidence percentage (75-92%)
- Quick Hunt or View actions`,
      },
    },
  },
};

// ============================================================================
// Scout Enhancement Components - Filter Matrix
// ============================================================================

export const FilterMatrixView: StoryObj<typeof FilterMatrix> = {
  render: () => (
    <FilterMatrix
      filterState={{
        zones: ['Work'],
        energyRange: [40, 100],
        timeRange: [0, 2],
        tags: ['urgent', 'review'],
        priorities: ['high'],
        showDigitalOnly: true,
      }}
      onFilterChange={(filters) => console.log('Filters:', filters)}
      onApply={() => console.log('Apply filters')}
      onClear={() => console.log('Clear filters')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `**Filter Matrix** - Advanced multi-dimensional task filtering interface.

Filter Options:
- **Zones**: Work, Home, Errands, Relationships, Self-care
- **Energy Range**: 0-100% current energy level
- **Time Range**: 0-8+ hours available
- **Tags**: Project-specific tags
- **Priorities**: High, Medium, Low
- **Digital Only**: Filter for digital/online tasks only

ADHD Benefits: Reduce cognitive load by narrowing focus to exactly what's actionable right now.`,
      },
    },
  },
};

// ============================================================================
// Scout Enhancement Components - Decision Helper
// ============================================================================

export const DecisionHelperView: StoryObj<typeof DecisionHelper> = {
  render: () => (
    <DecisionHelper
      taskA={{
        task_id: '1',
        title: 'Review marketing proposal for Q4',
        description: 'Detailed review needed',
        status: 'pending',
        priority: 'high',
        estimated_hours: 1.5,
        tags: ['review', 'marketing'],
        zone: 'Work',
        due_date: '2025-10-28T17:00:00Z',
      }}
      taskB={{
        task_id: '2',
        title: 'Reply to client email',
        description: 'Quick status update',
        status: 'pending',
        priority: 'high',
        estimated_hours: 0.08,
        tags: ['email', 'communication'],
        zone: 'Work',
        due_date: '2025-10-28T12:00:00Z',
      }}
      onSelectTask={(task) => console.log('Selected:', task.title)}
      onClose={() => console.log('Close')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `**Decision Helper** - Side-by-side task comparison to resolve decision paralysis.

Compares:
- Priority (High, Medium, Low)
- Estimated time (with visual bars)
- Due date proximity
- Zone (life area)
- Tags
- Description

ADHD Benefit: Visual comparison reduces executive function burden when choosing between tasks.`,
      },
    },
  },
};

// ============================================================================
// Scout Enhancement Components - Workspace Overview
// ============================================================================

export const WorkspaceOverviewPanel: StoryObj<typeof WorkspaceOverview> = {
  render: () => (
    <WorkspaceOverview
      stats={{
        totalTasks: 42,
        completedToday: 8,
        inProgress: 3,
        highPriority: 5,
        dueToday: 7,
        energyLevel: 72,
        focusMinutes: 145,
        streakDays: 12,
      }}
      zones={[
        { name: 'Work', taskCount: 18, completionRate: 65, color: '#268bd2' },
        { name: 'Home', taskCount: 12, completionRate: 40, color: '#859900' },
        { name: 'Relationships', taskCount: 4, completionRate: 25, color: '#d33682' },
        { name: 'Self-care', taskCount: 8, completionRate: 50, color: '#cb4b16' },
      ]}
      recentActivity={[
        { id: '1', type: 'completed', title: 'Replied to client email', timestamp: '10 min ago' },
        { id: '2', type: 'started', title: 'Review code for PR #234', timestamp: '25 min ago' },
        { id: '3', type: 'completed', title: 'Morning standup', timestamp: '1 hour ago' },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `**Workspace Overview** - High-level dashboard showing productivity metrics, zone distribution, and recent activity.

Displays:
- Total/completed/in-progress/high-priority task counts
- Current energy level (0-100%)
- Focus time today (minutes)
- Current streak (days)
- Zone breakdown (tasks per zone, completion rates)
- Recent activity timeline`,
      },
    },
  },
};

// ============================================================================
// Scout Enhancement Components - Zone Balance Widget
// ============================================================================

export const ZoneBalanceView: StoryObj<typeof ZoneBalanceWidget> = {
  render: () => (
    <ZoneBalanceWidget
      zones={[
        {
          name: 'Work',
          current: 18,
          ideal: 15,
          color: '#268bd2',
          lastWorkedOn: '5 min ago',
        },
        {
          name: 'Home',
          current: 12,
          ideal: 10,
          color: '#859900',
          lastWorkedOn: '2 hours ago',
        },
        {
          name: 'Relationships',
          current: 4,
          ideal: 8,
          color: '#d33682',
          lastWorkedOn: '6 days ago',
          status: 'neglected',
        },
        {
          name: 'Self-care',
          current: 8,
          ideal: 10,
          color: '#cb4b16',
          lastWorkedOn: '1 day ago',
        },
        {
          name: 'Errands',
          current: 6,
          ideal: 5,
          color: '#2aa198',
          lastWorkedOn: '12 hours ago',
        },
      ]}
      onZoneClick={(zone) => console.log('View zone:', zone.name)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `**Zone Balance Widget** - Visual representation of work-life balance across different life areas.

Features:
- Current vs Ideal task distribution
- Color-coded zones
- Status indicators (balanced, over-loaded, neglected)
- Last worked timestamp
- Visual bars showing balance

ADHD Benefit: Prevent hyperfocus on one area at the expense of others (work vs relationships vs self-care).`,
      },
    },
  },
};
