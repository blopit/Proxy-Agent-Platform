# 📋 Services TODO - What's Left to Build

**Last Updated**: 2025-11-05
**Status**: 2 services remain to implement

---

## ✅ Completed Services (12)

### Core Task Management
- ✅ **TaskServiceV2** - Modern task CRUD with DI
- ✅ **LLMCaptureService** - AI-powered natural language parsing
- ✅ **QuickCaptureService** - 2-second mobile capture
- ✅ **MicroStepService** - Break down overwhelming tasks

### Intelligence & Organization
- ✅ **SecretaryService** - Intelligent task organization
- ✅ **CHAMPSTagService** - ADHD-optimized tagging
- ✅ **DelegationRepository** - Task delegation (BE-00)

### Gamification & Motivation
- ✅ **DopamineRewardService** - Variable ratio reinforcement
- ✅ **FocusSessionRepository** - Focus session tracking (BE-03)
- ✅ **TemplateRepository** - Task templates (BE-01)

### Performance & Infrastructure
- ✅ **RedisCacheService** - Redis caching
- ✅ **PerformanceService** - Performance monitoring

---

## ❌ Not Yet Implemented (2)

### 1. User Pets Service (BE-02)

**Status**: 🔴 NOT IMPLEMENTED
**Priority**: HIGH
**Estimated Time**: 6-8 hours
**Document**: [docs/tasks/backend/02_user_pets_service.md](../tasks/backend/02_user_pets_service.md)

**What It Does**:
- Virtual pet system that grows with task completion
- Pet species, levels, XP, hunger/happiness stats
- Evolution stages (baby → teen → adult)
- Completing tasks "feeds" pets with XP

**Why It Matters**:
- 40%+ increase in task completion (per PRD research)
- ADHD gamification
- Dopamine reward system enhancement

**What Needs to Be Built**:

```
src/
├── services/
│   └── user_pet_service.py         ❌ NOT CREATED
│       ├── UserPetService
│       ├── feed_pet()
│       ├── calculate_xp_gain()
│       └── check_evolution()
│
├── repositories/
│   └── user_pet_repository.py      ❌ NOT CREATED
│       ├── UserPetRepository
│       ├── get_user_pet()
│       ├── update_pet_stats()
│       └── check_pet_needs()
│
└── api/
    └── pets.py                      ❌ NOT CREATED
        ├── GET /api/v1/pets/{user_id}
        ├── POST /api/v1/pets/create
        ├── POST /api/v1/pets/feed
        └── GET /api/v1/pets/species
```

**Database Schema Needed**:
```sql
CREATE TABLE user_pets (
    pet_id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    species VARCHAR(50) NOT NULL,  -- 'dog', 'cat', 'dragon', 'owl', 'fox'
    name VARCHAR(100) NOT NULL,
    level INT DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    xp INT DEFAULT 0,
    hunger INT DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
    happiness INT DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
    evolution_stage INT DEFAULT 1 CHECK (evolution_stage >= 1 AND evolution_stage <= 3),
    created_at TIMESTAMP DEFAULT NOW(),
    last_fed_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints Needed**:
- `POST /api/v1/pets/create` - Create user's first pet
- `GET /api/v1/pets/{user_id}` - Get user's pet status
- `POST /api/v1/pets/feed` - Feed pet with XP from task completion
- `GET /api/v1/pets/species` - List available pet species

**Integration Points**:
- Hook into `DopamineRewardService.grant_task_reward()` to feed pet automatically
- Display pet widget in mobile app dashboard
- Show pet hunger/happiness notifications

**TDD Approach**:
```python
# Tests to write FIRST (RED phase)
def test_create_pet_with_valid_species()
def test_feed_pet_increases_xp()
def test_pet_levels_up_at_100_xp()
def test_pet_evolves_at_level_5()
def test_hunger_decreases_over_time()
def test_cannot_create_second_pet()
```

---

### 2. Gamification Enhancements (BE-04)

**Status**: 🟡 PARTIALLY IMPLEMENTED
**Priority**: MEDIUM
**Estimated Time**: 5 hours
**Document**: [docs/tasks/backend/04_gamification_enhancements.md](../tasks/backend/04_gamification_enhancements.md)

**What It Does**:
- Badge system (20 badges: streaks, task counts, speed)
- Theme unlocking system
- Per-step XP calculation
- Achievement tracking

**What Exists**:
- ✅ `DopamineRewardService` - Base XP system
- ✅ Basic achievement tracking

**What's Missing**:

```
src/
├── services/
│   ├── badge_service.py             ❌ NOT CREATED
│   │   ├── BadgeService
│   │   ├── check_badge_unlock()
│   │   ├── award_badge()
│   │   └── BADGE_DEFINITIONS
│   │
│   └── theme_service.py             ❌ NOT CREATED
│       ├── ThemeService
│       ├── unlock_theme()
│       └── THEME_UNLOCK_CRITERIA
│
├── repositories/
│   ├── user_badge_repository.py     ❌ NOT CREATED
│   └── user_theme_repository.py     ❌ NOT CREATED
│
└── api/
    └── gamification.py              ⚠️ INCOMPLETE
        ├── GET /api/v1/badges/{user_id}  ❌ MISSING
        └── GET /api/v1/themes/{user_id}  ❌ MISSING
```

**Database Schema Needed**:
```sql
-- Track user badge unlocks
CREATE TABLE user_badges (
    badge_id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    badge_type VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Track theme unlocks
CREATE TABLE user_themes (
    user_id VARCHAR(255) PRIMARY KEY,
    active_theme VARCHAR(50) DEFAULT 'solarized',
    unlocked_themes TEXT[] DEFAULT ARRAY['solarized'],
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add to existing micro_steps table
ALTER TABLE micro_steps ADD COLUMN xp_earned INT DEFAULT 0;
ALTER TABLE micro_steps ADD COLUMN completed_at TIMESTAMP;
```

**Badge System Needed**:
20 badges to implement:
- **Streak badges**: 3-day, 7-day, 14-day, 30-day
- **Task count badges**: 10, 25, 50, 100, 250, 500 tasks
- **Speed badges**: Complete 5 tasks in one day, 10 in one day
- **Focus badges**: 10, 25, 50 focus sessions
- **Consistency badges**: Complete tasks 5 days in a row

**Theme System Needed**:
Themes to unlock:
- `solarized` (default, always unlocked)
- `forest` (unlock: 50 tasks completed)
- `ocean` (unlock: 7-day streak)
- `sunset` (unlock: 100 tasks completed)
- `midnight` (unlock: 14-day streak)
- `galaxy` (unlock: 250 tasks completed)

**Integration Points**:
- Check badge unlocks after every task completion
- Award theme unlocks based on criteria
- Calculate per-step XP in `MicroStepService.complete_step()`

**TDD Approach**:
```python
# Tests to write FIRST (RED phase)
def test_award_first_streak_badge()
def test_award_task_count_badge_at_10_tasks()
def test_unlock_forest_theme_at_50_tasks()
def test_calculate_step_xp_with_priority_bonus()
def test_cannot_unlock_same_badge_twice()
```

---

## 🔄 Migration Work Remaining

### Services to Deprecate/Remove

**Still need to remove** (after migration complete):
1. ⚠️ `src/services/task_service.py` - Remove by Dec 1
2. ⚠️ `src/repositories/task_repository.py` - Remove by Dec 1
3. 🗑️ `src/api/simple_tasks.py` - Remove by Dec 15
4. 🗑️ `src/api/basic_tasks.py` - Remove by Dec 15
5. 🗑️ `src/api/tasks.py` - Remove by Dec 15
6. 🗑️ `src/agents/task_agent.py` - Remove by Dec 20
7. 🗑️ `src/agents/conversational_task_agent.py` - Remove by Dec 20

**See**: [DEPRECATION_NOTICE.md](./DEPRECATION_NOTICE.md) for timeline

---

## 📊 Service Implementation Status

| Service | Status | Priority | Effort | Owner |
|---------|--------|----------|--------|-------|
| **Core Services** |
| TaskServiceV2 | ✅ COMPLETE | - | - | - |
| LLMCaptureService | ✅ COMPLETE | - | - | - |
| QuickCaptureService | ✅ COMPLETE | - | - | - |
| MicroStepService | ✅ COMPLETE | - | - | - |
| **Intelligence** |
| SecretaryService | ✅ COMPLETE | - | - | - |
| CHAMPSTagService | ✅ COMPLETE | - | - | - |
| DelegationRepository | ✅ COMPLETE | - | - | - |
| **Gamification** |
| DopamineRewardService | ✅ COMPLETE | - | - | - |
| TemplateRepository | ✅ COMPLETE | - | - | - |
| FocusSessionRepository | ✅ COMPLETE | - | - | - |
| **User Pets (BE-02)** | ❌ TODO | HIGH | 6-8h | Unassigned |
| **Badges/Themes (BE-04)** | 🟡 PARTIAL | MEDIUM | 5h | Unassigned |
| **Performance** |
| RedisCacheService | ✅ COMPLETE | - | - | - |
| PerformanceService | ✅ COMPLETE | - | - | - |

---

## 🎯 Implementation Priorities

### This Week (Must Do)
1. ❌ **User Pets Service (BE-02)** - 6-8 hours
   - Create service, repository, API endpoints
   - Database migration
   - Tests (TDD)
   - Integration with `DopamineRewardService`

### Next Week (Should Do)
2. ❌ **Gamification Enhancements (BE-04)** - 5 hours
   - Badge service and repository
   - Theme service and repository
   - Database migration
   - Tests (TDD)

### Following Week (Cleanup)
3. ⚠️ **Deprecation Removal**
   - Add console warnings to deprecated services
   - Begin migration of old code
   - Update frontend to use v2 APIs

---

## 📝 Task Breakdown for BE-02 (User Pets)

**Step-by-step implementation** (follow TDD):

### Day 1: Database & Models (2-3 hours)
- [ ] Create Alembic migration for `user_pets` table
- [ ] Define Pydantic models in `src/core/creature_models.py` (might already exist)
- [ ] Write model validation tests
- [ ] Apply migration: `uv run alembic upgrade head`

### Day 2: Repository Layer (2 hours)
- [ ] Create `src/repositories/user_pet_repository.py`
- [ ] Extend `BaseRepository[UserPet]`
- [ ] Implement methods:
  - `get_user_pet(user_id)`
  - `create_pet(pet_data)`
  - `update_stats(pet_id, stats)`
  - `feed_pet(pet_id, xp_amount)`
- [ ] Write repository tests (TDD)

### Day 3: Service Layer (2 hours)
- [ ] Create `src/services/user_pet_service.py`
- [ ] Implement `UserPetService` with DI
- [ ] Methods:
  - `create_user_pet(user_id, species, name)`
  - `feed_pet(user_id, xp_earned)`
  - `calculate_xp_gain(task_priority, estimated_minutes)`
  - `check_level_up(pet)`
  - `check_evolution(pet)`
  - `update_hunger_happiness(pet)`
- [ ] Write service tests (TDD)

### Day 4: API & Integration (2 hours)
- [ ] Create `src/api/pets.py` router
- [ ] Implement endpoints (with DI):
  - `POST /api/v1/pets/create`
  - `GET /api/v1/pets/{user_id}`
  - `POST /api/v1/pets/feed`
  - `GET /api/v1/pets/species`
- [ ] Integrate with `DopamineRewardService`:
  - Hook `feed_pet()` into `grant_task_reward()`
- [ ] Write API integration tests
- [ ] Update OpenAPI docs

### Day 5: Testing & Polish (1 hour)
- [ ] Run full test suite
- [ ] Test manual flows in Swagger UI
- [ ] Add console logging
- [ ] Update documentation
- [ ] Create seed data (5 pet species)

**Total**: 6-8 hours of focused work

---

## 📝 Task Breakdown for BE-04 (Badges/Themes)

### Day 1: Database & Models (1 hour)
- [ ] Create migration for `user_badges` and `user_themes` tables
- [ ] Extend `micro_steps` table with XP fields
- [ ] Define Pydantic models
- [ ] Apply migration

### Day 2: Badge Service (2 hours)
- [ ] Create `src/services/badge_service.py`
- [ ] Define 20 badge types with unlock criteria
- [ ] Implement badge checking logic
- [ ] Write tests (TDD)

### Day 3: Theme Service & Integration (2 hours)
- [ ] Create `src/services/theme_service.py`
- [ ] Define theme unlock criteria
- [ ] Integrate with `MicroStepService` for per-step XP
- [ ] Update API endpoints
- [ ] Write tests

**Total**: 5 hours of focused work

---

## ✅ When Everything is Complete

**Backend Services Status**: 14/14 (100%)

**All services will be**:
- ✅ Implemented with dependency injection
- ✅ Following TDD methodology
- ✅ Using entity-specific primary keys
- ✅ Fully tested (95%+ coverage)
- ✅ Documented in service guide
- ✅ Integrated with mobile app

**Then focus shifts to**:
1. Frontend integration
2. Mobile app polish
3. Performance optimization
4. Production deployment

---

## 🆘 Need Help?

### Starting BE-02 (User Pets)?
1. Read [docs/tasks/backend/02_user_pets_service.md](../tasks/backend/02_user_pets_service.md)
2. Follow TDD: Write tests first
3. Use `TaskServiceV2` as reference for DI pattern
4. Check [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md) for patterns

### Starting BE-04 (Badges/Themes)?
1. Read [docs/tasks/backend/04_gamification_enhancements.md](../tasks/backend/04_gamification_enhancements.md)
2. Review existing `DopamineRewardService` for XP patterns
3. Follow TDD workflow
4. Integrate with `MicroStepService`

### Questions?
- **Architecture**: See [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
- **Patterns**: See [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md)
- **Standards**: See [CLAUDE.md](../../CLAUDE.md)
- **Stuck**: Ask in #backend-dev

---

**Last Updated**: 2025-11-05
**Next Review**: After BE-02 completion

**Status**: 🟢 Clear path forward, 2 services remain (11-13 hours total work)
