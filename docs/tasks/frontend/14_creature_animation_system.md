# FE-14: Creature Animation System

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 6-7 hours | **Dependencies**: BE-11 (Leveling), BE-12 (AI Generation)

## 📋 Overview
Animated creature sprites with idle, eating, playing, and evolution animations.

## API
```typescript
interface CreatureAnimationProps {
  petId: string;
  species: string;
  evolutionStage: 1 | 2 | 3;
  currentAnimation: 'idle' | 'eating' | 'playing' | 'sleeping' | 'evolving';
  mood: 'happy' | 'hungry' | 'playful' | 'sleepy';
  size?: 'small' | 'medium' | 'large';
}
```

## Stories
1. **Idle Animation**: Gentle bobbing
2. **Eating**: Food appears, creature eats
3. **Playing**: Jump/bounce animation
4. **Evolution**: Sparkle effect + transform
5. **All Moods**: Showcase each mood

## Design
- Lottie animations or sprite sheets
- OpenMoji-based creatures
- Smooth transitions between states
- Particle effects for evolution
- Responsive sizing

## ✅ Criteria
- [ ] 5 Storybook stories
- [ ] Smooth frame animations
- [ ] Evolution particle effects
- [ ] Works on all devices
