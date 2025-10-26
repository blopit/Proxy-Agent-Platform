# Creature Collection System Design

## Overview

A gamified creature collection system inspired by Pokemon, where users earn unique AI-generated creatures that level up with task completion and can be traded/collected socially.

## Core Concepts

### User Starter Creatures
- **Each user receives 2 unique custom creatures** when they sign up
- These creatures are permanently bound to the user (cannot be traded away, but can be shown off)
- Creatures are generated via AI image endpoint with unique seeds based on user_id

### Creature Leveling
- Creatures gain XP when the user completes tasks
- XP is shared across all user's creatures (or focused on one "active" creature)
- Levels unlock visual evolution stages and increased rarity

### Social Collection
- Users can collect creatures from friends who have accounts
- Trading mechanics allow creature exchange
- Collection gallery shows owned creatures, friends' creatures, and locked/unknown creatures

---

## Rarity System

### Rarity Tiers
Creatures have 6 rarity tiers that affect their visual complexity and trade value:

| Rarity | Probability | Visual Style | Trade Value | Evolution Stages |
|--------|-------------|--------------|-------------|------------------|
| **Common** | 45% | Simple, 1-2 colors | 1x | Baby → Teen |
| **Uncommon** | 30% | 2-3 colors, basic patterns | 2x | Baby → Teen → Adult |
| **Rare** | 15% | 3-4 colors, intricate patterns | 4x | Baby → Teen → Adult → Elite |
| **Epic** | 7% | 4-5 colors, glowing effects | 8x | Baby → Teen → Adult → Elite → Master |
| **Legendary** | 2.5% | Rainbow colors, particle effects | 16x | All stages + Legendary form |
| **Mythic** | 0.5% | Animated, unique abilities | 32x | All stages + Mythic form |

### Starter Creature Rarity
- User's 2 starter creatures: **Guaranteed 1 Uncommon + 1 Rare**
- This ensures new users get exciting creatures immediately
- Additional creatures earned through task completion use normal rarity distribution

---

## Creature Attributes

Each creature has:

```typescript
interface Creature {
  creature_id: string;           // UUID
  owner_user_id: string;         // User who owns this instance
  template_id: string;           // Links to creature_templates (for reproducible generation)

  // Identity
  name: string;                  // User-assigned nickname (default: species name)
  species: string;               // "Fluffernox", "Sparkwing", etc.
  type: CreatureType;            // FIRE, WATER, EARTH, AIR, LIGHT, SHADOW, COSMIC

  // Rarity & Level
  rarity: RarityTier;
  level: number;                 // 1-100
  xp: number;                    // Current XP
  xp_to_next_level: number;      // XP needed for next level
  evolution_stage: EvolutionStage; // BABY, TEEN, ADULT, ELITE, MASTER, LEGENDARY, MYTHIC

  // Visual
  image_url: string;             // AI-generated image URL
  primary_color: string;         // Hex color
  secondary_color: string;       // Hex color
  accent_color: string;          // Hex color

  // Metadata
  generation_seed: string;       // For reproducible AI generation
  is_starter: boolean;           // True for user's 2 starters
  is_tradeable: boolean;         // False for starters
  obtained_at: datetime;
  obtained_from: ObtainMethod;   // STARTER, TASK_REWARD, TRADE, MYSTERY_BOX

  // Stats (optional future feature)
  strength?: number;
  agility?: number;
  intelligence?: number;
  charm?: number;
}
```

---

## Leveling & Evolution System

### XP Formula
Creatures gain XP from task completion:

```python
# Base XP by task priority
TASK_XP = {
    "low": 10,
    "medium": 20,
    "high": 35,
    "urgent": 50
}

# Bonus multipliers
STREAK_MULTIPLIER = {
    3: 1.1,    # 3-day streak: 10% bonus
    7: 1.25,   # 7-day streak: 25% bonus
    14: 1.5,   # 14-day streak: 50% bonus
    30: 2.0,   # 30-day streak: 100% bonus
}

# Creature rarity bonus
RARITY_XP_MULTIPLIER = {
    "common": 1.0,
    "uncommon": 1.1,
    "rare": 1.2,
    "epic": 1.3,
    "legendary": 1.5,
    "mythic": 2.0
}

# Final XP calculation
creature_xp = base_task_xp * streak_multiplier * rarity_multiplier
```

### Level Progression
```python
# XP required for level N (non-linear growth)
def xp_for_level(level: int) -> int:
    return int(100 * (level ** 1.8))

# Example progression:
# Level 1 → 2: 100 XP
# Level 5 → 6: 1,898 XP
# Level 10 → 11: 6,310 XP
# Level 20 → 21: 24,251 XP
# Level 50 → 51: 292,634 XP
```

### Evolution Stages

Creatures evolve at specific level milestones:

| Stage | Level | Visual Changes | Unlocks |
|-------|-------|----------------|---------|
| **Baby** | 1-9 | Cute, small, simple features | Basic appearance |
| **Teen** | 10-24 | Larger, more defined features | Name customization |
| **Adult** | 25-49 | Fully grown, battle-ready | Trading enabled |
| **Elite** | 50-74 | Glowing effects, enhanced details | Rare+ only: special abilities |
| **Master** | 75-89 | Particle effects, aura | Epic+ only: legendary appearance |
| **Legendary** | 90-99 | Animated elements, epic presence | Legendary only |
| **Mythic** | 100 | Screen-filling celebration | Mythic only: unique animations |

**Evolution Triggers:**
- Automatic when level threshold reached
- Special "evolution celebration" animation
- New AI image generated for evolved form (with evolution_stage parameter)

---

## AI Image Generation Integration

### Random AI Image Endpoint

Assuming the endpoint exists at: `POST /api/v1/ai/generate-image`

**Request Format:**
```json
{
  "prompt": "cute fantasy creature, fire type, red and orange colors, baby stage, chibi art style, white background",
  "seed": "user_123_creature_1",
  "style": "kawaii",
  "negative_prompt": "scary, realistic, dark, violent",
  "width": 512,
  "height": 512
}
```

**Response Format:**
```json
{
  "image_url": "https://storage.../creature_abc123.png",
  "generation_id": "gen_xyz789",
  "seed_used": "user_123_creature_1",
  "model": "stable-diffusion-xl",
  "generation_time_ms": 1234
}
```

### Prompt Engineering for Creatures

**Base Template:**
```python
def generate_creature_prompt(
    creature_type: str,
    evolution_stage: str,
    rarity: str,
    primary_color: str,
    secondary_color: str
) -> str:
    # Stage descriptions
    stage_modifiers = {
        "BABY": "cute chibi baby, small and adorable",
        "TEEN": "young and energetic, medium size",
        "ADULT": "fully grown and powerful, confident pose",
        "ELITE": "majestic and glowing, enhanced features",
        "MASTER": "legendary aura, particle effects",
        "LEGENDARY": "epic godlike appearance, dramatic lighting",
        "MYTHIC": "cosmic entity, reality-bending visuals"
    }

    # Rarity visual effects
    rarity_effects = {
        "common": "",
        "uncommon": "slight glow",
        "rare": "glowing patterns, magical aura",
        "epic": "intense glow, swirling energy",
        "legendary": "rainbow shimmer, divine light",
        "mythic": "cosmic nebula background, stars and galaxies"
    }

    # Type characteristics
    type_traits = {
        "FIRE": "flames, embers, fiery texture",
        "WATER": "flowing water, bubbles, aquatic features",
        "EARTH": "rocky texture, crystal formations, moss",
        "AIR": "feathers, clouds, wind swirls",
        "LIGHT": "radiant beams, holy symbols, bright colors",
        "SHADOW": "dark mist, glowing eyes, ethereal",
        "COSMIC": "starry patterns, galaxy colors, nebula swirls"
    }

    prompt = f"""
    {stage_modifiers[evolution_stage]} fantasy creature,
    {type_traits[creature_type]},
    {primary_color} and {secondary_color} color scheme,
    {rarity_effects[rarity]},
    kawaii art style, pokemon inspired,
    clean white background, centered composition,
    high quality digital art, vibrant colors
    """

    return prompt.strip()
```

**Negative Prompt (consistent across all):**
```
realistic, scary, violent, gore, dark, blurry, low quality,
watermark, text, signature, human, humanoid, weapon
```

### Seed Generation for Reproducibility

To ensure the same creature looks identical when traded:

```python
import hashlib

def generate_creature_seed(template_id: str, variation: int = 0) -> str:
    """
    Generate deterministic seed for AI image generation.
    Same template_id always produces same creature appearance.
    """
    seed_string = f"{template_id}_{variation}"
    hash_object = hashlib.sha256(seed_string.encode())
    return hash_object.hexdigest()[:16]  # Use first 16 chars as seed
```

---

## Database Schema

### Table: `creature_templates`
Defines the base template for reproducible creature generation.

```sql
CREATE TABLE creature_templates (
    template_id TEXT PRIMARY KEY,
    species TEXT NOT NULL,
    creature_type TEXT NOT NULL CHECK(creature_type IN (
        'FIRE', 'WATER', 'EARTH', 'AIR', 'LIGHT', 'SHADOW', 'COSMIC'
    )),
    rarity TEXT NOT NULL CHECK(rarity IN (
        'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
    )),
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    accent_color TEXT,
    generation_seed TEXT NOT NULL UNIQUE,
    base_prompt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Stats (optional)
    base_strength INTEGER DEFAULT 10,
    base_agility INTEGER DEFAULT 10,
    base_intelligence INTEGER DEFAULT 10,
    base_charm INTEGER DEFAULT 10
);

CREATE INDEX idx_templates_rarity ON creature_templates(rarity);
CREATE INDEX idx_templates_type ON creature_templates(creature_type);
```

### Table: `user_creatures`
Instances of creatures owned by users.

```sql
CREATE TABLE user_creatures (
    creature_id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    template_id TEXT NOT NULL REFERENCES creature_templates(template_id),

    -- Customization
    nickname TEXT,  -- NULL = use species name

    -- Progression
    level INTEGER NOT NULL DEFAULT 1 CHECK(level >= 1 AND level <= 100),
    xp INTEGER NOT NULL DEFAULT 0,
    evolution_stage TEXT NOT NULL DEFAULT 'BABY' CHECK(evolution_stage IN (
        'BABY', 'TEEN', 'ADULT', 'ELITE', 'MASTER', 'LEGENDARY', 'MYTHIC'
    )),

    -- Images (one per evolution stage)
    image_baby TEXT,
    image_teen TEXT,
    image_adult TEXT,
    image_elite TEXT,
    image_master TEXT,
    image_legendary TEXT,
    image_mythic TEXT,

    -- Metadata
    is_starter BOOLEAN NOT NULL DEFAULT FALSE,
    is_tradeable BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,  -- Currently selected creature
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    obtained_from TEXT CHECK(obtained_from IN (
        'STARTER', 'TASK_REWARD', 'MYSTERY_BOX', 'TRADE', 'GIFT', 'EVENT'
    )),
    obtained_from_user_id TEXT,  -- If obtained via trade/gift

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_creatures_owner ON user_creatures(owner_user_id);
CREATE INDEX idx_user_creatures_template ON user_creatures(template_id);
CREATE INDEX idx_user_creatures_level ON user_creatures(level DESC);
CREATE INDEX idx_user_creatures_active ON user_creatures(owner_user_id, is_active);

-- Ensure only one active creature per user
CREATE UNIQUE INDEX idx_one_active_per_user
ON user_creatures(owner_user_id)
WHERE is_active = TRUE;
```

### Table: `creature_trades`
Records of creature trades between users.

```sql
CREATE TABLE creature_trades (
    trade_id TEXT PRIMARY KEY,

    -- Participants
    sender_user_id TEXT NOT NULL,
    receiver_user_id TEXT NOT NULL,

    -- Creatures involved
    sender_creature_id TEXT NOT NULL REFERENCES user_creatures(creature_id),
    receiver_creature_id TEXT REFERENCES user_creatures(creature_id),  -- NULL for gifts

    -- Trade status
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN (
        'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'
    )),

    -- Timestamps
    offered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,  -- Auto-cancel after 7 days

    FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_trades_sender ON creature_trades(sender_user_id, status);
CREATE INDEX idx_trades_receiver ON creature_trades(receiver_user_id, status);
CREATE INDEX idx_trades_status ON creature_trades(status, expires_at);
```

### Table: `creature_collection_progress`
Tracks which creatures a user has "seen" (for Pokedex-style collection).

```sql
CREATE TABLE creature_collection_progress (
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL REFERENCES creature_templates(template_id),

    -- Discovery
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discovered_from TEXT,  -- 'OWNED', 'SEEN_IN_TRADE', 'FRIEND_COLLECTION', 'EVENT'

    -- Ownership
    ever_owned BOOLEAN NOT NULL DEFAULT FALSE,
    currently_owned BOOLEAN NOT NULL DEFAULT FALSE,
    times_owned INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (user_id, template_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_collection_user ON creature_collection_progress(user_id);
CREATE INDEX idx_collection_discovered ON creature_collection_progress(user_id, discovered_at DESC);
```

---

## Backend Services

### CreatureService (`src/services/creature_service.py`)

**Key Methods:**

```python
class CreatureService:
    """Manages creature generation, leveling, and evolution."""

    async def generate_starter_creatures(self, user_id: str) -> List[UserCreature]:
        """
        Generate 2 starter creatures for new user.
        Guaranteed: 1 Uncommon + 1 Rare
        """
        pass

    async def generate_creature_from_template(
        self,
        template_id: str,
        owner_user_id: str,
        obtained_from: ObtainMethod
    ) -> UserCreature:
        """Create user creature instance from template."""
        pass

    async def add_xp_to_creature(
        self,
        creature_id: str,
        xp_amount: int
    ) -> CreatureLevelUpResult:
        """
        Add XP to creature, handle level ups and evolution.
        Returns level_up=True if leveled, evolution=True if evolved.
        """
        pass

    async def evolve_creature(
        self,
        creature_id: str,
        new_stage: EvolutionStage
    ) -> UserCreature:
        """
        Evolve creature to next stage.
        Generates new AI image for evolved form.
        """
        pass

    async def set_active_creature(
        self,
        user_id: str,
        creature_id: str
    ) -> None:
        """Set which creature gains XP from tasks."""
        pass

    async def get_user_collection(
        self,
        user_id: str,
        include_locked: bool = True
    ) -> CollectionSummary:
        """Get user's creature collection with progress stats."""
        pass
```

### CreatureTemplateService (`src/services/creature_template_service.py`)

```python
class CreatureTemplateService:
    """Manages creature templates and procedural generation."""

    async def create_random_template(self, rarity: RarityTier) -> CreatureTemplate:
        """Generate new random creature template with given rarity."""
        pass

    async def get_template_pool(
        self,
        rarity: Optional[RarityTier] = None,
        creature_type: Optional[CreatureType] = None
    ) -> List[CreatureTemplate]:
        """Get available creature templates for rewards."""
        pass

    def _generate_species_name(self, creature_type: CreatureType) -> str:
        """Generate procedural creature name (e.g., 'Fluffernox')."""
        pass

    def _generate_color_palette(
        self,
        creature_type: CreatureType,
        rarity: RarityTier
    ) -> ColorPalette:
        """Generate harmonious color palette for creature."""
        pass
```

### AIImageService (`src/services/ai_image_service.py`)

```python
class AIImageService:
    """Integrates with AI image generation endpoint."""

    async def generate_creature_image(
        self,
        template: CreatureTemplate,
        evolution_stage: EvolutionStage = EvolutionStage.BABY
    ) -> str:
        """
        Generate AI image for creature at specific evolution stage.
        Returns image URL.
        """
        prompt = self._build_prompt(template, evolution_stage)
        seed = template.generation_seed

        response = await self.client.post("/api/v1/ai/generate-image", json={
            "prompt": prompt,
            "seed": seed,
            "style": "kawaii",
            "negative_prompt": self.NEGATIVE_PROMPT,
            "width": 512,
            "height": 512
        })

        return response.json()["image_url"]

    def _build_prompt(
        self,
        template: CreatureTemplate,
        evolution_stage: EvolutionStage
    ) -> str:
        """Build detailed prompt for AI generation."""
        pass
```

### CreatureTradeService (`src/services/creature_trade_service.py`)

```python
class CreatureTradeService:
    """Manages creature trading between users."""

    async def offer_trade(
        self,
        sender_user_id: str,
        receiver_user_id: str,
        sender_creature_id: str,
        receiver_creature_id: Optional[str] = None  # None = gift
    ) -> Trade:
        """Create trade offer."""
        pass

    async def accept_trade(self, trade_id: str) -> Trade:
        """Accept trade and swap creature ownership."""
        pass

    async def reject_trade(self, trade_id: str) -> Trade:
        """Reject trade offer."""
        pass

    async def get_pending_trades(self, user_id: str) -> List[Trade]:
        """Get trades awaiting user's response."""
        pass
```

---

## API Endpoints

### Creature Management (`src/api/creatures.py`)

```python
router = APIRouter(prefix="/api/v1/creatures", tags=["creatures"])

@router.get("/my-creatures")
async def get_my_creatures(user_id: str) -> List[UserCreature]:
    """Get all creatures owned by user."""
    pass

@router.get("/creatures/{creature_id}")
async def get_creature_details(creature_id: str) -> CreatureDetails:
    """Get detailed info about specific creature."""
    pass

@router.post("/creatures/{creature_id}/rename")
async def rename_creature(creature_id: str, new_name: str) -> UserCreature:
    """Set custom nickname for creature."""
    pass

@router.post("/creatures/{creature_id}/set-active")
async def set_active_creature(creature_id: str, user_id: str) -> None:
    """Set active creature (gains XP from tasks)."""
    pass

@router.get("/collection")
async def get_collection_progress(user_id: str) -> CollectionSummary:
    """Get Pokedex-style collection progress."""
    pass

@router.get("/templates")
async def get_available_templates(
    rarity: Optional[str] = None,
    creature_type: Optional[str] = None
) -> List[CreatureTemplate]:
    """Browse available creature templates."""
    pass
```

### Creature Rewards (`src/api/rewards.py` - extend existing)

```python
@router.post("/rewards/creature-reward")
async def claim_creature_reward(
    user_id: str,
    task_id: str,
    task_priority: str
) -> CreatureRewardResult:
    """
    Claim creature reward after task completion.
    Awards XP to active creature, chance to earn new creature.
    """
    # Calculate XP based on task priority
    # Add XP to user's active creature
    # Check for level up / evolution
    # Random chance (10%) to earn new creature from mystery box
    pass
```

### Creature Trading (`src/api/creature_trades.py`)

```python
router = APIRouter(prefix="/api/v1/trades", tags=["creature-trades"])

@router.post("/offer")
async def offer_trade(trade_request: TradeRequest) -> Trade:
    """Offer trade to another user."""
    pass

@router.post("/{trade_id}/accept")
async def accept_trade(trade_id: str) -> Trade:
    """Accept trade offer."""
    pass

@router.post("/{trade_id}/reject")
async def reject_trade(trade_id: str) -> Trade:
    """Reject trade offer."""
    pass

@router.get("/pending")
async def get_pending_trades(user_id: str) -> List[Trade]:
    """Get trades awaiting user response."""
    pass

@router.get("/history")
async def get_trade_history(user_id: str) -> List[Trade]:
    """Get completed trade history."""
    pass
```

---

## Frontend Components (mobile2/)

### Directory Structure

```
frontend/src/components/mobile2/
├── creatures/
│   ├── CreatureCard.tsx              - Individual creature display
│   ├── CreatureGallery.tsx           - Grid of user's creatures
│   ├── CreatureDetails.tsx           - Full-screen creature view
│   ├── CreatureLevelUp.tsx           - Level up celebration animation
│   ├── CreatureEvolution.tsx         - Evolution animation
│   ├── ActiveCreatureSelector.tsx    - Choose active creature
│   └── CreatureRewardModal.tsx       - Show creature earned popup
│
├── collection/
│   ├── CollectionPokedex.tsx         - Pokedex-style collection view
│   ├── CollectionStats.tsx           - Collection completion stats
│   └── DiscoveredCreatureBadge.tsx   - Badge for newly discovered
│
├── trading/
│   ├── TradeOfferModal.tsx           - Initiate trade with friend
│   ├── TradeRequestCard.tsx          - Pending trade request
│   ├── TradeHistoryList.tsx          - Past trades
│   └── FriendCreatureViewer.tsx      - View friend's creatures
│
└── shared/
    ├── CreatureProgressBar.tsx       - XP progress bar (reuse AsyncJobTimeline?)
    ├── RarityBadge.tsx               - Rarity tier indicator
    ├── TypeIcon.tsx                  - Element type icon (fire, water, etc.)
    └── EvolutionStageBadge.tsx       - Stage indicator (baby, teen, etc.)
```

### Key Components

#### CreatureCard.tsx
```typescript
interface CreatureCardProps {
  creature: UserCreature;
  size?: 'small' | 'medium' | 'large';
  showStats?: boolean;
  showXP?: boolean;
  onClick?: () => void;
}

export const CreatureCard: React.FC<CreatureCardProps> = ({
  creature,
  size = 'medium',
  showStats = false,
  showXP = true,
  onClick
}) => {
  const imageUrl = creature[`image_${creature.evolution_stage.toLowerCase()}`];
  const xpPercent = (creature.xp / creature.xp_to_next_level) * 100;

  return (
    <div
      className={`creature-card rarity-${creature.rarity}`}
      onClick={onClick}
    >
      {/* Creature image with rarity glow effect */}
      <div className="creature-image-container">
        <img src={imageUrl} alt={creature.name} />
        <RarityBadge rarity={creature.rarity} />
        <TypeIcon type={creature.type} />
      </div>

      {/* Creature name & level */}
      <div className="creature-info">
        <h3>{creature.nickname || creature.species}</h3>
        <div className="level-badge">Lv. {creature.level}</div>
        <EvolutionStageBadge stage={creature.evolution_stage} />
      </div>

      {/* XP Progress bar (reuse AsyncJobTimeline pattern!) */}
      {showXP && (
        <CreatureProgressBar
          current={creature.xp}
          max={creature.xp_to_next_level}
          color={getRarityColor(creature.rarity)}
        />
      )}

      {/* Optional stats */}
      {showStats && (
        <div className="creature-stats">
          <StatBar label="STR" value={creature.strength} />
          <StatBar label="AGI" value={creature.agility} />
          <StatBar label="INT" value={creature.intelligence} />
          <StatBar label="CHR" value={creature.charm} />
        </div>
      )}
    </div>
  );
};
```

#### CreatureEvolution.tsx
```typescript
/**
 * Full-screen evolution animation when creature evolves.
 * Shows transformation from old stage to new stage.
 */
export const CreatureEvolution: React.FC<{
  creature: UserCreature;
  oldStage: EvolutionStage;
  newStage: EvolutionStage;
  onComplete: () => void;
}> = ({ creature, oldStage, newStage, onComplete }) => {
  return (
    <div className="evolution-screen">
      <div className="evolution-animation">
        {/* Flash effect, sparkles */}
        <img
          src={creature[`image_${oldStage.toLowerCase()}`]}
          className="fade-out"
        />
        <div className="evolution-glow" />
        <img
          src={creature[`image_${newStage.toLowerCase()}`]}
          className="fade-in"
        />
      </div>

      <h1 className="evolution-text">
        {creature.nickname} is evolving!
      </h1>

      <div className="stage-transition">
        {oldStage} → {newStage}
      </div>

      <button onClick={onComplete}>Continue</button>
    </div>
  );
};
```

#### CollectionPokedex.tsx
```typescript
/**
 * Pokedex-style collection view showing:
 * - Owned creatures (colored, detailed)
 * - Seen creatures (silhouette, name)
 * - Locked creatures (question mark, ???)
 */
export const CollectionPokedex: React.FC<{
  userId: string;
}> = ({ userId }) => {
  const { data: collection } = useQuery(['collection', userId],
    () => fetchCollection(userId)
  );

  const filterOptions = ['All', 'Owned', 'Seen', 'Locked'];
  const rarityFilters = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];

  return (
    <div className="pokedex">
      {/* Stats header */}
      <CollectionStats
        total={collection.total_creatures}
        owned={collection.owned_count}
        seen={collection.seen_count}
        completion={collection.completion_percent}
      />

      {/* Filters */}
      <div className="filters">
        <FilterButtons options={filterOptions} />
        <FilterButtons options={rarityFilters} />
      </div>

      {/* Grid of creatures */}
      <div className="creature-grid">
        {collection.creatures.map((entry) => (
          <PokedexEntry
            key={entry.template_id}
            entry={entry}
            owned={entry.currently_owned}
            seen={entry.discovered}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## Integration with Existing Dopamine System

### Mystery Box Enhancement

Update `src/services/dopamine_reward_service.py` to include creature rewards:

```python
# Add to mystery box rewards (line ~326)
MYSTERY_BOX_REWARDS = [
    {"type": "xp_bonus", "weight": 30, "min": 50, "max": 200},
    {"type": "badge", "weight": 20},
    {"type": "theme", "weight": 15},
    {"type": "power_hour", "weight": 10},
    {"type": "streak_protection", "weight": 15},
    {"type": "creature", "weight": 10},  # NEW: 10% chance for creature
]

async def _grant_creature_reward(self, user_id: str) -> dict:
    """Grant random creature from mystery box."""
    # Determine rarity using same variable ratio as XP multipliers
    rarity = self._roll_creature_rarity()

    # Get random template of that rarity
    template = await self.creature_template_service.get_random_template(rarity)

    # Generate creature for user
    creature = await self.creature_service.generate_creature_from_template(
        template_id=template.template_id,
        owner_user_id=user_id,
        obtained_from="MYSTERY_BOX"
    )

    return {
        "type": "creature",
        "creature_id": creature.creature_id,
        "species": creature.species,
        "rarity": creature.rarity,
        "image_url": creature.image_baby
    }

def _roll_creature_rarity(self) -> str:
    """Roll for creature rarity using same probabilities as rarity table."""
    roll = random.random()
    if roll < 0.005: return "mythic"      # 0.5%
    if roll < 0.030: return "legendary"   # 2.5%
    if roll < 0.100: return "epic"        # 7%
    if roll < 0.250: return "rare"        # 15%
    if roll < 0.550: return "uncommon"    # 30%
    return "common"                        # 45%
```

### Task Completion Flow

When user completes task:

1. Grant XP to active creature
2. Check for level up → show level up celebration
3. Check for evolution → show evolution animation
4. Roll for mystery box (existing 15% chance)
5. If mystery box: roll for creature reward (10% of mystery boxes = 1.5% per task)

---

## Social Features

### Friend System Integration

Assuming a `friends` or `user_connections` table exists:

```python
@router.get("/friends/{friend_user_id}/creatures")
async def view_friend_creatures(
    user_id: str,
    friend_user_id: str
) -> List[UserCreature]:
    """View friend's creature collection (if friends)."""
    # Verify friendship
    if not await friendship_service.are_friends(user_id, friend_user_id):
        raise HTTPException(status_code=403, detail="Not friends")

    # Return friend's creatures
    return await creature_service.get_user_creatures(friend_user_id)
```

### Trade Notifications

When user receives trade offer:
- Push notification (if enabled)
- In-app notification badge
- Email summary (daily digest)

### Collection Comparison

"Compare Collections" feature:
- See which creatures you have that friend doesn't
- See which creatures friend has that you don't
- Suggest fair trades based on rarity

---

## Reward Triggers

### When to Grant Creatures

1. **Starter Creatures**: 2 guaranteed on signup (1 Uncommon + 1 Rare)
2. **Mystery Box**: 10% of mystery boxes (1.5% per task completion)
3. **Level Milestones**: Every 10 user levels (5, 10, 15, etc.)
4. **Achievements**: Special achievements grant specific creatures
5. **Streak Rewards**: 30-day streak, 100-day streak
6. **Events**: Limited-time event creatures
7. **Referrals**: Invite friend → both get creature

### Creature Distribution Balance

To prevent inflation and maintain excitement:

- Average user completes ~10 tasks/day
- 15% mystery box chance = 1.5 boxes/day
- 10% creature in mystery box = 0.15 creatures/day
- **~1 new creature per week** (0.15 * 7 = 1.05)
- Plus starters, milestones, achievements = ~2-3 creatures/week for active users

---

## Visual Design (Solarized Theme)

### Rarity Colors

Using Solarized palette:

| Rarity | Border Color | Glow Color | Background |
|--------|--------------|------------|------------|
| Common | `#93a1a1` (base1) | None | `#fdf6e3` (base3) |
| Uncommon | `#268bd2` (blue) | Subtle blue glow | `#eee8d5` (base2) |
| Rare | `#2aa198` (cyan) | Cyan shimmer | `#eee8d5` (base2) |
| Epic | `#6c71c4` (violet) | Violet pulse | `#eee8d5` (base2) |
| Legendary | `#cb4b16` (orange) | Rainbow shimmer | `#073642` (base02) |
| Mythic | `#d33682` (magenta) | Cosmic nebula | `#002b36` (base03) |

### Evolution Stage Icons

- 🥚 Baby: Egg or baby icon
- 🐣 Teen: Small creature icon
- 🦁 Adult: Full creature icon
- ⭐ Elite: Star + creature
- 👑 Master: Crown + creature
- 💎 Legendary: Gem + creature
- 🌌 Mythic: Galaxy + creature

---

## Implementation Phases

### Phase 1: Core Creature System (Week 1)
- [ ] Database schema + migrations
- [ ] CreatureService, CreatureTemplateService
- [ ] API endpoints (basic CRUD)
- [ ] Starter creature generation on signup

### Phase 2: AI Image Integration (Week 1)
- [ ] AIImageService integration
- [ ] Prompt engineering for creature types
- [ ] Image caching/storage
- [ ] Evolution stage image generation

### Phase 3: Leveling & Evolution (Week 2)
- [ ] XP system integration with task completion
- [ ] Level up calculations
- [ ] Evolution triggers
- [ ] Frontend: CreatureLevelUp, CreatureEvolution components

### Phase 4: Collection UI (Week 2)
- [ ] CreatureCard, CreatureGallery components
- [ ] CollectionPokedex component
- [ ] Rarity badges, type icons
- [ ] Progress bars (reuse AsyncJobTimeline pattern)

### Phase 5: Social Trading (Week 3)
- [ ] CreatureTradeService
- [ ] Trade API endpoints
- [ ] Frontend: trade offer, accept/reject flows
- [ ] Trade notifications

### Phase 6: Mystery Box Integration (Week 3)
- [ ] Add creatures to mystery box rewards
- [ ] Creature reward celebration animation
- [ ] Rarity roll system

### Phase 7: Polish & Testing (Week 4)
- [ ] Animation polish
- [ ] Performance optimization (image loading)
- [ ] Mobile responsiveness
- [ ] E2E testing for trade flows

---

## Success Metrics

### Engagement Metrics
- **Creature Collection Rate**: % of users with 5+ creatures after 30 days
- **Active Creature Usage**: % of tasks where user has active creature selected
- **Trade Activity**: Average trades per user per month
- **Collection Completion**: % of available creatures discovered

### Retention Metrics
- **7-day retention** increase (target: +15%)
- **30-day retention** increase (target: +25%)
- **Daily active users** viewing creature collection (target: 60%+)

### Gamification Impact
- **Task completion rate** with vs without active creature (target: +20%)
- **Streak maintenance** with creature rewards (target: +30%)
- **Mystery box open rate** (target: 95%+)

---

## Technical Considerations

### Performance
- **Image Loading**: Lazy load creature images, use thumbnails in grid views
- **Database Queries**: Index on user_id, rarity, level for fast filtering
- **AI Generation**: Queue-based async generation to avoid blocking requests
- **Caching**: Cache creature templates, user collections in Redis

### Storage
- **Image Storage**: S3 or similar for AI-generated images
- **Database Size**: Estimate ~100 bytes per creature record, 10KB per image URL
- **For 10K users with avg 20 creatures**: ~2MB database + image storage

### Scalability
- **AI Rate Limiting**: Queue system for image generation (avoid API quota issues)
- **Trade Locks**: Pessimistic locking to prevent duplicate trades
- **Collection Queries**: Paginate Pokedex views for users with large collections

---

## Future Enhancements

### Creature Battles (Phase 2)
- Turn-based battles between creatures
- Type advantages (fire > earth > water > fire)
- Battle arenas and tournaments

### Creature Breeding (Phase 3)
- Combine 2 creatures to create new hybrid
- Inherit traits from parents
- Rare breeding combinations

### Creature Customization (Phase 4)
- Accessories and costumes
- Color palette swaps
- Animated poses

### Guild/Team Features (Phase 5)
- Team collections (shared progress)
- Team trades (guild bank)
- Team-exclusive creatures

---

## Open Questions

1. **AI Endpoint Details**: What's the actual URL and API format for your random image AI endpoint?
2. **Storage Strategy**: Should we use S3, Cloudinary, or local storage for creature images?
3. **Friend System**: Does a friends/connections table already exist, or should we create one?
4. **Creature Aesthetics**: Prefer cute animals (like real-world inspired) or fully fantasy/Pokemon-style creatures?
5. **2 Starters**: Should starters be completely random (with guaranteed rarities), or choose from predefined starter options?

---

## Summary

This design creates a compelling creature collection system that:
- ✅ Grants 2 unique starters per user
- ✅ Creatures level up with task completion
- ✅ Social trading/collection with friends
- ✅ Integrates seamlessly with existing dopamine reward system
- ✅ Uses AI image generation for unique creature visuals
- ✅ Follows progress bar design philosophy (XP bars everywhere)
- ✅ Rarity tiers create excitement and collection goals
- ✅ Evolution system provides long-term progression

**Net Effect**: Transforms productivity app into a game where completing tasks = catching Pokemon. Users stay engaged to level their creatures, collect rare species, and trade with friends.
