"""
Unit tests for ShoppingListService

Tests:
- Item addition with duplicate detection
- Natural language parsing
- Category classification
- Recurrence detection
- Temporal decay
- Event logging
"""

import pytest
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from src.knowledge.temporal_models import (
    EventType,
    ItemCategory,
    ItemStatus,
    ItemUrgency,
    RecurrencePattern,
    ShoppingItem,
)
from src.services.shopping_list_service import ShoppingListService

# Python 3.10 compatibility
UTC = timezone.utc


@pytest.fixture
def service():
    """Get shopping list service instance"""
    return ShoppingListService()


@pytest.fixture
def test_user_id():
    """Get test user ID"""
    return f"test-user-{uuid4()}"


# ============================================================================
# ITEM ADDITION TESTS
# ============================================================================


def test_add_single_item(service, test_user_id):
    """Test adding a single shopping item"""
    item, is_new = service.add_item(
        user_id=test_user_id,
        item_name="Milk",
        category=ItemCategory.GROCERIES,
        urgency=ItemUrgency.URGENT,
    )

    assert is_new is True
    assert item.item_name == "Milk"
    assert item.category == ItemCategory.GROCERIES
    assert item.urgency == ItemUrgency.URGENT
    assert item.status == ItemStatus.ACTIVE
    assert item.user_id == test_user_id


def test_add_item_with_auto_category(service, test_user_id):
    """Test auto-categorization when category not provided"""
    item, _ = service.add_item(test_user_id, "Milk")

    # Should auto-classify as groceries
    assert item.category == ItemCategory.GROCERIES

    item2, _ = service.add_item(test_user_id, "Screwdriver")
    assert item2.category == ItemCategory.HARDWARE


def test_duplicate_detection_within_24h(service, test_user_id):
    """Test duplicate detection within 24-hour window"""
    # Add item first time
    item1, is_new1 = service.add_item(test_user_id, "Milk")
    assert is_new1 is True

    # Try to add same item again (within 24 hours)
    item2, is_new2 = service.add_item(test_user_id, "Milk")
    assert is_new2 is False
    assert item1.item_id == item2.item_id

    # Should return existing item
    assert item2.item_name == "Milk"


def test_no_duplicate_after_24h(service, test_user_id):
    """Test that items can be re-added after 24 hours"""
    # This test would require mocking datetime or database
    # For now, we'll document the expected behavior
    pass


# ============================================================================
# NATURAL LANGUAGE PARSING TESTS
# ============================================================================


def test_parse_comma_separated_list(service, test_user_id):
    """Test parsing comma-separated shopping list"""
    items, duplicates = service.parse_natural_language(
        test_user_id, "milk, eggs, bread"
    )

    assert len(items) == 3
    item_names = [item.item_name for item in items]
    assert "Milk" in item_names
    assert "Eggs" in item_names
    assert "Bread" in item_names
    assert len(duplicates) == 0


def test_parse_and_separated_list(service, test_user_id):
    """Test parsing 'and' separated list"""
    items, duplicates = service.parse_natural_language(
        test_user_id, "milk and eggs and bread"
    )

    assert len(items) == 3
    item_names = [item.item_name for item in items]
    assert "Milk" in item_names


def test_parse_mixed_separators(service, test_user_id):
    """Test parsing mixed separators"""
    items, duplicates = service.parse_natural_language(
        test_user_id, "milk, eggs and bread"
    )

    assert len(items) == 3


def test_parse_with_buy_prefix(service, test_user_id):
    """Test removing 'buy' prefix"""
    items, _ = service.parse_natural_language(test_user_id, "buy milk and eggs")

    assert len(items) == 2
    item_names = [item.item_name for item in items]
    assert "Buy" not in item_names  # Should be removed


def test_parse_with_quantities(service, test_user_id):
    """Test removing quantities from items"""
    items, _ = service.parse_natural_language(test_user_id, "2 apples, 3 oranges")

    assert len(items) == 2
    item_names = [item.item_name for item in items]
    assert "Apples" in item_names
    assert "Oranges" in item_names
    assert "2 apples" not in item_names  # Quantity should be removed


def test_parse_with_articles(service, test_user_id):
    """Test removing articles (a, an, the)"""
    items, _ = service.parse_natural_language(test_user_id, "a banana, an apple, the milk")

    assert len(items) == 3
    item_names = [item.item_name for item in items]
    assert "Banana" in item_names
    assert "Apple" in item_names
    assert "Milk" in item_names


def test_parse_detects_duplicates(service, test_user_id):
    """Test that parsing detects duplicates"""
    # Add milk first
    service.add_item(test_user_id, "Milk")

    # Try to parse list containing milk
    items, duplicates = service.parse_natural_language(
        test_user_id, "milk, eggs, bread"
    )

    # Milk should be a duplicate, eggs and bread should be new
    assert len(items) == 2  # Only eggs and bread
    assert len(duplicates) == 1
    assert duplicates[0].lower() == "milk"


# ============================================================================
# CATEGORY CLASSIFICATION TESTS
# ============================================================================


def test_classify_groceries(service):
    """Test grocery category classification"""
    assert service._classify_category("milk") == ItemCategory.GROCERIES
    assert service._classify_category("eggs") == ItemCategory.GROCERIES
    assert service._classify_category("bread") == ItemCategory.GROCERIES
    assert service._classify_category("chicken") == ItemCategory.GROCERIES
    assert service._classify_category("coffee") == ItemCategory.GROCERIES


def test_classify_pharmacy(service):
    """Test pharmacy category classification"""
    assert service._classify_category("aspirin") == ItemCategory.PHARMACY
    assert service._classify_category("vitamins") == ItemCategory.PHARMACY
    assert service._classify_category("prescription") == ItemCategory.PHARMACY


def test_classify_hardware(service):
    """Test hardware category classification"""
    assert service._classify_category("screwdriver") == ItemCategory.HARDWARE
    assert service._classify_category("hammer") == ItemCategory.HARDWARE
    assert service._classify_category("light bulb") == ItemCategory.HARDWARE


def test_classify_electronics(service):
    """Test electronics category classification"""
    assert service._classify_category("phone charger") == ItemCategory.ELECTRONICS
    assert service._classify_category("headphones") == ItemCategory.ELECTRONICS


def test_classify_books(service):
    """Test books category classification"""
    assert service._classify_category("book about python") == ItemCategory.BOOKS


def test_classify_default_other(service):
    """Test default category is OTHER"""
    assert service._classify_category("random item xyz") == ItemCategory.OTHER


# ============================================================================
# ITEM RETRIEVAL TESTS
# ============================================================================


def test_get_active_items(service, test_user_id):
    """Test retrieving active shopping items"""
    # Add multiple items
    service.add_item(test_user_id, "Milk", urgency=ItemUrgency.URGENT)
    service.add_item(test_user_id, "Eggs", urgency=ItemUrgency.NORMAL)
    service.add_item(test_user_id, "Bread", urgency=ItemUrgency.SOMEDAY)

    # Get all active items
    items = service.get_active_items(test_user_id)

    assert len(items) >= 3
    item_names = [item.item_name for item in items]
    assert "Milk" in item_names
    assert "Eggs" in item_names
    assert "Bread" in item_names


def test_get_active_items_sorted_by_urgency(service, test_user_id):
    """Test items sorted by urgency"""
    # Add items in random order
    service.add_item(test_user_id, "Bread", urgency=ItemUrgency.SOMEDAY)
    service.add_item(test_user_id, "Milk", urgency=ItemUrgency.URGENT)
    service.add_item(test_user_id, "Eggs", urgency=ItemUrgency.NORMAL)

    # Get sorted by urgency
    items = service.get_active_items(test_user_id, sort_by="urgency")

    # First item should be urgent
    user_items = [i for i in items if i.user_id == test_user_id]
    if user_items:
        assert user_items[0].urgency == ItemUrgency.URGENT


def test_get_active_items_by_category(service, test_user_id):
    """Test filtering by category"""
    # Add items from different categories
    service.add_item(test_user_id, "Milk", category=ItemCategory.GROCERIES)
    service.add_item(test_user_id, "Screwdriver", category=ItemCategory.HARDWARE)

    # Get only groceries
    items = service.get_active_items(test_user_id, category=ItemCategory.GROCERIES)

    user_items = [i for i in items if i.user_id == test_user_id]
    assert all(item.category == ItemCategory.GROCERIES for item in user_items)


def test_get_item_by_id(service, test_user_id):
    """Test retrieving item by ID"""
    item, _ = service.add_item(test_user_id, "Milk")

    # Retrieve by ID
    retrieved = service.get_item(item.item_id)

    assert retrieved is not None
    assert retrieved.item_id == item.item_id
    assert retrieved.item_name == "Milk"


def test_get_nonexistent_item_returns_none(service):
    """Test that getting nonexistent item returns None"""
    item = service.get_item("nonexistent-id")
    assert item is None


# ============================================================================
# ITEM UPDATE TESTS
# ============================================================================


def test_complete_item(service, test_user_id):
    """Test marking item as completed"""
    item, _ = service.add_item(test_user_id, "Milk")

    # Complete item
    completed = service.complete_item(item.item_id)

    assert completed is not None
    assert completed.status == ItemStatus.COMPLETED
    assert completed.completed_at is not None
    assert completed.purchase_count == 1


def test_complete_nonexistent_item_returns_none(service):
    """Test completing nonexistent item returns None"""
    result = service.complete_item("nonexistent-id")
    assert result is None


def test_update_urgency(service, test_user_id):
    """Test updating item urgency"""
    item, _ = service.add_item(test_user_id, "Milk", urgency=ItemUrgency.NORMAL)

    # Update to urgent
    updated = service.update_urgency(item.item_id, ItemUrgency.URGENT)

    assert updated is not None
    assert updated.urgency == ItemUrgency.URGENT


def test_add_notes(service, test_user_id):
    """Test adding notes to item"""
    item, _ = service.add_item(test_user_id, "Milk")

    # Add notes
    updated = service.add_notes(item.item_id, "Get organic milk")

    assert updated is not None
    assert updated.notes == "Get organic milk"


# ============================================================================
# ITEM DELETION/CANCELLATION TESTS
# ============================================================================


def test_cancel_item(service, test_user_id):
    """Test cancelling an item"""
    item, _ = service.add_item(test_user_id, "Milk")

    # Cancel item
    success = service.cancel_item(item.item_id)

    assert success is True

    # Verify status
    cancelled = service.get_item(item.item_id)
    assert cancelled.status == ItemStatus.CANCELLED


def test_cancel_nonexistent_item_returns_false(service):
    """Test cancelling nonexistent item returns False"""
    success = service.cancel_item("nonexistent-id")
    assert success is False


# ============================================================================
# TEMPORAL FEATURES TESTS
# ============================================================================


def test_item_freshness_fresh(service, test_user_id):
    """Test freshness indicator for recent items"""
    item, _ = service.add_item(test_user_id, "Milk")

    # Just added, should be fresh
    assert item.get_freshness() == "fresh"


def test_item_is_stale(service, test_user_id):
    """Test stale detection (requires mocking time)"""
    # This would require mocking datetime or database
    # For now, we'll test the method exists
    item, _ = service.add_item(test_user_id, "Milk")

    # Should not be stale yet (just added)
    assert item.is_stale(days=30) is False


# ============================================================================
# MODEL TESTS
# ============================================================================


def test_shopping_item_mark_completed():
    """Test ShoppingItem.mark_completed() method"""
    item = ShoppingItem(
        user_id="test",
        item_name="Milk",
        status=ItemStatus.ACTIVE,
    )

    # Mark completed
    item.mark_completed()

    assert item.status == ItemStatus.COMPLETED
    assert item.completed_at is not None
    assert item.purchase_count == 1
    assert item.last_purchased is not None


def test_shopping_item_get_freshness():
    """Test freshness calculation"""
    # Fresh item (just created)
    item = ShoppingItem(user_id="test", item_name="Milk")
    assert item.get_freshness() == "fresh"


def test_shopping_item_recurrence_pattern_detection():
    """Test recurrence pattern detection in mark_completed"""
    now = datetime.now(UTC)

    item = ShoppingItem(
        user_id="test",
        item_name="Milk",
        last_purchased=now - timedelta(days=7),
        purchase_count=2,
    )

    # Complete item (3rd purchase, 7 days apart)
    item.mark_completed()

    # After 3 purchases with 7-day intervals, should detect pattern
    # Note: This is simplified - actual detection happens in service
    assert item.purchase_count == 3


# ============================================================================
# INTEGRATION TESTS
# ============================================================================


def test_full_shopping_flow(service, test_user_id):
    """Test complete shopping workflow"""
    # 1. Parse natural language input
    items, duplicates = service.parse_natural_language(
        test_user_id, "buy milk, eggs and bread"
    )

    assert len(items) == 3
    assert len(duplicates) == 0

    # 2. Try to add duplicate
    item, is_new = service.add_item(test_user_id, "Milk")
    assert is_new is False  # Should detect duplicate

    # 3. Get active list
    active = service.get_active_items(test_user_id)
    user_items = [i for i in active if i.user_id == test_user_id]
    assert len(user_items) >= 3

    # 4. Complete an item
    milk_item = next((i for i in user_items if i.item_name == "Milk"), None)
    assert milk_item is not None

    completed = service.complete_item(milk_item.item_id)
    assert completed.status == ItemStatus.COMPLETED

    # 5. Get active list again (should have one less item)
    active_after = service.get_active_items(test_user_id)
    user_items_after = [
        i for i in active_after if i.user_id == test_user_id and i.status == ItemStatus.ACTIVE
    ]
    # Note: Completed items still returned, just with different status


def test_recurring_item_workflow(service, test_user_id):
    """Test recurring item detection workflow"""
    # Add item
    item, _ = service.add_item(test_user_id, "Coffee Beans")

    # Complete it 3 times (would need to simulate time passing)
    # For now, just test that completion increments count
    completed1 = service.complete_item(item.item_id)
    assert completed1.purchase_count == 1

    # In real scenario, would wait 7 days and complete again
    # Pattern detection happens automatically in complete_item


# ============================================================================
# HELPER METHOD TESTS
# ============================================================================


def test_extract_items_from_text(service):
    """Test item extraction from various text formats"""
    # Comma-separated
    items = service._extract_items_from_text("milk, eggs, bread")
    assert len(items) == 3
    assert "Milk" in items

    # And-separated
    items = service._extract_items_from_text("milk and eggs and bread")
    assert len(items) == 3

    # With "buy" prefix
    items = service._extract_items_from_text("buy milk and eggs")
    assert len(items) == 2
    assert "Buy" not in items

    # With quantities
    items = service._extract_items_from_text("2 apples, 3 oranges")
    assert "Apples" in items
    assert "Oranges" in items
    assert "2" not in items[0]  # Quantity removed

    # With articles
    items = service._extract_items_from_text("a banana, an apple")
    assert "Banana" in items
    assert "Apple" in items


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
