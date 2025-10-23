"""
Shopping List Service - Temporal-aware shopping list management

Features:
- Duplicate detection (within 24 hours)
- Auto-expiry of stale items (30+ days)
- Recurrence pattern detection
- Natural language parsing
- Category classification
"""

import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from uuid import uuid4

from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.knowledge.temporal_models import (
    EventLog,
    EventType,
    ItemCategory,
    ItemStatus,
    ItemUrgency,
    RecurrencePattern,
    ShoppingItem,
)

# Python 3.10 compatibility
UTC = timezone.utc

logger = logging.getLogger(__name__)


class ShoppingListService:
    """
    Service for managing temporal shopping lists.

    Provides ADHD-friendly features:
    - Prevents duplicate entries
    - Auto-expires forgotten items
    - Learns recurring purchase patterns
    - Natural language item extraction
    """

    def __init__(self, db: Optional[EnhancedDatabaseAdapter] = None):
        self.db = db or get_enhanced_database()

    # ========================================================================
    # CREATE OPERATIONS
    # ========================================================================

    def add_item(
        self,
        user_id: str,
        item_name: str,
        category: Optional[ItemCategory | str] = None,
        urgency: ItemUrgency | str = ItemUrgency.NORMAL,
        notes: Optional[str] = None,
        preferred_store: Optional[str] = None,
    ) -> tuple[ShoppingItem, bool]:
        """
        Add item to shopping list with duplicate detection.

        Args:
            user_id: User ID
            item_name: Name of item
            category: Optional category
            urgency: Urgency level (urgent, normal, someday)
            notes: Optional notes
            preferred_store: Optional preferred store

        Returns:
            Tuple of (ShoppingItem, is_new)
            is_new=False if duplicate was found within 24 hours

        Example:
            >>> item, is_new = service.add_item("alice", "Milk", urgency="urgent")
            >>> if not is_new:
            ...     print("You already added milk recently!")
        """
        # Check for recent duplicates (24 hours)
        duplicate = self.find_recent_duplicate(user_id, item_name, hours=24)
        if duplicate:
            logger.info(f"Duplicate item found: {item_name} (added {duplicate.added_at})")
            return duplicate, False

        # Auto-classify category if not provided
        if not category:
            category = self._classify_category(item_name)

        # Create new item
        item = ShoppingItem(
            user_id=user_id,
            item_name=item_name.strip(),
            category=ItemCategory(category) if isinstance(category, str) else category,
            urgency=ItemUrgency(urgency) if isinstance(urgency, str) else urgency,
            notes=notes,
            preferred_store=preferred_store,
        )

        # Save to database
        self._save_item(item)

        # Log event
        self._log_event(EventType.ITEM_ADDED, user_id, item.item_id)

        logger.info(f"Added shopping item: {item_name} (category: {category})")
        return item, True

    def add_items_bulk(
        self,
        user_id: str,
        items: list[str],
        urgency: ItemUrgency | str = ItemUrgency.NORMAL,
    ) -> tuple[list[ShoppingItem], list[str]]:
        """
        Add multiple items at once.

        Args:
            user_id: User ID
            items: List of item names
            urgency: Default urgency for all items

        Returns:
            Tuple of (added_items, duplicates)
        """
        added: list[ShoppingItem] = []
        duplicates: list[str] = []

        for item_name in items:
            item, is_new = self.add_item(user_id, item_name, urgency=urgency)
            if is_new:
                added.append(item)
            else:
                duplicates.append(item_name)

        return added, duplicates

    def parse_natural_language(self, user_id: str, text: str) -> tuple[list[ShoppingItem], list[str]]:
        """
        Parse natural language shopping list.

        Examples:
            "buy milk and eggs"
            "get coffee, bread, and butter"
            "milk, 2 apples, cheese"

        Args:
            user_id: User ID
            text: Natural language text

        Returns:
            Tuple of (added_items, duplicates)
        """
        # Extract items using simple NLP
        items = self._extract_items_from_text(text)

        # Add items
        return self.add_items_bulk(user_id, items)

    # ========================================================================
    # READ OPERATIONS
    # ========================================================================

    def get_active_items(
        self,
        user_id: str,
        category: Optional[ItemCategory | str] = None,
        sort_by: str = "urgency",
    ) -> list[ShoppingItem]:
        """
        Get active shopping items for a user.

        Args:
            user_id: User ID
            category: Optional category filter
            sort_by: Sort order (urgency, added, category)

        Returns:
            List of ShoppingItem objects
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        where_conditions = ["user_id = ?", "status = ?"]
        params: list[Any] = [user_id, ItemStatus.ACTIVE.value]

        if category:
            cat_value = ItemCategory(category).value if isinstance(category, str) else category.value
            where_conditions.append("category = ?")
            params.append(cat_value)

        # Build ORDER BY
        order_by = {
            "urgency": "CASE urgency WHEN 'urgent' THEN 1 WHEN 'normal' THEN 2 WHEN 'someday' THEN 3 END, added_at",
            "added": "added_at ASC",
            "category": "category, added_at",
        }.get(sort_by, "added_at")

        query = f"""
            SELECT * FROM kg_shopping_items
            WHERE {' AND '.join(where_conditions)}
            ORDER BY {order_by}
        """

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [self._row_to_item(row) for row in rows]

    def get_item(self, item_id: str) -> Optional[ShoppingItem]:
        """Get item by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM kg_shopping_items WHERE item_id = ?", (item_id,))
        row = cursor.fetchone()

        return self._row_to_item(row) if row else None

    def find_recent_duplicate(
        self,
        user_id: str,
        item_name: str,
        hours: int = 24,
    ) -> Optional[ShoppingItem]:
        """
        Find duplicate item added within N hours.

        Args:
            user_id: User ID
            item_name: Item name (case-insensitive)
            hours: Time window in hours

        Returns:
            ShoppingItem if duplicate found, None otherwise
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        since = datetime.now(UTC) - timedelta(hours=hours)

        cursor.execute(
            """
            SELECT * FROM kg_shopping_items
            WHERE user_id = ?
              AND LOWER(item_name) = LOWER(?)
              AND status = ?
              AND added_at >= ?
            ORDER BY added_at DESC
            LIMIT 1
            """,
            (user_id, item_name.strip(), ItemStatus.ACTIVE.value, since.isoformat()),
        )

        row = cursor.fetchone()
        return self._row_to_item(row) if row else None

    def get_recurring_items(self, user_id: str) -> list[ShoppingItem]:
        """Get items detected as recurring"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM kg_shopping_items
            WHERE user_id = ?
              AND is_recurring = TRUE
            ORDER BY item_name
            """,
            (user_id,),
        )

        rows = cursor.fetchall()
        return [self._row_to_item(row) for row in rows]

    # ========================================================================
    # UPDATE OPERATIONS
    # ========================================================================

    def complete_item(self, item_id: str) -> Optional[ShoppingItem]:
        """
        Mark item as completed (purchased).

        Updates purchase tracking for recurrence detection.
        """
        item = self.get_item(item_id)
        if not item:
            return None

        item.mark_completed()
        self._update_item(item)

        # Log event
        self._log_event(EventType.ITEM_PURCHASED, item.user_id, item_id)

        # Check for recurrence pattern
        self._detect_recurrence(item)

        return item

    def update_urgency(self, item_id: str, urgency: ItemUrgency | str) -> Optional[ShoppingItem]:
        """Update item urgency"""
        item = self.get_item(item_id)
        if not item:
            return None

        item.urgency = ItemUrgency(urgency) if isinstance(urgency, str) else urgency
        self._update_item(item)

        return item

    def add_notes(self, item_id: str, notes: str) -> Optional[ShoppingItem]:
        """Add or update item notes"""
        item = self.get_item(item_id)
        if not item:
            return None

        item.notes = notes
        self._update_item(item)

        return item

    # ========================================================================
    # DELETE/EXPIRE OPERATIONS
    # ========================================================================

    def cancel_item(self, item_id: str) -> bool:
        """Cancel an item (mark as cancelled)"""
        item = self.get_item(item_id)
        if not item:
            return False

        item.status = ItemStatus.CANCELLED
        self._update_item(item)

        return True

    def expire_stale_items(self, user_id: str, days: int = 30) -> int:
        """
        Auto-expire items older than N days.

        Args:
            user_id: User ID
            days: Age threshold in days

        Returns:
            Number of items expired
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cutoff = datetime.now(UTC) - timedelta(days=days)

        cursor.execute(
            """
            UPDATE kg_shopping_items
            SET status = ?,
                expired_at = ?
            WHERE user_id = ?
              AND status = ?
              AND added_at < ?
            """,
            (
                ItemStatus.EXPIRED.value,
                datetime.now(UTC).isoformat(),
                user_id,
                ItemStatus.ACTIVE.value,
                cutoff.isoformat(),
            ),
        )

        count = cursor.rowcount
        conn.commit()

        logger.info(f"Expired {count} stale shopping items for user {user_id}")
        return count

    # ========================================================================
    # PATTERN DETECTION
    # ========================================================================

    def _detect_recurrence(self, item: ShoppingItem) -> None:
        """
        Detect if item follows a recurring pattern.

        Analyzes purchase history to identify weekly/monthly patterns.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get purchase history for this item
        cursor.execute(
            """
            SELECT completed_at
            FROM kg_shopping_items
            WHERE user_id = ?
              AND LOWER(item_name) = LOWER(?)
              AND status = ?
              AND completed_at IS NOT NULL
            ORDER BY completed_at DESC
            LIMIT 10
            """,
            (item.user_id, item.item_name, ItemStatus.COMPLETED.value),
        )

        rows = cursor.fetchall()
        if len(rows) < 3:
            return  # Need at least 3 purchases to detect pattern

        # Calculate intervals between purchases
        intervals: list[float] = []
        for i in range(len(rows) - 1):
            current = datetime.fromisoformat(dict(rows[i])["completed_at"])
            previous = datetime.fromisoformat(dict(rows[i + 1])["completed_at"])
            days = (current - previous).total_seconds() / 86400
            intervals.append(days)

        # Check for consistent pattern
        avg_interval = sum(intervals) / len(intervals)
        variance = sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)

        # Low variance indicates consistent pattern
        if variance < 5 and 5 <= avg_interval <= 90:
            # Determine pattern type
            pattern = self._classify_recurrence(avg_interval)

            # Update item
            item.is_recurring = True
            item.recurrence_pattern = pattern
            self._update_item(item)

            logger.info(
                f"Detected recurring pattern for {item.item_name}: {pattern} (avg {avg_interval:.1f} days)"
            )

    def _classify_recurrence(self, avg_days: float) -> RecurrencePattern:
        """Classify recurrence pattern based on average interval"""
        if avg_days <= 2:
            return RecurrencePattern.DAILY
        elif avg_days <= 10:
            return RecurrencePattern.WEEKLY
        elif avg_days <= 20:
            return RecurrencePattern.BIWEEKLY
        elif avg_days <= 35:
            return RecurrencePattern.MONTHLY
        else:
            return RecurrencePattern.QUARTERLY

    # ========================================================================
    # NATURAL LANGUAGE PROCESSING
    # ========================================================================

    def _extract_items_from_text(self, text: str) -> list[str]:
        """
        Extract items from natural language text.

        Handles:
        - Comma-separated lists: "milk, eggs, bread"
        - "and" separators: "milk and eggs and bread"
        - Mixed: "milk, eggs and bread"
        - Quantities: "2 apples" → "apples"
        """
        # Remove common prefixes
        text = re.sub(r"^(buy|get|need|purchase|grab|pick up)\s+", "", text, flags=re.IGNORECASE)

        # Split on commas and "and"
        text = text.replace(" and ", ", ")
        items = [item.strip() for item in text.split(",")]

        # Clean up each item
        cleaned: list[str] = []
        for item in items:
            if not item:
                continue

            # Remove quantities (e.g., "2 apples" → "apples")
            item = re.sub(r"^\d+\s+", "", item)

            # Remove articles (a, an, the)
            item = re.sub(r"^(a|an|the)\s+", "", item, flags=re.IGNORECASE)

            # Capitalize first letter
            item = item.strip().capitalize()

            if item:
                cleaned.append(item)

        return cleaned

    def _classify_category(self, item_name: str) -> ItemCategory:
        """
        Auto-classify item category based on name.

        Uses simple keyword matching. Could be enhanced with ML.
        """
        name_lower = item_name.lower()

        # Groceries
        grocery_keywords = [
            "milk", "eggs", "bread", "cheese", "butter", "yogurt", "fruit",
            "vegetable", "meat", "chicken", "beef", "fish", "pasta", "rice",
            "cereal", "coffee", "tea", "juice", "water", "soda", "snack",
        ]
        if any(keyword in name_lower for keyword in grocery_keywords):
            return ItemCategory.GROCERIES

        # Pharmacy
        pharmacy_keywords = ["medicine", "prescription", "vitamins", "bandage", "aspirin"]
        if any(keyword in name_lower for keyword in pharmacy_keywords):
            return ItemCategory.PHARMACY

        # Hardware
        hardware_keywords = ["screw", "nail", "hammer", "drill", "tool", "paint", "light bulb"]
        if any(keyword in name_lower for keyword in hardware_keywords):
            return ItemCategory.HARDWARE

        # Electronics
        electronics_keywords = ["phone", "computer", "cable", "charger", "battery", "headphone"]
        if any(keyword in name_lower for keyword in electronics_keywords):
            return ItemCategory.ELECTRONICS

        # Books
        if "book" in name_lower:
            return ItemCategory.BOOKS

        # Default to other
        return ItemCategory.OTHER

    # ========================================================================
    # DATABASE OPERATIONS
    # ========================================================================

    def _save_item(self, item: ShoppingItem) -> None:
        """Save item to database"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Helper to get enum value (handles both enum and string)
        def get_value(field):
            return field.value if hasattr(field, 'value') else field

        cursor.execute(
            """
            INSERT INTO kg_shopping_items (
                item_id, user_id, item_name, category, metadata,
                added_at, completed_at, expired_at,
                is_recurring, recurrence_pattern, last_purchased, purchase_count,
                preferred_store, urgency, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item.item_id,
                item.user_id,
                item.item_name,
                get_value(item.category) if item.category else None,
                json.dumps(item.metadata),
                item.added_at.isoformat(),
                item.completed_at.isoformat() if item.completed_at else None,
                item.expired_at.isoformat() if item.expired_at else None,
                item.is_recurring,
                get_value(item.recurrence_pattern) if item.recurrence_pattern else None,
                item.last_purchased.isoformat() if item.last_purchased else None,
                item.purchase_count,
                item.preferred_store,
                get_value(item.urgency),
                item.notes,
                get_value(item.status),
            ),
        )

        conn.commit()

    def _update_item(self, item: ShoppingItem) -> None:
        """Update existing item"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Helper to get enum value (handles both enum and string)
        def get_value(field):
            return field.value if hasattr(field, 'value') else field

        cursor.execute(
            """
            UPDATE kg_shopping_items
            SET item_name = ?,
                category = ?,
                metadata = ?,
                completed_at = ?,
                expired_at = ?,
                is_recurring = ?,
                recurrence_pattern = ?,
                last_purchased = ?,
                purchase_count = ?,
                preferred_store = ?,
                urgency = ?,
                notes = ?,
                status = ?
            WHERE item_id = ?
            """,
            (
                item.item_name,
                get_value(item.category) if item.category else None,
                json.dumps(item.metadata),
                item.completed_at.isoformat() if item.completed_at else None,
                item.expired_at.isoformat() if item.expired_at else None,
                item.is_recurring,
                get_value(item.recurrence_pattern) if item.recurrence_pattern else None,
                item.last_purchased.isoformat() if item.last_purchased else None,
                item.purchase_count,
                item.preferred_store,
                get_value(item.urgency),
                item.notes,
                get_value(item.status),
                item.item_id,
            ),
        )

        conn.commit()

    def _row_to_item(self, row) -> ShoppingItem:
        """Convert database row to ShoppingItem"""
        row_dict = dict(row)
        return ShoppingItem(
            item_id=row_dict["item_id"],
            user_id=row_dict["user_id"],
            item_name=row_dict["item_name"],
            category=ItemCategory(row_dict["category"]) if row_dict.get("category") else None,
            metadata=json.loads(row_dict.get("metadata", "{}")),
            added_at=datetime.fromisoformat(row_dict["added_at"]),
            completed_at=(
                datetime.fromisoformat(row_dict["completed_at"])
                if row_dict.get("completed_at")
                else None
            ),
            expired_at=(
                datetime.fromisoformat(row_dict["expired_at"])
                if row_dict.get("expired_at")
                else None
            ),
            is_recurring=bool(row_dict.get("is_recurring", False)),
            recurrence_pattern=(
                RecurrencePattern(row_dict["recurrence_pattern"])
                if row_dict.get("recurrence_pattern")
                else None
            ),
            last_purchased=(
                datetime.fromisoformat(row_dict["last_purchased"])
                if row_dict.get("last_purchased")
                else None
            ),
            purchase_count=row_dict.get("purchase_count", 0),
            preferred_store=row_dict.get("preferred_store"),
            urgency=ItemUrgency(row_dict.get("urgency", "normal")),
            notes=row_dict.get("notes"),
            status=ItemStatus(row_dict.get("status", "active")),
        )

    def _log_event(self, event_type: EventType, user_id: str, entity_id: str) -> None:
        """Log event to event log"""
        event = EventLog.from_timestamp(
            user_id=user_id,
            event_type=event_type,
            entity_id=entity_id,
        )

        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Helper to get enum value (handles both enum and string)
        def get_value(field):
            return field.value if hasattr(field, 'value') else field

        cursor.execute(
            """
            INSERT INTO kg_event_log (
                event_id, user_id, event_type, entity_id, event_time,
                day_of_week, hour_of_day, location, energy_level, metadata, recurring_pattern_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.event_id,
                event.user_id,
                get_value(event.event_type),
                event.entity_id,
                event.event_time.isoformat(),
                event.day_of_week,
                event.hour_of_day,
                event.location,
                get_value(event.energy_level) if event.energy_level else None,
                json.dumps(event.metadata),
                event.recurring_pattern_id,
            ),
        )

        conn.commit()
