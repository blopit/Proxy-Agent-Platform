# FE-16: Temporal Visualization

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 5-6 hours | **Dependencies**: BE-06 (Analytics), BE-13 (ML)

## 📋 Overview
Time-based heatmap showing best times for tasks based on historical completion patterns.

## API
```typescript
interface TemporalVisualizationProps {
  userId: string;
  metric: 'completions' | 'energy' | 'focus_time';
  granularity: 'hour' | 'day' | 'week';
}

interface TimeSlot {
  timestamp: Date;
  value: number;  // 0-100
  label: string;
  tasks?: Task[];  // Completed during this slot
}
```

## Stories
1. **Hourly Heatmap**: 24-hour view
2. **Weekly Pattern**: 7 days × 24 hours
3. **Monthly Overview**: 30 days calendar
4. **Interactive**: Click to see task details

## Design
- GitHub-style contribution graph
- Color intensity = activity level
- Hover: Tooltip with details
- Click: Modal with task breakdown
- Mobile: Scroll horizontally

## ✅ Criteria
- [ ] 4 Storybook stories
- [ ] Heatmap renders correctly
- [ ] Interactive tooltips
- [ ] Mobile scrollable
