"""
Tests for progress visualization system.

Test progress chart creation, data processing, and dashboard generation
for various visualization types and user scenarios.
"""

from datetime import datetime, timedelta

import pytest

from proxy_agent_platform.gamification.progress_visualizer import (
    ChartType,
    DataPoint,
    ProgressChart,
    ProgressVisualizer,
    TimeRange,
)


class TestDataPoint:
    """Test cases for DataPoint dataclass."""

    def test_data_point_creation(self):
        """Test creating data point."""
        timestamp = datetime.now()
        point = DataPoint(
            timestamp=timestamp, value=150.0, label="Test Point", metadata={"type": "test"}
        )

        assert point.timestamp == timestamp
        assert point.value == 150.0
        assert point.label == "Test Point"
        assert point.metadata == {"type": "test"}

    def test_data_point_without_optional_fields(self):
        """Test data point with minimal fields."""
        timestamp = datetime.now()
        point = DataPoint(timestamp=timestamp, value=100.0)

        assert point.timestamp == timestamp
        assert point.value == 100.0
        assert point.label is None
        assert point.metadata is None


class TestProgressChart:
    """Test cases for ProgressChart dataclass."""

    def test_chart_creation(self):
        """Test creating progress chart."""
        data_points = [
            DataPoint(datetime.now(), 100.0, "Point 1"),
            DataPoint(datetime.now(), 150.0, "Point 2"),
        ]

        chart = ProgressChart(
            chart_type=ChartType.LINE_CHART,
            title="Test Chart",
            data_points=data_points,
            time_range=TimeRange.WEEKLY,
            unit="XP",
        )

        assert chart.chart_type == ChartType.LINE_CHART
        assert chart.title == "Test Chart"
        assert len(chart.data_points) == 2
        assert chart.time_range == TimeRange.WEEKLY
        assert chart.unit == "XP"
        assert chart.created_at is not None

    def test_chart_post_init(self):
        """Test chart post-initialization."""
        chart = ProgressChart(
            chart_type=ChartType.BAR_CHART, title="Test", data_points=[], time_range=TimeRange.DAILY
        )

        assert chart.created_at is not None
        assert chart.color_scheme is not None
        assert len(chart.color_scheme) > 0


class TestProgressVisualizer:
    """Test cases for ProgressVisualizer class."""

    @pytest.fixture
    def visualizer(self):
        """Create progress visualizer for testing."""
        return ProgressVisualizer()

    def test_initialization(self, visualizer):
        """Test visualizer initialization."""
        assert visualizer.default_colors is not None
        assert "primary" in visualizer.default_colors
        assert "success" in visualizer.default_colors

    def test_create_xp_progression_chart(self, visualizer):
        """Test XP progression chart creation."""
        # Mock XP events
        now = datetime.now()
        xp_events = [
            {
                "timestamp": now - timedelta(days=3),
                "xp_awarded": 100,
                "event_type": "task_completed",
            },
            {
                "timestamp": now - timedelta(days=2),
                "xp_awarded": 150,
                "event_type": "focus_session",
            },
            {
                "timestamp": now - timedelta(days=1),
                "xp_awarded": 80,
                "event_type": "task_completed",
            },
        ]

        chart = visualizer.create_xp_progression_chart(
            xp_events=xp_events, time_range=TimeRange.WEEKLY
        )

        assert chart.chart_type == ChartType.LINE_CHART
        assert chart.title == "XP Progression"
        assert chart.time_range == TimeRange.WEEKLY
        assert chart.unit == "XP"
        assert len(chart.data_points) == 3

        # Check cumulative XP calculation
        assert chart.data_points[0].value == 100  # First event
        assert chart.data_points[1].value == 250  # 100 + 150
        assert chart.data_points[2].value == 330  # 250 + 80

    def test_create_daily_activity_heatmap(self, visualizer):
        """Test daily activity heatmap creation."""
        # Mock activities
        now = datetime.now()
        activities = []
        for i in range(10):
            activities.append({"timestamp": now - timedelta(days=i, hours=i)})

        chart = visualizer.create_daily_activity_heatmap(activities=activities, days_back=15)

        assert chart.chart_type == ChartType.HEATMAP
        assert chart.title == "Daily Activity Heatmap"
        assert chart.time_range == TimeRange.MONTHLY
        assert chart.unit == "activities"
        assert len(chart.data_points) == 16  # 15 days back + today

    def test_create_streak_visualization(self, visualizer):
        """Test streak visualization creation."""
        streak_data = [
            {
                "streak_type": "Daily Tasks",
                "current_count": 15,
                "best_count": 25,
                "status": "active",
            },
            {
                "streak_type": "Focus Sessions",
                "current_count": 8,
                "best_count": 12,
                "status": "active",
            },
        ]

        chart = visualizer.create_streak_visualization(streak_data)

        assert chart.chart_type == ChartType.BAR_CHART
        assert chart.title == "Current Streaks"
        assert chart.time_range == TimeRange.DAILY
        assert chart.unit == "days"
        assert len(chart.data_points) == 2

        # Check streak values
        assert chart.data_points[0].value == 15
        assert chart.data_points[1].value == 8

    def test_create_achievement_progress_chart(self, visualizer):
        """Test achievement progress chart creation."""
        achievement_progress = [
            {
                "title": "Task Master",
                "progress": 75,
                "target": 100,
                "achievement_id": "task_master_100",
                "category": "productivity",
                "rarity": "uncommon",
            },
            {
                "title": "Focus Expert",
                "progress": 45,
                "target": 90,
                "achievement_id": "focus_expert",
                "category": "focus",
                "rarity": "rare",
            },
        ]

        chart = visualizer.create_achievement_progress_chart(achievement_progress)

        assert chart.chart_type == ChartType.RADIAL_PROGRESS
        assert chart.title == "Achievement Progress"
        assert chart.unit == "%"
        assert chart.max_value == 100
        assert chart.min_value == 0
        assert len(chart.data_points) == 2

        # Check percentage calculations
        assert chart.data_points[0].value == 75.0  # 75/100 * 100
        assert chart.data_points[1].value == 50.0  # 45/90 * 100

    def test_create_productivity_gauge(self, visualizer):
        """Test productivity gauge creation."""
        daily_stats = {
            "tasks_completed": 5,
            "focus_time_minutes": 120,
            "xp_earned": 250,
            "avg_energy_level": 7,
        }

        chart = visualizer.create_productivity_gauge(daily_stats, weekly_target=80)

        assert chart.chart_type == ChartType.GAUGE
        assert chart.title == "Daily Productivity"
        assert chart.time_range == TimeRange.DAILY
        assert chart.unit == "%"
        assert chart.max_value == 100
        assert chart.min_value == 0
        assert chart.target_value == 80
        assert len(chart.data_points) == 1

        # Check productivity score calculation
        score = chart.data_points[0].value
        assert 0 <= score <= 100

    def test_create_category_breakdown_chart(self, visualizer):
        """Test category breakdown chart creation."""
        task_categories = {"Work": 15, "Personal": 8, "Learning": 5, "Health": 3}

        chart = visualizer.create_category_breakdown_chart(task_categories)

        assert chart.chart_type == ChartType.PIE_CHART
        assert chart.title == "Tasks by Category"
        assert chart.time_range == TimeRange.WEEKLY
        assert chart.unit == "tasks"
        assert len(chart.data_points) == 4

        # Check category values
        values = {dp.label.split(":")[0]: dp.value for dp in chart.data_points}
        assert values["Work"] == 15
        assert values["Personal"] == 8
        assert values["Learning"] == 5
        assert values["Health"] == 3

    def test_create_level_progress_chart(self, visualizer):
        """Test level progress chart creation."""
        current_xp = 3250
        current_level = 8

        chart = visualizer.create_level_progress_chart(current_xp, current_level)

        assert chart.chart_type == ChartType.RADIAL_PROGRESS
        assert chart.title == "Level Progress"
        assert chart.time_range == TimeRange.DAILY
        assert chart.unit == "%"
        assert chart.max_value == 100
        assert chart.min_value == 0
        assert len(chart.data_points) == 1

        # Check level calculation logic
        data_point = chart.data_points[0]
        assert 0 <= data_point.value <= 100
        assert "current_level" in data_point.metadata
        assert data_point.metadata["current_level"] == 8

    def test_create_comprehensive_dashboard(self, visualizer):
        """Test comprehensive dashboard creation."""
        user_data = {
            "xp_events": [{"timestamp": datetime.now(), "xp_awarded": 100, "event_type": "task"}],
            "activities": [{"timestamp": datetime.now() - timedelta(days=1)}],
            "streaks": [
                {
                    "streak_type": "Daily Tasks",
                    "current_count": 10,
                    "best_count": 15,
                    "status": "active",
                }
            ],
            "achievement_progress": [{"title": "Test Achievement", "progress": 50, "target": 100}],
            "daily_stats": {
                "tasks_completed": 3,
                "focus_time_minutes": 90,
                "xp_earned": 180,
                "avg_energy_level": 6,
            },
            "task_categories": {"Work": 10, "Personal": 5},
            "current_xp": 2500,
            "current_level": 7,
        }

        dashboard = visualizer.create_comprehensive_dashboard(user_data)

        assert isinstance(dashboard, dict)
        assert "xp_progression" in dashboard
        assert "activity_heatmap" in dashboard
        assert "streaks" in dashboard
        assert "achievements" in dashboard
        assert "productivity" in dashboard
        assert "categories" in dashboard
        assert "level_progress" in dashboard

        # Check chart types
        assert dashboard["xp_progression"].chart_type == ChartType.LINE_CHART
        assert dashboard["activity_heatmap"].chart_type == ChartType.HEATMAP
        assert dashboard["streaks"].chart_type == ChartType.BAR_CHART

    def test_export_chart_data(self, visualizer):
        """Test chart data export functionality."""
        chart = ProgressChart(
            chart_type=ChartType.LINE_CHART,
            title="Test Chart",
            data_points=[DataPoint(datetime.now(), 100.0, "Point 1", {"type": "test"})],
            time_range=TimeRange.DAILY,
            unit="XP",
            max_value=1000.0,
            target_value=800.0,
        )

        exported_data = visualizer.export_chart_data(chart)

        assert exported_data["chart_type"] == "line_chart"
        assert exported_data["title"] == "Test Chart"
        assert exported_data["time_range"] == "daily"
        assert exported_data["unit"] == "XP"
        assert exported_data["max_value"] == 1000.0
        assert exported_data["target_value"] == 800.0
        assert len(exported_data["data"]) == 1

        # Check data point export
        data_point = exported_data["data"][0]
        assert "timestamp" in data_point
        assert data_point["value"] == 100.0
        assert data_point["label"] == "Point 1"
        assert data_point["metadata"] == {"type": "test"}

    def test_color_schemes(self, visualizer):
        """Test color scheme handling."""
        chart = visualizer.create_xp_progression_chart([])

        assert chart.color_scheme is not None
        assert len(chart.color_scheme) > 0
        assert chart.color_scheme[0] == visualizer.default_colors["primary"]

    def test_empty_data_handling(self, visualizer):
        """Test handling of empty data sets."""
        # Empty XP events
        chart = visualizer.create_xp_progression_chart([])
        assert chart.chart_type == ChartType.LINE_CHART
        assert len(chart.data_points) == 0

        # Empty activities
        chart = visualizer.create_daily_activity_heatmap([])
        assert chart.chart_type == ChartType.HEATMAP
        assert len(chart.data_points) > 0  # Should still create days

        # Empty streaks
        chart = visualizer.create_streak_visualization([])
        assert chart.chart_type == ChartType.BAR_CHART
        assert len(chart.data_points) == 0

        # Empty achievements
        chart = visualizer.create_achievement_progress_chart([])
        assert chart.chart_type == ChartType.RADIAL_PROGRESS
        assert len(chart.data_points) == 0

    def test_edge_cases(self, visualizer):
        """Test edge cases and error conditions."""
        # XP events with string timestamps
        xp_events = [
            {"timestamp": datetime.now().isoformat(), "xp_awarded": 100, "event_type": "task"}
        ]

        chart = visualizer.create_xp_progression_chart(xp_events)
        assert len(chart.data_points) == 1

        # Level progress with zero XP
        chart = visualizer.create_level_progress_chart(0, 1)
        assert chart.data_points[0].value >= 0

        # Productivity with missing stats
        chart = visualizer.create_productivity_gauge({})
        assert 0 <= chart.data_points[0].value <= 100


@pytest.mark.asyncio
class TestProgressVisualizerIntegration:
    """Integration tests for progress visualizer."""

    @pytest.fixture
    def visualizer(self):
        """Create visualizer for integration tests."""
        return ProgressVisualizer()

    async def test_real_time_chart_updates(self, visualizer):
        """Test real-time chart update scenarios."""
        # Simulate real-time XP events
        xp_events = []
        base_time = datetime.now()

        for i in range(24):  # 24 hours of events
            xp_events.append(
                {
                    "timestamp": base_time - timedelta(hours=i),
                    "xp_awarded": 50 + (i * 5),
                    "event_type": "task_completed",
                }
            )

        chart = visualizer.create_xp_progression_chart(xp_events, TimeRange.DAILY)

        assert len(chart.data_points) == 24
        # Should show cumulative progression
        assert chart.data_points[-1].value > chart.data_points[0].value

    async def test_dashboard_performance(self, visualizer):
        """Test dashboard creation performance with large datasets."""
        import time

        # Create large dataset
        large_user_data = {
            "xp_events": [
                {
                    "timestamp": datetime.now() - timedelta(minutes=i),
                    "xp_awarded": 10,
                    "event_type": "task",
                }
                for i in range(1000)  # 1000 events
            ],
            "activities": [
                {"timestamp": datetime.now() - timedelta(hours=i)}
                for i in range(720)  # 30 days of hourly activities
            ],
            "current_xp": 50000,
            "current_level": 25,
        }

        start_time = time.time()
        dashboard = visualizer.create_comprehensive_dashboard(large_user_data)
        end_time = time.time()

        # Should complete within reasonable time
        assert end_time - start_time < 5.0  # 5 seconds max

        # Verify dashboard completeness
        assert "xp_progression" in dashboard
        assert "activity_heatmap" in dashboard
        assert len(dashboard["xp_progression"].data_points) == 1000

    async def test_chart_data_consistency(self, visualizer):
        """Test data consistency across different chart types."""
        user_data = {
            "xp_events": [{"timestamp": datetime.now(), "xp_awarded": 100}],
            "current_xp": 1000,
            "current_level": 5,
        }

        dashboard = visualizer.create_comprehensive_dashboard(user_data)

        # Check XP consistency
        xp_chart = dashboard["xp_progression"]
        level_chart = dashboard["level_progress"]

        assert len(xp_chart.data_points) > 0
        assert len(level_chart.data_points) > 0

        # Export and verify structure
        exported_xp = visualizer.export_chart_data(xp_chart)
        exported_level = visualizer.export_chart_data(level_chart)

        assert "chart_type" in exported_xp
        assert "data" in exported_xp
        assert "chart_type" in exported_level
        assert "data" in exported_level


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
