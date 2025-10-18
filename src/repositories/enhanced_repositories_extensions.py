"""
Enhanced Repository Extensions - Additional specialized repositories for Focus & Energy agents
"""

import json
import sqlite3
from datetime import datetime
from typing import Any

from src.core.task_models import FocusSession
from src.repositories.enhanced_repositories import (
    BaseEnhancedRepository,
    FocusSessionRepository,
    ProductivityMetricsRepository,
)


# Enhanced Focus Session Repository with advanced focus session management
class EnhancedFocusSessionRepository(FocusSessionRepository):
    """Enhanced focus session repository with advanced session management"""

    def get_sessions_with_analytics(self, user_id: str, limit: int = 30) -> list[dict[str, Any]]:
        """Get sessions with analytics data"""
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        query = """
            SELECT fs.*,
                   CASE WHEN fs.ended_at IS NOT NULL THEN
                       (julianday(fs.ended_at) - julianday(fs.started_at)) * 24 * 60
                   ELSE NULL END as actual_duration_minutes
            FROM focus_sessions fs
            WHERE fs.user_id = ?
            ORDER BY fs.started_at DESC
            LIMIT ?
        """

        cursor.execute(query, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()

        sessions = []
        for row in rows:
            session_data = dict(row)
            session = self._dict_to_model(session_data, FocusSession)

            # Add analytics data
            analytics = {
                "session": session,
                "actual_duration_minutes": session_data.get("actual_duration_minutes"),
                "completion_rate": None,
            }

            if session_data.get("actual_duration_minutes") and session.duration:
                analytics["completion_rate"] = min(
                    session_data["actual_duration_minutes"] / session.duration, 1.0
                )

            sessions.append(analytics)

        return sessions

    def get_user_patterns(self, user_id: str, days: int = 30) -> dict[str, Any]:
        """Analyze user focus patterns over time"""
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        query = """
            SELECT
                COUNT(*) as total_sessions,
                AVG(duration) as avg_planned_duration,
                AVG(CASE WHEN ended_at IS NOT NULL THEN
                    (julianday(ended_at) - julianday(started_at)) * 24 * 60
                END) as avg_actual_duration,
                AVG(CASE WHEN ended_at IS NOT NULL AND
                    (julianday(ended_at) - julianday(started_at)) * 24 * 60 >= duration * 0.8
                    THEN 1 ELSE 0 END) as completion_rate,
                strftime('%H', started_at) as hour_of_day,
                COUNT(*) as sessions_at_hour
            FROM focus_sessions
            WHERE user_id = ?
                AND started_at >= datetime('now', '-' || ? || ' days')
            GROUP BY strftime('%H', started_at)
            ORDER BY sessions_at_hour DESC
        """

        cursor.execute(query, (user_id, days))
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return {
                "total_sessions": 0,
                "avg_planned_duration": 0,
                "avg_actual_duration": 0,
                "completion_rate": 0.0,
                "peak_hours": [],
                "patterns": {},
            }

        # Calculate overall stats
        total_sessions = sum(row["sessions_at_hour"] for row in rows)
        weighted_avg_planned = (
            sum(
                row["avg_planned_duration"] * row["sessions_at_hour"]
                for row in rows
                if row["avg_planned_duration"]
            )
            / total_sessions
            if total_sessions > 0
            else 0
        )
        weighted_avg_actual = (
            sum(
                row["avg_actual_duration"] * row["sessions_at_hour"]
                for row in rows
                if row["avg_actual_duration"]
            )
            / total_sessions
            if total_sessions > 0
            else 0
        )
        weighted_completion = (
            sum(
                row["completion_rate"] * row["sessions_at_hour"]
                for row in rows
                if row["completion_rate"]
            )
            / total_sessions
            if total_sessions > 0
            else 0
        )

        # Find peak hours (top 3)
        peak_hours = sorted(rows, key=lambda x: x["sessions_at_hour"], reverse=True)[:3]
        peak_hours = [
            f"{row['hour_of_day']}:00" for row in peak_hours if row["sessions_at_hour"] > 0
        ]

        return {
            "total_sessions": total_sessions,
            "avg_planned_duration": round(weighted_avg_planned or 0, 2),
            "avg_actual_duration": round(weighted_avg_actual or 0, 2),
            "completion_rate": round(weighted_completion or 0, 3),
            "peak_hours": peak_hours,
            "patterns": {
                "prefers_longer_sessions": weighted_avg_planned > 30,
                "good_completion_rate": weighted_completion > 0.8,
                "consistent_user": total_sessions > 10,
            },
        }


# Enhanced Energy Repository for energy level tracking
class EnhancedEnergyRepository(BaseEnhancedRepository):
    """Enhanced energy repository for advanced energy tracking"""

    def __init__(self, db=None):
        super().__init__(db)
        self._ensure_energy_table()

    def _ensure_energy_table(self):
        """Ensure energy readings table exists"""
        conn = sqlite3.connect(self.db.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS energy_readings (
                reading_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                energy_level REAL NOT NULL,
                context TEXT,
                factors TEXT,
                confidence REAL DEFAULT 0.8,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_energy_user_timestamp
            ON energy_readings (user_id, timestamp)
        """)

        conn.commit()
        conn.close()

    def record_energy_reading(self, reading_data: dict[str, Any]) -> bool:
        """Record an energy reading"""
        conn = sqlite3.connect(self.db.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        # Convert lists/dicts to JSON
        context_json = json.dumps(reading_data.get("context", {}))
        factors_json = json.dumps(reading_data.get("factors", []))

        cursor.execute(
            """
            INSERT INTO energy_readings
            (reading_id, user_id, timestamp, energy_level, context, factors, confidence, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                reading_data["reading_id"],
                reading_data["user_id"],
                reading_data["timestamp"],
                reading_data["energy_level"],
                context_json,
                factors_json,
                reading_data.get("confidence", 0.8),
                datetime.utcnow().isoformat(),
            ),
        )

        conn.commit()
        conn.close()
        return True

    def get_recent_readings(self, user_id: str, hours: int = 24) -> list[dict[str, Any]]:
        """Get recent energy readings for a user"""
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM energy_readings
            WHERE user_id = ?
                AND timestamp >= datetime('now', '-' || ? || ' hours')
            ORDER BY timestamp DESC
        """,
            (user_id, hours),
        )

        rows = cursor.fetchall()
        conn.close()

        readings = []
        for row in rows:
            reading = dict(row)
            # Parse JSON fields
            try:
                reading["context"] = json.loads(reading["context"]) if reading["context"] else {}
                reading["factors"] = json.loads(reading["factors"]) if reading["factors"] else []
            except json.JSONDecodeError:
                reading["context"] = {}
                reading["factors"] = []
            readings.append(reading)

        return readings

    def get_energy_patterns(self, user_id: str, days: int = 7) -> dict[str, Any]:
        """Analyze energy patterns for a user"""
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                strftime('%H', timestamp) as hour,
                AVG(energy_level) as avg_energy,
                COUNT(*) as reading_count,
                MIN(energy_level) as min_energy,
                MAX(energy_level) as max_energy
            FROM energy_readings
            WHERE user_id = ?
                AND timestamp >= datetime('now', '-' || ? || ' days')
            GROUP BY strftime('%H', timestamp)
            ORDER BY hour
        """,
            (user_id, days),
        )

        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return {
                "hourly_patterns": {},
                "peak_energy_hours": [],
                "low_energy_hours": [],
                "energy_variance": 0.0,
                "average_energy": 5.0,
            }

        hourly_patterns = {}
        energy_levels = []

        for row in rows:
            hour = f"{row['hour']}:00"
            hourly_patterns[hour] = {
                "avg_energy": round(row["avg_energy"], 2),
                "reading_count": row["reading_count"],
                "min_energy": row["min_energy"],
                "max_energy": row["max_energy"],
            }
            energy_levels.append(row["avg_energy"])

        # Find peak and low energy times
        sorted_hours = sorted(hourly_patterns.items(), key=lambda x: x[1]["avg_energy"])
        peak_hours = [hour for hour, data in sorted_hours[-3:] if data["avg_energy"] > 6.0]
        low_hours = [hour for hour, data in sorted_hours[:3] if data["avg_energy"] < 5.0]

        # Calculate variance
        if energy_levels:
            avg_energy = sum(energy_levels) / len(energy_levels)
            variance = sum((x - avg_energy) ** 2 for x in energy_levels) / len(energy_levels)
        else:
            avg_energy = 5.0
            variance = 0.0

        return {
            "hourly_patterns": hourly_patterns,
            "peak_energy_hours": peak_hours,
            "low_energy_hours": low_hours,
            "energy_variance": round(variance, 3),
            "average_energy": round(avg_energy, 2),
        }


# Enhanced Metrics Repository for advanced productivity tracking
class EnhancedMetricsRepository(ProductivityMetricsRepository):
    """Enhanced metrics repository with advanced analytics"""

    def get_productivity_trends(self, user_id: str, days: int = 30) -> dict[str, Any]:
        """Get productivity trends over time"""
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                date,
                productivity_score,
                tasks_completed,
                focus_time_minutes,
                energy_average
            FROM productivity_metrics
            WHERE user_id = ?
                AND period_type = 'daily'
                AND date >= date('now', '-' || ? || ' days')
            ORDER BY date ASC
        """,
            (user_id, days),
        )

        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return {
                "trend_direction": "stable",
                "productivity_trend": 0.0,
                "average_daily_score": 0.0,
                "best_day": None,
                "improvement_areas": [],
            }

        scores = [float(row["productivity_score"] or 0) for row in rows]

        # Calculate trend (simple linear regression slope)
        n = len(scores)
        if n >= 2:
            x_values = list(range(n))
            x_mean = sum(x_values) / n
            y_mean = sum(scores) / n

            numerator = sum((x_values[i] - x_mean) * (scores[i] - y_mean) for i in range(n))
            denominator = sum((x_values[i] - x_mean) ** 2 for i in range(n))

            trend = numerator / denominator if denominator != 0 else 0
        else:
            trend = 0

        # Determine trend direction
        if trend > 0.1:
            trend_direction = "improving"
        elif trend < -0.1:
            trend_direction = "declining"
        else:
            trend_direction = "stable"

        # Find best day
        best_day = None
        if scores:
            max_score = max(scores)
            best_row = next(
                (row for row in rows if float(row["productivity_score"] or 0) == max_score), None
            )
            if best_row:
                best_day = {
                    "date": best_row["date"],
                    "score": max_score,
                    "tasks_completed": best_row["tasks_completed"],
                    "focus_time": best_row["focus_time_minutes"],
                }

        # Identify improvement areas
        improvement_areas = []
        avg_focus_time = sum(row["focus_time_minutes"] or 0 for row in rows) / len(rows)
        avg_tasks = sum(row["tasks_completed"] or 0 for row in rows) / len(rows)

        if avg_focus_time < 120:  # Less than 2 hours
            improvement_areas.append("focus_time")
        if avg_tasks < 3:  # Less than 3 tasks per day
            improvement_areas.append("task_completion")
        if sum(scores) / len(scores) < 6.0:  # Below 6.0 average
            improvement_areas.append("overall_productivity")

        return {
            "trend_direction": trend_direction,
            "productivity_trend": round(trend, 3),
            "average_daily_score": round(sum(scores) / len(scores), 2),
            "best_day": best_day,
            "improvement_areas": improvement_areas,
        }
