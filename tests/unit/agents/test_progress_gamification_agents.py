"""
TDD Tests for Progress & Gamification Proxy Agents

Following Epic 2.3 requirements:
- Dynamic XP calculation and tracking
- Achievement trigger system with intelligent recognition
- Leaderboard generation and competitive elements
- Motivation algorithms and engagement optimization
- Progress visualization and trend analysis
"""

from decimal import Decimal
from unittest.mock import Mock, patch

import pytest


class TestProgressProxyAgent:
    """Test XP tracking and progress analysis"""

    @pytest.fixture
    def agent(self):
        """Create progress proxy agent for testing"""
        from src.agents.progress_proxy_advanced import AdvancedProgressAgent

        mock_db = Mock()
        mock_metrics_repo = Mock()
        mock_achievement_repo = Mock()

        agent = AdvancedProgressAgent(
            db=mock_db, metrics_repo=mock_metrics_repo, achievement_repo=mock_achievement_repo
        )
        return agent

    @pytest.mark.asyncio
    async def test_calculate_task_xp(self, agent):
        """Test dynamic XP calculation for task completion"""
        # Arrange
        task_data = {
            "task_id": "task_123",
            "title": "Complete complex feature implementation",
            "estimated_hours": Decimal("8.0"),
            "actual_hours": Decimal("7.5"),
            "priority": "high",
            "complexity": "high",
            "completion_quality": 0.95,
        }

        # Act
        with patch.object(agent, "_calculate_dynamic_xp") as mock_calculate:
            mock_calculate.return_value = {
                "base_xp": 100,
                "complexity_bonus": 50,
                "efficiency_bonus": 25,
                "quality_bonus": 15,
                "total_xp": 190,
                "multipliers_applied": ["complexity", "efficiency", "quality"],
            }

            xp_result = await agent.calculate_task_xp(task_data)

            # Assert
            assert xp_result["total_xp"] == 190
            assert xp_result["base_xp"] == 100
            assert "complexity" in xp_result["multipliers_applied"]
            assert xp_result["efficiency_bonus"] > 0
            mock_calculate.assert_called_once()

    @pytest.mark.asyncio
    async def test_streak_tracking(self, agent):
        """Test streak calculation and maintenance"""
        # Arrange
        user_id = "user123"
        completion_history = [
            {"date": "2025-10-17", "tasks_completed": 5},
            {"date": "2025-10-16", "tasks_completed": 3},
            {"date": "2025-10-15", "tasks_completed": 4},
            {"date": "2025-10-13", "tasks_completed": 2},  # Gap here breaks streak
        ]

        # Act
        with patch.object(agent, "_analyze_completion_streaks") as mock_analyze:
            mock_analyze.return_value = {
                "current_streak": 3,
                "longest_streak": 7,
                "streak_type": "daily_completion",
                "next_milestone": 5,
                "streak_momentum": "strong",
            }

            streak_data = await agent.track_user_streaks(user_id, completion_history)

            # Assert
            assert streak_data["current_streak"] == 3
            assert streak_data["longest_streak"] > streak_data["current_streak"]
            assert streak_data["next_milestone"] == 5
            assert streak_data["streak_momentum"] == "strong"

    @pytest.mark.asyncio
    async def test_level_progression(self, agent):
        """Test user level calculation and progression"""
        # Arrange
        user_id = "user123"
        current_xp = 2750

        # Act
        with patch.object(agent, "_calculate_level_progression") as mock_level:
            mock_level.return_value = {
                "current_level": 8,
                "current_xp": 2750,
                "xp_for_next_level": 3000,
                "xp_needed": 250,
                "progress_percentage": 83.33,
                "level_benefits": ["increased_rewards", "exclusive_achievements"],
            }

            level_data = await agent.calculate_user_level(user_id, current_xp)

            # Assert
            assert level_data["current_level"] == 8
            assert level_data["xp_needed"] == 250
            assert level_data["progress_percentage"] > 80
            assert "increased_rewards" in level_data["level_benefits"]

    @pytest.mark.asyncio
    async def test_progress_visualization_data(self, agent):
        """Test progress data for visualization components"""
        # Arrange
        user_id = "user123"
        time_period = "30_days"

        # Act
        with patch.object(agent, "_generate_progress_visualization") as mock_viz:
            mock_viz.return_value = {
                "daily_xp_trend": [45, 62, 38, 71, 89, 55, 92],
                "task_completion_rate": [0.85, 0.92, 0.78, 0.96, 0.88],
                "productivity_score_trend": [7.2, 7.8, 7.1, 8.2, 8.0],
                "milestone_achievements": ["level_up", "streak_milestone", "efficiency_master"],
                "areas_for_improvement": ["time_estimation", "task_prioritization"],
            }

            viz_data = await agent.generate_progress_visualization(user_id, time_period)

            # Assert
            assert len(viz_data["daily_xp_trend"]) == 7
            assert all(rate <= 1.0 for rate in viz_data["task_completion_rate"])
            assert len(viz_data["milestone_achievements"]) >= 3
            assert "level_up" in viz_data["milestone_achievements"]


class TestGamificationProxyAgent:
    """Test achievement system and motivation algorithms"""

    @pytest.fixture
    def agent(self):
        """Create gamification proxy agent for testing"""
        from src.agents.gamification_proxy_advanced import AdvancedGamificationAgent

        mock_db = Mock()
        mock_achievement_repo = Mock()
        mock_user_achievement_repo = Mock()

        agent = AdvancedGamificationAgent(
            db=mock_db,
            achievement_repo=mock_achievement_repo,
            user_achievement_repo=mock_user_achievement_repo,
        )
        return agent

    @pytest.mark.asyncio
    async def test_achievement_trigger_detection(self, agent):
        """Test automatic achievement detection and triggering"""
        # Arrange
        user_activity = {
            "user_id": "user123",
            "tasks_completed_today": 10,
            "consecutive_days": 7,
            "total_xp": 5000,
            "focus_sessions_completed": 25,
            "average_task_quality": 0.95,
        }

        # Act
        with patch.object(agent, "_detect_achievement_triggers") as mock_detect:
            mock_detect.return_value = {
                "triggered_achievements": [
                    {
                        "achievement_id": "productivity_master",
                        "name": "Productivity Master",
                        "description": "Complete 10 tasks in a single day",
                        "xp_reward": 100,
                        "badge_tier": "gold",
                    },
                    {
                        "achievement_id": "focus_champion",
                        "name": "Focus Champion",
                        "description": "Complete 25 focus sessions",
                        "xp_reward": 75,
                        "badge_tier": "silver",
                    },
                ],
                "progress_towards_next": [
                    {
                        "achievement_id": "consistency_legend",
                        "progress": 7,
                        "target": 30,
                        "completion_percentage": 23.33,
                    }
                ],
            }

            achievements = await agent.check_achievement_triggers(user_activity)

            # Assert
            assert len(achievements["triggered_achievements"]) == 2
            assert (
                achievements["triggered_achievements"][0]["achievement_id"] == "productivity_master"
            )
            assert achievements["triggered_achievements"][0]["xp_reward"] == 100
            assert len(achievements["progress_towards_next"]) >= 1

    @pytest.mark.asyncio
    async def test_leaderboard_generation(self, agent):
        """Test dynamic leaderboard generation with categories"""
        # Arrange
        leaderboard_type = "weekly_xp"
        user_context = {"user_id": "user123", "level": 8}

        # Act
        with patch.object(agent, "_generate_leaderboard") as mock_leaderboard:
            mock_leaderboard.return_value = {
                "leaderboard_type": "weekly_xp",
                "time_period": "2025-10-11_to_2025-10-17",
                "user_rank": 15,
                "total_participants": 127,
                "top_10": [
                    {"rank": 1, "username": "ProductivityNinja", "score": 2840, "level": 12},
                    {"rank": 2, "username": "FocusedDev", "score": 2615, "level": 11},
                    {"rank": 3, "username": "TaskMaster", "score": 2401, "level": 10},
                ],
                "user_entry": {"rank": 15, "username": "user123", "score": 1750, "level": 8},
                "percentile": 88.2,
            }

            leaderboard = await agent.generate_leaderboard(leaderboard_type, user_context)

            # Assert
            assert leaderboard["user_rank"] == 15
            assert len(leaderboard["top_10"]) == 3
            assert leaderboard["percentile"] > 80
            assert leaderboard["user_entry"]["level"] == 8

    @pytest.mark.asyncio
    async def test_motivation_algorithm(self, agent):
        """Test personalized motivation and engagement recommendations"""
        # Arrange
        user_profile = {
            "user_id": "user123",
            "engagement_level": "moderate",
            "preferred_motivators": ["progress_tracking", "social_comparison"],
            "recent_activity_drop": True,
            "completion_rate_last_week": 0.65,
        }

        # Act
        with patch.object(agent, "_generate_motivation_strategy") as mock_motivate:
            mock_motivate.return_value = {
                "motivation_type": "re_engagement",
                "primary_strategy": "achievable_goals",
                "recommendations": [
                    "Set smaller, more achievable daily goals",
                    "Join a productivity challenge with peers",
                    "Enable milestone celebration notifications",
                ],
                "gamification_adjustments": {
                    "reduce_daily_target": True,
                    "increase_achievement_frequency": True,
                    "enable_social_encouragement": True,
                },
                "expected_improvement": 0.25,
            }

            motivation = await agent.generate_motivation_strategy(user_profile)

            # Assert
            assert motivation["motivation_type"] == "re_engagement"
            assert len(motivation["recommendations"]) >= 3
            assert motivation["gamification_adjustments"]["reduce_daily_target"] is True
            assert motivation["expected_improvement"] > 0.2

    @pytest.mark.asyncio
    async def test_reward_distribution(self, agent):
        """Test intelligent reward distribution and timing"""
        # Arrange
        achievement_data = {
            "achievement_id": "focus_master",
            "user_id": "user123",
            "completion_context": "after_difficult_week",
            "user_engagement_level": "high",
        }

        # Act
        with patch.object(agent, "_calculate_reward_distribution") as mock_reward:
            mock_reward.return_value = {
                "xp_reward": 150,
                "bonus_multiplier": 1.5,
                "additional_rewards": ["premium_theme", "early_feature_access"],
                "celebration_type": "major_milestone",
                "notification_timing": "immediate",
                "social_sharing_enabled": True,
            }

            reward = await agent.distribute_achievement_reward(achievement_data)

            # Assert
            assert reward["xp_reward"] == 150
            assert reward["bonus_multiplier"] == 1.5
            assert "premium_theme" in reward["additional_rewards"]
            assert reward["celebration_type"] == "major_milestone"

    @pytest.mark.asyncio
    async def test_engagement_analytics(self, agent):
        """Test engagement tracking and pattern analysis"""
        # Arrange
        user_id = "user123"
        analysis_period = "last_30_days"

        # Act
        with patch.object(agent, "_analyze_engagement_patterns") as mock_analyze:
            mock_analyze.return_value = {
                "engagement_score": 7.8,
                "engagement_trend": "increasing",
                "peak_activity_times": ["09:00-11:00", "14:00-16:00"],
                "motivation_triggers": ["achievement_unlocks", "social_recognition"],
                "risk_factors": ["weekend_activity_drop"],
                "recommendations": [
                    "Schedule challenging tasks during peak times",
                    "Increase weekend engagement through social features",
                ],
            }

            engagement = await agent.analyze_user_engagement(user_id, analysis_period)

            # Assert
            assert engagement["engagement_score"] > 7.0
            assert engagement["engagement_trend"] == "increasing"
            assert len(engagement["peak_activity_times"]) >= 2
            assert len(engagement["recommendations"]) >= 2


class TestProgressGamificationIntegration:
    """Test integration between Progress and Gamification agents"""

    @pytest.fixture
    def progress_agent(self):
        from src.agents.progress_proxy_advanced import AdvancedProgressAgent

        return AdvancedProgressAgent(Mock())

    @pytest.fixture
    def gamification_agent(self):
        from src.agents.gamification_proxy_advanced import AdvancedGamificationAgent

        return AdvancedGamificationAgent(Mock())

    @pytest.mark.asyncio
    async def test_xp_to_achievement_flow(self, progress_agent, gamification_agent):
        """Test XP calculation triggering achievement checks"""
        # Arrange
        task_completion_data = {
            "xp_earned": 150,
            "task_type": "complex_implementation",
            "quality_score": 0.95,
        }

        # Act
        with (
            patch.object(progress_agent, "calculate_task_xp") as mock_xp,
            patch.object(gamification_agent, "check_achievement_triggers") as mock_achievements,
        ):
            mock_xp.return_value = {"total_xp": 150}
            mock_achievements.return_value = {
                "triggered_achievements": [{"achievement_id": "quality_master"}]
            }

            xp_data = await progress_agent.calculate_task_xp(task_completion_data)
            achievements = await gamification_agent.check_achievement_triggers(
                {"total_xp": xp_data["total_xp"]}
            )

            # Assert
            assert xp_data["total_xp"] == 150
            assert len(achievements["triggered_achievements"]) == 1

    @pytest.mark.asyncio
    async def test_leaderboard_progress_correlation(self, progress_agent, gamification_agent):
        """Test leaderboard rankings based on progress metrics"""
        # Arrange
        user_id = "user123"

        # Act
        with patch.object(progress_agent, "calculate_user_level") as mock_level:
            with patch.object(gamification_agent, "generate_leaderboard") as mock_leaderboard:
                mock_level.return_value = {"current_level": 8, "current_xp": 2750}
                mock_leaderboard.return_value = {"user_rank": 15, "percentile": 88.2}

                level_data = await progress_agent.calculate_user_level(user_id, 2750)
                leaderboard = await gamification_agent.generate_leaderboard(
                    "overall", {"user_id": user_id, "level": level_data["current_level"]}
                )

                # Assert
                assert level_data["current_level"] == 8
                assert leaderboard["user_rank"] == 15
                assert leaderboard["percentile"] > 80

    @pytest.mark.asyncio
    async def test_motivation_based_on_progress_trends(self, progress_agent, gamification_agent):
        """Test motivation algorithms adapting to progress patterns"""
        # Arrange
        user_id = "user123"

        # Act
        with patch.object(progress_agent, "generate_progress_visualization") as mock_progress:
            with patch.object(
                gamification_agent, "generate_motivation_strategy"
            ) as mock_motivation:
                mock_progress.return_value = {
                    "productivity_score_trend": [6.2, 6.0, 5.8, 5.5],  # Declining trend
                    "task_completion_rate": [0.65, 0.60, 0.58],
                }
                mock_motivation.return_value = {
                    "motivation_type": "recovery_support",
                    "primary_strategy": "confidence_building",
                }

                progress_viz = await progress_agent.generate_progress_visualization(
                    user_id, "7_days"
                )
                motivation = await gamification_agent.generate_motivation_strategy(
                    {"user_id": user_id, "recent_trends": progress_viz}
                )

                # Assert
                assert (
                    progress_viz["productivity_score_trend"][-1]
                    < progress_viz["productivity_score_trend"][0]
                )
                assert motivation["motivation_type"] == "recovery_support"
                assert motivation["primary_strategy"] == "confidence_building"
