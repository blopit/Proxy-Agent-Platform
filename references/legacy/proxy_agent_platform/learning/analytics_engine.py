"""
Productivity analytics and insights engine.

Analyzes productivity trends, performance correlations, and provides
predictive insights for goal achievement and optimization.
"""

import statistics
from datetime import datetime
from typing import Any


class ProductivityAnalytics:
    """Analyzes productivity data and generates insights."""

    def __init__(self):
        """Initialize the productivity analytics engine."""
        self.significance_threshold = 0.5  # Minimum correlation for significance

    async def analyze_productivity_trends(
        self, productivity_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Analyze productivity trends over time.

        Args:
            productivity_data: Daily productivity metrics and data

        Returns:
            Dictionary containing trend analysis and insights
        """
        daily_metrics = productivity_data.get("daily_metrics", [])

        if not daily_metrics:
            return {
                "trend_direction": "insufficient_data",
                "key_metrics": {},
                "insights": ["Not enough data to analyze trends"],
                "recommendations": ["Continue tracking daily metrics"],
            }

        # Extract key metrics
        dates = [datetime.fromisoformat(m["date"]) for m in daily_metrics]
        tasks_completed = [m["tasks_completed"] for m in daily_metrics]
        focus_time = [m["focus_time"] for m in daily_metrics]
        xp_earned = [m["xp_earned"] for m in daily_metrics]

        # Calculate trends for each metric
        trend_direction = self._calculate_overall_trend(daily_metrics)
        key_metrics = self._calculate_key_metrics(daily_metrics)

        # Generate insights
        insights = self._generate_productivity_insights(daily_metrics, trend_direction, key_metrics)

        # Generate recommendations
        recommendations = self._generate_productivity_recommendations(daily_metrics, insights)

        return {
            "trend_direction": trend_direction,
            "key_metrics": key_metrics,
            "insights": insights,
            "recommendations": recommendations,
        }

    async def analyze_performance_correlations(
        self, correlation_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Analyze correlations between performance factors.

        Args:
            correlation_data: Variables to analyze for correlations

        Returns:
            Dictionary containing correlation analysis and insights
        """
        variables = correlation_data.get("variables", {})

        if len(variables) < 2:
            return {
                "correlations": {},
                "significant_factors": [],
                "actionable_insights": ["Need more variables to analyze correlations"],
            }

        # Calculate correlations between all variable pairs
        correlations = self._calculate_correlations(variables)

        # Identify significant factors
        significant_factors = self._identify_significant_factors(correlations)

        # Generate actionable insights
        actionable_insights = self._generate_correlation_insights(correlations, variables)

        return {
            "correlations": correlations,
            "significant_factors": significant_factors,
            "actionable_insights": actionable_insights,
        }

    async def predict_goal_achievement(self, goal_data: dict[str, Any]) -> dict[str, Any]:
        """
        Predict likelihood of goal achievement.

        Args:
            goal_data: Goal information and historical performance

        Returns:
            Dictionary containing achievement prediction and success strategies
        """
        goal = goal_data.get("goal", {})
        historical_performance = goal_data.get("historical_performance", {})

        target = goal.get("target", "")
        deadline = goal.get("deadline", "")
        current_progress = goal.get("current_progress", 0)
        days_remaining = goal.get("days_remaining", 0)

        # Extract target number if it's in the string
        target_number = self._extract_target_number(target)

        if not target_number or days_remaining <= 0:
            return {
                "achievement_probability": 0.0,
                "required_daily_rate": 0.0,
                "success_strategies": ["Goal parameters need clarification"],
            }

        # Calculate required daily rate
        remaining_work = target_number - current_progress
        required_daily_rate = (
            remaining_work / days_remaining if days_remaining > 0 else float("inf")
        )

        # Calculate achievement probability
        achievement_probability = self._calculate_achievement_probability(
            current_progress, target_number, days_remaining, historical_performance
        )

        # Generate success strategies
        success_strategies = self._generate_success_strategies(
            achievement_probability, required_daily_rate, historical_performance
        )

        return {
            "achievement_probability": achievement_probability,
            "required_daily_rate": required_daily_rate,
            "success_strategies": success_strategies,
        }

    def _calculate_overall_trend(self, daily_metrics: list[dict[str, Any]]) -> str:
        """Calculate overall productivity trend direction."""
        if len(daily_metrics) < 3:
            return "insufficient_data"

        # Calculate trends for key metrics
        tasks_trend = self._calculate_metric_trend([m["tasks_completed"] for m in daily_metrics])
        focus_trend = self._calculate_metric_trend([m["focus_time"] for m in daily_metrics])
        xp_trend = self._calculate_metric_trend([m["xp_earned"] for m in daily_metrics])

        # Determine overall trend
        positive_trends = sum(1 for trend in [tasks_trend, focus_trend, xp_trend] if trend > 0.1)
        negative_trends = sum(1 for trend in [tasks_trend, focus_trend, xp_trend] if trend < -0.1)

        if positive_trends > negative_trends:
            return "improving"
        elif negative_trends > positive_trends:
            return "declining"
        else:
            return "stable"

    def _calculate_metric_trend(self, values: list[float]) -> float:
        """Calculate trend slope for a single metric."""
        if len(values) < 2:
            return 0.0

        x = list(range(len(values)))
        y = values

        # Simple linear regression
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))

        if n * sum_x2 - sum_x**2 == 0:
            return 0.0

        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x**2)
        return slope

    def _calculate_key_metrics(self, daily_metrics: list[dict[str, Any]]) -> dict[str, Any]:
        """Calculate key productivity metrics."""
        tasks_completed = [m["tasks_completed"] for m in daily_metrics]
        focus_time = [m["focus_time"] for m in daily_metrics]
        xp_earned = [m["xp_earned"] for m in daily_metrics]

        return {
            "avg_tasks_per_day": statistics.mean(tasks_completed),
            "avg_focus_time": statistics.mean(focus_time),
            "avg_xp_per_day": statistics.mean(xp_earned),
            "total_days_tracked": len(daily_metrics),
            "best_day": {
                "tasks": max(tasks_completed),
                "focus_time": max(focus_time),
                "xp": max(xp_earned),
            },
            "consistency_score": self._calculate_consistency_score(daily_metrics),
        }

    def _calculate_consistency_score(self, daily_metrics: list[dict[str, Any]]) -> float:
        """Calculate consistency score based on daily variation."""
        tasks_completed = [m["tasks_completed"] for m in daily_metrics]

        if len(tasks_completed) < 2:
            return 1.0

        avg_tasks = statistics.mean(tasks_completed)
        std_tasks = statistics.stdev(tasks_completed)

        # Lower coefficient of variation = higher consistency
        if avg_tasks > 0:
            cv = std_tasks / avg_tasks
            consistency = max(0.0, 1.0 - cv)
        else:
            consistency = 0.0

        return consistency

    def _generate_productivity_insights(
        self, daily_metrics: list[dict], trend_direction: str, key_metrics: dict[str, Any]
    ) -> list[str]:
        """Generate insights based on productivity analysis."""
        insights = []

        # Trend insights
        if trend_direction == "improving":
            insights.append("Your productivity is trending upward - great momentum!")
        elif trend_direction == "declining":
            insights.append("Productivity has been declining - time for a strategy adjustment")
        else:
            insights.append("Your productivity is stable - consider setting new challenges")

        # Consistency insights
        consistency = key_metrics.get("consistency_score", 0.5)
        if consistency > 0.8:
            insights.append("Excellent consistency in daily performance")
        elif consistency < 0.5:
            insights.append("High variability in daily performance - focus on building routines")

        # Performance insights
        avg_tasks = key_metrics.get("avg_tasks_per_day", 0)
        if avg_tasks > 8:
            insights.append("High task completion rate - you're very productive!")
        elif avg_tasks < 4:
            insights.append("Consider breaking down larger tasks or setting more daily goals")

        return insights

    def _generate_productivity_recommendations(
        self, daily_metrics: list[dict], insights: list[str]
    ) -> list[str]:
        """Generate actionable recommendations."""
        recommendations = []

        # Analyze recent patterns
        if len(daily_metrics) >= 3:
            recent_metrics = daily_metrics[-3:]
            recent_avg_tasks = statistics.mean([m["tasks_completed"] for m in recent_metrics])
            recent_avg_focus = statistics.mean([m["focus_time"] for m in recent_metrics])

            if recent_avg_tasks < 5:
                recommendations.append("Try time-blocking to increase daily task completion")

            if recent_avg_focus < 180:  # Less than 3 hours
                recommendations.append(
                    "Consider using focus techniques like Pomodoro to increase concentration time"
                )

        # Generic recommendations based on insights
        if "declining" in str(insights):
            recommendations.append(
                "Review what changed recently - schedule, habits, or environment"
            )

        if "variability" in str(insights):
            recommendations.append("Establish consistent daily routines and time blocks")

        if not recommendations:
            recommendations.append("Continue current approach - performance looks good!")

        return recommendations

    def _calculate_correlations(self, variables: dict[str, list[float]]) -> dict[str, float]:
        """Calculate Pearson correlations between all variable pairs."""
        correlations = {}
        var_names = list(variables.keys())

        for i in range(len(var_names)):
            for j in range(i + 1, len(var_names)):
                var1_name = var_names[i]
                var2_name = var_names[j]
                var1_values = variables[var1_name]
                var2_values = variables[var2_name]

                correlation = self._pearson_correlation(var1_values, var2_values)
                correlations[f"{var1_name}_vs_{var2_name}"] = correlation

        return correlations

    def _pearson_correlation(self, x: list[float], y: list[float]) -> float:
        """Calculate Pearson correlation coefficient."""
        if len(x) != len(y) or len(x) < 2:
            return 0.0

        mean_x = statistics.mean(x)
        mean_y = statistics.mean(y)

        numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x)))
        sum_sq_x = sum((x[i] - mean_x) ** 2 for i in range(len(x)))
        sum_sq_y = sum((y[i] - mean_y) ** 2 for i in range(len(y)))

        denominator = (sum_sq_x * sum_sq_y) ** 0.5

        if denominator == 0:
            return 0.0

        return numerator / denominator

    def _identify_significant_factors(self, correlations: dict[str, float]) -> list[str]:
        """Identify statistically significant correlation factors."""
        significant = []

        for pair, correlation in correlations.items():
            if abs(correlation) >= self.significance_threshold:
                strength = "strong" if abs(correlation) > 0.7 else "moderate"
                direction = "positive" if correlation > 0 else "negative"
                significant.append(
                    {
                        "variables": pair,
                        "correlation": correlation,
                        "strength": strength,
                        "direction": direction,
                    }
                )

        return significant

    def _generate_correlation_insights(
        self, correlations: dict[str, float], variables: dict[str, list[float]]
    ) -> list[str]:
        """Generate actionable insights from correlation analysis."""
        insights = []

        # Analyze specific important correlations
        for pair, correlation in correlations.items():
            if abs(correlation) >= self.significance_threshold:
                var1, var2 = pair.split("_vs_")

                if "sleep" in var1.lower() and "productivity" in var2.lower():
                    if correlation > 0:
                        insights.append("Better sleep is strongly linked to higher productivity")
                    else:
                        insights.append("Sleep issues may be impacting your productivity")

                elif "exercise" in var1.lower() and "productivity" in var2.lower():
                    if correlation > 0:
                        insights.append("Exercise appears to boost your productivity")

                elif "stress" in var1.lower() and "productivity" in var2.lower():
                    if correlation < 0:
                        insights.append("Higher stress levels correlate with lower productivity")

        if not insights:
            insights.append("Continue tracking to identify patterns in your performance factors")

        return insights

    def _extract_target_number(self, target_string: str) -> int:
        """Extract numeric target from goal string."""
        # Simple extraction - look for numbers in the string
        import re

        numbers = re.findall(r"\d+", target_string)
        return int(numbers[0]) if numbers else 0

    def _calculate_achievement_probability(
        self,
        current_progress: int,
        target: int,
        days_remaining: int,
        historical_performance: dict[str, Any],
    ) -> float:
        """Calculate probability of achieving the goal."""
        if days_remaining <= 0 or target <= current_progress:
            return 1.0 if target <= current_progress else 0.0

        # Required daily rate to achieve goal
        remaining_work = target - current_progress
        required_daily_rate = remaining_work / days_remaining

        # Historical average daily rate
        avg_daily_rate = historical_performance.get("average_daily_tasks", 3.0)
        consistency_score = historical_performance.get("consistency_score", 0.7)

        # Base probability on historical performance
        if required_daily_rate <= avg_daily_rate * 0.8:
            base_probability = 0.9
        elif required_daily_rate <= avg_daily_rate:
            base_probability = 0.7
        elif required_daily_rate <= avg_daily_rate * 1.2:
            base_probability = 0.5
        elif required_daily_rate <= avg_daily_rate * 1.5:
            base_probability = 0.3
        else:
            base_probability = 0.1

        # Adjust for consistency
        consistency_adjustment = (consistency_score - 0.5) * 0.2
        adjusted_probability = base_probability + consistency_adjustment

        # Adjust for recent trend
        recent_trend = historical_performance.get("recent_trend", "stable")
        if recent_trend == "improving":
            adjusted_probability += 0.1
        elif recent_trend == "declining":
            adjusted_probability -= 0.1

        return max(0.0, min(1.0, adjusted_probability))

    def _generate_success_strategies(
        self, probability: float, required_rate: float, historical_performance: dict[str, Any]
    ) -> list[str]:
        """Generate strategies to improve goal achievement likelihood."""
        strategies = []

        avg_daily_rate = historical_performance.get("average_daily_tasks", 3.0)

        if probability < 0.3:
            strategies.append("Goal is ambitious - consider breaking it into smaller milestones")
            strategies.append(
                f"Need to increase daily rate from {avg_daily_rate:.1f} to {required_rate:.1f} tasks"
            )

        elif probability < 0.7:
            strategies.append("Goal is achievable with focused effort")
            strategies.append("Consider time-blocking and eliminating distractions")

        else:
            strategies.append("Goal is highly achievable - maintain current momentum")

        # Rate-specific strategies
        if required_rate > avg_daily_rate * 1.3:
            strategies.append("Focus on your most productive time periods")
            strategies.append("Consider task batching and automation where possible")

        # Consistency strategies
        consistency = historical_performance.get("consistency_score", 0.7)
        if consistency < 0.6:
            strategies.append("Build more consistent daily habits and routines")

        return strategies
