"""
User Pets Models - Pydantic models for simple pet system (BE-02)

Simple pet system where completing tasks feeds pets with XP.
One pet per user, 5 species, 3 evolution stages.
"""

from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PetSpecies(str):
    """Available pet species"""

    DOG = "dog"
    CAT = "cat"
    DRAGON = "dragon"
    OWL = "owl"
    FOX = "fox"


class EvolutionStage(int):
    """Evolution stages"""

    BABY = 1  # Level 1-4
    TEEN = 2  # Level 5-9
    ADULT = 3  # Level 10


# ============================================================================
# User Pet Models
# ============================================================================


class UserPetBase(BaseModel):
    """Base model for user pet"""

    species: Literal["dog", "cat", "dragon", "owl", "fox"]
    name: str = Field(..., min_length=1, max_length=100)


class UserPetCreate(UserPetBase):
    """Create user pet request"""

    user_id: str


class UserPet(UserPetBase):
    """
    User's pet instance.

    Pets grow with task completion and evolve at certain levels.
    Hunger/happiness stats encourage regular engagement.
    """

    pet_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    level: int = Field(default=1, ge=1, le=10)
    xp: int = Field(default=0, ge=0)
    hunger: int = Field(default=50, ge=0, le=100)
    happiness: int = Field(default=50, ge=0, le=100)
    evolution_stage: int = Field(default=1, ge=1, le=3)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_fed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    model_config = ConfigDict(
        from_attributes=True, json_encoders={datetime: lambda v: v.isoformat()}
    )

    @field_validator("evolution_stage")
    @classmethod
    def validate_evolution(cls, v: int, info) -> int:
        """Validate evolution stage matches level"""
        level = info.data.get("level", 1)
        if level < 5 and v > 1:
            raise ValueError("Must be level 5+ for teen stage")
        if level < 10 and v > 2:
            raise ValueError("Must be level 10 for adult stage")
        return v

    def calculate_xp_to_next_level(self) -> int:
        """
        Calculate XP required to reach next level.

        Formula: 100 XP per level (simple for ADHD users)
        """
        if self.level >= 10:
            return 0
        return 100

    def get_evolution_stage(self) -> int:
        """
        Get evolution stage based on level.

        - Level 1-4: Baby (stage 1)
        - Level 5-9: Teen (stage 2)
        - Level 10: Adult (stage 3)
        """
        if self.level >= 10:
            return 3
        elif self.level >= 5:
            return 2
        else:
            return 1


class UserPetUpdate(BaseModel):
    """Update user pet fields"""

    level: int | None = Field(None, ge=1, le=10)
    xp: int | None = Field(None, ge=0)
    hunger: int | None = Field(None, ge=0, le=100)
    happiness: int | None = Field(None, ge=0, le=100)
    evolution_stage: int | None = Field(None, ge=1, le=3)
    last_fed_at: datetime | None = None


# ============================================================================
# Pet Feeding Models
# ============================================================================


class FeedPetRequest(BaseModel):
    """Request to feed pet with XP from task completion"""

    xp_earned: int = Field(..., ge=1, description="XP from completed task")


class FeedPetResponse(BaseModel):
    """Response after feeding pet"""

    pet: UserPet
    leveled_up: bool
    evolved: bool
    xp_to_next_level: int
    xp_gained: int
    hunger_restored: int
    happiness_gained: int

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


# ============================================================================
# Pet Species Info
# ============================================================================


class PetSpeciesInfo(BaseModel):
    """Information about a pet species"""

    species: str
    display_name: str
    description: str
    emoji: str
    baby_emoji: str
    teen_emoji: str
    adult_emoji: str


# Available species with display information
PET_SPECIES = [
    PetSpeciesInfo(
        species="dog",
        display_name="Dog",
        description="Loyal and energetic companion",
        emoji="🐕",
        baby_emoji="🐕",
        teen_emoji="🐕",
        adult_emoji="🐺",
    ),
    PetSpeciesInfo(
        species="cat",
        display_name="Cat",
        description="Independent and clever friend",
        emoji="🐈",
        baby_emoji="🐈",
        teen_emoji="🐈",
        adult_emoji="🐆",
    ),
    PetSpeciesInfo(
        species="dragon",
        display_name="Dragon",
        description="Mythical and powerful ally",
        emoji="🐉",
        baby_emoji="🦎",
        teen_emoji="🐲",
        adult_emoji="🐉",
    ),
    PetSpeciesInfo(
        species="owl",
        display_name="Owl",
        description="Wise and observant partner",
        emoji="🦉",
        baby_emoji="🐣",
        teen_emoji="🦉",
        adult_emoji="🦉",
    ),
    PetSpeciesInfo(
        species="fox",
        display_name="Fox",
        description="Crafty and adaptable buddy",
        emoji="🦊",
        baby_emoji="🦊",
        teen_emoji="🦊",
        adult_emoji="🦊",
    ),
]
