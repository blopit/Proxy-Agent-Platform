"""
Integration tests for Pet API endpoints (BE-02)

Tests complete pet management workflows with real database:
- Pet creation (one per user)
- Feeding pets from task completion
- XP calculation and level progression
- Evolution mechanics
- Error handling
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.user_pet_repository import UserPetRepository


@pytest.fixture(scope="function")
def test_pet_db():
    """Create isolated test database with user_pets table"""
    import os
    import tempfile

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_file.close()

    db = EnhancedDatabaseAdapter(temp_file.name, check_same_thread=False)

    # Create user_pets table
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

    try:
        os.unlink(temp_file.name)
    except Exception:
        pass


@pytest.fixture(scope="function")
def test_pet_client(test_pet_db):
    """FastAPI client with test database and dependency override"""
    from src.api.pets import get_pet_repository

    # Create test repository
    test_repo = UserPetRepository(test_pet_db)

    # Override dependency
    def override_get_pet_repository():
        return test_repo

    app.dependency_overrides[get_pet_repository] = override_get_pet_repository

    client = TestClient(app)
    yield client

    # Cleanup
    app.dependency_overrides.clear()


# ============================================================================
# CREATE PET Tests
# ============================================================================


class TestPetCreation:
    """Tests for POST /api/v1/pets/create"""

    def test_create_pet_with_valid_data(self, test_pet_client, test_pet_db):
        """Test creating a pet with valid species and name"""
        response = test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": "user-123", "species": "dog", "name": "Buddy"}
        )

        assert response.status_code == 201
        data = response.json()

        # Verify response structure
        assert data["pet_id"] is not None
        assert data["user_id"] == "user-123"
        assert data["species"] == "dog"
        assert data["name"] == "Buddy"
        assert data["level"] == 1
        assert data["xp"] == 0
        assert data["hunger"] == 50
        assert data["happiness"] == 50
        assert data["evolution_stage"] == 1

        # Verify database record
        repo = UserPetRepository(test_pet_db)
        db_pet = repo.get_by_user_id("user-123")
        assert db_pet is not None
        assert db_pet.name == "Buddy"

    def test_create_pet_with_all_species(self, test_pet_client):
        """Test creating pets with all 5 species"""
        species_list = ["dog", "cat", "dragon", "owl", "fox"]

        for i, species in enumerate(species_list):
            response = test_pet_client.post(
                "/api/v1/pets/create",
                json={"user_id": f"user-species-{i}", "species": species, "name": f"Pet{i}"},
            )

            assert response.status_code == 201
            assert response.json()["species"] == species

    def test_create_pet_fails_with_invalid_species(self, test_pet_client):
        """Test that invalid species is rejected"""
        response = test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-invalid", "species": "unicorn", "name": "Sparkle"},
        )

        # Pydantic validation happens before service layer
        # So we get 422 (Unprocessable Entity) for validation errors
        assert response.status_code in [400, 422]

    def test_create_pet_fails_with_empty_name(self, test_pet_client):
        """Test that empty name is rejected"""
        response = test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": "user-noname", "species": "dog", "name": ""}
        )

        # Empty names are caught by Pydantic (422) or service layer (400)
        assert response.status_code in [400, 422]

    def test_create_second_pet_fails(self, test_pet_client):
        """Test one pet per user rule"""
        # Create first pet
        response1 = test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-duplicate", "species": "dog", "name": "First"},
        )
        assert response1.status_code == 201

        # Attempt second pet
        response2 = test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-duplicate", "species": "cat", "name": "Second"},
        )

        assert response2.status_code == 400
        assert "already has a pet" in response2.json()["detail"]


# ============================================================================
# GET PET Tests
# ============================================================================


class TestGetPet:
    """Tests for GET /api/v1/pets/{user_id}"""

    def test_get_existing_pet(self, test_pet_client):
        """Test retrieving user's pet"""
        # Create pet
        create_response = test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-get", "species": "cat", "name": "Whiskers"},
        )
        pet_id = create_response.json()["pet_id"]

        # Get pet
        response = test_pet_client.get("/api/v1/pets/user-get")

        assert response.status_code == 200
        data = response.json()
        assert data["pet_id"] == pet_id
        assert data["user_id"] == "user-get"
        assert data["name"] == "Whiskers"

    def test_get_nonexistent_pet_returns_404(self, test_pet_client):
        """Test getting pet for user with no pet"""
        response = test_pet_client.get("/api/v1/pets/user-nonexistent")

        assert response.status_code == 404
        assert "has no pet" in response.json()["detail"]


# ============================================================================
# PET STATUS Tests
# ============================================================================


class TestPetStatus:
    """Tests for GET /api/v1/pets/{user_id}/status"""

    def test_get_pet_status_with_progress(self, test_pet_client, test_pet_db):
        """Test getting pet status with level progress calculation"""
        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-status", "species": "dragon", "name": "Spike"},
        )

        # Feed pet to get 50 XP
        repo = UserPetRepository(test_pet_db)
        pet = repo.get_by_user_id("user-status")
        repo.feed_pet(pet.pet_id, 50)

        # Get status
        response = test_pet_client.get("/api/v1/pets/user-status/status")

        assert response.status_code == 200
        data = response.json()

        # Verify status structure
        assert "pet" in data
        assert "xp_to_next_level" in data
        assert "level_progress_percent" in data

        # Verify calculations
        assert data["pet"]["xp"] == 50
        assert data["xp_to_next_level"] == 50  # 100 - 50
        assert data["level_progress_percent"] == 50.0  # 50/100

    def test_get_status_nonexistent_pet_returns_404(self, test_pet_client):
        """Test getting status for user with no pet"""
        response = test_pet_client.get("/api/v1/pets/user-nostatus/status")

        assert response.status_code == 404


# ============================================================================
# FEED PET Tests
# ============================================================================


class TestFeedPet:
    """Tests for POST /api/v1/pets/feed"""

    def test_feed_pet_with_task_completion(self, test_pet_client):
        """Test feeding pet with XP from task"""
        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": "user-feed", "species": "owl", "name": "Hoot"}
        )

        # Feed pet
        response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={"user_id": "user-feed", "task_priority": "high", "task_estimated_minutes": 30},
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "pet" in data
        assert "xp_gained" in data
        assert "leveled_up" in data
        assert "evolved" in data
        assert "hunger_restored" in data
        assert "happiness_gained" in data

        # Verify XP gained
        assert data["xp_gained"] > 0
        assert data["pet"]["xp"] > 0
        assert data["hunger_restored"] > 0
        assert data["happiness_gained"] > 0

    def test_feed_pet_xp_varies_by_priority(self, test_pet_client):
        """Test that high priority tasks give more XP than low"""
        # Create two pets
        test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": "user-high", "species": "dog", "name": "High"}
        )
        test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": "user-low", "species": "cat", "name": "Low"}
        )

        # Feed with high priority
        high_response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={"user_id": "user-high", "task_priority": "high", "task_estimated_minutes": 10},
        )

        # Feed with low priority
        low_response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={"user_id": "user-low", "task_priority": "low", "task_estimated_minutes": 10},
        )

        high_xp = high_response.json()["xp_gained"]
        low_xp = low_response.json()["xp_gained"]

        assert high_xp > low_xp

    def test_feed_pet_detects_level_up(self, test_pet_client, test_pet_db):
        """Test that feeding triggers level up at 100 XP"""
        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-levelup", "species": "fox", "name": "Foxy"},
        )

        # Get pet and set XP to 95 (just below level up)
        repo = UserPetRepository(test_pet_db)
        pet = repo.get_by_user_id("user-levelup")
        repo.feed_pet(pet.pet_id, 95)

        # Feed with enough XP to level up
        response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={
                "user_id": "user-levelup",
                "task_priority": "high",
                "task_estimated_minutes": 10,
            },
        )

        data = response.json()
        assert data["leveled_up"] is True
        assert data["pet"]["level"] == 2

    def test_feed_pet_detects_evolution(self, test_pet_client, test_pet_db):
        """Test evolution at level 5 (Teen stage)"""
        # Create pet and level to 4
        test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-evolve", "species": "dragon", "name": "Drake"},
        )

        repo = UserPetRepository(test_pet_db)
        pet = repo.get_by_user_id("user-evolve")

        # Level up to 4 (still Baby stage)
        for _ in range(3):
            pet = repo.feed_pet(pet.pet_id, 100)

        assert pet.level == 4
        assert pet.evolution_stage == 1

        # Feed directly with enough XP to reach level 5 (should evolve to Teen)
        pet = repo.feed_pet(pet.pet_id, 100)

        assert pet.level == 5
        assert pet.evolution_stage == 2  # Teen

        # Now test via API that evolved flag is set correctly
        # Feed again to trigger evolution check
        response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={
                "user_id": "user-evolve",
                "task_priority": "high",
                "task_estimated_minutes": 50,
            },
        )

        data = response.json()
        # This feed won't evolve (already at Teen), but should work
        assert data["evolved"] is False  # No new evolution
        assert data["pet"]["level"] >= 5
        assert data["pet"]["evolution_stage"] == 2  # Still Teen

    def test_feed_nonexistent_pet_returns_404(self, test_pet_client):
        """Test feeding pet when user has no pet"""
        response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={
                "user_id": "user-nopet",
                "task_priority": "medium",
                "task_estimated_minutes": 15,
            },
        )

        assert response.status_code == 404
        assert "has no pet" in response.json()["detail"]


# ============================================================================
# SPECIES LIST Tests
# ============================================================================


class TestSpeciesList:
    """Tests for GET /api/v1/pets/species/list"""

    def test_list_available_species(self, test_pet_client):
        """Test listing all available pet species"""
        response = test_pet_client.get("/api/v1/pets/species/list")

        assert response.status_code == 200
        species_list = response.json()

        # Should return 5 species
        assert len(species_list) == 5

        # Verify structure
        for species in species_list:
            assert "species" in species
            assert "display_name" in species
            assert "emoji" in species
            assert "description" in species

        # Verify all species present
        species_names = [s["species"] for s in species_list]
        assert set(species_names) == {"dog", "cat", "dragon", "owl", "fox"}


# ============================================================================
# HAS PET Tests
# ============================================================================


class TestHasPet:
    """Tests for GET /api/v1/pets/user/{user_id}/has-pet"""

    def test_has_pet_returns_true_when_pet_exists(self, test_pet_client):
        """Test checking if user has pet (true case)"""
        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-haspet", "species": "dog", "name": "Buddy"},
        )

        # Check has pet
        response = test_pet_client.get("/api/v1/pets/user/user-haspet/has-pet")

        assert response.status_code == 200
        assert response.json()["has_pet"] is True

    def test_has_pet_returns_false_when_no_pet(self, test_pet_client):
        """Test checking if user has pet (false case)"""
        response = test_pet_client.get("/api/v1/pets/user/user-nopet-check/has-pet")

        assert response.status_code == 200
        assert response.json()["has_pet"] is False


# ============================================================================
# COMPLETE WORKFLOW Tests
# ============================================================================


class TestCompleteWorkflows:
    """End-to-end workflow tests"""

    def test_complete_pet_lifecycle(self, test_pet_client, test_pet_db):
        """Test complete pet lifecycle: create → feed → level up → evolve"""
        user_id = "user-lifecycle"

        # Step 1: Create pet
        create_response = test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": user_id, "species": "dragon", "name": "Smaug"}
        )
        assert create_response.status_code == 201
        assert create_response.json()["level"] == 1
        assert create_response.json()["evolution_stage"] == 1

        # Step 2: Feed multiple times to level up
        for i in range(5):
            feed_response = test_pet_client.post(
                "/api/v1/pets/feed",
                params={"user_id": user_id, "task_priority": "high", "task_estimated_minutes": 30},
            )
            assert feed_response.status_code == 200

        # Step 3: Check pet status
        status_response = test_pet_client.get(f"/api/v1/pets/{user_id}/status")
        status_data = status_response.json()

        # Should have leveled up and possibly evolved
        assert status_data["pet"]["level"] > 1
        assert status_data["pet"]["xp"] >= 0
        assert status_data["pet"]["hunger"] > 50  # Fed multiple times
        assert status_data["pet"]["happiness"] > 50

        # Step 4: Get pet
        get_response = test_pet_client.get(f"/api/v1/pets/{user_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == "Smaug"

        # Step 5: Check has pet
        has_pet_response = test_pet_client.get(f"/api/v1/pets/user/{user_id}/has-pet")
        assert has_pet_response.json()["has_pet"] is True

    def test_level_10_cap(self, test_pet_client, test_pet_db):
        """Test that pet caps at level 10"""
        user_id = "user-maxlevel"

        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": user_id, "species": "owl", "name": "Maximus"}
        )

        # Level to 10 (requires 900 XP total: 9 levels * 100 XP)
        repo = UserPetRepository(test_pet_db)
        pet = repo.get_by_user_id(user_id)

        for _ in range(9):
            pet = repo.feed_pet(pet.pet_id, 100)

        assert pet.level == 10
        assert pet.evolution_stage == 3  # Adult

        # Try to level beyond 10
        final_pet = repo.feed_pet(pet.pet_id, 1000)

        assert final_pet.level == 10  # Still capped
        assert final_pet.evolution_stage == 3

    def test_hunger_and_happiness_restoration(self, test_pet_client, test_pet_db):
        """Test that feeding restores hunger and happiness"""
        user_id = "user-hunger"

        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create", json={"user_id": user_id, "species": "cat", "name": "Hungry"}
        )

        # Manually decrease hunger/happiness
        repo = UserPetRepository(test_pet_db)
        pet = repo.get_by_user_id(user_id)

        from src.core.pet_models import UserPetUpdate

        repo.update(pet.pet_id, UserPetUpdate(hunger=20, happiness=20))

        # Feed pet
        feed_response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={"user_id": user_id, "task_priority": "medium", "task_estimated_minutes": 15},
        )

        data = feed_response.json()
        assert data["hunger_restored"] > 0
        assert data["happiness_gained"] > 0
        assert data["pet"]["hunger"] > 20
        assert data["pet"]["happiness"] > 20


# ============================================================================
# ERROR HANDLING Tests
# ============================================================================


class TestErrorHandling:
    """Test error scenarios and edge cases"""

    def test_invalid_priority_uses_default(self, test_pet_client):
        """Test that invalid priority defaults to medium"""
        # Create pet
        test_pet_client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-priority", "species": "dog", "name": "Priority"},
        )

        # Feed with invalid priority (should default to medium)
        response = test_pet_client.post(
            "/api/v1/pets/feed",
            params={
                "user_id": "user-priority",
                "task_priority": "invalid",
                "task_estimated_minutes": 10,
            },
        )

        # Should not fail, uses default
        assert response.status_code == 200
        assert response.json()["xp_gained"] > 0

    def test_pydantic_validation_on_create(self, test_pet_client):
        """Test that Pydantic validates pet creation data"""
        # Missing required field
        response = test_pet_client.post(
            "/api/v1/pets/create",
            json={
                "user_id": "user-invalid",
                "species": "dog",
                # Missing 'name'
            },
        )

        assert response.status_code == 422  # Unprocessable Entity
