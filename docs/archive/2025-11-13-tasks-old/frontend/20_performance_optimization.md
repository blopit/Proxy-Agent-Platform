# FE-20: Performance Optimization

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 6-7 hours | **Dependencies**: All frontend components

## 📋 Overview
Optimize bundle size, rendering performance, and Core Web Vitals for production deployment.

## Optimization Areas

### 1. Code Splitting
```typescript
// Route-based splitting
const CaptureMode = lazy(() => import('./modes/CaptureMode'));
const ScoutMode = lazy(() => import('./modes/ScoutMode'));
const HunterMode = lazy(() => import('./modes/HunterMode'));

// Component-based splitting
const CreatureGallery = lazy(() => import('./CreatureGallery'));
const Analytics = lazy(() => import('./Analytics'));
```

### 2. Bundle Analysis
```bash
# Analyze bundle
pnpm build && pnpm analyze

# Target metrics
- Total bundle: < 300kb gzipped
- Initial load: < 150kb
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
```

### 3. Image Optimization
```typescript
// Next.js Image component
<Image
  src="/creatures/dragon.png"
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
  alt="Dragon creature"
/>

// OpenMoji SVG optimization
import { optimizeSvg } from '@/lib/svg-optimizer';
```

### 4. Memo & useCallback
```typescript
// Memoize expensive calculations
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.priority - b.priority);
}, [tasks]);

// Memoize callbacks
const handleComplete = useCallback((taskId: string) => {
  completeTask(taskId);
}, [completeTask]);

// Memoize components
const TaskCard = memo(({ task }: TaskCardProps) => {
  return <div>{task.title}</div>;
});
```

### 5. Virtual Scrolling
```typescript
// For long lists (100+ items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <TaskCard task={tasks[index]} style={style} />
  )}
</FixedSizeList>
```

### 6. API Request Optimization
```typescript
// Debounce search
const debouncedSearch = useDebouncedCallback(
  (query) => fetchTasks(query),
  300
);

// SWR for caching
const { data, error } = useSWR('/api/tasks', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 5000
});

// Prefetch on hover
const handleMouseEnter = () => {
  prefetch('/api/task-details');
};
```

### 7. CSS Optimization
```typescript
// Critical CSS inline
// Tailwind purge config
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { /* ... */ }
};

// CSS-in-JS performance
const StyledButton = styled.button`
  ${({ theme }) => theme.button}
  /* Static styles */
`;
```

## Performance Tests

### 1. Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

### 2. Bundle Size Tracking
```json
// .size-limit.json
[
  {
    "path": "dist/index.js",
    "limit": "300 KB"
  },
  {
    "path": "dist/vendor.js",
    "limit": "150 KB"
  }
]
```

### 3. Performance Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Optimization Checklist

### Build
- [ ] Code splitting implemented
- [ ] Tree shaking enabled
- [ ] Dead code eliminated
- [ ] Bundle size < 300kb gzipped

### Runtime
- [ ] Memoization where needed
- [ ] Virtual scrolling for long lists
- [ ] Debounced search/input
- [ ] SWR caching configured

### Assets
- [ ] Images optimized (WebP)
- [ ] SVGs minified
- [ ] Fonts subset
- [ ] Lazy loading enabled

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Lighthouse score > 90

## Testing Script
```bash
#!/bin/bash
# Run performance tests

echo "Building production bundle..."
pnpm build

echo "Analyzing bundle size..."
pnpm analyze

echo "Running Lighthouse..."
lighthouse https://localhost:3000 --view

echo "Checking Web Vitals..."
pnpm test:vitals
```

## ✅ Acceptance Criteria
- [ ] Bundle size reduced by 30%+
- [ ] LCP < 2.5s on 3G
- [ ] Lighthouse score > 90
- [ ] No layout shifts (CLS < 0.1)
- [ ] Virtual scrolling for lists >100 items
- [ ] All images optimized
- [ ] Code splitting on routes
