"""
UserPetService - Business logic for user pets (BE-02)

Handles pet creation, feeding, XP calculation, and status retrieval.
"""

from typing import Optional
from datetime import datetime, timezone

from src.core.pet_models import (
    UserPet, UserPetCreate, FeedPetRequest, FeedPetResponse, PET_SPECIES
)
from src.repositories.user_pet_repository import UserPetRepository


# ============================================================================
# Custom Exceptions
# ============================================================================


class PetServiceError(Exception):
    """Base exception for pet service errors"""
    pass


class UserAlreadyHasPetError(PetServiceError):
    """Raised when user tries to create second pet"""
    def __init__(self, user_id: str):
        self.user_id = user_id
        super().__init__(f"User {user_id} already has a pet")


class UserHasNoPetError(PetServiceError):
    """Raised when operation requires pet but user has none"""
    def __init__(self, user_id: str):
        self.user_id = user_id
        super().__init__(f"User {user_id} has no pet")


# ============================================================================
# User Pet Service
# ============================================================================


class UserPetService:
    """
    Service for user pet management with dependency injection.

    Handles:
    - Pet creation (one per user)
    - Feeding pets from task completion
    - XP calculation based on task properties
    - Pet status and level progression
    """

    def __init__(self, pet_repo: UserPetRepository):
        """
        Initialize service with injected repository.

        Args:
            pet_repo: UserPetRepository instance
        """
        self.pet_repo = pet_repo

    # ========================================================================
    # CREATE Operations
    # ========================================================================

    def create_pet(self, user_id: str, species: str, name: str) -> UserPet:
        """
        Create a new pet for user.

        Args:
            user_id: User ID
            species: Pet species (dog, cat, dragon, owl, fox)
            name: Pet name

        Returns:
            UserPet: Created pet

        Raises:
            UserAlreadyHasPetError: If user already has a pet
            ValueError: If species is invalid or name is empty
            PetServiceError: If creation fails
        """
        # Check if user already has a pet
        if self.pet_repo.user_has_pet(user_id):
            raise UserAlreadyHasPetError(user_id)

        # Validate species
        valid_species = [s.species for s in PET_SPECIES]
        if species not in valid_species:
            raise ValueError(
                f"Invalid species '{species}'. "
                f"Valid species: {', '.join(valid_species)}"
            )

        # Validate name
        if not name or len(name.strip()) == 0:
            raise ValueError("Name cannot be empty")

        # Create pet
        try:
            pet_data = UserPetCreate(
                user_id=user_id,
                species=species,
                name=name.strip()
            )
            return self.pet_repo.create(pet_data)

        except Exception as e:
            raise PetServiceError(f"Failed to create pet: {str(e)}") from e

    # ========================================================================
    # READ Operations
    # ========================================================================

    def get_user_pet(self, user_id: str) -> Optional[UserPet]:
        """
        Get user's pet (optional).

        Args:
            user_id: User ID

        Returns:
            UserPet if found, None otherwise
        """
        return self.pet_repo.get_by_user_id(user_id)

    def get_user_pet_required(self, user_id: str) -> UserPet:
        """
        Get user's pet (required).

        Args:
            user_id: User ID

        Returns:
            UserPet

        Raises:
            UserHasNoPetError: If user has no pet
        """
        pet = self.pet_repo.get_by_user_id(user_id)
        if not pet:
            raise UserHasNoPetError(user_id)
        return pet

    def get_pet_status(self, user_id: str) -> Optional[dict]:
        """
        Get pet status with level progress.

        Args:
            user_id: User ID

        Returns:
            Dict with pet info and progress, None if no pet
        """
        pet = self.pet_repo.get_by_user_id(user_id)
        if not pet:
            return None

        # Calculate remaining XP to next level
        total_xp_needed = pet.calculate_xp_to_next_level()
        xp_to_next = total_xp_needed - pet.xp if total_xp_needed > 0 else 0
        level_progress = 0.0 if total_xp_needed == 0 else (pet.xp / total_xp_needed) * 100.0

        return {
            "pet": pet,
            "xp_to_next_level": xp_to_next,
            "level_progress_percent": level_progress
        }

    # ========================================================================
    # FEED PET Operations
    # ========================================================================

    def feed_pet_from_task(
        self,
        user_id: str,
        task_priority: str,
        task_estimated_minutes: int
    ) -> FeedPetResponse:
        """
        Feed pet with XP from task completion.

        Args:
            user_id: User ID
            task_priority: Task priority ('low', 'medium', 'high')
            task_estimated_minutes: Estimated task duration in minutes

        Returns:
            FeedPetResponse with updated pet and stats

        Raises:
            UserHasNoPetError: If user has no pet
        """
        # Get user's pet
        pet_before = self.get_user_pet_required(user_id)

        # Calculate XP from task
        xp_earned = self.calculate_task_xp(task_priority, task_estimated_minutes)

        # Feed pet
        pet_after = self.pet_repo.feed_pet(pet_before.pet_id, xp_earned)

        # Detect level up and evolution
        leveled_up = pet_after.level > pet_before.level
        evolved = pet_after.evolution_stage > pet_before.evolution_stage

        # Calculate stats
        xp_to_next = pet_after.calculate_xp_to_next_level()
        hunger_restored = pet_after.hunger - pet_before.hunger
        happiness_gained = pet_after.happiness - pet_before.happiness

        return FeedPetResponse(
            pet=pet_after,
            leveled_up=leveled_up,
            evolved=evolved,
            xp_to_next_level=xp_to_next,
            xp_gained=xp_earned,
            hunger_restored=hunger_restored,
            happiness_gained=happiness_gained
        )

    # ========================================================================
    # XP CALCULATION
    # ========================================================================

    def calculate_task_xp(self, priority: str, estimated_minutes: int) -> int:
        """
        Calculate XP reward for completing a task.

        Formula:
        - Base: 10 XP
        - Priority bonus: low=+1, medium=+3, high=+5
        - Time bonus: +1 per 5 minutes (max +10)

        Args:
            priority: Task priority ('low', 'medium', 'high')
            estimated_minutes: Task estimated duration

        Returns:
            XP amount (10-25 range typically)
        """
        base_xp = 10

        # Priority bonus
        priority_bonuses = {
            "low": 1,
            "medium": 3,
            "high": 5
        }
        priority_bonus = priority_bonuses.get(priority.lower(), 3)  # Default medium

        # Time bonus (max +10)
        time_bonus = min(estimated_minutes // 5, 10)

        total_xp = base_xp + priority_bonus + time_bonus

        return total_xp

    # ========================================================================
    # UTILITY Methods
    # ========================================================================

    def list_available_species(self) -> list:
        """
        List all available pet species.

        Returns:
            List of PetSpeciesInfo
        """
        return PET_SPECIES

    def user_has_pet(self, user_id: str) -> bool:
        """
        Check if user has a pet.

        Args:
            user_id: User ID

        Returns:
            True if user has pet, False otherwise
        """
        return self.pet_repo.user_has_pet(user_id)
