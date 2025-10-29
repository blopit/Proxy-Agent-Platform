# BE-11: Creature Leveling Service

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 5-6 hours
**Dependencies**: BE-02 (User Pets)
**Agent Type**: backend-tdd

## 📋 Overview
Implement pet evolution, leveling, and care mechanics (feeding, happiness).

## 🗄️ Database Schema
```sql
ALTER TABLE user_pets ADD COLUMN last_interaction_at TIMESTAMP DEFAULT NOW();
ALTER TABLE user_pets ADD COLUMN needs_attention BOOLEAN DEFAULT false;

CREATE TABLE pet_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES user_pets(pet_id),
    interaction_type VARCHAR(50) NOT NULL,  -- 'feed', 'play', 'evolve'
    xp_gained INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE evolution_thresholds (
    species VARCHAR(50) PRIMARY KEY,
    stage_1_xp INT DEFAULT 0,
    stage_2_xp INT DEFAULT 100,
    stage_3_xp INT DEFAULT 500,
    max_level INT DEFAULT 50
);
```

## 🏗️ Models
```python
class PetInteraction(BaseModel):
    pet_id: UUID
    interaction_type: Literal["feed", "play", "pet"]

class PetStatus(BaseModel):
    pet_id: UUID
    species: str
    level: int
    xp: int
    xp_to_next_level: int
    hunger: int  # 0-100
    happiness: int  # 0-100
    evolution_stage: int
    can_evolve: bool
    needs_attention: bool
```

## 🌐 API Routes
```python
@router.post("/pets/{pet_id}/feed")
async def feed_pet(pet_id: UUID):
    """Feed pet to restore hunger, gain happiness."""
    pass

@router.post("/pets/{pet_id}/play")
async def play_with_pet(pet_id: UUID):
    """Play to gain happiness and XP."""
    pass

@router.post("/pets/{pet_id}/evolve")
async def evolve_pet(pet_id: UUID):
    """Evolve pet to next stage."""
    pass

@router.get("/pets/{pet_id}/status")
async def get_pet_status(pet_id: UUID) -> PetStatus:
    """Get current pet status."""
    pass
```

## 🧪 Tests
- Feeding restores hunger
- Playing increases happiness and XP
- Evolution unlocks at correct XP threshold
- Pets degrade over time without interaction

## ✅ Acceptance Criteria
- [ ] Pets level up based on XP
- [ ] Evolution stages unlock at thresholds
- [ ] Hunger and happiness decrease over time
- [ ] Interactions restore stats and grant XP
- [ ] 95%+ test coverage
