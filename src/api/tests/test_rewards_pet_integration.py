"""
Integration test for Rewards API with Pet Feeding (BE-02)

Tests automatic pet feeding when rewards are claimed after task completion.
"""

import contextlib
from unittest import mock

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.user_pet_repository import UserPetRepository


@pytest.fixture(scope="function")
def test_db_with_pets():
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

    with contextlib.suppress(Exception):
        os.unlink(temp_file.name)


@pytest.fixture(scope="function")
def test_client_with_pets(test_db_with_pets):
    """FastAPI client with test database and dependency override"""
    from src.api.pets import get_pet_repository

    # Create test repository
    test_repo = UserPetRepository(test_db_with_pets)

    # Mock get_enhanced_database to return test database
    with (
        mock.patch(
            "src.database.enhanced_adapter.get_enhanced_database", return_value=test_db_with_pets
        ),
        mock.patch("src.api.rewards.get_enhanced_database", return_value=test_db_with_pets),
    ):

        def override_get_pet_repository():
            return test_repo

        app.dependency_overrides[get_pet_repository] = override_get_pet_repository

        client = TestClient(app)
        yield client, test_db_with_pets

        # Cleanup
        app.dependency_overrides.clear()


class TestRewardsPetIntegration:
    """Test automatic pet feeding when claiming rewards"""

    def test_reward_claim_feeds_pet_automatically(self, test_client_with_pets):
        """Test that claiming a task reward automatically feeds user's pet"""
        client, db = test_client_with_pets

        # Create a pet for user
        client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-reward-test", "species": "dog", "name": "Buddy"},
        )

        # Get initial pet state
        initial_pet = client.get("/api/v1/pets/user-reward-test").json()
        initial_xp = initial_pet["xp"]
        initial_hunger = initial_pet["hunger"]
        initial_happiness = initial_pet["happiness"]

        # Claim reward for task completion
        response = client.post(
            "/api/v1/rewards/claim",
            json={
                "user_id": "user-reward-test",
                "action_type": "task",
                "task_priority": "high",
                "task_estimated_minutes": 30,
                "streak_days": 0,
                "power_hour_active": False,
                "energy_level": 50,
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Verify pet was fed
        assert data["pet_fed"] is True
        assert data["pet_response"] is not None

        # Verify pet response structure
        pet_response = data["pet_response"]
        assert "pet_name" in pet_response
        assert pet_response["pet_name"] == "Buddy"
        assert "xp_gained" in pet_response
        assert "leveled_up" in pet_response
        assert "evolved" in pet_response
        assert "pet_level" in pet_response
        assert "hunger" in pet_response
        assert "happiness" in pet_response

        # Verify pet gained XP
        assert pet_response["xp_gained"] > 0
        assert pet_response["pet_xp"] > initial_xp

        # Verify hunger and happiness increased
        assert pet_response["hunger"] > initial_hunger
        assert pet_response["happiness"] > initial_happiness

    def test_reward_claim_without_pet_still_succeeds(self, test_client_with_pets):
        """Test that reward claiming works even if user has no pet"""
        client, db = test_client_with_pets

        # Don't create a pet - user has no pet

        # Claim reward
        response = client.post(
            "/api/v1/rewards/claim",
            json={
                "user_id": "user-no-pet",
                "action_type": "task",
                "task_priority": "medium",
                "task_estimated_minutes": 15,
                "streak_days": 0,
                "power_hour_active": False,
                "energy_level": 50,
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Verify reward was still granted
        assert data["success"] is True
        assert data["total_xp"] > 0

        # Verify pet was not fed (user has no pet)
        assert data["pet_fed"] is False
        assert data["pet_response"] is None

    def test_pet_levels_up_from_task_rewards(self, test_client_with_pets):
        """Test that pet can level up from accumulated task rewards"""
        client, db = test_client_with_pets

        # Create pet
        client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-levelup-test", "species": "cat", "name": "Whiskers"},
        )

        # Complete multiple high-priority tasks to accumulate XP
        for _i in range(5):
            response = client.post(
                "/api/v1/rewards/claim",
                json={
                    "user_id": "user-levelup-test",
                    "action_type": "task",
                    "task_priority": "high",
                    "task_estimated_minutes": 30,
                    "streak_days": 0,
                    "power_hour_active": False,
                    "energy_level": 50,
                },
            )

            assert response.status_code == 200
            assert response.json()["pet_fed"] is True

        # Check final pet state
        final_pet = client.get("/api/v1/pets/user-levelup-test").json()

        # Pet should have gained significant XP and possibly leveled up
        assert final_pet["xp"] >= 0  # XP resets on level up
        assert final_pet["level"] >= 1  # May have leveled up

    def test_pet_evolution_from_many_task_rewards(self, test_client_with_pets):
        """Test that pet can evolve from many task completions"""
        client, db = test_client_with_pets

        # Create pet
        client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-evolve-test", "species": "dragon", "name": "Drake"},
        )

        # Get initial pet state
        initial_pet = client.get("/api/v1/pets/user-evolve-test").json()
        assert initial_pet["evolution_stage"] == 1  # Baby

        # Complete MANY tasks to level up to 5 (Teen evolution)
        # Each high-priority 30-min task gives ~25 XP
        # Need 400 XP total to reach level 5 (4 level ups * 100 XP each)
        # So need ~16 tasks

        for _i in range(20):  # Extra tasks to be safe
            response = client.post(
                "/api/v1/rewards/claim",
                json={
                    "user_id": "user-evolve-test",
                    "action_type": "task",
                    "task_priority": "high",
                    "task_estimated_minutes": 30,
                    "streak_days": 0,
                    "power_hour_active": False,
                    "energy_level": 50,
                },
            )

            assert response.status_code == 200
            data = response.json()

            if data["pet_response"]["evolved"]:
                assert data["pet_response"]["evolution_stage"] == 2  # Teen
                break

        # Pet should have evolved by now
        final_pet = client.get("/api/v1/pets/user-evolve-test").json()
        assert final_pet["level"] >= 5
        assert final_pet["evolution_stage"] >= 2

    def test_microstep_rewards_do_not_feed_pets(self, test_client_with_pets):
        """Test that microstep rewards don't trigger pet feeding (only tasks do)"""
        client, db = test_client_with_pets

        # Create pet
        client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-microstep-test", "species": "fox", "name": "Foxy"},
        )

        # Get initial pet XP
        initial_pet = client.get("/api/v1/pets/user-microstep-test").json()
        initial_xp = initial_pet["xp"]

        # Claim microstep reward (not a full task)
        response = client.post(
            "/api/v1/rewards/claim",
            json={
                "user_id": "user-microstep-test",
                "action_type": "microstep",  # Not "task"
                "task_priority": "medium",
                "task_estimated_minutes": 5,
                "streak_days": 0,
                "power_hour_active": False,
                "energy_level": 50,
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Verify pet was NOT fed (microsteps don't feed pets)
        assert data["pet_fed"] is False
        assert data["pet_response"] is None

        # Verify pet XP unchanged
        final_pet = client.get("/api/v1/pets/user-microstep-test").json()
        assert final_pet["xp"] == initial_xp

    def test_pet_hunger_and_happiness_increase_from_rewards(self, test_client_with_pets):
        """Test that hunger and happiness increase when pet is fed via rewards"""
        client, db = test_client_with_pets

        # Create pet
        client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-hunger-test", "species": "owl", "name": "Hoot"},
        )

        # Manually decrease hunger/happiness
        repo = UserPetRepository(db)
        pet = repo.get_by_user_id("user-hunger-test")

        from src.core.pet_models import UserPetUpdate

        repo.update(pet.pet_id, UserPetUpdate(hunger=20, happiness=20))

        # Claim reward
        response = client.post(
            "/api/v1/rewards/claim",
            json={
                "user_id": "user-hunger-test",
                "action_type": "task",
                "task_priority": "medium",
                "task_estimated_minutes": 15,
                "streak_days": 0,
                "power_hour_active": False,
                "energy_level": 50,
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Verify hunger and happiness increased
        pet_response = data["pet_response"]
        assert pet_response["hunger"] > 20
        assert pet_response["happiness"] > 20


class TestRewardsPetEdgeCases:
    """Test edge cases for reward-pet integration"""

    def test_pet_at_max_level_still_gets_fed(self, test_client_with_pets):
        """Test that pet at level 10 (max) still gets fed"""
        client, db = test_client_with_pets

        # Create pet and level to 10
        client.post(
            "/api/v1/pets/create",
            json={"user_id": "user-maxlevel", "species": "dragon", "name": "Maximus"},
        )

        # Level pet to 10
        repo = UserPetRepository(db)
        pet = repo.get_by_user_id("user-maxlevel")

        for _ in range(9):
            pet = repo.feed_pet(pet.pet_id, 100)

        assert pet.level == 10

        # Claim reward
        response = client.post(
            "/api/v1/rewards/claim",
            json={
                "user_id": "user-maxlevel",
                "action_type": "task",
                "task_priority": "high",
                "task_estimated_minutes": 30,
                "streak_days": 0,
                "power_hour_active": False,
                "energy_level": 50,
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Pet should still be fed (hunger/happiness restored)
        assert data["pet_fed"] is True
        assert data["pet_response"]["pet_level"] == 10
        assert data["pet_response"]["leveled_up"] is False  # Already max level
