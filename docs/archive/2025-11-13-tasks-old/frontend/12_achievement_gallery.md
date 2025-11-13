# FE-12: Achievement Gallery

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 4-5 hours | **Dependencies**: BE-04 (Gamification)

## 📋 Overview
Grid gallery displaying unlocked badges, locked silhouettes, and sharing options.

## API
```typescript
interface AchievementGalleryProps {
  userId: string;
  filterType?: 'all' | 'unlocked' | 'locked';
  onBadgeClick?: (badge: Badge) => void;
  onShare?: (badge: Badge) => void;
}
```

## Stories
1. **All Badges**: Mix of unlocked and locked
2. **Unlocked Only**: Celebration mode
3. **With Progress**: Badges show progress bars
4. **Share Modal**: Social sharing UI

## Design
- Grid layout (3 cols mobile, 5 desktop)
- Locked badges: Grayscale silhouette
- Unlocked: Full color + shine animation
- Click: Modal with badge details + share

## ✅ Criteria
- [ ] 4 Storybook stories
- [ ] Masonry grid layout
- [ ] Share integration
- [ ] Progress indicators
