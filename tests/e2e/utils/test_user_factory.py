"""
Test User Factory

Creates unique test users for E2E tests using UUID and timestamps
to ensure no conflicts between test runs.
"""

import os
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4


class TestUserFactory:
    """Factory for creating unique test users"""

    def __init__(self, prefix: str = "e2e"):
        """
        Initialize test user factory.

        Args:
            prefix: Prefix for test usernames (default: "e2e")
        """
        self.prefix = prefix
        self.created_users: list[dict[str, Any]] = []

    def create_unique_user(
        self,
        test_name: str | None = None,
        include_onboarding: bool = False,
    ) -> dict[str, Any]:
        """
        Create a unique test user with credentials.

        Args:
            test_name: Optional test name to include in username
            include_onboarding: Whether to include onboarding data

        Returns:
            Dictionary with user credentials and optional onboarding data
        """
        timestamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid4())[:8]

        # Build username
        username_parts = [self.prefix]
        if test_name:
            # Sanitize test name for username
            sanitized_name = test_name.lower().replace(" ", "_").replace("-", "_")
            username_parts.append(sanitized_name)
        username_parts.extend([timestamp, unique_id])
        username = "_".join(username_parts)

        # Create user data
        user_data = {
            "username": username,
            "email": f"{username}@e2etest.example.com",
            "password": self._generate_secure_password(unique_id),
            "full_name": f"E2E Test User {timestamp}",
            "bio": f"E2E test user created at {datetime.now(UTC).isoformat()}",
            "timezone": "America/New_York",
        }

        # Add metadata for tracking
        metadata = {
            "test_id": unique_id,
            "created_at": datetime.now(UTC).isoformat(),
            "test_name": test_name,
            "environment": os.getenv("TEST_ENV", "local"),
        }

        result = {
            "user_data": user_data,
            "metadata": metadata,
        }

        # Optionally add onboarding data
        if include_onboarding:
            result["onboarding_data"] = self._create_default_onboarding()

        # Track created user
        self.created_users.append(result)

        return result

    def _generate_secure_password(self, unique_id: str) -> str:
        """
        Generate a secure password for test user.

        Args:
            unique_id: Unique identifier to include in password

        Returns:
            Secure password string
        """
        return f"E2ETest_{unique_id}_Pass123!"

    def _create_default_onboarding(self) -> dict[str, Any]:
        """
        Create default onboarding data for test user.

        Returns:
            Onboarding data dictionary
        """
        return {
            "work_preference": "hybrid",
            "adhd_support_level": 7,
            "adhd_challenges": ["time_blindness", "focus", "organization"],
            "productivity_goals": ["reduce_overwhelm", "increase_focus", "better_planning"],
            "daily_schedule": {
                "time_preference": "morning",
                "flexible_enabled": True,
                "week_grid": {
                    "monday": "9-17",
                    "tuesday": "9-17",
                    "wednesday": "9-17",
                    "thursday": "9-17",
                    "friday": "9-13",
                },
            },
        }

    def get_created_users(self) -> list[dict[str, Any]]:
        """
        Get list of all created users in this factory session.

        Returns:
            List of user data dictionaries
        """
        return self.created_users

    def get_user_count(self) -> int:
        """
        Get count of created users.

        Returns:
            Number of users created
        """
        return len(self.created_users)

    def clear_users(self) -> None:
        """Clear the list of created users"""
        self.created_users = []
