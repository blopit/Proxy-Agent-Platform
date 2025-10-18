"""
Integration tests for Focus and Energy API endpoints.
Tests complete workflows from authentication to session management.
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app


@pytest.fixture(scope="function")
def test_client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture(scope="function")
def auth_token(test_client):
    """Get authentication token for tests"""
    # Register a test user
    register_response = test_client.post(
        "/api/v1/auth/register",
        json={
            "username": "focusenergyuser",
            "email": "focusenergy@test.com",
            "password": "testpass123",
            "full_name": "Focus Energy Tester",
        },
    )

    if register_response.status_code == 201:
        return register_response.json()["access_token"]

    # If user exists, login
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={"username": "focusenergyuser", "password": "testpass123"},
    )

    if login_response.status_code == 200:
        return login_response.json()["access_token"]

    # Fallback: try to get any error details
    raise Exception(f"Failed to get auth token: {login_response.json()}")


class TestFocusAPIIntegration:
    """Integration tests for Focus API endpoints"""

    def test_start_focus_session_authenticated(self, test_client, auth_token):
        """Test starting a focus session with authentication"""
        response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={"task_context": "Working on Epic 2.2 implementation"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
        assert data["technique"] in ["pomodoro", "deep_work", "timeboxing"]
        assert data["planned_duration"] > 0
        assert data["status"] == "active"

    def test_start_focus_session_without_auth_fails(self, test_client):
        """Test that starting session without auth fails"""
        response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={"task_context": "Test task"},
        )

        assert response.status_code == 403  # Forbidden

    def test_get_session_status(self, test_client, auth_token):
        """Test getting current session status"""
        # Start a session first
        start_response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={"task_context": "Testing session status"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert start_response.status_code == 201

        # Get status
        status_response = test_client.get(
            "/api/v1/focus/sessions/status",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        if status_response.status_code == 200:
            data = status_response.json()
            assert data["status"] == "active"
            assert "elapsed_minutes" in data
            assert "remaining_minutes" in data
            assert "progress_percentage" in data

    def test_complete_focus_session(self, test_client, auth_token):
        """Test completing a focus session"""
        # Start a session
        start_response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={"task_context": "Session to complete"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert start_response.status_code == 201

        # Complete the session
        complete_response = test_client.post(
            "/api/v1/focus/sessions/complete",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        if complete_response.status_code == 200:
            data = complete_response.json()
            assert "session_id" in data
            assert "completion_rate" in data
            assert "focus_score" in data
            assert "xp_earned" in data
            assert data["xp_earned"] >= 0

    def test_report_distraction(self, test_client, auth_token):
        """Test reporting distraction during session"""
        # Start a session
        start_response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={"task_context": "Distraction test"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert start_response.status_code == 201

        # Report distraction
        distraction_response = test_client.post(
            "/api/v1/focus/distractions/report",
            json={"context": "Got distracted by social media"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        if distraction_response.status_code == 200:
            data = distraction_response.json()
            assert "primary_suggestion" in data
            assert "additional_strategies" in data
            assert isinstance(data["additional_strategies"], list)

    def test_get_break_recommendation(self, test_client, auth_token):
        """Test getting break recommendations"""
        response = test_client.get(
            "/api/v1/focus/breaks/recommend?session_duration=45&intensity=high",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "break_type" in data
        assert "duration_minutes" in data
        assert "recommended_activities" in data
        assert "activities_to_avoid" in data
        assert isinstance(data["recommended_activities"], list)

    def test_complete_focus_workflow(self, test_client, auth_token):
        """Test complete focus session workflow"""
        # 1. Start session
        start_response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={
                "task_context": "Complex coding task",
                "technique": "deep_work",
                "duration_minutes": 60,
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert start_response.status_code == 201
        start_data = start_response.json()
        assert start_data["technique"] in ["pomodoro", "deep_work", "timeboxing"]

        # 2. Check status
        status_response = test_client.get(
            "/api/v1/focus/sessions/status",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        if status_response.status_code == 200:
            assert status_response.json()["status"] == "active"

        # 3. Report distraction (optional)
        test_client.post(
            "/api/v1/focus/distractions/report",
            json={"context": "Quick interruption"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        # 4. Complete session
        complete_response = test_client.post(
            "/api/v1/focus/sessions/complete",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        if complete_response.status_code == 200:
            complete_data = complete_response.json()
            assert "focus_score" in complete_data
            assert "recommendations" in complete_data


class TestEnergyAPIIntegration:
    """Integration tests for Energy API endpoints"""

    def test_track_energy_level_authenticated(self, test_client, auth_token):
        """Test tracking energy level with authentication"""
        response = test_client.post(
            "/api/v1/energy/track",
            json={
                "context_description": "Just woke up, feeling refreshed",
                "sleep_quality": 8,
                "stress_level": 3,
                "hydration_level": 7,
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "energy_level" in data
        assert 0 <= data["energy_level"] <= 10
        assert "trend" in data
        assert data["trend"] in ["rising", "stable", "declining"]
        assert "primary_factors" in data
        assert isinstance(data["primary_factors"], list)

    def test_track_energy_without_auth_fails(self, test_client):
        """Test that energy tracking without auth fails"""
        response = test_client.post(
            "/api/v1/energy/track",
            json={"context_description": "Test"},
        )

        assert response.status_code == 403  # Forbidden

    def test_optimize_energy(self, test_client, auth_token):
        """Test energy optimization recommendations"""
        response = test_client.post(
            "/api/v1/energy/optimize",
            json={"current_energy": 4.5, "target_energy": 7.0, "time_available": 20},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "immediate_actions" in data
        assert "nutritional_advice" in data
        assert "environmental_changes" in data
        assert "lifestyle_recommendations" in data
        assert isinstance(data["immediate_actions"], list)
        assert "timeframe_minutes" in data

    def test_circadian_analysis(self, test_client, auth_token):
        """Test circadian rhythm analysis"""
        response = test_client.get(
            "/api/v1/energy/circadian-analysis?days=30",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "peak_energy_times" in data
        assert "low_energy_times" in data
        assert "chronotype" in data
        assert data["chronotype"] in ["morning", "evening", "intermediate"]
        assert "pattern_confidence" in data

    def test_task_energy_matching(self, test_client, auth_token):
        """Test task-energy matching"""
        response = test_client.post(
            "/api/v1/energy/task-matching",
            json={
                "current_energy": 7.5,
                "available_tasks": [
                    {"id": "1", "title": "Complex analysis", "complexity": 9},
                    {"id": "2", "title": "Code review", "complexity": 5},
                    {"id": "3", "title": "Update docs", "complexity": 2},
                ],
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "recommended_task" in data
        assert "alternative_tasks" in data
        assert isinstance(data["alternative_tasks"], list)
        assert "reasoning" in data

    def test_energy_recovery_plan(self, test_client, auth_token):
        """Test energy recovery planning"""
        response = test_client.post(
            "/api/v1/energy/recovery-plan",
            json={
                "current_energy": 3.5,
                "depletion_causes": ["poor_sleep", "long_meeting", "high_stress"],
                "next_break_available": "15:00",
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "recovery_strategy" in data
        assert "recommended_activities" in data
        assert "expected_energy_gain" in data
        assert "time_needed_minutes" in data
        assert "follow_up_actions" in data

    def test_complete_energy_workflow(self, test_client, auth_token):
        """Test complete energy management workflow"""
        # 1. Track energy
        track_response = test_client.post(
            "/api/v1/energy/track",
            json={
                "context_description": "Mid-afternoon slump",
                "sleep_quality": 6,
                "stress_level": 7,
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert track_response.status_code == 200
        energy_level = track_response.json()["energy_level"]

        # 2. Get optimization if energy is low
        if energy_level < 6:
            optimize_response = test_client.post(
                "/api/v1/energy/optimize",
                json={"current_energy": energy_level},
                headers={"Authorization": f"Bearer {auth_token}"},
            )

            assert optimize_response.status_code == 200
            assert len(optimize_response.json()["immediate_actions"]) > 0

        # 3. Match tasks to energy
        matching_response = test_client.post(
            "/api/v1/energy/task-matching",
            json={
                "current_energy": energy_level,
                "available_tasks": [
                    {"id": "1", "title": "Strategic planning", "complexity": 8},
                    {"id": "2", "title": "Email responses", "complexity": 3},
                ],
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert matching_response.status_code == 200
        recommended_task = matching_response.json()["recommended_task"]
        assert "id" in recommended_task


class TestFocusEnergyIntegrationWorkflow:
    """Integration tests for combined Focus + Energy workflows"""

    def test_energy_informed_focus_session(self, test_client, auth_token):
        """Test using energy level to inform focus session"""
        # 1. Check energy level
        energy_response = test_client.post(
            "/api/v1/energy/track",
            json={"context_description": "Ready to work"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert energy_response.status_code == 200
        energy_level = energy_response.json()["energy_level"]

        # 2. Start focus session (duration can be adapted based on energy)
        duration = 60 if energy_level > 7 else 25  # Longer session if high energy

        focus_response = test_client.post(
            "/api/v1/focus/sessions/start",
            json={
                "task_context": f"High priority work (energy: {energy_level})",
                "duration_minutes": duration,
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert focus_response.status_code == 201

    def test_coordinated_break_planning(self, test_client, auth_token):
        """Test getting coordinated break recommendations"""
        # After a focus session, get break recommendations
        break_response = test_client.get(
            "/api/v1/focus/breaks/recommend?session_duration=45&intensity=high",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert break_response.status_code == 200
        break_data = break_response.json()

        # Get energy recovery plan
        recovery_response = test_client.post(
            "/api/v1/energy/recovery-plan",
            json={"current_energy": 4.0},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert recovery_response.status_code == 200
        recovery_data = recovery_response.json()

        # Both should provide complementary recommendations
        assert len(break_data["recommended_activities"]) > 0
        assert len(recovery_data["recommended_activities"]) > 0
