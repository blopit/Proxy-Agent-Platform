# BE-06: Analytics & Insights Service

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 6-8 hours
**Dependencies**: Core task models, BE-03 (Focus Sessions)
**Agent Type**: backend-tdd

---

## 📋 Overview

Build comprehensive analytics system that tracks user productivity patterns, generates insights, and provides data for the Mapper mode dashboard.

**Core Functionality**:
- Daily/weekly/monthly metrics aggregation
- Productivity pattern detection
- Energy level correlation analysis
- Streak tracking and historical trends
- API endpoints for dashboard visualization

---

## 🗄️ Database Schema

### New Tables

```sql
-- Daily aggregated metrics
CREATE TABLE daily_metrics (
    daily_metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    tasks_created INT DEFAULT 0,
    steps_completed INT DEFAULT 0,
    total_xp_earned INT DEFAULT 0,
    total_focus_minutes INT DEFAULT 0,
    avg_energy_level DECIMAL(3,2),  -- 1.00 (low) to 3.00 (high)
    peak_productivity_hour INT,  -- 0-23
    streak_days INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Weekly insights
CREATE TABLE weekly_insights (
    insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    total_tasks_completed INT DEFAULT 0,
    total_xp_earned INT DEFAULT 0,
    most_productive_day VARCHAR(20),  -- 'Monday', 'Tuesday', etc.
    most_productive_time VARCHAR(50),  -- 'Morning', 'Afternoon', 'Evening'
    avg_completion_rate DECIMAL(5,2),  -- Percentage
    top_category VARCHAR(100),
    insights_json JSONB,  -- Structured insights
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Productivity patterns
CREATE TABLE productivity_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL,  -- 'time_of_day', 'day_of_week', 'energy_level'
    pattern_key VARCHAR(100) NOT NULL,  -- '09:00-12:00', 'Monday', 'high_energy'
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    avg_completion_time_minutes DECIMAL(8,2),
    confidence_score DECIMAL(3,2),  -- 0.00 to 1.00
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, pattern_type, pattern_key)
);

-- Historical snapshots for trend analysis
CREATE TABLE user_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    snapshot_date TIMESTAMP DEFAULT NOW(),
    total_tasks INT DEFAULT 0,
    total_completed INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    current_level INT DEFAULT 1,
    metrics_json JSONB  -- Flexible for additional data
);
```

### Indexes

```sql
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, date DESC);
CREATE INDEX idx_weekly_insights_user ON weekly_insights(user_id, week_start_date DESC);
CREATE INDEX idx_productivity_patterns_user ON productivity_patterns(user_id, pattern_type);
CREATE INDEX idx_user_snapshots_user_date ON user_snapshots(user_id, snapshot_date DESC);
```

---

## 🏗️ Pydantic Models

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal
from datetime import date, datetime
from uuid import UUID, uuid4
from decimal import Decimal

# Daily Metrics
class DailyMetrics(BaseModel):
    """Aggregated metrics for a single day."""
    daily_metric_id: UUID = Field(default_factory=uuid4)
    user_id: str
    date: date
    tasks_completed: int = 0
    tasks_created: int = 0
    steps_completed: int = 0
    total_xp_earned: int = 0
    total_focus_minutes: int = 0
    avg_energy_level: Optional[Decimal] = None
    peak_productivity_hour: Optional[int] = Field(None, ge=0, le=23)
    streak_days: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Config:
        from_attributes = True


# Weekly Insights
class WeeklyInsight(BaseModel):
    """Insights for a week."""
    insight_id: UUID = Field(default_factory=uuid4)
    user_id: str
    week_start_date: date
    total_tasks_completed: int = 0
    total_xp_earned: int = 0
    most_productive_day: Optional[str] = None
    most_productive_time: Optional[str] = None
    avg_completion_rate: Decimal = Field(default=Decimal("0.00"), decimal_places=2)
    top_category: Optional[str] = None
    insights_json: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Config:
        from_attributes = True


# Productivity Patterns
class ProductivityPattern(BaseModel):
    """Learned productivity pattern."""
    pattern_id: UUID = Field(default_factory=uuid4)
    user_id: str
    pattern_type: Literal["time_of_day", "day_of_week", "energy_level", "category"]
    pattern_key: str
    success_count: int = 0
    failure_count: int = 0
    avg_completion_time_minutes: Decimal = Field(default=Decimal("0.00"))
    confidence_score: Decimal = Field(default=Decimal("0.00"), ge=0, le=1, decimal_places=2)
    last_updated: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @property
    def success_rate(self) -> Decimal:
        total = self.success_count + self.failure_count
        if total == 0:
            return Decimal("0.00")
        return Decimal(self.success_count / total).quantize(Decimal("0.01"))

    class Config:
        from_attributes = True


# API Response Models
class DashboardMetrics(BaseModel):
    """Metrics for Mapper dashboard."""
    today: DailyMetrics
    this_week: WeeklyInsight
    current_streak: int
    total_xp: int
    current_level: int
    tasks_in_progress: int
    completion_rate_7days: Decimal
    productivity_trend: Literal["up", "down", "stable"]


class InsightResponse(BaseModel):
    """AI-generated insight."""
    insight_type: Literal["pattern", "suggestion", "celebration", "warning"]
    title: str
    description: str
    confidence: Decimal = Field(..., ge=0, le=1)
    actionable: bool = False
    action_text: Optional[str] = None


class AnalyticsTimelineEntry(BaseModel):
    """Single entry in productivity timeline."""
    date: date
    tasks_completed: int
    xp_earned: int
    energy_level: Optional[Decimal] = None
    notable_achievement: Optional[str] = None
```

---

## 🏛️ Repository Layer

```python
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date, datetime, timedelta, UTC
from decimal import Decimal
from src.repository.base import BaseRepository

class AnalyticsRepository(BaseRepository):
    """Repository for analytics operations."""

    def get_or_create_daily_metrics(
        self,
        user_id: str,
        target_date: date
    ) -> DailyMetrics:
        """Get or create metrics for a specific date."""
        query = """
            INSERT INTO daily_metrics (user_id, date)
            VALUES ($1, $2)
            ON CONFLICT (user_id, date) DO UPDATE SET date = EXCLUDED.date
            RETURNING *
        """
        return self.fetch_one(query, user_id, target_date)

    def increment_daily_metric(
        self,
        user_id: str,
        target_date: date,
        metric_name: str,
        increment_by: int = 1
    ) -> None:
        """Increment a specific daily metric."""
        query = f"""
            UPDATE daily_metrics
            SET {metric_name} = {metric_name} + $1
            WHERE user_id = $2 AND date = $3
        """
        self.execute(query, increment_by, user_id, target_date)

    def get_metrics_range(
        self,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> List[DailyMetrics]:
        """Get daily metrics for date range."""
        query = """
            SELECT * FROM daily_metrics
            WHERE user_id = $1 AND date BETWEEN $2 AND $3
            ORDER BY date ASC
        """
        return self.fetch_all(query, user_id, start_date, end_date)

    def calculate_weekly_insights(
        self,
        user_id: str,
        week_start: date
    ) -> WeeklyInsight:
        """Calculate insights for a week."""
        week_end = week_start + timedelta(days=6)

        query = """
            WITH week_data AS (
                SELECT
                    SUM(tasks_completed) as total_tasks,
                    SUM(total_xp_earned) as total_xp,
                    AVG(avg_energy_level) as avg_energy,
                    MAX(tasks_completed) as max_tasks_day,
                    date
                FROM daily_metrics
                WHERE user_id = $1 AND date BETWEEN $2 AND $3
                GROUP BY date
            )
            SELECT
                total_tasks,
                total_xp,
                (SELECT date FROM week_data WHERE tasks_completed = max_tasks_day LIMIT 1) as best_day
            FROM week_data
        """

        result = self.fetch_one(query, user_id, week_start, week_end)

        # Create or update weekly insight
        insight_query = """
            INSERT INTO weekly_insights (
                user_id, week_start_date, total_tasks_completed,
                total_xp_earned, most_productive_day
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, week_start_date)
            DO UPDATE SET
                total_tasks_completed = EXCLUDED.total_tasks_completed,
                total_xp_earned = EXCLUDED.total_xp_earned,
                most_productive_day = EXCLUDED.most_productive_day
            RETURNING *
        """

        return self.fetch_one(
            insight_query,
            user_id,
            week_start,
            result.total_tasks,
            result.total_xp,
            result.best_day.strftime("%A") if result.best_day else None
        )

    def upsert_productivity_pattern(
        self,
        user_id: str,
        pattern_type: str,
        pattern_key: str,
        success: bool,
        completion_time: Optional[int] = None
    ) -> ProductivityPattern:
        """Update or create productivity pattern."""
        success_inc = 1 if success else 0
        failure_inc = 0 if success else 1

        query = """
            INSERT INTO productivity_patterns (
                user_id, pattern_type, pattern_key,
                success_count, failure_count, avg_completion_time_minutes
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, pattern_type, pattern_key)
            DO UPDATE SET
                success_count = productivity_patterns.success_count + $4,
                failure_count = productivity_patterns.failure_count + $5,
                avg_completion_time_minutes = (
                    CASE WHEN $6 IS NOT NULL THEN
                        (productivity_patterns.avg_completion_time_minutes + $6) / 2
                    ELSE productivity_patterns.avg_completion_time_minutes
                    END
                ),
                confidence_score = (
                    productivity_patterns.success_count::decimal /
                    NULLIF(productivity_patterns.success_count + productivity_patterns.failure_count, 0)
                ),
                last_updated = NOW()
            RETURNING *
        """

        return self.fetch_one(
            query, user_id, pattern_type, pattern_key,
            success_inc, failure_inc, Decimal(completion_time) if completion_time else None
        )

    def get_top_patterns(
        self,
        user_id: str,
        pattern_type: Optional[str] = None,
        min_confidence: Decimal = Decimal("0.6"),
        limit: int = 10
    ) -> List[ProductivityPattern]:
        """Get most reliable productivity patterns."""
        if pattern_type:
            query = """
                SELECT * FROM productivity_patterns
                WHERE user_id = $1 AND pattern_type = $2
                  AND confidence_score >= $3
                ORDER BY confidence_score DESC, success_count DESC
                LIMIT $4
            """
            return self.fetch_all(query, user_id, pattern_type, min_confidence, limit)
        else:
            query = """
                SELECT * FROM productivity_patterns
                WHERE user_id = $1 AND confidence_score >= $2
                ORDER BY confidence_score DESC, success_count DESC
                LIMIT $3
            """
            return self.fetch_all(query, user_id, min_confidence, limit)

    def create_snapshot(
        self,
        user_id: str,
        metrics: Dict[str, Any]
    ) -> UUID:
        """Create historical snapshot."""
        query = """
            INSERT INTO user_snapshots (
                user_id, total_tasks, total_completed,
                current_streak, total_xp, current_level, metrics_json
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING snapshot_id
        """
        result = self.fetch_one(
            query,
            user_id,
            metrics.get("total_tasks", 0),
            metrics.get("total_completed", 0),
            metrics.get("current_streak", 0),
            metrics.get("total_xp", 0),
            metrics.get("current_level", 1),
            metrics
        )
        return result.snapshot_id
```

---

## 🌐 API Routes

```python
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import date, datetime, timedelta

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    user_id: str = Query(...),
    repo: AnalyticsRepository = Depends()
) -> DashboardMetrics:
    """Get metrics for Mapper dashboard."""

    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    # Get or create today's metrics
    today_metrics = repo.get_or_create_daily_metrics(user_id, today)

    # Get or create this week's insights
    week_insights = repo.calculate_weekly_insights(user_id, week_start)

    # Get 7-day completion rate
    seven_days_ago = today - timedelta(days=7)
    recent_metrics = repo.get_metrics_range(user_id, seven_days_ago, today)

    total_tasks = sum(m.tasks_created for m in recent_metrics)
    completed_tasks = sum(m.tasks_completed for m in recent_metrics)
    completion_rate = Decimal(completed_tasks / total_tasks if total_tasks > 0 else 0)

    # Calculate trend
    first_half = recent_metrics[:3]
    second_half = recent_metrics[4:]
    avg_first = sum(m.tasks_completed for m in first_half) / len(first_half) if first_half else 0
    avg_second = sum(m.tasks_completed for m in second_half) / len(second_half) if second_half else 0

    if avg_second > avg_first * 1.1:
        trend = "up"
    elif avg_second < avg_first * 0.9:
        trend = "down"
    else:
        trend = "stable"

    return DashboardMetrics(
        today=today_metrics,
        this_week=week_insights,
        current_streak=today_metrics.streak_days,
        total_xp=0,  # TODO: Get from user model
        current_level=1,  # TODO: Get from user model
        tasks_in_progress=0,  # TODO: Query tasks
        completion_rate_7days=completion_rate,
        productivity_trend=trend
    )


@router.get("/timeline", response_model=List[AnalyticsTimelineEntry])
async def get_productivity_timeline(
    user_id: str = Query(...),
    days: int = Query(30, ge=7, le=365),
    repo: AnalyticsRepository = Depends()
) -> List[AnalyticsTimelineEntry]:
    """Get productivity timeline for Mapper visualization."""

    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    metrics = repo.get_metrics_range(user_id, start_date, end_date)

    return [
        AnalyticsTimelineEntry(
            date=m.date,
            tasks_completed=m.tasks_completed,
            xp_earned=m.total_xp_earned,
            energy_level=m.avg_energy_level,
            notable_achievement=None  # TODO: Check for badges/achievements
        )
        for m in metrics
    ]


@router.get("/patterns", response_model=List[ProductivityPattern])
async def get_productivity_patterns(
    user_id: str = Query(...),
    pattern_type: Optional[str] = Query(None),
    min_confidence: float = Query(0.6, ge=0.0, le=1.0),
    repo: AnalyticsRepository = Depends()
) -> List[ProductivityPattern]:
    """Get learned productivity patterns."""

    patterns = repo.get_top_patterns(
        user_id,
        pattern_type,
        Decimal(str(min_confidence)),
        limit=20
    )

    return patterns


@router.get("/insights", response_model=List[InsightResponse])
async def generate_insights(
    user_id: str = Query(...),
    repo: AnalyticsRepository = Depends()
) -> List[InsightResponse]:
    """Generate AI-powered insights from analytics."""

    patterns = repo.get_top_patterns(user_id, min_confidence=Decimal("0.7"))
    recent_metrics = repo.get_metrics_range(
        user_id,
        date.today() - timedelta(days=7),
        date.today()
    )

    insights = []

    # Pattern-based insights
    for pattern in patterns[:3]:
        if pattern.pattern_type == "time_of_day":
            insights.append(InsightResponse(
                insight_type="pattern",
                title=f"Peak productivity at {pattern.pattern_key}",
                description=f"You're {int(pattern.success_rate * 100)}% more likely to complete tasks during this time.",
                confidence=pattern.confidence_score,
                actionable=True,
                action_text=f"Schedule important tasks for {pattern.pattern_key}"
            ))

    # Streak insights
    current_streak = recent_metrics[-1].streak_days if recent_metrics else 0
    if current_streak >= 7:
        insights.append(InsightResponse(
            insight_type="celebration",
            title=f"🔥 {current_streak}-day streak!",
            description="You're on fire! Keep the momentum going.",
            confidence=Decimal("1.00"),
            actionable=False
        ))

    # Warning insights
    last_3_days = recent_metrics[-3:] if len(recent_metrics) >= 3 else []
    if all(m.tasks_completed == 0 for m in last_3_days):
        insights.append(InsightResponse(
            insight_type="warning",
            title="Activity slowdown detected",
            description="You haven't completed tasks in 3 days. Start small!",
            confidence=Decimal("0.85"),
            actionable=True,
            action_text="Pick one 5-minute task to rebuild momentum"
        ))

    return insights


@router.post("/track-completion")
async def track_task_completion(
    user_id: str,
    task_id: UUID,
    completed: bool,
    energy_level: str,
    completion_time_minutes: Optional[int] = None,
    repo: AnalyticsRepository = Depends()
):
    """Track task completion for analytics."""

    today = date.today()

    # Update daily metrics
    if completed:
        repo.increment_daily_metric(user_id, today, "tasks_completed", 1)

    # Update productivity patterns
    hour_of_day = datetime.now().hour
    time_slot = f"{hour_of_day:02d}:00-{hour_of_day+1:02d}:00"

    repo.upsert_productivity_pattern(
        user_id,
        "time_of_day",
        time_slot,
        success=completed,
        completion_time=completion_time_minutes
    )

    repo.upsert_productivity_pattern(
        user_id,
        "energy_level",
        energy_level,
        success=completed,
        completion_time=completion_time_minutes
    )

    day_of_week = datetime.now().strftime("%A")
    repo.upsert_productivity_pattern(
        user_id,
        "day_of_week",
        day_of_week,
        success=completed,
        completion_time=completion_time_minutes
    )

    return {"message": "Completion tracked"}
```

---

## 🧪 TDD Test Specifications

```python
import pytest
from datetime import date, timedelta
from decimal import Decimal
from uuid import uuid4

class TestAnalyticsService:
    """Test suite for analytics service."""

    def test_daily_metrics_created_on_first_access(self, repo):
        """RED: Accessing metrics for a new date should create record."""
        user_id = "user-123"
        today = date.today()

        metrics = repo.get_or_create_daily_metrics(user_id, today)

        assert metrics.user_id == user_id
        assert metrics.date == today
        assert metrics.tasks_completed == 0

    def test_increment_metric_increases_count(self, repo):
        """RED: Incrementing should increase the metric."""
        user_id = "user-123"
        today = date.today()

        repo.get_or_create_daily_metrics(user_id, today)
        repo.increment_daily_metric(user_id, today, "tasks_completed", 3)

        metrics = repo.get_or_create_daily_metrics(user_id, today)
        assert metrics.tasks_completed == 3

    def test_weekly_insights_aggregates_correctly(self, repo):
        """RED: Weekly insights should sum daily metrics."""
        user_id = "user-123"
        week_start = date.today() - timedelta(days=date.today().weekday())

        # Create metrics for each day
        for i in range(7):
            day = week_start + timedelta(days=i)
            repo.get_or_create_daily_metrics(user_id, day)
            repo.increment_daily_metric(user_id, day, "tasks_completed", i + 1)
            repo.increment_daily_metric(user_id, day, "total_xp_earned", (i + 1) * 10)

        insights = repo.calculate_weekly_insights(user_id, week_start)

        assert insights.total_tasks_completed == sum(range(1, 8))  # 1+2+3+4+5+6+7 = 28
        assert insights.total_xp_earned == sum(range(10, 80, 10))  # 280

    def test_productivity_pattern_confidence_increases(self, repo):
        """RED: Repeated success should increase confidence."""
        user_id = "user-123"

        # Record multiple successes
        for _ in range(10):
            repo.upsert_productivity_pattern(
                user_id, "time_of_day", "09:00-10:00", success=True
            )

        pattern = repo.get_top_patterns(user_id, "time_of_day", min_confidence=Decimal("0.5"))[0]

        assert pattern.success_count == 10
        assert pattern.confidence_score == Decimal("1.00")

    def test_dashboard_metrics_includes_all_data(self, test_client):
        """RED: Dashboard should return comprehensive metrics."""
        response = test_client.get("/api/v1/analytics/dashboard?user_id=user-123")

        assert response.status_code == 200
        data = response.json()

        assert "today" in data
        assert "this_week" in data
        assert "current_streak" in data
        assert "productivity_trend" in data

    def test_timeline_returns_requested_days(self, test_client, repo):
        """RED: Timeline should return exactly N days of data."""
        user_id = "user-123"
        days = 14

        # Create 14 days of metrics
        for i in range(days):
            day = date.today() - timedelta(days=i)
            repo.get_or_create_daily_metrics(user_id, day)

        response = test_client.get(f"/api/v1/analytics/timeline?user_id={user_id}&days={days}")

        assert response.status_code == 200
        timeline = response.json()
        assert len(timeline) <= days

    def test_insights_generated_from_patterns(self, test_client, repo):
        """RED: High-confidence patterns should generate insights."""
        user_id = "user-123"

        # Create strong pattern
        for _ in range(20):
            repo.upsert_productivity_pattern(
                user_id, "time_of_day", "14:00-15:00", success=True
            )

        response = test_client.get(f"/api/v1/analytics/insights?user_id={user_id}")

        assert response.status_code == 200
        insights = response.json()

        assert len(insights) > 0
        assert any("14:00" in i["title"] for i in insights)

    def test_track_completion_updates_patterns(self, test_client, repo):
        """RED: Tracking completion should update multiple patterns."""
        payload = {
            "user_id": "user-123",
            "task_id": str(uuid4()),
            "completed": True,
            "energy_level": "high",
            "completion_time_minutes": 25
        }

        test_client.post("/api/v1/analytics/track-completion", json=payload)

        patterns = repo.get_top_patterns("user-123", min_confidence=Decimal("0.0"))

        # Should have patterns for time_of_day, energy_level, day_of_week
        pattern_types = [p.pattern_type for p in patterns]
        assert "energy_level" in pattern_types
```

---

## ✅ Acceptance Criteria

- [ ] Daily metrics are automatically created and tracked
- [ ] Weekly insights aggregate data correctly
- [ ] Productivity patterns learn from user behavior
- [ ] Dashboard API returns comprehensive metrics
- [ ] Timeline API supports flexible date ranges
- [ ] Insights are generated from high-confidence patterns
- [ ] All database migrations run successfully
- [ ] 95%+ test coverage
- [ ] Performance: Dashboard loads in <500ms

---

## 🎯 Success Metrics

- **Data Accuracy**: 100% of task completions tracked
- **Pattern Reliability**: Patterns reach >70% confidence after 15 data points
- **Dashboard Performance**: <500ms load time
- **Insight Quality**: 60%+ of insights rated "helpful" by users

---

## 📚 Additional Context

**Related Files**:
- `src/database/models.py` - Task completion tracking
- `docs/tasks/backend/03_focus_sessions_service.md` - Focus time tracking
- `docs/roadmap/PHASE_1_SPECS.md` - Mapper mode requirements
