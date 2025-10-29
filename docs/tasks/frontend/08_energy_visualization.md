# FE-08: Energy Visualization Graph

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 4-5 hours
**Dependencies**: BE-06 (Analytics)
**Agent Type**: frontend-storybook

## 📋 Overview
Interactive energy level visualization showing historical patterns and predictions for Mapper mode.

## 🎨 Component API
```typescript
interface EnergyVisualizationProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d';
  showPredictions?: boolean;
  onTimeSlotClick?: (timestamp: Date, energy: EnergyLevel) => void;
}

interface EnergyDataPoint {
  timestamp: Date;
  energy: 'low' | 'medium' | 'high';
  tasksCompleted: number;
  isPrediction?: boolean;
}
```

## 📖 Storybook Stories

### 1. Default (7-day view)
```typescript
export const Default: Story = {
  args: {
    userId: 'user-123',
    timeRange: '7d',
    showPredictions: false
  }
};
```

### 2. With Predictions
```typescript
export const WithPredictions: Story = {
  args: {
    userId: 'user-123',
    timeRange: '7d',
    showPredictions: true
  }
};
```

### 3. Monthly View
```typescript
export const MonthlyView: Story = {
  args: {
    userId: 'user-123',
    timeRange: '30d'
  }
};
```

### 4. Interactive (clickable time slots)
```typescript
export const Interactive: Story = {
  args: {
    userId: 'user-123',
    timeRange: '7d',
    onTimeSlotClick: (timestamp, energy) => {
      console.log(`Clicked ${timestamp} with ${energy} energy`);
    }
  }
};
```

## 🎨 Design System Usage
```typescript
// Colors from design system
const energyColors = {
  low: colors.energy.low,      // Soft blue
  medium: colors.energy.medium, // Warm yellow
  high: colors.energy.high      // Vibrant green
};

// Chart styling
const chartConfig = {
  height: spacing.xl * 12,
  barWidth: spacing.md,
  gap: spacing.xs,
  borderRadius: borderRadius.sm
};
```

## 🔧 Implementation Notes
- Use Recharts for visualization
- Smooth transitions between time ranges
- Hover tooltips show exact data
- Mobile: Horizontal scroll for long timelines
- Accessibility: Screen reader describes trends

## ✅ Acceptance Criteria
- [ ] All 4 Storybook stories work
- [ ] Fetches data from analytics API
- [ ] Responsive design (mobile/desktop)
- [ ] Smooth animations
- [ ] Accessible (ARIA labels)
- [ ] TypeScript strict mode passes
