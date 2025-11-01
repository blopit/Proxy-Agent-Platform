import type { Meta, StoryObj } from '@storybook/nextjs';
import ProgressBar from './ProgressBar';
import React from 'react';

const meta: Meta<typeof ProgressBar> = {
  title: 'Shared/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Reusable progress bar component with gradient and segmented variants.

**Features**:
- **Gradient variant**: Smooth single-color progress bar (0-100%)
- **Segmented variant**: Multi-segment bar for categorical breakdowns
- Smooth animations with customizable timing
- 3 sizes (sm, md, lg)
- Completion state (green when 100%)
- Accessible with title attributes

**Variants**:
- **gradient** - Single smooth progress bar (blue gradient → green when complete)
- **segmented** - Multiple segments with custom colors and labels

**Sizes**:
- **sm** - 4px height (compact, subtle)
- **md** - 8px height (default, standard)
- **lg** - 12px height (prominent, emphasis)

**Use Cases**:
- Task completion tracking
- File upload progress
- Multi-category breakdowns (digital/human work)
- Level progress indicators
- Loading states`,
      },
    },
  },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress percentage (0-100) for gradient variant',
    },
    variant: {
      control: 'radio',
      options: ['gradient', 'segmented'],
      description: 'Progress bar variant',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Bar height',
    },
    animated: {
      control: 'boolean',
      description: 'Enable smooth animations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

// ============================================================================
// Gradient Variant - Basic Progress
// ============================================================================

export const GradientZero: Story = {
  args: {
    progress: 0,
    variant: 'gradient',
  },
};

export const Gradient25: Story = {
  args: {
    progress: 25,
    variant: 'gradient',
  },
};

export const Gradient50: Story = {
  args: {
    progress: 50,
    variant: 'gradient',
  },
};

export const Gradient75: Story = {
  args: {
    progress: 75,
    variant: 'gradient',
  },
};

export const GradientComplete: Story = {
  args: {
    progress: 100,
    variant: 'gradient',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const SmallSize: Story = {
  args: {
    progress: 60,
    size: 'sm',
  },
};

export const MediumSize: Story = {
  args: {
    progress: 60,
    size: 'md',
  },
};

export const LargeSize: Story = {
  args: {
    progress: 60,
    size: 'lg',
  },
};

// ============================================================================
// Segmented Variant
// ============================================================================

export const SegmentedDigitalHuman: Story = {
  args: {
    variant: 'segmented',
    segments: [
      { percentage: 65, color: '#268bd2', label: 'Digital Work (65%)' },
      { percentage: 35, color: '#6c71c4', label: 'Human Work (35%)' },
    ],
  },
};

export const SegmentedThreeCategories: Story = {
  args: {
    variant: 'segmented',
    segments: [
      { percentage: 40, color: '#268bd2', label: 'Coding (40%)' },
      { percentage: 35, color: '#2aa198', label: 'Design (35%)' },
      { percentage: 25, color: '#6c71c4', label: 'Meetings (25%)' },
    ],
  },
};

export const SegmentedManyCategories: Story = {
  args: {
    variant: 'segmented',
    size: 'lg',
    segments: [
      { percentage: 30, color: '#268bd2', label: 'Development' },
      { percentage: 20, color: '#2aa198', label: 'Design' },
      { percentage: 15, color: '#859900', label: 'Testing' },
      { percentage: 20, color: '#b58900', label: 'Meetings' },
      { percentage: 15, color: '#6c71c4', label: 'Documentation' },
    ],
  },
};

// ============================================================================
// All Sizes Together
// ============================================================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          Small (4px height)
        </div>
        <ProgressBar progress={60} size="sm" />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          Medium (8px height)
        </div>
        <ProgressBar progress={60} size="md" />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          Large (12px height)
        </div>
        <ProgressBar progress={60} size="lg" />
      </div>
    </div>
  ),
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const TaskCompletion: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);
    const [tasks] = React.useState([
      { id: 1, name: 'Design wireframes', done: false },
      { id: 2, name: 'Setup project', done: false },
      { id: 3, name: 'Implement components', done: false },
      { id: 4, name: 'Write tests', done: false },
      { id: 5, name: 'Deploy to production', done: false },
    ]);

    React.useEffect(() => {
      const completed = tasks.filter(t => t.done).length;
      setProgress((completed / tasks.length) * 100);
    }, [tasks]);

    return (
      <div style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Project Progress
          </h4>
          <span style={{ fontSize: '14px', opacity: 0.7 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar progress={progress} size="md" />
        <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.6 }}>
          {tasks.filter(t => t.done).length} of {tasks.length} tasks completed
        </div>
      </div>
    );
  },
};

export const FileUpload: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);
    const [uploading, setUploading] = React.useState(false);

    const startUpload = () => {
      setProgress(0);
      setUploading(true);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setUploading(false), 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    };

    return (
      <div style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </h4>
          <span style={{ fontSize: '14px', opacity: 0.7 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar progress={progress} size="md" />
        {!uploading && progress < 100 && (
          <button
            onClick={startUpload}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Start Upload
          </button>
        )}
        {progress === 100 && (
          <div style={{ marginTop: '12px', color: '#859900', fontSize: '14px', fontWeight: '600' }}>
            ✓ Upload complete!
          </div>
        )}
      </div>
    );
  },
};

export const LevelProgress: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #268bd2, #2aa198)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '16px',
          }}>
            7
          </div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Level 7
          </h4>
        </div>
        <span style={{ fontSize: '14px', opacity: 0.7 }}>
          720 / 1000 XP
        </span>
      </div>
      <ProgressBar progress={72} size="lg" />
      <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6 }}>
        280 XP until Level 8
      </div>
    </div>
  ),
};

export const WorkBreakdown: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <h4 style={{ margin: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
        This Week's Work Breakdown
      </h4>
      <ProgressBar
        variant="segmented"
        size="lg"
        segments={[
          { percentage: 65, color: '#268bd2', label: 'Digital Work (65%)' },
          { percentage: 35, color: '#6c71c4', label: 'Human Work (35%)' },
        ]}
      />
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#268bd2' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Digital Work</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>26 hours (65%)</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#6c71c4' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Human Work</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>14 hours (35%)</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const MultiTaskProgress: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Design System</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>100%</span>
        </div>
        <ProgressBar progress={100} size="sm" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Component Library</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>85%</span>
        </div>
        <ProgressBar progress={85} size="sm" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Documentation</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>60%</span>
        </div>
        <ProgressBar progress={60} size="sm" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Testing</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>40%</span>
        </div>
        <ProgressBar progress={40} size="sm" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Deployment</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>15%</span>
        </div>
        <ProgressBar progress={15} size="sm" />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive Animation
// ============================================================================

export const AnimatedProgress: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);

    const simulate = () => {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    };

    return (
      <div style={{ maxWidth: '400px' }}>
        <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
          Animated Progress
        </h4>
        <ProgressBar progress={progress} size="md" />
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={simulate}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Simulate Progress
          </button>
          <span style={{ fontSize: '14px', opacity: 0.7 }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  },
};

export const NoAnimation: Story = {
  args: {
    progress: 60,
    animated: false,
  },
};
