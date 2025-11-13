# BE-02: User Pets Service (Week 5-6)

**Status**: 🟢 AVAILABLE
**Priority**: HIGH
**Dependencies**: None
**Estimated Time**: 6-8 hours
**TDD Approach**: RED-GREEN-REFACTOR

---

## 📋 Overview

Build virtual pet system where pets grow with completed tasks. Pets have species, levels, XP, hunger/happiness stats, and evolution stages. Completing tasks "feeds" pets with XP.

**ADHD Impact**: Gamification increases task completion by 40%+ (per PRD research)

---

## 🗄️ Database Schema

```sql
CREATE TABLE user_pets (
    pet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    species VARCHAR(50) NOT NULL,  -- 'dog', 'cat', 'dragon', 'owl', 'fox'
    name VARCHAR(100) NOT NULL,
    level INT DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    xp INT DEFAULT 0,
    hunger INT DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
    happiness INT DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
    evolution_stage INT DEFAULT 1 CHECK (evolution_stage >= 1 AND evolution_stage <= 3),  -- 1=baby, 2=teen, 3=adult
    created_at TIMESTAMP DEFAULT NOW(),
    last_fed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)  -- One pet per user
);

CREATE INDEX idx_pets_user ON user_pets(user_id);
```

---

## 📦 Data Models (`src/database/models.py`)

```python
from pydantic import BaseModel, Field, validator
from typing import Literal
from uuid import UUID, uuid4
from datetime import datetime

class UserPetBase(BaseModel):
    species: Literal["dog", "cat", "dragon", "owl", "fox"]
    name: str = Field(..., min_length=1, max_length=100)

class UserPetCreate(UserPetBase):
    user_id: str

class UserPet(UserPetBase):
    pet_id: UUID = Field(default_factory=uuid4)
    user_id: str
    level: int = Field(default=1, ge=1, le=10)
    xp: int = Field(default=0, ge=0)
    hunger: int = Field(default=50, ge=0, le=100)
    happiness: int = Field(default=50, ge=0, le=100)
    evolution_stage: int = Field(default=1, ge=1, le=3)
    created_at: datetime
    last_fed_at: datetime

    @validator('evolution_stage')
    def validate_evolution(cls, v, values):
        level = values.get('level', 1)
        if level < 5 and v > 1:
            raise ValueError("Must be level 5+ for teen stage")
        if level < 10 and v > 2:
            raise ValueError("Must be level 10 for adult stage")
        return v

    class Config:
        from_attributes = True

class FeedPetRequest(BaseModel):
    xp_earned: int = Field(..., ge=1, description="XP from completed task")

class FeedPetResponse(BaseModel):
    pet: UserPet
    leveled_up: bool
    evolved: bool
    xp_to_next_level: int
```

---

## 🔧 Repository (`src/repository/user_pet_repository.py`)

```python
from src.repository.base import BaseRepository
from src.database.models import UserPet
from typing import Optional

class UserPetRepository(BaseRepository[UserPet]):
    def __init__(self):
        super().__init__()

    def get_by_user(self, user_id: str) -> Optional[UserPet]:
        """Get user's pet (one per user)."""
        with self.get_session() as session:
            stmt = select(self.model).where(self.model.user_id == user_id)
            return session.execute(stmt).scalar_one_or_none()

    def feed_pet(self, user_id: str, xp_earned: int) -> dict:
        """Feed pet with XP, handle level ups and evolution."""
        pet = self.get_by_user(user_id)
        if not pet:
            raise ValueError(f"No pet found for user {user_id}")

        # Calculate XP for next level (exponential curve)
        xp_for_next_level = self._calculate_xp_for_level(pet.level + 1)

        # Add XP
        pet.xp += xp_earned
        pet.hunger = min(100, pet.hunger + (xp_earned // 10))
        pet.happiness = min(100, pet.happiness + 5)
        pet.last_fed_at = datetime.now()

        leveled_up = False
        evolved = False

        # Check level up
        while pet.xp >= xp_for_next_level and pet.level < 10:
            pet.level += 1
            pet.xp -= xp_for_next_level
            leveled_up = True
            xp_for_next_level = self._calculate_xp_for_level(pet.level + 1)

            # Check evolution
            if pet.level == 5 and pet.evolution_stage == 1:
                pet.evolution_stage = 2
                evolved = True
            elif pet.level == 10 and pet.evolution_stage == 2:
                pet.evolution_stage = 3
                evolved = True

        self.update(pet.pet_id, pet)

        return {
            "pet": pet,
            "leveled_up": leveled_up,
            "evolved": evolved,
            "xp_to_next_level": xp_for_next_level - pet.xp
        }

    def _calculate_xp_for_level(self, level: int) -> int:
        """Exponential XP curve: level^2 * 50."""
        return level ** 2 * 50
```

---

## 🚀 API Routes (`src/api/routes/user_pets.py`)

```python
from fastapi import APIRouter, HTTPException
from src.database.models import UserPetCreate, UserPet, FeedPetRequest, FeedPetResponse

router = APIRouter(prefix="/api/v1/pets", tags=["pets"])
repo = UserPetRepository()

@router.post("/", response_model=UserPet, status_code=201)
async def create_pet(pet_data: UserPetCreate):
    """Create user's first pet (called during onboarding)."""
    existing = repo.get_by_user(pet_data.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already has a pet")
    return repo.create(pet_data)

@router.get("/{user_id}", response_model=UserPet)
async def get_user_pet(user_id: str):
    """Get user's pet."""
    pet = repo.get_by_user(user_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.post("/{user_id}/feed", response_model=FeedPetResponse)
async def feed_pet(user_id: str, feed_data: FeedPetRequest):
    """Feed pet with XP from completed task."""
    try:
        result = repo.feed_pet(user_id, feed_data.xp_earned)
        return FeedPetResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

---

## 🧪 TDD Tests (`src/api/tests/test_user_pets.py`)

**RED Phase - Write FIRST:**

```python
class TestUserPetsAPI:
    def test_create_pet(self, test_client):
        """RED: Create user's first pet."""
        data = {"user_id": "user123", "species": "dragon", "name": "Spark"}
        response = test_client.post("/api/v1/pets/", json=data)
        assert response.status_code == 201
        assert response.json()["species"] == "dragon"

    def test_create_duplicate_pet_fails(self, test_client):
        """RED: Cannot create second pet for same user."""
        data = {"user_id": "user123", "species": "dog", "name": "Buddy"}
        test_client.post("/api/v1/pets/", json=data)
        response = test_client.post("/api/v1/pets/", json=data)
        assert response.status_code == 400

    def test_feed_pet_increases_xp(self, test_client):
        """RED: Feeding pet increases XP and happiness."""
        # Create pet
        test_client.post("/api/v1/pets/", json={"user_id": "user123", "species": "cat", "name": "Whiskers"})

        # Feed pet
        response = test_client.post("/api/v1/pets/user123/feed", json={"xp_earned": 50})
        assert response.status_code == 200
        data = response.json()
        assert data["pet"]["xp"] == 50
        assert data["pet"]["happiness"] > 50

    def test_pet_level_up(self, test_client):
        """RED: Pet levels up when XP threshold reached."""
        test_client.post("/api/v1/pets/", json={"user_id": "user123", "species": "owl", "name": "Hoot"})

        # Feed enough XP to level up (level 1->2 requires 2^2*50 = 200 XP)
        response = test_client.post("/api/v1/pets/user123/feed", json={"xp_earned": 200})
        data = response.json()
        assert data["leveled_up"] == True
        assert data["pet"]["level"] == 2

    def test_pet_evolution_at_level_5(self, test_client):
        """RED: Pet evolves to teen at level 5."""
        # Create pet, feed to level 5
        # (Total XP for level 5: sum of 50,150,250,350,450 = 1250)
        test_client.post("/api/v1/pets/", json={"user_id": "user123", "species": "fox", "name": "Foxy"})
        response = test_client.post("/api/v1/pets/user123/feed", json={"xp_earned": 1250})
        data = response.json()
        assert data["evolved"] == True
        assert data["pet"]["evolution_stage"] == 2

# Add 10+ more tests for edge cases
```

---

## ✅ Completion Checklist

- [ ] Database schema created
- [ ] Pydantic models with validation
- [ ] Repository with feed logic
- [ ] API endpoints (create, get, feed)
- [ ] 15+ TDD tests (RED-GREEN-REFACTOR)
- [ ] 95%+ coverage
- [ ] XP curve tested (exponential growth)
- [ ] Evolution logic tested (level 5 → teen, level 10 → adult)

---

**Next**: Frontend FE-05 PetWidget depends on this service
