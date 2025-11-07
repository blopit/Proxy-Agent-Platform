"""
Tests for UserPetRepository (TDD - RED phase)

Following TDD: Write tests FIRST, then implement repository.
"""

import pytest

from src.core.pet_models import UserPetCreate, UserPetUpdate
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.user_pet_repository import UserPetRepository


@pytest.fixture
def db():
    """Fixture for in-memory test database"""
    db = EnhancedDatabaseAdapter(":memory:")

    # Create user_pets table directly for testing
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE user_pets (
            pet_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL UNIQUE,
            species TEXT NOT NULL,
            name TEXT NOT NULL,
            level INTEGER NOT NULL DEFAULT 1,
            xp INTEGER NOT NULL DEFAULT 0,
            hunger INTEGER NOT NULL DEFAULT 50,
            happiness INTEGER NOT NULL DEFAULT 50,
            evolution_stage INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            last_fed_at TEXT NOT NULL,
            CHECK (level >= 1 AND level <= 10),
            CHECK (hunger >= 0 AND hunger <= 100),
            CHECK (happiness >= 0 AND happiness <= 100),
            CHECK (evolution_stage >= 1 AND evolution_stage <= 3)
        )
    """)
    cursor.execute("CREATE INDEX idx_user_pets_user_id ON user_pets(user_id)")
    conn.commit()

    yield db
    # No close() method on EnhancedDatabaseAdapter


@pytest.fixture
def repository(db):
    """Fixture for UserPetRepository"""
    return UserPetRepository(db)


@pytest.fixture
def sample_pet_data():
    """Fixture for sample pet creation data"""
    return UserPetCreate(user_id="user-123", species="dog", name="Buddy")


# ============================================================================
# CREATE Tests
# ============================================================================


def test_create_pet_with_valid_data(repository, sample_pet_data):
    """Test creating a pet with valid data"""
    pet = repository.create(sample_pet_data)

    assert pet.pet_id is not None
    assert pet.user_id == "user-123"
    assert pet.species == "dog"
    assert pet.name == "Buddy"
    assert pet.level == 1
    assert pet.xp == 0
    assert pet.hunger == 50
    assert pet.happiness == 50
    assert pet.evolution_stage == 1
    assert pet.created_at is not None
    assert pet.last_fed_at is not None


def test_create_pet_generates_unique_id(repository):
    """Test that each pet gets a unique ID"""
    pet1 = repository.create(UserPetCreate(user_id="user-1", species="cat", name="Whiskers"))
    pet2 = repository.create(UserPetCreate(user_id="user-2", species="dog", name="Rex"))

    assert pet1.pet_id != pet2.pet_id


def test_create_pet_fails_for_duplicate_user(repository, sample_pet_data):
    """Test that creating a second pet for same user fails (one pet per user)"""
    # Create first pet
    repository.create(sample_pet_data)

    # Attempt to create second pet for same user
    with pytest.raises(Exception):  # Should raise IntegrityError or similar
        repository.create(UserPetCreate(user_id="user-123", species="cat", name="Mittens"))


def test_create_pet_with_all_species(repository):
    """Test creating pets with all available species"""
    species_list = ["dog", "cat", "dragon", "owl", "fox"]

    for i, species in enumerate(species_list):
        pet = repository.create(UserPetCreate(user_id=f"user-{i}", species=species, name=f"Pet{i}"))
        assert pet.species == species


# ============================================================================
# READ Tests
# ============================================================================


def test_get_by_user_id_returns_pet(repository, sample_pet_data):
    """Test retrieving pet by user_id"""
    created_pet = repository.create(sample_pet_data)
    retrieved_pet = repository.get_by_user_id("user-123")

    assert retrieved_pet is not None
    assert retrieved_pet.pet_id == created_pet.pet_id
    assert retrieved_pet.user_id == "user-123"


def test_get_by_user_id_returns_none_if_no_pet(repository):
    """Test that get_by_user_id returns None if user has no pet"""
    pet = repository.get_by_user_id("nonexistent-user")
    assert pet is None


def test_get_by_id_returns_pet(repository, sample_pet_data):
    """Test retrieving pet by pet_id"""
    created_pet = repository.create(sample_pet_data)
    retrieved_pet = repository.get_by_id(created_pet.pet_id)

    assert retrieved_pet is not None
    assert retrieved_pet.pet_id == created_pet.pet_id


def test_get_by_id_returns_none_if_not_found(repository):
    """Test that get_by_id returns None if pet doesn't exist"""
    pet = repository.get_by_id("nonexistent-id")
    assert pet is None


def test_user_has_pet_returns_true_if_pet_exists(repository, sample_pet_data):
    """Test checking if user has a pet"""
    repository.create(sample_pet_data)
    assert repository.user_has_pet("user-123") is True


def test_user_has_pet_returns_false_if_no_pet(repository):
    """Test checking if user has no pet"""
    assert repository.user_has_pet("user-999") is False


# ============================================================================
# UPDATE Tests
# ============================================================================


def test_update_pet_stats(repository, sample_pet_data):
    """Test updating pet stats"""
    pet = repository.create(sample_pet_data)

    updates = UserPetUpdate(level=5, xp=100, hunger=80, happiness=90, evolution_stage=2)

    updated_pet = repository.update(pet.pet_id, updates)

    assert updated_pet.level == 5
    assert updated_pet.xp == 100
    assert updated_pet.hunger == 80
    assert updated_pet.happiness == 90
    assert updated_pet.evolution_stage == 2


def test_update_partial_fields(repository, sample_pet_data):
    """Test updating only specific fields"""
    pet = repository.create(sample_pet_data)

    # Only update level
    updated_pet = repository.update(pet.pet_id, UserPetUpdate(level=3))

    assert updated_pet.level == 3
    assert updated_pet.xp == 0  # Unchanged
    assert updated_pet.hunger == 50  # Unchanged


def test_update_nonexistent_pet_returns_none(repository):
    """Test updating nonexistent pet returns None"""
    updates = UserPetUpdate(level=5)
    result = repository.update("nonexistent-id", updates)
    assert result is None


# ============================================================================
# FEED PET Tests
# ============================================================================


def test_feed_pet_increases_xp(repository, sample_pet_data):
    """Test that feeding pet increases XP"""
    pet = repository.create(sample_pet_data)

    fed_pet = repository.feed_pet(pet.pet_id, xp_amount=50)

    assert fed_pet.xp == 50
    assert fed_pet.hunger > 50  # Hunger should increase
    assert fed_pet.happiness > 50  # Happiness should increase
    assert fed_pet.last_fed_at > pet.last_fed_at


def test_feed_pet_levels_up_at_100_xp(repository, sample_pet_data):
    """Test that pet levels up when reaching 100 XP"""
    pet = repository.create(sample_pet_data)

    fed_pet = repository.feed_pet(pet.pet_id, xp_amount=100)

    assert fed_pet.level == 2
    assert fed_pet.xp == 0  # XP resets after level up


def test_feed_pet_evolves_at_level_5(repository, sample_pet_data):
    """Test that pet evolves to teen stage at level 5"""
    pet = repository.create(sample_pet_data)

    # Level up to 5
    for _ in range(4):
        pet = repository.feed_pet(pet.pet_id, xp_amount=100)

    assert pet.level == 5
    assert pet.evolution_stage == 2  # Teen stage


def test_feed_pet_evolves_at_level_10(repository, sample_pet_data):
    """Test that pet evolves to adult stage at level 10"""
    pet = repository.create(sample_pet_data)

    # Level up to 10
    for _ in range(9):
        pet = repository.feed_pet(pet.pet_id, xp_amount=100)

    assert pet.level == 10
    assert pet.evolution_stage == 3  # Adult stage


def test_feed_pet_caps_at_level_10(repository, sample_pet_data):
    """Test that pet level caps at 10"""
    pet = repository.create(sample_pet_data)

    # Try to level beyond 10
    for _ in range(15):
        pet = repository.feed_pet(pet.pet_id, xp_amount=100)

    assert pet.level == 10
    assert pet.evolution_stage == 3


# ============================================================================
# HUNGER/HAPPINESS Tests
# ============================================================================


def test_hunger_decreases_over_time(repository, sample_pet_data):
    """Test that hunger can be decreased (simulating time passing)"""
    pet = repository.create(sample_pet_data)

    # Manually decrease hunger
    updated_pet = repository.update(pet.pet_id, UserPetUpdate(hunger=20))

    assert updated_pet.hunger == 20


def test_hunger_and_happiness_bounded(repository, sample_pet_data):
    """Test that hunger and happiness stay within 0-100 bounds"""
    pet = repository.create(sample_pet_data)

    # Try to set above 100 - should raise Pydantic ValidationError
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        UserPetUpdate(hunger=150, happiness=150)


# ============================================================================
# DELETE Tests
# ============================================================================


def test_delete_pet(repository, sample_pet_data):
    """Test deleting a pet"""
    pet = repository.create(sample_pet_data)

    result = repository.delete(pet.pet_id)
    assert result is True

    # Verify pet is gone
    deleted_pet = repository.get_by_id(pet.pet_id)
    assert deleted_pet is None


def test_delete_nonexistent_pet_returns_false(repository):
    """Test deleting nonexistent pet returns False"""
    result = repository.delete("nonexistent-id")
    assert result is False


# ============================================================================
# LIST Tests
# ============================================================================


def test_list_all_pets(repository):
    """Test listing all pets (admin function)"""
    # Create multiple pets
    for i in range(5):
        repository.create(UserPetCreate(user_id=f"user-{i}", species="dog", name=f"Pet{i}"))

    pets = repository.list_all()
    assert len(pets) == 5


def test_list_all_returns_empty_list_if_no_pets(repository):
    """Test listing pets when none exist"""
    pets = repository.list_all()
    assert pets == []
