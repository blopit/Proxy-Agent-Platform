import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProductivityChart } from './ProductivityChart';

const meta: Meta<typeof ProductivityChart> = {
  title: 'Dashboard/ProductivityChart',
  component: ProductivityChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Weekly productivity visualization with focus hours, tasks completed, and energy levels.

**Features**:
- Multi-metric area chart using Recharts
- 3 tracked metrics: Focus hours, Tasks completed, Energy levels
- Gradient fills for visual appeal
- Interactive tooltips
- Responsive container (adapts to parent width)
- Glass morphism card design
- Smooth animations with Framer Motion
- Legend with color coding

**Metrics**:
- **Focus** (blue) - Hours of deep work
- **Tasks** (green) - Number of tasks completed
- **Energy** (purple) - Self-reported energy level (1-10)

**Use Cases**:
- Dashboard overview
- Weekly progress tracking
- Performance analytics
- Trend visualization`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductivityChart>;

// ============================================================================
// Default
// ============================================================================

export const Default: Story = {};

export const FullWidth: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Chart is responsive and fills the available width.',
      },
    },
  },
};
