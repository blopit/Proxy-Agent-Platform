"""
Energy level prediction and modeling system.

Predicts user energy levels based on historical data, circadian rhythms,
and contextual factors to optimize task scheduling.
"""

import statistics
from collections import defaultdict
from datetime import datetime
from typing import Any


class EnergyPredictor:
    """Predicts user energy levels for optimal scheduling."""

    def __init__(self):
        """Initialize the energy predictor."""
        self.confidence_threshold = 0.7

    async def predict_next_hours(
        self, historical_data: dict[str, Any], hours: int = 4
    ) -> dict[str, Any]:
        """
        Predict energy levels for the next N hours.

        Args:
            historical_data: Historical energy data and context factors
            hours: Number of hours to predict

        Returns:
            Dictionary containing predictions and confidence intervals
        """
        energy_history = historical_data.get("energy_history", [])
        context_factors = historical_data.get("context_factors", {})

        if not energy_history:
            # Default predictions if no history
            return self._default_predictions(hours)

        # Extract time-based patterns
        hourly_patterns = self._extract_hourly_patterns(energy_history)

        # Generate predictions
        current_hour = datetime.now().hour
        predictions = []
        confidence_intervals = []

        for i in range(hours):
            future_hour = (current_hour + i + 1) % 24
            predicted_energy, confidence = self._predict_single_hour(
                future_hour, hourly_patterns, context_factors
            )

            predictions.append(
                {
                    "hour": future_hour,
                    "predicted_energy": predicted_energy,
                    "confidence": confidence,
                }
            )

            # Calculate confidence interval (±1 standard deviation)
            std_dev = 0.1 * (1 - confidence)  # Lower confidence = higher uncertainty
            confidence_intervals.append(
                {
                    "hour": future_hour,
                    "lower_bound": max(0.0, predicted_energy - std_dev),
                    "upper_bound": min(1.0, predicted_energy + std_dev),
                }
            )

        # Identify influencing factors
        influencing_factors = self._analyze_context_impact(context_factors)

        return {
            "predictions": predictions,
            "confidence_intervals": confidence_intervals,
            "influencing_factors": influencing_factors,
        }

    async def analyze_long_term_trends(self, trend_data: dict[str, Any]) -> dict[str, Any]:
        """
        Analyze long-term energy trends and patterns.

        Args:
            trend_data: Weekly and daily energy pattern data

        Returns:
            Dictionary containing trend analysis and seasonal effects
        """
        daily_averages = trend_data.get("daily_averages", [])
        weekly_patterns = trend_data.get("weekly_patterns", {})

        # Analyze weekly pattern strength
        weekly_pattern = self._analyze_weekly_pattern(weekly_patterns)

        # Determine trend direction from daily averages
        trend_direction = self._calculate_trend_direction(daily_averages)

        # Identify seasonal effects (simplified)
        seasonal_effects = self._identify_seasonal_effects(daily_averages)

        return {
            "weekly_pattern": weekly_pattern,
            "trend_direction": trend_direction,
            "seasonal_effects": seasonal_effects,
        }

    async def predict_with_context(self, context_data: dict[str, Any]) -> dict[str, Any]:
        """
        Predict energy with contextual factors included.

        Args:
            context_data: External and personal context factors

        Returns:
            Dictionary containing contextual predictions and recommendations
        """
        external_factors = context_data.get("external_factors", {})
        personal_factors = context_data.get("personal_factors", {})

        # Base energy prediction (default circadian rhythm)
        current_hour = datetime.now().hour
        base_energy = self._get_circadian_baseline(current_hour)

        # Apply contextual adjustments
        energy_adjustments = {}

        # Personal factor impacts
        sleep_hours = personal_factors.get("sleep_hours", 7.5)
        exercise_yesterday = personal_factors.get("exercise_yesterday", False)
        stress_level = personal_factors.get("stress_level", 0.5)

        # Sleep impact
        if sleep_hours < 6:
            energy_adjustments["sleep_deficit"] = -0.3
        elif sleep_hours > 8:
            energy_adjustments["sleep_bonus"] = 0.1

        # Exercise impact
        if exercise_yesterday:
            energy_adjustments["exercise_boost"] = 0.15

        # Stress impact
        if stress_level > 0.7:
            energy_adjustments["high_stress"] = -0.2
        elif stress_level < 0.3:
            energy_adjustments["low_stress"] = 0.1

        # External factor impacts
        weather = external_factors.get("weather", "unknown")
        if weather == "sunny":
            energy_adjustments["sunny_weather"] = 0.1
        elif weather == "rainy":
            energy_adjustments["rainy_weather"] = -0.05

        # Calculate final prediction
        total_adjustment = sum(energy_adjustments.values())
        predicted_energy = max(0.0, min(1.0, base_energy + total_adjustment))

        # Generate context-aware recommendations
        recommendations = self._generate_energy_recommendations(
            predicted_energy, energy_adjustments
        )

        return {
            "predicted_energy": predicted_energy,
            "context_impact": energy_adjustments,
            "recommendations": recommendations,
        }

    def _extract_hourly_patterns(
        self, energy_history: list[dict[str, Any]]
    ) -> dict[int, list[float]]:
        """Extract energy patterns by hour of day."""
        hourly_patterns = defaultdict(list)

        for entry in energy_history:
            time_str = entry.get("time", "")
            energy_level = entry.get("level", 0.5)

            try:
                hour = int(time_str.split(":")[0])
                hourly_patterns[hour].append(energy_level)
            except (ValueError, IndexError):
                continue

        return dict(hourly_patterns)

    def _predict_single_hour(
        self, hour: int, hourly_patterns: dict[int, list[float]], context_factors: dict[str, Any]
    ) -> tuple[float, float]:
        """Predict energy for a single hour with confidence."""
        # Get historical average for this hour
        if hour in hourly_patterns:
            historical_values = hourly_patterns[hour]
            base_prediction = statistics.mean(historical_values)
            confidence = max(
                0.5,
                1.0 - (statistics.stdev(historical_values) if len(historical_values) > 1 else 0.5),
            )
        else:
            # Use circadian baseline if no historical data
            base_prediction = self._get_circadian_baseline(hour)
            confidence = 0.5

        # Apply context adjustments
        context_adjustment = self._calculate_context_adjustment(context_factors)
        final_prediction = max(0.0, min(1.0, base_prediction + context_adjustment))

        return final_prediction, confidence

    def _get_circadian_baseline(self, hour: int) -> float:
        """Get baseline energy based on typical circadian rhythm."""
        # Simplified circadian rhythm model
        if 6 <= hour <= 10:  # Morning peak
            return 0.8
        elif 11 <= hour <= 13:  # Late morning
            return 0.9
        elif 14 <= hour <= 16:  # Afternoon dip
            return 0.4
        elif 17 <= hour <= 19:  # Evening recovery
            return 0.7
        elif 20 <= hour <= 22:  # Evening
            return 0.6
        else:  # Night/early morning
            return 0.3

    def _calculate_context_adjustment(self, context_factors: dict[str, Any]) -> float:
        """Calculate energy adjustment based on context factors."""
        adjustment = 0.0

        sleep_quality = context_factors.get("sleep_quality", 0.7)
        adjustment += (sleep_quality - 0.7) * 0.3

        if context_factors.get("exercise", False):
            adjustment += 0.1

        caffeine_cups = context_factors.get("caffeine", 0)
        if caffeine_cups > 0:
            adjustment += min(0.2, caffeine_cups * 0.1)

        return adjustment

    def _analyze_context_impact(self, context_factors: dict[str, Any]) -> dict[str, str]:
        """Analyze which context factors most influence energy."""
        influences = {}

        sleep_quality = context_factors.get("sleep_quality", 0.7)
        if sleep_quality < 0.5:
            influences["sleep"] = "negative_strong"
        elif sleep_quality > 0.8:
            influences["sleep"] = "positive_moderate"

        if context_factors.get("exercise", False):
            influences["exercise"] = "positive_moderate"

        caffeine = context_factors.get("caffeine", 0)
        if caffeine > 2:
            influences["caffeine"] = "positive_strong"
        elif caffeine == 0:
            influences["caffeine"] = "neutral"

        return influences

    def _analyze_weekly_pattern(self, weekly_patterns: dict[str, float]) -> dict[str, Any]:
        """Analyze strength and characteristics of weekly patterns."""
        if not weekly_patterns:
            return {"strength": "weak", "characteristics": []}

        values = list(weekly_patterns.values())
        avg_energy = statistics.mean(values)
        std_energy = statistics.stdev(values) if len(values) > 1 else 0

        # Determine pattern strength
        coefficient_of_variation = std_energy / avg_energy if avg_energy > 0 else 1
        if coefficient_of_variation < 0.15:
            strength = "strong"
        elif coefficient_of_variation < 0.3:
            strength = "moderate"
        else:
            strength = "weak"

        # Identify characteristics
        characteristics = []
        sorted_days = sorted(weekly_patterns.items(), key=lambda x: x[1], reverse=True)

        if sorted_days:
            highest_day = sorted_days[0][0]
            lowest_day = sorted_days[-1][0]
            characteristics.append(f"Highest energy on {highest_day}")
            characteristics.append(f"Lowest energy on {lowest_day}")

        return {
            "strength": strength,
            "characteristics": characteristics,
            "variation": coefficient_of_variation,
        }

    def _calculate_trend_direction(self, daily_averages: list[float]) -> dict[str, Any]:
        """Calculate overall trend direction from daily averages."""
        if len(daily_averages) < 3:
            return {"direction": "insufficient_data", "strength": 0.0}

        # Simple linear regression slope
        x = list(range(len(daily_averages)))
        y = daily_averages

        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))

        # Calculate slope
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x**2)

        if slope > 0.05:
            direction = "improving"
        elif slope < -0.05:
            direction = "declining"
        else:
            direction = "stable"

        return {"direction": direction, "strength": abs(slope), "slope": slope}

    def _identify_seasonal_effects(self, daily_averages: list[float]) -> dict[str, Any]:
        """Identify potential seasonal effects (simplified)."""
        # This is a simplified implementation
        # In a real system, you'd need more data and sophisticated seasonal decomposition

        if len(daily_averages) < 7:
            return {"detected": False, "effects": []}

        # Look for patterns in recent data
        recent_avg = statistics.mean(daily_averages[-3:]) if len(daily_averages) >= 3 else 0
        overall_avg = statistics.mean(daily_averages)

        effects = []
        if recent_avg > overall_avg * 1.1:
            effects.append("Recent energy increase detected")
        elif recent_avg < overall_avg * 0.9:
            effects.append("Recent energy decrease detected")

        return {"detected": len(effects) > 0, "effects": effects}

    def _generate_energy_recommendations(
        self, predicted_energy: float, adjustments: dict[str, float]
    ) -> list[str]:
        """Generate recommendations based on predicted energy and context."""
        recommendations = []

        if predicted_energy < 0.4:
            recommendations.append("Consider scheduling light tasks or taking a break")
            if "sleep_deficit" in adjustments:
                recommendations.append("Prioritize getting adequate sleep tonight")

        elif predicted_energy > 0.7:
            recommendations.append("Good time for high-focus or challenging tasks")

        if "high_stress" in adjustments:
            recommendations.append("Consider stress-reduction activities")

        if "exercise_boost" in adjustments:
            recommendations.append("Your exercise routine is positively impacting energy")

        return recommendations

    def _default_predictions(self, hours: int) -> dict[str, Any]:
        """Generate default predictions when no historical data is available."""
        current_hour = datetime.now().hour
        predictions = []
        confidence_intervals = []

        for i in range(hours):
            future_hour = (current_hour + i + 1) % 24
            energy = self._get_circadian_baseline(future_hour)

            predictions.append(
                {
                    "hour": future_hour,
                    "predicted_energy": energy,
                    "confidence": 0.5,  # Low confidence without data
                }
            )

            confidence_intervals.append(
                {
                    "hour": future_hour,
                    "lower_bound": max(0.0, energy - 0.2),
                    "upper_bound": min(1.0, energy + 0.2),
                }
            )

        return {
            "predictions": predictions,
            "confidence_intervals": confidence_intervals,
            "influencing_factors": {
                "note": "Using default circadian patterns - no historical data"
            },
        }
