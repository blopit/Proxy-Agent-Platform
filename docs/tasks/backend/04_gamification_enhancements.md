# BE-04: Gamification Enhancements (Week 7)

**Status**: 🟢 AVAILABLE
**Priority**: MEDIUM
**Dependencies**: None
**Estimated Time**: 5 hours
**TDD**: RED-GREEN-REFACTOR

---

## 📋 Overview

Enhance gamification system with per-step XP, badge unlocking, and theme management. Builds on existing XP/achievement infrastructure.

---

## 🗄️ Schema

```sql
-- Track user badge unlocks
CREATE TABLE user_badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    badge_type VARCHAR(100) NOT NULL,  -- '3-day-streak', '10-tasks', etc.
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Track theme unlocks
CREATE TABLE user_themes (
    user_id VARCHAR(255) PRIMARY KEY,
    active_theme VARCHAR(50) DEFAULT 'solarized',
    unlocked_themes TEXT[] DEFAULT ARRAY['solarized'],  -- Array of theme names
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add XP tracking to micro_steps
ALTER TABLE micro_steps ADD COLUMN xp_earned INT DEFAULT 0;
ALTER TABLE micro_steps ADD COLUMN completed_at TIMESTAMP;
```

---

## 📦 Models

```python
class Badge(BaseModel):
    badge_type: str  # '3-day-streak', '7-day-streak', '10-tasks', etc.
    name: str        # Display name
    description: str
    icon: str        # Emoji
    unlock_criteria: dict  # {"type": "streak", "value": 3}

class UserBadge(BaseModel):
    badge_id: UUID
    user_id: str
    badge_type: str
    unlocked_at: datetime

class UserThemes(BaseModel):
    user_id: str
    active_theme: str = "solarized"
    unlocked_themes: List[str] = ["solarized"]

class StepXPRequest(BaseModel):
    step_id: UUID
    task_priority: str  # 'low', 'medium', 'high'
    estimated_minutes: int

class StepXPResponse(BaseModel):
    xp_earned: int
    breakdown: dict  # {"base": 10, "priority_bonus": 3, "time_bonus": 5}
```

---

## 🧮 XP Calculation Logic

```python
def calculate_step_xp(priority: str, estimated_minutes: int) -> int:
    """
    Per PRD: base 10 + priority bonus + time bonus
    """
    base_xp = 10
    priority_bonus = {"high": 5, "medium": 3, "low": 1}.get(priority.lower(), 0)
    time_bonus = min(estimated_minutes // 5, 10)  # Max +10
    return base_xp + priority_bonus + time_bonus

# Example:
# - Low priority, 5 min step: 10 + 1 + 1 = 12 XP
# - High priority, 30 min step: 10 + 5 + 6 = 21 XP
```

---

## 🏆 Badge Definitions

20 badges to implement (seed data):

**Streak Badges:**
- `3-day-streak` 🔥 "3-Day Streak"
- `7-day-streak` ⚡ "Week Warrior"
- `30-day-streak` 🏆 "Month Master"

**Volume Badges:**
- `10-steps` 📊 "Getting Started" (10 steps completed)
- `100-steps` 🌟 "Step Champion" (100 steps)
- `500-steps` 💎 "Step Legend" (500 steps)

**Time-Based Badges:**
- `morning-warrior` 🌅 "Morning Warrior" (3 tasks before 9am)
- `night-owl` 🦉 "Night Owl" (task after 10pm)

**Specialty Badges:**
- `quick-win-master` ⚡ "Quick Win Master" (10 tasks <15min)
- `marathon-runner` 🏃 "Marathon Runner" (task >2hr)

**Pet Badges:**
- `pet-whisperer` 🐾 "Pet Whisperer" (pet level 5)
- `evolution-master` 🦋 "Evolution Master" (evolved pet to adult)

---

## 🚀 API Routes

```python
@router.post("/xp/calculate", response_model=StepXPResponse)
async def calculate_step_xp(request: StepXPRequest):
    """Calculate XP for completing a step."""
    pass

@router.post("/badges/check/{user_id}")
async def check_and_unlock_badges(user_id: str):
    """Check if user unlocked any new badges, return newly unlocked."""
    pass

@router.get("/badges/{user_id}", response_model=List[UserBadge])
async def get_user_badges(user_id: str):
    """Get all unlocked badges for user."""
    pass

@router.get("/themes/{user_id}", response_model=UserThemes)
async def get_user_themes(user_id: str):
    """Get user's theme settings."""
    pass

@router.post("/themes/{user_id}/unlock")
async def unlock_theme(user_id: str, theme_name: str):
    """Unlock a theme (called when unlock criteria met)."""
    pass
```

---

## 🧪 TDD Tests (RED First)

```python
def test_calculate_step_xp_base()            # 10 base XP
def test_calculate_step_xp_with_priority()   # + priority bonus
def test_calculate_step_xp_with_time()       # + time bonus
def test_unlock_first_badge()                # Unlock 3-day-streak
def test_duplicate_badge_prevented()         # Can't unlock same badge twice
def test_theme_unlock_on_criteria()          # Level 5 → unlock neon-nights
def test_badge_check_returns_new_only()      # Only return newly unlocked
```

---

## ✅ Checklist

- [ ] Schema updates (badges, themes, micro_steps.xp_earned)
- [ ] XP calculation function with tests
- [ ] Badge unlock logic (20 badge definitions)
- [ ] Theme unlock logic (5 themes)
- [ ] 10+ TDD tests
- [ ] 95%+ coverage
- [ ] Seed 20 badge definitions

---

**Next**: Frontend uses this for real-time XP display and badge notifications
