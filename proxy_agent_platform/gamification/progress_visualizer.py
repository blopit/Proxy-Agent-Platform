"""
Progress visualization components for gamification dashboards.

Generates visual progress data for user dashboards including XP progression,
streak visualization, achievement progress, and productivity charts.
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from enum import Enum
from typing import Any


class ChartType(str, Enum):
    """Types of progress charts available."""

    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    RADIAL_PROGRESS = "radial_progress"
    HEATMAP = "heatmap"
    GAUGE = "gauge"
    CALENDAR_VIEW = "calendar_view"


class TimeRange(str, Enum):
    """Time ranges for progress visualization."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


@dataclass
class DataPoint:
    """Single data point for visualization."""

    timestamp: datetime
    value: float
    label: str | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class ProgressChart:
    """Data structure for progress charts."""

    chart_type: ChartType
    title: str
    data_points: list[DataPoint]
    time_range: TimeRange
    unit: str = ""
    color_scheme: list[str] = None
    max_value: float | None = None
    min_value: float | None = None
    target_value: float | None = None
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.color_scheme is None:
            self.color_scheme = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]


class ProgressVisualizer:
    """
    Creates visual progress data for gamification dashboards.

    Generates various chart types and progress visualizations to help users
    track their productivity, XP growth, streaks, and achievement progress.
    """

    def __init__(self):
        """Initialize the progress visualizer."""
        self.default_colors = {
            "primary": "#3B82F6",
            "success": "#10B981",
            "warning": "#F59E0B",
            "danger": "#EF4444",
            "info": "#06B6D4",
            "purple": "#8B5CF6",
        }

    def create_xp_progression_chart(
        self, xp_events: list[dict[str, Any]], time_range: TimeRange = TimeRange.WEEKLY
    ) -> ProgressChart:
        """
        Create XP progression chart over time.

        Args:
            xp_events: List of XP events with timestamps and XP values
            time_range: Time range for the chart

        Returns:
            Progress chart showing XP growth
        """
        # Process XP events into cumulative totals
        data_points = []
        cumulative_xp = 0

        # Sort events by timestamp
        sorted_events = sorted(xp_events, key=lambda x: x.get("timestamp", datetime.now()))

        for event in sorted_events:
            cumulative_xp += event.get("xp_awarded", 0)
            timestamp = event.get("timestamp", datetime.now())
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp)

            data_points.append(
                DataPoint(
                    timestamp=timestamp,
                    value=cumulative_xp,
                    label=f"{cumulative_xp} XP",
                    metadata={
                        "event_type": event.get("event_type", "unknown"),
                        "xp_this_event": event.get("xp_awarded", 0),
                    },
                )
            )

        return ProgressChart(
            chart_type=ChartType.LINE_CHART,
            title="XP Progression",
            data_points=data_points,
            time_range=time_range,
            unit="XP",
            color_scheme=[self.default_colors["primary"]],
        )

    def create_daily_activity_heatmap(
        self, activities: list[dict[str, Any]], days_back: int = 30
    ) -> ProgressChart:
        """
        Create daily activity heatmap showing productivity patterns.

        Args:
            activities: List of activities with timestamps
            days_back: Number of days to include in heatmap

        Returns:
            Heatmap chart showing daily activity intensity
        """
        # Create daily activity counts
        end_date = date.today()
        start_date = end_date - timedelta(days=days_back)

        daily_counts = {}
        current_date = start_date
        while current_date <= end_date:
            daily_counts[current_date] = 0
            current_date += timedelta(days=1)

        # Count activities per day
        for activity in activities:
            activity_date = activity.get("timestamp", datetime.now())
            if isinstance(activity_date, str):
                activity_date = datetime.fromisoformat(activity_date)

            activity_date = activity_date.date()
            if start_date <= activity_date <= end_date:
                daily_counts[activity_date] += 1

        # Convert to data points
        data_points = []
        for day, count in daily_counts.items():
            data_points.append(
                DataPoint(
                    timestamp=datetime.combine(day, datetime.min.time()),
                    value=count,
                    label=f"{count} activities",
                    metadata={"date": day.isoformat()},
                )
            )

        max_activity = max(daily_counts.values()) if daily_counts.values() else 1

        return ProgressChart(
            chart_type=ChartType.HEATMAP,
            title="Daily Activity Heatmap",
            data_points=data_points,
            time_range=TimeRange.MONTHLY,
            unit="activities",
            max_value=max_activity,
            color_scheme=["#EEF2FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#3B82F6"],
        )

    def create_streak_visualization(self, streak_data: list[dict[str, Any]]) -> ProgressChart:
        """
        Create visualization for current streaks.

        Args:
            streak_data: List of streak information

        Returns:
            Chart showing current streak status
        """
        data_points = []

        for i, streak in enumerate(streak_data):
            streak_type = streak.get("streak_type", "Unknown")
            current_count = streak.get("current_count", 0)
            best_count = streak.get("best_count", 0)
            status = streak.get("status", "broken")

            # Use current timestamp with small offset for each streak
            timestamp = datetime.now() + timedelta(seconds=i)

            data_points.append(
                DataPoint(
                    timestamp=timestamp,
                    value=current_count,
                    label=f"{streak_type}: {current_count} days",
                    metadata={
                        "streak_type": streak_type,
                        "best_count": best_count,
                        "status": status,
                        "percentage_of_best": (current_count / best_count * 100)
                        if best_count > 0
                        else 0,
                    },
                )
            )

        max_streak = max([dp.value for dp in data_points]) if data_points else 1

        return ProgressChart(
            chart_type=ChartType.BAR_CHART,
            title="Current Streaks",
            data_points=data_points,
            time_range=TimeRange.DAILY,
            unit="days",
            max_value=max_streak,
            color_scheme=[self.default_colors["success"], self.default_colors["warning"]],
        )

    def create_achievement_progress_chart(
        self, achievement_progress: list[dict[str, Any]]
    ) -> ProgressChart:
        """
        Create chart showing progress toward achievements.

        Args:
            achievement_progress: List of achievements with progress data

        Returns:
            Chart showing achievement completion progress
        """
        data_points = []

        for i, achievement in enumerate(achievement_progress):
            title = achievement.get("title", "Unknown Achievement")
            progress = achievement.get("progress", 0)
            target = achievement.get("target", 100)
            percentage = (progress / target * 100) if target > 0 else 0

            timestamp = datetime.now() + timedelta(seconds=i)

            data_points.append(
                DataPoint(
                    timestamp=timestamp,
                    value=percentage,
                    label=f"{title}: {progress}/{target}",
                    metadata={
                        "achievement_id": achievement.get("achievement_id"),
                        "progress": progress,
                        "target": target,
                        "category": achievement.get("category", "unknown"),
                        "rarity": achievement.get("rarity", "common"),
                    },
                )
            )

        return ProgressChart(
            chart_type=ChartType.RADIAL_PROGRESS,
            title="Achievement Progress",
            data_points=data_points,
            time_range=TimeRange.DAILY,
            unit="%",
            max_value=100,
            min_value=0,
            color_scheme=[
                self.default_colors["success"],  # Completed
                self.default_colors["primary"],  # In progress
                self.default_colors["info"],  # Not started
            ],
        )

    def create_productivity_gauge(
        self, daily_stats: dict[str, Any], weekly_target: int | None = None
    ) -> ProgressChart:
        """
        Create productivity gauge showing daily performance.

        Args:
            daily_stats: Dictionary with daily productivity metrics
            weekly_target: Optional weekly target for comparison

        Returns:
            Gauge chart showing productivity level
        """
        # Calculate productivity score based on various factors
        tasks_completed = daily_stats.get("tasks_completed", 0)
        focus_time = daily_stats.get("focus_time_minutes", 0)
        xp_earned = daily_stats.get("xp_earned", 0)
        energy_level = daily_stats.get("avg_energy_level", 5)

        # Weighted productivity score (0-100)
        productivity_score = min(
            100,
            (
                (tasks_completed * 20)
                + (focus_time / 6)  # 6 minutes = 1 point
                + (xp_earned / 10)  # 10 XP = 1 point
                + (energy_level * 5)  # Energy level 1-10, weighted by 5
            ),
        )

        # Determine color based on score
        if productivity_score >= 80:
            color = self.default_colors["success"]
        elif productivity_score >= 60:
            color = self.default_colors["primary"]
        elif productivity_score >= 40:
            color = self.default_colors["warning"]
        else:
            color = self.default_colors["danger"]

        data_point = DataPoint(
            timestamp=datetime.now(),
            value=productivity_score,
            label=f"Productivity: {productivity_score:.0f}%",
            metadata={
                "tasks_completed": tasks_completed,
                "focus_time": focus_time,
                "xp_earned": xp_earned,
                "energy_level": energy_level,
            },
        )

        return ProgressChart(
            chart_type=ChartType.GAUGE,
            title="Daily Productivity",
            data_points=[data_point],
            time_range=TimeRange.DAILY,
            unit="%",
            max_value=100,
            min_value=0,
            target_value=weekly_target,
            color_scheme=[color],
        )

    def create_category_breakdown_chart(self, task_categories: dict[str, int]) -> ProgressChart:
        """
        Create pie chart showing task completion by category.

        Args:
            task_categories: Dictionary mapping categories to completion counts

        Returns:
            Pie chart showing category distribution
        """
        data_points = []
        colors = [
            self.default_colors["primary"],
            self.default_colors["success"],
            self.default_colors["warning"],
            self.default_colors["info"],
            self.default_colors["purple"],
            self.default_colors["danger"],
        ]

        for i, (category, count) in enumerate(task_categories.items()):
            data_points.append(
                DataPoint(
                    timestamp=datetime.now(),
                    value=count,
                    label=f"{category}: {count}",
                    metadata={"category": category, "color": colors[i % len(colors)]},
                )
            )

        return ProgressChart(
            chart_type=ChartType.PIE_CHART,
            title="Tasks by Category",
            data_points=data_points,
            time_range=TimeRange.WEEKLY,
            unit="tasks",
            color_scheme=colors,
        )

    def create_level_progress_chart(self, current_xp: int, current_level: int) -> ProgressChart:
        """
        Create level progression chart showing XP progress to next level.

        Args:
            current_xp: Current total XP
            current_level: Current user level

        Returns:
            Progress chart showing level advancement
        """
        # Calculate level progression using the same formula as gamification service
        # Level = sqrt(xp / 100), so XP for level N = N^2 * 100
        current_level_xp = (current_level**2) * 100
        next_level_xp = ((current_level + 1) ** 2) * 100
        xp_in_level = current_xp - current_level_xp
        xp_needed_for_next = next_level_xp - current_level_xp

        # Ensure progress percentage is between 0 and 100
        if xp_needed_for_next <= 0:
            progress_percentage = 100
        else:
            progress_percentage = max(0, min(100, (xp_in_level / xp_needed_for_next * 100)))

        data_point = DataPoint(
            timestamp=datetime.now(),
            value=progress_percentage,
            label=f"Level {current_level} → {current_level + 1}",
            metadata={
                "current_level": current_level,
                "current_xp": current_xp,
                "xp_in_level": xp_in_level,
                "xp_needed": xp_needed_for_next - xp_in_level,
                "next_level_xp": next_level_xp,
            },
        )

        return ProgressChart(
            chart_type=ChartType.RADIAL_PROGRESS,
            title="Level Progress",
            data_points=[data_point],
            time_range=TimeRange.DAILY,
            unit="%",
            max_value=100,
            min_value=0,
            color_scheme=[self.default_colors["purple"]],
        )

    def create_comprehensive_dashboard(self, user_data: dict[str, Any]) -> dict[str, ProgressChart]:
        """
        Create comprehensive dashboard with multiple charts.

        Args:
            user_data: Complete user data for visualization

        Returns:
            Dictionary of chart names to ProgressChart objects
        """
        dashboard = {}

        # XP progression
        if "xp_events" in user_data:
            dashboard["xp_progression"] = self.create_xp_progression_chart(user_data["xp_events"])

        # Activity heatmap
        if "activities" in user_data:
            dashboard["activity_heatmap"] = self.create_daily_activity_heatmap(
                user_data["activities"]
            )

        # Streak visualization
        if "streaks" in user_data:
            dashboard["streaks"] = self.create_streak_visualization(user_data["streaks"])

        # Achievement progress
        if "achievement_progress" in user_data:
            dashboard["achievements"] = self.create_achievement_progress_chart(
                user_data["achievement_progress"]
            )

        # Productivity gauge
        if "daily_stats" in user_data:
            dashboard["productivity"] = self.create_productivity_gauge(user_data["daily_stats"])

        # Category breakdown
        if "task_categories" in user_data:
            dashboard["categories"] = self.create_category_breakdown_chart(
                user_data["task_categories"]
            )

        # Level progress
        if "current_xp" in user_data and "current_level" in user_data:
            dashboard["level_progress"] = self.create_level_progress_chart(
                user_data["current_xp"], user_data["current_level"]
            )

        return dashboard

    def export_chart_data(self, chart: ProgressChart) -> dict[str, Any]:
        """
        Export chart data in format suitable for frontend visualization.

        Args:
            chart: Progress chart to export

        Returns:
            Dictionary with chart configuration and data
        """
        return {
            "chart_type": chart.chart_type.value,
            "title": chart.title,
            "time_range": chart.time_range.value,
            "unit": chart.unit,
            "color_scheme": chart.color_scheme,
            "max_value": chart.max_value,
            "min_value": chart.min_value,
            "target_value": chart.target_value,
            "data": [
                {
                    "timestamp": dp.timestamp.isoformat(),
                    "value": dp.value,
                    "label": dp.label,
                    "metadata": dp.metadata,
                }
                for dp in chart.data_points
            ],
            "created_at": chart.created_at.isoformat(),
        }
