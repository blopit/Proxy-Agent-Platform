"""
TDD Tests for Focus & Energy Proxy Agents

Following Epic 2.2 requirements:
- Focus session management with Pomodoro technique
- Energy level tracking and optimization
- Distraction monitoring and intervention
- Productivity rhythm analysis
- Context-aware focus recommendations
"""

from datetime import datetime
from unittest.mock import Mock, patch

import pytest

from src.core.models import AgentRequest


class TestFocusProxyAgent:
    """Test advanced focus session management"""

    @pytest.fixture
    def agent(self):
        """Create focus proxy agent for testing"""
        from src.agents.focus_proxy_advanced import AdvancedFocusAgent

        mock_db = Mock()
        mock_session_repo = Mock()
        mock_task_repo = Mock()

        agent = AdvancedFocusAgent(
            db=mock_db, session_repo=mock_session_repo, task_repo=mock_task_repo
        )
        return agent

    @pytest.mark.asyncio
    async def test_start_pomodoro_session(self, agent):
        """Test starting a standard Pomodoro session"""
        # Arrange
        request = AgentRequest(
            query="start focus session for coding",
            user_id="user123",
            session_id="session456",
            agent_type="focus",
        )

        # Act
        with patch.object(agent, "_create_focus_session") as mock_create:
            mock_create.return_value = {
                "session_id": "focus_123",
                "duration": 25,
                "technique": "pomodoro",
                "task_focus": "coding",
            }

            response = await agent.start_focus_session(request)

            # Assert
            assert "session_id" in response
            assert response["duration"] == 25
            assert response["technique"] == "pomodoro"
            mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_adaptive_session_duration(self, agent):
        """Test that session duration adapts based on user patterns"""
        # Arrange
        user_id = "user123"
        task_complexity = "high"

        # Act
        with patch.object(agent, "_analyze_optimal_duration") as mock_analyze:
            mock_analyze.return_value = {
                "recommended_duration": 45,
                "confidence": 0.8,
                "reason": "Complex task + user preference for longer sessions",
            }

            duration_rec = await agent.recommend_session_duration(user_id, task_complexity)

            # Assert
            assert duration_rec["recommended_duration"] == 45
            assert duration_rec["confidence"] > 0.7
            mock_analyze.assert_called_once_with(user_id, task_complexity)

    @pytest.mark.asyncio
    async def test_distraction_detection(self, agent):
        """Test automatic distraction detection and intervention"""
        # Arrange
        session_id = "focus_123"
        activity_data = {
            "app_switches": 5,
            "typing_pattern": "irregular",
            "mouse_movement": "frequent_tabs",
        }

        # Act
        with patch.object(agent, "_analyze_focus_quality") as mock_analyze:
            mock_analyze.return_value = {
                "distraction_level": 0.7,
                "primary_distractors": ["social_media", "email"],
                "intervention_needed": True,
            }

            distraction_analysis = await agent.detect_distractions(session_id, activity_data)

            # Assert
            assert distraction_analysis["distraction_level"] > 0.5
            assert distraction_analysis["intervention_needed"] is True
            assert "social_media" in distraction_analysis["primary_distractors"]

    @pytest.mark.asyncio
    async def test_focus_session_completion(self, agent):
        """Test focus session completion with analytics"""
        # Arrange
        session_id = "focus_123"
        completion_data = {
            "actual_duration": 23,
            "planned_duration": 25,
            "distraction_count": 2,
            "task_progress": 0.8,
        }

        # Mock an active session
        from src.agents.focus_proxy_advanced import FocusSessionConfig

        mock_config = FocusSessionConfig(
            duration=25,
            technique="pomodoro",
            break_duration=5,
            long_break_frequency=4,
            distraction_tolerance=0.3,
            interruption_policy="adaptive",
        )
        agent.active_sessions[session_id] = {
            "user_id": "user123",
            "config": mock_config,
            "start_time": datetime.now(),
            "distractions": [],
        }

        # Act
        with patch.object(agent, "_calculate_session_metrics") as mock_metrics:
            mock_metrics.return_value = {
                "completion_rate": 0.92,
                "focus_score": 0.85,
                "productivity_rating": 4.2,
                "recommendations": ["Reduce notifications", "Use website blocker"],
            }

            session_result = await agent.complete_focus_session(session_id, completion_data)

            # Assert
            assert session_result["completion_rate"] > 0.9
            assert session_result["focus_score"] > 0.8
            assert len(session_result["recommendations"]) > 0

    @pytest.mark.asyncio
    async def test_break_recommendations(self, agent):
        """Test intelligent break activity recommendations"""
        # Arrange
        session_data = {
            "duration": 25,
            "intensity": "high",
            "screen_time": 25,
            "physical_activity": 0,
        }

        # Act
        with patch.object(agent, "_recommend_break_activities") as mock_recommend:
            mock_recommend.return_value = {
                "type": "active_break",
                "duration": 10,
                "activities": ["walk_outside", "stretch", "hydrate"],
                "avoid": ["screens", "social_media"],
            }

            break_rec = await agent.recommend_break(session_data)

            # Assert
            assert break_rec["type"] == "active_break"
            assert break_rec["duration"] == 10
            assert "walk_outside" in break_rec["activities"]
            assert "screens" in break_rec["avoid"]


class TestEnergyProxyAgent:
    """Test energy level tracking and optimization"""

    @pytest.fixture
    def agent(self):
        """Create energy proxy agent for testing"""
        from src.agents.energy_proxy_advanced import AdvancedEnergyAgent

        mock_db = Mock()
        mock_energy_repo = Mock()
        mock_metrics_repo = Mock()

        agent = AdvancedEnergyAgent(
            db=mock_db, energy_repo=mock_energy_repo, metrics_repo=mock_metrics_repo
        )
        return agent

    @pytest.mark.asyncio
    async def test_energy_level_tracking(self, agent):
        """Test continuous energy level monitoring"""
        # Arrange
        user_id = "user123"
        context_data = {
            "time_of_day": "14:00",
            "last_meal": "12:30",
            "sleep_quality": 7,
            "recent_activity": "meeting",
        }

        # Act
        with patch.object(agent, "_assess_current_energy") as mock_assess:
            mock_assess.return_value = {
                "energy_level": 6.5,
                "trend": "declining",
                "factors": ["post_lunch_dip", "meeting_fatigue"],
                "predicted_next_hour": 5.8,
            }

            energy_status = await agent.track_energy_level(user_id, context_data)

            # Assert
            assert energy_status["energy_level"] == 6.5
            assert energy_status["trend"] == "declining"
            assert "post_lunch_dip" in energy_status["factors"]

    @pytest.mark.asyncio
    async def test_energy_optimization_recommendations(self, agent):
        """Test personalized energy optimization suggestions"""
        # Arrange
        user_id = "user123"
        current_energy = 4.2
        upcoming_tasks = ["important_presentation", "code_review"]

        # Act
        with patch.object(agent, "_generate_energy_optimization") as mock_optimize:
            mock_optimize.return_value = {
                "immediate_actions": ["take_10_min_walk", "drink_water", "deep_breathing"],
                "nutritional_advice": ["protein_snack", "avoid_sugar"],
                "environmental_changes": ["increase_lighting", "reduce_noise"],
                "timeline": "15_minutes",
            }

            optimization = await agent.optimize_energy(user_id, current_energy, upcoming_tasks)

            # Assert
            assert len(optimization["immediate_actions"]) >= 3
            assert "protein_snack" in optimization["nutritional_advice"]
            assert optimization["timeline"] == "15_minutes"

    @pytest.mark.asyncio
    async def test_circadian_rhythm_analysis(self, agent):
        """Test analysis of user's natural energy patterns"""
        # Arrange
        user_id = "user123"
        historical_data = [
            {"timestamp": "09:00", "energy": 8.5, "productivity": 9.0},
            {"timestamp": "14:00", "energy": 5.0, "productivity": 6.0},
            {"timestamp": "19:00", "energy": 7.0, "productivity": 7.5},
        ]

        # Act
        with patch.object(agent, "_analyze_circadian_patterns") as mock_analyze:
            mock_analyze.return_value = {
                "peak_energy_times": ["09:00-11:00", "19:00-21:00"],
                "low_energy_times": ["13:00-15:00"],
                "pattern_confidence": 0.85,
                "recommendations": {
                    "schedule_complex_tasks": "09:00-11:00",
                    "schedule_routine_tasks": "13:00-15:00",
                    "avoid_meetings": "12:00-14:00",
                },
            }

            rhythm_analysis = await agent.analyze_circadian_rhythm(user_id, historical_data)

            # Assert
            assert "09:00-11:00" in rhythm_analysis["peak_energy_times"]
            assert "13:00-15:00" in rhythm_analysis["low_energy_times"]
            assert rhythm_analysis["pattern_confidence"] > 0.8

    @pytest.mark.asyncio
    async def test_energy_task_matching(self, agent):
        """Test matching task complexity to current energy levels"""
        # Arrange
        current_energy = 7.2
        available_tasks = [
            {"id": "1", "title": "Complex algorithm implementation", "complexity": 9},
            {"id": "2", "title": "Code review", "complexity": 5},
            {"id": "3", "title": "Update documentation", "complexity": 3},
        ]

        # Act
        with patch.object(agent, "_match_energy_to_tasks") as mock_match:
            mock_match.return_value = {
                "recommended_task": {
                    "id": "1",
                    "match_score": 0.85,
                    "reason": "High energy level suitable for complex work",
                },
                "alternative_tasks": [
                    {"id": "2", "match_score": 0.65},
                    {"id": "3", "match_score": 0.45},
                ],
            }

            task_match = await agent.match_tasks_to_energy(current_energy, available_tasks)

            # Assert
            assert task_match["recommended_task"]["id"] == "1"
            assert task_match["recommended_task"]["match_score"] > 0.8
            assert len(task_match["alternative_tasks"]) == 2

    @pytest.mark.asyncio
    async def test_energy_recovery_planning(self, agent):
        """Test planning for energy recovery periods"""
        # Arrange
        user_id = "user123"
        energy_depletion_data = {
            "current_level": 3.5,
            "depletion_rate": "high",
            "causes": ["long_meeting", "poor_sleep", "high_stress"],
            "next_break_available": "16:00",
        }

        # Act
        with patch.object(agent, "_plan_energy_recovery") as mock_plan:
            mock_plan.return_value = {
                "recovery_strategy": "active_restoration",
                "activities": ["15_min_meditation", "outdoor_walk", "healthy_snack"],
                "expected_recovery": 2.5,
                "time_needed": 30,
                "follow_up_actions": ["reduce_meeting_load", "improve_sleep_schedule"],
            }

            recovery_plan = await agent.plan_energy_recovery(user_id, energy_depletion_data)

            # Assert
            assert recovery_plan["recovery_strategy"] == "active_restoration"
            assert recovery_plan["expected_recovery"] > 2.0
            assert "meditation" in recovery_plan["activities"][0]


class TestFocusEnergyIntegration:
    """Test integration between Focus and Energy agents"""

    @pytest.fixture
    def focus_agent(self):
        from src.agents.focus_proxy_advanced import AdvancedFocusAgent

        return AdvancedFocusAgent(Mock())

    @pytest.fixture
    def energy_agent(self):
        from src.agents.energy_proxy_advanced import AdvancedEnergyAgent

        return AdvancedEnergyAgent(Mock())

    @pytest.mark.asyncio
    async def test_energy_informed_focus_sessions(self, focus_agent, energy_agent):
        """Test that focus sessions adapt based on energy levels"""
        # Arrange
        user_id = "user123"
        current_energy = 8.5

        # Act
        with patch.object(energy_agent, "track_energy_level") as mock_energy:
            with patch.object(focus_agent, "recommend_session_duration") as mock_duration:
                mock_energy.return_value = {"energy_level": current_energy}
                mock_duration.return_value = {"recommended_duration": 45}

                # High energy should recommend longer sessions
                energy_data = await energy_agent.track_energy_level(user_id, {})
                duration_rec = await focus_agent.recommend_session_duration(user_id, "high_energy")

                # Assert
                assert energy_data["energy_level"] > 8.0
                assert duration_rec["recommended_duration"] > 25  # Longer than standard Pomodoro

    @pytest.mark.asyncio
    async def test_focus_session_energy_impact(self, focus_agent, energy_agent):
        """Test tracking energy changes during focus sessions"""
        # Arrange
        session_id = "focus_123"
        pre_session_energy = 7.5
        session_intensity = "high"

        # Act
        with patch.object(energy_agent, "_calculate_energy_expenditure") as mock_expenditure:
            mock_expenditure.return_value = {
                "energy_used": 1.8,
                "predicted_post_session": 5.7,
                "recovery_time_needed": 12,
            }

            energy_impact = await energy_agent.calculate_session_impact(
                session_id, pre_session_energy, session_intensity
            )

            # Assert
            assert energy_impact["energy_used"] > 1.0
            assert energy_impact["predicted_post_session"] < pre_session_energy
            assert energy_impact["recovery_time_needed"] > 10

    @pytest.mark.asyncio
    async def test_coordinated_break_planning(self, focus_agent, energy_agent):
        """Test coordinated break planning between agents"""
        # Arrange
        user_id = "user123"
        focus_session_data = {"duration": 45, "intensity": "high"}

        # Act
        with patch.object(focus_agent, "recommend_break") as mock_focus_break:
            with patch.object(energy_agent, "optimize_energy") as mock_energy_opt:
                mock_focus_break.return_value = {"type": "active_break", "duration": 15}
                mock_energy_opt.return_value = {"immediate_actions": ["walk", "hydrate"]}

                focus_break = await focus_agent.recommend_break(focus_session_data)
                energy_actions = await energy_agent.optimize_energy(user_id, 4.0, [])

                # Assert
                assert focus_break["type"] == "active_break"
                assert "walk" in energy_actions["immediate_actions"]
                # Both should recommend complementary activities
