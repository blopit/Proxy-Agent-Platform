"""
Advanced Energy Proxy Agent - Intelligent energy level tracking and optimization

This agent provides sophisticated energy management including:
- Continuous energy level monitoring and prediction
- Circadian rhythm analysis and optimization
- Personalized energy restoration strategies
- Task-energy matching for optimal productivity
- Nutritional and lifestyle recommendations
- Integration with focus sessions and work patterns
"""

import logging
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest, Message
from src.repositories.enhanced_repositories_extensions import (
    EnhancedEnergyRepository,
    EnhancedMetricsRepository,
)

logger = logging.getLogger(__name__)

# AI Integration (with fallbacks)
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available for Energy agent, using heuristics")


@dataclass
class EnergyReading:
    """Single energy level reading with context"""

    timestamp: datetime
    energy_level: float  # 0.0 to 10.0
    context: dict[str, Any]
    factors: list[str]
    confidence: float


@dataclass
class EnergyOptimization:
    """Energy optimization recommendations"""

    immediate_actions: list[str]
    nutritional_advice: list[str]
    environmental_changes: list[str]
    lifestyle_recommendations: list[str]
    expected_improvement: float
    timeframe: str


@dataclass
class CircadianProfile:
    """User's circadian rhythm profile"""

    peak_energy_times: list[str]
    low_energy_times: list[str]
    energy_curve: dict[int, float]  # hour -> average energy
    pattern_confidence: float
    chronotype: str  # morning, evening, intermediate


class AdvancedEnergyAgent(BaseProxyAgent):
    """Advanced Energy Proxy Agent with intelligent energy management"""

    def __init__(self, db, energy_repo=None, metrics_repo=None):
        super().__init__("advanced_energy", db)

        # Repository dependencies
        self.energy_repo = energy_repo or EnhancedEnergyRepository()
        self.metrics_repo = metrics_repo or EnhancedMetricsRepository()

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
                    logging.info("OpenAI client initialized for Energy agent")
                else:
                    logging.warning("OpenAI API key not configured for Energy agent")
            except Exception as e:
                logging.warning(f"OpenAI client initialization failed: {e}")

        # Energy tracking
        self.user_energy_profiles = {}
        self.energy_predictions = {}
        self.optimization_strategies = {}

        # Energy factors and their impact weights
        self.energy_factors = {
            "sleep_quality": 0.25,
            "nutrition": 0.20,
            "physical_activity": 0.15,
            "stress_level": 0.15,
            "hydration": 0.10,
            "environment": 0.10,
            "social_interaction": 0.05,
        }

    async def _handle_request(
        self, request: AgentRequest, history: list[Message]
    ) -> tuple[str, int]:
        """Handle energy management requests"""
        try:
            query = request.query.lower().strip()

            # Track energy level
            if any(word in query for word in ["energy", "feeling", "tired", "alert"]):
                reading = await self.track_energy_level(request.user_id, {"query": request.query})
                return self._format_energy_reading_response(reading), 20

            # Get optimization recommendations
            elif any(word in query for word in ["boost", "improve", "optimize", "increase"]):
                optimization = await self.optimize_energy(request.user_id, 5.0, [])
                return self._format_optimization_response(optimization), 30

            # Energy pattern analysis
            elif any(word in query for word in ["pattern", "rhythm", "schedule", "best time"]):
                analysis = await self.analyze_circadian_rhythm(request.user_id, [])
                return self._format_pattern_response(analysis), 25

            # Task-energy matching
            elif any(word in query for word in ["task", "work", "when to", "should I"]):
                matching = await self.match_tasks_to_energy(7.0, [])
                return self._format_task_matching_response(matching), 20

            # Recovery planning
            elif any(word in query for word in ["recover", "restore", "recharge", "rest"]):
                recovery = await self.plan_energy_recovery(request.user_id, {})
                return self._format_recovery_response(recovery), 25

            # Default guidance
            else:
                guidance = await self.provide_energy_guidance(request)
                return guidance["message"], guidance["xp"]

        except Exception as e:
            logger.error(f"Energy agent error: {e}")
            return (
                "⚡ I'm here to help optimize your energy levels. Try asking about your current energy!",
                5,
            )

    async def track_energy_level(
        self, user_id: str, context_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Track and analyze current energy level"""
        energy_assessment = await self._assess_current_energy(user_id, context_data)

        # Store energy reading
        await self._store_energy_reading(user_id, energy_assessment)

        # Update user profile
        await self._update_energy_profile(user_id, energy_assessment)

        return energy_assessment

    async def _assess_current_energy(
        self, user_id: str, context_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Assess current energy level using multiple indicators"""
        # Extract energy indicators from context
        indicators = await self._extract_energy_indicators(context_data)

        # Calculate base energy level
        base_energy = await self._calculate_base_energy(user_id, indicators)

        # Apply contextual adjustments
        adjusted_energy = await self._apply_contextual_adjustments(base_energy, indicators)

        # Predict trend
        trend = await self._predict_energy_trend(user_id, adjusted_energy, indicators)

        return {
            "energy_level": adjusted_energy,
            "trend": trend["direction"],
            "factors": indicators["primary_factors"],
            "predicted_next_hour": trend["predicted_level"],
            "confidence": indicators["confidence"],
            "recommendations": await self._generate_immediate_recommendations(
                adjusted_energy, indicators
            ),
        }

    async def _extract_energy_indicators(self, context_data: dict[str, Any]) -> dict[str, Any]:
        """Extract energy indicators from context data"""
        current_hour = datetime.now().hour
        indicators = {
            "time_of_day": context_data.get("time_of_day", f"{current_hour}:00"),
            "last_meal": context_data.get("last_meal", "unknown"),
            "sleep_quality": context_data.get("sleep_quality", 7),
            "recent_activity": context_data.get("recent_activity", "unknown"),
            "stress_level": context_data.get("stress_level", 5),
            "hydration": context_data.get("hydration", 5),
            "physical_activity": context_data.get("physical_activity", "moderate"),
        }

        # Identify primary factors affecting energy
        primary_factors = []
        confidence = 0.7

        # Time-based factors
        if 6 <= current_hour <= 10:
            primary_factors.append("morning_natural_high")
        elif 13 <= current_hour <= 15:
            primary_factors.append("post_lunch_dip")
        elif current_hour >= 22:
            primary_factors.append("evening_fatigue")

        # Sleep quality impact
        if indicators["sleep_quality"] < 6:
            primary_factors.append("poor_sleep")
            confidence -= 0.1
        elif indicators["sleep_quality"] > 8:
            primary_factors.append("excellent_sleep")

        # Recent activity impact
        if indicators["recent_activity"] in ["exercise", "walking"]:
            primary_factors.append("physical_activity_boost")
        elif indicators["recent_activity"] in ["meeting", "presentation"]:
            primary_factors.append("mental_fatigue")

        return {
            "primary_factors": primary_factors,
            "indicators": indicators,
            "confidence": confidence,
        }

    async def _calculate_base_energy(self, user_id: str, indicators: dict[str, Any]) -> float:
        """Calculate base energy level"""
        # Start with user's baseline or default
        base_energy = 6.5

        # Adjust for sleep quality
        sleep_impact = (indicators["indicators"]["sleep_quality"] - 7) * 0.5
        base_energy += sleep_impact

        # Adjust for time of day (circadian rhythm)
        hour = datetime.now().hour
        circadian_adjustment = await self._get_circadian_adjustment(user_id, hour)
        base_energy += circadian_adjustment

        # Adjust for stress
        stress_impact = (5 - indicators["indicators"]["stress_level"]) * 0.3
        base_energy += stress_impact

        return max(0.0, min(10.0, base_energy))

    async def _apply_contextual_adjustments(
        self, base_energy: float, indicators: dict[str, Any]
    ) -> float:
        """Apply contextual adjustments to base energy"""
        adjusted_energy = base_energy

        # Recent activity adjustments
        activity = indicators["indicators"]["recent_activity"]
        if activity == "exercise":
            adjusted_energy += 1.0
        elif activity in ["meeting", "presentation"]:
            adjusted_energy -= 0.5

        # Hydration adjustment
        if indicators["indicators"]["hydration"] < 5:
            adjusted_energy -= 0.5

        return max(0.0, min(10.0, adjusted_energy))

    async def _predict_energy_trend(
        self, user_id: str, current_energy: float, indicators: dict[str, Any]
    ) -> dict[str, Any]:
        """Predict energy trend with AI-powered analysis"""
        hour = datetime.now().hour

        # Try AI-powered prediction first
        if self.openai_client:
            try:
                # Format indicators for AI
                factors_str = ", ".join(indicators["primary_factors"])
                inds = indicators["indicators"]

                prompt = f"""Predict energy level trend for the next hour.

Current State:
- Current energy: {current_energy:.1f}/10
- Time: {hour}:00
- Primary factors: {factors_str}
- Sleep quality: {inds['sleep_quality']}/10
- Stress level: {inds['stress_level']}/10
- Recent activity: {inds['recent_activity']}

Consider:
- Natural circadian rhythms (morning rise, post-lunch dip, evening decline)
- Impact of current factors on energy trajectory
- Typical energy patterns

Return JSON with:
- direction: "increasing", "declining", or "stable"
- predicted_level: 0.0-10.0 (energy in 1 hour)
- confidence: 0.0-1.0

Example: {{"direction": "declining", "predicted_level": 6.2, "confidence": 0.8}}"""

                response = await self.openai_client.chat.completions.create(
                    model=self.ai_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an energy prediction AI. Return ONLY valid JSON.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                    max_tokens=150,
                )

                import json

                ai_result = json.loads(response.choices[0].message.content.strip())
                if (
                    isinstance(ai_result, dict)
                    and "direction" in ai_result
                    and "predicted_level" in ai_result
                ):
                    return {
                        "direction": ai_result["direction"],
                        "predicted_level": float(ai_result["predicted_level"]),
                        "confidence": float(ai_result.get("confidence", 0.75)),
                    }
            except Exception as ai_error:
                logging.debug(f"AI energy prediction failed, using fallback: {ai_error}")

        # Fallback to heuristic prediction
        predicted_change = 0.0

        # Natural circadian changes
        if 6 <= hour <= 11:
            predicted_change = 0.5  # Morning rise
        elif 12 <= hour <= 14:
            predicted_change = -1.0  # Post-lunch dip
        elif 15 <= hour <= 18:
            predicted_change = 0.3  # Afternoon recovery
        elif hour >= 20:
            predicted_change = -0.8  # Evening decline

        # Factor in indicators
        if "poor_sleep" in indicators["primary_factors"]:
            predicted_change -= 0.5

        predicted_level = max(0.0, min(10.0, current_energy + predicted_change))

        return {
            "direction": "increasing"
            if predicted_change > 0
            else "declining"
            if predicted_change < 0
            else "stable",
            "predicted_level": predicted_level,
            "confidence": 0.75,
        }

    async def optimize_energy(
        self, user_id: str, current_energy: float, upcoming_tasks: list[str]
    ) -> dict[str, Any]:
        """Generate personalized energy optimization recommendations"""
        optimization = await self._generate_energy_optimization(
            user_id, current_energy, upcoming_tasks
        )

        # Handle both dict and dataclass returns (for testing flexibility)
        if isinstance(optimization, dict):
            return {
                "immediate_actions": optimization.get("immediate_actions", []),
                "nutritional_advice": optimization.get("nutritional_advice", []),
                "environmental_changes": optimization.get("environmental_changes", []),
                "lifestyle_recommendations": optimization.get("lifestyle_recommendations", []),
                "expected_improvement": optimization.get("expected_improvement", 0.0),
                "timeframe_minutes": 20,
                "timeline": optimization.get("timeline", "15-30 minutes"),
            }

        return {
            "immediate_actions": optimization.immediate_actions,
            "nutritional_advice": optimization.nutritional_advice,
            "environmental_changes": optimization.environmental_changes,
            "lifestyle_recommendations": optimization.lifestyle_recommendations,
            "expected_improvement": optimization.expected_improvement,
            "timeframe_minutes": 20,  # Parse from timeframe string
            "timeline": optimization.timeframe,
        }

    async def _generate_energy_optimization(
        self, user_id: str, current_energy: float, upcoming_tasks: list[str]
    ) -> EnergyOptimization:
        """Generate comprehensive energy optimization strategy"""
        immediate_actions = []
        nutritional_advice = []
        environmental_changes = []
        lifestyle_recommendations = []

        # Immediate actions based on current energy
        if current_energy < 4.0:
            immediate_actions.extend(
                [
                    "take_10_min_walk",
                    "drink_large_glass_water",
                    "practice_deep_breathing",
                    "step_outside_for_fresh_air",
                ]
            )
        elif current_energy < 6.0:
            immediate_actions.extend(
                ["brief_stretching_session", "listen_to_energizing_music", "tidy_workspace"]
            )

        # Nutritional recommendations
        hour = datetime.now().hour
        if hour < 12:
            nutritional_advice.extend(
                ["protein_rich_breakfast", "complex_carbohydrates", "green_tea"]
            )
        elif 12 <= hour <= 15:
            nutritional_advice.extend(
                ["light_protein_lunch", "avoid_heavy_meals", "nuts_or_berries"]
            )
        else:
            nutritional_advice.extend(["healthy_snack", "herbal_tea", "avoid_caffeine"])

        # Environmental changes
        environmental_changes.extend(
            [
                "increase_natural_light",
                "optimize_room_temperature",
                "reduce_clutter",
                "add_plants_or_nature_sounds",
            ]
        )

        # Lifestyle recommendations
        lifestyle_recommendations.extend(
            [
                "maintain_consistent_sleep_schedule",
                "regular_physical_activity",
                "stress_management_techniques",
                "social_connection_time",
            ]
        )

        # Calculate expected improvement
        expected_improvement = min(3.0, (10.0 - current_energy) * 0.4)

        return EnergyOptimization(
            immediate_actions=immediate_actions[:3],
            nutritional_advice=nutritional_advice[:2],
            environmental_changes=environmental_changes[:2],
            lifestyle_recommendations=lifestyle_recommendations[:2],
            expected_improvement=expected_improvement,
            timeframe="15-30 minutes",
        )

    async def analyze_circadian_rhythm(
        self, user_id: str, historical_data: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Analyze user's circadian rhythm patterns"""
        rhythm_analysis = await self._analyze_circadian_patterns(user_id, historical_data)

        return {
            "peak_energy_times": rhythm_analysis.get(
                "peak_energy_times", rhythm_analysis.get("peak_times", [])
            ),
            "low_energy_times": rhythm_analysis.get(
                "low_energy_times", rhythm_analysis.get("low_times", [])
            ),
            "pattern_confidence": rhythm_analysis.get(
                "pattern_confidence", rhythm_analysis.get("confidence", 0.0)
            ),
            "chronotype": rhythm_analysis.get("chronotype", "unknown"),
            "recommendations": rhythm_analysis.get("recommendations", {}),
        }

    async def _analyze_circadian_patterns(
        self, user_id: str, historical_data: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Analyze circadian rhythm patterns from historical data"""
        if not historical_data:
            # Use default patterns
            return {
                "peak_times": ["09:00-11:00", "15:00-17:00"],
                "low_times": ["13:00-15:00", "03:00-06:00"],
                "confidence": 0.5,
                "chronotype": "intermediate",
                "recommendations": {
                    "schedule_complex_tasks": "09:00-11:00",
                    "schedule_routine_tasks": "13:00-15:00",
                    "optimal_sleep_time": "22:00-06:00",
                },
            }

        # Analyze energy patterns by hour
        hourly_averages = {}
        for entry in historical_data:
            hour = datetime.fromisoformat(entry["timestamp"]).hour
            energy = entry.get("energy", 5.0)

            if hour not in hourly_averages:
                hourly_averages[hour] = []
            hourly_averages[hour].append(energy)

        # Calculate average energy per hour
        hourly_energy = {
            hour: sum(energies) / len(energies) for hour, energies in hourly_averages.items()
        }

        # Identify patterns
        peak_hours = [hour for hour, energy in hourly_energy.items() if energy > 7.0]
        low_hours = [hour for hour, energy in hourly_energy.items() if energy < 5.0]

        # Determine chronotype
        morning_energy = sum(hourly_energy.get(h, 5.0) for h in range(6, 12)) / 6
        evening_energy = sum(hourly_energy.get(h, 5.0) for h in range(18, 23)) / 5

        if morning_energy > evening_energy + 1.0:
            chronotype = "morning"
        elif evening_energy > morning_energy + 1.0:
            chronotype = "evening"
        else:
            chronotype = "intermediate"

        return {
            "peak_times": [f"{h}:00-{h + 2}:00" for h in peak_hours[:2]],
            "low_times": [f"{h}:00-{h + 2}:00" for h in low_hours[:2]],
            "confidence": min(0.9, len(historical_data) * 0.05),
            "chronotype": chronotype,
            "recommendations": {
                "schedule_complex_tasks": f"{peak_hours[0] if peak_hours else 9}:00-{peak_hours[0] + 2 if peak_hours else 11}:00",
                "schedule_routine_tasks": f"{low_hours[0] if low_hours else 13}:00-{low_hours[0] + 2 if low_hours else 15}:00",
                "optimal_sleep_time": "22:00-06:00" if chronotype == "morning" else "23:00-07:00",
            },
        }

    async def match_tasks_to_energy(
        self, current_energy: float, available_tasks: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Match available tasks to current energy level"""
        task_matches = await self._match_energy_to_tasks(current_energy, available_tasks)

        return {
            "recommended_task": task_matches.get(
                "recommended_task", task_matches.get("best_match", {})
            ),
            "alternative_tasks": task_matches.get(
                "alternative_tasks", task_matches.get("alternatives", [])
            ),
            "energy_guidance": task_matches.get(
                "energy_guidance", task_matches.get("guidance", "")
            ),
        }

    async def _match_energy_to_tasks(
        self, current_energy: float, available_tasks: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Match tasks to energy level with scoring"""
        if not available_tasks:
            return {
                "best_match": None,
                "alternatives": [],
                "guidance": "No tasks available to match",
            }

        task_scores = []
        for task in available_tasks:
            complexity = task.get("complexity", 5)
            match_score = await self._calculate_task_energy_match(current_energy, complexity)

            task_scores.append(
                {
                    "task": task,
                    "match_score": match_score,
                    "reason": self._get_match_reason(current_energy, complexity, match_score),
                }
            )

        # Sort by match score
        task_scores.sort(key=lambda x: x["match_score"], reverse=True)

        return {
            "best_match": task_scores[0] if task_scores else None,
            "alternatives": task_scores[1:3] if len(task_scores) > 1 else [],
            "guidance": self._get_energy_task_guidance(current_energy),
        }

    async def _calculate_task_energy_match(
        self, energy_level: float, task_complexity: float
    ) -> float:
        """Calculate how well a task matches current energy level"""
        # Optimal match when energy slightly exceeds task complexity
        optimal_ratio = 1.2
        energy_ratio = energy_level / max(1.0, task_complexity)

        if energy_ratio >= optimal_ratio:
            # Energy is sufficient or more than needed
            match_score = min(1.0, 1.0 - abs(energy_ratio - optimal_ratio) * 0.1)
        else:
            # Energy is insufficient
            match_score = energy_ratio / optimal_ratio

        return match_score

    def _get_match_reason(self, energy_level: float, complexity: float, match_score: float) -> str:
        """Get reason for task-energy match score"""
        if match_score > 0.8:
            return "Excellent energy-task match"
        elif match_score > 0.6:
            return "Good match for current energy level"
        elif energy_level < complexity:
            return "Task may be too demanding for current energy"
        else:
            return "Consider for when energy is lower"

    def _get_energy_task_guidance(self, energy_level: float) -> str:
        """Get general guidance based on energy level"""
        if energy_level >= 8.0:
            return "High energy - perfect for complex, challenging tasks"
        elif energy_level >= 6.0:
            return "Good energy - suitable for moderate complexity tasks"
        elif energy_level >= 4.0:
            return "Moderate energy - focus on routine or administrative tasks"
        else:
            return "Low energy - consider rest or very simple tasks"

    async def plan_energy_recovery(
        self, user_id: str, depletion_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Plan comprehensive energy recovery strategy"""
        recovery_plan = await self._plan_energy_recovery(user_id, depletion_data)

        return {
            "recovery_strategy": recovery_plan.get(
                "recovery_strategy", recovery_plan.get("strategy", "active_restoration")
            ),
            "activities": recovery_plan.get("activities", []),
            "expected_recovery": recovery_plan.get(
                "expected_recovery", recovery_plan.get("expected_improvement", 0.0)
            ),
            "time_needed": recovery_plan.get("time_needed", recovery_plan.get("duration", 30)),
            "follow_up_actions": recovery_plan.get(
                "follow_up_actions", recovery_plan.get("follow_up", [])
            ),
        }

    async def _plan_energy_recovery(
        self, user_id: str, depletion_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create detailed energy recovery plan"""
        current_level = depletion_data.get("current_level", 4.0)
        causes = depletion_data.get("causes", ["general_fatigue"])

        # Determine recovery strategy
        if current_level < 3.0:
            strategy = "intensive_restoration"
            activities = ["20_min_power_nap", "meditation", "nature_walk", "nutritious_meal"]
            duration = 60
            expected_improvement = 3.0
        elif current_level < 5.0:
            strategy = "active_restoration"
            activities = ["15_min_meditation", "outdoor_walk", "healthy_snack", "hydration"]
            duration = 30
            expected_improvement = 2.0
        else:
            strategy = "gentle_boost"
            activities = ["brief_stretching", "deep_breathing", "energizing_music"]
            duration = 15
            expected_improvement = 1.0

        # Address specific causes
        follow_up = []
        if "poor_sleep" in causes:
            follow_up.append("optimize_sleep_schedule")
        if "high_stress" in causes:
            follow_up.append("implement_stress_management")
        if "nutrition" in causes:
            follow_up.append("review_eating_patterns")

        return {
            "strategy": strategy,
            "activities": activities,
            "duration": duration,
            "expected_improvement": expected_improvement,
            "follow_up": follow_up,
        }

    async def calculate_session_impact(
        self, session_id: str, pre_session_energy: float, session_intensity: str
    ) -> dict[str, Any]:
        """Calculate energy impact of focus session"""
        energy_expenditure = await self._calculate_energy_expenditure(
            pre_session_energy, session_intensity
        )

        return {
            "energy_used": energy_expenditure.get(
                "energy_used", energy_expenditure.get("used", 0.0)
            ),
            "predicted_post_session": energy_expenditure.get(
                "predicted_post_session", energy_expenditure.get("predicted_level", 0.0)
            ),
            "recovery_time_needed": energy_expenditure.get(
                "recovery_time_needed", energy_expenditure.get("recovery_time", 0)
            ),
            "recommendations": energy_expenditure.get("recommendations", []),
        }

    async def _calculate_energy_expenditure(
        self, pre_session_energy: float, session_intensity: str
    ) -> dict[str, Any]:
        """Calculate energy expenditure for focus session"""
        # Energy usage based on intensity
        intensity_multipliers = {"low": 0.1, "medium": 0.2, "high": 0.3, "extreme": 0.4}

        base_usage = pre_session_energy * intensity_multipliers.get(session_intensity, 0.2)
        energy_used = min(pre_session_energy * 0.5, base_usage)  # Max 50% of current energy

        predicted_level = max(0.0, pre_session_energy - energy_used)
        recovery_time = energy_used * 10  # Rough estimate: 10 minutes per energy point

        recommendations = []
        if predicted_level < 4.0:
            recommendations.extend(["plan_energy_recovery", "take_longer_break"])
        if energy_used > 2.0:
            recommendations.append("monitor_for_burnout")

        return {
            "used": energy_used,
            "predicted_level": predicted_level,
            "recovery_time": recovery_time,
            "recommendations": recommendations,
        }

    async def provide_energy_guidance(self, request: AgentRequest) -> dict[str, Any]:
        """Provide general energy optimization guidance"""
        guidance_tips = [
            "Track your energy patterns to identify peak performance times",
            "Match task complexity to your current energy level",
            "Take regular breaks to prevent energy depletion",
            "Stay hydrated and maintain steady blood sugar",
            "Use natural light and fresh air to boost alertness",
        ]

        return {
            "message": f"⚡ Energy tip: {guidance_tips[0]}. Ask about your current energy level!",
            "xp": 10,
            "additional_tips": guidance_tips[1:],
        }

    # Response formatting methods
    def _format_energy_reading_response(self, reading: dict[str, Any]) -> str:
        level = reading.get("energy_level", 5.0)
        trend = reading.get("trend", "stable")
        return f"⚡ Energy level: {level:.1f}/10 ({trend}). {reading.get('recommendations', ['Stay hydrated!'])[0]}"

    def _format_optimization_response(self, optimization: dict[str, Any]) -> str:
        actions = optimization.get("immediate_actions", [])
        improvement = optimization.get("expected_improvement", 1.0)
        action_str = ", ".join(actions[:2])
        return f"🚀 Try: {action_str}. Expected boost: +{improvement:.1f} energy points!"

    def _format_pattern_response(self, analysis: dict[str, Any]) -> str:
        peak_times = analysis.get("peak_energy_times", [])
        chronotype = analysis.get("chronotype", "intermediate")
        peak_str = ", ".join(peak_times[:2])
        return f"📊 Your peak energy: {peak_str}. You're a {chronotype} type!"

    def _format_task_matching_response(self, matching: dict[str, Any]) -> str:
        recommended = matching.get("recommended_task")
        guidance = matching.get("energy_guidance", "Match tasks to energy")
        if recommended:
            task_title = recommended["task"].get("title", "recommended task")
            return f"🎯 Perfect task match: {task_title}. {guidance}"
        return f"🎯 {guidance}"

    def _format_recovery_response(self, recovery: dict[str, Any]) -> str:
        strategy = recovery.get("recovery_strategy", "rest")
        time_needed = recovery.get("time_needed", 15)
        return f"🔄 {strategy.replace('_', ' ').title()} plan: {time_needed} minutes to recharge"

    # Helper methods
    async def _store_energy_reading(self, user_id: str, assessment: dict[str, Any]) -> None:
        """Store energy reading in database"""
        try:
            from uuid import uuid4

            reading_data = {
                "reading_id": str(uuid4()),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "energy_level": assessment["energy_level"],
                "factors": assessment["factors"],
                "context": assessment,
                "confidence": assessment.get("confidence", 0.8),
            }
            self.energy_repo.record_energy_reading(reading_data)
        except Exception as e:
            logger.error(f"Failed to store energy reading: {e}")

    async def _update_energy_profile(self, user_id: str, assessment: dict[str, Any]) -> None:
        """Update user's energy profile with new data"""
        if user_id not in self.user_energy_profiles:
            self.user_energy_profiles[user_id] = {"readings": [], "patterns": {}, "preferences": {}}

        profile = self.user_energy_profiles[user_id]
        profile["readings"].append(assessment)

        # Keep only recent readings (last 30)
        if len(profile["readings"]) > 30:
            profile["readings"] = profile["readings"][-30:]

    async def _get_circadian_adjustment(self, user_id: str, hour: int) -> float:
        """Get circadian rhythm adjustment for specific hour"""
        # Default circadian pattern
        circadian_curve = {
            0: -2.0,
            1: -2.5,
            2: -3.0,
            3: -3.0,
            4: -2.5,
            5: -2.0,
            6: -1.0,
            7: 0.0,
            8: 1.0,
            9: 1.5,
            10: 1.5,
            11: 1.0,
            12: 0.5,
            13: 0.0,
            14: -0.5,
            15: 0.0,
            16: 0.5,
            17: 1.0,
            18: 0.5,
            19: 0.0,
            20: -0.5,
            21: -1.0,
            22: -1.5,
            23: -2.0,
        }

        return circadian_curve.get(hour, 0.0)

    async def _generate_immediate_recommendations(
        self, energy_level: float, indicators: dict[str, Any]
    ) -> list[str]:
        """Generate personalized immediate energy recommendations with AI"""
        # Try AI-powered recommendations first
        if self.openai_client:
            try:
                factors_str = ", ".join(indicators.get("primary_factors", []))
                inds = indicators.get("indicators", {})

                prompt = f"""Generate 3 immediate, actionable recommendations to optimize energy.

Current State:
- Energy level: {energy_level:.1f}/10
- Primary factors: {factors_str}
- Sleep quality: {inds.get('sleep_quality', 7)}/10
- Stress: {inds.get('stress_level', 5)}/10
- Hydration: {inds.get('hydration', 5)}/10
- Recent activity: {inds.get('recent_activity', 'unknown')}

Requirements:
- 3 specific, actionable recommendations
- Can be done immediately (0-10 minutes)
- Address current energy state and factors
- Practical and realistic

Return JSON array of 3 strings.
Example: ["Take a 5-minute walk outside", "Drink 16oz of water", "Practice 2 minutes of deep breathing"]"""

                response = await self.openai_client.chat.completions.create(
                    model=self.ai_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an energy optimization AI. Return ONLY a JSON array of 3 strings.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.5,
                    max_tokens=200,
                )

                import json

                ai_recommendations = json.loads(response.choices[0].message.content.strip())
                if isinstance(ai_recommendations, list) and len(ai_recommendations) == 3:
                    return ai_recommendations
            except Exception as ai_error:
                logging.debug(f"AI recommendation generation failed, using fallback: {ai_error}")

        # Fallback to heuristic recommendations
        recommendations = []

        if energy_level < 4.0:
            recommendations.extend(["Take a 5-minute walk", "Drink water", "Get fresh air"])
        elif energy_level < 6.0:
            recommendations.extend(["Brief stretching", "Deep breathing", "Healthy snack"])
        else:
            recommendations.extend(["Maintain momentum", "Tackle challenging tasks"])

        # Factor-specific recommendations
        factors = indicators.get("primary_factors", [])
        if "poor_sleep" in factors:
            recommendations.append("Consider a 10-minute power nap")
        if "post_lunch_dip" in factors:
            recommendations.append("Avoid heavy meals, try protein snack")

        return recommendations[:3]
