"""
UserPetRepository - Data access layer for user pets (BE-02)

Handles database operations for user pets using enhanced SQLite adapter.
"""

from datetime import UTC, datetime
from uuid import uuid4

from src.core.pet_models import UserPet, UserPetCreate, UserPetUpdate
from src.database.enhanced_adapter import EnhancedDatabaseAdapter


class UserPetRepository:
    """
    Repository for user pet database operations.

    Follows repository pattern with entity-specific primary key (pet_id).
    """

    def __init__(self, db: EnhancedDatabaseAdapter):
        """
        Initialize repository with database adapter.

        Args:
            db: Enhanced database adapter instance
        """
        self.db = db

    # ========================================================================
    # CREATE Operations
    # ========================================================================

    def create(self, pet_data: UserPetCreate) -> UserPet:
        """
        Create a new user pet.

        Args:
            pet_data: Pet creation data

        Returns:
            UserPet: Created pet

        Raises:
            Exception: If user already has a pet (unique constraint)
        """
        pet_id = str(uuid4())
        now = datetime.now(UTC)

        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO user_pets (
                    pet_id, user_id, species, name, level, xp,
                    hunger, happiness, evolution_stage, created_at, last_fed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    pet_id,
                    pet_data.user_id,
                    pet_data.species,
                    pet_data.name,
                    1,  # Default level
                    0,  # Default XP
                    50,  # Default hunger
                    50,  # Default happiness
                    1,  # Default evolution stage (baby)
                    now.isoformat(),
                    now.isoformat(),
                ),
            )
            conn.commit()

            # Retrieve and return created pet
            return self.get_by_id(pet_id)

        except Exception as e:
            conn.rollback()
            raise e

    # ========================================================================
    # READ Operations
    # ========================================================================

    def get_by_id(self, pet_id: str) -> UserPet | None:
        """
        Get pet by pet_id.

        Args:
            pet_id: Pet ID

        Returns:
            UserPet if found, None otherwise
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM user_pets WHERE pet_id = ?", (pet_id,))

        row = cursor.fetchone()
        if row:
            return self._row_to_pet(row)
        return None

    def get_by_user_id(self, user_id: str) -> UserPet | None:
        """
        Get pet by user_id.

        Args:
            user_id: User ID

        Returns:
            UserPet if found, None otherwise
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM user_pets WHERE user_id = ?", (user_id,))

        row = cursor.fetchone()
        if row:
            return self._row_to_pet(row)
        return None

    def user_has_pet(self, user_id: str) -> bool:
        """
        Check if user has a pet.

        Args:
            user_id: User ID

        Returns:
            True if user has pet, False otherwise
        """
        pet = self.get_by_user_id(user_id)
        return pet is not None

    def list_all(self) -> list[UserPet]:
        """
        List all pets (admin function).

        Returns:
            List of all user pets
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM user_pets ORDER BY created_at DESC")

        rows = cursor.fetchall()
        return [self._row_to_pet(row) for row in rows]

    # ========================================================================
    # UPDATE Operations
    # ========================================================================

    def update(self, pet_id: str, updates: UserPetUpdate) -> UserPet | None:
        """
        Update pet fields.

        Args:
            pet_id: Pet ID
            updates: Fields to update

        Returns:
            Updated UserPet if found, None otherwise
        """
        # Get current pet
        pet = self.get_by_id(pet_id)
        if not pet:
            return None

        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Build update query dynamically
        update_fields = []
        values = []

        for field, value in updates.model_dump(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ?")
                if isinstance(value, datetime):
                    values.append(value.isoformat())
                else:
                    values.append(value)

        if not update_fields:
            return pet  # No updates

        values.append(pet_id)

        try:
            cursor.execute(
                f"UPDATE user_pets SET {', '.join(update_fields)} WHERE pet_id = ?", tuple(values)
            )
            conn.commit()

            # Return updated pet
            return self.get_by_id(pet_id)

        except Exception as e:
            conn.rollback()
            raise e

    def feed_pet(self, pet_id: str, xp_amount: int) -> UserPet | None:
        """
        Feed pet with XP from task completion.

        Handles:
        - XP accumulation
        - Level ups (every 100 XP)
        - Evolution (at level 5 and 10)
        - Hunger/happiness restoration

        Args:
            pet_id: Pet ID
            xp_amount: XP to add

        Returns:
            Updated UserPet if found, None otherwise
        """
        pet = self.get_by_id(pet_id)
        if not pet:
            return None

        # Calculate new XP and level
        new_xp = pet.xp + xp_amount
        new_level = pet.level

        # Level up logic (100 XP per level)
        while new_xp >= 100 and new_level < 10:
            new_xp -= 100
            new_level += 1

        # Cap at level 10
        if new_level >= 10:
            new_level = 10
            new_xp = 0  # No overflow XP at max level

        # Determine evolution stage based on level
        new_evolution_stage = self._calculate_evolution_stage(new_level)

        # Restore hunger and happiness
        new_hunger = min(pet.hunger + 10, 100)  # +10 per feeding
        new_happiness = min(pet.happiness + 10, 100)  # +10 per feeding

        # Update pet
        updates = UserPetUpdate(
            level=new_level,
            xp=new_xp,
            hunger=new_hunger,
            happiness=new_happiness,
            evolution_stage=new_evolution_stage,
            last_fed_at=datetime.now(UTC),
        )

        return self.update(pet_id, updates)

    # ========================================================================
    # DELETE Operations
    # ========================================================================

    def delete(self, pet_id: str) -> bool:
        """
        Delete a pet.

        Args:
            pet_id: Pet ID

        Returns:
            True if deleted, False if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("DELETE FROM user_pets WHERE pet_id = ?", (pet_id,))
            conn.commit()

            return cursor.rowcount > 0

        except Exception as e:
            conn.rollback()
            raise e

    # ========================================================================
    # HELPER Methods
    # ========================================================================

    def _row_to_pet(self, row: tuple) -> UserPet:
        """
        Convert database row to UserPet model.

        Args:
            row: Database row tuple

        Returns:
            UserPet instance
        """
        return UserPet(
            pet_id=row[0],
            user_id=row[1],
            species=row[2],
            name=row[3],
            level=row[4],
            xp=row[5],
            hunger=row[6],
            happiness=row[7],
            evolution_stage=row[8],
            created_at=datetime.fromisoformat(row[9]),
            last_fed_at=datetime.fromisoformat(row[10]),
        )

    def _calculate_evolution_stage(self, level: int) -> int:
        """
        Calculate evolution stage based on level.

        Args:
            level: Pet level (1-10)

        Returns:
            Evolution stage (1-3)
        """
        if level >= 10:
            return 3  # Adult
        elif level >= 5:
            return 2  # Teen
        else:
            return 1  # Baby
