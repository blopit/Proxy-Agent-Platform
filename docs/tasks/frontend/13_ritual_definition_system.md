# FE-13: Ritual Definition System

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 5-6 hours | **Dependencies**: BE-01 (Templates)

## 📋 Overview
UI for creating repeating task rituals (morning routine, shutdown ritual, weekly review).

## API
```typescript
interface RitualEditorProps {
  ritual?: Ritual;
  onSave: (ritual: Ritual) => void;
  onDelete?: () => void;
}

interface Ritual {
  name: string;
  schedule: 'daily' | 'weekly' | 'custom';
  time?: string;  // '08:00'
  dayOfWeek?: number;  // 0-6
  steps: RitualStep[];
}
```

## Stories
1. **Create New**: Empty form
2. **Edit Existing**: Pre-filled morning routine
3. **Step Builder**: Drag-drop step editor
4. **Schedule Picker**: Time and frequency selector

## Design
- Step builder with drag-drop reordering
- Time picker with presets
- Template integration (import from templates)
- Preview: "This will run every Monday at 9am"

## ✅ Criteria
- [ ] 4 Storybook stories
- [ ] Drag-drop step reordering
- [ ] Schedule validation
- [ ] Template import
