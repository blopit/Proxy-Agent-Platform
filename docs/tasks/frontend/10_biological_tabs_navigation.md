# FE-10: Biological Tabs Navigation

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 3-4 hours
**Dependencies**: None (standalone)
**Agent Type**: frontend-storybook

## 📋 Overview
Bottom tab navigation for 5 biological modes with emoji icons and active state animations.

## 🎨 Component API
```typescript
interface BiologicalTabsProps {
  activeMode: BiologicalMode;
  onModeChange: (mode: BiologicalMode) => void;
  showLabels?: boolean;
  compactMode?: boolean;
}

type BiologicalMode = 'capture' | 'scout' | 'hunter' | 'mender' | 'mapper';

interface TabConfig {
  mode: BiologicalMode;
  icon: string;  // Emoji
  label: string;
  color: string;
}
```

## 📖 Storybook Stories
1. **Default**: All 5 modes, Capture active
2. **Compact**: Icons only, no labels
3. **With Labels**: Full labels shown
4. **Animation Showcase**: Switch through all modes
5. **Mobile Optimized**: Touch-friendly spacing

## 🎨 Design
```typescript
const tabs: TabConfig[] = [
  { mode: 'capture', icon: '📥', label: 'Capture', color: colors.capture },
  { mode: 'scout', icon: '🔍', label: 'Scout', color: colors.scout },
  { mode: 'hunter', icon: '🎯', label: 'Hunter', color: colors.hunter },
  { mode: 'mender', icon: '🔧', label: 'Mender', color: colors.mender },
  { mode: 'mapper', icon: '🗺️', label: 'Mapper', color: colors.mapper }
];
```

- Active tab: Larger icon, color accent
- Inactive tabs: Grayscale
- Smooth tab indicator slide
- Sticky bottom position
- Haptic feedback on switch

## ✅ Acceptance Criteria
- [ ] 5 Storybook stories
- [ ] Smooth tab transitions
- [ ] Active state clearly visible
- [ ] Works on all screen sizes
- [ ] Keyboard accessible (Tab/Enter)
