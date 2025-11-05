"""
Tests for UserPetService (TDD - RED phase)

Following TDD: Write tests FIRST, then implement service.
"""

import pytest
from unittest.mock import Mock, MagicMock
from datetime import datetime, timezone
from uuid import uuid4

from src.core.pet_models import (
    UserPet, UserPetCreate, FeedPetRequest, FeedPetResponse, PET_SPECIES
)
from src.services.user_pet_service import (
    UserPetService, PetServiceError, UserAlreadyHasPetError, UserHasNoPetError
)


@pytest.fixture
def mock_pet_repo():
    """Mock UserPetRepository"""
    return Mock()


@pytest.fixture
def service(mock_pet_repo):
    """UserPetService with mocked dependencies"""
    return UserPetService(pet_repo=mock_pet_repo)


@pytest.fixture
def sample_pet():
    """Sample UserPet for testing"""
    return UserPet(
        pet_id="pet-123",
        user_id="user-456",
        species="dog",
        name="Buddy",
        level=1,
        xp=0,
        hunger=50,
        happiness=50,
        evolution_stage=1,
        created_at=datetime.now(timezone.utc),
        last_fed_at=datetime.now(timezone.utc)
    )


# ============================================================================
# CREATE PET Tests
# ============================================================================


def test_create_pet_with_valid_data(service, mock_pet_repo, sample_pet):
    """Test creating a pet with valid species and name"""
    mock_pet_repo.user_has_pet.return_value = False
    mock_pet_repo.create.return_value = sample_pet

    result = service.create_pet(
        user_id="user-456",
        species="dog",
        name="Buddy"
    )

    assert result == sample_pet
    mock_pet_repo.user_has_pet.assert_called_once_with("user-456")
    mock_pet_repo.create.assert_called_once()


def test_create_pet_fails_if_user_already_has_pet(service, mock_pet_repo):
    """Test that creating second pet for user fails"""
    mock_pet_repo.user_has_pet.return_value = True

    with pytest.raises(UserAlreadyHasPetError) as exc_info:
        service.create_pet(user_id="user-456", species="dog", name="Rex")

    assert "user-456" in str(exc_info.value)
    mock_pet_repo.create.assert_not_called()


def test_create_pet_validates_species(service, mock_pet_repo):
    """Test that invalid species is rejected"""
    mock_pet_repo.user_has_pet.return_value = False

    with pytest.raises(ValueError) as exc_info:
        service.create_pet(user_id="user-456", species="unicorn", name="Sparkle")

    assert "Invalid species" in str(exc_info.value)
    mock_pet_repo.create.assert_not_called()


def test_create_pet_validates_name_length(service, mock_pet_repo):
    """Test that name length is validated"""
    mock_pet_repo.user_has_pet.return_value = False

    with pytest.raises(ValueError) as exc_info:
        service.create_pet(user_id="user-456", species="dog", name="")

    assert "Name" in str(exc_info.value)
    mock_pet_repo.create.assert_not_called()


# ============================================================================
# GET PET Tests
# ============================================================================


def test_get_user_pet_returns_pet(service, mock_pet_repo, sample_pet):
    """Test getting user's pet"""
    mock_pet_repo.get_by_user_id.return_value = sample_pet

    result = service.get_user_pet("user-456")

    assert result == sample_pet
    mock_pet_repo.get_by_user_id.assert_called_once_with("user-456")


def test_get_user_pet_returns_none_if_no_pet(service, mock_pet_repo):
    """Test getting pet when user has none"""
    mock_pet_repo.get_by_user_id.return_value = None

    result = service.get_user_pet("user-999")

    assert result is None


def test_get_user_pet_required_raises_if_no_pet(service, mock_pet_repo):
    """Test getting pet (required) raises error if none exists"""
    mock_pet_repo.get_by_user_id.return_value = None

    with pytest.raises(UserHasNoPetError) as exc_info:
        service.get_user_pet_required("user-999")

    assert "user-999" in str(exc_info.value)


# ============================================================================
# FEED PET Tests
# ============================================================================


def test_feed_pet_from_task_completion(service, mock_pet_repo, sample_pet):
    """Test feeding pet with XP from task completion"""
    fed_pet = UserPet(**sample_pet.model_dump())
    fed_pet.xp = 50
    fed_pet.hunger = 60
    fed_pet.happiness = 60

    mock_pet_repo.get_by_user_id.return_value = sample_pet
    mock_pet_repo.feed_pet.return_value = fed_pet

    response = service.feed_pet_from_task(
        user_id="user-456",
        task_priority="high",
        task_estimated_minutes=30
    )

    assert isinstance(response, FeedPetResponse)
    assert response.pet == fed_pet
    assert response.xp_gained > 0
    assert response.hunger_restored > 0
    assert response.happiness_gained > 0
    mock_pet_repo.feed_pet.assert_called_once()


def test_feed_pet_calculates_xp_from_priority(service, mock_pet_repo, sample_pet):
    """Test that XP calculation considers task priority"""
    mock_pet_repo.get_by_user_id.return_value = sample_pet

    # Mock feed_pet to capture xp_amount
    def capture_xp(pet_id, xp_amount):
        fed_pet = UserPet(**sample_pet.model_dump())
        fed_pet.xp = xp_amount
        return fed_pet

    mock_pet_repo.feed_pet.side_effect = capture_xp

    # High priority should give more XP than low
    service.feed_pet_from_task("user-456", "high", 10)
    high_xp_call = mock_pet_repo.feed_pet.call_args[0][1]

    mock_pet_repo.feed_pet.reset_mock()

    service.feed_pet_from_task("user-456", "low", 10)
    low_xp_call = mock_pet_repo.feed_pet.call_args[0][1]

    assert high_xp_call > low_xp_call


def test_feed_pet_detects_level_up(service, mock_pet_repo, sample_pet):
    """Test that feed response indicates level up"""
    # Pet before feeding
    mock_pet_repo.get_by_user_id.return_value = sample_pet

    # Pet after feeding (leveled up)
    leveled_pet = UserPet(**sample_pet.model_dump())
    leveled_pet.level = 2
    leveled_pet.xp = 0
    mock_pet_repo.feed_pet.return_value = leveled_pet

    response = service.feed_pet_from_task("user-456", "high", 30)

    assert response.leveled_up is True


def test_feed_pet_detects_evolution(service, mock_pet_repo, sample_pet):
    """Test that feed response indicates evolution"""
    # Pet at level 4
    pre_evolution_pet = UserPet(**sample_pet.model_dump())
    pre_evolution_pet.level = 4
    pre_evolution_pet.evolution_stage = 1
    mock_pet_repo.get_by_user_id.return_value = pre_evolution_pet

    # Pet after feeding (evolved to teen)
    evolved_pet = UserPet(**pre_evolution_pet.model_dump())
    evolved_pet.level = 5
    evolved_pet.evolution_stage = 2
    mock_pet_repo.feed_pet.return_value = evolved_pet

    response = service.feed_pet_from_task("user-456", "high", 30)

    assert response.evolved is True


def test_feed_pet_fails_if_user_has_no_pet(service, mock_pet_repo):
    """Test that feeding fails if user has no pet"""
    mock_pet_repo.get_by_user_id.return_value = None

    with pytest.raises(UserHasNoPetError):
        service.feed_pet_from_task("user-999", "medium", 15)


# ============================================================================
# CALCULATE XP Tests
# ============================================================================


def test_calculate_xp_base_amount(service):
    """Test base XP calculation"""
    xp = service.calculate_task_xp(priority="medium", estimated_minutes=10)
    assert xp >= 10  # Base XP should be at least 10


def test_calculate_xp_priority_bonus(service):
    """Test that higher priority gives more XP"""
    low_xp = service.calculate_task_xp(priority="low", estimated_minutes=10)
    medium_xp = service.calculate_task_xp(priority="medium", estimated_minutes=10)
    high_xp = service.calculate_task_xp(priority="high", estimated_minutes=10)

    assert high_xp > medium_xp > low_xp


def test_calculate_xp_time_bonus(service):
    """Test that longer tasks give more XP"""
    short_xp = service.calculate_task_xp(priority="medium", estimated_minutes=5)
    long_xp = service.calculate_task_xp(priority="medium", estimated_minutes=30)

    assert long_xp > short_xp


# ============================================================================
# PET STATUS Tests
# ============================================================================


def test_get_pet_status_with_level_progress(service, mock_pet_repo, sample_pet):
    """Test getting pet status with level progress"""
    sample_pet.xp = 50
    mock_pet_repo.get_by_user_id.return_value = sample_pet

    status = service.get_pet_status("user-456")

    assert status["pet"] == sample_pet
    assert status["xp_to_next_level"] == 50  # 100 - 50
    assert status["level_progress_percent"] == 50.0  # 50/100


def test_get_pet_status_returns_none_if_no_pet(service, mock_pet_repo):
    """Test getting status when user has no pet"""
    mock_pet_repo.get_by_user_id.return_value = None

    status = service.get_pet_status("user-999")
    assert status is None


# ============================================================================
# LIST SPECIES Tests
# ============================================================================


def test_list_available_species(service):
    """Test listing available pet species"""
    species = service.list_available_species()

    assert len(species) == 5
    assert all(s.species in ["dog", "cat", "dragon", "owl", "fox"] for s in species)
    assert all(hasattr(s, "display_name") for s in species)
    assert all(hasattr(s, "emoji") for s in species)


# ============================================================================
# ERROR HANDLING Tests
# ============================================================================


def test_service_handles_repository_errors(service, mock_pet_repo):
    """Test that service handles repository errors gracefully"""
    mock_pet_repo.create.side_effect = Exception("Database error")
    mock_pet_repo.user_has_pet.return_value = False

    with pytest.raises(PetServiceError) as exc_info:
        service.create_pet("user-456", "dog", "Buddy")

    assert "Failed to create pet" in str(exc_info.value)
