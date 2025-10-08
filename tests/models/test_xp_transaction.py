"""
Tests for XP transaction models.

Test the XP transaction tracking and history functionality
for the gamification system.
"""

from datetime import datetime
from uuid import uuid4

import pytest

from proxy_agent_platform.models.xp_transaction import (
    XPTransaction,
    XPTransactionCategory,
    XPTransactionStatus,
    XPTransactionType,
)


class TestXPTransactionCategory:
    """Test XP transaction category enum."""

    def test_category_values(self):
        """Test that all expected categories exist."""
        expected_categories = [
            "TASK_COMPLETION",
            "FOCUS_SESSION",
            "STREAK_BONUS",
            "ACHIEVEMENT",
            "MILESTONE",
            "QUALITY_BONUS",
            "CONSISTENCY",
            "PENALTY",
        ]

        for category in expected_categories:
            assert hasattr(XPTransactionCategory, category)


class TestXPTransactionType:
    """Test XP transaction type enum."""

    def test_type_values(self):
        """Test that all expected types exist."""
        expected_types = ["EARNED", "BONUS", "PENALTY", "ADJUSTMENT"]

        for transaction_type in expected_types:
            assert hasattr(XPTransactionType, transaction_type)


class TestXPTransactionStatus:
    """Test XP transaction status enum."""

    def test_status_values(self):
        """Test that all expected statuses exist."""
        expected_statuses = ["PENDING", "CONFIRMED", "CANCELLED", "REVERSED"]

        for status in expected_statuses:
            assert hasattr(XPTransactionStatus, status)


class TestXPTransaction:
    """Test XP transaction model."""

    @pytest.fixture
    def sample_transaction(self):
        """Create a sample XP transaction for testing."""
        return XPTransaction(
            transaction_id=str(uuid4()),
            user_id=1,
            amount=150,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.TASK_COMPLETION,
            status=XPTransactionStatus.CONFIRMED,
            description="Completed high-priority task",
            metadata={
                "task_id": "task-123",
                "difficulty": "hard",
                "priority": "high",
                "completion_time": "2025-01-01T10:30:00",
            },
        )

    def test_transaction_creation(self, sample_transaction):
        """Test creating an XP transaction."""
        assert sample_transaction.user_id == 1
        assert sample_transaction.amount == 150
        assert sample_transaction.transaction_type == XPTransactionType.EARNED
        assert sample_transaction.category == XPTransactionCategory.TASK_COMPLETION
        assert sample_transaction.status == XPTransactionStatus.CONFIRMED
        assert "Completed high-priority task" in sample_transaction.description

    def test_transaction_with_defaults(self):
        """Test transaction with default values."""
        transaction = XPTransaction(
            user_id=1,
            amount=50,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.FOCUS_SESSION,
        )

        assert transaction.status == XPTransactionStatus.PENDING
        assert transaction.created_at is not None
        assert transaction.updated_at is not None
        assert transaction.metadata == {}

    def test_transaction_validation(self):
        """Test transaction validation rules."""
        # Valid transaction
        transaction = XPTransaction(
            user_id=1,
            amount=100,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.ACHIEVEMENT,
        )
        assert transaction.amount == 100

        # Test with negative amount (should be allowed for penalties)
        penalty_transaction = XPTransaction(
            user_id=1,
            amount=-50,
            transaction_type=XPTransactionType.PENALTY,
            category=XPTransactionCategory.PENALTY,
        )
        assert penalty_transaction.amount == -50

    def test_transaction_metadata(self, sample_transaction):
        """Test transaction metadata handling."""
        assert sample_transaction.metadata["task_id"] == "task-123"
        assert sample_transaction.metadata["difficulty"] == "hard"
        assert sample_transaction.metadata["priority"] == "high"

    def test_transaction_timestamps(self, sample_transaction):
        """Test transaction timestamp handling."""
        assert sample_transaction.created_at is not None
        assert sample_transaction.updated_at is not None
        assert isinstance(sample_transaction.created_at, datetime)
        assert isinstance(sample_transaction.updated_at, datetime)

    def test_transaction_string_representation(self, sample_transaction):
        """Test transaction string representation."""
        str_repr = str(sample_transaction)
        assert "XPTransaction" in str_repr
        assert str(sample_transaction.user_id) in str_repr
        assert str(sample_transaction.amount) in str_repr

    def test_is_positive_transaction(self):
        """Test identifying positive transactions."""
        positive_transaction = XPTransaction(
            user_id=1,
            amount=100,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.TASK_COMPLETION,
        )

        negative_transaction = XPTransaction(
            user_id=1,
            amount=-50,
            transaction_type=XPTransactionType.PENALTY,
            category=XPTransactionCategory.PENALTY,
        )

        assert positive_transaction.is_positive()
        assert not negative_transaction.is_positive()

    def test_transaction_status_transitions(self, sample_transaction):
        """Test valid transaction status transitions."""
        # Initial status
        assert sample_transaction.status == XPTransactionStatus.CONFIRMED

        # Can cancel confirmed transaction
        sample_transaction.status = XPTransactionStatus.CANCELLED
        assert sample_transaction.status == XPTransactionStatus.CANCELLED

    def test_get_net_amount(self):
        """Test calculating net amount for different transaction types."""
        earned_transaction = XPTransaction(
            user_id=1,
            amount=100,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.TASK_COMPLETION,
        )

        penalty_transaction = XPTransaction(
            user_id=1,
            amount=50,  # Stored as positive but represents penalty
            transaction_type=XPTransactionType.PENALTY,
            category=XPTransactionCategory.PENALTY,
        )

        assert earned_transaction.get_net_amount() == 100
        # Penalty should return negative amount
        assert penalty_transaction.get_net_amount() == -50

    def test_transaction_categories_mapping(self):
        """Test that transaction categories map correctly."""
        category_mappings = {
            XPTransactionCategory.TASK_COMPLETION: "Task completion",
            XPTransactionCategory.FOCUS_SESSION: "Focus session",
            XPTransactionCategory.STREAK_BONUS: "Streak bonus",
            XPTransactionCategory.ACHIEVEMENT: "Achievement unlock",
            XPTransactionCategory.MILESTONE: "Milestone reached",
        }

        for category, description in category_mappings.items():
            transaction = XPTransaction(
                user_id=1,
                amount=50,
                transaction_type=XPTransactionType.EARNED,
                category=category,
                description=description,
            )
            assert transaction.category == category
            assert description in transaction.description

    def test_bulk_transaction_creation(self):
        """Test creating multiple transactions efficiently."""
        transactions = []

        for i in range(10):
            transaction = XPTransaction(
                user_id=1,
                amount=50 + (i * 10),
                transaction_type=XPTransactionType.EARNED,
                category=XPTransactionCategory.TASK_COMPLETION,
                description=f"Task {i} completed",
                metadata={"task_index": i},
            )
            transactions.append(transaction)

        assert len(transactions) == 10
        assert all(t.user_id == 1 for t in transactions)
        assert transactions[0].amount == 50
        assert transactions[9].amount == 140

    def test_transaction_filtering(self):
        """Test filtering transactions by various criteria."""
        transactions = [
            XPTransaction(
                user_id=1,
                amount=100,
                transaction_type=XPTransactionType.EARNED,
                category=XPTransactionCategory.TASK_COMPLETION,
            ),
            XPTransaction(
                user_id=1,
                amount=50,
                transaction_type=XPTransactionType.BONUS,
                category=XPTransactionCategory.STREAK_BONUS,
            ),
            XPTransaction(
                user_id=2,
                amount=75,
                transaction_type=XPTransactionType.EARNED,
                category=XPTransactionCategory.FOCUS_SESSION,
            ),
        ]

        # Filter by user
        user1_transactions = [t for t in transactions if t.user_id == 1]
        assert len(user1_transactions) == 2

        # Filter by type
        earned_transactions = [
            t for t in transactions if t.transaction_type == XPTransactionType.EARNED
        ]
        assert len(earned_transactions) == 2

        # Filter by category
        task_transactions = [
            t for t in transactions if t.category == XPTransactionCategory.TASK_COMPLETION
        ]
        assert len(task_transactions) == 1


@pytest.mark.asyncio
class TestXPTransactionIntegration:
    """Integration tests for XP transaction system."""

    async def test_transaction_lifecycle(self):
        """Test complete transaction lifecycle."""
        # Create pending transaction
        transaction = XPTransaction(
            user_id=1,
            amount=200,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.ACHIEVEMENT,
            description="First achievement unlocked",
            metadata={"achievement_id": "first_task"},
        )

        assert transaction.status == XPTransactionStatus.PENDING

        # Confirm transaction
        transaction.status = XPTransactionStatus.CONFIRMED
        transaction.updated_at = datetime.now()

        assert transaction.status == XPTransactionStatus.CONFIRMED

        # Verify transaction is ready for processing
        assert transaction.amount > 0
        assert transaction.is_positive()
        assert transaction.get_net_amount() == 200

    async def test_transaction_audit_trail(self):
        """Test transaction audit trail functionality."""
        transaction = XPTransaction(
            user_id=1,
            amount=150,
            transaction_type=XPTransactionType.EARNED,
            category=XPTransactionCategory.TASK_COMPLETION,
            metadata={
                "source": "task_proxy",
                "task_id": "task-456",
                "processing_agent": "gamification_service",
                "timestamp": datetime.now().isoformat(),
            },
        )

        # Verify audit information is preserved
        assert transaction.metadata["source"] == "task_proxy"
        assert transaction.metadata["task_id"] == "task-456"
        assert "processing_agent" in transaction.metadata
        assert "timestamp" in transaction.metadata


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
