"""
Temporal Knowledge Graph Models - Time-aware entities and relationships

Provides Pydantic models for:
- Temporal entities (versioned entities with validity periods)
- Shopping items (with recurrence detection)
- Preference history (track preference changes over time)
- Event log (for pattern learning)
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

# Python 3.10 compatibility
UTC = timezone.utc


class ItemCategory(str, Enum):
    """Categories for shopping items"""

    GROCERIES = "groceries"
    HARDWARE = "hardware"
    GIFTS = "gifts"
    PHARMACY = "pharmacy"
    HOUSEHOLD = "household"
    ELECTRONICS = "electronics"
    CLOTHING = "clothing"
    BOOKS = "books"
    OTHER = "other"


class ItemUrgency(str, Enum):
    """Urgency levels for shopping items"""

    URGENT = "urgent"
    NORMAL = "normal"
    SOMEDAY = "someday"


class ItemStatus(str, Enum):
    """Status of shopping items"""

    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class RecurrencePattern(str, Enum):
    """Detected recurrence patterns"""

    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


class EventType(str, Enum):
    """Types of events logged"""

    TASK_COMPLETED = "task_completed"
    TASK_CREATED = "task_created"
    ITEM_PURCHASED = "item_purchased"
    ITEM_ADDED = "item_added"
    PREFERENCE_SET = "preference_set"
    ENTITY_ACCESSED = "entity_accessed"


class EnergyLevel(str, Enum):
    """User energy levels for context"""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ============================================================================
# TEMPORAL ENTITY MODELS
# ============================================================================


class TemporalEntity(BaseModel):
    """
    Temporal entity with bi-temporal tracking.

    Tracks both:
    - Valid time: When the fact was TRUE in the real world
    - Transaction time: When we KNEW about the fact
    """

    version_id: str = Field(default_factory=lambda: str(uuid4()))
    entity_id: str = Field(..., description="Logical entity ID (stable across versions)")
    entity_type: str = Field(..., description="Type of entity")
    name: str = Field(..., min_length=1, max_length=255)
    user_id: str = Field(..., description="Owner of this entity")
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Bi-temporal timestamps
    valid_from: datetime = Field(..., description="When this became true in reality")
    valid_to: datetime = Field(
        default_factory=lambda: datetime(9999, 12, 31, 23, 59, 59),
        description="When this stopped being true",
    )
    stored_from: datetime = Field(..., description="When we learned about this")
    stored_to: datetime = Field(
        default_factory=lambda: datetime(9999, 12, 31, 23, 59, 59),
        description="When this was superseded",
    )

    # Relevance decay
    relevance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    last_accessed: Optional[datetime] = None
    access_count: int = Field(default=0, ge=0)

    # Versioning
    is_current: bool = True
    superseded_by: Optional[str] = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    def is_valid_at(self, timestamp: datetime) -> bool:
        """Check if entity was valid at a specific timestamp"""
        return self.valid_from <= timestamp < self.valid_to

    def decay_relevance(self, days_since_access: int) -> None:
        """Decay relevance score based on time since last access"""
        decay_rate = 0.95
        self.relevance_score = max(0.1, self.relevance_score * (decay_rate ** days_since_access))


class TemporalRelationship(BaseModel):
    """Temporal relationship with validity periods"""

    version_id: str = Field(default_factory=lambda: str(uuid4()))
    relationship_id: str = Field(..., description="Logical relationship ID")
    from_entity_id: str
    to_entity_id: str
    relationship_type: str
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Bi-temporal timestamps
    valid_from: datetime
    valid_to: datetime = Field(default_factory=lambda: datetime(9999, 12, 31, 23, 59, 59))
    stored_from: datetime
    stored_to: datetime = Field(default_factory=lambda: datetime(9999, 12, 31, 23, 59, 59))

    # Versioning
    is_current: bool = True
    superseded_by: Optional[str] = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


# ============================================================================
# SHOPPING ITEM MODELS
# ============================================================================


class ShoppingItem(BaseModel):
    """
    Shopping list item with temporal tracking and recurrence detection.

    Features:
    - Auto-expiry after 30 days
    - Duplicate detection within 24 hours
    - Pattern learning for recurring items
    """

    item_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    item_name: str = Field(..., min_length=1, max_length=255)
    category: Optional[ItemCategory] = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Temporal tracking
    added_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None

    # Recurrence detection
    is_recurring: bool = False
    recurrence_pattern: Optional[RecurrencePattern] = None
    last_purchased: Optional[datetime] = None
    purchase_count: int = Field(default=0, ge=0)

    # Context
    preferred_store: Optional[str] = None
    urgency: ItemUrgency = ItemUrgency.NORMAL
    notes: Optional[str] = None

    # Status
    status: ItemStatus = ItemStatus.ACTIVE

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    def mark_completed(self) -> None:
        """Mark item as completed and update purchase tracking"""
        now = datetime.now(UTC)
        self.status = ItemStatus.COMPLETED
        self.completed_at = now
        self.purchase_count += 1

        # Update last purchased
        if self.last_purchased:
            # Calculate days between purchases
            days_between = (now - self.last_purchased).total_seconds() / 86400

            # Detect pattern
            if self.purchase_count >= 3 and 5 <= days_between <= 90:
                if days_between <= 2:
                    self.recurrence_pattern = RecurrencePattern.DAILY
                elif days_between <= 10:
                    self.recurrence_pattern = RecurrencePattern.WEEKLY
                elif days_between <= 20:
                    self.recurrence_pattern = RecurrencePattern.BIWEEKLY
                elif days_between <= 35:
                    self.recurrence_pattern = RecurrencePattern.MONTHLY
                else:
                    self.recurrence_pattern = RecurrencePattern.QUARTERLY

                self.is_recurring = True

        self.last_purchased = now

    def is_stale(self, days: int = 30) -> bool:
        """Check if item is stale (older than N days)"""
        if self.status != ItemStatus.ACTIVE:
            return False

        age_days = (datetime.now(UTC) - self.added_at).total_seconds() / 86400
        return age_days > days

    def get_freshness(self) -> str:
        """Get freshness indicator: fresh, aging, or stale"""
        age_days = (datetime.now(UTC) - self.added_at).total_seconds() / 86400

        if age_days > 30:
            return "stale"
        elif age_days > 7:
            return "aging"
        else:
            return "fresh"


# ============================================================================
# PREFERENCE HISTORY MODELS
# ============================================================================


class PreferenceHistory(BaseModel):
    """
    Track user preference changes over time.

    Examples:
    - "work_time" preference changed from "mornings" to "evenings"
    - "coffee_type" preference learned from "oat_milk_latte" (confidence increasing)
    """

    history_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    preference_key: str = Field(..., description="Preference identifier")
    preference_value: str = Field(..., description="Preference value")
    context: Optional[str] = Field(None, description="Optional context (location, mood, etc.)")

    # Temporal tracking
    valid_from: datetime
    valid_to: datetime = Field(default_factory=lambda: datetime(9999, 12, 31, 23, 59, 59))
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)

    # Learning metadata
    observation_count: int = Field(default=1, ge=0)
    last_observed: datetime = Field(default_factory=lambda: datetime.now(UTC))

    is_current: bool = True

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    def increase_confidence(self, increment: float = 0.1) -> None:
        """Increase confidence as we observe this preference more"""
        self.confidence = min(1.0, self.confidence + increment)
        self.observation_count += 1
        self.last_observed = datetime.now(UTC)


# ============================================================================
# EVENT LOG MODELS
# ============================================================================


class EventLog(BaseModel):
    """
    Log events for pattern detection and learning.

    Captures context: time of day, day of week, energy level, location
    """

    event_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    event_type: EventType
    entity_id: Optional[str] = None
    event_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Context capture
    day_of_week: Optional[int] = Field(None, ge=0, le=6)  # 0=Monday, 6=Sunday
    hour_of_day: Optional[int] = Field(None, ge=0, le=23)
    location: Optional[str] = None
    energy_level: Optional[EnergyLevel] = None

    # Pattern detection
    recurring_pattern_id: Optional[str] = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    @classmethod
    def from_timestamp(
        cls,
        user_id: str,
        event_type: EventType,
        event_time: Optional[datetime] = None,
        **kwargs: Any,
    ) -> "EventLog":
        """Create event log with auto-populated temporal context"""
        timestamp = event_time or datetime.now(UTC)

        return cls(
            user_id=user_id,
            event_type=event_type,
            event_time=timestamp,
            day_of_week=timestamp.weekday(),  # 0=Monday
            hour_of_day=timestamp.hour,
            **kwargs,
        )


# ============================================================================
# RECURRING PATTERN MODELS
# ============================================================================


class RecurringPattern(BaseModel):
    """
    Detected recurring pattern from event log analysis.

    Examples:
    - User buys milk every week on Mondays
    - User completes deep work tasks at 9am
    - User checks email every day at 3pm
    """

    pattern_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    pattern_type: str = Field(..., description="Type of pattern (shopping, task, etc.)")
    entity_id: Optional[str] = None
    entity_type: Optional[str] = None

    # Pattern metadata
    recurrence: RecurrencePattern
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    observation_count: int = Field(default=0, ge=0)

    # Temporal context
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    hour_of_day: Optional[int] = Field(None, ge=0, le=23)

    # Tracking
    first_observed: datetime
    last_observed: datetime
    next_predicted: Optional[datetime] = None

    is_active: bool = True

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    def update_prediction(self) -> None:
        """Update next predicted occurrence based on pattern"""
        if not self.next_predicted:
            return

        # Simple prediction: add recurrence interval
        from datetime import timedelta

        intervals = {
            RecurrencePattern.DAILY: timedelta(days=1),
            RecurrencePattern.WEEKLY: timedelta(weeks=1),
            RecurrencePattern.BIWEEKLY: timedelta(weeks=2),
            RecurrencePattern.MONTHLY: timedelta(days=30),
            RecurrencePattern.QUARTERLY: timedelta(days=90),
        }

        interval = intervals.get(self.recurrence, timedelta(days=7))
        self.next_predicted = self.last_observed + interval


# ============================================================================
# CONTEXT MODELS (for LLM prompts)
# ============================================================================


class TemporalContext(BaseModel):
    """
    Temporal context for LLM prompts.

    Includes current entities, recent changes, and predicted patterns.
    """

    current_entities: list[TemporalEntity] = Field(default_factory=list)
    recent_changes: list[dict[str, Any]] = Field(default_factory=list)
    active_shopping_items: list[ShoppingItem] = Field(default_factory=list)
    current_preferences: list[PreferenceHistory] = Field(default_factory=list)
    predicted_patterns: list[RecurringPattern] = Field(default_factory=list)

    model_config = ConfigDict(use_enum_values=True)

    def format_for_prompt(self) -> str:
        """Format temporal context as LLM prompt"""
        lines = ["# Temporal Context"]

        # Current entities
        if self.current_entities:
            lines.append("\n## Current Entities:")
            for entity in self.current_entities[:5]:  # Limit to 5
                lines.append(f"- {entity.name} ({entity.entity_type})")

        # Active shopping items
        if self.active_shopping_items:
            lines.append("\n## Shopping List:")
            for item in self.active_shopping_items[:10]:  # Limit to 10
                urgency_marker = "!" if item.urgency == ItemUrgency.URGENT else ""
                lines.append(f"- {urgency_marker}{item.item_name} ({item.get_freshness()})")

        # Current preferences
        if self.current_preferences:
            lines.append("\n## User Preferences:")
            for pref in self.current_preferences[:5]:
                lines.append(f"- {pref.preference_key}: {pref.preference_value}")

        # Predicted patterns
        if self.predicted_patterns:
            lines.append("\n## Predicted Patterns:")
            for pattern in self.predicted_patterns[:3]:
                lines.append(f"- {pattern.pattern_type} ({pattern.recurrence})")

        return "\n".join(lines)
