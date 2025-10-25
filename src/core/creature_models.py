"""
Creature System Models - Pydantic models for creature collection system

Supports:
- Creature templates (base designs)
- User creature instances
- Creature trades
- Collection progress tracking
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class CreatureType(str, Enum):
    """Elemental types for creatures"""

    FIRE = "FIRE"
    WATER = "WATER"
    EARTH = "EARTH"
    AIR = "AIR"
    LIGHT = "LIGHT"
    SHADOW = "SHADOW"
    COSMIC = "COSMIC"


class RarityTier(str, Enum):
    """Rarity tiers affecting visual complexity and trade value"""

    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"
    MYTHIC = "mythic"


class EvolutionStage(str, Enum):
    """Evolution stages - creatures evolve as they level up"""

    BABY = "BABY"  # Level 1-9
    TEEN = "TEEN"  # Level 10-24
    ADULT = "ADULT"  # Level 25-49
    ELITE = "ELITE"  # Level 50-74 (Rare+)
    MASTER = "MASTER"  # Level 75-89 (Epic+)
    LEGENDARY = "LEGENDARY"  # Level 90-99 (Legendary only)
    MYTHIC = "MYTHIC"  # Level 100 (Mythic only)


class ObtainMethod(str, Enum):
    """How the creature was obtained"""

    STARTER = "STARTER"
    TASK_REWARD = "TASK_REWARD"
    MYSTERY_BOX = "MYSTERY_BOX"
    TRADE = "TRADE"
    GIFT = "GIFT"
    EVENT = "EVENT"


class TradeStatus(str, Enum):
    """Status of creature trade"""

    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


# ============================================================================
# Creature Template Models
# ============================================================================


class CreatureTemplate(BaseModel):
    """
    Base template for reproducible creature generation.
    Same template_id always produces same creature appearance.
    """

    template_id: str = Field(default_factory=lambda: str(uuid4()))
    species: str = Field(..., description="Species name (e.g., 'Fluffernox')")
    creature_type: CreatureType
    rarity: RarityTier
    primary_color: str = Field(..., description="Hex color code")
    secondary_color: str = Field(..., description="Hex color code")
    accent_color: Optional[str] = Field(None, description="Hex color code")
    generation_seed: str = Field(..., description="Seed for AI image generation")
    base_prompt: str = Field(..., description="Base AI prompt for generation")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Optional stats for future battle system
    base_strength: int = Field(default=10, ge=1, le=100)
    base_agility: int = Field(default=10, ge=1, le=100)
    base_intelligence: int = Field(default=10, ge=1, le=100)
    base_charm: int = Field(default=10, ge=1, le=100)

    model_config = ConfigDict(
        use_enum_values=True, populate_by_name=True, json_encoders={datetime: lambda v: v.isoformat()}
    )


class CreatureTemplateCreate(BaseModel):
    """Input model for creating new creature template"""

    species: str
    creature_type: CreatureType
    rarity: RarityTier
    primary_color: str
    secondary_color: str
    accent_color: Optional[str] = None
    generation_seed: str
    base_prompt: str
    base_strength: int = 10
    base_agility: int = 10
    base_intelligence: int = 10
    base_charm: int = 10

    model_config = ConfigDict(use_enum_values=True)


# ============================================================================
# User Creature Models
# ============================================================================


class UserCreature(BaseModel):
    """
    Instance of a creature owned by a user.
    Includes leveling, evolution, and customization.
    """

    creature_id: str = Field(default_factory=lambda: str(uuid4()))
    owner_user_id: str
    template_id: str

    # Customization
    nickname: Optional[str] = Field(None, description="User-assigned nickname")

    # Progression
    level: int = Field(default=1, ge=1, le=100)
    xp: int = Field(default=0, ge=0)
    evolution_stage: EvolutionStage = EvolutionStage.BABY

    # Images for each evolution stage
    image_baby: Optional[str] = None
    image_teen: Optional[str] = None
    image_adult: Optional[str] = None
    image_elite: Optional[str] = None
    image_master: Optional[str] = None
    image_legendary: Optional[str] = None
    image_mythic: Optional[str] = None

    # Metadata
    is_starter: bool = False
    is_tradeable: bool = True
    is_active: bool = False
    obtained_at: datetime = Field(default_factory=datetime.utcnow)
    obtained_from: ObtainMethod
    obtained_from_user_id: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        use_enum_values=True, populate_by_name=True, json_encoders={datetime: lambda v: v.isoformat()}
    )

    @property
    def display_name(self) -> str:
        """Get display name (nickname or species name)"""
        return self.nickname if self.nickname else "Unknown Creature"

    @property
    def current_image(self) -> Optional[str]:
        """Get image URL for current evolution stage"""
        stage_lower = self.evolution_stage.value.lower()
        return getattr(self, f"image_{stage_lower}", None)

    def calculate_xp_to_next_level(self) -> int:
        """Calculate XP required to reach next level"""
        if self.level >= 100:
            return 0
        return int(100 * ((self.level + 1) ** 1.8))


class UserCreatureCreate(BaseModel):
    """Input model for creating user creature"""

    owner_user_id: str
    template_id: str
    nickname: Optional[str] = None
    is_starter: bool = False
    obtained_from: ObtainMethod

    model_config = ConfigDict(use_enum_values=True)


class UserCreatureUpdate(BaseModel):
    """Input model for updating user creature"""

    nickname: Optional[str] = None
    level: Optional[int] = Field(None, ge=1, le=100)
    xp: Optional[int] = Field(None, ge=0)
    evolution_stage: Optional[EvolutionStage] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(use_enum_values=True)


# ============================================================================
# Creature Details (with template data)
# ============================================================================


class CreatureDetails(BaseModel):
    """
    Full creature details including template information.
    Used for detailed views and API responses.
    """

    # Creature instance data
    creature_id: str
    owner_user_id: str
    nickname: Optional[str]
    level: int
    xp: int
    xp_to_next_level: int
    evolution_stage: EvolutionStage
    current_image: Optional[str]
    is_starter: bool
    is_tradeable: bool
    is_active: bool
    obtained_at: datetime
    obtained_from: ObtainMethod

    # Template data
    species: str
    creature_type: CreatureType
    rarity: RarityTier
    primary_color: str
    secondary_color: str
    accent_color: Optional[str]

    # Stats
    strength: int
    agility: int
    intelligence: int
    charm: int

    model_config = ConfigDict(
        use_enum_values=True, populate_by_name=True, json_encoders={datetime: lambda v: v.isoformat()}
    )


# ============================================================================
# Creature Trade Models
# ============================================================================


class CreatureTrade(BaseModel):
    """Record of creature trade between users"""

    trade_id: str = Field(default_factory=lambda: str(uuid4()))
    sender_user_id: str
    receiver_user_id: str
    sender_creature_id: str
    receiver_creature_id: Optional[str] = Field(None, description="None for gifts")
    status: TradeStatus = TradeStatus.PENDING
    message: Optional[str] = None
    offered_at: datetime = Field(default_factory=datetime.utcnow)
    responded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(
        use_enum_values=True, populate_by_name=True, json_encoders={datetime: lambda v: v.isoformat()}
    )

    @property
    def is_gift(self) -> bool:
        """Check if trade is a gift (one-way)"""
        return self.receiver_creature_id is None


class TradeRequest(BaseModel):
    """Input model for creating trade offer"""

    sender_user_id: str
    receiver_user_id: str
    sender_creature_id: str
    receiver_creature_id: Optional[str] = None
    message: Optional[str] = None

    model_config = ConfigDict(use_enum_values=True)


# ============================================================================
# Collection Progress Models
# ============================================================================


class CollectionEntry(BaseModel):
    """Tracks discovery/ownership of a single creature template"""

    user_id: str
    template_id: str
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    discovered_from: str  # 'OWNED', 'SEEN_IN_TRADE', 'FRIEND_COLLECTION', 'EVENT'
    ever_owned: bool = False
    currently_owned: bool = False
    times_owned: int = 0

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


class CollectionSummary(BaseModel):
    """Summary of user's creature collection progress"""

    user_id: str
    total_creatures: int  # Total unique templates in game
    owned_count: int  # Currently owned
    seen_count: int  # Discovered but not owned
    locked_count: int  # Not yet discovered
    completion_percent: float  # (owned / total) * 100
    entries: list[CollectionEntry]

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


# ============================================================================
# Reward & Leveling Models
# ============================================================================


class CreatureLevelUpResult(BaseModel):
    """Result of adding XP to creature"""

    creature_id: str
    old_level: int
    new_level: int
    old_xp: int
    new_xp: int
    xp_added: int
    leveled_up: bool
    evolved: bool
    old_stage: Optional[EvolutionStage] = None
    new_stage: Optional[EvolutionStage] = None

    model_config = ConfigDict(use_enum_values=True)


class CreatureRewardResult(BaseModel):
    """Result of claiming creature reward after task completion"""

    creature_xp_gained: Optional[CreatureLevelUpResult] = None
    new_creature_awarded: Optional[UserCreature] = None
    mystery_box_opened: bool = False

    model_config = ConfigDict(use_enum_values=True)
