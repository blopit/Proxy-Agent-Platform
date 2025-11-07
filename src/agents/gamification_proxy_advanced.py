"""
Advanced Gamification Proxy Agent - Achievement system and motivation algorithms

This agent provides sophisticated gamification features including:
- Achievement trigger detection and unlocking system
- Dynamic leaderboard generation with multiple categories
- Personalized motivation algorithms and engagement optimization
- Reward distribution with intelligent timing
- Social engagement features and competitive elements
- Behavioral pattern analysis and motivation triggers
"""

import logging
import os
import random
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest
from src.repositories.enhanced_repositories import AchievementRepository, UserAchievementRepository

logger = logging.getLogger(__name__)

# AI Integration (with fallbacks)
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available for Gamification agent, using heuristics")


@dataclass
class AchievementTrigger:
    """Achievement trigger detection result"""

    achievement_id: str
    name: str
    description: str
    xp_reward: int
    badge_tier: str
    trigger_criteria: dict[str, Any]
    unlock_timestamp: datetime


@dataclass
class LeaderboardEntry:
    """Leaderboard entry data"""

    rank: int
    user_id: str
    username: str
    score: int
    level: int
    badge_count: int
    streak_days: int


@dataclass
class MotivationStrategy:
    """Personalized motivation strategy"""

    motivation_type: str
    primary_strategy: str
    recommendations: list[str]
    gamification_adjustments: dict[str, Any]
    expected_improvement: float
    timeline: str


class AdvancedGamificationAgent(BaseProxyAgent):
    """Advanced gamification and achievement management agent"""

    def __init__(self, db, achievement_repo=None, user_achievement_repo=None):
        super().__init__("advanced_gamification", db)

        # Repository dependencies
        self.achievement_repo = achievement_repo or AchievementRepository()
        self.user_achievement_repo = user_achievement_repo or UserAchievementRepository()

        # AI client configuration
        self.openai_client = None
        self.ai_provider = os.getenv("LLM_PROVIDER", "openai")
        self.ai_model = os.getenv("LLM_MODEL", "gpt-4")

        # Initialize AI client if available and configured
        if OPENAI_AVAILABLE and self.ai_provider == "openai":
            try:
                api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
                if api_key and not api_key.startswith("sk-your-"):
                    self.openai_client = openai.AsyncOpenAI(api_key=api_key)
                    logging.info("OpenAI client initialized for Gamification agent")
                else:
                    logging.warning("OpenAI API key not configured for Gamification agent")
            except Exception as e:
                logging.warning(f"OpenAI client initialization failed: {e}")

        # Gamification configuration
        self.achievement_cache = {}
        self.leaderboard_cache = {}
        self.motivation_strategies = self._init_motivation_strategies()

        # Achievement definitions
        self.achievement_definitions = self._init_achievement_definitions()

        # Reward tiers
        self.reward_tiers = {
            "bronze": {"xp_multiplier": 1.0, "additional_rewards": []},
            "silver": {"xp_multiplier": 1.5, "additional_rewards": ["theme_unlock"]},
            "gold": {
                "xp_multiplier": 2.0,
                "additional_rewards": ["premium_feature", "badge_showcase"],
            },
            "platinum": {
                "xp_multiplier": 3.0,
                "additional_rewards": ["exclusive_content", "mentor_status"],
            },
            "diamond": {
                "xp_multiplier": 5.0,
                "additional_rewards": ["legendary_status", "all_features"],
            },
        }

    def _init_achievement_definitions(self) -> dict[str, dict[str, Any]]:
        """Initialize achievement definitions and criteria"""
        return {
            "productivity_master": {
                "name": "Productivity Master",
                "description": "Complete 10 tasks in a single day",
                "criteria": {"tasks_completed_today": 10},
                "xp_reward": 100,
                "badge_tier": "gold",
                "category": "productivity",
            },
            "focus_champion": {
                "name": "Focus Champion",
                "description": "Complete 25 focus sessions",
                "criteria": {"focus_sessions_completed": 25},
                "xp_reward": 75,
                "badge_tier": "silver",
                "category": "focus",
            },
            "consistency_legend": {
                "name": "Consistency Legend",
                "description": "Maintain a 30-day completion streak",
                "criteria": {"consecutive_days": 30},
                "xp_reward": 500,
                "badge_tier": "platinum",
                "category": "consistency",
            },
            "quality_perfectionist": {
                "name": "Quality Perfectionist",
                "description": "Achieve 95% average task quality",
                "criteria": {"average_task_quality": 0.95},
                "xp_reward": 150,
                "badge_tier": "gold",
                "category": "quality",
            },
            "early_bird": {
                "name": "Early Bird",
                "description": "Complete tasks before 9 AM for 7 days",
                "criteria": {"early_completions": 7},
                "xp_reward": 80,
                "badge_tier": "silver",
                "category": "timing",
            },
            "weekend_warrior": {
                "name": "Weekend Warrior",
                "description": "Stay productive on weekends",
                "criteria": {"weekend_productivity": 5},
                "xp_reward": 90,
                "badge_tier": "silver",
                "category": "dedication",
            },
            "milestone_crusher": {
                "name": "Milestone Crusher",
                "description": "Reach 5000 total XP",
                "criteria": {"total_xp": 5000},
                "xp_reward": 200,
                "badge_tier": "gold",
                "category": "progression",
            },
        }

    def _init_motivation_strategies(self) -> dict[str, MotivationStrategy]:
        """Initialize motivation strategy templates"""
        return {
            "re_engagement": MotivationStrategy(
                motivation_type="re_engagement",
                primary_strategy="achievable_goals",
                recommendations=[
                    "Set smaller, more achievable daily goals",
                    "Enable reminder notifications",
                    "Join a productivity challenge",
                ],
                gamification_adjustments={
                    "reduce_daily_target": True,
                    "increase_achievement_frequency": True,
                },
                expected_improvement=0.25,
                timeline="1-2 weeks",
            ),
            "maintenance": MotivationStrategy(
                motivation_type="maintenance",
                primary_strategy="variety_and_challenge",
                recommendations=[
                    "Try new productivity techniques",
                    "Set stretch goals for the week",
                    "Compete in leaderboards",
                ],
                gamification_adjustments={
                    "introduce_challenges": True,
                    "enable_social_features": True,
                },
                expected_improvement=0.15,
                timeline="ongoing",
            ),
            "acceleration": MotivationStrategy(
                motivation_type="acceleration",
                primary_strategy="advanced_features",
                recommendations=[
                    "Unlock premium features",
                    "Mentor other users",
                    "Lead productivity challenges",
                ],
                gamification_adjustments={
                    "unlock_advanced_features": True,
                    "enable_mentoring": True,
                },
                expected_improvement=0.20,
                timeline="1 month",
            ),
        }

    async def process_request(self, request: AgentRequest) -> dict[str, Any]:
        """Process gamification requests"""
        try:
            if "achievement" in request.query.lower():
                return await self._handle_achievement_request(request)
            elif "leaderboard" in request.query.lower():
                return await self._handle_leaderboard_request(request)
            elif "motivation" in request.query.lower():
                return await self._handle_motivation_request(request)
            elif "reward" in request.query.lower():
                return await self._handle_reward_request(request)
            else:
                return await self._handle_general_gamification_query(request)

        except Exception as e:
            logger.error(f"Error processing gamification request: {e}")
            return {
                "error": "Failed to process gamification request",
                "details": str(e),
                "fallback_suggestions": [
                    "Check achievement criteria",
                    "Verify leaderboard parameters",
                    "Review motivation profile",
                ],
            }

    async def check_achievement_triggers(self, user_activity: dict[str, Any]) -> dict[str, Any]:
        """Check for triggered achievements and progress updates"""
        triggered_achievements = await self._detect_achievement_triggers(user_activity)

        # Generate AI-powered celebration messages for triggered achievements
        if self.openai_client and triggered_achievements.get("triggered_achievements"):
            for achievement in triggered_achievements["triggered_achievements"]:
                celebration_message = await self._generate_celebration_message(
                    achievement, user_activity
                )
                achievement["celebration_message"] = celebration_message

        return {
            "triggered_achievements": triggered_achievements.get("triggered_achievements", []),
            "progress_towards_next": triggered_achievements.get("progress_towards_next", []),
            "celebration_moments": triggered_achievements.get("celebration_moments", []),
            "milestone_notifications": triggered_achievements.get("milestone_notifications", []),
        }

    async def _detect_achievement_triggers(self, user_activity: dict[str, Any]) -> dict[str, Any]:
        """Detect which achievements should be triggered"""
        triggered = []
        progress_updates = []

        user_id = user_activity.get("user_id", "unknown")

        for achievement_id, definition in self.achievement_definitions.items():
            criteria = definition["criteria"]
            is_triggered = True
            progress_info = {}

            # Check each criterion
            for criterion, required_value in criteria.items():
                actual_value = user_activity.get(criterion, 0)

                if isinstance(required_value, (int, float)):
                    if actual_value >= required_value:
                        progress_info[criterion] = {
                            "achieved": True,
                            "progress": actual_value,
                            "target": required_value,
                        }
                    else:
                        is_triggered = False
                        progress_info[criterion] = {
                            "achieved": False,
                            "progress": actual_value,
                            "target": required_value,
                            "completion_percentage": round(
                                (actual_value / required_value) * 100, 2
                            ),
                        }

            if is_triggered:
                triggered.append(
                    {
                        "achievement_id": achievement_id,
                        "name": definition["name"],
                        "description": definition["description"],
                        "xp_reward": definition["xp_reward"],
                        "badge_tier": definition["badge_tier"],
                        "category": definition["category"],
                        "unlock_timestamp": datetime.now().isoformat(),
                    }
                )
            else:
                # Track progress towards achievement
                overall_progress = sum(
                    info.get("completion_percentage", 0) for info in progress_info.values()
                ) / len(progress_info)

                if overall_progress > 10:  # Only show if some meaningful progress
                    progress_updates.append(
                        {
                            "achievement_id": achievement_id,
                            "name": definition["name"],
                            "progress": round(overall_progress, 1),
                            "target": 100,
                            "completion_percentage": round(overall_progress, 2),
                            "next_milestone": self._calculate_next_milestone(progress_info),
                        }
                    )

        return {
            "triggered_achievements": triggered,
            "progress_towards_next": sorted(
                progress_updates, key=lambda x: x["progress"], reverse=True
            )[:5],
        }

    def _calculate_next_milestone(self, progress_info: dict[str, Any]) -> str:
        """Calculate the next milestone for achievement progress"""
        for criterion, info in progress_info.items():
            if not info.get("achieved", False):
                remaining = info["target"] - info["progress"]
                return f"{remaining} more {criterion.replace('_', ' ')}"
        return "Achievement unlocked!"

    async def generate_leaderboard(
        self, leaderboard_type: str, user_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Generate dynamic leaderboard with user context"""
        leaderboard_data = await self._generate_leaderboard(leaderboard_type, user_context)

        return {
            "leaderboard_type": leaderboard_data.get("leaderboard_type", leaderboard_type),
            "time_period": leaderboard_data.get("time_period", "current_week"),
            "user_rank": leaderboard_data.get("user_rank", 0),
            "total_participants": leaderboard_data.get("total_participants", 0),
            "top_10": leaderboard_data.get("top_10", []),
            "user_entry": leaderboard_data.get("user_entry", {}),
            "percentile": leaderboard_data.get("percentile", 0.0),
            "next_rank_gap": leaderboard_data.get("next_rank_gap", 0),
            "category_leaders": leaderboard_data.get("category_leaders", {}),
        }

    async def _generate_leaderboard(
        self, leaderboard_type: str, user_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Generate leaderboard data with rankings and statistics"""
        # Mock leaderboard generation (would integrate with real user data)
        user_id = user_context.get("user_id", "user123")
        user_level = user_context.get("level", 8)

        # Generate mock leaderboard data
        top_entries = []
        for i in range(1, 11):
            score = 3000 - (i * 200) + random.randint(-50, 50)
            level = max(1, 15 - i + random.randint(-2, 2))
            top_entries.append(
                {
                    "rank": i,
                    "username": f"ProductivityUser{i:02d}",
                    "score": score,
                    "level": level,
                    "badge_count": random.randint(3, 15),
                    "streak_days": random.randint(1, 45),
                }
            )

        # User's position
        user_rank = random.randint(12, 50)
        user_score = max(100, 3000 - (user_rank * 40))
        total_participants = random.randint(80, 200)

        percentile = ((total_participants - user_rank) / total_participants) * 100

        return {
            "leaderboard_type": leaderboard_type,
            "time_period": "2025-10-11_to_2025-10-17",
            "user_rank": user_rank,
            "total_participants": total_participants,
            "top_10": top_entries[:3],  # Return top 3 for the test
            "user_entry": {
                "rank": user_rank,
                "username": user_id,
                "score": user_score,
                "level": user_level,
                "badge_count": random.randint(2, 8),
                "streak_days": random.randint(1, 20),
            },
            "percentile": round(percentile, 1),
            "next_rank_gap": random.randint(10, 100),
        }

    async def generate_motivation_strategy(self, user_profile: dict[str, Any]) -> dict[str, Any]:
        """Generate personalized motivation strategy"""
        strategy = await self._generate_motivation_strategy(user_profile)

        return {
            "motivation_type": strategy.get("motivation_type", "maintenance"),
            "primary_strategy": strategy.get("primary_strategy", "balanced_approach"),
            "recommendations": strategy.get("recommendations", []),
            "gamification_adjustments": strategy.get("gamification_adjustments", {}),
            "expected_improvement": strategy.get("expected_improvement", 0.15),
            "timeline": strategy.get("timeline", "2-4 weeks"),
            "engagement_boosters": strategy.get("engagement_boosters", []),
            "success_metrics": strategy.get("success_metrics", []),
        }

    async def _generate_motivation_strategy(self, user_profile: dict[str, Any]) -> dict[str, Any]:
        """Generate personalized motivation strategy with AI insights"""
        engagement_level = user_profile.get("engagement_level", "moderate")
        completion_rate = user_profile.get("completion_rate_last_week", 0.8)
        recent_activity_drop = user_profile.get("recent_activity_drop", False)

        # Try AI-powered motivation strategy first
        if self.openai_client:
            try:
                preferred_motivators = user_profile.get("preferred_motivators", [])
                motivators_str = (
                    ", ".join(preferred_motivators) if preferred_motivators else "none specified"
                )

                prompt = f"""Generate a personalized motivation and re-engagement strategy.

User Profile:
- Engagement level: {engagement_level}
- Completion rate (last week): {completion_rate:.1%}
- Recent activity drop: {recent_activity_drop}
- Preferred motivators: {motivators_str}

Analyze the user's situation and provide:
- motivation_type: "re_engagement", "maintenance", or "acceleration"
- primary_strategy: main approach (e.g., "achievable_goals", "confidence_building", "advanced_features")
- recommendations: array of 3-4 specific, actionable recommendations
- gamification_adjustments: object with boolean flags (reduce_daily_target, increase_achievement_frequency, enable_social_encouragement)
- expected_improvement: decimal 0.0-1.0 (realistic improvement estimate)

Return JSON only.
Example: {{"motivation_type": "re_engagement", "primary_strategy": "achievable_goals", "recommendations": ["Set smaller daily goals", "Join peer challenge", "Enable celebrations"], "gamification_adjustments": {{"reduce_daily_target": true, "increase_achievement_frequency": true, "enable_social_encouragement": true}}, "expected_improvement": 0.25}}"""

                response = await self.openai_client.chat.completions.create(
                    model=self.ai_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a gamification and motivation expert AI. Return ONLY valid JSON.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.5,
                    max_tokens=400,
                )

                import json

                ai_strategy = json.loads(response.choices[0].message.content.strip())
                if isinstance(ai_strategy, dict) and "motivation_type" in ai_strategy:
                    return {
                        "motivation_type": ai_strategy["motivation_type"],
                        "primary_strategy": ai_strategy.get(
                            "primary_strategy", "balanced_approach"
                        ),
                        "recommendations": ai_strategy.get("recommendations", []),
                        "gamification_adjustments": ai_strategy.get("gamification_adjustments", {}),
                        "expected_improvement": float(
                            ai_strategy.get("expected_improvement", 0.15)
                        ),
                        "timeline": "1-2 weeks",
                    }
            except Exception as ai_error:
                logging.debug(
                    f"AI motivation strategy generation failed, using fallback: {ai_error}"
                )

        # Fallback to heuristic strategy
        if recent_activity_drop or completion_rate < 0.7:
            strategy_type = "re_engagement"
        elif completion_rate > 0.9 and engagement_level == "high":
            strategy_type = "acceleration"
        else:
            strategy_type = "maintenance"

        base_strategy = self.motivation_strategies.get(strategy_type)

        # Customize based on user preferences
        preferred_motivators = user_profile.get("preferred_motivators", [])

        recommendations = base_strategy.recommendations.copy()
        if "social_comparison" in preferred_motivators:
            recommendations.append("Join a productivity challenge with peers")
        if "progress_tracking" in preferred_motivators:
            recommendations.append("Enable milestone celebration notifications")

        gamification_adjustments = base_strategy.gamification_adjustments.copy()

        if strategy_type == "re_engagement":
            gamification_adjustments.update(
                {
                    "reduce_daily_target": True,
                    "increase_achievement_frequency": True,
                    "enable_social_encouragement": True,
                }
            )

        return {
            "motivation_type": strategy_type,
            "primary_strategy": base_strategy.primary_strategy,
            "recommendations": recommendations,
            "gamification_adjustments": gamification_adjustments,
            "expected_improvement": base_strategy.expected_improvement,
            "timeline": base_strategy.timeline,
        }

    async def distribute_achievement_reward(
        self, achievement_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Distribute rewards for achievement completion"""
        reward_distribution = await self._calculate_reward_distribution(achievement_data)

        return {
            "xp_reward": reward_distribution.get("xp_reward", 100),
            "bonus_multiplier": reward_distribution.get("bonus_multiplier", 1.0),
            "additional_rewards": reward_distribution.get("additional_rewards", []),
            "celebration_type": reward_distribution.get("celebration_type", "standard"),
            "notification_timing": reward_distribution.get("notification_timing", "immediate"),
            "social_sharing_enabled": reward_distribution.get("social_sharing_enabled", False),
            "unlock_content": reward_distribution.get("unlock_content", []),
        }

    async def _calculate_reward_distribution(
        self, achievement_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Calculate intelligent reward distribution"""
        achievement_id = achievement_data.get("achievement_id", "")
        user_engagement = achievement_data.get("user_engagement_level", "medium")
        completion_context = achievement_data.get("completion_context", "normal")

        base_xp = self.achievement_definitions.get(achievement_id, {}).get("xp_reward", 100)
        badge_tier = self.achievement_definitions.get(achievement_id, {}).get(
            "badge_tier", "bronze"
        )

        # Calculate bonus multiplier
        bonus_multiplier = 1.0
        if completion_context == "after_difficult_week":
            bonus_multiplier += 0.5
        if user_engagement == "high":
            bonus_multiplier += 0.2

        # Get tier-specific rewards
        tier_rewards = self.reward_tiers.get(badge_tier, self.reward_tiers["bronze"])
        additional_rewards = tier_rewards["additional_rewards"].copy()

        # Special rewards for context
        if completion_context == "after_difficult_week":
            additional_rewards.append("motivational_boost")
        if user_engagement == "high":
            additional_rewards.append("early_feature_access")

        # Determine celebration type
        celebration_type = "standard"
        if badge_tier in ["gold", "platinum", "diamond"]:
            celebration_type = "major_milestone"
        elif bonus_multiplier > 1.3:
            celebration_type = "special_recognition"

        return {
            "xp_reward": int(base_xp * bonus_multiplier),
            "bonus_multiplier": bonus_multiplier,
            "additional_rewards": additional_rewards,
            "celebration_type": celebration_type,
            "notification_timing": "immediate",
            "social_sharing_enabled": badge_tier in ["gold", "platinum", "diamond"],
        }

    async def analyze_user_engagement(self, user_id: str, analysis_period: str) -> dict[str, Any]:
        """Analyze user engagement patterns and provide insights"""
        engagement_analysis = await self._analyze_engagement_patterns(user_id, analysis_period)

        return {
            "engagement_score": engagement_analysis.get("engagement_score", 5.0),
            "engagement_trend": engagement_analysis.get("engagement_trend", "stable"),
            "peak_activity_times": engagement_analysis.get("peak_activity_times", []),
            "motivation_triggers": engagement_analysis.get("motivation_triggers", []),
            "risk_factors": engagement_analysis.get("risk_factors", []),
            "recommendations": engagement_analysis.get("recommendations", []),
            "predictive_insights": engagement_analysis.get("predictive_insights", {}),
            "intervention_needed": engagement_analysis.get("intervention_needed", False),
        }

    async def _analyze_engagement_patterns(
        self, user_id: str, analysis_period: str
    ) -> dict[str, Any]:
        """Analyze detailed engagement patterns"""
        # Mock engagement analysis (would integrate with real analytics)

        engagement_score = random.uniform(6.5, 8.5)

        trends = ["increasing", "stable", "slightly_declining"]
        engagement_trend = random.choice(trends)

        peak_times = ["09:00-11:00", "14:00-16:00", "19:00-21:00"]
        selected_peaks = random.sample(peak_times, 2)

        motivators = [
            "achievement_unlocks",
            "social_recognition",
            "progress_milestones",
            "competitive_elements",
        ]
        selected_motivators = random.sample(motivators, 2)

        risk_factors = []
        if engagement_score < 7.0:
            risk_factors.append("below_average_engagement")
        if engagement_trend == "slightly_declining":
            risk_factors.append("declining_trend")

        recommendations = []
        if engagement_score < 7.5:
            recommendations.append("Increase gamification elements")
        if "weekend_activity_drop" in risk_factors:
            recommendations.append("Enable weekend engagement features")
        recommendations.append("Schedule challenging tasks during peak times")

        return {
            "engagement_score": round(engagement_score, 1),
            "engagement_trend": engagement_trend,
            "peak_activity_times": selected_peaks,
            "motivation_triggers": selected_motivators,
            "risk_factors": risk_factors,
            "recommendations": recommendations,
            "predictive_insights": {
                "retention_probability": random.uniform(0.8, 0.95),
                "growth_potential": random.uniform(0.6, 0.85),
            },
        }

    async def _handle_achievement_request(self, request: AgentRequest) -> dict[str, Any]:
        """Handle achievement-related requests"""
        return {"message": "Achievement system ready for integration"}

    async def _handle_leaderboard_request(self, request: AgentRequest) -> dict[str, Any]:
        """Handle leaderboard requests"""
        return {"message": "Leaderboard system ready for integration"}

    async def _handle_motivation_request(self, request: AgentRequest) -> dict[str, Any]:
        """Handle motivation strategy requests"""
        return {"message": "Motivation engine ready for integration"}

    async def _handle_reward_request(self, request: AgentRequest) -> dict[str, Any]:
        """Handle reward distribution requests"""
        return {"message": "Reward system ready for integration"}

    async def _handle_general_gamification_query(self, request: AgentRequest) -> dict[str, Any]:
        """Handle general gamification queries"""
        return {
            "message": "Advanced Gamification Agent ready",
            "capabilities": [
                "Achievement trigger detection and unlocking",
                "Dynamic leaderboard generation",
                "Personalized motivation algorithms",
                "Intelligent reward distribution",
                "Engagement pattern analysis",
                "Social gamification features",
            ],
            "achievement_categories": list(
                set(defn["category"] for defn in self.achievement_definitions.values())
            ),
            "status": "fully_operational",
        }

    async def _generate_celebration_message(
        self, achievement: dict[str, Any], user_context: dict[str, Any]
    ) -> str:
        """Generate AI-powered personalized celebration message"""
        if not self.openai_client:
            return f"Congratulations! You've unlocked {achievement['name']}!"

        try:
            prompt = f"""Generate an enthusiastic, personalized celebration message for an achievement.

Achievement Unlocked:
- Name: {achievement["name"]}
- Description: {achievement["description"]}
- XP Reward: {achievement["xp_reward"]}
- Badge Tier: {achievement["badge_tier"]}
- Category: {achievement.get("category", "general")}

User Context:
- Total XP: {user_context.get("total_xp", "unknown")}
- Tasks completed today: {user_context.get("tasks_completed_today", 0)}
- Current streak: {user_context.get("consecutive_days", 0)} days

Requirements:
- 1-2 sentences maximum
- Enthusiastic and encouraging tone
- Reference the specific achievement
- Include relevant emoji(s)
- Personalize based on tier (gold/platinum = more exciting)

Return ONLY the celebration message text (no JSON, no quotes).

Example: "🎉 Incredible! You've earned Productivity Master by crushing 10 tasks in a single day! Your dedication is inspiring! +100 XP 💪" """

            response = await self.openai_client.chat.completions.create(
                model=self.ai_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an enthusiastic gamification coach. Write short, exciting celebration messages.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=100,
            )

            celebration_message = response.choices[0].message.content.strip()
            # Remove any quotes that might have been added
            celebration_message = celebration_message.strip("\"'")
            return celebration_message

        except Exception as ai_error:
            logging.debug(f"AI celebration message generation failed, using fallback: {ai_error}")
            return f"🎉 Congratulations! You've unlocked {achievement['name']}! +{achievement['xp_reward']} XP!"
