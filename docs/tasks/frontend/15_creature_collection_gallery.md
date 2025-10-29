# FE-15: Creature Collection Gallery

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 4 hours | **Dependencies**: FE-14 (Animations), BE-02 (Pets)

## 📋 Overview
Pokédex-style gallery showing all available creatures, owned vs unowned, with selection UI.

## API
```typescript
interface CreatureGalleryProps {
  userId: string;
  mode: 'selection' | 'collection';  // Choose pet vs view collection
  onSelect?: (species: string) => void;
  showEvolutions?: boolean;
}

interface CreatureEntry {
  species: string;
  name: string;
  isOwned: boolean;
  evolutionStages: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}
```

## Stories
1. **Selection Mode**: Choose your first pet
2. **Collection View**: See all owned/unowned
3. **With Evolutions**: Show 3 stages per species
4. **Rarity Showcase**: Different border colors by rarity

## Design
- Card grid (2 cols mobile, 4 desktop)
- Owned: Full color, animated preview
- Unowned: Silhouette with "???"
- Click: Expands to show evolutions
- Rarity: Color-coded borders

## ✅ Criteria
- [ ] 4 Storybook stories
- [ ] Grid layout responsive
- [ ] Animated previews
- [ ] Rarity system visual
