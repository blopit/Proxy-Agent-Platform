# FE-05: PetWidget & PetSelectionModal (Week 5-6)

**Status**: 🟢 AVAILABLE
**Priority**: HIGH (gamification core)
**Dependencies**: BE-02 User Pets Service (backend)
**Estimated Time**: 6-8 hours
**Approach**: Storybook-first

---

## 📋 Overview

Virtual pet system UI: pet selection on first launch, pet widget in Mapper dashboard, feeding animations post-task.

---

## 🎨 Components to Build

### 1. PetWidget.tsx

```typescript
interface PetWidgetProps {
  pet: UserPet;
  compact?: boolean;  // Small version for dashboard
  onInteract?: () => void;
}

interface UserPet {
  pet_id: string;
  species: 'dog' | 'cat' | 'dragon' | 'owl' | 'fox';
  name: string;
  level: number;
  xp: number;
  hunger: number;  // 0-100
  happiness: number;  // 0-100
  evolution_stage: number;  // 1=baby, 2=teen, 3=adult
}
```

### 2. PetSelectionModal.tsx

```typescript
interface PetSelectionModalProps {
  onSelectPet: (species: string, name: string) => void;
}

// 5 species: dog, cat, dragon, owl, fox
// Name input field
// "Choose Your Companion" button
```

### 3. FeedPetScreen.tsx (Week 8 with Celebration)

```typescript
interface FeedPetScreenProps {
  pet: UserPet;
  xpEarned: number;
  onComplete: () => void;
}

// Animation: pet eats XP
// Status bars update (hunger/happiness)
// Level up notification (if applicable)
// Evolution animation (if applicable)
```

---

## 🎭 Storybook Stories

```typescript
// PetWidget.stories.tsx
export const BabyDog: Story = {
  args: {
    pet: {
      species: 'dog',
      name: 'Buddy',
      level: 2,
      xp: 80,
      hunger: 70,
      happiness: 85,
      evolution_stage: 1,
    },
  },
};

export const TeenDragon: Story = {
  args: {
    pet: { species: 'dragon', name: 'Spark', level: 6, evolution_stage: 2 },
  },
};

export const AdultOwl: Story = {
  args: {
    pet: { species: 'owl', name: 'Hoot', level: 10, evolution_stage: 3 },
  },
};

// PetSelectionModal.stories.tsx
export const FirstTimeSetup: Story = {};
```

---

## 🎨 Pet Sprites

**Create 5 species × 3 stages = 15 SVG sprites**

```
frontend/public/pets/
  dog/baby.svg, dog/teen.svg, dog/adult.svg
  cat/baby.svg, cat/teen.svg, cat/adult.svg
  dragon/baby.svg, dragon/teen.svg, dragon/adult.svg
  owl/baby.svg, owl/teen.svg, owl/adult.svg
  fox/baby.svg, fox/teen.svg, fox/adult.svg
```

Use simple SVG illustrations or OpenMoji style (consistent with design system)

---

## 📡 API Integration

```typescript
// Create pet (first time)
POST /api/v1/pets/
{ user_id, species, name }

// Get user's pet
GET /api/v1/pets/{user_id}

// Feed pet
POST /api/v1/pets/{user_id}/feed
{ xp_earned: number }
// Returns: { pet, leveled_up, evolved, xp_to_next_level }
```

---

## ✅ Acceptance Criteria

- [ ] Pet selection modal for first-time users
- [ ] Pet widget displays in Mapper dashboard
- [ ] Status bars (hunger, happiness, XP progress)
- [ ] Tap to interact animation
- [ ] Feeding animation post-task
- [ ] Level up notification
- [ ] Evolution animation (baby→teen→adult)
- [ ] 5+ Storybook stories
- [ ] All 5 species implemented

---

**Depends on**: BE-02 backend service
